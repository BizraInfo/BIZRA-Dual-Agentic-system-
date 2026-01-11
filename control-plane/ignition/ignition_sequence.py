#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════════════╗
║              BIZRA NODE₀ CONTROL PLANE IGNITION                              ║
║              Third-Fact Receipt System + PoI Foundations                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Purpose: Take ownership of the entire 300GB+ sovereign knowledge space      ║
║  Method:  Inventory → Hash → Merkle → Attest → Index                        ║
║  Output:  Proof-of-Impact receipts for all Node₀ assets                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  HARDWARE TRUTH (MSI Titan 18 HX 2024)                                       ║
║  ─────────────────────────────────────                                       ║
║  CPU:  Intel Core i9-14900HX (24C/32T, VMX/VT-x, NOT AMD SVM)               ║
║  RAM:  128GB DDR5-3600 (4×32GB Samsung)                                     ║
║  GPU:  NVIDIA RTX 4090 Laptop 16GB + Intel UHD Graphics                     ║
║  SSD:  3.8TB Intel RAID 0 (2×1.9TB NVMe)                                    ║
║  TPM:  2.0 (Secure Boot Enabled)                                            ║
║  NET:  Killer E3100X 2.5GbE + Intel BE200 WiFi 7                            ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

import os
import sys
import json
import hashlib
import datetime
import platform
from pathlib import Path
from dataclasses import dataclass, asdict, field
from typing import List, Dict, Optional, Generator, Any
import subprocess
import socket

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

GENESIS_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = GENESIS_ROOT / "receipts" / "control_plane"
MANIFEST_DIR = GENESIS_ROOT / "manifests"

# Detect Windows User
WINDOWS_USER = "BIZRA-OS"  # Default
if os.path.exists("/mnt/c/Users/BIZRA-OS"):
    WINDOWS_USER = "BIZRA-OS"
elif os.path.exists("/mnt/c/Users"):
    # Try to find a non-public/default user
    for u in os.listdir("/mnt/c/Users"):
        if u not in ["Public", "Default", "Default User", "All Users", "desktop.ini"] and os.path.isdir(f"/mnt/c/Users/{u}"):
            WINDOWS_USER = u
            break

print(f"  🔍 Detected Windows User: {WINDOWS_USER}")

# ─────────────────────────────────────────────────────────────────────────────
# NODE₀ HARDWARE FINGERPRINT (Immutable Truth from System Inventory)
# ─────────────────────────────────────────────────────────────────────────────
NODE0_HARDWARE = {
    "device": "MSI Titan 18 HX (2024)",
    "cpu": {
        "model": "Intel Core i9-14900HX",
        "cores": 24,
        "threads": 32,
        "virtualization": "VMX/VT-x",  # NOT AMD SVM!
        "base_clock_mhz": 2200,
        "turbo_clock_mhz": 5800,
    },
    "memory": {
        "total_gb": 128,
        "type": "DDR5-3600",
        "modules": "4×32GB Samsung M425R4GA3BB0-CWM0D",
        "speed_mt": 3600,
    },
    "gpu_discrete": {
        "model": "NVIDIA GeForce RTX 4090 Laptop GPU",
        "vram_gb": 16,
        "cuda_cores": 9728,
        "driver": "572.42",
        "cuda_versions": ["12.6", "13.0"],
    },
    "gpu_integrated": {
        "model": "Intel UHD Graphics (Meteor Lake)",
        "vram_shared_gb": 64,
    },
    "storage": {
        "primary": {
            "model": "Intel RAID 0 Volume",
            "capacity_tb": 3.8,
            "type": "NVMe SSD",
            "configuration": "2×1.9TB RAID 0",
        },
    },
    "network": {
        "ethernet": "Killer E3100X 2.5GbE",
        "wifi": "Intel BE200 WiFi 7",
        "bluetooth": "Intel Bluetooth 5.4",
    },
    "security": {
        "tpm": "2.0 (STMicro)",
        "secure_boot": True,
    },
    "os": {
        "name": "Windows 11 Enterprise",
        "build": "26H1 (28020.1362)",
        "insider": "Canary Channel",
    },
}

# Windows mount points accessible from WSL2
WINDOWS_MOUNTS = [
    "/mnt/c/Users",
    "/mnt/d",
    "/mnt/e",
]

# Known software ecosystem (from system inventory)
KNOWN_SOFTWARE = {
    "ai_tools": [
        "Ollama",
        "LM Studio",
        "AnythingLLM",
        "NVIDIA ChatRTX",
        "Langflow",
        "Flowise",
    ],
    "dev_tools": [
        "VS Code Insiders",
        "Docker Desktop",
        "Git",
        "Node.js 24.5.0",
        "Python 3.12+",
        "Rust (rustup)",
        "PostgreSQL 17",
        "Redis",
    ],
    "virtualization": [
        "Hyper-V",
        "WSL2 (Ubuntu/Debian)",
        "Docker",
        "QEMU",
    ],
}

# Asset categories for PoI
ASSET_CATEGORIES = {
    "models": {
        "extensions": [".gguf", ".safetensors", ".bin", ".pt", ".pth", ".onnx"],
        "patterns": ["**/models/**", "**/ollama/**", "**/lm-studio/**", "**/huggingface/**"],
    },
    "repos": {
        "patterns": ["**/.git"],
        "depth": 1,
    },
    "chat_history": {
        "extensions": [".json", ".jsonl"],
        "patterns": ["**/ChatGPT/**", "**/Claude/**", "**/conversations/**", "**/chat_data*/**"],
    },
    "documents": {
        "extensions": [".pdf", ".md", ".txt", ".docx"],
        "patterns": ["**/Documents/**", "**/BIZRA/**"],
    },
    "configs": {
        "extensions": [".yaml", ".yml", ".toml", ".json", ".env"],
        "patterns": ["**/.config/**", "**/AppData/**"],
        "hash_only": True,  # Never exfiltrate content
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# EXTENDED ASSET CATEGORIES (Full Sovereign Space)
# ─────────────────────────────────────────────────────────────────────────────
EXTENDED_CATEGORIES = {
    "downloads": {
        "base_paths": ["/mnt/c/Users/BIZRA-OS/Downloads"],
        "extensions": [".pdf", ".zip", ".tar.gz", ".7z", ".rar", ".exe", ".msi", ".iso", 
                       ".gguf", ".safetensors", ".bin", ".mp4", ".mkv", ".mov"],
        "estimate_size_gb": 399,
    },
    "desktop": {
        "base_paths": ["/mnt/c/Users/BIZRA-OS/Desktop"],
        "extensions": ["*"],  # All files
        "estimate_size_gb": 128,
    },
    "onedrive_primary": {
        "base_paths": ["/mnt/c/Users/BIZRA-OS/OneDrive"],
        "extensions": ["*"],
        "estimate_size_gb": 0.6,
    },
    "onedrive_backup": {
        "base_paths": ["/mnt/c/Users/BIZRA-OS/Downloads/OneDrive"],
        "extensions": ["*"],
        "estimate_size_gb": 347,
        "description": "OneDrive full backup including Desktop sync (319GB), Pictures (46GB+)",
    },
    "google_drive": {
        "base_paths": [
            "/mnt/c/Users/BIZRA-OS/AppData/Local/Google/DriveFS/105276801994084149586",
            "/mnt/c/Users/BIZRA-OS/AppData/Local/Google/DriveFS/113491242555142877153", 
            "/mnt/c/Users/BIZRA-OS/AppData/Local/Google/DriveFS/114956347727502403248",
        ],
        "estimate_size_gb": 1.3,
        "accounts": 3,
    },
    "bizra_data_lake": {
        "base_paths": ["/mnt/c/BIZRA-DATA-LAKE"],
        "extensions": ["*"],
        "estimate_size_gb": 1.4,
        "structure": ["00_INTAKE", "01_RAW", "02_PROCESSED", "03_INDEXED", "04_GOLD", "99_QUARANTINE"],
    },
    "bizra_stage": {
        "base_paths": ["/mnt/c/BIZRA-STAGE"],
        "extensions": ["*"],
        "description": "Cloud sync staging area",
    },
    "media_gallery": {
        "base_paths": [
            "/mnt/c/Users/BIZRA-OS/Downloads/OneDrive/Pictures",
            "/mnt/c/Users/BIZRA-OS/Downloads/OneDrive/Desktop/OneDrive/Pictures",
        ],
        "extensions": [".jpg", ".jpeg", ".png", ".gif", ".heic", ".mp4", ".mov", ".avi"],
        "estimate_size_gb": 53,
        "description": "Samsung Gallery exports and camera imports",
    },
    "virtual_machines": {
        "base_paths": ["/mnt/c/Users/BIZRA-OS/Downloads"],
        "extensions": [".vmx", ".vmdk", ".vdi", ".qcow2", ".vhd", ".vhdx"],
        "patterns": ["**/*.vmwarevm/**", "**/*.vbox/**"],
        "estimate_size_gb": 30,
    },
}


# ═══════════════════════════════════════════════════════════════════════════════
# DATA STRUCTURES
# ═══════════════════════════════════════════════════════════════════════════════

@dataclass
class AssetReceipt:
    """Third-Fact receipt for a single asset."""
    path: str
    category: str
    size_bytes: int
    sha256: str
    modified_at: str
    discovered_at: str
    metadata: Dict


@dataclass
class CategoryManifest:
    """Merkle manifest for an asset category."""
    category: str
    asset_count: int
    total_size_bytes: int
    merkle_root: str
    generated_at: str
    receipts: List[AssetReceipt]


@dataclass
class ControlPlaneState:
    """Complete Node₀ Control Plane state."""
    node_id: str
    hardware_fingerprint: Dict[str, Any]
    ignition_time: str
    categories: Dict[str, CategoryManifest]
    extended_categories: Dict[str, Any]
    global_merkle_root: str
    poi_score: float
    total_sovereign_size_gb: float
    model_registry: List[Dict] = field(default_factory=list)
    github_repos: List[Dict] = field(default_factory=list)


# ═══════════════════════════════════════════════════════════════════════════════
# CORE FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

def sha256_file(path: Path, chunk_size: int = 8192) -> str:
    """Compute SHA256 hash of a file."""
    hasher = hashlib.sha256()
    try:
        with open(path, "rb") as f:
            while chunk := f.read(chunk_size):
                hasher.update(chunk)
        return hasher.hexdigest()
    except (PermissionError, OSError) as e:
        return f"ERROR:{type(e).__name__}"


def merkle_root(hashes: List[str]) -> str:
    """Compute Merkle root from a list of hashes."""
    if not hashes:
        return hashlib.sha256(b"EMPTY").hexdigest()
    
    if len(hashes) == 1:
        return hashes[0]
    
    # Pad to even length
    if len(hashes) % 2 == 1:
        hashes.append(hashes[-1])
    
    # Combine pairs
    next_level = []
    for i in range(0, len(hashes), 2):
        combined = hashlib.sha256((hashes[i] + hashes[i+1]).encode()).hexdigest()
        next_level.append(combined)
    
    return merkle_root(next_level)


def discover_assets(category: str, config: Dict) -> Generator[Path, None, None]:
    """Discover assets for a category."""
    extensions = set(config.get("extensions", []))
    
    # Check bizra-genesis first
    for root, dirs, files in os.walk(GENESIS_ROOT):
        # Skip hidden and build directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ['target', 'node_modules', '__pycache__', '.git']]
        
        for file in files:
            path = Path(root) / file
            if extensions and path.suffix.lower() in extensions:
                yield path
    
    # Check Windows mounts if accessible
    for mount in WINDOWS_MOUNTS:
        mount_path = Path(mount)
        if mount_path.exists():
            try:
                for root, dirs, files in os.walk(mount_path):
                    # Limit depth and skip system folders
                    depth = len(Path(root).relative_to(mount_path).parts)
                    if depth > 5:
                        dirs.clear()
                        continue
                    
                    dirs[:] = [d for d in dirs if not d.startswith('.') and d not in 
                               ['Windows', 'Program Files', 'Program Files (x86)', '$Recycle.Bin', 
                                'System Volume Information', 'AppData']]
                    
                    for file in files:
                        path = Path(root) / file
                        if extensions and path.suffix.lower() in extensions:
                            yield path
            except PermissionError:
                continue


def discover_git_repos() -> Generator[Path, None, None]:
    """Discover Git repositories."""
    # Check bizra-genesis
    git_dir = GENESIS_ROOT / ".git"
    if git_dir.exists():
        yield GENESIS_ROOT
    
    # Check common locations
    search_paths = [
        GENESIS_ROOT.parent,
        Path("/mnt/c/Users"),
        Path("/mnt/d"),
    ]
    
    for search_path in search_paths:
        if not search_path.exists():
            continue
        
        try:
            for root, dirs, files in os.walk(search_path):
                depth = len(Path(root).relative_to(search_path).parts)
                if depth > 4:
                    dirs.clear()
                    continue
                
                if ".git" in dirs:
                    yield Path(root)
                    dirs.remove(".git")  # Don't recurse into .git
                
                # Skip unproductive directories
                dirs[:] = [d for d in dirs if d not in 
                           ['node_modules', 'target', '__pycache__', '.cache', 'venv', '.venv']]
        except PermissionError:
            continue


def get_repo_metadata(repo_path: Path) -> Dict:
    """Extract Git repository metadata."""
    try:
        # Get remote URL
        result = subprocess.run(
            ["git", "-C", str(repo_path), "config", "--get", "remote.origin.url"],
            capture_output=True, text=True, timeout=5
        )
        remote_url = result.stdout.strip() if result.returncode == 0 else "local"
        
        # Get commit count
        result = subprocess.run(
            ["git", "-C", str(repo_path), "rev-list", "--count", "HEAD"],
            capture_output=True, text=True, timeout=10
        )
        commit_count = int(result.stdout.strip()) if result.returncode == 0 else 0
        
        # Get HEAD commit
        result = subprocess.run(
            ["git", "-C", str(repo_path), "rev-parse", "HEAD"],
            capture_output=True, text=True, timeout=5
        )
        head_commit = result.stdout.strip()[:12] if result.returncode == 0 else "unknown"
        
        # Get branch
        result = subprocess.run(
            ["git", "-C", str(repo_path), "branch", "--show-current"],
            capture_output=True, text=True, timeout=5
        )
        branch = result.stdout.strip() if result.returncode == 0 else "unknown"
        
        return {
            "remote_url": remote_url,
            "commit_count": commit_count,
            "head_commit": head_commit,
            "branch": branch,
        }
    except Exception as e:
        return {"error": str(e)}


def scan_ollama_models() -> List[Dict]:
    """Scan for Ollama models via API and filesystem."""
    models = []
    
    # Try Ollama API first (more reliable)
    try:
        result = subprocess.run(
            ["ollama", "list"],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')[1:]  # Skip header
            for line in lines:
                parts = line.split()
                if len(parts) >= 3:
                    models.append({
                        "name": parts[0],
                        "id": parts[1] if len(parts) > 1 else "unknown",
                        "size": parts[2] if len(parts) > 2 else "unknown",
                        "source": "ollama-api",
                        "quantization": parts[0].split(':')[-1] if ':' in parts[0] else "default",
                    })
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass
    
    # Fallback: Check Ollama model filesystem locations
    ollama_paths = [
        Path.home() / ".ollama" / "models",
        Path("/usr/share/ollama/models"),
        Path(f"/mnt/c/Users/{WINDOWS_USER}/.ollama/models"),
    ]
    
    for ollama_path in ollama_paths:
        if ollama_path.exists():
            for model_file in ollama_path.rglob("*"):
                if model_file.is_file() and model_file.stat().st_size > 1_000_000:  # >1MB
                    models.append({
                        "path": str(model_file),
                        "name": model_file.name,
                        "size_bytes": model_file.stat().st_size,
                        "source": "ollama-fs",
                    })
    
    return models


def scan_lm_studio_models() -> List[Dict]:
    """Scan for LM Studio models."""
    models = []
    
    lm_studio_paths = [
        # Common Windows path for newer versions
        Path(f"/mnt/c/Users/{WINDOWS_USER}/.lmstudio/models"),
        # Legacy paths
        Path(f"/mnt/c/Users/{WINDOWS_USER}/.cache/lm-studio/models"),
        Path(f"/mnt/c/Users/{WINDOWS_USER}/LM Studio/models"),
        Path.home() / ".cache" / "lm-studio" / "models",
    ]
    
    for lm_path in lm_studio_paths:
        if lm_path.exists():
            for model_file in lm_path.rglob("*.gguf"):
                try:
                    models.append({
                        "path": str(model_file),
                        "name": model_file.stem,
                        "size_bytes": model_file.stat().st_size,
                        "format": "GGUF",
                        "source": "lm-studio",
                        "quantization": _detect_quantization(model_file.name),
                    })
                except OSError:
                    continue
    
    return models


def scan_downloads_for_models() -> List[Dict]:
    """Scan Downloads folder for scattered AI models."""
    models = []
    downloads_path = Path(f"/mnt/c/Users/{WINDOWS_USER}/Downloads")
    
    if not downloads_path.exists():
        return models

    # Extensions to look for
    model_exts = {".gguf", ".safetensors", ".bin", ".pt", ".pth"}
    
    # We'll use os.walk but limit depth to avoid scanning too deep into extracted archives or node_modules
    for root, dirs, files in os.walk(downloads_path):
        depth = len(Path(root).relative_to(downloads_path).parts)
        if depth > 4: # Limit depth
            dirs.clear()
            continue
            
        # Skip common non-model heavy dirs to save time
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', '__pycache__', 'Windows', 'Program Files']]
        
        for f in files:
            path = Path(root) / f
            if path.suffix.lower() in model_exts:
                # Filter small files (likely not LLMs)
                try:
                    size = path.stat().st_size
                    if size > 100_000_000: # > 100MB
                        models.append({
                            "path": str(path),
                            "name": path.stem,
                            "size_bytes": size,
                            "format": path.suffix[1:].upper(),
                            "source": "downloads-scattered",
                            "quantization": _detect_quantization(path.name),
                        })
                except OSError:
                    continue
                    
    return models



def scan_huggingface_models() -> List[Dict]:
    """Scan for HuggingFace cached models."""
    models = []
    
    hf_paths = [
        Path.home() / ".cache" / "huggingface" / "hub",
        Path(f"/mnt/c/Users/{WINDOWS_USER}/.cache/huggingface/hub"),
    ]
    
    for hf_path in hf_paths:
        if hf_path.exists():
            for safetensors in hf_path.rglob("*.safetensors"):
                models.append({
                    "path": str(safetensors),
                    "name": safetensors.parent.name,
                    "size_bytes": safetensors.stat().st_size,
                    "format": "safetensors",
                    "source": "huggingface",
                })
            for bin_file in hf_path.rglob("pytorch_model*.bin"):
                models.append({
                    "path": str(bin_file),
                    "name": bin_file.parent.name,
                    "size_bytes": bin_file.stat().st_size,
                    "format": "pytorch",
                    "source": "huggingface",
                })
    
    return models


def _detect_quantization(filename: str) -> str:
    """Detect quantization from filename."""
    quants = ["Q2_K", "Q3_K", "Q4_K", "Q4_0", "Q4_1", "Q5_K", "Q5_0", "Q5_1", 
              "Q6_K", "Q8_0", "F16", "F32", "IQ2", "IQ3", "IQ4"]
    filename_upper = filename.upper()
    for q in quants:
        if q in filename_upper:
            return q
    return "unknown"


def build_model_registry() -> List[Dict]:
    """Build complete model registry from all sources."""
    print("  🤖 Building Model Registry...")
    
    registry = []
    
    # Scan all sources
    ollama_models = scan_ollama_models()
    print(f"    ├─ Ollama: {len(ollama_models)} models")
    registry.extend(ollama_models)
    
    lm_studio_models = scan_lm_studio_models()
    print(f"    ├─ LM Studio: {len(lm_studio_models)} models")
    registry.extend(lm_studio_models)
    
    hf_models = scan_huggingface_models()
    print(f"    └─ HuggingFace: {len(hf_models)} models")
    registry.extend(hf_models)
    
    downloads_models = scan_downloads_for_models()
    print(f"    └─ Downloads: {len(downloads_models)} models")
    registry.extend(downloads_models)
    
    return registry


def scan_extended_category(category_name: str, config: Dict, quick_mode: bool = True) -> Dict:
    """Scan an extended asset category (Windows folders)."""
    result = {
        "category": category_name,
        "base_paths": config.get("base_paths", []),
        "accessible_paths": [],
        "total_size_bytes": 0,
        "file_count": 0,
        "dir_count": 0,
        "sample_files": [],
        "extensions_found": {},
        "estimate_size_gb": config.get("estimate_size_gb", 0),
        "description": config.get("description", ""),
    }
    
    for base_path in config.get("base_paths", []):
        path = Path(base_path)
        if not path.exists():
            continue
        
        result["accessible_paths"].append(str(path))
        
        try:
            if quick_mode:
                # Quick scan: just count and sample
                file_count = 0
                dir_count = 0
                extensions = {}
                
                for root, dirs, files in os.walk(path):
                    # Limit depth for performance
                    depth = len(Path(root).relative_to(path).parts)
                    if depth > 3:
                        dirs.clear()
                        continue
                    
                    dir_count += len(dirs)
                    file_count += len(files)
                    
                    for f in files[:10]:  # Sample
                        ext = Path(f).suffix.lower()
                        extensions[ext] = extensions.get(ext, 0) + 1
                        
                        if len(result["sample_files"]) < 20:
                            result["sample_files"].append(str(Path(root) / f))
                    
                    # Limit total traversal
                    if file_count > 10000:
                        break
                
                result["file_count"] += file_count
                result["dir_count"] += dir_count
                result["extensions_found"].update(extensions)
            else:
                # Full hash scan (slow but complete)
                for root, dirs, files in os.walk(path):
                    result["dir_count"] += len(dirs)
                    for f in files:
                        fp = Path(root) / f
                        try:
                            stat = fp.stat()
                            result["file_count"] += 1
                            result["total_size_bytes"] += stat.st_size
                        except (PermissionError, OSError):
                            continue
                            
        except PermissionError:
            continue
    
    return result


def scan_all_extended_categories(quick_mode: bool = True) -> Dict[str, Dict]:
    """Scan all extended asset categories."""
    print("  📂 Scanning Extended Categories (Full Sovereign Space)...")
    
    results = {}
    total_estimated_gb = 0
    
    for cat_name, config in EXTENDED_CATEGORIES.items():
        print(f"    ├─ {cat_name}...", end=" ", flush=True)
        result = scan_extended_category(cat_name, config, quick_mode)
        results[cat_name] = result
        
        est_gb = config.get("estimate_size_gb", 0)
        total_estimated_gb += est_gb
        
        if result["accessible_paths"]:
            print(f"✓ ({result['file_count']} files, ~{est_gb}GB)")
        else:
            print("✗ (not accessible)")
    
    print(f"    └─ Total Estimated: {total_estimated_gb:.1f} GB across {len(EXTENDED_CATEGORIES)} categories")
    
    return results


def process_category(category: str, config: Dict) -> CategoryManifest:
    """Process a single asset category."""
    print(f"  📂 Scanning {category}...")
    
    receipts = []
    now = datetime.datetime.utcnow().isoformat() + "Z"
    
    if category == "repos":
        # Special handling for Git repositories
        for repo_path in discover_git_repos():
            try:
                stat = repo_path.stat()
                metadata = get_repo_metadata(repo_path)
                
                # Create a stable hash from repo metadata
                repo_hash = hashlib.sha256(
                    f"{repo_path}:{metadata.get('head_commit', '')}".encode()
                ).hexdigest()
                
                receipt = AssetReceipt(
                    path=str(repo_path),
                    category=category,
                    size_bytes=0,  # Repos are measured by commits, not bytes
                    sha256=repo_hash,
                    modified_at=datetime.datetime.fromtimestamp(stat.st_mtime).isoformat() + "Z",
                    discovered_at=now,
                    metadata=metadata,
                )
                receipts.append(receipt)
                print(f"    ✓ {repo_path.name} ({metadata.get('commit_count', '?')} commits)")
            except Exception as e:
                print(f"    ✗ {repo_path}: {e}")
    else:
        # Standard file discovery
        for asset_path in discover_assets(category, config):
            try:
                stat = asset_path.stat()
                file_hash = sha256_file(asset_path)
                
                receipt = AssetReceipt(
                    path=str(asset_path),
                    category=category,
                    size_bytes=stat.st_size,
                    sha256=file_hash,
                    modified_at=datetime.datetime.fromtimestamp(stat.st_mtime).isoformat() + "Z",
                    discovered_at=now,
                    metadata={"extension": asset_path.suffix},
                )
                receipts.append(receipt)
                
                if len(receipts) % 100 == 0:
                    print(f"    ... {len(receipts)} assets discovered")
            except Exception as e:
                continue
    
    # Compute Merkle root
    hashes = [r.sha256 for r in receipts if not r.sha256.startswith("ERROR")]
    root = merkle_root(hashes)
    
    total_size = sum(r.size_bytes for r in receipts)
    
    print(f"    → {len(receipts)} assets, {total_size / (1024*1024):.1f} MB, root: {root[:16]}...")
    
    return CategoryManifest(
        category=category,
        asset_count=len(receipts),
        total_size_bytes=total_size,
        merkle_root=root,
        generated_at=now,
        receipts=receipts,
    )


def ignite_control_plane() -> ControlPlaneState:
    """Main ignition sequence."""
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║         BIZRA NODE₀ CONTROL PLANE IGNITION                       ║")
    print("║         Third-Fact Receipt Generation v2.0                       ║")
    print("╠══════════════════════════════════════════════════════════════════╣")
    print("║  Hardware: MSI Titan 18 HX | i9-14900HX | 128GB | RTX 4090       ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    print()
    
    now = datetime.datetime.utcnow().isoformat() + "Z"
    
    # Create output directories
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    MANIFEST_DIR.mkdir(parents=True, exist_ok=True)
    
    # ─────────────────────────────────────────────────────────────────────────
    # PHASE 1: Hardware Fingerprint
    # ─────────────────────────────────────────────────────────────────────────
    print("═══ PHASE 1: Hardware Fingerprint ═══════════════════════════════════")
    hardware_hash = hashlib.sha256(json.dumps(NODE0_HARDWARE, sort_keys=True).encode()).hexdigest()
    print(f"  ✓ Hardware Hash: {hardware_hash[:32]}...")
    print(f"  ✓ CPU: {NODE0_HARDWARE['cpu']['model']} ({NODE0_HARDWARE['cpu']['threads']} threads)")
    print(f"  ✓ GPU: {NODE0_HARDWARE['gpu_discrete']['model']}")
    print(f"  ✓ RAM: {NODE0_HARDWARE['memory']['total_gb']}GB {NODE0_HARDWARE['memory']['type']}")
    print()
    
    # ─────────────────────────────────────────────────────────────────────────
    # PHASE 2: Model Registry
    # ─────────────────────────────────────────────────────────────────────────
    print("═══ PHASE 2: Model Registry ══════════════════════════════════════════")
    model_registry = build_model_registry()
    print(f"  📊 Total Models: {len(model_registry)}")
    total_model_size = sum(m.get('size_bytes', 0) for m in model_registry)
    print(f"  💾 Total Model Size: {total_model_size / (1024**3):.2f} GB")
    print()
    
    # ─────────────────────────────────────────────────────────────────────────
    # PHASE 2.5: Extended Categories (Full Windows Sovereign Space)
    # ─────────────────────────────────────────────────────────────────────────
    print("═══ PHASE 2.5: Extended Categories (Full Sovereign Space) ═════════════")
    extended_results = scan_all_extended_categories(quick_mode=True)
    extended_total_gb = sum(r.get("estimate_size_gb", 0) for r in extended_results.values())
    extended_file_count = sum(r.get("file_count", 0) for r in extended_results.values())
    print(f"  📊 Extended Assets: ~{extended_file_count:,} files across {extended_total_gb:.1f} GB")
    print()
    
    # ─────────────────────────────────────────────────────────────────────────
    # PHASE 3: Asset Categories
    # ─────────────────────────────────────────────────────────────────────────
    print("═══ PHASE 3: Asset Discovery ═════════════════════════════════════════")
    categories = {}
    for category, config in ASSET_CATEGORIES.items():
        manifest = process_category(category, config)
        categories[category] = manifest
        
        # Write category manifest
        manifest_path = MANIFEST_DIR / f"{category}.manifest.jsonl"
        with open(manifest_path, "w") as f:
            for receipt in manifest.receipts:
                f.write(json.dumps(asdict(receipt)) + "\n")
        print(f"    💾 Saved: {manifest_path.name}")
    print()
    
    # ─────────────────────────────────────────────────────────────────────────
    # PHASE 4: Merkle Attestation
    # ─────────────────────────────────────────────────────────────────────────
    print("═══ PHASE 4: Merkle Attestation ══════════════════════════════════════")
    # Compute global Merkle root
    category_roots = [m.merkle_root for m in categories.values()]
    category_roots.append(hardware_hash)  # Include hardware in attestation
    global_root = merkle_root(category_roots)
    print(f"  🌳 Category Roots: {len(category_roots)}")
    print(f"  🌳 Global Merkle Root: {global_root}")
    print()
    
    # Calculate PoI score (enhanced formula)
    total_assets = sum(m.asset_count for m in categories.values())
    total_size = sum(m.total_size_bytes for m in categories.values())
    
    # Total sovereign size including extended categories
    total_sovereign_gb = (total_size / (1024**3)) + extended_total_gb
    
    # PoI = (assets/10000)*0.2 + (size/500GB)*0.3 + (models/50)*0.1 + (extended_gb/500)*0.2 + hardware*0.2
    hardware_factor = 1.0  # i9-14900HX + RTX 4090 = max tier
    poi_score = min(1.0, (
        (total_assets / 10000) * 0.2 +
        (total_size / (500 * 1024 * 1024 * 1024)) * 0.3 +
        (len(model_registry) / 50) * 0.1 +
        (extended_total_gb / 500) * 0.2 +
        hardware_factor * 0.2
    ))
    
    # ─────────────────────────────────────────────────────────────────────────
    # PHASE 5: State Assembly
    # ─────────────────────────────────────────────────────────────────────────
    print("═══ PHASE 5: State Assembly ═══════════════════════════════════════════")
    
    state = ControlPlaneState(
        node_id="NODE0-TITAN-14900HX",
        hardware_fingerprint=NODE0_HARDWARE,
        ignition_time=now,
        categories={k: asdict(v) for k, v in categories.items()},
        extended_categories=extended_results,
        global_merkle_root=global_root,
        poi_score=poi_score,
        total_sovereign_size_gb=total_sovereign_gb,
        model_registry=model_registry,
        github_repos=[],  # TODO: GitHub API integration
    )
    
    # Write control plane state
    state_path = OUTPUT_DIR / "control_plane_state.json"
    with open(state_path, "w") as f:
        json.dump(asdict(state), f, indent=2)
    
    # Write model registry separately for quick access
    registry_path = OUTPUT_DIR / "model_registry.json"
    with open(registry_path, "w") as f:
        json.dump({
            "generated_at": now,
            "node_id": state.node_id,
            "total_models": len(model_registry),
            "total_size_bytes": total_model_size,
            "models": model_registry,
        }, f, indent=2)
    
    # Write hardware manifest
    hardware_path = OUTPUT_DIR / "hardware_manifest.json"
    with open(hardware_path, "w") as f:
        json.dump({
            "generated_at": now,
            "hardware_hash": hardware_hash,
            "hardware": NODE0_HARDWARE,
        }, f, indent=2)
    
    # Write extended categories summary
    extended_path = OUTPUT_DIR / "extended_categories.json"
    with open(extended_path, "w") as f:
        json.dump({
            "generated_at": now,
            "node_id": state.node_id,
            "categories": extended_results,
            "total_estimated_gb": extended_total_gb,
            "total_files_scanned": extended_file_count,
        }, f, indent=2)
    
    print()
    print("╔══════════════════════════════════════════════════════════════════╗")
    print("║              CONTROL PLANE IGNITION COMPLETE                     ║")
    print("╠══════════════════════════════════════════════════════════════════╣")
    print(f"║  Node ID:            {state.node_id:<40} ║")
    print(f"║  Ignition Time:      {state.ignition_time[:24]:<40} ║")
    print(f"║  Global Merkle Root: {global_root[:40]} ║")
    print("╠══════════════════════════════════════════════════════════════════╣")
    print("║  CORE CATEGORIES (Hashed)                                        ║")
    print(f"║    Assets:           {total_assets:<40} ║")
    print(f"║    Size:             {total_size / (1024**3):.2f} GB{' ' * 33}║")
    print("╠══════════════════════════════════════════════════════════════════╣")
    print("║  EXTENDED CATEGORIES (Full Sovereign Space)                      ║")
    for cat_name, cat_data in extended_results.items():
        est_gb = cat_data.get("estimate_size_gb", 0)
        file_ct = cat_data.get("file_count", 0)
        accessible = "✓" if cat_data.get("accessible_paths") else "✗"
        line = f"║    {accessible} {cat_name[:20]:<20} {est_gb:>6.1f} GB  ({file_ct:>6} files) ║"
        print(line[:69] + "║")
    print(f"║    ─────────────────────────────────────────────────────────────║")
    print(f"║    TOTAL SOVEREIGN:  {total_sovereign_gb:>6.1f} GB{' ' * 30}║")
    print("╠══════════════════════════════════════════════════════════════════╣")
    print(f"║  Model Registry:     {len(model_registry)} models ({total_model_size / (1024**3):.1f} GB){' ' * 18}║")
    print(f"║  PoI Score:          {poi_score:.4f}{' ' * 34}║")
    print("╠══════════════════════════════════════════════════════════════════╣")
    print(f"║  📁 {str(state_path):<60} ║")
    print(f"║  📁 {str(registry_path):<60} ║")
    print(f"║  📁 {str(hardware_path):<60} ║")
    print(f"║  📁 {str(extended_path):<60} ║")
    print("╚══════════════════════════════════════════════════════════════════╝")
    print()
    
    return state


if __name__ == "__main__":
    ignite_control_plane()
