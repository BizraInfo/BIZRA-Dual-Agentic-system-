// src/wisdom_verifier.rs - Wisdom Verification Pipeline
//
// PEAK MASTERPIECE: Phase D - PoI-SNR Wisdom Integration
// Giants Citation: Howard Information Value Theory, Hurwicz Mechanism Design, Zakat Economics
//
// Connects PoI to SNR for verifiable wisdom generation:
// - Wisdom verification pipeline
// - SNR-PoI correlation tracking
// - FATE compliance for wisdom receipts
//
// Targets:
// - PoI-SNR correlation >= 0.7
// - Wisdom receipts pass FATE verification

use crate::fixed::Fixed64;
use crate::poi::{ImpactScore, PoIEngine};
use crate::snr::SNREngine;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use tracing::{debug, info, instrument, warn};

/// Wisdom verification configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WisdomConfig {
    /// Minimum SNR for wisdom verification
    pub snr_floor: f64,
    /// Minimum Ihsan for wisdom verification
    pub ihsan_floor: f64,
    /// PoI-SNR correlation target
    pub correlation_target: f64,
    /// Enable FATE verification
    pub fate_enabled: bool,
    /// Maximum verification latency
    pub max_latency_ms: u64,
}

impl Default for WisdomConfig {
    fn default() -> Self {
        Self {
            snr_floor: 0.85,
            ihsan_floor: 0.90,
            correlation_target: 0.70,
            fate_enabled: true,
            max_latency_ms: 100,
        }
    }
}

/// Wisdom verification result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WisdomVerification {
    /// Verification ID
    pub verification_id: String,
    /// Input artifact ID
    pub artifact_id: String,
    /// SNR score
    pub snr: Fixed64,
    /// Ihsan score
    pub ihsan: Fixed64,
    /// PoI impact score
    pub poi_score: Fixed64,
    /// Wisdom verified?
    pub verified: bool,
    /// FATE compliance status
    pub fate_compliant: bool,
    /// Verification reason
    pub reason: String,
    /// Verification timestamp
    pub timestamp: chrono::DateTime<chrono::Utc>,
    /// Verification latency in milliseconds
    pub latency_ms: u64,
}

impl WisdomVerification {
    /// Check if verification passed all gates
    pub fn passed(&self) -> bool {
        self.verified && self.fate_compliant
    }
}

/// Wisdom correlation tracker
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CorrelationTracker {
    /// SNR-PoI pairs for correlation calculation
    snr_poi_pairs: Vec<(f64, f64)>,
    /// Running correlation estimate
    current_correlation: f64,
    /// Sample count
    sample_count: usize,
}

impl Default for CorrelationTracker {
    fn default() -> Self {
        Self::new()
    }
}

impl CorrelationTracker {
    /// Create new correlation tracker
    pub fn new() -> Self {
        Self {
            snr_poi_pairs: Vec::new(),
            current_correlation: 0.0,
            sample_count: 0,
        }
    }

    /// Add a sample and update correlation
    pub fn add_sample(&mut self, snr: f64, poi: f64) {
        self.snr_poi_pairs.push((snr, poi));
        self.sample_count += 1;

        // Recalculate correlation if enough samples
        if self.sample_count >= 10 {
            self.current_correlation = self.calculate_pearson_correlation();
        }
    }

    /// Calculate Pearson correlation coefficient
    fn calculate_pearson_correlation(&self) -> f64 {
        let n = self.snr_poi_pairs.len() as f64;
        if n < 2.0 {
            return 0.0;
        }

        let sum_x: f64 = self.snr_poi_pairs.iter().map(|(x, _)| x).sum();
        let sum_y: f64 = self.snr_poi_pairs.iter().map(|(_, y)| y).sum();
        let sum_xy: f64 = self.snr_poi_pairs.iter().map(|(x, y)| x * y).sum();
        let sum_x2: f64 = self.snr_poi_pairs.iter().map(|(x, _)| x * x).sum();
        let sum_y2: f64 = self.snr_poi_pairs.iter().map(|(_, y)| y * y).sum();

        let numerator = n * sum_xy - sum_x * sum_y;
        let denominator =
            ((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y)).sqrt();

        if denominator.abs() < 1e-9 {
            return 0.0;
        }

        (numerator / denominator).clamp(-1.0, 1.0)
    }

    /// Get current correlation
    pub fn correlation(&self) -> f64 {
        self.current_correlation
    }

    /// Get sample count
    pub fn sample_count(&self) -> usize {
        self.sample_count
    }
}

/// Wisdom Verifier - Pipeline for verifiable wisdom generation
pub struct WisdomVerifier {
    /// Configuration
    config: WisdomConfig,
    /// PoI engine reference
    poi_engine: PoIEngine,
    /// Correlation tracker
    correlation_tracker: CorrelationTracker,
    /// Verification counter
    verification_counter: u64,
}

impl WisdomVerifier {
    /// Create a new wisdom verifier
    pub fn new() -> Self {
        Self::with_config(WisdomConfig::default())
    }

    /// Create with custom configuration
    pub fn with_config(config: WisdomConfig) -> Self {
        Self {
            config,
            poi_engine: PoIEngine::new(),
            correlation_tracker: CorrelationTracker::new(),
            verification_counter: 0,
        }
    }

    /// Verify wisdom for an artifact
    #[instrument(skip(self, content))]
    pub fn verify(
        &mut self,
        artifact_id: &str,
        content: &str,
        ihsan_scores: &BTreeMap<String, f64>,
    ) -> WisdomVerification {
        let start = std::time::Instant::now();
        self.verification_counter += 1;

        // Calculate SNR
        let snr = self.calculate_snr(content);
        let snr_f64 = snr.to_f64();

        // Calculate overall Ihsan from scores
        let ihsan_total = if ihsan_scores.is_empty() {
            0.85 // Default
        } else {
            ihsan_scores.values().sum::<f64>() / ihsan_scores.len() as f64
        };
        let ihsan = Fixed64::from_f64(ihsan_total);

        // Calculate PoI
        let artifact_quality = Fixed64::from_f64(ihsan_total); // Use Ihsan as quality proxy
        let poi_impact = self
            .poi_engine
            .calculate_impact(artifact_quality, ihsan, snr);
        let poi_score = poi_impact.total;

        // Track correlation
        self.correlation_tracker
            .add_sample(snr_f64, poi_score.to_f64());

        // Check SNR floor
        let snr_passed = snr >= Fixed64::from_f64(self.config.snr_floor);

        // Check Ihsan floor
        let ihsan_passed = ihsan >= Fixed64::from_f64(self.config.ihsan_floor);

        // FATE compliance check (simplified - in production would call Z3)
        let fate_compliant = self.check_fate_compliance(snr, ihsan, poi_score);

        // Determine verification status
        let verified = snr_passed && ihsan_passed;

        let reason = if !snr_passed {
            format!(
                "SNR {} below floor {}",
                snr_f64,
                self.config.snr_floor
            )
        } else if !ihsan_passed {
            format!(
                "Ihsan {} below floor {}",
                ihsan_total,
                self.config.ihsan_floor
            )
        } else if !fate_compliant {
            "FATE verification failed".to_string()
        } else {
            "Wisdom verified".to_string()
        };

        let latency_ms = start.elapsed().as_millis() as u64;

        // Log if latency exceeded
        if latency_ms > self.config.max_latency_ms {
            warn!(
                latency_ms = latency_ms,
                target = self.config.max_latency_ms,
                "Wisdom verification exceeded latency target"
            );
        }

        let verification = WisdomVerification {
            verification_id: format!(
                "wis_{:08x}_{:04x}",
                chrono::Utc::now().timestamp(),
                self.verification_counter
            ),
            artifact_id: artifact_id.to_string(),
            snr,
            ihsan,
            poi_score,
            verified,
            fate_compliant,
            reason,
            timestamp: chrono::Utc::now(),
            latency_ms,
        };

        if verified {
            info!(
                verification_id = %verification.verification_id,
                snr = snr_f64,
                ihsan = ihsan_total,
                poi = poi_score.to_f64(),
                correlation = self.correlation_tracker.correlation(),
                "Wisdom verified"
            );
        } else {
            debug!(
                verification_id = %verification.verification_id,
                reason = %verification.reason,
                "Wisdom verification failed"
            );
        }

        verification
    }

    /// Calculate SNR for content
    fn calculate_snr(&self, content: &str) -> Fixed64 {
        let words: Vec<&str> = content.split_whitespace().collect();
        if words.is_empty() {
            return Fixed64::ZERO;
        }

        let unique: std::collections::HashSet<_> =
            words.iter().map(|w| w.to_lowercase()).collect();
        let signal = unique.len() as f64 / words.len() as f64;

        let filler_words = ["the", "a", "an", "is", "are", "was", "were", "be", "been", "being"];
        let filler_count = words
            .iter()
            .filter(|w| filler_words.contains(&w.to_lowercase().as_str()))
            .count();
        let noise = filler_count as f64 / words.len() as f64;

        let snr = signal / (signal + noise + 1e-9);
        Fixed64::from_f64(snr.clamp(0.0, 1.0))
    }

    /// FATE compliance check (simplified)
    fn check_fate_compliance(&self, snr: Fixed64, ihsan: Fixed64, poi: Fixed64) -> bool {
        if !self.config.fate_enabled {
            return true;
        }

        // Basic compliance: All scores must be positive and reasonable
        snr >= Fixed64::ZERO
            && ihsan >= Fixed64::ZERO
            && poi >= Fixed64::ZERO
            && snr <= Fixed64::ONE
            && ihsan <= Fixed64::ONE
    }

    /// Get current PoI-SNR correlation
    pub fn correlation(&self) -> f64 {
        self.correlation_tracker.correlation()
    }

    /// Check if correlation meets target
    pub fn correlation_meets_target(&self) -> bool {
        self.correlation_tracker.correlation() >= self.config.correlation_target
    }

    /// Get verification count
    pub fn verification_count(&self) -> u64 {
        self.verification_counter
    }

    /// Get configuration
    pub fn config(&self) -> &WisdomConfig {
        &self.config
    }

    /// Get correlation tracker
    pub fn correlation_tracker(&self) -> &CorrelationTracker {
        &self.correlation_tracker
    }
}

impl Default for WisdomVerifier {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_wisdom_verification() {
        let mut verifier = WisdomVerifier::new();

        let ihsan_scores: BTreeMap<String, f64> = [
            ("correctness".to_string(), 0.95),
            ("safety".to_string(), 0.92),
            ("user_benefit".to_string(), 0.90),
        ]
        .into_iter()
        .collect();

        let result = verifier.verify(
            "art1",
            "BIZRA implements formal verification through Z3 SMT solver for Ihsan compliance",
            &ihsan_scores,
        );

        assert!(result.snr > Fixed64::from_f64(0.5));
        assert!(result.ihsan > Fixed64::from_f64(0.5));
    }

    #[test]
    fn test_correlation_tracking() {
        let mut tracker = CorrelationTracker::new();

        // Add positively correlated samples
        for i in 0..20 {
            let snr = 0.5 + (i as f64) * 0.02;
            let poi = 0.5 + (i as f64) * 0.02;
            tracker.add_sample(snr, poi);
        }

        // Should have strong positive correlation
        assert!(tracker.correlation() > 0.8);
    }

    #[test]
    fn test_snr_calculation() {
        let verifier = WisdomVerifier::new();

        // High quality content
        let high_snr = verifier.calculate_snr(
            "BIZRA implements formal verification through Z3 SMT solver integration",
        );
        assert!(high_snr > Fixed64::from_f64(0.5));

        // Low quality content
        let low_snr = verifier.calculate_snr("the the the is is is a a a");
        assert!(low_snr < Fixed64::from_f64(0.5));
    }

    #[test]
    fn test_fate_compliance() {
        let verifier = WisdomVerifier::new();

        // Valid scores should pass
        assert!(verifier.check_fate_compliance(
            Fixed64::from_f64(0.9),
            Fixed64::from_f64(0.95),
            Fixed64::from_f64(0.85),
        ));

        // Negative scores should fail
        assert!(!verifier.check_fate_compliance(
            Fixed64::from_f64(-0.1),
            Fixed64::from_f64(0.95),
            Fixed64::from_f64(0.85),
        ));
    }
}
