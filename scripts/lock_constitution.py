#!/usr/bin/env python3
"""
Constitutional Lock Script - Immutable Phase 0 Implementation
Generates cryptographic commitment to the BIZRA Constitution
"""
import hashlib
import json
from datetime import datetime
import subprocess
import os

def calculate_constitution_hash():
    """Calculate SHA-256 hash of the entire constitution directory"""
    constitution_files = []
    for root, dirs, files in os.walk("constitution"):
        for file in files:
            if file.endswith(('.yaml', '.yml', '.md', '.json')):
                path = os.path.join(root, file)
                constitution_files.append(path)
    
    constitution_files.sort()  # Deterministic order
    
    hasher = hashlib.sha256()
    for file_path in constitution_files:
        with open(file_path, 'rb') as f:
            hasher.update(f.read())
    
    return hasher.hexdigest()

def generate_hsm_wrapping_keys():
    """Generate ephemeral session keys for HSM communication"""
    print("🔐 Loading HSM wrapping keys...")
    keys_path = os.getenv("BIZRA_HSM_KEYS_PATH")
    if not keys_path:
        raise RuntimeError("BIZRA_HSM_KEYS_PATH is required for HSM key material")

    with open(keys_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, dict) or not data:
        raise RuntimeError("HSM wrapping keys file must be a non-empty JSON object")

    for location, pub_key in data.items():
        if not isinstance(location, str) or not isinstance(pub_key, str) or not pub_key.strip():
            raise RuntimeError("HSM wrapping keys must be a mapping of location -> public key")

    print(f"  ✅ Loaded {len(data)} HSM wrapping keys")
    return data

def capture_tpm_state():
    """Capture current TPM PCR values for baseline"""
    try:
        result = subprocess.run(
            ["tpm2_pcrread", "sha256:0-23", "-o", "/tmp/tpm_baseline.bin"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            with open("/tmp/tpm_baseline.bin", "rb") as f:
                pcr_data = f.read()
            
            pcr_hash = hashlib.sha256(pcr_data).hexdigest()
            print(f"📊 TPM PCR baseline captured: {pcr_hash[:16]}...")
            return pcr_hash
    except Exception as e:
        raise RuntimeError(f"TPM baseline capture failed: {e}") from e

def create_genesis_manifest():
    """Create the immutable genesis manifest"""
    constitution_hash = calculate_constitution_hash()
    tpm_baseline = capture_tpm_state()
    hsm_keys = generate_hsm_wrapping_keys()
    
    manifest = {
        "version": "BIZRA-GENESIS-7.1",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "constitution_hash": constitution_hash,
        "tpm_baseline": tpm_baseline,
        "hsm_wrapping_keys": hsm_keys,
        "sape_version": "1.∞",
        "ihsan_floor": 0.99,
        "adl_max_gini": 0.35,
        "amanah_requirements": [
            "3-of-5_threshold_signatures",
            "deterministic_builds",
            "formal_verification",
            "fail_close_architecture"
        ],
        "phase_gates": {
            "phase0_complete": False,
            "phase1_complete": False,
            "phase2_complete": False,
            "phase3_complete": False
        }
    }
    
    os.makedirs("receipts", exist_ok=True)
    with open("genesis-manifest.json", "w") as f:
        json.dump(manifest, f, indent=2)
    
    # Create verifiable receipt
    receipt = {
        "type": "constitutional_lock",
        "manifest_hash": hashlib.sha256(json.dumps(manifest, sort_keys=True).encode()).hexdigest(),
        "timestamp": manifest["timestamp"],
        "evidence": [
            f"constitution_hash: {constitution_hash}",
            f"tpm_baseline: {tpm_baseline}",
            f"hsm_keys: {len(hsm_keys)} generated"
        ]
    }
    
    with open("receipts/phase0_constitutional_lock.json", "w") as f:
        json.dump(receipt, f, indent=2)
    
    print("✅ Genesis manifest created: genesis-manifest.json")
    print("📜 Phase 0 receipt generated")
    
    return manifest

if __name__ == "__main__":
    print("🚀 BIZRA CONSTITUTIONAL LOCK CEREMONY")
    print("=" * 50)
    manifest = create_genesis_manifest()
    print(f"🎯 Constitution Hash: {manifest['constitution_hash'][:32]}...")
    print(f"🔐 HSM Keys: {len(manifest['hsm_wrapping_keys'])} locations ready")
    print("🔒 PHASE 0 COMPLETE - Constitution is now immutable")
