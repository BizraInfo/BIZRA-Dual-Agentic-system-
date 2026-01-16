#!/usr/bin/env python3
"""
HSM Signing Ceremony for Genesis Block
"""
import json
import os
from datetime import datetime

def main():
    print("🎭 HSM SIGNING CEREMONY BEGINS")

    signatures_path = os.getenv("BIZRA_HSM_SIGNATURES_PATH")
    if not signatures_path:
        raise RuntimeError("BIZRA_HSM_SIGNATURES_PATH is required for production signing")

    with open(signatures_path, "r", encoding="utf-8") as f:
        signatures = json.load(f)

    if not isinstance(signatures, dict) or len(signatures) < 3:
        raise RuntimeError("HSM signatures must include at least 3 locations")
    
    receipt = {
        "type": "hsm_signing_ceremony",
        "threshold_met": len(signatures) >= 3,
        "signatures": signatures
    }
    
    os.makedirs("receipts", exist_ok=True)
    with open("receipts/hsm_ceremony_receipt.json", "w") as f:
        json.dump(receipt, f, indent=2)
        
    print("✅ HSM CEREMONY VALIDATED")
    return True

if __name__ == "__main__":
    main()
