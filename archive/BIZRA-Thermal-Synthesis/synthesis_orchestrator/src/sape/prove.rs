//! SAPE v1.∞ Prove Module - The 6 Checks (Fail-Closed)
//!
//! Implements deterministic validation with SNR enforcement.

use super::schema::*;

pub struct Validator;

impl Validator {
    /// Run all 6 checks: Correctness, Consistency, Completeness, Causality, Ethics, Evidence
    pub fn run_all_checks(
        spec: &str,
        evidence: &[EvidenceRef],
        claims: &[Claim],
        ihsan_threshold: f64,
    ) -> Result<ValidationResults, String> {
        let correctness = Self::check_correctness(spec, claims);
        let consistency = Self::check_consistency(spec, claims);
        let completeness = Self::check_completeness(spec);
        let causality = Self::check_causality(spec);
        let ethics = Self::check_ethics(spec, ihsan_threshold);
        let evidence_check = Self::check_evidence(claims, evidence);

        // SNR Metrics
        let evidence_coverage = Self::calculate_evidence_coverage(claims, evidence);
        let contradiction_pressure = Self::calculate_contradiction_pressure(claims);
        let compression_ratio = Self::calculate_compression_ratio(spec);

        // Overall confidence (weighted average)
        let confidence_score = Self::calculate_confidence(&[
            correctness.passed,
            consistency.passed,
            completeness.passed,
            causality.passed,
            ethics.passed,
            evidence_check.passed,
        ]);

        Ok(ValidationResults {
            correctness,
            consistency,
            completeness,
            causality,
            ethics,
            evidence: evidence_check,
            evidence_coverage,
            contradiction_pressure,
            compression_ratio,
            confidence_score,
        })
    }

    // ============================================
    // THE 6 CHECKS
    // ============================================

    fn check_correctness(_spec: &str, claims: &[Claim]) -> CheckResult {
        let low_confidence = claims.iter().filter(|c| c.confidence <= 0.5).count();

        CheckResult {
            passed: low_confidence == 0,
            notes: if low_confidence > 0 {
                vec![format!("{} claims with low confidence", low_confidence)]
            } else {
                vec![]
            },
        }
    }

    fn check_consistency(_spec: &str, claims: &[Claim]) -> CheckResult {
        let mut contradictions = vec![];

        for (i, claim1) in claims.iter().enumerate() {
            for claim2 in claims.iter().skip(i + 1) {
                if Self::are_contradictory(&claim1.text, &claim2.text) {
                    contradictions.push(format!(
                        "Contradiction: '{}' vs '{}'",
                        claim1.text, claim2.text
                    ));
                }
            }
        }

        CheckResult {
            passed: contradictions.is_empty(),
            notes: contradictions,
        }
    }

    fn check_completeness(spec: &str) -> CheckResult {
        let has_edge_cases =
            spec.contains("edge") || spec.contains("boundary") || spec.contains("failure");

        CheckResult {
            passed: has_edge_cases,
            notes: if !has_edge_cases {
                vec!["No edge case handling mentioned".to_string()]
            } else {
                vec![]
            },
        }
    }

    fn check_causality(spec: &str) -> CheckResult {
        let has_trace =
            spec.contains("because") || spec.contains("therefore") || spec.contains("→");

        CheckResult {
            passed: has_trace,
            notes: if !has_trace {
                vec!["No causal trace found".to_string()]
            } else {
                vec![]
            },
        }
    }

    fn check_ethics(spec: &str, threshold: f64) -> CheckResult {
        let ihsan_score = Self::calculate_ihsan_score(spec);

        CheckResult {
            passed: ihsan_score >= threshold,
            notes: if ihsan_score < threshold {
                vec![format!(
                    "Ihsān score {:.3} below threshold {:.3}",
                    ihsan_score, threshold
                )]
            } else {
                vec![]
            },
        }
    }

    fn check_evidence(claims: &[Claim], evidence: &[EvidenceRef]) -> CheckResult {
        let mut uncovered = vec![];

        for claim in claims {
            if claim.evidence_refs.is_empty() {
                uncovered.push(claim.text.clone());
            } else {
                for &ref_idx in &claim.evidence_refs {
                    if ref_idx >= evidence.len() {
                        uncovered.push(format!("Invalid evidence ref {} in claim", ref_idx));
                    }
                }
            }
        }

        CheckResult {
            passed: uncovered.is_empty(),
            notes: uncovered,
        }
    }

    // ============================================
    // SNR METRICS
    // ============================================

    fn calculate_evidence_coverage(claims: &[Claim], _evidence: &[EvidenceRef]) -> f64 {
        if claims.is_empty() {
            return 1.0;
        }
        let covered = claims
            .iter()
            .filter(|c| !c.evidence_refs.is_empty())
            .count();
        covered as f64 / claims.len() as f64
    }

    fn calculate_contradiction_pressure(claims: &[Claim]) -> f64 {
        if claims.len() < 2 {
            return 0.0;
        }
        let mut contradictions = 0;
        for (i, claim1) in claims.iter().enumerate() {
            for claim2 in claims.iter().skip(i + 1) {
                if Self::are_contradictory(&claim1.text, &claim2.text) {
                    contradictions += 1;
                }
            }
        }
        contradictions as f64 / (claims.len() * (claims.len() - 1) / 2) as f64
    }

    fn calculate_compression_ratio(spec: &str) -> f64 {
        let words: Vec<&str> = spec.split_whitespace().collect();
        if words.is_empty() {
            return 0.0;
        }
        let unique: std::collections::HashSet<_> = words.iter().collect();
        unique.len() as f64 / words.len() as f64
    }

    fn calculate_ihsan_score(spec: &str) -> f64 {
        let mut score: f64 = 0.95;
        if spec.contains("harm") || spec.contains("unsafe") {
            score -= 0.1;
        }
        if spec.contains("deception") || spec.contains("mislead") {
            score -= 0.2;
        }
        score.max(0.0)
    }

    fn are_contradictory(text1: &str, text2: &str) -> bool {
        (text1.contains("not") && text2.contains(&text1.replace("not", "")))
            || (text2.contains("not") && text1.contains(&text2.replace("not", "")))
    }

    fn calculate_confidence(checks: &[bool]) -> f64 {
        let passed = checks.iter().filter(|&&c| c).count();
        passed as f64 / checks.len() as f64
    }
}
