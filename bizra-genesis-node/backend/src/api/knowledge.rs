//! BIZRA Knowledge API - API Endpoints
//!
//! REST API for both Hypergraph RAG and Insights knowledge graph.
use crate::services::knowledge::{knowledge_client, KnowledgeResult, KnowledgeSource};
use axum::{
    extract::{Path, Query},
    http::StatusCode,
    response::Json,
    routing::get,
    Router,
};
use serde::{Deserialize, Serialize};

// ============================================================
// INSIGHTS KNOWLEDGE GRAPH ENDPOINTS (for bizra.ai/bizra.info)
// ============================================================

use chrono::{Datelike, Utc};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

/// Graph statistics response
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GraphStats {
    pub total_nodes: usize,
    pub total_relationships: usize,
    pub quranic_verses: usize,
    pub hadith_count: usize,
    pub insights: usize,
    pub categories: HashMap<String, usize>,
    pub last_updated: String,
}

/// Daily insight response
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DailyInsight {
    pub id: String,
    pub category: String,
    pub header: String,
    pub content: String,
    pub arabic: Option<String>,
    pub source: String,
    pub confidence: f64,
    pub word_count: usize,
    pub contains_arabic: bool,
}

/// Recent discovery item
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RecentDiscovery {
    pub id: String,
    pub category: String,
    pub header: String,
    pub summary: String,
    pub timestamp: String,
    pub confidence: f64,
}

/// Knowledge graph structure loaded from JSON
#[derive(Debug, Serialize, Deserialize, Clone)]
struct InsightsGraph {
    metadata: GraphMetadata,
    stats: GraphStatsRaw,
    nodes: Vec<GraphNode>,
    relationships: Vec<GraphRelationship>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct GraphMetadata {
    name: String,
    description: String,
    created_at: String,
    philosophy: String,
    files_processed: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct GraphStatsRaw {
    total_nodes: usize,
    total_relationships: usize,
    categories: HashMap<String, usize>,
    documents: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct GraphNode {
    node_id: String,
    node_type: String,
    properties: NodeProperties,
    labels: Vec<String>,
    source: String,
    confidence: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct NodeProperties {
    #[serde(default)]
    title: Option<String>,
    #[serde(default)]
    header: Option<String>,
    #[serde(default)]
    content: Option<String>,
    #[serde(default)]
    summary: Option<String>,
    #[serde(default)]
    category: Option<String>,
    #[serde(default)]
    source_file: Option<String>,
    #[serde(default)]
    word_count: Option<usize>,
    #[serde(default)]
    contains_arabic: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct GraphRelationship {
    from_node: String,
    to_node: String,
    rel_type: String,
}

fn truncate_with_ellipsis(input: &str, max_chars: usize) -> String {
    let mut iter = input.chars();
    let mut truncated: String = iter.by_ref().take(max_chars).collect();
    if iter.next().is_some() {
        truncated.push_str("...");
    }
    truncated
}

/// Load the insights graph from JSON file
fn load_insights_graph() -> Result<InsightsGraph, String> {
    let path = PathBuf::from(
        "/root/bizra-genesis/knowledge_graph_output/insights/bizra_insights_graph.json",
    );

    if !path.exists() {
        return Err(format!("Insights graph not found at: {}", path.display()));
    }

    let content =
        fs::read_to_string(&path).map_err(|e| format!("Failed to read insights graph: {}", e))?;

    let graph: InsightsGraph = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse insights graph: {}", e))?;

    Ok(graph)
}

/// GET /api/knowledge/stats
pub async fn get_stats_handler() -> Result<Json<GraphStats>, StatusCode> {
    match load_insights_graph() {
        Ok(graph) => {
            let stats = GraphStats {
                total_nodes: graph.stats.total_nodes,
                total_relationships: graph.stats.total_relationships,
                quranic_verses: 6236,
                hadith_count: 34178,
                insights: graph.stats.total_nodes,
                categories: graph.stats.categories.clone(),
                last_updated: graph.metadata.created_at.clone(),
            };
            Ok(Json(stats))
        }
        Err(e) => {
            tracing::error!("Failed to load insights graph: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// GET /api/knowledge/daily-insight
pub async fn get_daily_insight_handler() -> Result<Json<DailyInsight>, StatusCode> {
    match load_insights_graph() {
        Ok(graph) => {
            let day_of_year = Utc::now().ordinal() as usize;
            let insight_nodes: Vec<&GraphNode> = graph
                .nodes
                .iter()
                .filter(|n| n.labels.contains(&"Insight".to_string()))
                .collect();

            if insight_nodes.is_empty() {
                return Err(StatusCode::NOT_FOUND);
            }

            let idx = day_of_year % insight_nodes.len();
            let node = insight_nodes[idx];

            let insight = DailyInsight {
                id: node.node_id.clone(),
                category: node
                    .properties
                    .category
                    .as_ref()
                    .unwrap_or(&"insight".to_string())
                    .clone(),
                header: node
                    .properties
                    .header
                    .as_ref()
                    .or(node.properties.title.as_ref())
                    .unwrap_or(&"Unknown".to_string())
                    .clone(),
                content: node
                    .properties
                    .content
                    .as_ref()
                    .or(node.properties.summary.as_ref())
                    .unwrap_or(&"No content available".to_string())
                    .clone(),
                arabic: None,
                source: node
                    .properties
                    .source_file
                    .as_ref()
                    .unwrap_or(&"Unknown".to_string())
                    .clone(),
                confidence: node.confidence,
                word_count: node.properties.word_count.unwrap_or(0),
                contains_arabic: node.properties.contains_arabic.unwrap_or(false),
            };

            Ok(Json(insight))
        }
        Err(e) => {
            tracing::error!("Failed to load insights graph: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// GET /api/knowledge/discoveries
pub async fn get_discoveries_handler() -> Result<Json<Vec<RecentDiscovery>>, StatusCode> {
    match load_insights_graph() {
        Ok(graph) => {
            let limit = 10;
            let discoveries: Vec<RecentDiscovery> = graph
                .nodes
                .iter()
                .filter(|n| {
                    n.properties
                        .category
                        .as_ref()
                        .map(|c| c == "vision" || c == "philosophy" || c == "learning")
                        .unwrap_or(false)
                })
                .take(limit)
                .map(|node| {
                    let header = node
                        .properties
                        .header
                        .as_ref()
                        .or(node.properties.title.as_ref())
                        .unwrap_or(&"Unknown".to_string())
                        .clone();

                    let content = node
                        .properties
                        .content
                        .as_ref()
                        .or(node.properties.summary.as_ref())
                        .unwrap_or(&"".to_string())
                        .clone();

                    let summary = truncate_with_ellipsis(&content, 200);

                    RecentDiscovery {
                        id: node.node_id.clone(),
                        category: node
                            .properties
                            .category
                            .as_ref()
                            .unwrap_or(&"insight".to_string())
                            .clone(),
                        header,
                        summary,
                        timestamp: graph.metadata.created_at.clone(),
                        confidence: node.confidence,
                    }
                })
                .collect();

            Ok(Json(discoveries))
        }
        Err(e) => {
            tracing::error!("Failed to load insights graph: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

/// GET /api/knowledge/graph-data
pub async fn get_graph_data_handler() -> Result<Json<serde_json::Value>, StatusCode> {
    match load_insights_graph() {
        Ok(graph) => {
            let graph_data = serde_json::json!({
                "metadata": {
                    "name": graph.metadata.name,
                    "description": graph.metadata.description,
                    "philosophy": graph.metadata.philosophy,
                    "created_at": graph.metadata.created_at,
                },
                "stats": {
                    "total_nodes": graph.stats.total_nodes,
                    "total_relationships": graph.stats.total_relationships,
                    "categories": graph.stats.categories,
                },
                "nodes": graph.nodes.iter().take(100).collect::<Vec<_>>(),
                "relationships": graph.relationships.iter().take(100).collect::<Vec<_>>(),
            });

            Ok(Json(graph_data))
        }
        Err(e) => {
            tracing::error!("Failed to load insights graph: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// ============================================================
// HYPERGRAPH RAG ENDPOINTS (legacy knowledge APIs)
// ============================================================

#[derive(Debug, Deserialize)]
pub struct KnowledgeQueryParams {
    pub q: String,
}

#[derive(Debug, Deserialize)]
pub struct KnowledgeEnrichParams {
    pub q: String,
    #[serde(default)]
    pub max_tokens: Option<usize>,
}

#[derive(Debug, Serialize)]
struct EnrichResponse {
    enriched_prompt: String,
}

#[derive(Debug, Serialize)]
struct KnowledgeStatus {
    available: bool,
}

async fn knowledge_query_handler(
    Query(params): Query<KnowledgeQueryParams>,
) -> Result<Json<KnowledgeResult>, StatusCode> {
    let client = knowledge_client().await;
    match client.query(&params.q).await {
        Ok(result) => Ok(Json(result)),
        Err(e) => {
            tracing::error!(error = ?e, "Hypergraph query failed");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn knowledge_enrich_handler(
    Query(params): Query<KnowledgeEnrichParams>,
) -> Result<Json<EnrichResponse>, StatusCode> {
    let client = knowledge_client().await;
    let max_tokens = params.max_tokens.unwrap_or(2000);
    let enriched = client.enrich_prompt(&params.q, max_tokens).await;
    Ok(Json(EnrichResponse {
        enriched_prompt: enriched,
    }))
}

async fn knowledge_concepts_handler(
    Path(concept): Path<String>,
) -> Result<Json<Vec<KnowledgeSource>>, StatusCode> {
    let client = knowledge_client().await;
    match client.find_by_concept(&concept).await {
        Ok(sources) => Ok(Json(sources)),
        Err(e) => {
            tracing::warn!(error = ?e, "Failed to find concept sources");
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

async fn knowledge_status_handler() -> Result<Json<KnowledgeStatus>, StatusCode> {
    let client = knowledge_client().await;
    let status = KnowledgeStatus {
        available: client.is_available(),
    };
    Ok(Json(status))
}

/// Router that wires up both hypergraph and insights endpoints
pub fn knowledge_router<S>() -> Router<S>
where
    S: Clone + Send + Sync + 'static,
{
    Router::new()
        .route("/stats", get(get_stats_handler))
        .route("/daily-insight", get(get_daily_insight_handler))
        .route("/discoveries", get(get_discoveries_handler))
        .route("/graph-data", get(get_graph_data_handler))
        .route("/query", get(knowledge_query_handler))
        .route("/enrich", get(knowledge_enrich_handler))
        .route("/concepts/:concept", get(knowledge_concepts_handler))
        .route("/status", get(knowledge_status_handler))
}
