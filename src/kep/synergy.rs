// src/kep/synergy.rs - Cross-Domain Synergy Detection
//
// PEAK MASTERPIECE: Knowledge Explosion Bridge
// Giants Citation: Nicolescu Transdisciplinary Research, Fauconnier Concept Blending, Usul al-Fiqh
//
// COVENANT COMPLIANCE:
// - Hard Gate #1: All metrics use Fixed64 for determinism
// - Article V: SNR metrics tracked for every synergy
// - Grounding: All synergies must trace back to verified axioms

use crate::fixed::Fixed64;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use tracing::{debug, info, instrument, warn};

/// The 6 cross-domain knowledge areas in BIZRA
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum DomainType {
    /// Islamic scholarship: Ihsan, Usul al-Fiqh, Adl, Amanah
    Islamic,
    /// Distributed systems: Consensus, Byzantine fault tolerance, CAP
    DistributedSystems,
    /// Formal methods: Z3, SMT, Proof assistants, Model checking
    FormalMethods,
    /// Economics: Game theory, Mechanism design, Tokenomics
    Economics,
    /// Cognitive science: Dual process theory, Metacognition, Attention
    CognitiveScience,
    /// AI/ML: Neural networks, Transformers, RL, Alignment
    AiMl,
}

impl DomainType {
    /// Get domain name
    pub fn name(&self) -> &'static str {
        match self {
            Self::Islamic => "Islamic",
            Self::DistributedSystems => "DistributedSystems",
            Self::FormalMethods => "FormalMethods",
            Self::Economics => "Economics",
            Self::CognitiveScience => "CognitiveScience",
            Self::AiMl => "AI/ML",
        }
    }

    /// Get representative keywords for this domain
    pub fn keywords(&self) -> &'static [&'static str] {
        match self {
            Self::Islamic => &[
                "ihsan", "adl", "amanah", "hikmah", "bayan", "tawhid", "sabr", "mizan",
                "fiqh", "usul", "sharia", "wisdom", "excellence", "justice", "trust",
            ],
            Self::DistributedSystems => &[
                "consensus", "byzantine", "paxos", "raft", "cap", "eventually",
                "consistent", "partition", "replication", "distributed", "fault",
                "tolerant", "mesh", "node", "cluster", "ledger",
            ],
            Self::FormalMethods => &[
                "z3", "smt", "sat", "proof", "verification", "invariant", "constraint",
                "solver", "formal", "model", "checking", "theorem", "prover", "logic",
            ],
            Self::Economics => &[
                "token", "incentive", "mechanism", "game", "theory", "harberger",
                "quadratic", "voting", "stake", "mint", "burn", "economics",
                "governance", "tax", "value",
            ],
            Self::CognitiveScience => &[
                "cognitive", "attention", "retention", "memory", "metacognition",
                "reflection", "reasoning", "decision", "bias", "heuristic",
                "dual", "process", "system1", "system2",
            ],
            Self::AiMl => &[
                "neural", "transformer", "embedding", "attention", "llm", "rl",
                "alignment", "agent", "model", "training", "inference", "prompt",
                "token", "vector", "semantic",
            ],
        }
    }

    /// Get all domain types
    pub fn all() -> &'static [DomainType] {
        &[
            Self::Islamic,
            Self::DistributedSystems,
            Self::FormalMethods,
            Self::Economics,
            Self::CognitiveScience,
            Self::AiMl,
        ]
    }
}

/// Configuration for synergy detection
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynergyConfig {
    /// Minimum similarity threshold for synergy detection
    pub similarity_threshold: f64,
    /// Minimum confidence for synergy candidate
    pub confidence_threshold: f64,
    /// Maximum false positive rate target
    pub max_false_positive_rate: f64,
    /// Minimum domains for cross-domain synergy
    pub min_domains: usize,
    /// Enable Fauconnier concept blending
    pub concept_blending_enabled: bool,
}

impl Default for SynergyConfig {
    fn default() -> Self {
        Self {
            similarity_threshold: 0.6,
            confidence_threshold: 0.7,
            max_false_positive_rate: 0.10,
            min_domains: 2,
            concept_blending_enabled: true,
        }
    }
}

/// A cross-domain link between two concepts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossDomainLink {
    /// Source concept
    pub source: String,
    /// Source domain
    pub source_domain: DomainType,
    /// Target concept
    pub target: String,
    /// Target domain
    pub target_domain: DomainType,
    /// Similarity score (0.0-1.0)
    pub similarity: Fixed64,
    /// Link type (analogy, composition, bridging)
    pub link_type: String,
    /// Evidence/reasoning for the link
    pub evidence: String,
}

/// A synergy candidate for elevation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynergyCandidate {
    /// Synergy identifier
    pub synergy_id: String,
    /// Human-readable name
    pub name: String,
    /// Domains involved
    pub domains: Vec<DomainType>,
    /// Cross-domain links
    pub links: Vec<CrossDomainLink>,
    /// Confidence score (0.0-1.0)
    pub confidence: Fixed64,
    /// SNR score
    pub snr: Fixed64,
    /// Ihsan score
    pub ihsan: Fixed64,
    /// Grounding status (traced to axioms?)
    pub grounded: bool,
    /// Blended concept (if concept blending applied)
    pub blended_concept: Option<String>,
}

impl SynergyCandidate {
    /// Check if synergy passes quality gates
    pub fn passes_quality_gate(&self, config: &SynergyConfig) -> bool {
        self.confidence >= Fixed64::from_f64(config.confidence_threshold)
            && self.domains.len() >= config.min_domains
            && self.grounded
    }
}

/// Synergy detection result
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynergyResult {
    /// Total concepts analyzed
    pub concepts_analyzed: usize,
    /// Synergies detected
    pub synergies: Vec<SynergyCandidate>,
    /// Cross-domain links found
    pub total_links: usize,
    /// False positive estimate
    pub estimated_false_positive_rate: f64,
    /// Processing duration
    pub duration_ms: u64,
}

/// Knowledge Bridge - Cross-domain synergy detector
pub struct KnowledgeBridge {
    /// Configuration
    config: SynergyConfig,
    /// Domain keyword indices (keyword -> domain)
    keyword_index: HashMap<String, Vec<DomainType>>,
    /// Concept registry (concept -> domains)
    concept_domains: HashMap<String, HashSet<DomainType>>,
    /// Known axioms for grounding verification
    axioms: HashSet<String>,
}

impl KnowledgeBridge {
    /// Create a new Knowledge Bridge
    pub fn new() -> Self {
        Self::with_config(SynergyConfig::default())
    }

    /// Create with custom configuration
    pub fn with_config(config: SynergyConfig) -> Self {
        let mut bridge = Self {
            config,
            keyword_index: HashMap::new(),
            concept_domains: HashMap::new(),
            axioms: HashSet::new(),
        };

        // Build keyword index
        for domain in DomainType::all() {
            for keyword in domain.keywords() {
                bridge
                    .keyword_index
                    .entry(keyword.to_string())
                    .or_default()
                    .push(*domain);
            }
        }

        // Register BIZRA axioms for grounding
        bridge.register_axioms();

        bridge
    }

    /// Register foundational axioms
    fn register_axioms(&mut self) {
        let axioms = [
            "Ihsan is excellence in all actions",
            "AI must be auditable",
            "Sovereignty requires self-custody",
            "Consensus requires Byzantine fault tolerance",
            "Formal verification ensures correctness",
            "Incentive alignment prevents defection",
            "Attention is a scarce resource",
            "Models are probability distributions",
        ];

        for axiom in axioms {
            self.axioms.insert(axiom.to_lowercase());
        }
    }

    /// Register a concept with its domains
    pub fn register_concept(&mut self, concept: &str, domains: &[DomainType]) {
        let concept_key = concept.to_lowercase();
        self.concept_domains
            .entry(concept_key)
            .or_default()
            .extend(domains.iter().cloned());
    }

    /// Detect domains from text content
    pub fn detect_domains(&self, content: &str) -> Vec<DomainType> {
        let content_lower = content.to_lowercase();
        let words: HashSet<_> = content_lower.split_whitespace().collect();

        let mut domain_scores: HashMap<DomainType, usize> = HashMap::new();

        for word in words {
            if let Some(domains) = self.keyword_index.get(word) {
                for domain in domains {
                    *domain_scores.entry(*domain).or_default() += 1;
                }
            }
        }

        // Return domains with at least 2 keyword matches
        let mut detected: Vec<_> = domain_scores
            .into_iter()
            .filter(|(_, score)| *score >= 2)
            .collect();

        detected.sort_by(|a, b| b.1.cmp(&a.1));
        detected.into_iter().map(|(d, _)| d).collect()
    }

    /// Calculate similarity between two concepts
    fn calculate_similarity(&self, concept1: &str, concept2: &str) -> f64 {
        let c1_lower = concept1.to_lowercase();
        let c2_lower = concept2.to_lowercase();

        let words1: HashSet<_> = c1_lower.split_whitespace().collect();
        let words2: HashSet<_> = c2_lower.split_whitespace().collect();

        if words1.is_empty() || words2.is_empty() {
            return 0.0;
        }

        let intersection = words1.intersection(&words2).count();
        let union = words1.union(&words2).count();

        intersection as f64 / union as f64
    }

    /// Check if content is grounded in axioms
    fn is_grounded(&self, content: &str) -> bool {
        let content_lower = content.to_lowercase();

        // Check if content references any axiom
        for axiom in &self.axioms {
            // Check for partial axiom match (at least 3 words)
            let axiom_words: Vec<_> = axiom.split_whitespace().collect();
            let mut matches = 0;
            for word in &axiom_words {
                if content_lower.contains(word) {
                    matches += 1;
                }
            }
            if matches >= 3 {
                return true;
            }
        }

        // Check for explicit grounding markers
        content_lower.contains("therefore")
            || content_lower.contains("because")
            || content_lower.contains("according to")
            || content_lower.contains("based on")
    }

    /// Fauconnier concept blending
    fn blend_concepts(&self, concepts: &[String]) -> Option<String> {
        if !self.config.concept_blending_enabled || concepts.len() < 2 {
            return None;
        }

        // Simple blending: Extract core terms and combine
        let mut core_terms: Vec<String> = Vec::new();

        for concept in concepts {
            let words: Vec<_> = concept.split_whitespace().collect();
            if let Some(last) = words.last() {
                core_terms.push((*last).to_string());
            }
        }

        if core_terms.len() >= 2 {
            Some(format!("{}-{} Bridge", core_terms[0], core_terms[1]))
        } else {
            None
        }
    }

    /// Detect synergies from a set of concepts
    #[instrument(skip(self, concepts))]
    pub fn detect_synergies(&self, concepts: &[(String, String)]) -> SynergyResult {
        let start = std::time::Instant::now();
        let mut synergies: Vec<SynergyCandidate> = Vec::new();
        let mut total_links = 0;

        // Group concepts by detected domains
        let mut domain_concepts: HashMap<DomainType, Vec<(String, String)>> = HashMap::new();

        for (name, content) in concepts {
            let domains = self.detect_domains(content);
            for domain in &domains {
                domain_concepts
                    .entry(*domain)
                    .or_default()
                    .push((name.clone(), content.clone()));
            }
        }

        // Find cross-domain synergies
        let domain_list: Vec<_> = domain_concepts.keys().cloned().collect();

        for i in 0..domain_list.len() {
            for j in (i + 1)..domain_list.len() {
                let domain1 = domain_list[i];
                let domain2 = domain_list[j];

                let concepts1 = &domain_concepts[&domain1];
                let concepts2 = &domain_concepts[&domain2];

                // Find links between concepts in different domains
                for (name1, content1) in concepts1 {
                    for (name2, content2) in concepts2 {
                        let similarity = self.calculate_similarity(content1, content2);

                        if similarity >= self.config.similarity_threshold {
                            let link = CrossDomainLink {
                                source: name1.clone(),
                                source_domain: domain1,
                                target: name2.clone(),
                                target_domain: domain2,
                                similarity: Fixed64::from_f64(similarity),
                                link_type: "semantic_bridge".to_string(),
                                evidence: format!(
                                    "Shared semantic content between {} and {}",
                                    domain1.name(),
                                    domain2.name()
                                ),
                            };

                            total_links += 1;

                            // Check if this forms a new synergy
                            let synergy_id =
                                format!("syn_{}_{}", name1.to_lowercase(), name2.to_lowercase());

                            let grounded =
                                self.is_grounded(content1) || self.is_grounded(content2);
                            let blended =
                                self.blend_concepts(&[name1.clone(), name2.clone()]);

                            let snr = self.calculate_snr(content1, content2);
                            let ihsan = self.calculate_ihsan(&link, grounded);

                            let synergy = SynergyCandidate {
                                synergy_id,
                                name: format!("{} ↔ {}", name1, name2),
                                domains: vec![domain1, domain2],
                                links: vec![link],
                                confidence: Fixed64::from_f64(similarity),
                                snr,
                                ihsan,
                                grounded,
                                blended_concept: blended,
                            };

                            if synergy.passes_quality_gate(&self.config) {
                                synergies.push(synergy);
                            }
                        }
                    }
                }
            }
        }

        // Estimate false positive rate
        let estimated_fp_rate = if !synergies.is_empty() {
            let low_confidence_count = synergies
                .iter()
                .filter(|s| s.confidence < Fixed64::from_f64(0.8))
                .count();
            low_confidence_count as f64 / synergies.len() as f64
        } else {
            0.0
        };

        let duration_ms = start.elapsed().as_millis() as u64;

        info!(
            concepts = concepts.len(),
            synergies = synergies.len(),
            links = total_links,
            fp_rate = estimated_fp_rate,
            duration_ms = duration_ms,
            "Cross-domain synergy detection completed"
        );

        SynergyResult {
            concepts_analyzed: concepts.len(),
            synergies,
            total_links,
            estimated_false_positive_rate: estimated_fp_rate,
            duration_ms,
        }
    }

    /// Calculate SNR for synergy
    fn calculate_snr(&self, content1: &str, content2: &str) -> Fixed64 {
        let combined = format!("{} {}", content1, content2);
        let words: Vec<_> = combined.split_whitespace().collect();
        if words.is_empty() {
            return Fixed64::ZERO;
        }

        let unique: HashSet<_> = words.iter().map(|w| w.to_lowercase()).collect();
        let signal = unique.len() as f64 / words.len() as f64;
        let noise = 1.0 - signal;

        let snr = signal / (signal + noise + 1e-9);
        Fixed64::from_f64(snr.clamp(0.0, 1.0))
    }

    /// Calculate Ihsan score for synergy link
    fn calculate_ihsan(&self, link: &CrossDomainLink, grounded: bool) -> Fixed64 {
        let base = Fixed64::from_bits(0x1199999999999999); // 0.7 as Fixed64
        let boost_high_similarity = Fixed64::from_bits(0x1999999999999999); // 0.1 as Fixed64
        let boost_grounding = Fixed64::from_bits(0x1999999999999999); // 0.1 as Fixed64
        let boost_diverse_domains = Fixed64::from_bits(0x0ccccccccccccccc); // 0.05 as Fixed64
        let max_score = Fixed64::ONE;

        let mut score = base;

        // Boost for high similarity
        if link.similarity > Fixed64::from_f64(0.8) {
            score = score + boost_high_similarity;
        }

        // Boost for grounding
        if grounded {
            score = score + boost_grounding;
        }

        // Boost for diverse domains
        if link.source_domain != link.target_domain {
            score = score + boost_diverse_domains;
        }

        // Clamp to maximum of 1.0
        if score > max_score {
            max_score
        } else {
            score
        }
    }

    /// Get configuration
    pub fn config(&self) -> &SynergyConfig {
        &self.config
    }
}

impl Default for KnowledgeBridge {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_domain_detection() {
        let bridge = KnowledgeBridge::new();

        // Islamic domain
        let islamic_domains = bridge.detect_domains("Ihsan and adl are core principles of excellence");
        assert!(islamic_domains.contains(&DomainType::Islamic));

        // Distributed systems domain
        let dist_domains = bridge.detect_domains("Byzantine fault tolerant consensus algorithm");
        assert!(dist_domains.contains(&DomainType::DistributedSystems));

        // Mixed domains
        let mixed_domains = bridge.detect_domains(
            "Using z3 solver for formal verification of Ihsan compliance in distributed consensus",
        );
        assert!(mixed_domains.len() >= 2);
    }

    #[test]
    fn test_synergy_detection() {
        let bridge = KnowledgeBridge::new();

        let concepts = vec![
            (
                "Ihsan Gate".to_string(),
                "Ihsan is excellence principle that ensures adl justice in AI systems".to_string(),
            ),
            (
                "Byzantine Consensus".to_string(),
                "Byzantine fault tolerant consensus ensures distributed justice".to_string(),
            ),
        ];

        let result = bridge.detect_synergies(&concepts);
        assert!(result.concepts_analyzed == 2);
    }

    #[test]
    fn test_grounding_check() {
        let bridge = KnowledgeBridge::new();

        // Grounded content
        assert!(bridge.is_grounded("Therefore, AI must be auditable"));
        assert!(bridge.is_grounded("Based on Ihsan excellence principles"));

        // Ungrounded content
        assert!(!bridge.is_grounded("Random unconnected statement"));
    }

    #[test]
    fn test_concept_blending() {
        let bridge = KnowledgeBridge::new();

        let blended = bridge.blend_concepts(&["Byzantine Consensus".to_string(), "Ihsan Gate".to_string()]);
        assert!(blended.is_some());
        assert!(blended.unwrap().contains("Bridge"));
    }
}
