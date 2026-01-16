use anyhow::Result;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScoreConfig {
    pub min_snr: f64,
    pub min_ihsan: f64,
}

impl Default for ScoreConfig {
    fn default() -> Self {
        Self {
            min_snr: 0.5,
            min_ihsan: 0.90, // Strict default
        }
    }
}

pub struct SnrScorer;

impl SnrScorer {
    /// Compute Signal-to-Noise Ratio (SNR) for a given prompt and output.
    /// Returns a score between 0.0 and ∞ (typically normalized to 0.0-1.0 or similar for gating).
    ///
    /// Heuristic:
    /// - Signal: Meaningful content (unique words, relevance to prompt).
    /// - Noise: Repetition, hallucination markers, filler words.
    pub fn compute_snr(prompt: &str, output: &str) -> f64 {
        let prompt_words: Vec<&str> = prompt.split_whitespace().collect();
        let output_words: Vec<&str> = output.split_whitespace().collect();

        if output_words.is_empty() {
            return 0.0;
        }

        // 1. Relevance: Overlap with prompt keywords vs total prompt keywords
        let overlap_count = prompt_words.iter().filter(|&w| output.contains(w)).count();
        let relevance = if !prompt_words.is_empty() {
            overlap_count as f64 / prompt_words.len() as f64
        } else {
            1.0
        };

        // 2. Conciseness: Output length vs Information (Unique words)
        let unique_words: std::collections::HashSet<&str> = output_words.iter().cloned().collect();
        let information_density = unique_words.len() as f64 / output_words.len() as f64;

        // SNR score formula (Simplified): Relevance * Density * 10.0
        // Real formulation would involve embedding similarity etc.
        (relevance * information_density * 10.0).clamp(0.0, 5.0)
    }
}

pub struct IhsanScorer;

impl IhsanScorer {
    /// Compute Ihsan (Excellence/Ethics) score.
    /// Returns 0.0 - 1.0.
    ///
    /// Checks for:
    /// - Harmful patterns (Safety)
    /// - Polite/Beneficial tone
    /// - Completeness
    pub fn compute_ihsan(output: &str) -> f64 {
        let mut score = 1.0;

        // 1. Safety Filter (Naive keyword blocklist)
        let unsafe_keywords = ["kill", "destroy", "hack", "exploit"];
        for kw in unsafe_keywords {
            if output.to_lowercase().contains(kw) {
                score -= 0.5;
            }
        }

        // 2. Benevolence (Positive keywords)
        let benevolence_keywords = ["help", "improve", "optimize", "safe", "verified"];
        let benevolence_count = benevolence_keywords
            .iter()
            .filter(|&kw| output.to_lowercase().contains(kw))
            .count();
        score += (benevolence_count as f64 * 0.05).min(0.2);

        // 3. Length penalty (too short might be rude/unhelpful)
        if output.len() < 10 {
            score -= 0.1;
        }

        score.clamp(0.0, 1.0)
    }
}
