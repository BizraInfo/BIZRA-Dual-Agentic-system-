// src/arte/execution.rs - Action Commitment
//
// PEAK MASTERPIECE: ARTE Execution Stage
// Giants Citation: Action Theory, Bratman Intention
//
// Implements the Execution stage of ARTE:
// - Action commitment from synthesized tensions
// - Intent formation and verification
// - Execution trace generation

use crate::fixed::Fixed64;
use serde::{Deserialize, Serialize};
use tracing::{debug, instrument};

/// Configuration for execution commitment
#[derive(Debug, Clone)]
pub struct ExecutionConfig {
    /// Minimum confidence for commitment
    pub commitment_threshold: f64,
    /// Enable trace generation
    pub trace_enabled: bool,
    /// Maximum action length
    pub max_action_length: usize,
}

impl Default for ExecutionConfig {
    fn default() -> Self {
        Self {
            commitment_threshold: 0.7,
            trace_enabled: true,
            max_action_length: 1000,
        }
    }
}

/// An execution commitment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionCommitment {
    /// Commitment ID
    pub id: String,
    /// Action description
    pub action: String,
    /// Confidence in commitment (0.0-1.0)
    pub confidence: f64,
    /// Intent rationale
    pub rationale: String,
    /// Execution trace (if enabled)
    pub trace: Option<Vec<String>>,
    /// Ihsan compliance
    pub ihsan_compliant: bool,
    /// Timestamp
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Result of execution commitment
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionResult {
    /// Committed action
    pub commitment: String,
    /// Original input
    pub original_input: String,
    /// Ihsan score for this stage
    pub ihsan: Fixed64,
    /// SNR score for this stage
    pub snr: Fixed64,
}

/// Execution Committer - Implements action commitment
pub struct ExecutionCommitter {
    /// Configuration
    config: ExecutionConfig,
    /// Commitment counter
    commitment_counter: u64,
}

impl ExecutionCommitter {
    /// Create new execution committer
    pub fn new() -> Self {
        Self::with_config(ExecutionConfig::default())
    }

    /// Create with custom configuration
    pub fn with_config(config: ExecutionConfig) -> Self {
        Self {
            config,
            commitment_counter: 0,
        }
    }

    /// Commit an action based on synthesis
    #[instrument(skip(self, synthesis, original_input))]
    pub fn commit(
        &mut self,
        synthesis: &str,
        original_input: &str,
        confidence: f64,
    ) -> ExecutionCommitment {
        self.commitment_counter += 1;

        let id = format!(
            "exec_{:08x}_{:04x}",
            chrono::Utc::now().timestamp(),
            self.commitment_counter
        );

        // Build action from synthesis
        let action = self.build_action(synthesis, original_input);

        // Generate rationale
        let rationale = format!(
            "Action derived from synthesis: '{}' in response to: '{}'",
            synthesis.chars().take(50).collect::<String>(),
            original_input.chars().take(50).collect::<String>()
        );

        // Generate trace if enabled
        let trace = if self.config.trace_enabled {
            Some(vec![
                format!("Input received: {}", original_input.chars().take(30).collect::<String>()),
                format!("Synthesis applied: {}", synthesis.chars().take(30).collect::<String>()),
                format!("Confidence evaluated: {:.2}", confidence),
                format!("Action committed: {}", action.chars().take(30).collect::<String>()),
            ])
        } else {
            None
        };

        // Check Ihsan compliance
        let ihsan_compliant = confidence >= self.config.commitment_threshold
            && !action.is_empty()
            && action.len() <= self.config.max_action_length;

        debug!(
            commitment_id = %id,
            confidence = confidence,
            ihsan_compliant = ihsan_compliant,
            "Execution commitment created"
        );

        ExecutionCommitment {
            id,
            action,
            confidence,
            rationale,
            trace,
            ihsan_compliant,
            timestamp: chrono::Utc::now(),
        }
    }

    /// Build action from synthesis
    fn build_action(&self, synthesis: &str, original_input: &str) -> String {
        // Combine synthesis with original intent
        let action = if synthesis.is_empty() {
            format!("Process: {}", original_input)
        } else {
            format!("Execute: {} (based on {})", synthesis, original_input.chars().take(30).collect::<String>())
        };

        // Truncate if needed
        if action.len() > self.config.max_action_length {
            action.chars().take(self.config.max_action_length).collect()
        } else {
            action
        }
    }

    /// Verify a commitment meets quality standards
    pub fn verify_commitment(&self, commitment: &ExecutionCommitment) -> bool {
        commitment.confidence >= self.config.commitment_threshold
            && commitment.ihsan_compliant
            && !commitment.action.is_empty()
    }

    /// Get configuration
    pub fn config(&self) -> &ExecutionConfig {
        &self.config
    }

    /// Get commitment count
    pub fn commitment_count(&self) -> u64 {
        self.commitment_counter
    }
}

impl Default for ExecutionCommitter {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_execution_commitment() {
        let mut committer = ExecutionCommitter::new();

        let commitment = committer.commit(
            "Verified Ihsan compliance for AI action",
            "Check if output meets safety standards",
            0.85,
        );

        assert!(!commitment.action.is_empty());
        assert!(commitment.ihsan_compliant);
        assert!(commitment.trace.is_some());
    }

    #[test]
    fn test_low_confidence_rejection() {
        let mut committer = ExecutionCommitter::new();

        let commitment = committer.commit("Low quality synthesis", "Some input", 0.3);

        // Should not be Ihsan compliant due to low confidence
        assert!(!commitment.ihsan_compliant);
    }

    #[test]
    fn test_commitment_verification() {
        let mut committer = ExecutionCommitter::new();

        let good_commitment = committer.commit("Valid synthesis", "Valid input", 0.9);
        assert!(committer.verify_commitment(&good_commitment));

        let bad_commitment = committer.commit("Invalid", "Invalid", 0.1);
        assert!(!committer.verify_commitment(&bad_commitment));
    }
}
