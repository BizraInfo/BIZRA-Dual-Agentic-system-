use anyhow::Result;
use bizra_sdk_core::{NodeConfig, NodeKernel};
use clap::{Parser, Subcommand};
use std::io::{self, BufRead};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "bizra-sdk")]
#[command(about = "BIZRA Personal Node CLI")]
struct Cli {
    #[command(subcommand)]
    command: Commands,

    #[arg(short, long, default_value = "config.yaml")]
    config: PathBuf,
}

#[derive(Subcommand)]
enum Commands {
    /// Run a single task with an agent
    Run {
        #[arg(short, long)]
        agent: String,
        task: String,
    },
    /// Start in Agent Client Protocol (ACP) mode for Ralph
    Agent {
        #[arg(short, long, default_value = "default")]
        name: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    // Load config or create default if missing (for demo purposes)
    let config = if cli.config.exists() {
        NodeConfig::load(&cli.config)?
    } else {
        // Fallback or error. For now, create a dummy config in memory for testing
        eprintln!("Config file not found, using default ECHO config.");
        bizra_sdk_core::config::NodeConfig {
            node_id: "local-node-0".to_string(),
            agents: vec![bizra_sdk_core::config::AgentConfig {
                name: "default".to_string(),
                model: bizra_sdk_core::config::ModelConfig::Echo {
                    id: "echo-1".to_string(),
                },
            }],
            memory: None,
        }
    };

    let kernel = NodeKernel::new(config)?;

    match cli.command {
        Commands::Run { agent, task } => {
            let result = kernel.run_agent(&agent, &task)?;
            println!("{}", result);
        }
        Commands::Agent { name: _ } => {
            // ACP Loop: Read JSON-RPC from stdin, write response to stdout
            let stdin = io::stdin();
            for line in stdin.lock().lines() {
                let line = line?;
                if line.trim().is_empty() {
                    continue;
                }

                let req: serde_json::Value = serde_json::from_str(&line)?;
                let resp = kernel.handle_acp_request(&req)?;
                println!("{}", serde_json::to_string(&resp)?);
            }
        }
    }

    Ok(())
}
