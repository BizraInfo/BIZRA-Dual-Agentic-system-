use anyhow::Result;
use bizra_sdk_core::config::{AgentConfig, MemoryConfig, ModelConfig, RedisMemoryConfig};
use bizra_sdk_core::{NodeConfig, NodeKernel};
use std::sync::Arc;

#[tokio::main]
async fn main() -> Result<()> {
    println!("Initializing BIZRA Genesis Node (Verification Mode)...");

    // Configure with Redis (assuming localhost for test)
    // If this fails, we might need to use Local memory (but Graph is mocked there)
    let config = NodeConfig {
        node_id: "verify-node-0".to_string(),
        memory: Some(MemoryConfig::Redis(RedisMemoryConfig {
            url: "redis://127.0.0.1:6379".to_string(), // Try localhost
            prefix: "bizra:verify".to_string(),
        })),
        agents: vec![AgentConfig {
            name: "verified_agent".to_string(),
            model: ModelConfig::Echo {
                id: "echo-1".to_string(),
            }, // Echo model for determinism
        }],
        ..Default::default()
    };

    println!("Creating Kernel...");
    match NodeKernel::new(config) {
        Ok(kernel) => {
            println!("Kernel Created.");

            if let Some(reasoning) = &kernel.reasoning {
                println!("Reasoning Engine: [ACTIVE]");

                let problem = "Optimize the BIZRA SNR";
                println!("Solving problem: '{}'", problem);

                match reasoning.solve(problem) {
                    Ok(solution) => {
                        println!("SUCCESS! Solution generated:");
                        println!("{}", solution);
                        println!("Verification Passed: Graph of Thoughts Engine is operational.");
                    }
                    Err(e) => {
                        eprintln!("FAILURE: Reasoning Engine failed to solve: {}", e);
                    }
                }
            } else {
                eprintln!("FAILURE: Reasoning Engine NOT available (Check Redis connection?)");
            }
        }
        Err(e) => {
            // If Redis fails, we can't fully verify Graph Logic without a real backend.
            eprintln!("Could not create kernel (likely Redis missing?): {}", e);
        }
    }

    Ok(())
}
