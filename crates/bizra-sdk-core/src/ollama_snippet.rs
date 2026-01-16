use super::ModelRuntime;
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[cfg(feature = "ollama")]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaModelSpec {
    pub name: String,
    pub model: String,
    #[serde(default = "default_base_url")]
    pub base_url: String,
    #[serde(default)]
    pub options: Option<serde_json::Value>,
}

fn default_base_url() -> String {
    "http://localhost:11434".to_string()
}

#[cfg(feature = "ollama")]
pub struct OllamaModel {
    spec: OllamaModelSpec,
}

#[cfg(feature = "ollama")]
impl OllamaModel {
    pub fn new(spec: OllamaModelSpec) -> Self {
        Self { spec }
    }
}

#[cfg(feature = "ollama")]
impl ModelRuntime for OllamaModel {
    fn name(&self) -> &str {
        &self.spec.name
    }

    fn generate(&self, prompt: &str, context: &Value) -> Result<String> {
        let url = format!("{}/api/generate", self.spec.base_url);

        let system_prompt = format!(
            "Context: {}\n\nYou are a BIZRA Personal Node Agent.",
            context
        );

        let body = serde_json::json!({
            "model": self.spec.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": false,
            "options": self.spec.options
        });

        let resp: serde_json::Value = ureq::post(&url)
            .send_json(body)
            .map_err(|e| anyhow!("Ollama request failed: {}", e))?
            .into_json()?;

        let response_text = resp["response"]
            .as_str()
            .ok_or_else(|| anyhow!("Invalid response from Ollama"))?
            .to_string();

        Ok(response_text)
    }
}

// Re-export specific structs for config usage (needs Conditional compilation handling in config.rs)
