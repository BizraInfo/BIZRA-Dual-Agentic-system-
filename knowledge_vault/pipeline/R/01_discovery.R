# ============================================
# BIZRA Knowledge Vault - File Discovery
# ============================================

library(fs)
library(digest)
library(purrr)
library(dplyr)
library(stringr)
library(logger)

#' Load configuration from YAML
#' @param path Path to YAML config file
#' @return List configuration
load_config <- function(path) {
  yaml::read_yaml(path)
}

#' Discover all files from configured sources
#' @param config Configuration list
#' @return Tibble of file paths with metadata
discover_files <- function(config) {
  log_info("Starting file discovery...")
  
  all_files <- list()
  
  # Process each source type
  for (source_type in names(config$sources)) {
    source_config <- config$sources[[source_type]]
    
    if (!isTRUE(source_config$enabled)) {
      log_info("Skipping disabled source: {source_type}")
      next
    }
    
    log_info("Discovering {source_type} files...")
    
    paths <- source_config$paths
    if (is.null(paths)) next
    
    for (path_config in paths) {
      pattern <- path_config$path
      pattern <- path.expand(pattern)  # Expand ~
      
      # Handle glob patterns
      if (str_detect(pattern, "\\*")) {
        files <- fs::dir_ls(
          path = dirname(pattern),
          glob = basename(pattern),
          recurse = str_detect(pattern, "\\*\\*"),
          type = "file"
        )
      } else if (fs::is_dir(pattern)) {
        files <- fs::dir_ls(pattern, recurse = TRUE, type = "file")
      } else if (fs::file_exists(pattern)) {
        files <- pattern
      } else {
        log_warn("Path not found: {pattern}")
        next
      }
      
      # Apply include/exclude patterns
      if (!is.null(path_config$include_patterns)) {
        include_regex <- paste0(
          "(", paste(glob2rx(path_config$include_patterns), collapse = "|"), ")"
        )
        files <- files[str_detect(files, include_regex)]
      }
      
      if (!is.null(path_config$exclude_patterns)) {
        for (excl in path_config$exclude_patterns) {
          files <- files[!str_detect(files, fixed(excl))]
        }
      }
      
      # Add to results
      if (length(files) > 0) {
        all_files[[length(all_files) + 1]] <- tibble::tibble(
          uri = as.character(files),
          source_type = source_type,
          project = path_config$project %||% "default",
          tags = list(path_config$tags %||% character())
        )
      }
    }
  }
  
  result <- bind_rows(all_files)
  log_info("Discovered {nrow(result)} files")
  result
}

#' Extract metadata from discovered files
#' @param file_list Tibble from discover_files
#' @return Tibble with additional metadata columns
extract_file_metadata <- function(file_list) {
  log_info("Extracting file metadata...")
  
  file_list |>
    mutate(
      # File system metadata
      file_exists = fs::file_exists(uri),
      file_size = fs::file_size(uri),
      created_at = fs::file_info(uri)$birth_time,
      modified_at = fs::file_info(uri)$modification_time,
      
      # Content metadata
      mime = mime::guess_type(uri),
      extension = fs::path_ext(uri),
      filename = fs::path_file(uri),
      
      # Generate doc_id (hash of path + content)
      doc_id = map_chr(uri, ~ {
        if (fs::file_exists(.x) && fs::file_size(.x) < 100 * 1024 * 1024) {
          # Hash content for files < 100MB
          digest::digest(file = .x, algo = "sha256")
        } else {
          # Hash path for large files
          digest::digest(.x, algo = "sha256")
        }
      }),
      
      # Detect language (for code files)
      lang = case_when(
        extension %in% c("py", "pyw") ~ "python",
        extension %in% c("r", "R", "Rmd") ~ "r",
        extension == "rs" ~ "rust",
        extension %in% c("js", "mjs") ~ "javascript",
        extension %in% c("ts", "tsx") ~ "typescript",
        extension %in% c("md", "markdown") ~ "markdown",
        extension == "pdf" ~ "pdf",
        extension %in% c("json", "jsonl") ~ "json",
        extension %in% c("yaml", "yml") ~ "yaml",
        TRUE ~ NA_character_
      )
    ) |>
    filter(file_exists)
}

#' Convert glob pattern to regex
glob2rx <- function(patterns) {
  patterns |>
    str_replace_all("\\.", "\\\\.") |>
    str_replace_all("\\*\\*", ".*") |>
    str_replace_all("\\*", "[^/]*") |>
    str_replace_all("\\{([^}]+)\\}", "(\\1)") |>
    str_replace_all(",", "|")
}
