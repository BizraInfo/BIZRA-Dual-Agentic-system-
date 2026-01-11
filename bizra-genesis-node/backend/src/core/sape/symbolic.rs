//! BIZRA Node0 - SAPE Symbolic Harness
//!
//! Bridges neural representations with symbolic logical invariants.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PrimitiveType {
    String,
    Integer,
    Boolean,
    Uuid,
    IhsanScore,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypedDefinition {
    pub name: String,
    pub kind: String,
    pub base_type: PrimitiveType,
    pub constraints: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Invariant {
    pub name: String,
    pub predicate: String,
    pub severity: InvariantSeverity,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum InvariantSeverity {
    Veto,    // Immediate path rejection
    Warn,    // Score reduction
    Monitor, // Info only
}

pub struct SymbolicHarness {
    pub definitions: HashMap<String, TypedDefinition>,
    pub invariants: Vec<Invariant>,
    pub rules: Vec<String>,
}

impl SymbolicHarness {
    pub fn new() -> Self {
        Self {
            definitions: HashMap::new(),
            invariants: Vec::new(),
            rules: Vec::new(),
        }
    }

    /// Ground a neural fluency into a symbolic definition
    pub fn ground(&mut self, name: &str, kind: &str, base: PrimitiveType) {
        self.definitions.insert(
            name.to_string(),
            TypedDefinition {
                name: name.to_string(),
                kind: kind.to_string(),
                base_type: base,
                constraints: vec![],
            },
        );
    }

    pub fn add_invariant(&mut self, name: &str, pred: &str, severity: InvariantSeverity) {
        self.invariants.push(Invariant {
            name: name.to_string(),
            predicate: pred.to_string(),
            severity,
        });
    }

    pub fn verify_claims(&self, claims: &[String]) -> InvariantResult {
        let mut violations = vec![];
        for inv in &self.invariants {
            if claims
                .iter()
                .any(|c| c.to_lowercase().contains("violate") && c.contains(&inv.name))
            {
                violations.push(inv.clone());
            }
        }

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
}

pub enum InvariantResult {
    Pass,
    Warn(Vec<Invariant>),
    Veto(Vec<Invariant>),
}
