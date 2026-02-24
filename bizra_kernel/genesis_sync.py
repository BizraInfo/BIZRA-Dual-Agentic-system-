"""
bizra_kernel/genesis_sync.py - The One-Way Genesis Mirror
======================================================
Enforces the 'Scripture' rule: Genesis is written once, never overwritten.
Syncs the TaskMaster Source-of-Truth to the read-only Data Lake.
"""

import os
import shutil
import json
import logging
import hashlib
from pathlib import Path

logger = logging.getLogger("BIZRA_GENESIS_SYNC")

class GenesisTamperError(Exception):
    """Raised when Genesis Script attempts to overwrite existing scripture."""
    pass

class GenesisMirror:
    """
    Manages the immutable replication of Genesis artifacts.
    """
    
    def __init__(self, source_path: str, mirror_root: str):
        self.source = Path(source_path)
        self.mirror_dir = Path(mirror_root) / "04_GOLD"
        self.mirror_file = self.mirror_dir / "genesis.json"

    def consecrate(self):
        """
        Performs the One-Way Sync.
        Raises GenesisTamperError if target exists and differs.
        """
        if not self.source.exists():
            raise FileNotFoundError(f"Source Genesis not found at {self.source}")

        # Ensure sanctuary exists
        self.mirror_dir.mkdir(parents=True, exist_ok=True)

        # CHECK 1: Preservation of Scripture
        if self.mirror_file.exists():
            # Calculate hashes to see if identical (idempotent is ok, overwrite is not)
            src_hash = self._hash_file(self.source)
            dst_hash = self._hash_file(self.mirror_file)

            if src_hash == dst_hash:
                print("[*] Genesis Mirror: Scripture verified intact (Matches Source).")
                return
            else:
                # CRITICAL: Attempt to change immutable history
                raise GenesisTamperError(
                    f"TAMPER ALERT: Genesis already exists in Data Lake and differs from Source.\n"
                    f"Existing Hash: {dst_hash}\n"
                    f"Attempted Hash: {src_hash}\n"
                    f"Refusing to overwrite immutable origin."
                )

        # ACTION: First Scribing
        print(f"[*] Genesis Mirror: Scribing One-Way Copy to {self.mirror_file}...")
        try:
            shutil.copy2(self.source, self.mirror_file)
            # Set read-only (chattr +i if privileged, otherwise chmod)
            os.chmod(self.mirror_file, 0o444) 
            print("[+] Genesis Scribed and Sealed (Read-Only).")
        except Exception as e:
            logger.error(f"Failed to scribe genesis: {e}")
            raise

    def _hash_file(self, path: Path) -> str:
        """SHA-256 of file content."""
        h = hashlib.sha256()
        with open(path, "rb") as f:
            while chunk := f.read(8192):
                h.update(chunk)
        return h.hexdigest()

if __name__ == "__main__":
    import hashlib # re-import for module run
    # Default Paths assuming execution from root
    # Note: Using absolute paths derived from BIZRA standard structure
    SOURCE = "/root/bizra-genesis/genesis/blocks/genesis_block_0.json"
    MIRROR = "/mnt/c/BIZRA-DATA-LAKE" # Windows mount path assumption for Data Lake
    
    # Fallback for Linux-only env
    if not os.path.exists(MIRROR):
        MIRROR = "/root/bizra-genesis/bizra_data_vault/roots/sovereign_data"

    try:
        mirror = GenesisMirror(SOURCE, MIRROR)
        mirror.consecrate()
    except Exception as e:
        print(f"\n[FATAL] GENESIS SYNC FAILED: {e}")
        exit(1)
