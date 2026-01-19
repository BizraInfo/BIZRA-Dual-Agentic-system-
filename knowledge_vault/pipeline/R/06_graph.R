# ============================================
# BIZRA Knowledge Vault - Graph Building
# ============================================

library(dplyr)
library(purrr)
library(jsonlite)
library(logger)

#' Build graph nodes from all sources
build_graph_nodes <- function(documents_df, chunks_df, entities_df, assertions_df) {
  log_info("Building graph nodes...")
  
  # Document nodes
  doc_nodes <- documents_df |>
    transmute(
      node_id = doc_id,
      node_type = "Document",
      properties = pmap(list(
        doc_id = doc_id,
        source_type = source_type,
        uri = uri,
        title = title,
        project = project,
        created_at = as.character(created_at)
      ), list)
    )
  
  # Chunk nodes
  chunk_nodes <- chunks_df |>
    transmute(
      node_id = chunk_id,
      node_type = "Chunk",
      properties = pmap(list(
        chunk_id = chunk_id,
        doc_id = doc_id,
        chunk_index = chunk_index,
        chunk_text = substr(chunk_text, 1, 500),  # Truncate for graph
        token_count = token_est
      ), list)
    )
  
  # Entity nodes
  entity_nodes <- entities_df |>
    transmute(
      node_id = entity_id,
      node_type = "Entity",
      properties = pmap(list(
        entity_id = entity_id,
        entity_type = entity_type,
        canonical_name = canonical_name,
        mention_count = mention_count,
        confidence = confidence
      ), list)
    )
  
  # Assertion nodes
  assertion_nodes <- assertions_df |>
    transmute(
      node_id = assertion_id,
      node_type = "Assertion",
      properties = pmap(list(
        assertion_id = assertion_id,
        assertion_type = assertion_type,
        text = text,
        confidence = confidence
      ), list)
    )
  
  bind_rows(doc_nodes, chunk_nodes, entity_nodes, assertion_nodes)
}

#' Build graph edges from all sources
build_graph_edges <- function(chunks_df, entities_df, relations_df, assertions_df) {
  log_info("Building graph edges...")
  
  edges <- list()
  
  # Chunk -> Document edges (PART_OF)
  chunk_doc_edges <- chunks_df |>
    transmute(
      edge_id = paste0("e-", chunk_id, "-partof-", doc_id),
      source_id = chunk_id,
      target_id = doc_id,
      edge_type = "PART_OF",
      properties = list(list())
    )
  edges[[1]] <- chunk_doc_edges
  
  # Entity mentions (Chunk -> Entity)
  if ("chunk_ids" %in% names(entities_df)) {
    mention_edges <- entities_df |>
      select(entity_id, chunk_ids) |>
      unnest(chunk_ids) |>
      rename(chunk_id = chunk_ids) |>
      transmute(
        edge_id = paste0("e-", chunk_id, "-mentions-", entity_id),
        source_id = chunk_id,
        target_id = entity_id,
        edge_type = "MENTIONS",
        properties = list(list())
      )
    edges[[length(edges) + 1]] <- mention_edges
  }
  
  # Relations between entities
  if (nrow(relations_df) > 0) {
    relation_edges <- relations_df |>
      transmute(
        edge_id = relation_id,
        source_id = source_entity,
        target_id = target_entity,
        edge_type = relation_type,
        properties = map(confidence, ~ list(confidence = .x))
      )
    edges[[length(edges) + 1]] <- relation_edges
  }
  
  # Assertion edges
  if (nrow(assertions_df) > 0) {
    # Assertions -> Entities (INVOLVES)
    assertion_entity_edges <- assertions_df |>
      select(assertion_id, entities_involved) |>
      unnest(entities_involved) |>
      transmute(
        edge_id = paste0("e-", assertion_id, "-involves-", name),
        source_id = assertion_id,
        target_id = name,
        edge_type = "INVOLVES",
        properties = map(role, ~ list(role = .x))
      )
    edges[[length(edges) + 1]] <- assertion_entity_edges
  }
  
  bind_rows(edges)
}

#' Export graph to JSONL format
export_graph_jsonl <- function(nodes_df, edges_df, path) {
  log_info("Exporting graph to {path}...")
  
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  
  con <- file(path, "w")
  on.exit(close(con))
  
  # Write nodes
  for (i in seq_len(nrow(nodes_df))) {
    node <- list(
      type = "node",
      id = nodes_df$node_id[i],
      label = nodes_df$node_type[i],
      properties = nodes_df$properties[[i]]
    )
    writeLines(toJSON(node, auto_unbox = TRUE), con)
  }
  
  # Write edges
  for (i in seq_len(nrow(edges_df))) {
    edge <- list(
      type = "edge",
      id = edges_df$edge_id[i],
      source = edges_df$source_id[i],
      target = edges_df$target_id[i],
      label = edges_df$edge_type[i],
      properties = edges_df$properties[[i]]
    )
    writeLines(toJSON(edge, auto_unbox = TRUE), con)
  }
  
  log_info("Exported {nrow(nodes_df)} nodes and {nrow(edges_df)} edges")
}

#' Export to Neo4j CSV format
export_neo4j_csv <- function(nodes_df, edges_df, dir) {
  log_info("Exporting to Neo4j CSV format in {dir}...")
  
  dir.create(dir, recursive = TRUE, showWarnings = FALSE)
  
  # Group nodes by type
  node_types <- unique(nodes_df$node_type)
  
  for (nt in node_types) {
    type_nodes <- nodes_df |>
      filter(node_type == nt) |>
      mutate(
        props_json = map_chr(properties, ~ toJSON(.x, auto_unbox = TRUE))
      )
    
    write.csv(
      type_nodes |> select(node_id, props_json),
      file.path(dir, paste0(tolower(nt), "_nodes.csv")),
      row.names = FALSE
    )
  }
  
  # Group edges by type
  edge_types <- unique(edges_df$edge_type)
  
  for (et in edge_types) {
    type_edges <- edges_df |>
      filter(edge_type == et) |>
      mutate(
        props_json = map_chr(properties, ~ toJSON(.x, auto_unbox = TRUE))
      )
    
    write.csv(
      type_edges |> select(source_id, target_id, props_json),
      file.path(dir, paste0(tolower(et), "_edges.csv")),
      row.names = FALSE
    )
  }
  
  log_info("Exported Neo4j CSVs to {dir}")
}

#' Compute pipeline metrics
compute_metrics <- function(documents_df, chunks_df, entities_df, relations_df, assertions_df) {
  list(
    timestamp = Sys.time(),
    documents = list(
      total = nrow(documents_df),
      by_source = as.list(table(documents_df$source_type)),
      by_quality = as.list(table(documents_df$text_quality))
    ),
    chunks = list(
      total = nrow(chunks_df),
      avg_tokens = mean(chunks_df$token_est, na.rm = TRUE)
    ),
    entities = list(
      total = nrow(entities_df),
      by_type = as.list(table(entities_df$entity_type))
    ),
    relations = list(
      total = nrow(relations_df)
    ),
    assertions = list(
      total = nrow(assertions_df)
    )
  )
}

#' Append metrics to log file
append_metrics <- function(metrics, path) {
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  
  con <- file(path, "a")
  on.exit(close(con))
  
  writeLines(toJSON(metrics, auto_unbox = TRUE), con)
  
  log_info("Appended metrics to {path}")
}

#' Generate validation report
generate_validation_report <- function(documents_path, chunks_path, entities_path, graph_path, metrics) {
  list(
    generated_at = Sys.time(),
    files = list(
      documents = file.exists(documents_path),
      chunks = file.exists(chunks_path),
      entities = file.exists(entities_path),
      graph = file.exists(graph_path)
    ),
    metrics = metrics,
    status = "SUCCESS"
  )
}
