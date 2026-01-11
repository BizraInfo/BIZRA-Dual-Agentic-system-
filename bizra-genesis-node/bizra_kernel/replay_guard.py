"""
ReplayGuard — Evidence Envelope Security
========================================
Implements the security primitives for the Evidence Envelope:
1. Nonce tracking (anti-replay)
2. Monotonic counters (ordering)
3. Policy hash binding (constitutional enforcement)

This ensures that every executed action is unique, ordered, and governed
by the active constitution.
"""

from dataclasses import dataclass, field
from typing import Dict, Set, Optional
import time
import hashlib
import json

@dataclass
class Envelope:
    """The Evidence Envelope structure that wraps every action."""
    # Binding
    policy_hash: str        # Snapshot of the constitution
    session_id: str         # Session scope
    agent_id: str           # Actor
    
    # Ordering & Uniqueness
    nonce: str              # Random unique identifier
    counter: int            # Monotonic counter for this session
    timestamp: float        # Timestamp (UTC)
    
    # Payload
    payload_hash: str       # Hash of the actual content/action
    
    def compute_envelope_hash(self) -> str:
        """Compute the unique hash of this envelope."""
        data = {
            "policy": self.policy_hash,
            "session": self.session_id,
            "agent": self.agent_id,
            "nonce": self.nonce,
            "counter": self.counter,
            "ts": self.timestamp,
            "payload": self.payload_hash,
        }
        canonical = json.dumps(data, sort_keys=True)
        return hashlib.sha256(canonical.encode()).hexdigest()

class ReplayGuard:
    """
    Enforces uniqueness and ordering of envelopes.
    
    State:
    - active_nonces: Set of recently seen nonces (to prevent replay)
    - session_counters: Map of session_id -> last_seen_counter (to enforce order)
    """
    
    def __init__(self, nonce_ttl_seconds: int = 3600):
        self.nonce_ttl_seconds = nonce_ttl_seconds
        self.seen_nonces: Dict[str, float] = {}  # nonce -> timestamp
        self.session_counters: Dict[str, int] = {} # session_id -> last_counter
    
    def validate_envelope(self, envelope: Envelope) -> bool:
        """
        Validate an envelope against replay and ordering rules.
        Raises ValueError on failure.
        """
        
        # 1. Nonce Check (Anti-Replay)
        if envelope.nonce in self.seen_nonces:
            raise ValueError(f"Replay detected: Nonce {envelope.nonce} already used.")
        
        # Prune old nonces lazily
        now = time.time()
        # (check current nonce freshness)
        if (now - envelope.timestamp) > self.nonce_ttl_seconds:
            raise ValueError("Envelope expired (timestamp too old).")
            
        # 2. Monotonic Counter Check (Ordering)
        last_counter = self.session_counters.get(envelope.session_id, 0)
        if envelope.counter <= last_counter:
            raise ValueError(
                f"Ordering violation: Counter {envelope.counter} <= last {last_counter} "
                f"for session {envelope.session_id}"
            )
            
        # 3. Policy Binding (Basic Check)
        if not envelope.policy_hash:
            raise ValueError("Invalid envelope: Missing policy_hash binding.")
            
        # --- Commit State ---
        self.seen_nonces[envelope.nonce] = now
        self.session_counters[envelope.session_id] = envelope.counter
        
        return True

    def get_next_counter(self, session_id: str) -> int:
        """Get the expected next counter value for a session."""
        return self.session_counters.get(session_id, 0) + 1

    def cleanup(self):
        """Remove expired nonces."""
        now = time.time()
        expired = [n for n, ts in self.seen_nonces.items() 
                  if (now - ts) > self.nonce_ttl_seconds]
        for n in expired:
            del self.seen_nonces[n]
