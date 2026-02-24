// src/arte/retention.rs - Memory Consolidation
//
// PEAK MASTERPIECE: ARTE Retention Stage
// Giants Citation: Ebbinghaus Retention, Atkinson-Shiffrin Model
//
// Implements the Retention stage of ARTE:
// - Memory consolidation from salient tokens
// - Decay modeling (Ebbinghaus forgetting curve)
// - Working memory management

use crate::fixed::Fixed64;
use super::attention::SalientToken;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tracing::{debug, instrument};

/// Configuration for memory retention
#[derive(Debug, Clone)]
pub struct RetentionConfig {
    /// Decay rate per cycle (0.0-1.0)
    pub decay_rate: f64,
    /// Minimum strength to retain
    pub retention_threshold: f64,
    /// Maximum memories to maintain
    pub max_memories: usize,
    /// Consolidation boost for repeated items
    pub repetition_boost: f64,
}

impl Default for RetentionConfig {
    fn default() -> Self {
        Self {
            decay_rate: 0.1,
            retention_threshold: 0.3,
            max_memories: 100,
            repetition_boost: 0.2,
        }
    }
}

/// A consolidated memory item
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsolidatedMemory {
    /// Memory ID
    pub id: String,
    /// Memory content
    pub content: String,
    /// Memory strength (0.0-1.0)
    pub strength: f64,
    /// Times reinforced
    pub reinforcement_count: u32,
    /// Source tokens
    pub source_tokens: Vec<String>,
    /// Created timestamp
    pub created_at: chrono::DateTime<chrono::Utc>,
    /// Last accessed timestamp
    pub last_accessed: chrono::DateTime<chrono::Utc>,
}

impl ConsolidatedMemory {
    /// Apply decay to memory strength
    pub fn apply_decay(&mut self, decay_rate: f64) {
        self.strength = (self.strength * (1.0 - decay_rate)).max(0.0);
    }

    /// Reinforce memory
    pub fn reinforce(&mut self, boost: f64) {
        self.strength = (self.strength + boost).min(1.0);
        self.reinforcement_count += 1;
        self.last_accessed = chrono::Utc::now();
    }
}

/// Result of retention consolidation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetentionResult {
    /// Consolidated memories
    pub consolidated: Vec<ConsolidatedMemory>,
    /// Number of memories decayed below threshold
    pub decayed_count: usize,
    /// Number of memories reinforced
    pub reinforced_count: usize,
    /// Ihsan score for this stage
    pub ihsan: Fixed64,
    /// SNR score for this stage
    pub snr: Fixed64,
    /// Retention latency
    pub latency_ms: u64,
}

/// Memory Retention - Implements Ebbinghaus retention model
pub struct MemoryRetention {
    /// Configuration
    config: RetentionConfig,
    /// Active memories (id -> memory)
    memories: HashMap<String, ConsolidatedMemory>,
    /// Memory counter for ID generation
    memory_counter: u64,
}

impl MemoryRetention {
    /// Create new memory retention with decay rate
    pub fn new(decay_rate: f64) -> Self {
        let mut config = RetentionConfig::default();
        config.decay_rate = decay_rate;
        Self::with_config(config)
    }

    /// Create with custom configuration
    pub fn with_config(config: RetentionConfig) -> Self {
        Self {
            config,
            memories: HashMap::new(),
            memory_counter: 0,
        }
    }

    /// Consolidate salient tokens into memories
    #[instrument(skip(self, tokens, context))]
    pub fn consolidate(&mut self, tokens: &[SalientToken], context: &[String]) -> RetentionResult {
        let start = std::time::Instant::now();

        // First, apply decay to existing memories
        let mut decayed_count = 0;
        let decay_rate = self.config.decay_rate;
        let threshold = self.config.retention_threshold;

        for memory in self.memories.values_mut() {
            memory.apply_decay(decay_rate);
        }

        // Remove memories below threshold
        let before_count = self.memories.len();
        self.memories.retain(|_, m| m.strength >= threshold);
        decayed_count = before_count - self.memories.len();

        // Process new tokens
        let mut reinforced_count = 0;
        let new_memories: Vec<ConsolidatedMemory> = tokens
            .iter()
            .filter_map(|token| {
                // Check if token matches existing memory
                let existing = self
                    .memories
                    .values_mut()
                    .find(|m| m.source_tokens.contains(&token.token));

                if let Some(memory) = existing {
                    memory.reinforce(self.config.repetition_boost);
                    reinforced_count += 1;
                    None
                } else {
                    // Create new memory
                    self.memory_counter += 1;
                    Some(self.create_memory(token, context))
                }
            })
            .collect();

        // Add new memories
        for memory in new_memories {
            if self.memories.len() < self.config.max_memories {
                self.memories.insert(memory.id.clone(), memory);
            }
        }

        // Collect consolidated memories
        let mut consolidated: Vec<ConsolidatedMemory> = self.memories.values().cloned().collect();

        // Sort by strength descending
        consolidated.sort_by(|a, b| {
            b.strength
                .partial_cmp(&a.strength)
                .unwrap_or(std::cmp::Ordering::Equal)
        });

        // Calculate scores
        let ihsan = self.calculate_ihsan(&consolidated);
        let snr = self.calculate_snr(&consolidated, tokens.len());

        let latency_ms = start.elapsed().as_millis() as u64;

        debug!(
            consolidated = consolidated.len(),
            decayed = decayed_count,
            reinforced = reinforced_count,
            ihsan = ihsan.to_f64(),
            latency_ms = latency_ms,
            "Retention consolidation completed"
        );

        RetentionResult {
            consolidated,
            decayed_count,
            reinforced_count,
            ihsan,
            snr,
            latency_ms,
        }
    }

    /// Create a new memory from a salient token
    fn create_memory(&self, token: &SalientToken, context: &[String]) -> ConsolidatedMemory {
        let now = chrono::Utc::now();

        // Build content from token and context
        let content = if context.is_empty() {
            token.token.clone()
        } else {
            format!("{}: {}", token.token, context.join(", "))
        };

        ConsolidatedMemory {
            id: format!("mem_{:08x}", self.memory_counter),
            content,
            strength: token.salience,
            reinforcement_count: 1,
            source_tokens: vec![token.token.clone()],
            created_at: now,
            last_accessed: now,
        }
    }

    /// Calculate Ihsan for retention stage
    fn calculate_ihsan(&self, memories: &[ConsolidatedMemory]) -> Fixed64 {
        if memories.is_empty() {
            return Fixed64::from_f64(0.5);
        }

        let mut score = 0.8; // Base

        // Boost for high average strength
        let avg_strength: f64 =
            memories.iter().map(|m| m.strength).sum::<f64>() / memories.len() as f64;
        if avg_strength > 0.5 {
            score += 0.1;
        }

        // Boost for reinforced memories
        let reinforced_ratio = memories
            .iter()
            .filter(|m| m.reinforcement_count > 1)
            .count() as f64
            / memories.len() as f64;
        score += reinforced_ratio * 0.05;

        Fixed64::from_f64(score.clamp(0.0, 1.0))
    }

    /// Calculate SNR for retention stage
    fn calculate_snr(&self, memories: &[ConsolidatedMemory], input_tokens: usize) -> Fixed64 {
        if input_tokens == 0 {
            return Fixed64::ZERO;
        }

        // Signal: high-strength memories
        let signal = memories.iter().filter(|m| m.strength >= 0.5).count() as f64;
        // Noise: low-strength or decayed
        let noise = (memories.len() - signal as usize) as f64 + 1.0;

        let snr = signal / (signal + noise + 1e-9);
        Fixed64::from_f64(snr.clamp(0.0, 1.0))
    }

    /// Get memory count
    pub fn memory_count(&self) -> usize {
        self.memories.len()
    }

    /// Get configuration
    pub fn config(&self) -> &RetentionConfig {
        &self.config
    }

    /// Clear all memories
    pub fn clear(&mut self) {
        self.memories.clear();
    }
}

impl Default for MemoryRetention {
    fn default() -> Self {
        Self::with_config(RetentionConfig::default())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_tokens() -> Vec<SalientToken> {
        vec![
            SalientToken {
                token: "ihsan".to_string(),
                salience: 0.9,
                feature_type: "semantic".to_string(),
                position: 0,
            },
            SalientToken {
                token: "verification".to_string(),
                salience: 0.8,
                feature_type: "semantic".to_string(),
                position: 1,
            },
        ]
    }

    #[test]
    fn test_memory_consolidation() {
        let mut retention = MemoryRetention::new(0.1);
        let tokens = create_test_tokens();

        let result = retention.consolidate(&tokens, &["AI safety".to_string()]);

        assert!(!result.consolidated.is_empty());
        assert!(result.ihsan > Fixed64::from_f64(0.5));
    }

    #[test]
    fn test_memory_decay() {
        let mut retention = MemoryRetention::new(0.5); // High decay rate
        let tokens = create_test_tokens();

        // First consolidation
        retention.consolidate(&tokens, &[]);

        // Second consolidation with new tokens (triggers decay)
        let result = retention.consolidate(&[], &[]);

        // Some memories should have decayed
        assert!(result.consolidated.iter().all(|m| m.strength < 0.9));
    }

    #[test]
    fn test_memory_reinforcement() {
        let mut retention = MemoryRetention::new(0.1);
        let tokens = create_test_tokens();

        // First consolidation
        retention.consolidate(&tokens, &[]);

        // Second consolidation with same tokens
        let result = retention.consolidate(&tokens, &[]);

        // Should have reinforced existing memories
        assert!(result.reinforced_count > 0);
    }
}
