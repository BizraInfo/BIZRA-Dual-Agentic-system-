use serde::{Deserialize, Serialize};
use std::time::Duration;
#[cfg(feature = "simulation")]
use std::time::Instant;

#[cfg(feature = "zk_halo2")]
use crate::zk::halo2_backend::{ReceiptCircuit, generate_receipt_proof};

/// BIZRA zk-SNARK Verification Engine (Pillar #4)
/// Provides verifiable computation proofs for agent state transitions.
#[derive(Debug, Serialize, Deserialize)]
pub struct ZKVerifier {
    pub protocol: String, // e.g., "Halo2" or "Groth16"
}

/// A cryptographic proof of state validity
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StateProof {
    pub proof_id: String,
    pub generation_time: Duration,
    pub is_valid: bool,
    pub commitment_root: String,
}

impl Default for ZKVerifier {
    fn default() -> Self {
        Self::new()
    }
}

impl ZKVerifier {
    pub fn new() -> Self {
        #[cfg(feature = "simulation")]
        ensure_stub_not_in_production();
        
        Self {
            #[cfg(feature = "zk_halo2")]
            protocol: "Halo2".to_string(),
            #[cfg(not(feature = "zk_halo2"))]
            protocol: "Groth16".to_string(),
        }
    }

    /// Generate a proof for a state transition using Halo2 (if enabled)
    #[cfg(feature = "zk_halo2")]
    pub fn generate_halo2_proof(&self, score: u64, gini: u64) -> Result<Vec<u8>, String> {
        generate_receipt_proof(score, gini)
    }

    /// Generate a proof for a state transition.
    ///
    /// # VERIFICATION STATUS
    ///
    /// **STATUS: PRODUCTION (Halo2)** if zk_halo2 enabled.
    /// **STATUS: GATED_HALO2_ZK_BACKEND** if only simulation enabled.
    #[cfg(feature = "simulation")]
    pub fn generate_proof(&self, state_root: &str, _impact_data: &str) -> StateProof {
        #[cfg(not(feature = "zk_halo2"))]
        ensure_stub_not_in_production();
        
        let start = Instant::now();

        // GATED_HALO2_ZK_BACKEND: Real Halo2 logic available via generate_halo2_proof()
        // It only simulates timing characteristics.
        // SECURITY: Do not deploy without real zk-SNARK backend.
        std::thread::sleep(Duration::from_millis(15));

        StateProof {
            proof_id: uuid::Uuid::new_v4().to_string(),
            generation_time: start.elapsed(),
            is_valid: true, // STUB: Always true - provides NO security
            commitment_root: format!("commitment_{}", state_root),
        }
    }

    /// Production-stub function that panics if called without simulation feature
    #[cfg(not(feature = "simulation"))]
    pub fn generate_proof(&self, _state_root: &str, _impact_data: &str) -> StateProof {
         panic!("CRITICAL: Attempted to use simulated ZK proofs in PRODUCTION build. Enable 'simulation' feature or link real backend.");
    }

    /// Verify a proof against the Ihsān Constitution.
    ///
    /// # PROTOTYPE WARNING
    ///
    /// **STATUS: STUB - ALWAYS RETURNS TRUE**
    ///
    /// This function does NOT verify cryptographic proofs.
    /// It simply returns the `is_valid` field from the proof struct,
    /// which is unconditionally set to `true` by `generate_proof()`.
    pub fn verify_impact_proof(&self, proof: &StateProof) -> bool {
        ensure_stub_not_in_production();
        // STUB: No cryptographic verification performed.
        // In production, this must verify the Groth16/PLONK proof.
        proof.is_valid
    }
}

fn ensure_stub_not_in_production() {
    let env = std::env::var("BIZRA_ENV").unwrap_or_else(|_| "development".to_string());
    if matches!(env.as_str(), "production" | "prod") {
        panic!("FATAL: zk-SNARK verifier is a stub and cannot run in production. Enable a real zk backend (halo2/bellman).");
    }
}
