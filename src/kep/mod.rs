// src/kep/mod.rs - Knowledge Explosion Bridge (KEP)
//
// PEAK MASTERPIECE: Phase C - Cross-Domain Synergy Detection
// Giants Citation: Nicolescu Transdisciplinary Research, Fauconnier Concept Blending, Usul al-Fiqh
//
// Detects cross-domain synergies across 6 domains:
// 1. Islamic scholarship
// 2. Distributed Systems
// 3. Formal Methods
// 4. Economics
// 5. Cognitive Science
// 6. AI/ML
//
// Targets:
// - Detect >= 100 cross-domain synergies
// - False positive rate < 10%

pub mod synergy;

// Re-exports
pub use synergy::{
    CrossDomainLink, DomainType, KnowledgeBridge, SynergyCandidate, SynergyConfig, SynergyResult,
};

/// Verification targets for Phase C
/// - Detect >= 100 cross-domain synergies
/// - False positive rate < 10%
pub const SYNERGY_DETECTION_TARGET: usize = 100;
pub const FALSE_POSITIVE_RATE_MAX: f64 = 0.10;
