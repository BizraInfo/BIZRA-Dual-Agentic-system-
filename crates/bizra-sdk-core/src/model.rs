use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::io::Write;
use std::process::{Command, Stdio};

/// Unified model runtime abstraction.
pub trait ModelRuntime: Send + Sync {
    fn name(&self) -> &str;
    fn generate(&self, prompt: &str, context: &Value) -> Result<String>;
}

/// A trivial placeholder model for tests.
pub struct EchoModel {
    pub id: String,
}

impl EchoModel {
    pub fn new(id: impl Into<String>) -> Self {
        Self { id: id.into() }
    }
}

impl ModelRuntime for EchoModel {
    fn name(&self) -> &str {
        &self.id
    }

    fn generate(&self, prompt: &str, _context: &Value) -> Result<String> {
        Ok(format!("ECHO: {prompt}"))
    }
}

/// Process-backed model runtime (local binaries).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessModelSpec {
    pub name: String,
    pub command: String,
    #[serde(default)]
    pub args: Vec<String>,
    #[serde(default = "default_max_output_bytes")]
    pub max_output_bytes: usize,
}

fn default_max_output_bytes() -> usize {
    2 * 1024 * 1024
}

pub struct ProcessModel {
    spec: ProcessModelSpec,
}

impl ProcessModel {
    pub fn new(spec: ProcessModelSpec) -> Self {
        Self { spec }
    }
}

impl ModelRuntime for ProcessModel {
    fn name(&self) -> &str {
        &self.spec.name
    }

    fn generate(&self, prompt: &str, context: &Value) -> Result<String> {
        let mut child = Command::new(&self.spec.command)
            .args(&self.spec.args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .map_err(|e| anyhow!("spawn failed for '{}': {}", self.spec.command, e))?;

        if let Some(mut stdin) = child.stdin.take() {
            // Write prompt + newline + context + newline
            stdin.write_all(prompt.as_bytes())?;
            stdin.write_all(b"\n")?;
            stdin.write_all(context.to_string().as_bytes())?;
            stdin.write_all(b"\n")?;
        }

        let output = child.wait_with_output()?;
        if !output.status.success() {
            let err = String::from_utf8_lossy(&output.stderr);
            return Err(anyhow!("process exited {}: {}", output.status, err));
        }

        // Safety: truncate output
        let mut out = output.stdout;
        if out.len() > self.spec.max_output_bytes {
            out.truncate(self.spec.max_output_bytes);
        }

        Ok(String::from_utf8_lossy(&out).trim().to_string())
    }
}

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

#[cfg(feature = "ollama")]
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

        // Use ureq for sync HTTP
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
