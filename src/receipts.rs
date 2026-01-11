// src/receipts.rs - Rejection and Execution Receipts
// Machine-verifiable evidence of SAT decisions and FATE escalations
//
// PERSISTENCE: Uses Redis (Synapse) for durable receipt storage + filesystem

use crate::fate::{Escalation, EscalationLevel};
use crate::sat::RejectionCode;
use crate::synapse::SynapseClient;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::path::Path;
use tracing::{info, warn};

/// Receipt types for different outcomes
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ReceiptType {
    /// Request was approved and executed
    Execution,
    /// Request was rejected by SAT
    Rejection,
    /// Request was quarantined for review
    Quarantine,
    /// Ihsān threshold failure
    IhsanFailure,
    /// SAPE probe execution receipt
    SapeProbe,
}

/// Rejection receipt - evidence of SAT blocking a request
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RejectionReceipt {
    /// Schema version
    pub schema: String,
    /// Receipt type
    pub receipt_type: ReceiptType,
    /// Unique receipt ID
    pub receipt_id: String,
    /// Optional request ID for traceability
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
    /// Timestamp of rejection
    pub timestamp: DateTime<Utc>,
    /// Task that was rejected (truncated for privacy)
    pub task_summary: String,
    /// Rejection codes from SAT
    pub rejection_codes: Vec<String>,
    /// Primary rejection reason
    pub primary_reason: String,
    /// Escalation level assigned by FATE
    pub escalation_level: String,
    /// FATE escalation ID (if escalated)
    pub escalation_id: Option<String>,
    /// Validators that rejected
    pub rejecting_validators: Vec<String>,
    /// Validators that approved (for audit)
    pub approving_validators: Vec<String>,
    /// Recommended action
    pub recommended_action: String,
    /// SHA-256 hash of receipt content
    pub integrity_hash: String,
}

/// Execution receipt - evidence of successful SAT approval + execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionReceipt {
    /// Schema version
    pub schema: String,
    /// Receipt type
    pub receipt_type: ReceiptType,
    /// Hardware anchor (Hash of SecureBoot/TPM/CPU state)
    pub hardware_anchor: String,
    /// Unique receipt ID
    pub receipt_id: String,
    /// Optional request ID for traceability
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
    /// Timestamp of execution
    pub timestamp: DateTime<Utc>,
    /// Task that was executed (truncated for privacy)
    pub task_summary: String,
    /// SAT validation time
    pub sat_validation_ms: u128,
    /// PAT execution time
    pub pat_execution_ms: u128,
    /// Total latency
    pub total_latency_ms: u128,
    /// Synergy score achieved
    pub synergy_score: f64,
    /// Ihsān score achieved
    pub ihsan_score: f64,
    /// Ihsān threshold applied
    pub ihsan_threshold: f64,
    /// Number of PAT agents that contributed
    pub pat_agents_count: usize,
    /// Number of SAT validators that approved
    pub sat_approvers_count: usize,
    /// Harberger Tax paid (Adl Tax Collector)
    pub harberger_tax: f64,
    /// TPM Quote (attestation)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tpm_quote: Option<Vec<u8>>,
    /// Merkle proof of SAPE cache inclusion
    #[serde(skip_serializing_if = "Option::is_none")]
    pub merkle_proof: Option<Vec<u8>>,
    /// SHA-256 hash of receipt content
    pub integrity_hash: String,
}

/// SAPE probe receipt - evidence of probe execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SapeProbeReceipt {
    /// Schema version
    pub schema: String,
    /// Receipt type
    pub receipt_type: ReceiptType,
    /// Unique receipt ID
    pub receipt_id: String,
    /// Optional request ID for traceability
    #[serde(skip_serializing_if = "Option::is_none")]
    pub request_id: Option<String>,
    /// Timestamp of probe execution
    pub timestamp: DateTime<Utc>,
    /// Hash of the probed content
    pub content_hash: String,
    /// Ihsān score for the probe results
    pub ihsan_score: f64,
    /// Number of probes executed
    pub probe_count: usize,
    /// Flags emitted by probes
    pub flags: Vec<String>,
    /// SHA-256 hash of receipt content
    pub integrity_hash: String,
}

/// Receipt emitter - creates and persists receipts
pub struct ReceiptEmitter {
    /// Directory to store receipts
    output_dir: String,
    /// Counter for receipt IDs
    counter: std::sync::atomic::AtomicU64,
    /// Redis client for persistence (optional)
    synapse: Option<SynapseClient>,
}

pub struct ExecutionData<'a> {
    pub task: &'a str,
    pub hardware_anchor: String,
    pub sat_validation_ms: u128,
    pub pat_execution_ms: u128,
    pub total_latency_ms: u128,
    pub synergy_score: f64,
    pub ihsan_score: f64,
    pub ihsan_threshold: f64,
    pub pat_agents_count: usize,
    pub sat_approvers_count: usize,
    pub memory_usage_percent: f64,
    pub request_id: Option<String>,
}

impl ReceiptEmitter {
    pub fn new(output_dir: &str) -> Self {
        // Ensure output directory exists
        if let Err(e) = fs::create_dir_all(output_dir) {
            warn!(error = %e, dir = output_dir, "Failed to create receipts directory");
        }

        info!(output_dir = output_dir, "📋 Receipt emitter initialized");

        Self {
            output_dir: output_dir.to_string(),
            counter: std::sync::atomic::AtomicU64::new(1),
            synapse: None,
        }
    }

    /// Create with Redis persistence
    pub fn with_synapse(output_dir: &str, synapse: SynapseClient) -> Self {
        if let Err(e) = fs::create_dir_all(output_dir) {
            warn!(error = %e, dir = output_dir, "Failed to create receipts directory");
        }

        info!(
            output_dir = output_dir,
            "📋 Receipt emitter initialized with Redis persistence"
        );

        Self {
            output_dir: output_dir.to_string(),
            counter: std::sync::atomic::AtomicU64::new(1),
            synapse: Some(synapse),
        }
    }

    /// Create from environment (auto-detect Redis)
    pub async fn from_env(output_dir: &str) -> Self {
        match crate::synapse::SynapseClient::from_env().await {
            Ok(synapse) if synapse.is_available() => {
                info!("📋 ReceiptEmitter connected to Redis for durable persistence");
                Self::with_synapse(output_dir, synapse)
            }
            _ => {
                warn!("📋 ReceiptEmitter running without Redis (filesystem only)");
                Self::new(output_dir)
            }
        }
    }

    /// Emit a rejection receipt
    pub fn emit_rejection(
        &self,
        task: &str,
        rejection_codes: &[RejectionCode],
        escalation: &Escalation,
        rejecting_validators: Vec<String>,
        approving_validators: Vec<String>,
        request_id: Option<String>,
    ) -> RejectionReceipt {
        let receipt_id = format!(
            "REJ-{}-{:06}",
            Utc::now().format("%Y%m%d%H%M%S"),
            self.counter
                .fetch_add(1, std::sync::atomic::Ordering::SeqCst)
        );

        let task_summary = if task.len() > 100 {
            format!("{}...", &task[..100])
        } else {
            task.to_string()
        };

        let rejection_code_strings: Vec<String> =
            rejection_codes.iter().map(|c| c.to_string()).collect();

        let primary_reason = rejection_codes
            .first()
            .map(|c| c.to_string())
            .unwrap_or_else(|| "Unknown rejection".to_string());

        let escalation_level = match escalation.level {
            EscalationLevel::Low => "LOW",
            EscalationLevel::Medium => "MEDIUM",
            EscalationLevel::High => "HIGH",
            EscalationLevel::Critical => "CRITICAL",
        }
        .to_string();

        let receipt_type = if rejection_codes
            .iter()
            .any(|c| matches!(c, RejectionCode::Quarantine(_)))
        {
            ReceiptType::Quarantine
        } else {
            ReceiptType::Rejection
        };

        // Create receipt without hash first
        let mut receipt = RejectionReceipt {
            schema: "bizra-rejection-receipt-v1".to_string(),
            receipt_type,
            receipt_id: receipt_id.clone(),
            request_id,
            timestamp: Utc::now(),
            task_summary,
            rejection_codes: rejection_code_strings,
            primary_reason,
            escalation_level,
            escalation_id: Some(escalation.id.clone()),
            rejecting_validators,
            approving_validators,
            recommended_action: escalation.recommended_action.clone(),
            integrity_hash: String::new(),
        };

        // Calculate integrity hash
        receipt.integrity_hash = self.calculate_hash(&receipt);

        // Persist receipt
        self.persist_receipt(&receipt_id, &receipt);

        info!(
            receipt_id = %receipt_id,
            escalation_id = %escalation.id,
            "🧾 Rejection receipt emitted"
        );

        receipt
    }

    /// Emit an execution receipt (successful flow)
    pub fn emit_execution(&self, data: ExecutionData) -> ExecutionReceipt {
        let receipt_id = format!(
            "EXEC-{}-{:06}",
            Utc::now().format("%Y%m%d%H%M%S"),
            self.counter
                .fetch_add(1, std::sync::atomic::Ordering::SeqCst)
        );

        let task_summary = if data.task.len() > 100 {
            format!("{}...", &data.task[..100])
        } else {
            data.task.to_string()
        };

        let mut receipt = ExecutionReceipt {
            schema: "bizra-execution-receipt-v1".to_string(),
            receipt_type: ReceiptType::Execution,
            hardware_anchor: data.hardware_anchor,
            receipt_id: receipt_id.clone(),
            request_id: data.request_id,
            timestamp: Utc::now(),
            task_summary,
            sat_validation_ms: data.sat_validation_ms,
            pat_execution_ms: data.pat_execution_ms,
            total_latency_ms: data.total_latency_ms,
            synergy_score: data.synergy_score,
            ihsan_score: data.ihsan_score,
            ihsan_threshold: data.ihsan_threshold,
            pat_agents_count: data.pat_agents_count,
            sat_approvers_count: data.sat_approvers_count,
            harberger_tax: Self::compute_harberger_tax(
                data.total_latency_ms as usize,
                data.ihsan_score,
                data.memory_usage_percent,
            ),
            tpm_quote: None,
            merkle_proof: None,
            integrity_hash: String::new(),
        };

        // Calculate integrity hash
        receipt.integrity_hash = self.calculate_execution_hash(&receipt);

        // Persist receipt
        self.persist_execution_receipt(&receipt_id, &receipt);

        info!(
            receipt_id = %receipt_id,
            synergy = data.synergy_score,
            ihsan = data.ihsan_score,
            "🧾 Execution receipt emitted"
        );

        receipt
    }

    /// Emit a SAPE probe receipt
    pub fn emit_sape_probe(
        &self,
        content: &str,
        ihsan_score: f64,
        probe_count: usize,
        flags: Vec<String>,
        request_id: Option<String>,
    ) -> SapeProbeReceipt {
        let receipt_id = format!(
            "SAPE-{}-{:06}",
            Utc::now().format("%Y%m%d%H%M%S"),
            self.counter
                .fetch_add(1, std::sync::atomic::Ordering::SeqCst)
        );

        let content_hash = {
            let hash = Sha256::digest(content.as_bytes());
            format!("{:x}", hash)
        };

        let mut receipt = SapeProbeReceipt {
            schema: "bizra-sape-probe-receipt-v1".to_string(),
            receipt_type: ReceiptType::SapeProbe,
            receipt_id: receipt_id.clone(),
            request_id,
            timestamp: Utc::now(),
            content_hash,
            ihsan_score,
            probe_count,
            flags,
            integrity_hash: String::new(),
        };

        receipt.integrity_hash = self.calculate_sape_hash(&receipt);
        self.persist_sape_receipt(&receipt_id, &receipt);

        receipt
    }

    fn calculate_hash(&self, receipt: &RejectionReceipt) -> String {
        let content = format!(
            "{}|{}|{}|{}|{}",
            receipt.receipt_id,
            receipt.timestamp.to_rfc3339(),
            receipt.task_summary,
            receipt.rejection_codes.join(","),
            receipt.escalation_id.as_deref().unwrap_or("none")
        );
        let hash = Sha256::digest(content.as_bytes());
        format!("sha256:{:x}", hash)
    }

    fn calculate_execution_hash(&self, receipt: &ExecutionReceipt) -> String {
        let content = format!(
            "{}|{}|{}|{:.4}|{:.4}",
            receipt.receipt_id,
            receipt.timestamp.to_rfc3339(),
            receipt.task_summary,
            receipt.synergy_score,
            receipt.ihsan_score
        );
        let hash = Sha256::digest(content.as_bytes());
        format!("sha256:{:x}", hash)
    }

    fn calculate_sape_hash(&self, receipt: &SapeProbeReceipt) -> String {
        let content = format!(
            "{}|{}|{}|{:.4}|{}",
            receipt.receipt_id,
            receipt.timestamp.to_rfc3339(),
            receipt.content_hash,
            receipt.ihsan_score,
            receipt.probe_count
        );
        let hash = Sha256::digest(content.as_bytes());
        format!("sha256:{:x}", hash)
    }

    fn persist_receipt(&self, receipt_id: &str, receipt: &RejectionReceipt) {
        let filename = format!("{}.json", receipt_id);
        let path = Path::new(&self.output_dir).join(&filename);

        match serde_json::to_string_pretty(receipt) {
            Ok(json) => {
                // Persist to filesystem (Redis persistence via async method)
                if let Err(e) = fs::write(&path, json) {
                    warn!(error = %e, path = ?path, "Failed to persist rejection receipt");
                }
            }
            Err(e) => {
                warn!(error = %e, "Failed to serialize rejection receipt");
            }
        }
    }

    fn persist_execution_receipt(&self, receipt_id: &str, receipt: &ExecutionReceipt) {
        let filename = format!("{}.json", receipt_id);
        let path = Path::new(&self.output_dir).join(&filename);

        match serde_json::to_string_pretty(receipt) {
            Ok(json) => {
                // Persist to filesystem (Redis persistence via async method)
                if let Err(e) = fs::write(&path, json) {
                    warn!(error = %e, path = ?path, "Failed to persist execution receipt");
                }
            }
            Err(e) => {
                warn!(error = %e, "Failed to serialize execution receipt");
            }
        }
    }

    fn persist_sape_receipt(&self, receipt_id: &str, receipt: &SapeProbeReceipt) {
        let filename = format!("{}.json", receipt_id);
        let path = Path::new(&self.output_dir).join(&filename);

        match serde_json::to_string_pretty(receipt) {
            Ok(json) => {
                if let Err(e) = fs::write(&path, json) {
                    warn!(error = %e, path = ?path, "Failed to persist SAPE probe receipt");
                }
            }
            Err(e) => {
                warn!(error = %e, "Failed to serialize SAPE probe receipt");
            }
        }
    }

    /// Persist receipt to Redis asynchronously
    pub async fn persist_to_synapse(
        &self,
        receipt_id: &str,
        json: &str,
    ) -> Result<(), anyhow::Error> {
        if let Some(ref synapse) = self.synapse {
            synapse.store_receipt(receipt_id, json).await?;
        }
        Ok(())
    }

    /// Retrieve a receipt from Redis by ID (async)
    pub async fn get_receipt_async(&self, receipt_id: &str) -> Option<String> {
        if let Some(ref synapse) = self.synapse {
            if let Ok(Some(json)) = synapse.get_receipt(receipt_id).await {
                return Some(json);
            }
        }

        // Fallback to filesystem
        let filename = format!("{}.json", receipt_id);
        let path = Path::new(&self.output_dir).join(&filename);
        fs::read_to_string(&path).ok()
    }

    /// Get recent receipts from Redis (async)
    pub async fn recent_receipts_async(&self, limit: usize) -> Vec<String> {
        if let Some(ref synapse) = self.synapse {
            if let Ok(receipts) = synapse.recent_receipts(limit as isize).await {
                return receipts;
            }
        }
        Vec::new()
    }

    /// Sync version: Retrieve a receipt from filesystem only
    pub fn get_receipt(&self, receipt_id: &str) -> Option<String> {
        let filename = format!("{}.json", receipt_id);
        let path = Path::new(&self.output_dir).join(&filename);
        fs::read_to_string(&path).ok()
    }

    /// Sync version: returns empty (use async for Redis)
    pub fn recent_receipts(&self, _limit: usize) -> Vec<String> {
        Vec::new()
    }

    pub fn compute_harberger_tax(
        latency_ms: usize,
        ihsan_score: f64,
        memory_usage_percent: f64,
    ) -> f64 {
        // Elite Implementation: Progressive Harberger Tax
        // 1. Base rate
        let base_rate = (latency_ms as f64 / 1000.0) * 0.05;

        // 2. Progressive scaling: 10x discount for low memory usage (<50%)
        let usage_factor = if memory_usage_percent < 0.5 { 0.1 } else { 1.0 };

        // 3. Ihsān bonus: >0.98 satisfies constitutional perfection, 0% tax (efficiency reward)
        let ihsan_factor = if ihsan_score > 0.98 {
            0.0
        } else {
            (1.0 - ihsan_score).max(0.0)
        };

        (base_rate * usage_factor * ihsan_factor).max(0.0001)
    }
}

impl Default for ReceiptEmitter {
    fn default() -> Self {
        Self::new("docs/evidence/receipts")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::fate::FATECoordinator;
    use std::collections::HashMap;

    #[test]
    fn test_rejection_receipt_creation() {
        let emitter = ReceiptEmitter::new("target/test_receipts");
        let mut fate = FATECoordinator::new();

        let codes = vec![RejectionCode::SecurityThreat("SQL injection".to_string())];
        let escalation = fate.escalate_rejection(&codes, "DROP TABLE users", &HashMap::new());

        let receipt = emitter.emit_rejection(
            "DROP TABLE users",
            &codes,
            &escalation,
            vec!["security_guardian".to_string()],
            vec![],
            Some("REQ-TEST-001".to_string()),
        );

        assert_eq!(receipt.receipt_type, ReceiptType::Rejection);
        assert!(receipt.receipt_id.starts_with("REJ-"));
        assert!(receipt.integrity_hash.starts_with("sha256:"));
        assert!(receipt.rejection_codes[0].contains("SECURITY_THREAT"));
    }

    #[test]
    fn test_quarantine_receipt_type() {
        let emitter = ReceiptEmitter::new("target/test_receipts");
        let mut fate = FATECoordinator::new();

        let codes = vec![RejectionCode::Quarantine("uncertain intent".to_string())];
        let escalation = fate.escalate_rejection(&codes, "ambiguous task", &HashMap::new());

        let receipt = emitter.emit_rejection(
            "ambiguous task",
            &codes,
            &escalation,
            vec!["ethics_validator".to_string()],
            vec!["security_guardian".to_string()],
            Some("REQ-TEST-002".to_string()),
        );

        assert_eq!(receipt.receipt_type, ReceiptType::Quarantine);
    }

    #[test]
    fn test_execution_receipt_creation() {
        let emitter = ReceiptEmitter::new("target/test_receipts");

        let receipt = emitter.emit_execution(ExecutionData {
            task: "Generate unit tests for user module",
            hardware_anchor: "TEST-HW-ANCHOR".to_string(),
            sat_validation_ms: 15,
            pat_execution_ms: 250,
            total_latency_ms: 275,
            synergy_score: 0.87,
            ihsan_score: 0.92,
            ihsan_threshold: 0.90,
            pat_agents_count: 7,
            sat_approvers_count: 5,
            memory_usage_percent: 0.45,
            request_id: Some("REQ-TEST-003".to_string()),
        });

        assert_eq!(receipt.receipt_type, ReceiptType::Execution);
        assert!(receipt.receipt_id.starts_with("EXEC-"));
        assert!(receipt.integrity_hash.starts_with("sha256:"));
        assert!(receipt.ihsan_score >= receipt.ihsan_threshold);
    }
}
