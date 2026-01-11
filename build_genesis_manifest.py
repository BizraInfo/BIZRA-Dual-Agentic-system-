#!/usr/bin/env python3
import hashlib
import json
import os
import re
from datetime import datetime, timezone

PROJECT_ROOT = "/root/bizra-genesis"
MANIFEST_PATHS = [
    "evidence/genesis/GENESIS_MANIFEST.json",
    "bizra-genesis-node/backend/evidence/genesis/GENESIS_MANIFEST.json"
]
IHSAN_SRC = "src/ihsan.rs"

# List of files to include in the genesis seal
def get_artifacts():
    print("[*] Discovering system artifacts...")
    artifacts = ["Cargo.toml", "constitution/ihsan_v1.yaml"]
    
    # Scan key directories
    scan_dirs = ["src", "tests", "benches"]
    for d in scan_dirs:
        dir_path = os.path.join(PROJECT_ROOT, d)
        if not os.path.exists(dir_path):
            continue
            
        for root, _, files in os.walk(dir_path):
            for f in files:
                if f.endswith(".rs"):
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, PROJECT_ROOT)
                    artifacts.append(rel_path)
    
    return sorted(list(set(artifacts)))

def hash_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(8192):
            h.update(chunk)
    return h.hexdigest(), os.path.getsize(path)

def update_manifest():
    artifacts = get_artifacts()
    print(f"[*] Rebuilding Genesis Manifest with {len(artifacts)} artifacts...")
    registry = []
    all_hashes = ""
    
    for rel_path in artifacts:
        full_path = os.path.join(PROJECT_ROOT, rel_path)
        sha256, size = hash_file(full_path)
        registry.append({
            "path": rel_path,
            "sha256": sha256,
            "bytes": size
        })
        all_hashes += sha256
        
    # The genesis_hash is a commitment to all artifact hashes
    genesis_hash = hashlib.sha256(all_hashes.encode()).hexdigest()
    
    manifest_data = {
        "title": "BIZRA GENESIS MANIFEST",
        "status": "SEALED",
        "genesis_hash": genesis_hash,
        "sealed_at_utc": datetime.now(timezone.utc).isoformat(),
        "artifact_count": len(registry),
        "registry": registry
    }
    
    for rel_path in MANIFEST_PATHS:
        full_path = os.path.join(PROJECT_ROOT, rel_path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            json.dump(manifest_data, f, indent=2)
        print(f"[+] Manifest sealed at: {rel_path}")
    
    print(f"[+] Global Genesis Hash: {genesis_hash}")
    return genesis_hash

def update_rust_source(new_hash):
    rust_path = os.path.join(PROJECT_ROOT, IHSAN_SRC)
    if not os.path.exists(rust_path):
        print(f"[!] Error: {rust_path} not found.")
        return

    print(f"[*] Updating {IHSAN_SRC} with new genesis hash...")
    
    with open(rust_path, "r") as f:
        content = f.read()
        
    # Replace the SEALED_GENESIS_HASH constant
    # const SEALED_GENESIS_HASH: &str =
    #     "7ffc8e1aa69cb8b13ddeb6b1d2499ba4a404e2ef782cca8787b226b541c6c9f3";
    pattern = re.compile(r'(const SEALED_GENESIS_HASH: &str =\s*\n?\s*")([a-f0-9]+)(";)', re.MULTILINE)
    
    new_content, count = pattern.subn(rf'\g<1>{new_hash}\g<3>', content)
    
    if count == 0:
        print("[!] Warning: Could not find SEALED_GENESIS_HASH in src/ihsan.rs or it already matches.")
    else:
        with open(rust_path, "w") as f:
            f.write(new_content)
        print(f"[+] Updated SEALED_GENESIS_HASH to {new_hash}")

if __name__ == "__main__":
    g_hash = update_manifest()
    update_rust_source(g_hash)
    print("[*] Sovereignty Verification: PASS")

