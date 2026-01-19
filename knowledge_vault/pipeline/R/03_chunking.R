# ============================================
# BIZRA Knowledge Vault - Context-Aware Chunking
# ============================================

library(dplyr)
library(purrr)
library(stringr)
library(logger)

#' Chunk documents based on source type
#' @param docs_df Tibble of documents (grouped by source_type)
#' @param config Configuration list
#' @return Tibble of chunks
chunk_documents <- function(docs_df, config) {
  source_type <- unique(docs_df$source_type)[1]
  log_info("Chunking {nrow(docs_df)} {source_type} documents...")
  
  # Get chunking config for this source type
  chunk_config <- config$sources[[source_type]]$chunking %||% 
    list(strategy = "sliding_window", window_size = 512, overlap = 64)
  
  # Choose chunking strategy
  chunker <- switch(
    chunk_config$strategy,
    "ast" = chunk_by_ast,
    "heading_aware" = chunk_by_headings,
    "conversation_turn" = chunk_by_turns,
    "page" = chunk_by_page,
    "sliding_window" = chunk_sliding_window,
    chunk_sliding_window  # default
  )
  
  # Apply chunking to each document
  chunks <- docs_df |>
    filter(!is.na(text), text_quality != "failed") |>
    mutate(
      chunks = map2(text, doc_id, ~ chunker(.x, .y, chunk_config))
    ) |>
    select(doc_id, source_type, project, chunks) |>
    unnest(chunks)
  
  # Add chunk IDs
  chunks |>
    mutate(
      chunk_id = paste0(doc_id, "-", chunk_index),
      token_est = estimate_tokens(chunk_text)
    )
}

#' Estimate token count (rough approximation)
estimate_tokens <- function(text) {
  # Rough estimate: ~4 characters per token for English

  ceiling(nchar(text) / 4)
}

#' AST-based chunking for code files
chunk_by_ast <- function(text, doc_id, config) {

  # For now, fall back to symbol detection
  # Full AST would require tree-sitter bindings
  
  lines <- str_split(text, "\n")[[1]]
  
  # Detect function/class definitions
  chunk_boundaries <- c(1)
  
  for (i in seq_along(lines)) {
    line <- lines[i]
    
    # Python/R function definitions
    if (str_detect(line, "^(def |async def |function\\(|\\w+ <- function)")) {
      chunk_boundaries <- c(chunk_boundaries, i)
    }
    # Rust/JS function definitions
    else if (str_detect(line, "^(fn |pub fn |async fn |const |export |class )")) {
      chunk_boundaries <- c(chunk_boundaries, i)
    }
    # Class definitions
    else if (str_detect(line, "^(class |impl |struct |trait |interface )")) {
      chunk_boundaries <- c(chunk_boundaries, i)
    }
  }
  
  chunk_boundaries <- unique(c(chunk_boundaries, length(lines) + 1))
  
  # Create chunks
  chunks <- list()
  for (i in seq_len(length(chunk_boundaries) - 1)) {
    start <- chunk_boundaries[i]
    end <- chunk_boundaries[i + 1] - 1
    
    chunk_text <- paste(lines[start:end], collapse = "\n")
    
    # Try to extract symbol name
    first_line <- lines[start]
    symbol_name <- extract_symbol_name(first_line)
    
    if (nchar(chunk_text) > 10) {
      chunks[[length(chunks) + 1]] <- tibble::tibble(
        chunk_index = i,
        chunk_text = chunk_text,
        start_line = start,
        end_line = end,
        symbol_name = symbol_name,
        chunk_type = "code_block"
      )
    }
  }
  
  if (length(chunks) == 0) {
    # Fallback to sliding window
    return(chunk_sliding_window(text, doc_id, config))
  }
  
  bind_rows(chunks)
}

#' Extract symbol name from code line
extract_symbol_name <- function(line) {
  # Python
  if (str_detect(line, "^(async )?def (\\w+)")) {
    return(str_extract(line, "(?<=def )\\w+"))
  }
  # Rust
  if (str_detect(line, "^(pub )?fn (\\w+)")) {
    return(str_extract(line, "(?<=fn )\\w+"))
  }
  # JS/TS
  if (str_detect(line, "^(async )?(function |const |let |var )(\\w+)")) {
    return(str_extract(line, "(?<=function |const |let |var )\\w+"))
  }
  # Class
  if (str_detect(line, "^(pub )?class (\\w+)")) {
    return(str_extract(line, "(?<=class )\\w+"))
  }
  NA_character_
}

#' Heading-aware chunking for documents
chunk_by_headings <- function(text, doc_id, config) {
  target_tokens <- config$target_tokens %||% 512
  
  lines <- str_split(text, "\n")[[1]]
  
  # Detect headings (Markdown style)
  heading_indices <- which(str_detect(lines, "^#{1,6} "))
  
  if (length(heading_indices) == 0) {
    # No headings, fall back to sliding window
    return(chunk_sliding_window(text, doc_id, config))
  }
  
  # Add start and end
  boundaries <- unique(c(1, heading_indices, length(lines) + 1))
  
  chunks <- list()
  for (i in seq_len(length(boundaries) - 1)) {
    start <- boundaries[i]
    end <- boundaries[i + 1] - 1
    
    section_text <- paste(lines[start:end], collapse = "\n")
    heading <- if (str_detect(lines[start], "^#")) lines[start] else NA_character_
    
    # If section is too long, split further
    if (estimate_tokens(section_text) > target_tokens * 2) {
      sub_chunks <- chunk_sliding_window(
        section_text, 
        doc_id, 
        list(window_size = target_tokens, overlap = config$overlap_tokens %||% 64)
      )
      sub_chunks <- sub_chunks |> 
        mutate(
          section_heading = heading,
          chunk_index = chunk_index + (i - 1) * 100
        )
      chunks <- c(chunks, list(sub_chunks))
    } else if (nchar(section_text) > 10) {
      chunks[[length(chunks) + 1]] <- tibble::tibble(
        chunk_index = i,
        chunk_text = section_text,
        section_heading = heading,
        chunk_type = "section"
      )
    }
  }
  
  bind_rows(chunks)
}

#' Conversation turn chunking for chats
chunk_by_turns <- function(text, doc_id, config) {
  window_size <- config$window_size %||% 3  # turns per chunk
  overlap <- config$overlap %||% 1
  
  # Split by turn markers
  turns <- str_split(text, "(?=\\n\\[(user|assistant|system|human|ai)\\]:)", perl = TRUE)[[1]]
  turns <- turns[nchar(turns) > 0]
  
  if (length(turns) <= window_size) {
    return(tibble::tibble(
      chunk_index = 1,
      chunk_text = text,
      turn_start = 1,
      turn_end = length(turns),
      chunk_type = "conversation"
    ))
  }
  
  chunks <- list()
  i <- 1
  chunk_idx <- 1
  
  while (i <= length(turns)) {
    end <- min(i + window_size - 1, length(turns))
    chunk_text <- paste(turns[i:end], collapse = "\n")
    
    chunks[[chunk_idx]] <- tibble::tibble(
      chunk_index = chunk_idx,
      chunk_text = chunk_text,
      turn_start = i,
      turn_end = end,
      chunk_type = "conversation"
    )
    
    i <- i + window_size - overlap
    chunk_idx <- chunk_idx + 1
  }
  
  bind_rows(chunks)
}

#' Page-based chunking for PDFs
chunk_by_page <- function(text, doc_id, config) {
  # Split by page break markers
  pages <- str_split(text, "---PAGE BREAK---")[[1]]
  pages <- str_trim(pages)
  pages <- pages[nchar(pages) > 10]
  
  tibble::tibble(
    chunk_index = seq_along(pages),
    chunk_text = pages,
    page_number = seq_along(pages),
    chunk_type = "page"
  )
}

#' Sliding window chunking (fallback)
chunk_sliding_window <- function(text, doc_id, config) {
  window_size <- config$window_size %||% 512  # tokens
  overlap <- config$overlap %||% 64
  
  # Convert to character-based (rough token estimate)
  char_window <- window_size * 4
  char_overlap <- overlap * 4
  
  text_len <- nchar(text)
  
  if (text_len <= char_window) {
    return(tibble::tibble(
      chunk_index = 1,
      chunk_text = text,
      chunk_type = "window"
    ))
  }
  
  chunks <- list()
  pos <- 1
  chunk_idx <- 1
  
  while (pos < text_len) {
    end <- min(pos + char_window - 1, text_len)
    
    # Try to break at sentence boundary
    chunk_text <- substr(text, pos, end)
    if (end < text_len) {
      last_period <- str_locate_all(chunk_text, "[.!?]\n|[.!?] ")[[1]]
      if (nrow(last_period) > 0) {
        last_break <- max(last_period[, "end"])
        if (last_break > char_window * 0.5) {
          chunk_text <- substr(chunk_text, 1, last_break)
          end <- pos + last_break - 1
        }
      }
    }
    
    chunks[[chunk_idx]] <- tibble::tibble(
      chunk_index = chunk_idx,
      chunk_text = str_trim(chunk_text),
      chunk_type = "window"
    )
    
    pos <- end - char_overlap + 1
    chunk_idx <- chunk_idx + 1
    
    # Safety: prevent infinite loop
    if (chunk_idx > 10000) break
  }
  
  bind_rows(chunks)
}
