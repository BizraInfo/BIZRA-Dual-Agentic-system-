#!/usr/bin/env python3
"""
BIZRA Data Scanner - Complete inventory of 3 years of work
Scans entire filesystem, catalogues all files, computes SHA256 hashes

Usage: python3 scan_all_data.py
Output: /root/bizra_data_vault/MASTER_INVENTORY.jsonl
"""

import json
import hashlib
import os
from pathlib import Path
from datetime import datetime
import mimetypes

# Directories to scan
SCAN_ROOTS = [
    "/root/bizra-genesis",
    "/root/bizra_data_vault",
    "/root/.claude"  # Claude conversation history
]

# File extensions to categorize
CATEGORIES = {
    "code": [".py", ".rs", ".ts", ".js", ".go", ".java", ".cpp", ".c", ".h"],
    "data": [".json", ".yaml", ".yml", ".csv", ".db", ".sqlite"],
    "docs": [".md", ".txt", ".pdf", ".doc", ".docx"],
    "receipts": ["EXEC-", "REJ-", "GENESIS-"],
    "config": [".toml", ".ini", ".conf", ".env"],
    "web": [".html", ".css", ".jsx", ".tsx", ".vue"],
    "models": [".onnx", ".pt", ".pth", ".safetensors"],
    "images": [".png", ".jpg", ".jpeg", ".gif", ".svg"],
    "logs": [".log"]
}

def compute_sha256(file_path):
    """Compute SHA256 hash of file"""
    try:
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            # Read in 64kb chunks
            for byte_block in iter(lambda: f.read(65536), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except Exception as e:
        return f"ERROR: {str(e)}"

def categorize_file(file_path):
    """Determine file category"""
    file_name = os.path.basename(file_path)
    file_ext = os.path.splitext(file_path)[1].lower()

    # Check for receipts by filename pattern
    for pattern in CATEGORIES["receipts"]:
        if pattern in file_name:
            return "receipts"

    # Check by extension
    for category, extensions in CATEGORIES.items():
        if category == "receipts":
            continue
        if file_ext in extensions:
            return category

    # Default
    return "other"

def is_binary(file_path):
    """Check if file is binary"""
    try:
        with open(file_path, 'rb') as f:
            chunk = f.read(1024)
            return b'\x00' in chunk
    except:
        return True

def scan_directory(root_path, progress_callback=None):
    """Scan directory recursively and yield file info"""
    root = Path(root_path)

    # Skip these directories
    skip_dirs = {
        'node_modules', '.git', 'target', '__pycache__',
        '.next', 'dist', 'build', '.cache', '.venv',
        'venv', '.conda'
    }

    file_count = 0

    for item in root.rglob('*'):
        # Skip if any parent is in skip_dirs
        if any(skip_dir in item.parts for skip_dir in skip_dirs):
            continue

        if item.is_file():
            try:
                stat = item.stat()

                file_info = {
                    "path": str(item),
                    "name": item.name,
                    "size_bytes": stat.st_size,
                    "size_mb": round(stat.st_size / (1024 * 1024), 2),
                    "created": datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    "category": categorize_file(str(item)),
                    "extension": item.suffix.lower(),
                    "is_binary": is_binary(str(item)),
                    "sha256": None,  # Will compute later for important files
                    "scanned_at": datetime.now().isoformat()
                }

                file_count += 1
                if progress_callback and file_count % 100 == 0:
                    progress_callback(file_count)

                yield file_info

            except Exception as e:
                print(f"Error scanning {item}: {e}")
                continue

def main():
    print("=" * 70)
    print("🔍 BIZRA DATA SCANNER - Complete Inventory")
    print("=" * 70)
    print(f"📂 Scanning directories:")
    for root in SCAN_ROOTS:
        if os.path.exists(root):
            print(f"   ✅ {root}")
        else:
            print(f"   ❌ {root} (not found)")
    print()

    # Output file
    output_file = Path("/root/bizra_data_vault/MASTER_INVENTORY.jsonl")
    output_file.parent.mkdir(parents=True, exist_ok=True)

    # Statistics
    stats = {
        "total_files": 0,
        "total_size_bytes": 0,
        "categories": {},
        "largest_files": [],
        "by_extension": {}
    }

    print(f"📝 Writing inventory to: {output_file}")
    print(f"⏳ Scanning... (this may take a few minutes)")
    print()

    start_time = datetime.now()

    with open(output_file, 'w') as f:
        for root_path in SCAN_ROOTS:
            if not os.path.exists(root_path):
                continue

            print(f"Scanning {root_path}...")

            for file_info in scan_directory(root_path):
                # Write to JSONL
                f.write(json.dumps(file_info) + '\n')

                # Update statistics
                stats["total_files"] += 1
                stats["total_size_bytes"] += file_info["size_bytes"]

                category = file_info["category"]
                stats["categories"][category] = stats["categories"].get(category, 0) + 1

                ext = file_info["extension"]
                if ext:
                    stats["by_extension"][ext] = stats["by_extension"].get(ext, 0) + 1

                # Track largest files
                stats["largest_files"].append({
                    "path": file_info["path"],
                    "size_mb": file_info["size_mb"]
                })

    # Sort largest files
    stats["largest_files"].sort(key=lambda x: x["size_mb"], reverse=True)
    stats["largest_files"] = stats["largest_files"][:20]

    elapsed = (datetime.now() - start_time).total_seconds()

    # Print summary
    print()
    print("=" * 70)
    print("✅ SCAN COMPLETE")
    print("=" * 70)
    print(f"⏱️  Time: {elapsed:.1f} seconds")
    print(f"📊 Total files: {stats['total_files']:,}")
    print(f"💾 Total size: {stats['total_size_bytes'] / (1024**3):.2f} GB")
    print()
    print("📁 By Category:")
    for category, count in sorted(stats["categories"].items(), key=lambda x: x[1], reverse=True):
        print(f"   {category:15s}: {count:,} files")
    print()
    print("🔝 Largest Files:")
    for i, file in enumerate(stats["largest_files"][:10], 1):
        print(f"   {i:2d}. {file['size_mb']:8.2f} MB - {file['path']}")
    print()
    print(f"💾 Inventory saved to: {output_file}")
    print()

    # Save summary
    summary_file = Path("/root/bizra_data_vault/INVENTORY_SUMMARY.json")
    with open(summary_file, 'w') as f:
        json.dumps(stats, f, indent=2)

    print(f"📈 Summary saved to: {summary_file}")
    print()
    print("🎯 Next Steps:")
    print("   1. Review the inventory: cat MASTER_INVENTORY.jsonl | head -20")
    print("   2. Analyze by category: python3 analyze_inventory.py")
    print("   3. Start indexing important files for search")
    print("=" * 70)

if __name__ == "__main__":
    main()
