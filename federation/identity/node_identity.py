#!/usr/bin/env python3
"""
BIZRA FEDERATION - IDENTITY AUTHORITY
Plane: Federation
Component: Node Identity & Attestation
Status: ACTIVE

This module generates and validates the Cryptographic Identity of a Sovereign Node.
It acts as the "Passport Office" for the 8B Node Network.

Standard:
- ID: SHA-256 Hash of the Genesis Key.
- Tier: Determined by Proof-of-Impact (PoI) score.
- Attestation: Signed claims of hardware/software integrity.
"""

import json
import secrets
import hashlib
import time
import os
import subprocess
from pathlib import Path
from dataclasses import dataclass, asdict
from typing import Optional

@dataclass
class NodePassport:
    node_id: str
    genesis_timestamp: float
    tier: str  # 'IRON' (Default), 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM'
    hardware_fingerprint: str
    signature: str

class IdentityAuthority:
    def __init__(self, storage_path: Path):
        self.storage_path = storage_path
        self.storage_path.mkdir(parents=True, exist_ok=True)

    def mint_identity(self, hardware_fingerprint: str = "GENERIC_SYS") -> NodePassport:
        """Mints a new Sovereign Identity for this node."""
        
        # 1. Generate Entropy
        seed = secrets.token_bytes(32)
        timestamp = time.time()
        
        # 2. Derive ID (Simulating Ed25519 Public Key abstraction)
        hasher = hashlib.sha256()
        hasher.update(seed)
        hasher.update(hardware_fingerprint.encode())
        node_id = f"node_{hasher.hexdigest()[:16]}"
        
        # 3. Create Passport signature via external signer
        sig_payload = f"{node_id}:{timestamp}:{hardware_fingerprint}"
        sign_cmd = os.getenv("BIZRA_NODE_SIGN_CMD")
        if not sign_cmd:
            raise RuntimeError("BIZRA_NODE_SIGN_CMD is required for node identity signing")
        proc = subprocess.run(
            sign_cmd,
            input=sig_payload,
            text=True,
            shell=True,
            capture_output=True,
        )
        if proc.returncode != 0:
            raise RuntimeError(f"Node signing failed: {proc.stderr.strip()}")
        signature = proc.stdout.strip()
        if not signature:
            raise RuntimeError("Node signing produced empty signature")
        
        passport = NodePassport(
            node_id=node_id,
            genesis_timestamp=timestamp,
            tier="IRON", # All nodes start at Iron
            hardware_fingerprint=hardware_fingerprint,
            signature=signature
        )
        
        self._save_passport(passport)
        return passport

    def _save_passport(self, passport: NodePassport):
        path = self.storage_path / "node_identity.json"
        with open(path, "w") as f:
            json.dump(asdict(passport), f, indent=2)

    def load_identity(self) -> Optional[NodePassport]:
        path = self.storage_path / "node_identity.json"
        if not path.exists():
            return None
        with open(path, "r") as f:
            data = json.load(f)
            return NodePassport(**data)

    def validate_passport(self, passport: NodePassport) -> bool:
        """Anti-Cheat: Verifies the integrity of the passport."""
        sig_payload = f"{passport.node_id}:{passport.genesis_timestamp}:{passport.hardware_fingerprint}"
        verify_cmd = os.getenv("BIZRA_NODE_VERIFY_CMD")
        if not verify_cmd:
            raise RuntimeError("BIZRA_NODE_VERIFY_CMD is required for node identity verification")
        proc = subprocess.run(
            f"{verify_cmd} '{sig_payload}' '{passport.signature}'",
            text=True,
            shell=True,
            capture_output=True,
        )
        return proc.returncode == 0

if __name__ == "__main__":
    # Self-Test / CLI
    import sys
    path = Path("./local_keystore")
    authority = IdentityAuthority(path)
    
    if "--force-mint" in sys.argv:
        print("Minting new identity...")
        p = authority.mint_identity(hardware_fingerprint="TITAN_18_HX_SIM")
        print(f"Minted: {p.node_id}")
    else:
        p = authority.load_identity()
        if p:
            print(f"Loaded Identity: {p.node_id} (Tier: {p.tier})")
            print(f"Valid: {authority.validate_passport(p)}")
        else:
            print("No identity found. Run with --force-mint")
