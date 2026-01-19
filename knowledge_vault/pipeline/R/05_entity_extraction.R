# ============================================
# BIZRA Knowledge Vault - Entity & Relation Extraction
# ============================================

library(httr2)
library(jsonlite)
library(dplyr)
library(purrr)
library(stringr)
library(logger)

#' Extract entities from chunks using LLM
#' @param chunks_df Tibble of chunks
#' @param config Extraction configuration
#' @return Tibble of entities
extract_entities_llm <- function(chunks_df, config) {
  model <- config$entity_extraction$model %||% "claude-sonnet-4-20250514"
  system_prompt <- config$entity_extraction$system_prompt
  
  log_info("Extracting entities from {nrow(chunks_df)} chunks...")
  
  # Get API key
  api_key <- Sys.getenv("ANTHROPIC_API_KEY")
  if (api_key == "") {
    log_warn("ANTHROPIC_API_KEY not set, using rule-based extraction")
    return(extract_entities_rules(chunks_df))
  }
  
  all_entities <- list()
  
  for (i in seq_len(nrow(chunks_df))) {
    chunk <- chunks_df[i, ]
    
    if (i %% 10 == 0) log_info("Processing chunk {i}/{nrow(chunks_df)}...")
    
    entities <- call_entity_extraction_api(
      text = chunk$chunk_text,
      model = model,
      system_prompt = system_prompt,
      api_key = api_key
    )
    
    if (length(entities) > 0) {
      entities_df <- bind_rows(entities) |>
        mutate(
          chunk_id = chunk$chunk_id,
          doc_id = chunk$doc_id,
          source_type = chunk$source_type
        )
      all_entities[[i]] <- entities_df
    }
    
    Sys.sleep(0.2)  # Rate limiting
  }
  
  bind_rows(all_entities)
}

#' Call Anthropic API for entity extraction
call_entity_extraction_api <- function(text, model, system_prompt, api_key) {
  tryCatch({
    user_prompt <- glue::glue("
Extract entities from the following text. Return JSON array of entities.

TEXT:
{text}

RESPONSE FORMAT:
{{
  \"entities\": [
    {{\"name\": \"...\", \"type\": \"...\", \"aliases\": [], \"confidence\": 0.9}}
  ]
}}
")
    
    resp <- httr2::request("https://api.anthropic.com/v1/messages") |>
      httr2::req_headers(
        `x-api-key` = api_key,
        `anthropic-version` = "2023-06-01",
        `Content-Type` = "application/json"
      ) |>
      httr2::req_body_json(list(
        model = model,
        max_tokens = 2048,
        system = system_prompt,
        messages = list(
          list(role = "user", content = user_prompt)
        )
      )) |>
      httr2::req_perform()
    
    result <- httr2::resp_body_json(resp)
    content <- result$content[[1]]$text
    
    # Parse JSON from response
    json_match <- str_extract(content, "\\{[^{}]*\"entities\"[^{}]*\\[.*\\][^{}]*\\}")
    if (!is.na(json_match)) {
      parsed <- jsonlite::fromJSON(json_match, simplifyVector = FALSE)
      return(parsed$entities)
    }
    
    list()
    
  }, error = function(e) {
    log_warn("Entity extraction API error: {e$message}")
    list()
  })
}

#' Rule-based entity extraction (fallback)
extract_entities_rules <- function(chunks_df) {
  log_info("Using rule-based entity extraction...")
  
  all_entities <- list()
  
  for (i in seq_len(nrow(chunks_df))) {
    chunk <- chunks_df[i, ]
    text <- chunk$chunk_text
    
    entities <- list()
    
    # Extract programming languages
    langs <- str_extract_all(text, "(?i)\\b(Python|Rust|JavaScript|TypeScript|R|Julia|Go|Java|C\\+\\+|C#)\\b")[[1]]
    for (lang in unique(langs)) {
      entities[[length(entities) + 1]] <- list(
        name = lang,
        type = "Language",
        confidence = 0.9
      )
    }
    
    # Extract frameworks/libraries
    libs <- str_extract_all(text, "(?i)\\b(PyTorch|TensorFlow|React|Vue|Django|Flask|tidyverse|dplyr|ggplot2|NumPy|Pandas)\\b")[[1]]
    for (lib in unique(libs)) {
      entities[[length(entities) + 1]] <- list(
        name = lib,
        type = "Library",
        confidence = 0.85
      )
    }
    
    # Extract models
    models <- str_extract_all(text, "(?i)\\b(GPT-4|GPT-3|Claude|Llama|Mistral|Gemini|BERT|T5)\\b")[[1]]
    for (model in unique(models)) {
      entities[[length(entities) + 1]] <- list(
        name = model,
        type = "Model",
        confidence = 0.9
      )
    }
    
    # Extract tools
    tools <- str_extract_all(text, "(?i)\\b(Docker|Kubernetes|Git|GitHub|VS Code|Neo4j|PostgreSQL|Redis)\\b")[[1]]
    for (tool in unique(tools)) {
      entities[[length(entities) + 1]] <- list(
        name = tool,
        type = "Tool",
        confidence = 0.85
      )
    }
    
    if (length(entities) > 0) {
      entities_df <- bind_rows(entities) |>
        mutate(
          chunk_id = chunk$chunk_id,
          doc_id = chunk$doc_id
        )
      all_entities[[i]] <- entities_df
    }
  }
  
  bind_rows(all_entities)
}

#' Normalize entities
normalize_entities <- function(entities_df, config) {
  rules <- config$post_processing$normalize$rules %||% list()
  
  for (rule in rules) {
    entities_df <- entities_df |>
      mutate(
        name = str_replace_all(name, rule$pattern, rule$canonical)
      )
  }
  
  entities_df
}

#' Deduplicate entities
deduplicate_entities <- function(entities_df, config) {
  threshold <- config$post_processing$dedupe$similarity_threshold %||% 0.85
  
  # Group by normalized name and type
  entities_df |>
    group_by(name, type) |>
    summarise(
      entity_id = first(paste0("e-", digest::digest(paste(name, type)))),
      aliases = list(unique(unlist(aliases))),
      confidence = max(confidence),
      mention_count = n(),
      chunk_ids = list(unique(chunk_id)),
      doc_ids = list(unique(doc_id)),
      .groups = "drop"
    ) |>
    rename(canonical_name = name, entity_type = type)
}

#' Extract relations from chunks
extract_relations_llm <- function(chunks_df, entities_df, config) {
  # Similar structure to entity extraction

  # Would use LLM to identify relationships between entities in text
  log_info("Extracting relations from chunks...")
  
  # Placeholder - return empty for now

  tibble::tibble(
    relation_id = character(),
    source_entity = character(),
    relation_type = character(),
    target_entity = character(),
    confidence = numeric(),
    chunk_id = character()
  )
}

#' Validate relations against entity list
validate_relations <- function(relations_df, entities_df) {
  valid_entities <- entities_df$canonical_name
  
  relations_df |>
    filter(
      source_entity %in% valid_entities,
      target_entity %in% valid_entities
    )
}

#' Extract assertions (hyperedges)
extract_assertions_llm <- function(chunks_df, entities_df, config) {
  log_info("Extracting assertions from chunks...")
  
  # Placeholder
  tibble::tibble(
    assertion_id = character(),
    assertion_type = character(),
    text = character(),
    entities_involved = list(),
    confidence = numeric(),
    chunk_id = character()
  )
}

#' Validate assertions
validate_assertions <- function(assertions_df, entities_df) {
  assertions_df
}
