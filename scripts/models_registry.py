#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              BIZRA NODE₀ LOCAL MODELS REGISTRY                               ║
║              Detect & Register: Ollama, GGUF, Safetensors, LoRA              ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Output: models.manifest.jsonl with hash, size, origin, usage logs           ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import hashlib
import datetime
import subprocess
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import List, Dict, Optional

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

GENESIS_ROOT = Path(__file__).parent.parent
OUTPUT_PATH = GENESIS_ROOT / "manifests" / "models.manifest.jsonl"

# Model file extensions
MODEL_EXTENSIONS = {
    ".gguf": "GGUF (llama.cpp)",
    ".safetensors": "SafeTensors",
    ".bin": "PyTorch Binary",
    ".pt": "PyTorch",
    ".pth": "PyTorch Checkpoint",
    ".onnx": "ONNX",
    ".ggml": "GGML (legacy)",
}

# Search paths
SEARCH_PATHS = [
    # Linux paths
    Path.home() / ".ollama" / "models",
    Path.home() / ".cache" / "huggingface",
    Path.home() / ".cache" / "lm-studio",
    Path("/usr/share/ollama/models"),
    # Windows paths via WSL
    Path("/mnt/c/Users"),
    Path("/mnt/d/Models"),
    Path("/mnt/e/Models"),
]


# ═══════════════════════════════════════════════════════════════════════════════
# DATA STRUCTURES
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class ModelEntry:
    """Registry entry for a local model."""
    name: str
    path: str
    format: str
    size_bytes: int
    size_human: str
    sha256_prefix: str  # First 32 chars for quick identification
    origin: str  # ollama, huggingface, lm-studio, local
    discovered_at: str
    metadata: Dict


# ═══════════════════════════════════════════════════════════════════════════════
# CORE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def human_size(size_bytes: int) -> str:
    """Convert bytes to human-readable format."""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if size_bytes < 1024:
            return f"{size_bytes:.1f} {unit}"
        size_bytes /= 1024
    return f"{size_bytes:.1f} PB"


def sha256_prefix(path: Path) -> str:
    """Compute first 32 chars of SHA256 (read first 10MB for speed)."""
    hasher = hashlib.sha256()
    try:
        with open(path, "rb") as f:
            # Read first 10MB for fingerprint
            data = f.read(10 * 1024 * 1024)
            hasher.update(data)
            # Also hash the file size for uniqueness
            hasher.update(str(path.stat().st_size).encode())
        return hasher.hexdigest()[:32]
    except Exception as e:
        return f"ERROR:{type(e).__name__}"


def detect_origin(path: Path) -> str:
    """Detect the origin of a model based on path."""
    path_str = str(path).lower()
    
    if ".ollama" in path_str or "ollama" in path_str:
        return "ollama"
    elif "huggingface" in path_str or "hub" in path_str:
        return "huggingface"
    elif "lm-studio" in path_str or "lmstudio" in path_str:
        return "lm-studio"
    elif "models" in path_str:
        return "local-models-dir"
    else:
        return "local"


def extract_model_name(path: Path) -> str:
    """Extract a clean model name from path."""
    name = path.stem
    
    # Remove common suffixes
    for suffix in ["-GGUF", "-fp16", "-fp32", "-q4_0", "-q4_1", "-q5_0", "-q5_1", 
                   "-q8_0", "-Q4_K_M", "-Q5_K_M", "-Q6_K", "-Q8_0"]:
        if name.endswith(suffix):
            name = name[:-len(suffix)]
    
    return name


def get_ollama_models() -> List[Dict]:
    """Get list of models from Ollama (if running)."""
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode == 0:
            models = []
            lines = result.stdout.strip().split("\n")[1:]  # Skip header
            for line in lines:
                parts = line.split()
                if len(parts) >= 4:
                    models.append({
                        "name": parts[0],
                        "id": parts[1],
                        "size": parts[2] + " " + parts[3],
                    })
            return models
    except Exception:
        pass
    return []


def scan_directory(search_path: Path, max_depth: int = 6) -> List[ModelEntry]:
    """Scan a directory for model files."""
    models = []
    now = datetime.datetime.utcnow().isoformat() + "Z"
    
    if not search_path.exists():
        return models
    
    print(f"  📁 Scanning: {search_path}")
    
    try:
        for root, dirs, files in os.walk(search_path):
            # Calculate depth
            depth = len(Path(root).relative_to(search_path).parts)
            if depth > max_depth:
                dirs.clear()
                continue
            
            # Skip unproductive directories
            dirs[:] = [d for d in dirs if d not in 
                       ['.git', 'node_modules', '__pycache__', '.cache', 'tmp']]
            
            for file in files:
                path = Path(root) / file
                ext = path.suffix.lower()
                
                if ext in MODEL_EXTENSIONS:
                    try:
                        stat = path.stat()
                        
                        # Skip very small files (likely not models)
                        if stat.st_size < 1024 * 1024:  # < 1MB
                            continue
                        
                        entry = ModelEntry(
                            name=extract_model_name(path),
                            path=str(path),
                            format=MODEL_EXTENSIONS[ext],
                            size_bytes=stat.st_size,
                            size_human=human_size(stat.st_size),
                            sha256_prefix=sha256_prefix(path),
                            origin=detect_origin(path),
                            discovered_at=now,
                            metadata={
                                "extension": ext,
                                "modified": datetime.datetime.fromtimestamp(
                                    stat.st_mtime
                                ).isoformat() + "Z",
                            },
                        )
                        models.append(entry)
                        print(f"    ✓ {entry.name} ({entry.size_human}, {entry.format})")
                    except (PermissionError, OSError):
                        continue
    except PermissionError:
        print(f"    ⚠ Permission denied: {search_path}")
    
    return models


def register_models():
    """Main registration function."""
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║         BIZRA NODE₀ LOCAL MODELS REGISTRY                        ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    print()
    
    all_models: List[ModelEntry] = []
    
    # Check Ollama first
    print("🔍 Checking Ollama service...")
    ollama_list = get_ollama_models()
    if ollama_list:
        print(f"   Found {len(ollama_list)} Ollama models in service")
        for m in ollama_list:
            print(f"    ✓ {m['name']} ({m['size']})")
    else:
        print("   Ollama not running or no models found")
    print()
    
    # Scan directories
    print("🔍 Scanning filesystem for model files...")
    for search_path in SEARCH_PATHS:
        models = scan_directory(search_path)
        all_models.extend(models)
    
    # Deduplicate by hash
    seen_hashes = set()
    unique_models = []
    for model in all_models:
        if model.sha256_prefix not in seen_hashes:
            seen_hashes.add(model.sha256_prefix)
            unique_models.append(model)
    
    # Write manifest
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        for model in unique_models:
            f.write(json.dumps(asdict(model)) + "\n")
    
    # Summary
    total_size = sum(m.size_bytes for m in unique_models)
    
    print()
    print("═══════════════════════════════════════════════════════════════════")
    print(f"  Models Found:    {len(unique_models)}")
    print(f"  Total Size:      {human_size(total_size)}")
    print(f"  Formats:         {', '.join(set(m.format for m in unique_models))}")
    print(f"  Origins:         {', '.join(set(m.origin for m in unique_models))}")
    print("═══════════════════════════════════════════════════════════════════")
    print(f"  ✅ Manifest: {OUTPUT_PATH}")
    print()
    
    return unique_models


if __name__ == "__main__":
    register_models()
