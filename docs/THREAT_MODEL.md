# BIZRA v7.0 Threat Model & Security Contract

## 1. Trust Boundaries

The system is architected around "Defense in Depth" with specific hardware anchors and software enforcements.

| Boundary | Technology | Protection |
|----------|------------|------------|
| **Hardware Root** | TPM 2.0 | Boot integrity (PCRs), Attestation quotes |
| **Cognitive Core** | FATE (Z3) | Formal proof of IHSAAN compliance |
| **Execution Sandbox** | WASM | CPU/Memory isolation, Fuel limits |
| **State Persistence** | AES-256-GCM | Encrypted Synapse ledger at rest |

## 2. Adversarial Model

### In-Scope (Defended)

- **Prompt Injection**: SAT Security Sentinel filters known malicious patterns.
- **Kernel Bypass**: All execution MUST pass through the `BridgeCoordinator` gate.
- **Resource Exhaustion**: WASM fuel limits and HotPath timeouts prevent DoS.
- **State Tampering**: Merkle roots and TPM measurements anchor the ledger.
- **Ethical Drift**: Resonance Circuit 14 triggers rebirth if the mission root is compromised.

### Out-of-Scope (Assumptions)

- **Physical Access**: We assume the host environment (hardware) is not physically compromised after boot.
- **OS Kernel Compromise**: OS-level rootkits are outside the BIZRA user-space boundary.

## 3. The SAT VETO System

The 5-agent System Agentic Team (SAT) enforces a **FAIL-CLOSED** policy.

| Agent | VETO Conditions | logic |
|-------|-----------------|-------|
| Security | rm -rf, sudo, chmod, shell escape | Byzantine + Sentinel |
| Ethics | Deception, Harm, Manipulation | Ihsān Threshold |
| Resource | Complexity > budget | Limit Check |

## 4. PCR Mapping (TPM 2.0)

BIZRA utilizes specific Platform Configuration Registers (PCRs) to anchor its identity:

| PCR Index | Purpose | Measured Content |
|-----------|---------|------------------|
| **12** | SAPE Root | SAPE configuration and probes |
| **13** | FATE Root | Formal verification properties |
| **14** | SPINE Root | System policy and invariants |
| **15** | SOVEREIGN | Final system hash and genesis |

## 5. Circuit Fail-Safes

- **Circuit 13 (FATE Latency)**: If SMT solving exceeds 100ms, the system enters `CautiousMode` (requiring second-tier approval).
- **Circuit 14 (Resonance Drift)**: If the average SNR of the "Wisdom Root" cluster falls below 0.50, the mesh resets to Genesis state.
