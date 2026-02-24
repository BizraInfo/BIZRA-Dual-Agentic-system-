# WP3.2 Federation MVP Spec (v0.1)
**Status:** DRAFT | **Domain:** Control Plane / Data Plane / Delivery Plane
**Covenant:** Truth before Value | Proof before Coin

## 1. Overview
This specification defines the Minimum Viable Product for the BIZRA Federation. It enables "Appliance" nodes (Node₁) to securely join the "Genesis" node (Node₀), establish identity through attestation, and perform work under a capability-based policy framework with Proof of Ihsān (PoI) accounting.

## 2. Network Protocol (BMNP v1)
*Bizra Minimal Network Protocol* uses HTTP/mTLS for the control plane.

| Message | Source | Target | Description |
| :--- | :--- | :--- | :--- |
| `ENROLL_REQ` | Node₁ | Node₀ | Submit Identity + Attestation Data + Capability Request. |
| `ENROLL_ACK` | Node₀ | Node₁ | Enrollment Certificate + Scoped Capabilities + Initial Policy. |
| `POLICY_PUSH` | Node₀ | Node₁ | Update to SAT Reflex rules or Resource Contracts. |
| `HEARTBEAT` | Node₁ | Node₀ | Status + Resource Utilization + Health Check. |
| `POI_SUBMIT` | Node₁ | Node₀ | Submit Proof-of-Ihsān receipt + Evidence pointers. |
| `POI_ACK` | Node₀ | Node₁ | Confirm receipt validation and impact credit. |
| `QUARANTINE` | Node₀ | Node₁ | Signal immediate isolation due to policy violation or anti-cheat trip. |

## 3. Enrollment Flow
1. **Identity Generation:** Node₁ generates a local Ed25519 keypair and measures the system (PCR 12-15).
2. **Request:** Node₁ sends `ENROLL_REQ` containing its Public Key, TPM Quote (simulated/hw), and hardware manifest.
3. **Verification:** Node₀ validates the TPM quote and checks against the `whitelisted_hardware` list.
4. **Issuance:** Node₀ generates an **Enrollment Certificate** (JSON-signed) containing:
   - `node_uid`: Unique identifier.
   - `trust_tier`: (BRONZE, SILVER, GOLD, PLATINUM).
   - `permissions`: Scoped capabilities (e.g., `fs.read`, `net.outbound`, `cpu.limit`).
   - `rate_limits`: Request/second and Impact/hour quotas.
5. **Activation:** Node₁ receives the cert and initializes the **Warper Sandbox**.

## 4. Trust Tiers & Capability Matrix
| Tier | Reqs | Capabilities | Default Policy |
| :--- | :--- | :--- | :--- |
| **BRONZE** | No HW TPM | Pure Sandboxed WASM | Fail-Closed on all outside data. |
| **SILVER** | HW TPM | WASM + Local State | Log everything, daily audit. |
| **GOLD** | TPM + 0.95 Ihsān | WASM + LAN Access | Real-time PoI verification. |
| **PLATINUM** | Multi-Validator | Full Node Capability | Peer to Peer settlement. |

## 5. Anti-Cheat Baseline (The Sentinel)
- **Semantic Hash Check:** Node₀ checks `POI_SUBMIT` outputs for near-duplicate hashes from different nodes.
- **Telemetry Correlation:** Compare reported CPU/Mem usage in `HEARTBEAT` against task complexity.
- **Nonce Windows:** Heartbeats and PoIs must use monotonic nonces within a 5s time window.
- **Sybil Resistance:** Enrollment requires unique hardware serials and "Proof of Location" (optional).

## 6. Evaluation Suite (BES v0.2)
BES v0.2 introduces $pass^k$ (Pass rate over K iterations) to ensure stability in non-deterministic agentic tasks.

### New Tasks to Implement:
- `FED_ENROLL_HAPPY_PATH`: Full enrollment sequence simulation.
- `FED_POLICY_PUSH`: Verify Node₁ updates Reflex engine on receiving new policy.
- `SYBIL_ATTACK_SIM`: Attempt to join with cloned hardware IDs.
- `RESOURCE_LYING_PROBE`: Node₁ reports 10% CPU usage while pinned at 100%.

## 7. Glass Cockpit Exposed Metrics
- `fed.nodes.active`: Count of enrolled nodes per tier.
- `fed.poi_latency`: p95 time from PoI creation to Node₀ validation.
- `fed.cheat_events`: Tally of rejected receipts by reason.
- `fed.mesh_stability`: Heartbeat success rate across the fleet.
