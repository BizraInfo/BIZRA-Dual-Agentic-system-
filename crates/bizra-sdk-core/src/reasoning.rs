use crate::graph_memory::{GraphEdge, GraphMemoryInterface, GraphNode};
use crate::model::ModelRuntime;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ReasoningNode {
    pub graph_node: GraphNode,
    pub score: f32, // SNR score
    pub depth: u32,
}

pub struct ReasoningEngine {
    memory: Arc<dyn GraphMemoryInterface>,
    model: Arc<dyn ModelRuntime>,
}

impl ReasoningEngine {
    pub fn new(memory: Arc<dyn GraphMemoryInterface>, model: Arc<dyn ModelRuntime>) -> Self {
        Self { memory, model }
    }

    /// Entry point for Graph of Thoughts reasoning
    pub fn solve(&self, problem: &str) -> Result<String> {
        // 1. Create Root Node (Focus)
        let root = GraphNode::new(problem, "problem_statement");
        self.memory.add_node(root.clone())?;

        // 2. Generate initial thoughts (Branching)
        // In a real implementation, this would call the LLM to generate N approaches.
        let prompt = format!("Propose 3 distinct approaches to solve: {}", problem);
        let response = self.model.generate(&prompt, &serde_json::json!({}))?; // Simple generation

        // For demonstration, we'll assume the model returns a semi-structured string or we define dummy thoughts.
        // We'll treat the whole response as one "thought" for now, but ideally we split it.
        let thought_node = GraphNode::new(&response, "thought_branch")
            .with_metadata("strategy", "initial_brainstorm");
        self.memory.add_node(thought_node.clone())?;

        let edge = GraphEdge {
            source: root.id.clone(),
            target: thought_node.id.clone(),
            relation: "initial_analysis".to_string(),
            weight: 1.0,
        };
        self.memory.add_edge(edge)?;

        // 3. SNR Scoring (Evaluation)
        let score = self.calculate_snr(&thought_node)?;

        if score > 0.8 {
            Ok(format!("High confidence solution found: {}", response))
        } else {
            Ok(format!(
                "Solution needs refinement (SNR: {}): {}",
                score, response
            ))
        }
    }

    /// Calculate Signal-to-Noise Ratio for a reasoning node.
    ///
    /// SECURITY: This uses content analysis, not just length.
    /// v0.4: Multi-factor scoring to prevent trivial bypass.
    fn calculate_snr(&self, node: &GraphNode) -> Result<f32> {
        let content = &node.content;
        let content_len = content.len();

        // SECURITY: Reject trivially short content
        if content_len < 50 {
            return Ok(0.1); // Too short to be meaningful
        }

        // Factor 1: Length penalty for padding attacks
        // Diminishing returns after 500 chars to prevent "wall of text" bypass
        let length_score = if content_len > 500 {
            0.15 // Length alone is not signal
        } else {
            (content_len as f32 / 500.0) * 0.15
        };

        // Factor 2: Vocabulary diversity (anti-repetition)
        let words: Vec<&str> = content.split_whitespace().collect();
        let unique_words: std::collections::HashSet<&str> = words.iter().copied().collect();
        let diversity_ratio = if words.is_empty() {
            0.0
        } else {
            unique_words.len() as f32 / words.len() as f32
        };
        // Penalize < 30% diversity (spam/repetition attack)
        let diversity_score = if diversity_ratio < 0.3 {
            0.0
        } else {
            diversity_ratio * 0.25
        };

        // Factor 3: Structure markers (reasoning quality)
        let structure_markers = [
            "because",
            "therefore",
            "however",
            "analysis",
            "evidence",
            "consider",
            "implies",
            "proof",
            "given",
            "conclude",
        ];
        let structure_hits = structure_markers
            .iter()
            .filter(|m| content.to_lowercase().contains(*m))
            .count();
        let structure_score = (structure_hits as f32 / 5.0).min(1.0) * 0.30;

        // Factor 4: Noise markers (negative signal)
        let noise_markers = [
            "as an ai",
            "i cannot",
            "i'm sorry",
            "apologize",
            "aaaaa",
            "xxxxx",
            "????",
            "!!!!",
        ];
        let noise_hits = noise_markers
            .iter()
            .filter(|m| content.to_lowercase().contains(*m))
            .count();
        let noise_penalty = (noise_hits as f32 * 0.15).min(0.5);

        // Factor 5: Node metadata bonus (context awareness)
        let metadata_bonus = if node.metadata.is_empty() { 0.0 } else { 0.10 };

        // Composite score with noise penalty
        let raw_score = length_score + diversity_score + structure_score + metadata_bonus;
        let final_score = (raw_score - noise_penalty).max(0.0).min(1.0);

        // Add entropy component for additional bypass resistance
        let entropy = self.calculate_entropy(content);
        let entropy_adjusted = final_score * 0.7 + entropy * 0.3;

        Ok(entropy_adjusted.min(0.98)) // Never return 1.0 (always room for improvement)
    }

    /// Shannon entropy approximation for content quality.
    fn calculate_entropy(&self, content: &str) -> f32 {
        if content.is_empty() {
            return 0.0;
        }

        let mut counts = [0u32; 256];
        for b in content.as_bytes() {
            counts[*b as usize] += 1;
        }

        let len = content.len() as f32;
        let mut entropy: f32 = 0.0;
        for &count in &counts {
            if count > 0 {
                let p = count as f32 / len;
                entropy -= p * p.log2();
            }
        }

        // Normalize to [0, 1] (max entropy for ASCII is ~7 bits)
        (entropy / 7.0).min(1.0)
    }
}
