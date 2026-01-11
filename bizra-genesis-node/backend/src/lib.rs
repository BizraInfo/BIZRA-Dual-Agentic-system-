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
