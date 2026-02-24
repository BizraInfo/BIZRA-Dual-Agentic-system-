#!/usr/bin/env Rscript
# ============================================
# BIZRA Knowledge Vault - Pipeline Runner
# ============================================

# Install required packages if missing
required_packages <- c(
  "targets", "tarchetypes", "arrow", "duckdb", "pdftools",
  "readtext", "jsonlite", "digest", "fs", "yaml", "stringr",
  "purrr", "dplyr", "tidyr", "glue", "logger", "httr2",
  "future", "furrr", "qs"
)

install_if_missing <- function(pkg) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    message(paste("Installing", pkg, "..."))
    install.packages(pkg, repos = "https://cloud.r-project.org")
  }
}

invisible(lapply(required_packages, install_if_missing))

# Set up logging
library(logger)
log_threshold(INFO)
log_appender(appender_tee("../logs/pipeline.log"))

# Set working directory to pipeline folder
setwd(dirname(sys.frame(1)$ofile))

# Set up parallel processing
library(future)
plan(multisession, workers = parallel::detectCores() - 1)

# Run the pipeline
library(targets)

log_info("Starting BIZRA Knowledge Vault Pipeline...")
log_info("Working directory: {getwd()}")

# Check if targets are outdated
outdated <- tar_outdated()
if (length(outdated) == 0) {
  log_info("All targets are up to date!")
} else {
  log_info("Outdated targets: {paste(outdated, collapse=', ')}")
}

# Run pipeline
tar_make()

# Print summary
log_info("Pipeline complete!")
log_info("Run tar_visnetwork() to visualize the pipeline")
log_info("Run tar_read(<target>) to inspect results")
