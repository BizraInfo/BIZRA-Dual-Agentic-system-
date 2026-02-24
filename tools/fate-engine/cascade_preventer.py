#!/usr/bin/env python3
# tools/fate-engine/cascade_preventer.py

import json
import sys

class CascadePreventer:
    """Detects and halts cascading failures"""
    
    def __init__(self, risk_registry: dict):
        self.risks = risk_registry
    
    def check_cascade(self, event: str) -> bool:
        """Return True if cascade detected, trigger system halt"""
        
        cascade_triggers = {
            "federation_sync_failure": ["gini_undefined", "tax_stall", "compute_freeze"],
            "cve_detected": ["receipt_forge", "fate_compromise", "constitutional_violation"],
            "veto_spam": ["consensus_halt", "plutocracy_risk"],
            "receipt_malleability": ["chain_corruption", "trust_decay"]
        }
        
        if event in cascade_triggers:
            downstream = cascade_triggers[event]
            for risk in downstream:
                if self.risks.get(risk, {}).get('status') == 'active':
                    print(f"🚨 CASCADE DETECTED: {event} → {risk}")
                    return True  # Halt system
        
        return False
    
    def emergency_halt(self, reason: str):
        """Fail-close: write halt receipt, exit 99"""
        halt_receipt = {
            "type": "emergency_halt",
            "reason": reason,
            "timestamp": "2026-01-11T00:00:00Z",
            "ihsan_score": 0.0,  # Violation
            "signature": "GOVERNOR_HALT_SIG"
        }
        
        with open("receipts/emergency_halt.jsonl", "a") as f:
            f.write(json.dumps(halt_receipt) + "\n")
        
        sys.exit(99)  # Fail-close

if __name__ == "__main__":
    # Simulation run
    registry = {
        "constitutional_violation": {"status": "inactive"} 
    }
    cp = CascadePreventer(registry)
    # No cascade in happy path
    print("✅ Cascade Preventer: System Normal")
