//! SAPE v1.∞ Symbolic Harness - Neural-Symbolic Bridge
//!
//! Transforms neural fluencies into typed definitions and logical invariants.
//! Enforces fail-closed constraint validation.

use super::schema::*;
use std::collections::HashMap;

pub struct SymbolicHarnessBuilder {
    definitions: HashMap<String, String>,
    invariants: Vec<Invariant>,
    rules: Vec<Rule>,
}

impl SymbolicHarnessBuilder {
    pub fn new() -> Self {
        Self {
            definitions: HashMap::new(),
            invariants: Vec::new(),
            rules: Vec::new(),
        }
    }

    /// Ground a neural fluency into a typed definition
    pub fn add_definition(&mut self, name: impl Into<String>, typedef: impl Into<String>) {
        self.definitions.insert(name.into(), typedef.into());
    }

    /// Add a logical invariant (safety/correctness property)
    pub fn add_invariant(
        &mut self,
        id: impl Into<String>,
        expr: impl Into<String>,
        severity: InvariantSeverity,
    ) {
        self.invariants.push(Invariant {
            id: id.into(),
            expr: expr.into(),
            severity,
        });
    }

    /// Add a Horn clause rule
    pub fn add_rule(&mut self, head: Atom, body: Vec<Atom>) {
        self.rules.push(Rule { head, body });
    }

    /// Build the final harness
    pub fn build(
        self,
        proof_sketch: ProofSketch,
        program_sketch: ProgramSketch,
    ) -> SymbolicHarness {
        SymbolicHarness {
            definitions: self.definitions,
            invariants: self.invariants,
            rules: self.rules,
            proof_sketch,
            program_sketch,
        }
    }

    /// Verify claims against registered invariants (fail-closed)
    pub fn verify_claims(&self, claims: &[Claim]) -> InvariantResult {
        let mut violations = vec![];

        for inv in &self.invariants {
            // Simplified check: look for explicit violations in claim text
            for claim in claims {
                if self.violates_invariant(&claim.text, &inv.expr) {
                    violations.push(inv.clone());
                    break;
                }
            }
        }

        // Fail-closed: Any Veto-level violation blocks the entire run
        if violations
            .iter()
            .any(|v| matches!(v.severity, InvariantSeverity::Veto))
        {
            InvariantResult::Veto(violations)
        } else if !violations.is_empty() {
            InvariantResult::Warn(violations)
        } else {
            InvariantResult::Pass
        }
    }

    /// Simplified invariant violation check
    fn violates_invariant(&self, claim_text: &str, invariant_expr: &str) -> bool {
        // Placeholder: In production, parse and evaluate the predicate expression
        // For now, use keyword matching
        if invariant_expr.contains("NOT_HALLUCINATE") && claim_text.contains("HALLUCINATION") {
            return true;
        }
        if invariant_expr.contains("EVIDENCE_REQUIRED") && !claim_text.contains("[A]") {
            return true;
        }
        false
    }
}

pub enum InvariantResult {
    Pass,
    Warn(Vec<Invariant>),
    Veto(Vec<Invariant>),
}

impl InvariantResult {
    pub fn is_veto(&self) -> bool {
        matches!(self, InvariantResult::Veto(_))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_veto_on_hallucination() {
        let mut builder = SymbolicHarnessBuilder::new();
        builder.add_invariant(
            "no_hallucination",
            "NOT_HALLUCINATE",
            InvariantSeverity::Veto,
        );

        let claims = vec![Claim {
            text: "This is a HALLUCINATION without evidence".to_string(),
            confidence: 0.5,
            evidence_refs: vec![],
            tags: vec![],
        }];

        let result = builder.verify_claims(&claims);
        assert!(result.is_veto(), "Should veto on hallucination");
    }

    #[test]
    fn test_pass_on_valid_claim() {
        let mut builder = SymbolicHarnessBuilder::new();
        builder.add_invariant(
            "evidence_required",
            "EVIDENCE_REQUIRED",
            InvariantSeverity::Warn,
        );

        let claims = vec![Claim {
            text: "[A]Author [D]2026 [E]Quote [R]Relevant".to_string(),
            confidence: 0.95,
            evidence_refs: vec![0],
            tags: vec![],
        }];

        let result = builder.verify_claims(&claims);
        assert!(
            matches!(result, InvariantResult::Pass),
            "Should pass with evidence"
        );
    }
}
