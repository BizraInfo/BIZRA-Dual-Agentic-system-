//! SAPE v1.∞ Schema - Typed IR for Neural-Symbolic Bridge
//!
//! This module defines the canonical intermediate representation (IR) for SAPE.
//! Everything "actionable" must be expressible as: Typed IR → Constraints → Validation

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// ============================================
// INTENT (Module 0: Intent Gate)
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Intent {
    pub domain: String,
    pub objective: String,
    pub stakes: Stakes,
    pub constraints: Vec<String>,
    pub success_criteria: Vec<String>,
    pub forbidden_moves: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Stakes {
    High,
    Medium,
    Low,
}

// ============================================
// EVIDENCE (Module 2: Knowledge Kernels)
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceRef {
    pub author: String,    // [A]
    pub date: String,      // [D]
    pub excerpt: String,   // [E]
    pub relevance: String, // [R]
}

impl EvidenceRef {
    pub fn to_tag(&self) -> String {
        format!(
            "[A]{} [D]{} [E]{} [R]{}",
            self.author, self.date, self.excerpt, self.relevance
        )
    }
}

// ============================================
// CLAIMS & REASONING PATHS
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claim {
    pub text: String,
    pub confidence: f64,
    pub evidence_refs: Vec<usize>, // Indices into evidence table
    pub tags: Vec<String>,
}

// ============================================
// SYMBOLIC LAYER (Module 4: Symbolic Harness)
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Atom {
    Predicate {
        name: String,
        args: Vec<String>,
    },
    Equality {
        left: String,
        right: String,
    },
    Comparison {
        left: String,
        op: CompOp,
        right: String,
    },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompOp {
    Gt,
    Lt,
    Gte,
    Lte,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PredicateExpr {
    Atom(Atom),
    And(Box<PredicateExpr>, Box<PredicateExpr>),
    Or(Box<PredicateExpr>, Box<PredicateExpr>),
    Not(Box<PredicateExpr>),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Invariant {
    pub id: String,
    pub expr: String, // Serialized PredicateExpr or human-readable
    pub severity: InvariantSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InvariantSeverity {
    Veto,    // Immediate rejection
    Warn,    // Score reduction
    Monitor, // Info only
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Rule {
    pub head: Atom,
    pub body: Vec<Atom>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProofSketch {
    pub lemmas: Vec<String>,
    pub theorem: String,
    pub trace: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgramSketch {
    pub signatures: Vec<String>,
    pub preconditions: Vec<String>,
    pub postconditions: Vec<String>,
    pub constraints: Vec<String>,
}

// ============================================
// IHSĀN SCORE (Module 7: Ethics Gate)
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IhsanScore {
    pub score: f64,
    pub rationale: String,
    pub veto_flags: VetoFlags,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VetoFlags {
    pub truth: bool,    // False = veto
    pub safety: bool,   // False = veto
    pub consent: bool,  // False = veto
    pub non_harm: bool, // False = veto
}

impl VetoFlags {
    pub fn passes(&self) -> bool {
        self.truth && self.safety && self.consent && self.non_harm
    }
}

// ============================================
// VALIDATION RESULTS (Pass 3: Prove)
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResults {
    pub correctness: CheckResult,
    pub consistency: CheckResult,
    pub completeness: CheckResult,
    pub causality: CheckResult,
    pub ethics: CheckResult,
    pub evidence: CheckResult,

    // SNR Metrics
    pub evidence_coverage: f64,
    pub contradiction_pressure: f64,
    pub compression_ratio: f64,

    pub confidence_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckResult {
    pub passed: bool,
    pub notes: Vec<String>,
}

impl ValidationResults {
    pub fn passes_gate(&self) -> bool {
        self.correctness.passed
            && self.consistency.passed
            && self.completeness.passed
            && self.causality.passed
            && self.ethics.passed
            && self.evidence.passed
    }

    pub fn failed_checks(&self) -> Vec<String> {
        let mut failed = vec![];
        if !self.correctness.passed {
            failed.push("Correctness".to_string());
        }
        if !self.consistency.passed {
            failed.push("Consistency".to_string());
        }
        if !self.completeness.passed {
            failed.push("Completeness".to_string());
        }
        if !self.causality.passed {
            failed.push("Causality".to_string());
        }
        if !self.ethics.passed {
            failed.push("Ethics (Ihsān)".to_string());
        }
        if !self.evidence.passed {
            failed.push("Evidence".to_string());
        }
        failed
    }
}

// ============================================
// FINAL OUTPUT (Complete SAPE Run)
// ============================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SapeOutput {
    pub intent: Intent,
    pub lenses: Vec<String>,
    pub evidence: Vec<EvidenceRef>,
    pub paths: ReasoningPaths,
    pub symbolic: SymbolicHarness,
    pub validation: ValidationResults,
    pub conclusion: Conclusion,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReasoningPaths {
    pub i_path: Vec<String>, // High-probability
    pub c_path: Vec<String>, // Contrarian
    pub o_path: Vec<String>, // Analogical
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SymbolicHarness {
    pub definitions: HashMap<String, String>,
    pub invariants: Vec<Invariant>,
    pub rules: Vec<Rule>,
    pub proof_sketch: ProofSketch,
    pub program_sketch: ProgramSketch,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conclusion {
    pub confidence_score: f64,
    pub risks: Vec<String>,
    pub next_experiments: Vec<String>,
}
