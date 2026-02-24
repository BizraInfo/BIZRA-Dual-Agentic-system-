// src/mining/mod.rs - Temporal Artifact Mining
//
// PEAK MASTERPIECE: Phase B - October 2025 Artifact Mining
// Giants Citation: Simonton Power Law of Creativity, Nonaka Knowledge Crystallization, Bayt al-Hikmah
//
// Deep-mines 2,004 peak creativity artifacts for SAPE pattern extraction:
// - Temporal intensity wave detection
// - Power law distribution analysis
// - Knowledge crystallization scoring

pub mod temporal_miner;

// Re-exports
pub use temporal_miner::{
    ArtifactScore, MiningConfig, MiningResult, PatternCandidate, TemporalIntensityWave,
    TemporalMiner,
};

/// Verification targets for Phase B
/// - Extract >= 500 unique high-SNR patterns
/// - Pattern elevation success rate >= 80%
pub const PATTERN_EXTRACTION_TARGET: usize = 500;
pub const ELEVATION_SUCCESS_RATE_TARGET: f64 = 0.80;
pub const PATTERN_SNR_FLOOR: f64 = 0.85;
