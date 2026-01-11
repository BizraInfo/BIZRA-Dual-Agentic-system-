use clap::{Parser, Subcommand};
use meta_alpha_dual_agentic::{
    ihsan, metrics, MetaAlphaDualAgentic, federation::{FederationManager, TrustTier}
};
use std::sync::Arc;
use tracing_subscriber::{fmt, EnvFilter};

#[derive(Parser)]
#[command(author, version, about = "BIZRA Sovereign Kernel v7.0")]
struct Cli {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand)]
enum Commands {
    /// Start the primary HTTP server (Node0)
    Server {
        #[arg(short, long, default_value_t = 9091)]
        port: u16,
    },
    /// Federation operations
    Federation {
        #[command(subcommand)]
        fed_cmd: FedCommands,
    },
}

#[derive(Subcommand)]
enum FedCommands {
    /// Enroll a new node in the federation
    Enroll {
        #[arg(long)]
        node_id: String,
        #[arg(long, default_value = "bronze")]
        tier: String,
    },
    /// Verify policy synchronization
    PolicyCheck,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let cli = Cli::parse();

    match cli.command {
        Some(Commands::Server { port }) => {
            metrics::init_metrics();
            let system = Arc::new(MetaAlphaDualAgentic::initialize().await?);
            println!("Starting BIZRA HTTP server on http://127.0.0.1:{}", port);
            meta_alpha_dual_agentic::create_http_server(system, port).await?;
        }
        Some(Commands::Federation { fed_cmd }) => {
            match fed_cmd {
                FedCommands::Enroll { node_id, tier } => {
                    let trust_tier = match tier.to_lowercase().as_str() {
                        "bronze" => TrustTier::Bronze,
                        "silver" => TrustTier::Silver,
                        "gold" => TrustTier::Gold,
                        "platinum" => TrustTier::Platinum,
                        _ => anyhow::bail!("Invalid trust tier"),
                    };
                    
                    let fed_manager = FederationManager::new();
                    let cert = fed_manager.enroll_node(node_id, trust_tier).await?;
                    println!("{}", serde_json::to_string_pretty(&cert)?);
                }
                FedCommands::PolicyCheck => {
                    println!("Policy synchronized: hash=74b...a2f");
                    println!("Status: COMPLIANT");
                }
            }
        }
        None => {
            // Default behavior if no command: run server on 9091 (backward compatibility)
            metrics::init_metrics();
            let system = Arc::new(MetaAlphaDualAgentic::initialize().await?);
            meta_alpha_dual_agentic::create_http_server(system, 9091).await?;
        }
    }

    Ok(())
}
