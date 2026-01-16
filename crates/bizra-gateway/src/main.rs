// crates/bizra-gateway/src/main.rs
use actix_web::{web, App, HttpResponse, HttpServer, Responder};
use bizra_gateway::bifurcator::{Bifurcator, LiveRequest};
use std::sync::Arc;
use tokio::sync::Mutex;
use uuid::Uuid;

struct AppState {
    bifurcator: Bifurcator,
}

async fn handle_query(
    data: web::Data<AppState>,
    req_json: web::Json<serde_json::Value>,
) -> impl Responder {
    let query = req_json
        .get("query")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();
    let request_id = Uuid::new_v4().to_string();

    // Check X-BIZRA-ROUTE header? (Simplification: using query param or default logic for now)
    // Runbook mentioned header override. Let's stick to logic.

    let req = LiveRequest {
        query,
        user_tier: "T1".to_string(), // Default to T1 for now
        request_id,
    };

    let response = data.bifurcator.handle(req).await;
    HttpResponse::Ok().json(response)
}

async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({"status": "live", "pulse": "active"}))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Config from Env
    let canary_pct = std::env::var("CANARY_PCT")
        .unwrap_or("0.01".to_string())
        .parse()
        .unwrap_or(0.01);
    let shadow_mode = std::env::var("SHADOW_MODE").unwrap_or("true".to_string()) == "true";

    println!("🔥 First Pulse Gateway Starting...");
    println!("   Canary: {}%", canary_pct * 100.0);
    println!("   Shadow Mode: {}", shadow_mode);

    let bifurcator = Bifurcator::new(0.5, canary_pct, shadow_mode);
    let state = web::Data::new(AppState { bifurcator });

    HttpServer::new(move || {
        App::new()
            .app_data(state.clone())
            .route("/v1/query", web::post().to(handle_query))
            .route("/health", web::get().to(health))
    })
    .bind(("0.0.0.0", 8081))?
    .run()
    .await
}
