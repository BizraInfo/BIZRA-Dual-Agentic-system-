#!/bin/bash
# BIZRA Manifest Generator (Deterministic)
# DO NOT MANUALLY EDIT verification/manifest.json - use this script
# Generated: 2026-01-06

set -e

MANIFEST_FILE="verification/manifest.json"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
BUNDLE_ID="BIZRA-GEN-0-V-$(date +%Y%m%d)"

# Compute checksums
FATE_HASH=$(sha256sum src/fate.rs | cut -d' ' -f1)
SAT_HASH=$(sha256sum src/sat.rs | cut -d' ' -f1)
SAPE_HASH=$(sha256sum src/sape.rs | cut -d' ' -f1)
WISDOM_HASH=$(sha256sum src/wisdom.rs | cut -d' ' -f1)
SYNAPSE_HASH=$(sha256sum src/synapse.rs | cut -d' ' -f1)
PALPHA_HASH=$(sha256sum verification/properties/P-ALPHA-ActionBudgetLimit.smt2 | cut -d' ' -f1)
PBETA_HASH=$(sha256sum verification/properties/P-BETA-BypassPrevention.smt2 | cut -d' ' -f1)

cat > "$MANIFEST_FILE" << EOF
{
  "bundle_id": "${BUNDLE_ID}",
  "version": "1.2.0-INSTITUTION",
  "timestamp": "${TIMESTAMP}",
  "generated_by": "verification/generate_manifest.sh",
  "attestation_level": "Hash Inventory (Signature Pending)",
  "verification_scope": [
    "Z3 SMT Formal Consistency (ActionBudgetLimit: current <= limit)",
    "Byzantine Fault Tolerance (4/6 threshold + VETO)",
    "Semantic Data Integrity (SHA-256 Content-Addressing)",
    "Mathematics Verification (Sigmoid Growth Model)"
  ],
  "agent_allowlist": {
    "security_guardian": {
      "agent_id": "SAT-SEC-001",
      "role": "security_guardian",
      "veto_privilege": true
    },
    "ethics_guardian": {
      "agent_id": "SAT-ETH-002",
      "role": "ethics_guardian",
      "veto_privilege": true
    },
    "compliance_validator": {
      "agent_id": "SAT-CMP-003",
      "role": "compliance_validator",
      "veto_privilege": false
    },
    "performance_auditor": {
      "agent_id": "SAT-PRF-004",
      "role": "performance_auditor",
      "veto_privilege": false
    },
    "logic_verifier": {
      "agent_id": "SAT-LOG-005",
      "role": "logic_verifier",
      "veto_privilege": false
    },
    "integration_checker": {
      "agent_id": "SAT-INT-006",
      "role": "integration_checker",
      "veto_privilege": false
    }
  },
  "checksums": {
    "src/fate.rs": "${FATE_HASH}",
    "src/sat.rs": "${SAT_HASH}",
    "src/sape.rs": "${SAPE_HASH}",
    "src/wisdom.rs": "${WISDOM_HASH}",
    "src/synapse.rs": "${SYNAPSE_HASH}"
  },
  "properties": {
    "P-ALPHA": "${PALPHA_HASH}",
    "P-BETA": "${PBETA_HASH}"
  },
  "verification_report": "SYSTEM_VERIFICATION_REPORT.md",
  "adversarial_evidence": "adversarial_output.txt"
}
EOF

echo "Manifest generated: $MANIFEST_FILE"
sha256sum "$MANIFEST_FILE"
