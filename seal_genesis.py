#!/usr/bin/env python3
"""
seal_genesis.py — BIZRA Genesis Sealing Tool
===========================================
Generates the "Genesis Seal" by calculating a deterministic Merkle-like root hash 
of all critical artifacts in the genesis state.

Logic:
1. Scan defined artifacts (policies, schemas, code, economic models).
2. Calculate individual SHA-256 hashes in 4096-byte chunks.
3. Sort file list alphabetically.
4. Concatenate and hash the list to produce the Genesis Root Hash.
5. Export GENESIS_MANIFEST.json.
"""

import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Configuration: Directories and files to include in the seal
GENESIS_PROFILE = {
    "include": [
        "constitution/*.yaml",
        "schemas/*.json",
        "bizra_kernel/*.py",
        "bizra-genesis-node/bizra_kernel/*.py",
        "cognitive-plane/protocols/*.py",
        "BIZRA_TOKENOMICS_GENESIS.yaml",
        "Cargo.toml",
        "src/**/*.rs",
        "final_snr_report.json"
    ],
    "exclude": [
        "**/__pycache__/**",
        "**/*.pyc",
        "target/**",
        "evidence/**",
    ]
}

def calculate_file_hash(path: Path) -> str:
    """Calculate SHA-256 hash of a file in 4096-byte chunks."""
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(4096):
            sha256.update(chunk)
    return sha256.hexdigest()

def get_sealed_files(root: Path) -> list[Path]:
    """Find all files matching the inclusion patterns, excluding the exclusion patterns."""
    import fnmatch
    
    all_files = []
    for pattern in GENESIS_PROFILE["include"]:
        # Handle globbing manually to ensure we find everything
        for path in root.rglob(pattern.split("/")[-1]) if "**" in pattern else root.glob(pattern):
            if path.is_file():
                # Check exclusions
                rel_path = str(path.relative_to(root))
                excluded = False
                for ex_pattern in GENESIS_PROFILE["exclude"]:
                    if fnmatch.fnmatch(rel_path, ex_pattern):
                        excluded = True
                        break
                if not excluded:
                    all_files.append(path)
    
    # Dedup and sort
    return sorted(list(set(all_files)))

def seal(root_dir: str = ".", output_file: str = "evidence/genesis/GENESIS_MANIFEST.json"):
    root = Path(root_dir).resolve()
    print(f"Executing Primordial Activation Protocol for root: {root}")
    
    files = get_sealed_files(root)
    file_registry = []
    
    # Step 1: Individual Hashes
    print(f"Found {len(files)} artifacts for sealing.")
    for file_path in files:
        rel_path = str(file_path.relative_to(root)).replace("\\", "/")
        file_hash = calculate_file_hash(file_path)
        file_registry.append({
            "path": rel_path,
            "sha256": file_hash,
            "bytes": file_path.stat().st_size
        })
    
    # Step 2: Deterministic Sort (already done by Path sorting, but let's be explicit)
    file_registry.sort(key=lambda x: x["path"])
    
    # Step 3: Master Root Hash
    # Concatenate all hashes and paths to create the root binder
    binder_source = "".join([f"{item['path']}:{item['sha256']}" for item in file_registry])
    genesis_hash = hashlib.sha256(binder_source.encode("utf-8")).hexdigest()
    
    # Step 4: Create Manifest
    manifest = {
        "title": "BIZRA GENESIS MANIFEST",
        "status": "SEALED",
        "genesis_hash": genesis_hash,
        "sealed_at_utc": datetime.now(timezone.utc).isoformat(),
        "artifact_count": len(file_registry),
        "registry": file_registry
    }
    
    # Ensure output directory exists
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, "w") as f:
        json.dump(manifest, f, indent=2)
    
    print(f"Successfully generated Genesis Seal.")
    print(f"Genesis Hash: {genesis_hash}")
    print(f"Manifest written to: {output_file}")

def verify(manifest_path: str = "evidence/genesis/GENESIS_MANIFEST.json"):
    print(f"Starting verification against manifest: {manifest_path}")
    if not os.path.exists(manifest_path):
        print(f"Error: Manifest {manifest_path} not found.")
        sys.exit(1)
        
    with open(manifest_path, "r") as f:
        manifest = json.load(f)
        
    registry = manifest["registry"]
    failures = []
    
    for item in registry:
        path = Path(item["path"])
        if not path.exists():
            print(f"[FAIL] Missing: {path}")
            failures.append(str(path))
            continue
            
        actual_hash = calculate_file_hash(path)
        if actual_hash != item["sha256"]:
            print(f"[FAIL] Mismatch: {path}")
            print(f"  Expected: {item['sha256']}")
            print(f"  Actual:   {actual_hash}")
            failures.append(str(path))
        else:
            print(f"[PASS] {path}")
            
    if failures:
        print(f"\nVerification FAILED. {len(failures)} issues detected.")
        sys.exit(1)
    else:
        print(f"\nVerification SUCCESSFUL. The 'Third Fact' is secure.")
        print(f"Genesis Hash Verified: {manifest['genesis_hash']}")

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="BIZRA Genesis Sealer")
    parser.add_argument("--verify", action="store_true", help="Verify existing manifest")
    args = parser.parse_args()
    
    if args.verify:
        verify()
    else:
        seal()
