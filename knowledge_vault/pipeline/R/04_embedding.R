# ============================================
# BIZRA Knowledge Vault - Embedding Generation
# ============================================

library(httr2)
library(dplyr)
library(purrr)
library(logger)

#' Generate embeddings for chunks
#' @param chunks_df Tibble of chunks
#' @param config Configuration list
#' @return Tibble with embeddings
generate_embeddings <- function(chunks_df, config) {
  model <- config$processing$embedding$model %||% "text-embedding-3-large"
  dimensions <- config$processing$embedding$dimensions %||% 3072
  batch_size <- config$processing$embedding$batch_size %||% 100
  
  log_info("Generating embeddings for {nrow(chunks_df)} chunks using {model}...")
  
  # Get API key from environment
  api_key <- Sys.getenv("OPENAI_API_KEY")
  if (api_key == "") {
    log_warn("OPENAI_API_KEY not set, using mock embeddings")
    return(generate_mock_embeddings(chunks_df, dimensions))
  }
  
  # Process in batches
  texts <- chunks_df$chunk_text
  embeddings <- list()
  
  for (i in seq(1, length(texts), by = batch_size)) {
    batch_end <- min(i + batch_size - 1, length(texts))
    batch_texts <- texts[i:batch_end]
    
    log_info("Embedding batch {i}:{batch_end}...")
    
    batch_embeddings <- call_embedding_api(
      texts = batch_texts,
      model = model,
      dimensions = dimensions,
      api_key = api_key
    )
    
    embeddings <- c(embeddings, batch_embeddings)
    
    # Rate limiting
    Sys.sleep(0.5)
  }
  
  tibble::tibble(
    chunk_id = chunks_df$chunk_id,
    embedding = embeddings,
    embedding_model = model,
    embedding_dim = dimensions
  )
}

#' Call OpenAI embedding API
call_embedding_api <- function(texts, model, dimensions, api_key) {
  tryCatch({
    resp <- httr2::request("https://api.openai.com/v1/embeddings") |>
      httr2::req_headers(
        `Authorization` = paste("Bearer", api_key),
        `Content-Type` = "application/json"
      ) |>
      httr2::req_body_json(list(
        input = texts,
        model = model,
        dimensions = dimensions
      )) |>
      httr2::req_perform()
    
    result <- httr2::resp_body_json(resp)
    
    map(result$data, ~ .x$embedding)
    
  }, error = function(e) {
    log_error("Embedding API error: {e$message}")
    # Return zero vectors on error
    replicate(length(texts), rep(0, dimensions), simplify = FALSE)
  })
}

#' Generate mock embeddings (for testing without API)
generate_mock_embeddings <- function(chunks_df, dimensions) {
  log_warn("Using mock embeddings (random vectors)")
  
  tibble::tibble(
    chunk_id = chunks_df$chunk_id,
    embedding = replicate(nrow(chunks_df), rnorm(dimensions), simplify = FALSE),
    embedding_model = "mock",
    embedding_dim = dimensions
  )
}

#' Bind embeddings to chunks
bind_embeddings <- function(chunks_df, embeddings_df) {
  chunks_df |>
    left_join(embeddings_df, by = "chunk_id") |>
    mutate(
      created_at = Sys.time()
    )
}

#' Write JSONL file
write_jsonl <- function(df, path) {
  dir.create(dirname(path), recursive = TRUE, showWarnings = FALSE)
  
  con <- file(path, "w")
  on.exit(close(con))
  
  for (i in seq_len(nrow(df))) {
    row <- as.list(df[i, ])
    json_line <- jsonlite::toJSON(row, auto_unbox = TRUE)
    writeLines(json_line, con)
  }
  
  log_info("Wrote {nrow(df)} records to {path}")
}
