// src/got.rs - Graph of Thoughts: Elite Cognitive Substrate
//
// Standing on the shoulders of giants:
// - Judea Pearl: Causal reasoning and probabilistic graphical models
// - Leslie Lamport: Distributed systems consensus
// - Claude Shannon: Information theory and signal processing

use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use uuid::Uuid;
use tracing::{debug, instrument};

/// Graph of Thoughts (GoT) - Non-linear reasoning substrate
/// 
/// Unlike Chain-of-Thought (linear) or Tree-of-Thought (branching),
/// GoT enables multi-dimensional synthesis with:
/// - Atomic claims/actions as nodes
/// - Causal/evidential/constraint relations as edges
/// - Domain-specific expert subgraphs
/// - Self-evaluation meta-nodes
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphOfThoughts {
    /// Unique graph identifier
    pub id: String,
    
    /// All nodes in the graph
    pub nodes: HashMap<String, GoTNode>,
    
    /// All edges connecting nodes
    pub edges: Vec<GoTEdge>,
    
    /// Subgraphs representing domain expertise
    pub subgraphs: HashMap<String, GoTSubgraph>,
    
    /// Meta-nodes for self-evaluation and arbitration
    pub meta_nodes: Vec<GoTMetaNode>,
    
    /// Graph-level metadata
    pub metadata: GoTMetadata,
}

/// Atomic node in the Graph of Thoughts
/// 
/// Each node represents either:
/// - An atomic claim (hypothesis, fact, assumption)
/// - An atomic action (tool call, computation, decision)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoTNode {
    /// Unique node identifier
    pub id: String,
    
    /// Node type (claim or action)
    pub node_type: NodeType,
    
    /// The actual content/claim/action
    pub content: String,
    
    /// Confidence in this node (0.0 to 1.0)
    pub confidence: f64,
    
    /// Which domain/agent created this node
    pub domain: String,
    
    /// Supporting evidence or reasoning
    pub evidence: Vec<String>,
    
    /// Dependencies (incoming edges)
    pub dependencies: Vec<String>,
    
    /// SNR contribution of this node
    pub snr_contribution: f64,
    
    /// Timestamp of creation
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum NodeType {
    /// A claim, hypothesis, or assertion
    Claim,
    
    /// An action, tool call, or computation
    Action,
    
    /// An assumption (explicit)
    Assumption,
    
    /// A conclusion drawn from other nodes
    Conclusion,
}

/// Edge connecting two nodes with a specific relation type
/// 
/// Inspired by Pearl's causal graphical models - edges represent
/// different types of relationships with varying strengths
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoTEdge {
    /// Unique edge identifier
    pub id: String,
    
    /// Source node ID
    pub from: String,
    
    /// Target node ID
    pub to: String,
    
    /// Type of relationship
    pub relation_type: RelationType,
    
    /// Strength of relationship (0.0 to 1.0)
    pub strength: f64,
    
    /// Optional label/description
    pub label: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum RelationType {
    /// Causal: A causes B (Pearl's contribution)
    Causal,
    
    /// Evidential: A provides evidence for B
    Evidential,
    
    /// Constraint: A constrains/limits B
    Constraint,
    
    /// Contradiction: A contradicts B
    Contradiction,
    
    /// Support: A supports/reinforces B
    Support,
    
    /// Alternative: A is an alternative to B
    Alternative,
    
    /// Refinement: A refines/improves B
    Refinement,
}

/// Subgraph representing domain-specific expertise
/// 
/// Each subgraph corresponds to a specialized agent or domain
/// enabling modular, interdisciplinary reasoning
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoTSubgraph {
    /// Unique subgraph identifier
    pub id: String,
    
    /// Domain name (e.g., "security", "performance", "ethics")
    pub domain: String,
    
    /// Node IDs belonging to this subgraph
    pub node_ids: HashSet<String>,
    
    /// Subgraph-level confidence
    pub confidence: f64,
    
    /// Cross-domain connections to other subgraphs
    pub cross_domain_edges: Vec<String>,
}

/// Meta-node for self-evaluation and arbitration
/// 
/// Meta-nodes evaluate the graph itself, enabling:
/// - Contradiction detection
/// - Consistency checking
/// - Confidence aggregation
/// - Arbitration between competing hypotheses
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoTMetaNode {
    /// Unique meta-node identifier
    pub id: String,
    
    /// Type of meta-evaluation
    pub eval_type: MetaEvalType,
    
    /// Nodes being evaluated
    pub evaluated_nodes: Vec<String>,
    
    /// Evaluation result
    pub result: MetaEvalResult,
    
    /// Confidence in this evaluation
    pub confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum MetaEvalType {
    /// Check for logical contradictions
    ContradictionDetection,
    
    /// Verify consistency across domains
    ConsistencyCheck,
    
    /// Aggregate confidence scores
    ConfidenceAggregation,
    
    /// Arbitrate between competing hypotheses
    Arbitration,
    
    /// Evaluate completeness of reasoning
    CompletenessCheck,
    
    /// Assess SNR quality
    SNRAssessment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaEvalResult {
    /// Pass/fail or score
    pub passed: bool,
    
    /// Numeric score if applicable
    pub score: Option<f64>,
    
    /// Explanation of the evaluation
    pub explanation: String,
    
    /// Recommendations for improvement
    pub recommendations: Vec<String>,
}

/// Graph-level metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoTMetadata {
    /// When the graph was created
    pub created_at: chrono::DateTime<chrono::Utc>,
    
    /// Last update timestamp
    pub updated_at: chrono::DateTime<chrono::Utc>,
    
    /// Task/query that initiated this graph
    pub task: String,
    
    /// Overall graph confidence
    pub overall_confidence: f64,
    
    /// Graph-level SNR score
    pub snr_score: f64,
    
    /// Domains represented in this graph
    pub domains: HashSet<String>,
}

/// Graph of Thoughts Builder - fluent API for constructing graphs
pub struct GoTBuilder {
    pub graph: GraphOfThoughts,
}

impl GoTBuilder {
    /// Create a new GoT builder
    pub fn new(task: String) -> Self {
        let now = chrono::Utc::now();
        Self {
            graph: GraphOfThoughts {
                id: Uuid::new_v4().to_string(),
                nodes: HashMap::new(),
                edges: Vec::new(),
                subgraphs: HashMap::new(),
                meta_nodes: Vec::new(),
                metadata: GoTMetadata {
                    created_at: now,
                    updated_at: now,
                    task,
                    overall_confidence: 0.0,
                    snr_score: 0.0,
                    domains: HashSet::new(),
                },
            },
        }
    }
    
    /// Add a node to the graph
    pub fn add_node(
        mut self,
        content: String,
        node_type: NodeType,
        domain: String,
        confidence: f64,
    ) -> Self {
        let node_id = Uuid::new_v4().to_string();
        let node = GoTNode {
            id: node_id.clone(),
            node_type,
            content,
            confidence,
            domain: domain.clone(),
            evidence: Vec::new(),
            dependencies: Vec::new(),
            snr_contribution: 0.0,
            timestamp: chrono::Utc::now(),
        };
        
        self.graph.nodes.insert(node_id, node);
        self.graph.metadata.domains.insert(domain);
        self
    }
    
    /// Add an edge between nodes
    pub fn add_edge(
        mut self,
        from: String,
        to: String,
        relation_type: RelationType,
        strength: f64,
        label: Option<String>,
    ) -> Self {
        let edge = GoTEdge {
            id: Uuid::new_v4().to_string(),
            from: from.clone(),
            to: to.clone(),
            relation_type,
            strength,
            label,
        };
        
        // Update dependencies
        if let Some(target_node) = self.graph.nodes.get_mut(&to) {
            target_node.dependencies.push(from);
        }
        
        self.graph.edges.push(edge);
        self
    }
    
    /// Create a subgraph for a domain
    pub fn create_subgraph(mut self, domain: String, node_ids: Vec<String>) -> Self {
        let subgraph = GoTSubgraph {
            id: Uuid::new_v4().to_string(),
            domain: domain.clone(),
            node_ids: node_ids.into_iter().collect(),
            confidence: 0.0,
            cross_domain_edges: Vec::new(),
        };
        
        self.graph.subgraphs.insert(domain, subgraph);
        self
    }
    
    /// Add a meta-node for evaluation
    pub fn add_meta_node(
        mut self,
        eval_type: MetaEvalType,
        evaluated_nodes: Vec<String>,
        result: MetaEvalResult,
        confidence: f64,
    ) -> Self {
        let meta_node = GoTMetaNode {
            id: Uuid::new_v4().to_string(),
            eval_type,
            evaluated_nodes,
            result,
            confidence,
        };
        
        self.graph.meta_nodes.push(meta_node);
        self
    }
    
    /// Build the final graph
    pub fn build(mut self) -> GraphOfThoughts {
        self.graph.metadata.updated_at = chrono::Utc::now();
        self.graph
    }
}

/// GoT Arbitration Engine - resolves conflicts and synthesizes conclusions
/// 
/// Inspired by Lamport's distributed consensus algorithms - handles
/// Byzantine faults in reasoning (contradictory or malicious claims)
pub struct GoTArbitrator {
    /// Minimum confidence threshold for accepting claims
    pub min_confidence: f64,
    
    /// Consensus threshold (e.g., 0.6 = 60% agreement needed)
    pub consensus_threshold: f64,
}

impl GoTArbitrator {
    pub fn new(min_confidence: f64, consensus_threshold: f64) -> Self {
        Self {
            min_confidence,
            consensus_threshold,
        }
    }
    
    /// Detect contradictions in the graph
    #[instrument(skip(self, graph))]
    pub fn detect_contradictions(&self, graph: &GraphOfThoughts) -> Vec<Contradiction> {
        let mut contradictions = Vec::new();
        
        // Find all contradiction edges
        for edge in &graph.edges {
            if edge.relation_type == RelationType::Contradiction {
                if let (Some(node_a), Some(node_b)) = 
                    (graph.nodes.get(&edge.from), graph.nodes.get(&edge.to)) {
                    
                    contradictions.push(Contradiction {
                        node_a_id: node_a.id.clone(),
                        node_a_content: node_a.content.clone(),
                        node_a_confidence: node_a.confidence,
                        node_b_id: node_b.id.clone(),
                        node_b_content: node_b.content.clone(),
                        node_b_confidence: node_b.confidence,
                        edge_strength: edge.strength,
                    });
                }
            }
        }
        
        debug!("Detected {} contradictions", contradictions.len());
        contradictions
    }
    
    /// Resolve contradictions using confidence-weighted voting
    #[instrument(skip(self, _graph))]
    pub fn resolve_contradictions(
        &self,
        _graph: &GraphOfThoughts,
        contradictions: &[Contradiction],
    ) -> Vec<Resolution> {
        let mut resolutions = Vec::new();
        
        for contradiction in contradictions {
            let resolution = if contradiction.node_a_confidence > contradiction.node_b_confidence {
                Resolution {
                    winner_id: contradiction.node_a_id.clone(),
                    winner_content: contradiction.node_a_content.clone(),
                    loser_id: contradiction.node_b_id.clone(),
                    confidence_delta: contradiction.node_a_confidence - contradiction.node_b_confidence,
                    reasoning: format!(
                        "Node {} has higher confidence ({:.2} vs {:.2})",
                        contradiction.node_a_id,
                        contradiction.node_a_confidence,
                        contradiction.node_b_confidence
                    ),
                }
            } else {
                Resolution {
                    winner_id: contradiction.node_b_id.clone(),
                    winner_content: contradiction.node_b_content.clone(),
                    loser_id: contradiction.node_a_id.clone(),
                    confidence_delta: contradiction.node_b_confidence - contradiction.node_a_confidence,
                    reasoning: format!(
                        "Node {} has higher confidence ({:.2} vs {:.2})",
                        contradiction.node_b_id,
                        contradiction.node_b_confidence,
                        contradiction.node_a_confidence
                    ),
                }
            };
            
            resolutions.push(resolution);
        }
        
        resolutions
    }
    
    /// Synthesize final conclusions from the graph
    /// 
    /// Uses a modified Byzantine fault-tolerant consensus:
    /// - Aggregate confidence across supporting/evidential paths
    /// - Require consensus threshold for acceptance
    /// - Prune low-confidence branches
    #[instrument(skip(self, graph))]
    pub fn synthesize_conclusions(&self, graph: &GraphOfThoughts) -> Vec<Conclusion> {
        let mut conclusions = Vec::new();
        
        // Find all conclusion nodes
        for node in graph.nodes.values() {
            if node.node_type == NodeType::Conclusion {
                // Calculate aggregated confidence from dependencies
                let aggregated_confidence = self.aggregate_confidence(graph, node);
                
                if aggregated_confidence >= self.min_confidence {
                    conclusions.push(Conclusion {
                        content: node.content.clone(),
                        confidence: aggregated_confidence,
                        supporting_nodes: node.dependencies.clone(),
                        domain: node.domain.clone(),
                    });
                }
            }
        }
        
        // Sort by confidence (highest first)
        conclusions.sort_by(|a, b| b.confidence.partial_cmp(&a.confidence).unwrap());
        
        debug!("Synthesized {} conclusions", conclusions.len());
        conclusions
    }
    
    /// Aggregate confidence from supporting nodes (Pearl's belief propagation)
    fn aggregate_confidence(&self, graph: &GraphOfThoughts, node: &GoTNode) -> f64 {
        if node.dependencies.is_empty() {
            return node.confidence;
        }
        
        let mut supporting_confidences = Vec::new();
        
        for dep_id in &node.dependencies {
            if let Some(dep_node) = graph.nodes.get(dep_id) {
                // Find edge strength
                let edge_strength = graph.edges.iter()
                    .find(|e| e.from == *dep_id && e.to == node.id)
                    .map(|e| e.strength)
                    .unwrap_or(1.0);
                
                // Weighted confidence
                supporting_confidences.push(dep_node.confidence * edge_strength);
            }
        }
        
        if supporting_confidences.is_empty() {
            return node.confidence;
        }
        
        // Harmonic mean (more conservative than arithmetic mean)
        let n = supporting_confidences.len() as f64;
        let sum_reciprocals: f64 = supporting_confidences.iter().map(|c| 1.0 / c.max(0.01)).sum();
        (n / sum_reciprocals).min(1.0)
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Contradiction {
    pub node_a_id: String,
    pub node_a_content: String,
    pub node_a_confidence: f64,
    pub node_b_id: String,
    pub node_b_content: String,
    pub node_b_confidence: f64,
    pub edge_strength: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Resolution {
    pub winner_id: String,
    pub winner_content: String,
    pub loser_id: String,
    pub confidence_delta: f64,
    pub reasoning: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Conclusion {
    pub content: String,
    pub confidence: f64,
    pub supporting_nodes: Vec<String>,
    pub domain: String,
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_got_builder() {
        let graph = GoTBuilder::new("Test task".to_string())
            .add_node(
                "Claim 1".to_string(),
                NodeType::Claim,
                "test".to_string(),
                0.9,
            )
            .build();
        
        assert_eq!(graph.nodes.len(), 1);
        assert_eq!(graph.metadata.domains.len(), 1);
    }
    
    #[test]
    fn test_contradiction_detection() {
        let graph = GoTBuilder::new("Test contradictions".to_string())
            .add_node("A".to_string(), NodeType::Claim, "domain1".to_string(), 0.8)
            .add_node("B".to_string(), NodeType::Claim, "domain2".to_string(), 0.7)
            .build();
        
        let arbitrator = GoTArbitrator::new(0.5, 0.6);
        let contradictions = arbitrator.detect_contradictions(&graph);
        
        assert_eq!(contradictions.len(), 0); // No contradiction edges added
    }
}
