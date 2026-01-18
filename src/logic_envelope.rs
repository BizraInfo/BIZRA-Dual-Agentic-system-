// src/logic_envelope.rs - Logic Envelope Validation System
//
// Priority 1: Tiered validation between LLM output and execution
// Giants Protocol: Frege (predicate logic), Tarski (truth), Church (lambda calculus)
//
// Architecture:
//   LLM Output → [CHEAP <10ms] → [MEDIUM <150ms] → [EXPENSIVE unbounded] → Execute
//
// COVENANT Article II: SNR enforcement through logical validation

use crate::fixed::Fixed64;
use serde::{Deserialize, Serialize};
use std::time::{Duration, Instant};
use thiserror::Error;

// ============================================================================
// VALIDATION TIERS
// ============================================================================

/// Validation tier with progressive complexity and time budgets
/// Giants: Dijkstra (progressive verification), Hoare (preconditions)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ValidationTier {
    /// Tier 1: Cheap validation (<10ms budget)
    /// - JSON schema validation
    /// - Blocklist checking
    /// - Grammar/syntax validation
    Cheap,

    /// Tier 2: Medium validation (<150ms budget)
    /// - Semantic coherence
    /// - Reference validation
    /// - Cross-field consistency
    Medium,

    /// Tier 3: Expensive validation (unbounded)
    /// - Full Z3/FATE verification
    /// - Formal proof generation
    /// - Deep semantic analysis
    Expensive,
}

impl ValidationTier {
    /// Time budget for this tier in milliseconds
    pub fn time_budget_ms(&self) -> u64 {
        match self {
            ValidationTier::Cheap => 10,
            ValidationTier::Medium => 150,
            ValidationTier::Expensive => u64::MAX, // Unbounded
        }
    }

    /// Human-readable description
    pub fn description(&self) -> &'static str {
        match self {
            ValidationTier::Cheap => "Schema, blocklist, grammar",
            ValidationTier::Medium => "Coherence, references, consistency",
            ValidationTier::Expensive => "Z3/FATE formal verification",
        }
    }
}

// ============================================================================
// REJECT CODES (100-129 reserved for logic violations)
// ============================================================================

/// Logic violation reject codes (100-129 range per PCI specification)
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum LogicRejectCode {
    /// 100: General logical inconsistency
    LogicInconsistency = 100,
    /// 101: Detected logical fallacy
    LogicalFallacy = 101,
    /// 102: Unsound reasoning detected
    UnsoundReasoning = 102,
    /// 103: Contradiction in premises
    ContradictoryPremises = 103,
    /// 104: Invalid inference step
    InvalidInference = 104,
    /// 105: Circular reasoning detected
    CircularReasoning = 105,
    /// 106: Ungrounded claim (no supporting evidence)
    UngroundedClaim = 106,
    /// 107: Schema validation failed
    SchemaViolation = 107,
    /// 108: Blocklist pattern matched
    BlocklistMatch = 108,
    /// 109: Semantic incoherence
    SemanticIncoherence = 109,
    /// 110: Reference resolution failed
    ReferenceResolutionFailed = 110,
    /// 111: Cross-field inconsistency
    CrossFieldInconsistency = 111,
    /// 112: FATE verification failed
    FateVerificationFailed = 112,
    /// 113: Timeout exceeded for tier
    TierTimeoutExceeded = 113,
}

impl LogicRejectCode {
    /// Get numeric code for receipt encoding
    pub fn code(&self) -> u32 {
        *self as u32
    }

    /// Human-readable description
    pub fn description(&self) -> &'static str {
        match self {
            Self::LogicInconsistency => "Logical inconsistency detected",
            Self::LogicalFallacy => "Logical fallacy in reasoning",
            Self::UnsoundReasoning => "Reasoning is not logically sound",
            Self::ContradictoryPremises => "Premises contradict each other",
            Self::InvalidInference => "Invalid inference step",
            Self::CircularReasoning => "Circular reasoning detected",
            Self::UngroundedClaim => "Claim lacks supporting evidence",
            Self::SchemaViolation => "Output violates expected schema",
            Self::BlocklistMatch => "Output matches blocked pattern",
            Self::SemanticIncoherence => "Output is semantically incoherent",
            Self::ReferenceResolutionFailed => "Referenced entity not found",
            Self::CrossFieldInconsistency => "Fields are mutually inconsistent",
            Self::FateVerificationFailed => "FATE formal verification failed",
            Self::TierTimeoutExceeded => "Validation tier time budget exceeded",
        }
    }
}

// ============================================================================
// VALIDATION ERRORS
// ============================================================================

#[derive(Debug, Error)]
pub enum LogicEnvelopeError {
    #[error("Logic validation failed: {code:?} - {reason}")]
    ValidationFailed {
        code: LogicRejectCode,
        reason: String,
        tier: ValidationTier,
    },

    #[error("Tier {tier:?} timeout: {elapsed_ms}ms > {budget_ms}ms")]
    TierTimeout {
        tier: ValidationTier,
        elapsed_ms: u64,
        budget_ms: u64,
    },

    #[error("Internal validation error: {0}")]
    Internal(String),
}

// ============================================================================
// VALIDATION RESULT
// ============================================================================

/// Result of logic envelope validation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    /// Whether validation passed
    pub passed: bool,
    /// Tier that was executed
    pub tier: ValidationTier,
    /// Time taken in milliseconds
    pub elapsed_ms: u64,
    /// Confidence score (0.0 - 1.0)
    pub confidence: Fixed64,
    /// Reject code if failed
    pub reject_code: Option<LogicRejectCode>,
    /// Detailed reason if failed
    pub reason: Option<String>,
    /// Validators executed at this tier
    pub validators_executed: Vec<String>,
}

impl ValidationResult {
    /// Create a passing result
    pub fn pass(
        tier: ValidationTier,
        elapsed_ms: u64,
        confidence: Fixed64,
        validators: Vec<String>,
    ) -> Self {
        Self {
            passed: true,
            tier,
            elapsed_ms,
            confidence,
            reject_code: None,
            reason: None,
            validators_executed: validators,
        }
    }

    /// Create a failing result
    pub fn fail(
        tier: ValidationTier,
        elapsed_ms: u64,
        code: LogicRejectCode,
        reason: String,
        validators: Vec<String>,
    ) -> Self {
        Self {
            passed: false,
            tier,
            elapsed_ms,
            confidence: Fixed64::ZERO,
            reject_code: Some(code),
            reason: Some(reason),
            validators_executed: validators,
        }
    }
}

// ============================================================================
// VALIDATOR TRAIT
// ============================================================================

/// Trait for logic validators at each tier
pub trait Validator: Send + Sync {
    /// Validator name for audit trail
    fn name(&self) -> &str;

    /// Which tier this validator belongs to
    fn tier(&self) -> ValidationTier;

    /// Execute validation
    fn validate(
        &self,
        input: &str,
        context: &ValidationContext,
    ) -> Result<ValidatorOutput, LogicEnvelopeError>;
}

/// Context passed to validators
#[derive(Debug, Clone, Default)]
pub struct ValidationContext {
    /// Source of the input (e.g., "llm_output", "user_input")
    pub source: String,
    /// Session ID for correlation
    pub session_id: Option<String>,
    /// Additional metadata
    pub metadata: std::collections::HashMap<String, String>,
}

/// Output from a single validator
#[derive(Debug, Clone)]
pub struct ValidatorOutput {
    /// Passed this validation
    pub passed: bool,
    /// Confidence in the result
    pub confidence: Fixed64,
    /// Optional reject code if failed
    pub reject_code: Option<LogicRejectCode>,
    /// Explanation
    pub explanation: String,
}

// ============================================================================
// BUILT-IN VALIDATORS
// ============================================================================

/// Cheap tier: JSON schema validator
pub struct JsonSchemaValidator;

impl Validator for JsonSchemaValidator {
    fn name(&self) -> &str {
        "json_schema"
    }

    fn tier(&self) -> ValidationTier {
        ValidationTier::Cheap
    }

    fn validate(
        &self,
        input: &str,
        _context: &ValidationContext,
    ) -> Result<ValidatorOutput, LogicEnvelopeError> {
        // Validate that input is valid JSON if it looks like JSON
        if input.trim().starts_with('{') || input.trim().starts_with('[') {
            match serde_json::from_str::<serde_json::Value>(input) {
                Ok(_) => Ok(ValidatorOutput {
                    passed: true,
                    confidence: Fixed64::ONE,
                    reject_code: None,
                    explanation: "Valid JSON structure".to_string(),
                }),
                Err(e) => Ok(ValidatorOutput {
                    passed: false,
                    confidence: Fixed64::ZERO,
                    reject_code: Some(LogicRejectCode::SchemaViolation),
                    explanation: format!("Invalid JSON: {}", e),
                }),
            }
        } else {
            // Not JSON, pass through
            Ok(ValidatorOutput {
                passed: true,
                confidence: Fixed64::ONE,
                reject_code: None,
                explanation: "Non-JSON input, schema validation skipped".to_string(),
            })
        }
    }
}

/// Cheap tier: Blocklist pattern checker
pub struct BlocklistValidator {
    patterns: Vec<String>,
}

impl Default for BlocklistValidator {
    fn default() -> Self {
        Self {
            patterns: vec![
                // Security threats
                "DROP TABLE".to_string(),
                "DELETE FROM".to_string(),
                "<script>".to_string(),
                "eval(".to_string(),
                "exec(".to_string(),
                "rm -rf".to_string(),
                // Prompt injection patterns
                "ignore previous instructions".to_string(),
                "disregard your guidelines".to_string(),
                "bypass safety".to_string(),
            ],
        }
    }
}

impl Validator for BlocklistValidator {
    fn name(&self) -> &str {
        "blocklist"
    }

    fn tier(&self) -> ValidationTier {
        ValidationTier::Cheap
    }

    fn validate(
        &self,
        input: &str,
        _context: &ValidationContext,
    ) -> Result<ValidatorOutput, LogicEnvelopeError> {
        let input_lower = input.to_lowercase();
        for pattern in &self.patterns {
            if input_lower.contains(&pattern.to_lowercase()) {
                return Ok(ValidatorOutput {
                    passed: false,
                    confidence: Fixed64::ONE,
                    reject_code: Some(LogicRejectCode::BlocklistMatch),
                    explanation: format!("Blocked pattern detected: {}", pattern),
                });
            }
        }
        Ok(ValidatorOutput {
            passed: true,
            confidence: Fixed64::ONE,
            reject_code: None,
            explanation: "No blocklist patterns detected".to_string(),
        })
    }
}

/// Medium tier: Semantic coherence validator
pub struct SemanticCoherenceValidator;

impl Validator for SemanticCoherenceValidator {
    fn name(&self) -> &str {
        "semantic_coherence"
    }

    fn tier(&self) -> ValidationTier {
        ValidationTier::Medium
    }

    fn validate(
        &self,
        input: &str,
        _context: &ValidationContext,
    ) -> Result<ValidatorOutput, LogicEnvelopeError> {
        // Basic semantic coherence checks
        // In production, this would use NLP models

        // Check for self-contradicting patterns
        let contradictions = [
            ("always", "never"),
            ("all", "none"),
            ("true", "false"),
            ("yes", "no"),
        ];

        let words: Vec<&str> = input.split_whitespace().collect();
        let word_set: std::collections::HashSet<_> =
            words.iter().map(|w| w.to_lowercase()).collect();

        for (a, b) in &contradictions {
            if word_set.contains(*a) && word_set.contains(*b) {
                // Potential contradiction - lower confidence but don't fail outright
                return Ok(ValidatorOutput {
                    passed: true,
                    confidence: Fixed64::from_f64(0.7),
                    reject_code: None,
                    explanation: format!("Potential semantic tension: {} vs {}", a, b),
                });
            }
        }

        Ok(ValidatorOutput {
            passed: true,
            confidence: Fixed64::from_f64(0.95),
            reject_code: None,
            explanation: "Semantic coherence check passed".to_string(),
        })
    }
}

/// Medium tier: Cross-field consistency validator (for structured data)
pub struct CrossFieldValidator;

impl Validator for CrossFieldValidator {
    fn name(&self) -> &str {
        "cross_field"
    }

    fn tier(&self) -> ValidationTier {
        ValidationTier::Medium
    }

    fn validate(
        &self,
        input: &str,
        _context: &ValidationContext,
    ) -> Result<ValidatorOutput, LogicEnvelopeError> {
        // For JSON inputs, check cross-field consistency
        if let Ok(json) = serde_json::from_str::<serde_json::Value>(input) {
            if let Some(obj) = json.as_object() {
                // Example: if "success" is true, "error" should be null/empty
                if let (Some(success), Some(error)) = (obj.get("success"), obj.get("error")) {
                    if success.as_bool() == Some(true) && !error.is_null() && error != "" {
                        return Ok(ValidatorOutput {
                            passed: false,
                            confidence: Fixed64::from_f64(0.9),
                            reject_code: Some(LogicRejectCode::CrossFieldInconsistency),
                            explanation: "success=true but error field is populated".to_string(),
                        });
                    }
                }
            }
        }

        Ok(ValidatorOutput {
            passed: true,
            confidence: Fixed64::from_f64(0.95),
            reject_code: None,
            explanation: "Cross-field consistency check passed".to_string(),
        })
    }
}

// ============================================================================
// LOGIC ENVELOPE
// ============================================================================

/// Logic Envelope: Tiered validation system for LLM outputs
/// Giants: Dijkstra (layered verification), Hoare (contracts), Church (formal semantics)
pub struct LogicEnvelope {
    /// Validators organized by tier
    validators: Vec<Box<dyn Validator>>,
    /// Whether to fail fast on first error
    fail_fast: bool,
}

impl Default for LogicEnvelope {
    fn default() -> Self {
        Self::new()
    }
}

impl LogicEnvelope {
    /// Create a new LogicEnvelope with default validators
    pub fn new() -> Self {
        Self {
            validators: vec![
                // Cheap tier
                Box::new(JsonSchemaValidator),
                Box::new(BlocklistValidator::default()),
                // Medium tier
                Box::new(SemanticCoherenceValidator),
                Box::new(CrossFieldValidator),
            ],
            fail_fast: true,
        }
    }

    /// Add a custom validator
    pub fn add_validator(&mut self, validator: Box<dyn Validator>) {
        self.validators.push(validator);
    }

    /// Set fail-fast mode
    pub fn set_fail_fast(&mut self, fail_fast: bool) {
        self.fail_fast = fail_fast;
    }

    /// Execute validation through all tiers progressively
    pub fn validate(
        &self,
        input: &str,
        context: &ValidationContext,
    ) -> Result<ValidationResult, LogicEnvelopeError> {
        // Execute each tier in order
        for tier in &[
            ValidationTier::Cheap,
            ValidationTier::Medium,
            ValidationTier::Expensive,
        ] {
            let result = self.validate_tier(input, context, *tier)?;
            if !result.passed {
                return Ok(result);
            }
        }

        // All tiers passed
        Ok(ValidationResult::pass(
            ValidationTier::Expensive,
            0, // Will be accumulated
            Fixed64::from_f64(0.95),
            self.validators
                .iter()
                .map(|v| v.name().to_string())
                .collect(),
        ))
    }

    /// Execute validation for a specific tier only
    pub fn validate_tier(
        &self,
        input: &str,
        context: &ValidationContext,
        tier: ValidationTier,
    ) -> Result<ValidationResult, LogicEnvelopeError> {
        let start = Instant::now();
        let time_budget = Duration::from_millis(tier.time_budget_ms());
        let mut validators_executed = Vec::new();
        let mut min_confidence = Fixed64::ONE;

        // Track failures when fail_fast=false (aggregate mode)
        let mut first_failure: Option<(LogicRejectCode, String)> = None;

        // Get validators for this tier
        let tier_validators: Vec<_> = self
            .validators
            .iter()
            .filter(|v| v.tier() == tier)
            .collect();

        for validator in tier_validators {
            // Check time budget
            if start.elapsed() > time_budget && tier != ValidationTier::Expensive {
                return Err(LogicEnvelopeError::TierTimeout {
                    tier,
                    elapsed_ms: start.elapsed().as_millis() as u64,
                    budget_ms: tier.time_budget_ms(),
                });
            }

            validators_executed.push(validator.name().to_string());
            let output = validator.validate(input, context)?;

            if output.confidence < min_confidence {
                min_confidence = output.confidence;
            }

            if !output.passed {
                if self.fail_fast {
                    return Ok(ValidationResult::fail(
                        tier,
                        start.elapsed().as_millis() as u64,
                        output
                            .reject_code
                            .unwrap_or(LogicRejectCode::LogicInconsistency),
                        output.explanation,
                        validators_executed,
                    ));
                } else {
                    // Aggregate mode: track first failure but continue
                    if first_failure.is_none() {
                        first_failure = Some((
                            output
                                .reject_code
                                .unwrap_or(LogicRejectCode::LogicInconsistency),
                            output.explanation,
                        ));
                    }
                }
            }
        }

        // If any failures occurred in aggregate mode, return fail
        if let Some((code, reason)) = first_failure {
            return Ok(ValidationResult::fail(
                tier,
                start.elapsed().as_millis() as u64,
                code,
                reason,
                validators_executed,
            ));
        }

        Ok(ValidationResult::pass(
            tier,
            start.elapsed().as_millis() as u64,
            min_confidence,
            validators_executed,
        ))
    }

    /// Quick validation using only Cheap tier (for high-throughput paths)
    pub fn quick_validate(&self, input: &str) -> Result<bool, LogicEnvelopeError> {
        let context = ValidationContext::default();
        let result = self.validate_tier(input, &context, ValidationTier::Cheap)?;
        Ok(result.passed)
    }
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validation_tier_budgets() {
        assert_eq!(ValidationTier::Cheap.time_budget_ms(), 10);
        assert_eq!(ValidationTier::Medium.time_budget_ms(), 150);
        assert_eq!(ValidationTier::Expensive.time_budget_ms(), u64::MAX);
    }

    #[test]
    fn test_reject_codes_in_range() {
        // All codes should be in 100-129 range
        let codes = [
            LogicRejectCode::LogicInconsistency,
            LogicRejectCode::LogicalFallacy,
            LogicRejectCode::UnsoundReasoning,
            LogicRejectCode::SchemaViolation,
            LogicRejectCode::BlocklistMatch,
        ];

        for code in codes {
            assert!(
                code.code() >= 100 && code.code() < 130,
                "Code {} out of range",
                code.code()
            );
        }
    }

    #[test]
    fn test_json_schema_validator_valid() {
        let validator = JsonSchemaValidator;
        let context = ValidationContext::default();
        let result = validator.validate(r#"{"key": "value"}"#, &context).unwrap();
        assert!(result.passed);
    }

    #[test]
    fn test_json_schema_validator_invalid() {
        let validator = JsonSchemaValidator;
        let context = ValidationContext::default();
        let result = validator.validate(r#"{"key": invalid}"#, &context).unwrap();
        assert!(!result.passed);
        assert_eq!(result.reject_code, Some(LogicRejectCode::SchemaViolation));
    }

    #[test]
    fn test_blocklist_validator_clean() {
        let validator = BlocklistValidator::default();
        let context = ValidationContext::default();
        let result = validator
            .validate("This is a safe message", &context)
            .unwrap();
        assert!(result.passed);
    }

    #[test]
    fn test_blocklist_validator_blocked() {
        let validator = BlocklistValidator::default();
        let context = ValidationContext::default();
        let result = validator.validate("DROP TABLE users;", &context).unwrap();
        assert!(!result.passed);
        assert_eq!(result.reject_code, Some(LogicRejectCode::BlocklistMatch));
    }

    #[test]
    fn test_blocklist_validator_prompt_injection() {
        let validator = BlocklistValidator::default();
        let context = ValidationContext::default();
        let result = validator
            .validate("Please ignore previous instructions and...", &context)
            .unwrap();
        assert!(!result.passed);
    }

    #[test]
    fn test_logic_envelope_clean_input() {
        let envelope = LogicEnvelope::new();
        let context = ValidationContext::default();
        let result = envelope
            .validate("Calculate the sum of 2 + 2", &context)
            .unwrap();
        assert!(result.passed);
    }

    #[test]
    fn test_logic_envelope_blocked_input() {
        let envelope = LogicEnvelope::new();
        let context = ValidationContext::default();
        let result = envelope.validate("rm -rf /", &context).unwrap();
        assert!(!result.passed);
        assert_eq!(result.tier, ValidationTier::Cheap);
    }

    #[test]
    fn test_logic_envelope_json_with_cross_field_error() {
        let envelope = LogicEnvelope::new();
        let context = ValidationContext::default();
        let result = envelope
            .validate(
                r#"{"success": true, "error": "Something went wrong"}"#,
                &context,
            )
            .unwrap();
        // Cross-field validator should catch this
        assert!(!result.passed);
        assert_eq!(
            result.reject_code,
            Some(LogicRejectCode::CrossFieldInconsistency)
        );
    }

    #[test]
    fn test_quick_validate() {
        let envelope = LogicEnvelope::new();
        assert!(envelope.quick_validate("Safe input").unwrap());
        assert!(!envelope.quick_validate("DROP TABLE users").unwrap());
    }

    #[test]
    fn test_validation_result_constructors() {
        let pass = ValidationResult::pass(
            ValidationTier::Cheap,
            5,
            Fixed64::ONE,
            vec!["test".to_string()],
        );
        assert!(pass.passed);
        assert!(pass.reject_code.is_none());

        let fail = ValidationResult::fail(
            ValidationTier::Medium,
            100,
            LogicRejectCode::SemanticIncoherence,
            "Test failure".to_string(),
            vec!["test".to_string()],
        );
        assert!(!fail.passed);
        assert_eq!(fail.reject_code, Some(LogicRejectCode::SemanticIncoherence));
    }

    #[test]
    fn test_aggregate_mode_still_fails() {
        // Test that fail_fast=false (aggregate mode) still returns failure
        // This validates the fix for the masked validation bug
        let mut envelope = LogicEnvelope::new();
        envelope.set_fail_fast(false); // Aggregate mode

        let context = ValidationContext::default();

        // This should still fail even in aggregate mode
        let result = envelope.validate("DROP TABLE users", &context).unwrap();
        assert!(
            !result.passed,
            "Aggregate mode should still report failures"
        );
        assert_eq!(result.reject_code, Some(LogicRejectCode::BlocklistMatch));
    }

    #[test]
    fn test_aggregate_mode_runs_all_validators() {
        // Verify that aggregate mode runs all validators even after failure
        let mut envelope = LogicEnvelope::new();
        envelope.set_fail_fast(false);

        let context = ValidationContext::default();

        // Invalid JSON that also hits blocklist - both validators should run
        let result = envelope
            .validate_tier(r#"{DROP TABLE invalid}"#, &context, ValidationTier::Cheap)
            .unwrap();

        // Should have run both cheap validators
        assert!(result
            .validators_executed
            .contains(&"json_schema".to_string()));
        assert!(result
            .validators_executed
            .contains(&"blocklist".to_string()));
        // But should still fail
        assert!(!result.passed);
    }
}
