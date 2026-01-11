//! SAPE v1.∞ Evidence Module
//!
//! Tracks and validates [A][D][E][R] tags for disciplined thought.

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Evidence {
    pub author: String,
    pub date: String,
    pub excerpt: String,
    pub relevance: String,
}

impl Evidence {
    pub fn to_tag(&self) -> String {
        format!(
            "[A]{} [D]{} [E]{} [R]{}",
            self.author, self.date, self.excerpt, self.relevance
        )
    }
}

pub struct EvidenceTable {
    pub entries: Vec<Evidence>,
}

impl EvidenceTable {
    pub fn new() -> Self {
        Self { entries: vec![] }
    }

    pub fn add(&mut self, entry: Evidence) {
        self.entries.push(entry);
    }
}
