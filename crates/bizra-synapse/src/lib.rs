use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use sha2::{Digest, Sha256};
use hex;

/// THE SYNAPTIC PROTOCOL
/// Defines how the Meta-Council "thinks".
/// Every thought is a Node in a Directed Acyclic Graph (DAG).
/// Traceability is absolute.

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum ThoughtType {
    Goal,       // The root intent
    Hypothesis, // A proposed path
    Plan,       // Structured steps
    Action,     // Execution (code/tool use)
    Evidence,   // Result of action
    Decision,   // Logic gate (Proceed/Pivot)
    Result,     // Final output
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThoughtNode {
    pub id: String,
    pub author_role: String, // e.g., "SKEPTIC"
    pub thought_type: ThoughtType,
    pub content: String,     // The actual thought/data
    pub confidence: f32,     // 0.0 to 1.0
    pub parents: Vec<String>, // IDs of previous thoughts (DAG edges)
    pub signature: String,    // Cryptographic proof of authorship
}

impl ThoughtNode {
    /// Create a new thought node
    pub fn new(content: &str, parents: Vec<String>, author_role: &str, thought_type: ThoughtType) -> Self {
         Self {
            id: String::new(), // Computed on insertion
            author_role: author_role.to_string(),
            thought_type,
            content: content.to_string(),
            confidence: 1.0, 
            parents,
            signature: String::new(), // TODO: Implementation
         }
    }

    /// Canonical hash for the node (Content-Addressable)
    pub fn compute_hash(&self) -> String {
        let mut hasher = Sha256::new();
        hasher.update(&self.author_role);
        hasher.update(format!("{:?}", self.thought_type));
        hasher.update(&self.content);
        // Sort parents to ensure deterministic hash regardless of order
        let mut parents_sorted = self.parents.clone();
        parents_sorted.sort();
        for p in &parents_sorted {
            hasher.update(p);
        }
        hex::encode(hasher.finalize())
    }
}

/// The Graph of Thoughts (GoT) Context
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SynapticGraph {
    pub mission_id: String,
    pub nodes: HashMap<String, ThoughtNode>,
    pub head_node: String, // The most recent thought
}

impl SynapticGraph {
    pub fn new(mission_id: &str) -> Self {
        Self {
            mission_id: mission_id.to_string(),
            nodes: HashMap::new(),
            head_node: String::new(),
        }
    }

    /// Add a new thought to the graph. 
    /// Enforces causality (must have parents, unless Goal).
    pub fn add_thought(&mut self, node: ThoughtNode) -> Result<String, String> {
        // 1. Validate Hierarchy
        if node.thought_type != ThoughtType::Goal && node.parents.is_empty() {
            return Err("Orphan thought detected. All non-Goal thoughts must have parents.".into());
        }

        // 2. Validate Parents Exist
        for parent_id in &node.parents {
            if !self.nodes.contains_key(parent_id) {
                return Err(format!("Parent node {} not found in local graph.", parent_id));
            }
        }

        // 3. Compute ID/Hash (Verify integrity if ID is provided, or set it)
        let computed_hash = node.compute_hash();
        // If the node comes with an ID, we verify it matches the content
        if !node.id.is_empty() && node.id != computed_hash {
             return Err(format!("Integrity check failed. ID {} != Computed {}", node.id, computed_hash));
        }

        if self.nodes.contains_key(&computed_hash) {
            return Ok(computed_hash); // Idempotent
        }

        // 4. Commit
        // (In a real implementation we would likely mutate the node to set the ID if missing)
        let mut final_node = node;
        final_node.id = computed_hash.clone();
        
        self.nodes.insert(computed_hash.clone(), final_node);
        self.head_node = computed_hash.clone();

        Ok(computed_hash)
    }

    /// Validate the graph integrity
    pub fn validate(&self) -> Result<(), String> {
        // Basic check: all parents exist (invariant enforced by add_thought, but good to re-check)
        for (id, node) in &self.nodes {
            for p in &node.parents {
                 if !self.nodes.contains_key(p) {
                     return Err(format!("Node {} references missing parent {}", id, p));
                 }
            }
            if node.id != *id {
                return Err(format!("Node ID mismatch for {}", id));
            }
        }
        Ok(())
    }

    /// Snapshot the graph as a deterministic JSON value
    pub fn snapshot_json(&self) -> Result<serde_json::Value, String> {
        // We use a BTreeMap to ensure deterministic ordering of keys
        let mut map = std::collections::BTreeMap::new();
        for (k, v) in &self.nodes {
            map.insert(k.clone(), v.clone());
        }
        serde_json::to_value(&map).map_err(|e| e.to_string())
    }

    /// Generate a receipt payload fragment
    pub fn receipt_payload(&self) -> Result<serde_json::Value, String> {
         let snapshot = self.snapshot_json()?;
         let mut hasher = Sha256::new();
         hasher.update(serde_json::to_vec(&snapshot).map_err(|e| e.to_string())?);
         let root_hash = hex::encode(hasher.finalize());
         
         Ok(serde_json::json!({
             "synapse_version": "1.0",
             "root_hash": root_hash,
             "head_node": self.head_node,
             "node_count": self.nodes.len()
         }))
    }

    /// Retrieve the full lineage of a thought (Traceability)
    pub fn get_lineage(&self, node_id: &str) -> Vec<&ThoughtNode> {
        let mut path = Vec::new();
        let mut current_opt = self.nodes.get(node_id);
        
        // Simple linear walk up the first parent (simplification)
        while let Some(node) = current_opt {
            path.push(node);
            if node.parents.is_empty() {
                break;
            }
            // For true GoT traversal we'd need a recursive search defined by the query intent
            // Here we just follow the primary parent
            current_opt = self.nodes.get(&node.parents[0]);
        }
        path.reverse(); // Root -> Leaf
        path
    }
}
