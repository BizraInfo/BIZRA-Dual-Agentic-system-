use pyo3::prelude::*;
use serde_json::Value;

use bizra_synapse::{SynapticGraph, ThoughtNode, ThoughtType}; 

/// Python-facing wrapper that exposes ONLY safe, invariant-preserving ops.
#[pyclass]
struct PySynapticGraph {
    inner: SynapticGraph,
}

#[pymethods]
impl PySynapticGraph {
    #[new]
    fn new() -> Self {
        Self { inner: SynapticGraph::new("BIZRA-GENESIS-MISSION") }
    }

    /// Add a thought with explicit parents. Orphan thoughts are rejected.
    /// Returns the ThoughtId (as hex/string) on success.
    fn add_thought(&mut self, content: &str, parents: Vec<String>, role: Option<String>) -> PyResult<String> {
        // Map string input to Rust types
        let role_str = role.unwrap_or_else(|| "UNKNOWN".to_string());
        
        // TODO: Pass ThoughtType from python if needed. For now assuming ACTION.
        let thought = ThoughtNode::new(
            content, 
            parents, 
            &role_str, 
            ThoughtType::Action
        );

        let id = self.inner
            .add_thought(thought)
            .map_err(|e| pyo3::exceptions::PyValueError::new_err(format!("insert failed: {e}")))?;

        Ok(id)
    }

    /// Validate invariants explicitly (useful as a gate before submission to Node0).
    fn validate(&self) -> PyResult<bool> {
        self.inner
            .validate()
            .map(|_| true)
            .map_err(|e| pyo3::exceptions::PyAssertionError::new_err(format!("graph invalid: {e}")))
    }

    /// Export a deterministic snapshot (canonical JSON) for receipts / audits.
    fn snapshot_json(&self) -> PyResult<String> {
        let snap: Value = self.inner
            .snapshot_json()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("snapshot failed: {e}")))?;
        Ok(serde_json::to_string(&snap).unwrap())
    }

    /// Return a receipt-ready payload fragment (no secrets, deterministic).
    fn receipt_payload(&self) -> PyResult<String> {
        let payload: Value = self.inner
            .receipt_payload()
            .map_err(|e| pyo3::exceptions::PyRuntimeError::new_err(format!("payload failed: {e}")))?;
        Ok(serde_json::to_string(&payload).unwrap())
    }
}

#[pymodule]
fn synapse_py(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
    m.add_class::<PySynapticGraph>()?;
    Ok(())
}
