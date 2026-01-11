#!/usr/bin/env python3
"""
BIZRA FEDERATION - ENROLLMENT OFFICER
Plane: Federation
Component: Network Gatekeeper
Status: ACTIVE
Implements: WP3.2 Federation Enrollment

The Enrollment Officer is the "Border Control" agent. 
It accepts connection requests from alien nodes, validates their passports
against the Ihsān Manifest and Anti-Cheat rules, and issues a Session Visa.
"""

import sys
import json
import logging
from pathlib import Path
from typing import Dict, Any

# Fix imports to allow running from anywhere
sys.path.append(str(Path(__file__).parent.parent.parent))

from federation.identity.node_identity import IdentityAuthority, NodePassport

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s | ENROLLMENT | %(levelname)s | %(message)s')
logger = logging.getLogger("FED-GATE")

class EnrollmentOfficer:
    def __init__(self, identity_store: Path):
        self.authority = IdentityAuthority(identity_store)

    def process_enrollment_request(self, applicant_passport_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        The Core Federation Gate.
        Decides if a node is allowed to join the Sovereign Mesh.
        """
        logger.info("Processing Enrollment Request...")
        
        # 1. Structural Validation
        try:
            passport = NodePassport(**applicant_passport_json)
        except Exception as e:
            logger.warning(f"REJECTED: Malformed Passport. {e}")
            return {"status": "REJECTED", "reason": "MALFORMED_PASSPORT"}

        # 2. Cryptographic Verification (Anti-Cheat)
        if not self.authority.validate_passport(passport):
            logger.warning(f"REJECTED: Integity Check Failed for {passport.node_id}")
            return {"status": "BANNED", "reason": "FORGED_SIGNATURE"}
            
        # 3. Tier Check (Policy)
        # BIZRA Policy: Only verified nodes can be > IRON
        if passport.tier not in ["IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM"]:
             return {"status": "REJECTED", "reason": "INVALID_TIER"}
             
        # 4. Success: Issue Visa
        logger.info(f"ACCEPTED: Node {passport.node_id} enrolled as {passport.tier}.")
        return {
            "status": "APPROVED",
            "visa_token": f"VISA_{passport.node_id}_{int(passport.genesis_timestamp)}",
            "expires_in": 3600,
            "permissions": ["READ_PUBLIC_LEDGER", "SUBMIT_PROOF"]
        }

if __name__ == "__main__":
    # Simulation Harness
    temp_store = Path("/tmp/bizra_fed_test")
    officer = EnrollmentOfficer(temp_store)
    
    # simulate an applicant
    auth_sim = IdentityAuthority(temp_store)
    applicant = auth_sim.mint_identity("ALIEN_NODE_1")
    
    # Process
    import dataclasses
    response = officer.process_enrollment_request(dataclasses.asdict(applicant))
    print(json.dumps(response, indent=2))
    
    if response["status"] == "APPROVED":
        sys.exit(0)
    else:
        sys.exit(1)
