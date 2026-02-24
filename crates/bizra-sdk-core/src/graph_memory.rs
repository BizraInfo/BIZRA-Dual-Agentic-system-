use crate::memory::{LocalMemory, RedisMemory};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphNode {
    pub id: String,
    pub content: String,
    pub node_type: String, // e.g., "thought", "axiom", "fact"
    pub metadata: HashMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GraphEdge {
    pub source: String,
    pub target: String,
    pub relation: String, // e.g., "supports", "contradicts", "derives"
    pub weight: f32,
}

/// Interface for Graph Memory operations (Graph of Thoughts)
pub trait GraphMemoryInterface: Send + Sync {
    fn add_node(&self, node: GraphNode) -> Result<()>;
    fn add_edge(&self, edge: GraphEdge) -> Result<()>;
    fn get_node(&self, id: &str) -> Result<Option<GraphNode>>;
    fn get_edges(&self, node_id: &str) -> Result<Vec<GraphEdge>>;
    fn get_neighbors(&self, node_id: &str) -> Result<Vec<GraphNode>>;
}

impl GraphNode {
    pub fn new(content: &str, node_type: &str) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            content: content.to_string(),
            node_type: node_type.to_string(),
            metadata: HashMap::new(),
        }
    }

    pub fn with_metadata(mut self, key: &str, value: &str) -> Self {
        self.metadata.insert(key.to_string(), value.to_string());
        self
    }
}

// --- Redis Implementation ---

#[cfg(feature = "memory")]
impl GraphMemoryInterface for RedisMemory {
    fn add_node(&self, node: GraphNode) -> Result<()> {
        let mut con = self
            .client
            .get_connection()
            .map_err(|e| anyhow!("Redis connection failed: {}", e))?;

        // Key: prefix:graph:node:{id}
        let key = format!("{}:graph:node:{}", self.prefix, node.id);
        let val = serde_json::to_string(&node)?;

        redis::cmd("SET")
            .arg(key)
            .arg(val)
            .query::<()>(&mut con)
            .map_err(|e| anyhow!("Failed to set graph node: {}", e))?;

        Ok(())
    }

    fn add_edge(&self, edge: GraphEdge) -> Result<()> {
        let mut con = self
            .client
            .get_connection()
            .map_err(|e| anyhow!("Redis connection failed: {}", e))?;

        // Store edge in a list or set for the source node
        // Key: prefix:graph:edges:{source}
        let key = format!("{}:graph:edges:{}", self.prefix, edge.source);
        let val = serde_json::to_string(&edge)?;

        redis::cmd("RPUSH")
            .arg(key)
            .arg(val)
            .query::<()>(&mut con)
            .map_err(|e| anyhow!("Failed to add graph edge: {}", e))?;

        Ok(())
    }

    fn get_node(&self, id: &str) -> Result<Option<GraphNode>> {
        let mut con = self
            .client
            .get_connection()
            .map_err(|e| anyhow!("Redis connection failed: {}", e))?;

        let key = format!("{}:graph:node:{}", self.prefix, id);
        let val: Option<String> = redis::cmd("GET")
            .arg(key)
            .query(&mut con)
            .map_err(|e| anyhow!("Failed to get graph node: {}", e))?;

        if let Some(v) = val {
            let node = serde_json::from_str(&v)?;
            Ok(Some(node))
        } else {
            Ok(None)
        }
    }

    fn get_edges(&self, node_id: &str) -> Result<Vec<GraphEdge>> {
        let mut con = self
            .client
            .get_connection()
            .map_err(|e| anyhow!("Redis connection failed: {}", e))?;

        let key = format!("{}:graph:edges:{}", self.prefix, node_id);
        let vals: Vec<String> = redis::cmd("LRANGE")
            .arg(key)
            .arg(0)
            .arg(-1)
            .query(&mut con)
            .map_err(|e| anyhow!("Failed to get edges: {}", e))?;

        let mut edges = Vec::new();
        for v in vals {
            edges.push(serde_json::from_str(&v)?);
        }
        Ok(edges)
    }

    fn get_neighbors(&self, node_id: &str) -> Result<Vec<GraphNode>> {
        let edges = self.get_edges(node_id)?;
        let mut neighbors = Vec::new();
        for edge in edges {
            if let Some(node) = self.get_node(&edge.target)? {
                neighbors.push(node);
            }
        }
        Ok(neighbors)
    }
}

// --- Local Memory Implementation (Mock) ---

impl GraphMemoryInterface for LocalMemory {
    fn add_node(&self, _node: GraphNode) -> Result<()> {
        // Mock implementation or use HashMap if needed
        Ok(())
    }

    fn add_edge(&self, _edge: GraphEdge) -> Result<()> {
        Ok(())
    }

    fn get_node(&self, _id: &str) -> Result<Option<GraphNode>> {
        Ok(None)
    }

    fn get_edges(&self, _node_id: &str) -> Result<Vec<GraphEdge>> {
        Ok(vec![])
    }

    fn get_neighbors(&self, _node_id: &str) -> Result<Vec<GraphNode>> {
        Ok(vec![])
    }
}
