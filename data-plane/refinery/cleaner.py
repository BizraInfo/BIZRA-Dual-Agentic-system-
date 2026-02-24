#!/usr/bin/env python3
"""
BIZRA DATA PLANE - INGESTION CLEANER
Plane: Data
Component: Refinery
Status: ACTIVE

This script acts as the primary ingestion valve for the Sovereign Data Estate.
It scans external sources (e.g., Windows host filesystem), filters for high-value
intellectual assets, performing basic sanitation, and ingesting them into the 
Sovereign Vault for later refinement/minting.
"""

import sys
import shutil
import hashlib
import time
from pathlib import Path
from typing import Set, Tuple, List
import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [DATA-PLANE] - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%dT%H:%M:%S%z'
)
logger = logging.getLogger("RefineryCleaner")

# Configuration
HIGH_VALUE_EXTENSIONS = {
    # Logic
    '.py', '.rs', '.js', '.ts', '.go', '.c', '.cpp', '.h', '.sh',
    # Wisdom
    '.md', '.txt', '.pdf', '.json', '.yaml', '.yml',
    # Config
    '.toml', '.ini'
}

MAX_FILE_SIZE_MB = 100  # Skip huge artifacts for now

class DataIngestor:
    def __init__(self, source_root: Path, vault_root: Path):
        self.source_root = source_root
        self.vault_root = vault_root
        self.stats = {
            "scanned": 0,
            "ingested": 0,
            "skipped_ext": 0,
            "skipped_size": 0,
            "errors": 0,
            "bytes_ingested": 0
        }

    def _get_file_hash(self, path: Path) -> str:
        """Calculate SHA256 of file for deduplication check."""
        sha256_hash = hashlib.sha256()
        try:
            with open(path, "rb") as f:
                # Read chunks
                for byte_block in iter(lambda: f.read(4096), b""):
                    sha256_hash.update(byte_block)
            return sha256_hash.hexdigest()
        except Exception as e:
            logger.error(f"Hashing failed for {path}: {e}")
            return "ERROR"

    def _sanitize_filename(self, filename: str) -> str:
        """Remove weird characters, ensure safe path."""
        # Basic implementation: keep alphanumeric, dots, dashes, underscores
        keep = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._-")
        clean = "".join(c for c in filename if c in keep)
        if not clean:
            clean = "unnamed_artifact.dat"
        return clean

    def ingest(self):
        logger.info(f"Starting Ingestion Cycle")
        logger.info(f"Source: {self.source_root}")
        logger.info(f"Target: {self.vault_root}")

        if not self.source_root.exists():
            logger.error(f"Source path does not exist: {self.source_root}")
            return

        self.vault_root.mkdir(parents=True, exist_ok=True)

        for src_path in self.source_root.rglob("*"):
            if not src_path.is_file():
                continue
            
            self.stats["scanned"] += 1
            
            # 1. Extension Filter
            if src_path.suffix.lower() not in HIGH_VALUE_EXTENSIONS:
                self.stats["skipped_ext"] += 1
                continue

            # 2. Size Filter
            try:
                size_mb = src_path.stat().st_size / (1024 * 1024)
                if size_mb > MAX_FILE_SIZE_MB:
                    self.stats["skipped_size"] += 1
                    continue
            except Exception as e:
                logger.error(f"Stat access failed {src_path}: {e}")
                self.stats["errors"] += 1
                continue

            # 3. Ingestion
            try:
                # Calculate hash for uniqueness/naming if needed, 
                # but for 'cleaner' we might just mirror or flatten.
                # Let's flatten structure but prepend hash to ensure uniqueness if name collision?
                # Actually, preserving relative structure is usually better for 'Context'.
                # Let's try to preserve relative path from source.
                
                rel_path = src_path.relative_to(self.source_root)
                dest_path = self.vault_root / rel_path
                
                # Check if already exists
                if dest_path.exists():
                     # Simple check: same size? skip
                     if dest_path.stat().st_size == src_path.stat().st_size:
                         # Assume same file for speed
                         continue

                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                shutil.copy2(src_path, dest_path)
                self.stats["ingested"] += 1
                self.stats["bytes_ingested"] += src_path.stat().st_size
                
                # Rate limit logging
                if self.stats["ingested"] % 100 == 0:
                    logger.info(f"Ingested {self.stats['ingested']} artifacts...")

            except Exception as e:
                logger.error(f"Failed to ingest {src_path}: {e}")
                self.stats["errors"] += 1

        self._print_summary()

    def _print_summary(self):
        logger.info("=== INGESTION COMPLETE ===")
        logger.info(f"Scanned: {self.stats['scanned']}")
        logger.info(f"Ingested: {self.stats['ingested']}")
        logger.info(f"Skipped (Ext): {self.stats['skipped_ext']}")
        logger.info(f"Skipped (Size): {self.stats['skipped_size']}")
        logger.info(f"Errors: {self.stats['errors']}")
        logger.info(f"Total Data: {self.stats['bytes_ingested'] / (1024*1024):.2f} MB")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 cleaner.py <source_dir> <vault_dir>")
        sys.exit(1)
        
    source = Path(sys.argv[1])
    vault = Path(sys.argv[2])
    
    ingestor = DataIngestor(source, vault)
    ingestor.ingest()
