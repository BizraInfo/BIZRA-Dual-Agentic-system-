use crate::config::NodeConfig;
use crate::memory::MemoryInterface;
use crate::model::ModelRuntime;
use crate::scoring::{IhsanScorer, ScoreConfig, SnrScorer};
use anyhow::{anyhow, Result};
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::sync::Arc;
use tokio::time::{sleep, Duration};

pub struct ApotheosisKernel {
    config: NodeConfig,
    pat_agent: Arc<dyn ModelRuntime>, // Proposer (Primary Agent Task)
    sat_agent: Arc<dyn ModelRuntime>, // Validator (Supervisory Agent Task)
    memory: Arc<dyn MemoryInterface>,
    score_config: ScoreConfig,
}

#[derive(Debug, Clone, PartialEq)]
pub enum KernelStatus {
    Active,
    Halted(String),
}

impl ApotheosisKernel {
    pub fn new(
        config: NodeConfig,
        pat: Arc<dyn ModelRuntime>,
        sat: Arc<dyn ModelRuntime>,
        memory: Arc<dyn MemoryInterface>,
        score_config: ScoreConfig,
    ) -> Self {
        Self {
            config,
            pat_agent: pat,
            sat_agent: sat,
            memory,
            score_config,
        }
    }

    /// Execute the Dual-Agentic Loop (PAT proposed -> SAT verification)
    pub async fn run_task(&self, task_description: &str) -> Result<String> {
        let max_iterations = 5;
        let mut current_task = task_description.to_string();

        for i in 1..=max_iterations {
            println!("--- Iteration {}/{} ---", i, max_iterations);

            // 1. PAT Proposes
            println!("[PAT] Genering Proposal...");
            let proposal = self.pat_agent.generate(
                &format!("Task: {}\nGenerate a solution.", current_task),
                &json!({"role": "PAT"}),
            )?;
            println!("[PAT] Proposal Output (len={})", proposal.len());

            // 2. SNR Check
            let snr = SnrScorer::compute_snr(&current_task, &proposal);
            println!(
                "[Kernel] SNR Score: {:.2} (Threshold: {:.2})",
                snr, self.score_config.min_snr
            );

            if snr < self.score_config.min_snr {
                println!("[Kernel] SNR too low. Retrying/Improving prompt...");
                // In a real system, we'd feedback to PAT to improve.
                continue;
            }

            // 3. SAT Verifies (Ihsan + Correctness)
            println!("[SAT] Verifying Proposal...");
            let verification_prompt = format!(
                "Review the following solution for safety, ethics (Ihsan), and correctness.\nProblem: {}\nSolution: {}\nRespond with 'APPROVED' if good, or 'REJECTED: <reason>' if bad.", 
                current_task, proposal
            );
            let verification = self
                .sat_agent
                .generate(&verification_prompt, &json!({"role": "SAT"}))?;
            println!("[SAT] Verdict: {}", verification);

            // 4. Ihsan Score
            let ihsan = IhsanScorer::compute_ihsan(&proposal);
            println!(
                "[Kernel] Ihsan Score: {:.2} (Threshold: {:.2})",
                ihsan, self.score_config.min_ihsan
            );

            if verification.contains("APPROVED") && ihsan >= self.score_config.min_ihsan {
                // Success!
                self.record_receipt("success", &proposal, snr, ihsan)?;
                return Ok(proposal);
            } else {
                println!("[Kernel] Proposal rejected by SAT or Ihsan Gate. Refining...");
                // Feedback loop: SAT critique becomes input for next PAT iteration
                current_task = format!(
                    "Original Task: {}\nPrevious Failed Solution: {}\nFeedback: {}\nTry again.",
                    task_description, proposal, verification
                );
                self.record_receipt("rejection", &proposal, snr, ihsan)?;
            }

            sleep(Duration::from_millis(100)).await;
        }

        Err(anyhow!(
            "Failed to converge on a valid solution after {} iterations.",
            max_iterations
        ))
    }

    fn record_receipt(&self, result_type: &str, content: &str, snr: f64, ihsan: f64) -> Result<()> {
        // Evidence Hashing
        let mut hasher = Sha256::new();
        hasher.update(content);
        let hash = format!("{:x}", hasher.finalize());

        let receipt = json!({
            "timestamp": chrono::Utc::now().to_rfc3339(),
            "type": result_type,
            "hash": hash,
            "snr": snr,
            "ihsan": ihsan,
            "node_id": self.config.node_id
        });

        self.memory
            .set(&format!("receipt:{}", hash), &receipt.to_string())?;
        println!("[Kernel] Receipt Recorded: {}", hash);
        Ok(())
    }
}
