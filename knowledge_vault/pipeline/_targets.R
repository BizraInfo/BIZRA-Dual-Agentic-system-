# ============================================
# BIZRA Knowledge Vault - Targets Pipeline
# Hypergraph RAG + Knowledge Graph System
# Version: 1.0.0
# ============================================

library(targets)
library(tarchetypes)

# Source all functions
tar_source("R/")

# Set options
tar_option_set(
  packages = c(
    "arrow",           # Parquet I/O
    "duckdb",          # SQL on Parquet
    "pdftools",        # PDF extraction
    "readtext",        # Text file extraction
    "jsonlite",        # JSON parsing
    "digest",          # Hashing
    "fs",              # File system ops
    "yaml",            # Config parsing
    "stringr",         # String manipulation
    "purrr",           # Functional programming
    "dplyr",           # Data manipulation
    "tidyr",           # Data tidying
    "glue",            # String interpolation
    "logger",          # Logging
    "httr2",           # API calls (LLM)
    "future",          # Parallel processing
    "furrr"            # Parallel purrr
  ),
  format = "qs",       # Fast serialization
  memory = "transient" # Don't keep in memory after use
)

# ============================================
# PIPELINE DEFINITION
# ============================================

list(
  
  # ------------------------------------------
  # STAGE 0: Configuration
  # ------------------------------------------
  
  tar_target(
    config,
    load_config("../config/sources.yaml"),
    format = "qs"
  ),
  
  tar_target(
    extraction_config,
    load_config("../config/extraction.yaml"),
    format = "qs"
  ),
  
  # ------------------------------------------
  # STAGE 1: File Discovery (Crawl)
  # ------------------------------------------
  
  tar_target(
    raw_file_list,
    discover_files(config),
    format = "qs"
  ),
  
  tar_target(
    file_metadata,
    extract_file_metadata(raw_file_list),
    format = "qs"
  ),
  
  # ------------------------------------------
  # STAGE 2: Text Extraction
  # ------------------------------------------
  
  # Group files by extraction strategy
  tar_group_by(
    files_by_type,
    file_metadata,
    source_type
  ),
  
  # Extract text (branched by source type)
  tar_target(
    extracted_text,
    extract_text_batch(files_by_type, config),
    pattern = map(files_by_type),
    format = "qs"
  ),
  
  # Combine all extracted text
  tar_target(
    all_text,
    bind_rows(extracted_text),
    format = "qs"
  ),
  
  # ------------------------------------------
  # STAGE 3: Build Documents Spine
  # ------------------------------------------
  
  tar_target(
    documents_df,
    build_documents_table(all_text),
    format = "qs"
  ),
  
  tar_target(
    documents_parquet,
    {
      path <- "../index/documents.parquet"
      arrow::write_parquet(documents_df, path)
      path
    },
    format = "file"
  ),
  
  # ------------------------------------------
  # STAGE 4: Context-Aware Chunking
  # ------------------------------------------
  
  # Group documents by chunking strategy
  tar_group_by(
    docs_by_strategy,
    documents_df,
    source_type
  ),
  
  # Chunk each group appropriately
  tar_target(
    chunks,
    chunk_documents(docs_by_strategy, config),
    pattern = map(docs_by_strategy),
    format = "qs"
  ),
  
  tar_target(
    all_chunks,
    bind_rows(chunks),
    format = "qs"
  ),
  
  # ------------------------------------------
  # STAGE 5: Embedding Generation
  # ------------------------------------------
  
  # Batch chunks for embedding API calls
  tar_group_size(
    chunk_batches,
    all_chunks,
    size = 100  # batch size for API
  ),
  
  tar_target(
    chunk_embeddings,
    generate_embeddings(chunk_batches, config),
    pattern = map(chunk_batches),
    format = "qs"
  ),
  
  tar_target(
    chunks_with_embeddings,
    bind_embeddings(all_chunks, chunk_embeddings),
    format = "qs"
  ),
  
  tar_target(
    chunks_parquet,
    {
      path <- "../index/chunks.parquet"
      arrow::write_parquet(chunks_with_embeddings, path)
      path
    },
    format = "file"
  ),
  
  # ------------------------------------------
  # STAGE 6: Entity Extraction (LLM)
  # ------------------------------------------
  
  tar_target(
    extracted_entities,
    extract_entities_llm(all_chunks, extraction_config),
    pattern = map(chunk_batches),
    format = "qs"
  ),
  
  tar_target(
    all_entities,
    bind_rows(extracted_entities) |>
      normalize_entities(extraction_config) |>
      deduplicate_entities(extraction_config),
    format = "qs"
  ),
  
  tar_target(
    entities_jsonl,
    {
      path <- "../derived/entities/entities.jsonl"
      write_jsonl(all_entities, path)
      path
    },
    format = "file"
  ),
  
  tar_target(
    entities_parquet,
    {
      path <- "../index/entities.parquet"
      arrow::write_parquet(all_entities, path)
      path
    },
    format = "file"
  ),
  
  # ------------------------------------------
  # STAGE 7: Relation Extraction (LLM)
  # ------------------------------------------
  
  tar_target(
    extracted_relations,
    extract_relations_llm(all_chunks, all_entities, extraction_config),
    pattern = map(chunk_batches),
    format = "qs"
  ),
  
  tar_target(
    all_relations,
    bind_rows(extracted_relations) |>
      validate_relations(all_entities),
    format = "qs"
  ),
  
  # ------------------------------------------
  # STAGE 8: Assertion Extraction (Hyperedges)
  # ------------------------------------------
  
  tar_target(
    extracted_assertions,
    extract_assertions_llm(all_chunks, all_entities, extraction_config),
    pattern = map(chunk_batches),
    format = "qs"
  ),
  
  tar_target(
    all_assertions,
    bind_rows(extracted_assertions) |>
      validate_assertions(all_entities),
    format = "qs"
  ),
  
  tar_target(
    assertions_jsonl,
    {
      path <- "../derived/assertions/assertions.jsonl"
      write_jsonl(all_assertions, path)
      path
    },
    format = "file"
  ),
  
  # ------------------------------------------
  # STAGE 9: Build Knowledge Graph
  # ------------------------------------------
  
  tar_target(
    graph_nodes,
    build_graph_nodes(documents_df, all_chunks, all_entities, all_assertions),
    format = "qs"
  ),
  
  tar_target(
    graph_edges,
    build_graph_edges(all_chunks, all_entities, all_relations, all_assertions),
    format = "qs"
  ),
  
  tar_target(
    graph_export,
    {
      path <- "../index/graph.jsonl"
      export_graph_jsonl(graph_nodes, graph_edges, path)
      path
    },
    format = "file"
  ),
  
  # Neo4j import files
  tar_target(
    neo4j_import,
    {
      dir <- "../graph/neo4j/"
      export_neo4j_csv(graph_nodes, graph_edges, dir)
      dir
    },
    format = "file"
  ),
  
  # ------------------------------------------
  # STAGE 10: Metrics & Observability
  # ------------------------------------------
  
  tar_target(
    pipeline_metrics,
    compute_metrics(
      documents_df,
      all_chunks,
      all_entities,
      all_relations,
      all_assertions
    ),
    format = "qs"
  ),
  
  tar_target(
    metrics_log,
    {
      path <- "../logs/metrics.jsonl"
      append_metrics(pipeline_metrics, path)
      path
    },
    format = "file"
  ),
  
  # ------------------------------------------
  # FINAL: Validation Report
  # ------------------------------------------
  
  tar_target(
    validation_report,
    generate_validation_report(
      documents_parquet,
      chunks_parquet,
      entities_parquet,
      graph_export,
      pipeline_metrics
    ),
    format = "qs"
  )
  
)
