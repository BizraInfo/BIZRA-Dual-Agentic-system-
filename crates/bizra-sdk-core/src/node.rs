use crate::config::{MemoryConfig, ModelConfig, NodeConfig};
use crate::graph_memory::GraphMemoryInterface;
#[cfg(feature = "memory")]
use crate::memory::RedisMemory;
use crate::memory::{LocalMemory, MemoryInterface};
#[cfg(feature = "ollama")]
use crate::model::OllamaModel;
use crate::model::{EchoModel, ModelRuntime, ProcessModel};
use crate::reasoning::ReasoningEngine;
use anyhow::{anyhow, Result};
use serde_json::{json, Value};
use std::collections::HashMap;
use std::sync::Arc;

pub struct NodeKernel {
    config: NodeConfig,
    models: HashMap<String, Arc<dyn ModelRuntime>>,
    memory: Arc<dyn MemoryInterface>,
    pub reasoning: Option<Arc<ReasoningEngine>>,
}

impl NodeKernel {
    pub fn new(config: NodeConfig) -> Result<Self> {
        let mut models = HashMap::new();

        for agent in &config.agents {
            let runtime: Arc<dyn ModelRuntime> = match &agent.model {
                ModelConfig::Echo { id } => Arc::new(EchoModel::new(id)),
                ModelConfig::Process(spec) => Arc::new(ProcessModel::new(spec.clone())),
                #[cfg(feature = "ollama")]
                ModelConfig::Ollama(spec) => Arc::new(OllamaModel::new(spec.clone())),
                // If feature is disabled but config has it (should generally fail parsing if cfg is off on struct)
                // but handle just in case or compiler check
                #[cfg(not(feature = "ollama"))]
                ModelConfig::Ollama(_) => return Err(anyhow!("Ollama feature not enabled")),
            };
            models.insert(agent.name.clone(), runtime);
        }

        let (memory, graph_memory): (
            Arc<dyn MemoryInterface>,
            Option<Arc<dyn GraphMemoryInterface>>,
        ) = match &config.memory {
            #[cfg(feature = "memory")]
            Some(MemoryConfig::Redis(conf)) => {
                let rm = Arc::new(RedisMemory::new(conf.clone())?);
                (rm.clone(), Some(rm))
            }
            Some(MemoryConfig::Local) | None => {
                let lm = Arc::new(LocalMemory::new());
                (lm.clone(), Some(lm))
            }
            #[cfg(not(feature = "memory"))]
            Some(MemoryConfig::Redis(_)) => return Err(anyhow!("Memory feature not enabled")),
        };

        let reasoning = if let Some(gm) = graph_memory {
            // Use the first available model for reasoning, or a specific one if configured?
            // For now, pick the first one.
            if let Some(model) = models.values().next() {
                Some(Arc::new(ReasoningEngine::new(gm, model.clone())))
            } else {
                None
            }
        } else {
            None
        };

        Ok(Self {
            config,
            models,
            memory,
            reasoning,
        })
    }

    pub fn run_agent(&self, agent_name: &str, task: &str) -> Result<String> {
        let model = self
            .models
            .get(agent_name)
            .ok_or_else(|| anyhow!("Agent '{}' not found", agent_name))?;

        // Context passes the node_id for identification
        let context = json!({
            "node_id": self.config.node_id,
            "agent": agent_name,
            "timestamp": chrono::Utc::now().to_rfc3339()
        });

        model.generate(task, &context)
    }

    // ACP Protocol Handler (Simplified)
    // Takes a JSON-RPC request body, executes tool/agent, returns JSON-RPC response
    pub fn handle_acp_request(&self, request: &Value) -> Result<Value> {
        // Very basic dispatch for "agent.generate"
        let method = request.get("method").and_then(|s| s.as_str()).unwrap_or("");
        let id = request.get("id");

        if method == "agent.generate" {
            let empty_params = json!({});
            let params = request.get("params").unwrap_or(&empty_params);
            let agent = params
                .get("agent_name")
                .and_then(|s| s.as_str())
                .unwrap_or("default"); // Use first agent
            let prompt = params.get("prompt").and_then(|s| s.as_str()).unwrap_or("");

            // If agent name "default", pick the first one from config
            let target_agent = if agent == "default" {
                self.config
                    .agents
                    .first()
                    .map(|a| a.name.as_str())
                    .unwrap_or("unknown")
            } else {
                agent
            };

            match self.run_agent(target_agent, prompt) {
                Ok(result) => Ok(json!({
                    "jsonrpc": "2.0",
                    "id": id,
                    "result": { "text": result }
                })),
                Err(e) => Ok(json!({
                    "jsonrpc": "2.0",
                    "id": id,
                    "error": { "code": -32000, "message": e.to_string() }
                })),
            }
        } else {
            Ok(json!({
                "jsonrpc": "2.0",
                "id": id,
                "error": { "code": -32601, "message": "Method not found" }
            }))
        }
    }
}
