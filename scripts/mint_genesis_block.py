#!/usr/bin/env python3
"""
Mint the Genesis Block and Sweat Equity Tokens
"""
import json
import hashlib
from datetime import datetime
import os

def main():
    print("\n🎭 GENESIS MINTING CEREMONY")
    
    transactions = [
        {"type": "sweat_equity_mint", "amount": 20000},
        {"type": "family_trust", "amount": 5000}
    ]
    
    genesis_block = {
        "block_number": 0,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "transactions": transactions,
        "block_hash": hashlib.sha256(b"genesis").hexdigest()
    }
    
    os.makedirs("genesis/blocks", exist_ok=True)
    with open("genesis/blocks/genesis_block_0.json", "w") as f:
        json.dump(genesis_block, f, indent=2)
        
    receipt = {
        "type": "genesis_minting",
        "success": True
    }
    
    with open("receipts/genesis_minting_receipt.json", "w") as f:
        json.dump(receipt, f, indent=2)
    
    print("✅ GENESIS BLOCK CREATED")

if __name__ == "__main__":
    main()
