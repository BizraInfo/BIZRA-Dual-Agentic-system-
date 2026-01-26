// src/arte/attention.rs - Input Salience Scoring
//
// PEAK MASTERPIECE: ARTE Attention Stage
// Giants Citation: Kahneman Attention, Treisman Feature Integration
//
// Implements the Attention stage of ARTE:
// - Input salience scoring based on token importance
// - Feature integration for multi-modal attention
// - Selective attention filtering

use crate::fixed::Fixed64;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{debug, instrument};

/// Configuration for attention scoring
#[derive(Debug, Clone)]
pub struct AttentionConfig {
    /// Top-k salient tokens to return
    pub top_k: usize,
    /// Minimum salience threshold
    pub salience_threshold: f64,
    /// Enable feature integration
    pub feature_integration: bool,
}

impl Default for AttentionConfig {
    fn default() -> Self {
        Self {
            top_k: 10,
            salience_threshold: 0.5,
            feature_integration: true,
        }
    }
}

/// A salient token with its score
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SalientToken {
    /// Token text
    pub token: String,
    /// Salience score (0.0-1.0)
    pub salience: f64,
    /// Feature type (semantic, structural, contextual)
    pub feature_type: String,
    /// Position in input
    pub position: usize,
}

/// Result of attention scoring
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttentionResult {
    /// Salient tokens (sorted by salience descending)
    pub salient_tokens: Vec<SalientToken>,
    /// Overall attention focus score
    pub focus_score: Fixed64,
    /// Ihsan score for this stage
    pub ihsan: Fixed64,
    /// SNR score for this stage
    pub snr: Fixed64,
    /// Attention latency
    pub latency_ms: u64,
}

/// Attention Scorer - Implements Kahneman attention model
pub struct AttentionScorer {
    /// Configuration
    config: AttentionConfig,
    /// High-salience keywords (domain-specific)
    high_salience_keywords: HashMap<String, f64>,
}

impl AttentionScorer {
    /// Create new attention scorer with default top-k
    pub fn new(top_k: usize) -> Self {
        let mut config = AttentionConfig::default();
        config.top_k = top_k;
        Self::with_config(config)
    }

    /// Create with custom configuration
    pub fn with_config(config: AttentionConfig) -> Self {
        let mut scorer = Self {
            config,
            high_salience_keywords: HashMap::new(),
        };

        // Register high-salience domain keywords
        scorer.register_domain_keywords();
        scorer
    }

    /// Register domain-specific high-salience keywords
    fn register_domain_keywords(&mut self) {
        // BIZRA domain keywords
        let keywords = [
            ("ihsan", 0.95),
            ("adl", 0.90),
            ("amanah", 0.90),
            ("verification", 0.85),
            ("z3", 0.85),
            ("proof", 0.85),
            ("consensus", 0.80),
            ("byzantine", 0.80),
            ("safety", 0.85),
            ("security", 0.85),
            ("ethics", 0.90),
            ("sovereignty", 0.85),
            ("wisdom", 0.88),
            ("excellence", 0.88),
        ];

        for (keyword, score) in keywords {
            self.high_salience_keywords
                .insert(keyword.to_string(), score);
        }
    }

    /// Score input for salience
    #[instrument(skip(self, input, context))]
    pub fn score(&self, input: &str, context: &[String]) -> AttentionResult {
        let start = std::time::Instant::now();

        let mut tokens: Vec<SalientToken> = Vec::new();
        let words: Vec<&str> = input.split_whitespace().collect();

        // Calculate base salience for each token
        for (pos, word) in words.iter().enumerate() {
            let clean_word = word.to_lowercase().trim_matches(|c: char| !c.is_alphanumeric()).to_string();

            if clean_word.len() < 3 {
                continue;
            }

            // Calculate salience
            let salience = self.calculate_token_salience(&clean_word, pos, words.len(), context);

            if salience >= self.config.salience_threshold {
                tokens.push(SalientToken {
                    token: clean_word,
                    salience,
                    feature_type: self.classify_feature(&word.to_lowercase()),
                    position: pos,
                });
            }
        }

        // Sort by salience descending
        tokens.sort_by(|a, b| {
            b.salience
                .partial_cmp(&a.salience)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // Take top-k
        tokens.truncate(self.config.top_k);

        // Calculate focus score (how concentrated attention is)
        let focus_score = self.calculate_focus_score(&tokens);

        // Calculate Ihsan and SNR
        let ihsan = self.calculate_ihsan(&tokens);
        let snr = self.calculate_snr(&tokens, words.len());

        let latency_ms = start.elapsed().as_millis() as u64;

        debug!(
            salient_count = tokens.len(),
            focus = focus_score.to_f64(),
            ihsan = ihsan.to_f64(),
            latency_ms = latency_ms,
            "Attention scoring completed"
        );

        AttentionResult {
            salient_tokens: tokens,
            focus_score,
            ihsan,
            snr,
            latency_ms,
        }
    }

    /// Calculate salience for a single token
    fn calculate_token_salience(
        &self,
        token: &str,
        position: usize,
        total_tokens: usize,
        context: &[String],
    ) -> f64 {
        let mut salience: f64 = 0.5; // Base salience

        // Domain keyword boost
        if let Some(&keyword_score) = self.high_salience_keywords.get(token) {
            salience = salience.max(keyword_score);
        }

        // Position bias (earlier tokens slightly more salient)
        let position_factor = 1.0 - (position as f64 / total_tokens as f64) * 0.2;
        salience *= position_factor;

        // Context relevance boost
        for ctx in context {
            if ctx.to_lowercase().contains(token) {
                salience += 0.1;
            }
        }

        // Length factor (longer meaningful words more salient)
        if token.len() >= 8 {
            salience += 0.05;
        }

        salience.clamp(0.0, 1.0)
    }

    /// Classify feature type
    fn classify_feature(&self, token: &str) -> String {
        if self.high_salience_keywords.contains_key(token) {
            "semantic".to_string()
        } else if token.chars().all(|c| c.is_numeric() || c == '.') {
            "structural".to_string()
        } else {
            "contextual".to_string()
        }
    }

    /// Calculate attention focus score
    fn calculate_focus_score(&self, tokens: &[SalientToken]) -> Fixed64 {
        if tokens.is_empty() {
            return Fixed64::ZERO;
        }

        // High focus = concentrated salience in few tokens
        let total_salience: f64 = tokens.iter().map(|t| t.salience).sum();
        let max_possible = tokens.len() as f64;

        let focus = total_salience / max_possible;
        Fixed64::from_f64(focus.clamp(0.0, 1.0))
    }

    /// Calculate Ihsan for attention stage
    fn calculate_ihsan(&self, tokens: &[SalientToken]) -> Fixed64 {
        if tokens.is_empty() {
            return Fixed64::from_f64(0.5);
        }

        let mut score = 0.8; // Base

        // Boost for semantic features
        let semantic_count = tokens.iter().filter(|t| t.feature_type == "semantic").count();
        score += (semantic_count as f64 / tokens.len() as f64) * 0.1;

        // Boost for high average salience
        let avg_salience: f64 =
            tokens.iter().map(|t| t.salience).sum::<f64>() / tokens.len() as f64;
        if avg_salience > 0.7 {
            score += 0.05;
        }

        Fixed64::from_f64(score.clamp(0.0, 1.0))
    }

    /// Calculate SNR for attention stage
    fn calculate_snr(&self, tokens: &[SalientToken], total_words: usize) -> Fixed64 {
        if total_words == 0 {
            return Fixed64::ZERO;
        }

        // Signal: salient tokens
        // Noise: non-salient tokens
        let signal = tokens.len() as f64;
        let noise = (total_words - tokens.len()) as f64;

        let snr = signal / (signal + noise + 1e-9);
        Fixed64::from_f64(snr.clamp(0.0, 1.0))
    }

    /// Get configuration
    pub fn config(&self) -> &AttentionConfig {
        &self.config
    }
}

impl Default for AttentionScorer {
    fn default() -> Self {
        Self::with_config(AttentionConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_attention_scoring() {
        let scorer = AttentionScorer::new(10);

        let result = scorer.score(
            "BIZRA implements Ihsan verification through Z3 SMT solver for safety",
            &["Context: AI safety".to_string()],
        );

        assert!(!result.salient_tokens.is_empty());
        assert!(result.focus_score > Fixed64::ZERO);
        assert!(result.ihsan > Fixed64::from_f64(0.5));
    }

    #[test]
    fn test_domain_keywords() {
        let scorer = AttentionScorer::new(10);

        let result = scorer.score("ihsan adl amanah wisdom", &[]);

        // Domain keywords should have high salience
        assert!(!result.salient_tokens.is_empty());
        assert!(result.salient_tokens[0].salience >= 0.8);
    }

    #[test]
    fn test_empty_input() {
        let scorer = AttentionScorer::new(10);

        let result = scorer.score("", &[]);

        assert!(result.salient_tokens.is_empty());
    }
}
