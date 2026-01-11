//! SAPE v1.∞ Intent Gate
//!
//! Defined goal-state and success criteria.

use super::schema::Intent;

impl Intent {
    pub fn validate(&self) -> Result<(), String> {
        if self.objective.is_empty() {
            return Err("Objective cannot be empty".to_string());
        }
        if self.success_criteria.is_empty() {
            return Err("Success criteria required for integrity".to_string());
        }
        Ok(())
    }
}
