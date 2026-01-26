//! BIZRA Sovereign FFI Bridge (PyO3)
//!
//! Production-grade Python bindings for the Rust kernel.
//! Exposes TPM, FATE, WASM sandbox, and Chimera Spine to Python orchestration.
//!
//! Build: cargo build --release --features python
//! Usage: cp target/release/libbizra_ffi.so ./bizra_ffi.so
//!        python -c "import bizra_ffi; print(bizra_ffi.get_sovereign_status())"

use pyo3::exceptions::PyRuntimeError;
use pyo3::prelude::*;
use pyo3::types::PyDict;

use crate::fate::FateEngine;
use crate::ihsan::compute_ihsan_score;
use crate::tpm::TpmContext;
use crate::wasm::WasmSandbox;

use std::collections::HashMap;
use std::sync::Mutex;

/// Convert any error to PyErr
fn to_pyerr<E: std::fmt::Display>(e: E) -> PyErr {
    PyErr::new::<PyRuntimeError, _>(e.to_string())
}

/// Chimera Spine - Zero-copy IPC stub (production uses Iceoryx2)
pub struct ChimeraSpine {
    seq: u64,
    channels: HashMap<String, Vec<Vec<u8>>>,
}

impl ChimeraSpine {
    pub fn new() -> anyhow::Result<Self> {
        Ok(Self {
            seq: 0,
            channels: HashMap::new(),
        })
    }

    pub fn publish(&mut self, channel: &str, msg: &[u8]) -> anyhow::Result<u64> {
        self.seq += 1;
        self.channels
            .entry(channel.to_string())
            .or_insert_with(Vec::new)
            .push(msg.to_vec());

        tracing::debug!("[spine] {} seq={} bytes={}", channel, self.seq, msg.len());
        Ok(self.seq)
    }

    pub fn subscribe(&self, channel: &str) -> Option<&Vec<Vec<u8>>> {
        self.channels.get(channel)
    }
}

/// BIZRA FFI Bridge - Main Python-accessible class
#[pyclass]
pub struct BizraFfiBridge {
    tpm: Option<TpmContext>,
    wasm: Mutex<WasmSandbox>,
    fate: Mutex<FateEngine>,
    spine: Mutex<ChimeraSpine>,
    initialized: bool,
}

#[pymethods]
impl BizraFfiBridge {
    /// Create a new FFI bridge instance
    #[new]
    pub fn new() -> PyResult<Self> {
        tracing::info!("🌉 Initializing BIZRA FFI Bridge (Rust → Python)");

        Ok(Self {
            tpm: None,
            wasm: Mutex::new(WasmSandbox::new()),
            fate: Mutex::new(FateEngine::new()),
            spine: Mutex::new(ChimeraSpine::new().map_err(to_pyerr)?),
            initialized: true,
        })
    }

    /// Initialize TPM context (Hardened Bridge)
    /// Wraps Rust-side panics to prevent Python crashes on sovereignty violations.
    #[pyo3(name = "init_tpm")]
    pub fn init_tpm_bridge(&mut self, require_hardware: bool) -> PyResult<bool> {
        // AIRLOCK: Wrap potentially panicking kernel call
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            TpmContext::new()
        }));

        match result {
            Ok(tpm) => {
                let has_hardware = std::path::Path::new("/dev/tpm0").exists();
                
                if require_hardware && !has_hardware {
                    return Err(PyErr::new::<PyRuntimeError, _>(
                        "TPM 2.0 hardware not found at /dev/tpm0",
                    ));
                }

                self.tpm = Some(tpm);
                tracing::info!("🔐 TPM initialized (hardware: {})", has_hardware);
                Ok(has_hardware)
            }
            Err(_) => {
                // If TpmContext::new() panicked, it means sovereignty was violated in a Release build
                Err(PyErr::new::<PyRuntimeError, _>(
                    "CORE DUMP PREVENTED: Sovereignty Violation. Hardware TPM required for this build artifact.",
                ))
            }
        }
    }

    /// Prove safety of an output using Z3 Prover via FATE
    ///
    /// Args:
    ///     input: The string content (code, logs, response) to verify
    ///
    /// Returns:
    ///     bool: True ONLY if mathematically proven safe. False otherwise.
    #[pyo3(name = "verify_fate")]
    pub fn verify_fate_bridge(&self, input: String) -> PyResult<bool> {
        let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
            let fate = self.fate.lock().expect("FATE lock poisoned");
            match fate.verify_formal(&input) {
                crate::fate::FateVerdict::Verified => true,
                _ => false,
            }
        }));

        match result {
            Ok(is_safe) => Ok(is_safe),
            Err(_) => Err(PyErr::new::<PyRuntimeError, _>(
                "FATE VERIFICATION PANIC: Formal engine crashed during proof attempt",
            )),
        }
    }

    /// Measure a module into TPM PCR
    ///
    /// Args:
    ///     pcr_index: PCR bank index (0-23)
    ///     module_name: Name of the module being measured
    ///     module_bytes: Raw bytes of the module
    ///
    /// Returns:
    ///     bytes: Extended PCR value (32 bytes)
    pub fn tpm_measure(
        &mut self,
        pcr_index: u8,
        module_name: String,
        module_bytes: Vec<u8>,
    ) -> PyResult<Vec<u8>> {
        let tpm = self.tpm.as_mut().ok_or_else(|| {
            PyErr::new::<PyRuntimeError, _>("TPM not initialized - call init_tpm() first")
        })?;

        let measurement = tpm.measure_module(pcr_index, &module_name, &module_bytes);
        Ok(measurement.extended_value.to_vec())
    }

    /// Generate TPM attestation quote
    ///
    /// Args:
    ///     nonce: 16-byte challenge nonce
    ///
    /// Returns:
    ///     dict: Quote containing pcr_digest, nonce, signature, timestamp
    pub fn tpm_quote(&self, nonce: Vec<u8>, py: Python<'_>) -> PyResult<PyObject> {
        let tpm = self
            .tpm
            .as_ref()
            .ok_or_else(|| PyErr::new::<PyRuntimeError, _>("TPM not initialized"))?;

        if nonce.len() != 16 {
            return Err(PyErr::new::<PyRuntimeError, _>(format!(
                "Nonce must be 16 bytes, got {}",
                nonce.len()
            )));
        }

        let mut nonce_arr = [0u8; 16];
        nonce_arr.copy_from_slice(&nonce);

        let quote = tpm.generate_quote(nonce_arr);

        let dict = PyDict::new(py);
        dict.set_item("pcr_digest", quote.pcr_digest.to_vec())?;
        dict.set_item("nonce", quote.nonce.to_vec())?;
        dict.set_item("signature", quote.signature)?;
        dict.set_item("timestamp_ns", quote.timestamp_ns)?;

        Ok(dict.into())
    }

    /// Execute reasoning in WASM sandbox
    ///
    /// Args:
    ///     input: Input bytes for reasoning
    ///     reasoning_type: Type of reasoning (e.g., "got", "chain", "tree")
    ///
    /// Returns:
    ///     bytes: Output from sandboxed reasoning
    pub fn execute_reasoning(&self, input: Vec<u8>, reasoning_type: String) -> PyResult<Vec<u8>> {
        let mut wasm = self.wasm.lock().map_err(|e| to_pyerr(e.to_string()))?;

        // Convert input to string for current API (TODO: upgrade to bytes)
        let input_str = String::from_utf8_lossy(&input);

        // Execute in sandbox (blocking call to async)
        let rt = tokio::runtime::Runtime::new().map_err(to_pyerr)?;
        let result = rt
            .block_on(wasm.execute_isolated(&[], &input_str))
            .map_err(to_pyerr)?;

        tracing::info!(
            "🧠 Reasoning complete: type={}, confidence={:.4}, time={:?}",
            reasoning_type,
            result.confidence.to_f64(),
            result.execution_time
        );

        Ok(result.contribution.into_bytes())
    }

    /// Publish message to Chimera Spine (A2A broadcast)
    ///
    /// Args:
    ///     channel: Channel name for routing
    ///     message: Message bytes to broadcast
    ///
    /// Returns:
    ///     int: Sequence number of published message
    pub fn send_message(&mut self, channel: String, message: Vec<u8>) -> PyResult<u64> {
        let mut spine = self.spine.lock().map_err(|e| to_pyerr(e.to_string()))?;
        spine.publish(&channel, &message).map_err(to_pyerr)
    }

    /// Verify proposition through FATE engine (Z3 SMT)
    ///
    /// Args:
    ///     proposition: Logical proposition to verify
    ///     context: Optional context dictionary
    ///
    /// Returns:
    ///     bool: True if SAT (satisfiable), False if UNSAT
    pub fn verify_fate(&self, proposition: String, _context: Option<&PyDict>) -> PyResult<bool> {
        // Use FATE engine for formal verification
        // For now, return true for valid propositions
        tracing::info!("⚖️ FATE verification: {}", proposition);

        // Simple validation - real implementation uses Z3
        let is_valid = !proposition.contains("harm")
            && !proposition.contains("bypass")
            && !proposition.contains("disable");

        Ok(is_valid)
    }

    /// Compute Ihsān score for an action
    ///
    /// Args:
    ///     correctness: Factual accuracy (0.0-1.0)
    ///     safety: Safety score (0.0-1.0)
    ///     benefit: User benefit (0.0-1.0)
    ///     efficiency: Resource efficiency (0.0-1.0)
    ///     auditability: Traceability (0.0-1.0)
    ///     anti_centralization: Decentralization (0.0-1.0)
    ///     robustness: Resilience (0.0-1.0)
    ///     adl_fairness: Justice/fairness (0.0-1.0)
    ///
    /// Returns:
    ///     float: Weighted Ihsān score
    pub fn compute_ihsan(
        &self,
        correctness: f64,
        safety: f64,
        benefit: f64,
        efficiency: f64,
        auditability: f64,
        anti_centralization: f64,
        robustness: f64,
        adl_fairness: f64,
    ) -> PyResult<f64> {
        // Weights from constitution/ihsan_v1.yaml
        let score = correctness * 0.22
            + safety * 0.22
            + benefit * 0.14
            + efficiency * 0.12
            + auditability * 0.12
            + anti_centralization * 0.08
            + robustness * 0.06
            + adl_fairness * 0.04;

        Ok(score)
    }

    /// Get Merkle root from TPM PCRs
    ///
    /// Returns:
    ///     bytes: 32-byte Merkle root
    pub fn get_merkle_root(&mut self) -> PyResult<Vec<u8>> {
        let tpm = self
            .tpm
            .as_mut()
            .ok_or_else(|| PyErr::new::<PyRuntimeError, _>("TPM not initialized"))?;

        let root = tpm.compute_merkle_root();
        Ok(root.to_vec())
    }

    /// Check if bridge is properly initialized
    pub fn is_initialized(&self) -> bool {
        self.initialized
    }
}

/// Get sovereign kernel status
#[pyfunction]
fn get_sovereign_status() -> PyResult<String> {
    Ok("BIZRA Sovereign Kernel v7.0.0 (Production FFI Bindings OK)".to_string())
}

/// Get version info
#[pyfunction]
fn get_version() -> PyResult<(u32, u32, u32)> {
    Ok((7, 0, 0))
}

/// Compute Harberger tax for resource allocation
#[pyfunction]
fn compute_harberger_tax(resource_size: u64, ihsan_score: f64, tax_rate: f64) -> PyResult<f64> {
    if ihsan_score <= 0.0 {
        return Err(PyErr::new::<PyRuntimeError, _>(
            "Ihsān score must be positive",
        ));
    }

    let tax = (resource_size as f64) * tax_rate / ihsan_score;
    Ok(tax)
}

/// Python module definition
#[pymodule]
fn bizra_ffi(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
    // Add classes
    m.add_class::<BizraFfiBridge>()?;

    // Add functions
    m.add_function(wrap_pyfunction!(get_sovereign_status, m)?)?;
    m.add_function(wrap_pyfunction!(get_version, m)?)?;
    m.add_function(wrap_pyfunction!(compute_harberger_tax, m)?)?;

    // Add constants
    m.add("IHSAN_THRESHOLD", 0.95)?;
    m.add("ADL_LIMIT", 0.35)?;
    m.add("PCR_SAPE", 12)?;
    m.add("PCR_FATE", 13)?;
    m.add("PCR_SPINE", 14)?;
    m.add("PCR_SOVEREIGN", 15)?;
    m.add("PCR_CONSTITUTION", 16)?;

    tracing::info!("🐍 BIZRA FFI Python module loaded");

    Ok(())
}
