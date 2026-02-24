use anyhow::Result;
use chrono::Utc;
use redis::{cmd, AsyncCommands, Client as RedisClient};
use serde::Serialize;
use sqlx::PgPool;
use std::{
    env,
    sync::Arc,
    time::{Duration, Instant},
};
use sysinfo::System;

use bizra_node0::{
    agents::sat::SatAgent,
    services::{
        poi_ledger::{PoiLedger, PoiStats},
        resource_pool::ResourcePoolService,
    },
    AppState,
};
use tracing::warn;

/// Shared telemetry snapshot delivered to observability clients.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TelemetrySnapshot {
    pub timestamp: String,
    pub node_id: String,
    pub uptime_seconds: u64,
    pub cpu_usage_percent: f32,
    pub memory: MemoryMetrics,
    pub disk: DiskMetrics,
    pub poi_stats: PoiStats,
    pub services: Vec<NamedServiceStatus>,
    pub resource_pool: Option<ResourcePoolTelemetry>,
    pub sat_agents: Vec<SatAgent>,
}

/// Memory usage metrics derived from `sysinfo`.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MemoryMetrics {
    pub total_gb: f64,
    pub used_gb: f64,
    pub available_gb: f64,
    pub usage_percent: f64,
}

/// Disk usage metrics derived from `sysinfo`.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DiskMetrics {
    pub total_gb: f64,
    pub used_gb: f64,
    pub available_gb: f64,
    pub usage_percent: f64,
}

/// Health of an individual service.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct NamedServiceStatus {
    pub name: String,
    pub status: String,
    pub latency_ms: Option<u64>,
}

/// Snapshot of the resource pool.
#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ResourcePoolTelemetry {
    pub status: String,
    pub cpu_cores_total: i32,
    pub cpu_cores_allocated: i32,
    pub storage_total_gb: f64,
    pub storage_allocated_gb: f64,
    pub total_compute_hours: f64,
    pub total_tasks_processed: Option<i32>,
    pub total_bzc_earned: f64,
    pub gpu_enabled: Option<bool>,
}

/// Build a telemetry snapshot with live metrics, database stats, and runtime metadata.
pub async fn collect_snapshot(state: &Arc<AppState>) -> Result<TelemetrySnapshot> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let timestamp = Utc::now().to_rfc3339();
    let uptime_seconds = state.start_time.elapsed().as_secs();
    let cpu_usage_percent = sys.global_cpu_info().cpu_usage();

    let total_mem = sys.total_memory() as f64 / 1_073_741_824.0;
    let used_mem = sys.used_memory() as f64 / 1_073_741_824.0;
    let available_mem = sys.available_memory() as f64 / 1_073_741_824.0;

    let memory = MemoryMetrics {
        total_gb: round_two(total_mem),
        used_gb: round_two(used_mem),
        available_gb: round_two(available_mem),
        usage_percent: if total_mem > 0.0 {
            round_two((used_mem / total_mem) * 100.0)
        } else {
            0.0
        },
    };

    let mut disk_total = 0u64;
    let mut disk_available = 0u64;
    // Iterate disks (disabled due to sysinfo version mismatch)
    // for disk in sys.disks() {
    //     disk_total += disk.total_space();
    //     disk_available += disk.available_space();
    // }
    let disk_total_f64 = disk_total as f64 / 1_073_741_824.0;
    let disk_available_f64 = disk_available as f64 / 1_073_741_824.0;
    let disk = DiskMetrics {
        total_gb: round_two(disk_total_f64),
        used_gb: round_two((disk_total - disk_available) as f64 / 1_073_741_824.0),
        available_gb: round_two(disk_available_f64),
        usage_percent: 0.0,
    };

    let poi_service = PoiLedger::new(state.db_pool.clone());
    let poi_stats = poi_service.get_stats("NODE0-USER").await?;

    let services = collect_service_statuses(state).await;

    let resource_pool = ResourcePoolService::new(state.db_pool.clone())
        .get_status()
        .await
        .ok()
        .flatten()
        .map(|pool| ResourcePoolTelemetry {
            status: pool.status,
            cpu_cores_total: pool.cpu_cores_total,
            cpu_cores_allocated: pool.cpu_cores_allocated,
            storage_total_gb: pool.storage_total_gb,
            storage_allocated_gb: pool.storage_allocated_gb,
            total_compute_hours: pool.total_compute_hours,
            total_tasks_processed: pool.total_tasks_processed,
            total_bzc_earned: pool.total_bzc_earned,
            gpu_enabled: pool.gpu_enabled,
        });

    Ok(TelemetrySnapshot {
        timestamp,
        node_id: state.node_id.clone(),
        uptime_seconds,
        cpu_usage_percent,
        memory,
        disk,
        poi_stats,
        services,
        resource_pool,
        sat_agents: state.sat.get_agents(),
    })
}

/// Check database, LLM, and cache health.
async fn collect_service_statuses(state: &Arc<AppState>) -> Vec<NamedServiceStatus> {
    let mut statuses = Vec::with_capacity(3);
    statuses.push(check_postgres_status(&state.db_pool).await);
    statuses.push(check_ollama_status(&state.ollama_url).await);
    if let Ok(redis_url) = env::var("REDIS_URL") {
        statuses.push(check_redis_status(&redis_url).await);
    }
    statuses
}

pub async fn check_postgres_status(pool: &PgPool) -> NamedServiceStatus {
    let start = Instant::now();
    let status = if sqlx::query("SELECT 1").fetch_one(pool).await.is_ok() {
        "healthy"
    } else {
        warn!("Postgres health check failed");
        "unhealthy"
    };
    NamedServiceStatus {
        name: "postgres".into(),
        status: status.to_string(),
        latency_ms: Some(elapsed_ms(start)),
    }
}

pub async fn check_ollama_status(url: &str) -> NamedServiceStatus {
    let start = Instant::now();
    let (status, latency) = match check_ollama_health(url).await {
        Ok(_) => ("healthy".to_string(), Some(elapsed_ms(start))),
        Err(err) => {
            warn!("Ollama health check failed: {}", err);
            ("unhealthy".to_string(), None)
        }
    };
    NamedServiceStatus {
        name: "ollama".into(),
        status,
        latency_ms: latency,
    }
}

pub async fn check_redis_status(url: &str) -> NamedServiceStatus {
    let mut service_status = "unconfigured".to_string();
    let mut latency = None;

    if let Ok(client) = RedisClient::open(url) {
        let start = Instant::now();
        match client.get_multiplexed_async_connection().await {
            Ok(mut conn) => match cmd("PING").query_async::<String>(&mut conn).await {
                Ok(_) => {
                    service_status = "healthy".to_string();
                    latency = Some(elapsed_ms(start));
                }
                Err(err) => {
                    warn!("Redis ping failed: {}", err);
                    service_status = "unhealthy".to_string();
                }
            },
            Err(err) => {
                warn!("Redis connection failed: {}", err);
                service_status = "unhealthy".to_string();
            }
        }
    }

    NamedServiceStatus {
        name: "redis".into(),
        status: service_status,
        latency_ms: latency,
    }
}

pub async fn check_ollama_health(url: &str) -> Result<usize> {
    let client = reqwest::Client::new();
    let response = client
        .get(format!("{}/api/tags", url))
        .timeout(Duration::from_secs(5))
        .send()
        .await?
        .error_for_status()?;

    #[derive(serde::Deserialize)]
    struct OllamaTagsResponse {
        models: Vec<serde_json::Value>,
    }

    let tags: OllamaTagsResponse = response.json().await?;
    Ok(tags.models.len())
}

fn round_two(value: f64) -> f64 {
    (value * 100.0).round() / 100.0
}

fn elapsed_ms(start: Instant) -> u64 {
    start.elapsed().as_millis() as u64
}
