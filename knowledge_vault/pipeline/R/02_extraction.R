# ============================================
# BIZRA Knowledge Vault - Text Extraction
# ============================================

library(pdftools)
library(readtext)
library(jsonlite)
library(dplyr)
library(purrr)
library(stringr)
library(logger)

#' Extract text from a batch of files
#' @param files_df Tibble with file metadata
#' @param config Configuration list
#' @return Tibble with extracted text
extract_text_batch <- function(files_df, config) {
  source_type <- unique(files_df$source_type)[1]
  log_info("Extracting text from {nrow(files_df)} {source_type} files...")
  
  # Choose extractor based on source type
  extractor <- switch(
    source_type,
    "repos" = extract_code_files,
    "pdfs" = extract_pdf_files,
    "chats" = extract_chat_files,
    "notes" = extract_note_files,
    "media" = extract_media_files,
    extract_generic_files
  )
  
  # Process with error handling
  files_df |>
    mutate(
      extraction_result = map(uri, safely(extractor)),
      text = map_chr(extraction_result, ~ .x$result$text %||% NA_character_),
      text_quality = map_chr(extraction_result, ~ {
        if (!is.null(.x$error)) "failed"
        else if (is.na(.x$result$text) || nchar(.x$result$text) < 10) "empty"
        else if (isTRUE(.x$result$is_ocr)) "ocr"
        else "ok"
      }),
      extraction_metadata = map(extraction_result, ~ .x$result$metadata %||% list())
    ) |>
    select(-extraction_result)
}

#' Extract text from code files
extract_code_files <- function(path) {
  text <- readr::read_file(path)
  
  list(
    text = text,
    is_ocr = FALSE,
    metadata = list(
      line_count = str_count(text, "\n") + 1,
      char_count = nchar(text)
    )
  )
}

#' Extract text from PDF files
extract_pdf_files <- function(path) {
  # Try direct text extraction first
  text <- tryCatch({
    pages <- pdftools::pdf_text(path)
    paste(pages, collapse = "\n\n---PAGE BREAK---\n\n")
  }, error = function(e) NA_character_)
  
  is_ocr <- FALSE
  
  # If text extraction failed or very little text, try OCR
  if (is.na(text) || nchar(text) < 100) {
    text <- tryCatch({
      is_ocr <- TRUE
      # OCR would go here - using tesseract
      # For now, placeholder
      log_warn("OCR needed for {path}")
      NA_character_
    }, error = function(e) NA_character_)
  }
  
  # Extract metadata
  info <- tryCatch(
    pdftools::pdf_info(path),
    error = function(e) list()
  )
  
  list(
    text = text,
    is_ocr = is_ocr,
    metadata = list(
      pages = info$pages %||% NA,
      title = info$keys$Title %||% NA,
      author = info$keys$Author %||% NA,
      created = info$created %||% NA
    )
  )
}

#' Extract text from chat export files
extract_chat_files <- function(path) {
  ext <- fs::path_ext(path)
  
  if (ext == "json") {
    # Parse JSON chat export
    chat_data <- jsonlite::read_json(path)
    
    # Handle different chat export formats
    text <- format_chat_to_text(chat_data)
    
    list(
      text = text,
      is_ocr = FALSE,
      metadata = list(
        message_count = count_messages(chat_data),
        participants = extract_participants(chat_data)
      )
    )
  } else {
    # Treat as plain text
    extract_code_files(path)
  }
}

#' Format chat JSON to readable text
format_chat_to_text <- function(chat_data) {
  # Handle common formats
  if (!is.null(chat_data$messages)) {
    # OpenAI/Claude format
    messages <- chat_data$messages
    formatted <- map_chr(messages, ~ {
      role <- .x$role %||% "unknown"
      content <- .x$content %||% ""
      if (is.list(content)) {
        content <- map_chr(content, ~ .x$text %||% "") |> paste(collapse = "\n")
      }
      glue::glue("[{role}]: {content}")
    })
    paste(formatted, collapse = "\n\n")
  } else if (!is.null(chat_data$mapping)) {
    # ChatGPT export format
    nodes <- chat_data$mapping
    messages <- keep(nodes, ~ !is.null(.x$message))
    formatted <- map_chr(messages, ~ {
      msg <- .x$message
      role <- msg$author$role %||% "unknown"
      content <- msg$content$parts[[1]] %||% ""
      glue::glue("[{role}]: {content}")
    })
    paste(formatted, collapse = "\n\n")
  } else {
    # Fallback: stringify
    jsonlite::toJSON(chat_data, auto_unbox = TRUE, pretty = TRUE)
  }
}

#' Count messages in chat data
count_messages <- function(chat_data) {
  if (!is.null(chat_data$messages)) length(chat_data$messages)
  else if (!is.null(chat_data$mapping)) length(chat_data$mapping)
  else NA_integer_
}

#' Extract participants from chat data
extract_participants <- function(chat_data) {
  if (!is.null(chat_data$messages)) {
    unique(map_chr(chat_data$messages, ~ .x$role %||% "unknown"))
  } else {
    c("user", "assistant")
  }
}

#' Extract text from note files (Markdown, etc.)
extract_note_files <- function(path) {
  text <- readr::read_file(path)
  
  # Parse YAML frontmatter if present
  frontmatter <- NULL
  if (str_detect(text, "^---\n")) {
    parts <- str_split(text, "---\n", n = 3)[[1]]
    if (length(parts) >= 3) {
      frontmatter <- tryCatch(
        yaml::yaml.load(parts[2]),
        error = function(e) NULL
      )
      text <- parts[3]
    }
  }
  
  # Extract wikilinks
  wikilinks <- str_extract_all(text, "\\[\\[([^\\]]+)\\]\\]")[[1]]
  
  # Extract tags
  tags <- str_extract_all(text, "#[a-zA-Z][a-zA-Z0-9_-]*")[[1]]
  
  list(
    text = text,
    is_ocr = FALSE,
    metadata = list(
      frontmatter = frontmatter,
      wikilinks = wikilinks,
      tags = tags
    )
  )
}

#' Extract text from media files (placeholder)
extract_media_files <- function(path) {
  ext <- fs::path_ext(path) |> tolower()
  
  if (ext %in% c("png", "jpg", "jpeg", "gif", "webp", "svg")) {
    # Image - would need VLM for captioning
    list(
      text = glue::glue("[IMAGE: {fs::path_file(path)}]"),
      is_ocr = FALSE,
      metadata = list(
        type = "image",
        needs_captioning = TRUE
      )
    )
  } else if (ext %in% c("mp4", "mov", "webm", "avi")) {
    # Video - would need whisper for transcription
    list(
      text = glue::glue("[VIDEO: {fs::path_file(path)}]"),
      is_ocr = FALSE,
      metadata = list(
        type = "video",
        needs_transcription = TRUE
      )
    )
  } else if (ext %in% c("mp3", "m4a", "wav", "ogg")) {
    # Audio - would need whisper
    list(
      text = glue::glue("[AUDIO: {fs::path_file(path)}]"),
      is_ocr = FALSE,
      metadata = list(
        type = "audio",
        needs_transcription = TRUE
      )
    )
  } else {
    list(text = NA_character_, is_ocr = FALSE, metadata = list())
  }
}

#' Generic file extraction fallback
extract_generic_files <- function(path) {
  tryCatch({
    text <- readr::read_file(path)
    list(text = text, is_ocr = FALSE, metadata = list())
  }, error = function(e) {
    list(text = NA_character_, is_ocr = FALSE, metadata = list(error = e$message))
  })
}

#' Build the documents table (spine)
build_documents_table <- function(extracted_df) {
  log_info("Building documents table...")
  
  extracted_df |>
    transmute(
      doc_id,
      source_type,
      uri,
      title = filename,
      mime,
      lang,
      created_at,
      modified_at,
      project,
      hash_sha256 = doc_id,  # We used sha256 for doc_id
      text,
      text_quality,
      tags,
      metadata_json = map_chr(extraction_metadata, ~ jsonlite::toJSON(.x, auto_unbox = TRUE))
    )
}
