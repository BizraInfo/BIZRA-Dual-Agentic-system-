// src/graph_of_thought.rs - Apex Graph-of-Thought Synthesis Engine
// ============================================================================
// PEAK MASTERPIECE v7.1: Interdisciplinary Synthesis with SNR Optimization
// ============================================================================
// Giants Protocol Integration:
// - Al-Khwarizmi: Systematic graph traversal algorithms
// - Ibn Khaldun: Topological pattern analysis
// - Al-Biruni: Precise congruence measurement
// ============================================================================

use crate::giants::GiantsProtocol;
use crate::snr::SNREngine;
use crate::types::AgentResult;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::collections::{HashMap, HashSet};

/// Apex Synthesis Configuration
#[derive(Debug, Clone)]
pub struct ApexSynthesisConfig {
    /// Minimum edge weight to include in graph
    pub min_edge_weight: f64,
    /// Domain overlap weight factor
    pub domain_weight: f64,
    /// Term overlap weight factor
    pub term_weight: f64,
    /// SNR weight in winning signal calculation
    pub snr_weight: f64,
    /// Centrality weight in winning signal calculation
    pub centrality_weight: f64,
    /// Domain breadth bonus weight
    pub domain_bonus_weight: f64,
}

impl Default for ApexSynthesisConfig {
    fn default() -> Self {
        Self {
            min_edge_weight: 0.08,
            domain_weight: 0.55,
            term_weight: 0.45,
            snr_weight: 0.65,
            centrality_weight: 0.20,
            domain_bonus_weight: 0.15,
        }
    }
}

/// Apex Synthesis Result: Enhanced synthesis output
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApexSynthesisResult {
    pub node_count: usize,
    pub edge_count: usize,
    pub interdisciplinary_span: usize,
    pub congruence: f64,
    pub apex_score: f64,
    pub winning_signal: Option<WinningSignal>,
    pub giants_synthesis: Option<serde_json::Value>,
    pub cross_domain_bridges: Vec<CrossDomainBridge>,
}

/// Winning Signal: The highest-scoring node in the synthesis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WinningSignal {
    pub agent: String,
    pub role: String,
    pub snr: f64,
    pub domains: Vec<String>,
    pub composite_score: f64,
}

/// Cross-Domain Bridge: Connection between different knowledge domains
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrossDomainBridge {
    pub from_domain: String,
    pub to_domain: String,
    pub bridge_strength: f64,
    pub mediating_agents: Vec<String>,
}

struct GoTNode {
    id: String,
    agent: String,
    role: &'static str,
    snr: f64,
    domains: Vec<String>,
    keywords: HashSet<String>,
}

struct EdgeSummary {
    from: String,
    to: String,
    weight: f64,
    shared_domains: usize,
    shared_terms: usize,
}

fn extract_keywords(text: &str) -> HashSet<String> {
    let mut keywords = HashSet::new();
    for word in text.split_whitespace() {
        let cleaned = word
            .trim_matches(|c: char| !c.is_alphanumeric())
            .to_ascii_lowercase();
        if cleaned.len() >= 5 && cleaned.chars().all(|c| c.is_ascii_alphanumeric()) {
            keywords.insert(cleaned);
        }
    }
    keywords
}

fn extract_domains(text: &str) -> Vec<String> {
    let domain_markers = [
        "ethics",
        "jurisprudence",
        "law",
        "logic",
        "economics",
        "finance",
        "physics",
        "quantum",
        "thermodynamics",
        "biology",
        "neuroscience",
        "psychology",
        "sociology",
        "topology",
        "cybernetic",
        "systems",
        "architecture",
        "security",
        "governance",
        "cryptography",
        "language",
        "linguistics",
        "education",
        "medicine",
        "energy",
    ];

    let lower = text.to_ascii_lowercase();
    let mut found = HashSet::new();
    for marker in domain_markers.iter() {
        if lower.contains(marker) {
            found.insert(marker.to_string());
        }
    }

    let mut domains: Vec<String> = found.into_iter().collect();
    domains.sort();
    domains
}

fn edge_weight(a: &GoTNode, b: &GoTNode) -> EdgeSummary {
    let shared_terms = a.keywords.intersection(&b.keywords).count();
    let union_terms = a
        .keywords
        .union(&b.keywords)
        .count()
        .max(1) as f64;

    let a_domains: HashSet<&str> = a.domains.iter().map(|s| s.as_str()).collect();
    let b_domains: HashSet<&str> = b.domains.iter().map(|s| s.as_str()).collect();
    let shared_domains = a_domains.intersection(&b_domains).count();

    let domain_denominator = a_domains.len().max(b_domains.len()).max(1) as f64;
    let domain_overlap = shared_domains as f64 / domain_denominator;
    let term_overlap = shared_terms as f64 / union_terms;

    let weight = (0.55 * domain_overlap + 0.45 * term_overlap).clamp(0.0, 1.0);

    EdgeSummary {
        from: a.id.clone(),
        to: b.id.clone(),
        weight,
        shared_domains,
        shared_terms,
    }
}

/// Build a lightweight Graph-of-Thought report from PAT and SAT results.
/// The report is designed for metadata inclusion (JSON-friendly).
pub fn build_report(pat_results: &[AgentResult], sat_results: &[AgentResult]) -> serde_json::Value {
    let mut nodes: Vec<GoTNode> = Vec::new();

    for result in pat_results {
        let snr = SNREngine::score(result).ratio.to_f64();
        nodes.push(GoTNode {
            id: format!("pat::{}", result.agent_name),
            agent: result.agent_name.clone(),
            role: "pat",
            snr,
            domains: extract_domains(&result.contribution),
            keywords: extract_keywords(&result.contribution),
        });
    }

    for result in sat_results {
        let snr = SNREngine::score(result).ratio.to_f64();
        nodes.push(GoTNode {
            id: format!("sat::{}", result.agent_name),
            agent: result.agent_name.clone(),
            role: "sat",
            snr,
            domains: extract_domains(&result.contribution),
            keywords: extract_keywords(&result.contribution),
        });
    }

    let mut edges: Vec<EdgeSummary> = Vec::new();
    let mut centrality: HashMap<String, f64> = HashMap::new();

    for i in 0..nodes.len() {
        for j in (i + 1)..nodes.len() {
            let summary = edge_weight(&nodes[i], &nodes[j]);
            if summary.weight >= 0.08 || summary.shared_domains > 0 {
                centrality
                    .entry(summary.from.clone())
                    .and_modify(|v| *v += summary.weight)
                    .or_insert(summary.weight);
                centrality
                    .entry(summary.to.clone())
                    .and_modify(|v| *v += summary.weight)
                    .or_insert(summary.weight);
                edges.push(summary);
            }
        }
    }

    let mut unique_domains = HashSet::new();
    for node in &nodes {
        for domain in &node.domains {
            unique_domains.insert(domain.clone());
        }
    }

    let max_centrality = centrality
        .values()
        .copied()
        .fold(0.0_f64, f64::max)
        .max(1e-6);

    let mut winning: Option<&GoTNode> = None;
    let mut winning_score = 0.0;

    for node in &nodes {
        let node_centrality = centrality.get(&node.id).copied().unwrap_or(0.0);
        let centrality_norm = node_centrality / max_centrality;
        let domain_bonus = (node.domains.len() as f64 / 5.0).clamp(0.0, 0.2);
        let composite = node.snr + (0.15 * centrality_norm) + domain_bonus;

        if composite > winning_score {
            winning_score = composite;
            winning = Some(node);
        }
    }

    let congruence = if edges.is_empty() {
        0.0
    } else {
        let sum: f64 = edges.iter().map(|e| e.weight).sum();
        sum / edges.len() as f64
    };

    let mut snr_ranked = nodes
        .iter()
        .map(|node| (node.agent.clone(), node.snr))
        .collect::<Vec<_>>();
    snr_ranked.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
    let snr_top: Vec<serde_json::Value> = snr_ranked
        .into_iter()
        .take(3)
        .map(|(agent, snr)| json!({ "agent": agent, "snr": snr }))
        .collect();

    let winning_json = winning.map(|node| {
        json!({
            "agent": node.agent,
            "role": node.role,
            "snr": node.snr,
            "domains": node.domains,
            "score": winning_score
        })
    });

    let node_summaries: Vec<serde_json::Value> = nodes
        .iter()
        .map(|node| {
            json!({
                "id": node.id,
                "agent": node.agent,
                "role": node.role,
                "snr": node.snr,
                "domains": node.domains,
                "keywords": node.keywords.len()
            })
        })
        .collect();

    let edge_summaries: Vec<serde_json::Value> = edges
        .iter()
        .map(|edge| {
            json!({
                "from": edge.from,
                "to": edge.to,
                "weight": edge.weight,
                "shared_domains": edge.shared_domains,
                "shared_terms": edge.shared_terms
            })
        })
        .collect();

    json!({
        "node_count": nodes.len(),
        "edge_count": edges.len(),
        "interdisciplinary_span": unique_domains.len(),
        "congruence": congruence,
        "winning_signal": winning_json,
        "snr_top": snr_top,
        "nodes": node_summaries,
        "edges": edge_summaries
    })
}

// ============================================================================
// APEX SYNTHESIS ENGINE - PEAK MASTERPIECE v7.1
// ============================================================================

/// Apex Synthesis: Full interdisciplinary synthesis with Giants Protocol integration
pub fn apex_synthesis(
    pat_results: &[AgentResult],
    sat_results: &[AgentResult],
    config: &ApexSynthesisConfig,
) -> ApexSynthesisResult {
    let basic_report = build_report(pat_results, sat_results);
    
    // Extract metrics from basic report
    let node_count = basic_report["node_count"].as_u64().unwrap_or(0) as usize;
    let edge_count = basic_report["edge_count"].as_u64().unwrap_or(0) as usize;
    let interdisciplinary_span = basic_report["interdisciplinary_span"].as_u64().unwrap_or(0) as usize;
    let congruence = basic_report["congruence"].as_f64().unwrap_or(0.0);
    
    // Extract winning signal
    let winning_signal = basic_report["winning_signal"].as_object().map(|ws| {
        WinningSignal {
            agent: ws.get("agent").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            role: ws.get("role").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            snr: ws.get("snr").and_then(|v| v.as_f64()).unwrap_or(0.0),
            domains: ws.get("domains")
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
                .unwrap_or_default(),
            composite_score: ws.get("score").and_then(|v| v.as_f64()).unwrap_or(0.0),
        }
    });
    
    // Build context for Giants Protocol synthesis
    let mut context_parts = Vec::new();
    for result in pat_results.iter().chain(sat_results.iter()) {
        context_parts.push(result.contribution.as_str());
    }
    let full_context = context_parts.join(" ");
    
    // Perform Giants Protocol synthesis
    let giants_synthesis_result = GiantsProtocol::full_synthesis(&full_context);
    let giants_synthesis = Some(json!({
        "primary_giant": giants_synthesis_result.primary_giant,
        "secondary_giants": giants_synthesis_result.secondary_giants,
        "synthesis_score": giants_synthesis_result.synthesis_score.to_f64(),
        "cross_domain_insights": giants_synthesis_result.cross_domain_insights
    }));
    
    // Extract cross-domain bridges from nodes
    let cross_domain_bridges = extract_cross_domain_bridges(&basic_report, config);
    
    // Calculate apex score
    let apex_score = calculate_apex_score(
        congruence,
        interdisciplinary_span,
        &winning_signal,
        &giants_synthesis_result,
        config,
    );
    
    ApexSynthesisResult {
        node_count,
        edge_count,
        interdisciplinary_span,
        congruence,
        apex_score,
        winning_signal,
        giants_synthesis,
        cross_domain_bridges,
    }
}

/// Extract cross-domain bridges from the synthesis graph
fn extract_cross_domain_bridges(
    report: &serde_json::Value,
    config: &ApexSynthesisConfig,
) -> Vec<CrossDomainBridge> {
    let mut bridges: HashMap<(String, String), CrossDomainBridge> = HashMap::new();
    
    let edges = match report["edges"].as_array() {
        Some(e) => e,
        None => return Vec::new(),
    };
    
    let nodes: HashMap<String, Vec<String>> = report["nodes"]
        .as_array()
        .map(|arr| {
            arr.iter()
                .filter_map(|n| {
                    let id = n["id"].as_str()?.to_string();
                    let domains: Vec<String> = n["domains"]
                        .as_array()?
                        .iter()
                        .filter_map(|d| d.as_str().map(|s| s.to_string()))
                        .collect();
                    Some((id, domains))
                })
                .collect()
        })
        .unwrap_or_default();
    
    for edge in edges {
        let weight = edge["weight"].as_f64().unwrap_or(0.0);
        if weight < config.min_edge_weight {
            continue;
        }
        
        let from_id = edge["from"].as_str().unwrap_or("");
        let to_id = edge["to"].as_str().unwrap_or("");
        
        let from_domains = nodes.get(from_id).cloned().unwrap_or_default();
        let to_domains = nodes.get(to_id).cloned().unwrap_or_default();
        
        // Find domain pairs that bridge different domains
        for fd in &from_domains {
            for td in &to_domains {
                if fd != td {
                    let key = if fd < td {
                        (fd.clone(), td.clone())
                    } else {
                        (td.clone(), fd.clone())
                    };
                    
                    let bridge = bridges.entry(key.clone()).or_insert_with(|| CrossDomainBridge {
                        from_domain: key.0.clone(),
                        to_domain: key.1.clone(),
                        bridge_strength: 0.0,
                        mediating_agents: Vec::new(),
                    });
                    
                    bridge.bridge_strength += weight;
                    
                    let from_agent = from_id.split("::").nth(1).unwrap_or(from_id);
                    let to_agent = to_id.split("::").nth(1).unwrap_or(to_id);
                    
                    if !bridge.mediating_agents.contains(&from_agent.to_string()) {
                        bridge.mediating_agents.push(from_agent.to_string());
                    }
                    if !bridge.mediating_agents.contains(&to_agent.to_string()) {
                        bridge.mediating_agents.push(to_agent.to_string());
                    }
                }
            }
        }
    }
    
    let mut result: Vec<CrossDomainBridge> = bridges.into_values().collect();
    result.sort_by(|a, b| b.bridge_strength.partial_cmp(&a.bridge_strength).unwrap_or(std::cmp::Ordering::Equal));
    result.truncate(10); // Top 10 bridges
    result
}

/// Calculate apex synthesis score
fn calculate_apex_score(
    congruence: f64,
    interdisciplinary_span: usize,
    winning_signal: &Option<WinningSignal>,
    giants_synthesis: &crate::giants::GiantsSynthesis,
    config: &ApexSynthesisConfig,
) -> f64 {
    // Base congruence contribution
    let congruence_score = congruence * 0.30;
    
    // Interdisciplinary span contribution (normalized to max 10 domains)
    let span_score = (interdisciplinary_span as f64 / 10.0).min(1.0) * 0.20;
    
    // Winning signal SNR contribution
    let snr_score = winning_signal
        .as_ref()
        .map(|ws| ws.snr * config.snr_weight)
        .unwrap_or(0.0);
    
    // Giants synthesis contribution
    let giants_score = giants_synthesis.synthesis_score.to_f64() * 0.15;
    
    // Cross-domain insights bonus
    let insights_bonus = (giants_synthesis.cross_domain_insights.len() as f64 / 5.0).min(0.10);
    
    (congruence_score + span_score + snr_score + giants_score + insights_bonus).min(1.0)
}

/// Generate Apex Synthesis Report
pub fn apex_report(result: &ApexSynthesisResult) -> String {
    let winning_info = result.winning_signal.as_ref()
        .map(|ws| format!(
            "Agent: {}\n║   Role: {}\n║   SNR: {:.4}\n║   Score: {:.4}",
            ws.agent, ws.role, ws.snr, ws.composite_score
        ))
        .unwrap_or_else(|| "None identified".to_string());
    
    let giants_info = result.giants_synthesis.as_ref()
        .and_then(|gs| gs["primary_giant"].as_str())
        .unwrap_or("Primordial");
    
    let bridges_info: Vec<String> = result.cross_domain_bridges.iter()
        .take(3)
        .map(|b| format!(
            "{} ↔ {} ({:.3})",
            b.from_domain, b.to_domain, b.bridge_strength
        ))
        .collect();
    
    format!(
        r#"
╔══════════════════════════════════════════════════════════════╗
║       APEX GRAPH-OF-THOUGHT SYNTHESIS - PEAK MASTERPIECE     ║
╠══════════════════════════════════════════════════════════════╣
║ METRICS:                                                     ║
║   Nodes:                {:>6}                              ║
║   Edges:                {:>6}                              ║
║   Interdisciplinary:    {:>6} domains                      ║
║   Congruence:           {:>6.4}                            ║
║   Apex Score:           {:>6.4}                            ║
╠══════════════════════════════════════════════════════════════╣
║ WINNING SIGNAL:                                              ║
║   {}
╠══════════════════════════════════════════════════════════════╣
║ GIANTS PROTOCOL:                                             ║
║   Primary: {}                                           ║
╠══════════════════════════════════════════════════════════════╣
║ TOP CROSS-DOMAIN BRIDGES:                                    ║
║   {}
╚══════════════════════════════════════════════════════════════╝
"#,
        result.node_count,
        result.edge_count,
        result.interdisciplinary_span,
        result.congruence,
        result.apex_score,
        winning_info.replace('\n', "\n║   "),
        giants_info,
        bridges_info.join("\n║   ")
    )
}
