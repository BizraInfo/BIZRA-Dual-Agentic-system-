//! BIZRA Node0 - Library modules
//!
//! This crate provides the core functionality for the BIZRA Genesis Node:
//!
//! # Modules
//!
//! - `core` - Infrastructure components (circuit breaker, rate limiter, cache, etc.)
//! - `services` - Business logic services (PoI, assets, resources, knowledge)
//! - `agents` - AI agent orchestration (PAT and SAT)
//! - `api` - API handlers and routes

pub mod agents;
pub mod api;
pub mod core;
pub mod services;
pub mod sovereign_bridge;

use serde::Serialize;
use std::sync::Arc;

/// Application state shared across handlers
#[derive(Clone)]
pub struct AppState {
    pub db_pool: sqlx::PgPool,
    pub ollama_url: String,
    pub node_id: String,
    pub start_time: std::time::Instant,
    pub reasoning: meta_alpha_dual_agentic::reasoning::MultiMethodReasoning,
    pub sat: Arc<agents::sat::SatOrchestrator>,
}

/// Health check response
#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub node_id: String,
    pub version: String,
    pub timestamp: String,
    pub genesis_hash: Option<String>,
}

/// Generic API response wrapper
#[derive(Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: Option<String>,
    pub error: Option<String>,
}

/// Install fail-fast handlers to avoid degraded responses after critical failures.
pub fn install_fail_fast_handlers() {
    std::panic::set_hook(Box::new(|info| {
        eprintln!("FATAL: panic detected - shutting down immediately");
        eprintln!("{}", info);
        std::process::exit(1);
    }));

    // Fail-closed on OS signals where possible.
    tokio::spawn(async {
        #[cfg(unix)]
        {
            use tokio::signal::unix::{signal, SignalKind};
            let mut term = signal(SignalKind::terminate()).expect("install SIGTERM handler");
            let mut int = signal(SignalKind::interrupt()).expect("install SIGINT handler");
            tokio::select! {
                _ = term.recv() => {
                    eprintln!("FATAL: SIGTERM received - shutting down immediately");
                }
                _ = int.recv() => {
                    eprintln!("FATAL: SIGINT received - shutting down immediately");
                }
            }
        }

        #[cfg(not(unix))]
        {
            if tokio::signal::ctrl_c().await.is_ok() {
                eprintln!("FATAL: Ctrl-C received - shutting down immediately");
            }
        }

        std::process::exit(1);
    });
}

/// Hard fail for critical integrity violations.
pub fn fatal_shutdown(reason: &str) -> ! {
    eprintln!("FATAL: {}", reason);
    std::process::exit(1);
}
