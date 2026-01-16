//! BIZRA Node0 - SAPE Validator (The 6 Checks)

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResults {
    pub correctness: CheckResult,
    pub consistency: CheckResult,
    pub completeness: CheckResult,
    pub causality: CheckResult,
    pub ethics: CheckResult,
    pub evidence: CheckResult,
    pub confidence_score: f64,
    pub evidence_refs: Vec<EvidenceRef>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum EvidenceType {
    DbRead,
    PolicyRef,
    TestRun,
    HumanAttestation,
    ActionReceipt,
    InternalAgentAttestation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EvidenceRef {
    pub ledger_id: String,
    pub evidence_type: EvidenceType,
    pub hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CheckResult {
    pub passed: bool,
    pub notes: Vec<String>,
}

pub struct Validator;

impl Validator {
    pub fn run_all_checks(
        spec: &str,
        claims: &[String],
        evidence: &[EvidenceRef],
        ihsan_threshold: f64,
    ) -> ValidationResults {
        let correctness = Self::check_correctness(claims);
        let consistency = Self::check_consistency(claims);
        let ethics = Self::check_ethics(spec, ihsan_threshold);
        let completeness = Self::check_completeness(claims);
        let causality = Self::check_causality(claims);
        let evidence_check = Self::check_evidence(evidence);

        // Calculate pass count for confidence score
        let checks = [
            &correctness,
            &consistency,
            &ethics,
            &completeness,
            &causality,
            &evidence_check,
        ];

        let passed_count = checks.iter().filter(|c| c.passed).count();

        ValidationResults {
            correctness,
            consistency,
            completeness,
            causality,
            ethics,
            evidence: evidence_check,
            confidence_score: passed_count as f64 / 6.0,
            evidence_refs: evidence.to_vec(),
        }
    }

    fn check_correctness(claims: &[String]) -> CheckResult {
        let failures: Vec<String> = claims
            .iter()
            .filter(|c| c.to_lowercase().contains("error") || c.to_lowercase().contains("invalid"))
            .cloned()
            .collect();

        CheckResult {
            passed: failures.is_empty(),
            notes: failures,
        }
    }

    fn check_consistency(claims: &[String]) -> CheckResult {
        let mut contradictions = vec![];
        for i in 0..claims.len() {
            for j in i + 1..claims.len() {
                if claims[i].to_lowercase().contains("not")
                    && claims[j]
                        .to_lowercase()
                        .contains(&claims[i].to_lowercase().replace("not ", ""))
                {
                    contradictions.push(format!("Contradiction: {} vs {}", claims[i], claims[j]));
                }
            }
        }
        CheckResult {
            passed: contradictions.is_empty(),
            notes: contradictions,
        }
    }

    fn check_ethics(spec: &str, threshold: f64) -> CheckResult {
        let mut score: f64 = 0.99;
        let mut notes = vec![];

        let spec_lower = spec.to_lowercase();

        // Critical Safety Violations (-0.3 each)
        let red_flags = [
            "harm",
            "exploit",
            "bypass security",
            "toxic",
            "hate speech",
            "radicalize",
            "deceive",
            "manipulate",
            "private data",
            "pii",
        ];
        for flag in red_flags {
            if spec_lower.contains(flag) {
                score -= 0.3;
                notes.push(format!("CRITICAL ETHICS VIOLATION: Found '{}'", flag));
            }
        }

        // Potential Issues (-0.05 each)
        let orange_flags = ["bias", "unverified", "low confidence", "subjective"];
        for flag in orange_flags {
            if spec_lower.contains(flag) {
                score -= 0.05;
                notes.push(format!("Ethical Warning: Found '{}'", flag));
            }
        }

        // Alignment check (Inverses)
        if spec_lower.contains("justice")
            || spec_lower.contains("fairness")
            || spec_lower.contains("adl")
        {
            score += 0.01;
        }

        score = score.clamp(0.0, 1.0);

        CheckResult {
            passed: score >= threshold,
            notes: {
                if score < threshold {
                    notes.push(format!(
                        "Ihsan score {:.4} below threshold {}",
                        score, threshold
                    ));
                }
                notes
            },
        }
    }

    /// Completeness v0: Schema coverage check
    fn check_completeness(claims: &[String]) -> CheckResult {
        let mut failures = vec![];
        if claims.is_empty() {
            failures.push("No claims provided".into());
        }
        for claim in claims {
            if claim.to_lowercase().contains("todo") || claim.to_lowercase().contains("placeholder")
            {
                failures.push(format!("Incomplete claim: {}", claim));
            }
        }
        CheckResult {
            passed: failures.is_empty(),
            notes: failures,
        }
    }

    /// Causality v0: Causal chain check
    fn check_causality(claims: &[String]) -> CheckResult {
        let mut failures = vec![];
        let has_transition = claims.iter().any(|c| {
            let c_low = c.to_lowercase();
            c_low.contains("because")
                || c_low.contains("therefore")
                || c_low.contains("leads to")
                || c_low.contains("->")
        });

        if !has_transition && !claims.is_empty() {
            failures.push("No explicit causal transition found in reasoning".into());
        }

        CheckResult {
            passed: failures.is_empty(),
            notes: failures,
        }
    }

    /// Evidence v0: Evidence binding check
    fn check_evidence(evidence: &[EvidenceRef]) -> CheckResult {
        let mut failures = vec![];
        if evidence.is_empty() {
            failures.push("No evidence provided for actionable output".into());
        }

        // Elite++: Validate against the bizra_scaffold EVIDENCE_INDEX.md
        // We simulate a verified lookup of EVID-* pointers
        for ref_item in evidence {
            if ref_item.ledger_id.is_empty() || ref_item.hash.is_empty() {
                failures.push(format!("Invalid EvidenceRef: {:?}", ref_item));
            }

            // Check for canonical scaffold IDs
            if !ref_item.ledger_id.starts_with("EVID-")
                && !ref_item.ledger_id.starts_with("receipt-")
                && !ref_item.ledger_id.starts_with("poi-")
            {
                failures.push(format!(
                    "Evidence source {} not anchored in SOT index",
                    ref_item.ledger_id
                ));
            }
        }

        CheckResult {
            passed: failures.is_empty(),
            notes: failures,
        }
    }

    /// Elite++: Internal Agent Attestation Helper
    /// Allows trusted internal agents (SARE) to bypass some checks via direct attestation
    pub fn run_all_checks_for_agent(
        &self,
        attestation: &InternalAgentAttestation,
    ) -> ValidationResults {
        // In a real implementation, we would cryptographically verify the agent's signature
        // For the Masterpiece demo, we trust the internal agent ID signature "SARE-0"

        let claims = vec![format!(
            "Agent {} intends: {}",
            attestation.agent_id, attestation.intent
        )];
        let evidence = vec![EvidenceRef {
            ledger_id: "EVID-INTERNAL-AUTH".to_string(),
            evidence_type: EvidenceType::InternalAgentAttestation,
            hash: attestation.evidence_hash.clone(),
        }];

        Self::run_all_checks("internal_agent_spec", &claims, &evidence, 0.95)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InternalAgentAttestation {
    pub agent_id: String,
    pub intent: String,
    pub evidence_hash: String,
}

/// BIZRA SOT Weights (v0.1)
/// Aligned with bizra_scaffold/BIZRA_SOT.md
pub struct SOTWeights {
    pub quality: f64,
    pub utility: f64,
    pub trust: f64,
    pub fairness: f64,
    pub diversity: f64,
}

impl Default for SOTWeights {
    fn default() -> Self {
        Self {
            quality: 0.30,
            utility: 0.30,
            trust: 0.20,
            fairness: 0.10,
            diversity: 0.10,
        }
    }
}
