use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeConfig {
    pub node_id: String,
    pub agents: Vec<AgentConfig>,
    #[serde(default)]
    pub memory: Option<MemoryConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum MemoryConfig {
    #[cfg(feature = "memory")]
    Redis(crate::memory::RedisMemoryConfig),
    Local,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfig {
    pub name: String,
    pub model: ModelConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ModelConfig {
    Echo {
        id: String,
    },
    Process(crate::model::ProcessModelSpec),
    #[cfg(feature = "ollama")]
    Ollama(crate::model::OllamaModelSpec),
}

impl NodeConfig {
    pub fn load(path: &Path) -> Result<Self> {
        let content = std::fs::read_to_string(path)
            .with_context(|| format!("Failed to read config from {:?}", path))?;
        let config: NodeConfig =
            serde_yaml::from_str(&content).context("Failed to parse YAML config")?;
        Ok(config)
    }
}
