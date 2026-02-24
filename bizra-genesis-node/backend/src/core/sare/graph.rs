use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ThoughtStatus {
    Proposed,
    SapeVerified(f64),  // Score from SAPE validator
    IhsanVerified(f64), // Score from Ihsan check
    Culled(String),     // Reason for culling
    Winner,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThoughtNode {
    pub id: Uuid,
    pub parent_ids: Vec<Uuid>,
    pub content: String,
    pub status: ThoughtStatus,
    pub snr_score: f64,
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Default, Serialize, Deserialize)]
pub struct ReasoningGraph {
    pub nodes: HashMap<Uuid, ThoughtNode>,
    pub roots: Vec<Uuid>,
}

impl ReasoningGraph {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn add_thought(&mut self, content: String, parents: Vec<Uuid>) -> Uuid {
        let id = Uuid::new_v4();
        let node = ThoughtNode {
            id,
            parent_ids: parents.clone(),
            content,
            status: ThoughtStatus::Proposed,
            snr_score: 0.0,
            metadata: HashMap::new(),
        };

        if parents.is_empty() {
            self.roots.push(id);
        }

        self.nodes.insert(id, node);
        id
    }

    pub fn update_status(&mut self, id: Uuid, status: ThoughtStatus) {
        if let Some(node) = self.nodes.get_mut(&id) {
            node.status = status;
        }
    }

    pub fn calculate_snr(&mut self, id: Uuid, sap_score: f64, ihsan_score: f64) -> f64 {
        // Interdisciplinary SNR Formula:
        // SNR = (SAPE_Score * Weight_SAPE + Ihsan_Score * Weight_Ihsan) / Complexity_Penalty
        // For now, simple weighted average as Peak Practitioner baseline
        let snr = (sap_score * 0.4) + (ihsan_score * 0.6);

        if let Some(node) = self.nodes.get_mut(&id) {
            node.snr_score = snr;
        }
        snr
    }

    pub fn get_best_thought(&self) -> Option<&ThoughtNode> {
        self.nodes
            .values()
            .filter(|n| {
                matches!(
                    n.status,
                    ThoughtStatus::Winner
                        | ThoughtStatus::SapeVerified(_)
                        | ThoughtStatus::IhsanVerified(_)
                )
            })
            .max_by(|a, b| {
                a.snr_score
                    .partial_cmp(&b.snr_score)
                    .unwrap_or(std::cmp::Ordering::Equal)
            })
    }
}
