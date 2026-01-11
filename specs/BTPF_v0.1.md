# BIZRA Trust & Proof Framework (BTPF) v0.1

### 2.0 Proof-of-Impact (PoI) Receipt Specification

```protobuf
syntax = "proto3";

package bizra.poi.v1;

message PoIReceipt {
  // Core Identification
  string receipt_id = 1;      // UUIDv7 + cryptographic hash
  string node_id = 2;         // Quantum-resistant node identity
  uint64 timestamp = 3;       // Unix timestamp in nanoseconds
  
  // Contribution Details
  ContributionType contribution_type = 4;
  ResourceUsage resource_usage = 5;
  QualityMetrics quality_metrics = 6;
  
  // Verification Chain
  repeated string validator_ids = 7;  // Validator node IDs
  bytes aggregate_signature = 8;      // BLS aggregate signature
  float confidence_score = 9;         // 0.0-1.0
  
  // Evidence
  repeated EvidenceLink evidence = 10;
  bytes output_hash = 11;             // Merkle root of outputs
  
  // Attestation
  AttestationProof attestation = 12;
  bytes node_signature = 13;          // Ed25519 signature
}

message ResourceUsage {
  uint64 cpu_seconds = 1;
  uint64 memory_bytes = 2;
  uint64 storage_bytes = 3;
  uint64 network_bytes = 4;
  uint64 energy_joules = 5;           // Estimated energy consumption
}

enum ContributionType {
  COMPUTE = 0;
  STORAGE = 1;
  KNOWLEDGE = 2;
  VALIDATION = 3;
  NETWORK = 4;
  COMMUNITY = 5;
  SECURITY = 6;
}

message AttestationProof {
  oneof proof_type {
    TpmAttestation tpm = 1;
    SoftwareAttestation software = 2;
    HardwareAttestation hardware = 3;
  }
  uint64 attestation_time = 4;
  bytes quote = 5;                     // TPM quote or equivalent
}
```

### 2.1 Anti-Cheat Mechanisms

```yaml
# Fraud Detection Matrix
fraud_detection:
  replay_attacks:
    detection: "temporal uniqueness check + nonce"
    action: "receipt rejection + reputation penalty"
  
  duplicate_outputs:
    detection: "semantic similarity + hash comparison"
    action: "reward reduction to zero"
  
  resource_lying:
    detection: "performance benchmarking + telemetry correlation"
    action: "resource cap reduction"
  
  sybil_attacks:
    detection: "hardware fingerprinting + network analysis"
    action: "permanent ban + stake slashing"
  
  collusion:
    detection: "graph analysis + transaction pattern recognition"
    action: "temporary quarantine + investigation"

# Reputation System
reputation:
  scoring_formula: "base_score * decay_factor * bonus_multiplier"
  decay_rate: "5% per month (exponential)"
  slashing_conditions:
    - "provable_fraud": "50% slash"
    - "consistent_poor_quality": "10-30% slash"
    - "resource_violation": "5-20% slash"
    - "network_abuse": "25% slash"
```

### 2.2 Attestation Framework (Graded Trust)

```python
# attestation/graded_trust.py
class GradedAttestation:
    """Graded trust model for diverse hardware capabilities"""
    
    TRUST_LEVELS = {
        "platinum": {
            "requirements": ["tpm2", "secure_boot", "measured_boot"],
            "multiplier": 1.5,
            "capabilities": ["all_contributions", "validator_role"]
        },
        "gold": {
            "requirements": ["tpm2", "secure_boot"],
            "multiplier": 1.2,
            "capabilities": ["all_contributions"]
        },
        "silver": {
            "requirements": ["software_attestation"],
            "multiplier": 1.0,
            "capabilities": ["compute", "storage", "knowledge"]
        },
        "bronze": {
            "requirements": ["basic_integrity"],
            "multiplier": 0.7,
            "capabilities": ["compute", "storage"]
        }
    }
    
    def assess_node(self, hardware_info: HardwareInfo) -> TrustAssessment:
        """Assess node trust level based on hardware capabilities"""
        
        score = 0.0
        met_requirements = []
        
        # Check TPM 2.0
        if hardware_info.has_tpm2:
            score += 0.4
            met_requirements.append("tpm2")
        
        # Check secure boot
        if hardware_info.secure_boot_enabled:
            score += 0.3
            met_requirements.append("secure_boot")
        
        # Check measured boot
        if hardware_info.measured_boot:
            score += 0.2
            met_requirements.append("measured_boot")
        
        # Software attestation fallback
        if score == 0.0:
            if self.software_attestation_passed(hardware_info):
                score = 0.5
                met_requirements.append("software_attestation")
        
        # Determine trust level
        if score >= 0.9:
            level = "platinum"
        elif score >= 0.7:
            level = "gold"
        elif score >= 0.5:
            level = "silver"
        else:
            level = "bronze"
        
        return TrustAssessment(
            level=level,
            score=score,
            requirements_met=met_requirements,
            multiplier=self.TRUST_LEVELS[level]["multiplier"],
            capabilities=self.TRUST_LEVELS[level]["capabilities"]
        )
```

### 2.3 Audit Trail Specification

```json
{
  "audit_trail": {
    "requirements": {
      "immutability": "cryptographic chaining",
      "completeness": "all state changes logged",
      "verifiability": "third-party auditable",
      "privacy": "selective disclosure via ZK proofs"
    },
    
    "logged_events": [
      "node_state_changes",
      "resource_allocations",
      "poi_receipt_generation",
      "attestation_events",
      "fraud_detection_events",
      "governance_decisions",
      "security_incidents"
    ],
    
    "storage": {
      "local": "encrypted WAL (write-ahead log)",
      "network": "distributed ledger (BlockGraph)",
      "retention": "indefinite for critical events",
      "compression": "adaptive based on age"
    }
  }
}
```
