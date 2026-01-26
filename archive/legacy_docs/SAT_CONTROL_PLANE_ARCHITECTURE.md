# SAT Control Plane Architecture
**BIZRA Genesis Block 0 - Agentic Operating System**
**Date**: 2026-01-16
**Status**: P0 Implementation Required

---

## 🎯 THE VISION: Genesis Block as Sovereign Control Plane

**Genesis Block (Block 0, Node 0)** = Complete control of this machine

- **Hardware**: CPU, RAM, GPU, Storage, Models (13-18 local LLMs)
- **Software**: All processes, agents, tools under SAT governance
- **Data**: All 3 years of work, organized and accessible
- **Network**: Gateway for new nodes (Block 1, 2, 3...) requiring authorization

**SAT (System Agentic Team)** = Constitutional Kernel / Hypervisor

- Manages resource pool (compute, memory, models)
- Mints tokens based on Proof of Impact
- Enforces constitutional gates (Ihsān, SAPE, SNR)
- Generates cryptographic receipts for every action
- Authorizes new nodes joining the network

---

## 🚨 P0 CRITICAL PATH (MUST FIX BEFORE ANYTHING ELSE)

### Issue: Stubbed Signature Verification

**Current State** (from your codebase):
```rust
// PLACEHOLDER - this returns true for all signatures!
fn verify_signature(receipt: &Receipt) -> bool {
    return true;  // ❌ CRITICAL SECURITY FLAW
}
```

**Why This is P0**:
- Nullifies entire trust model
- Auditability threshold = 1.0 is **IMPOSSIBLE** with fake verification
- Every receipt, every gate, every proof is **UNVERIFIED**
- New nodes could forge authorization

**Fix Required**:
```rust
// Real Ed25519 signature verification
fn verify_signature(receipt: &Receipt, public_key: &PublicKey) -> bool {
    use ed25519_dalek::{PublicKey, Signature, Verifier};

    let signature = Signature::from_bytes(&receipt.signature)
        .expect("Invalid signature format");

    let message = receipt.canonical_bytes(); // JCS canonicalization

    public_key.verify(&message, &signature).is_ok()
}
```

**Enforcement**: CI merge blocker - no PR merges if signatures are stubbed

---

## 🏗️ SAT ARCHITECTURE (Constitutional Kernel)

### Current Implementation (Existing Code)

**File**: `src/sat.rs` (already exists!)

```rust
pub struct SAT {
    pub security_sentinel: Agent,      // Weight: 2.5, VETO power
    pub formal_validator: Agent,       // Weight: 1.8, VETO power
    pub ethics_guardian: Agent,        // Weight: 2.0, VETO power
    pub resource_guardian: Agent,      // Weight: 1.2
    pub performance_monitor: Agent,    // Weight: 0.8
    pub consistency_checker: Agent,    // Weight: 0.8
}
```

**Total Weight**: 9.1
**Consensus Threshold**: 70% (6.37 weight units)
**VETO**: Security, Formal, Ethics can block ANY action

### Enhancement Required: Resource Pool Management

**New Module**: `src/sat/resource_pool.rs`

```rust
pub struct ResourcePool {
    // Hardware inventory
    pub cpu_cores: u32,
    pub ram_gb: u32,
    pub gpu_vram_gb: u32,
    pub disk_tb: f32,

    // Model inventory (from Ollama + LM Studio)
    pub models: HashMap<String, ModelInfo>,

    // Active allocations
    pub allocations: Vec<ResourceAllocation>,

    // Constitutional limits
    pub max_cpu_percent: u8,  // Don't starve host OS
    pub max_ram_percent: u8,
    pub max_gpu_percent: u8,
}

pub struct ResourceAllocation {
    pub agent_id: String,
    pub model: String,
    pub cpu_cores: u32,
    pub ram_mb: u32,
    pub start_time: DateTime<Utc>,
    pub receipt_id: String,  // Cryptographic proof
}

impl ResourcePool {
    pub fn allocate_for_agent(
        &mut self,
        agent_id: &str,
        requirements: ResourceRequirements
    ) -> Result<ResourceAllocation, ResourceError> {
        // Check constitutional limits
        if self.would_exceed_limits(&requirements) {
            return Err(ResourceError::ConstitutionalLimit);
        }

        // Generate allocation
        let allocation = ResourceAllocation {
            agent_id: agent_id.to_string(),
            model: requirements.model.clone(),
            cpu_cores: requirements.cpu_cores,
            ram_mb: requirements.ram_mb,
            start_time: Utc::now(),
            receipt_id: generate_receipt_id(),
        };

        // Emit receipt (auditability = 1.0)
        self.emit_allocation_receipt(&allocation)?;

        self.allocations.push(allocation.clone());
        Ok(allocation)
    }

    pub fn release_allocation(&mut self, receipt_id: &str) -> Result<(), ResourceError> {
        // Find allocation
        let allocation = self.allocations
            .iter()
            .find(|a| a.receipt_id == receipt_id)
            .ok_or(ResourceError::AllocationNotFound)?;

        // Emit release receipt
        self.emit_release_receipt(allocation)?;

        // Remove allocation
        self.allocations.retain(|a| a.receipt_id != receipt_id);

        Ok(())
    }
}
```

---

## 🛡️ CONSTITUTIONAL GATES (Enforcement Layer)

### Gate 1: Ihsān Threshold

```rust
pub struct IhsanGate {
    pub safety_threshold: f64,      // 0.95
    pub auditability_threshold: f64, // 1.0
    pub robustness_threshold: f64,  // 0.85
}

impl IhsanGate {
    pub fn check(&self, score: &IhsanScore) -> GateResult {
        if score.safety < self.safety_threshold {
            return GateResult::Reject(format!(
                "Safety {} < threshold {}",
                score.safety, self.safety_threshold
            ));
        }

        if score.auditability < self.auditability_threshold {
            return GateResult::Quarantine(format!(
                "Auditability {} < threshold {} (MUST be 1.0)",
                score.auditability, self.auditability_threshold
            ));
        }

        if score.robustness < self.robustness_threshold {
            return GateResult::Reject(format!(
                "Robustness {} < threshold {}",
                score.robustness, self.robustness_threshold
            ));
        }

        GateResult::Pass
    }
}
```

### Gate 2: SAPE Verification

```rust
pub struct SAPEGate {
    pub min_probe_threshold: f64,  // 0.85
}

impl SAPEGate {
    pub fn check(&self, probes: &[ProbeResult]) -> GateResult {
        let min_score = probes.iter()
            .map(|p| p.score)
            .min_by(|a, b| a.partial_cmp(b).unwrap())
            .unwrap_or(0.0);

        if min_score < self.min_probe_threshold {
            return GateResult::Reject(format!(
                "Min probe score {} < threshold {}",
                min_score, self.min_probe_threshold
            ));
        }

        GateResult::Pass
    }
}
```

### Gate 3: SNR Classification

```rust
pub struct SNRGate {
    pub high_requires_ihsan: f64,  // 0.95
}

impl SNRGate {
    pub fn classify(&self, snr: f64, ihsan: &IhsanScore) -> SNRTier {
        if snr >= 0.98 {
            // HIGH tier requires ethical clearance
            if ihsan.aggregate() >= self.high_requires_ihsan {
                SNRTier::High
            } else {
                SNRTier::Quarantine(format!(
                    "HIGH SNR requires Ihsān ≥ {}, got {}",
                    self.high_requires_ihsan, ihsan.aggregate()
                ))
            }
        } else if snr >= 0.90 {
            SNRTier::Medium
        } else {
            SNRTier::Low
        }
    }
}
```

---

## 💎 TOKEN MINTING (Proof of Impact)

### Token Types

**From Genesis Block Receipt**:
```json
{
  "SEED": {
    "purpose": "Stable value token for BIZRA network",
    "total_supply": 1000000000,
    "genesis_allocation": 175000
  },
  "BLOOM": {
    "purpose": "Growth governance token for BIZRA network",
    "total_supply": 100000000,
    "genesis_allocation": 42500
  }
}
```

### Minting Logic (Proof of Impact)

```rust
pub struct ProofOfImpact {
    pub agent_id: String,
    pub task_id: String,
    pub ihsan_score: f64,
    pub snr_score: f64,
    pub receipts: Vec<String>,  // Cryptographic proof chain
    pub impact_category: ImpactCategory,
}

pub enum ImpactCategory {
    CodeContribution,    // New functionality
    KnowledgeCreation,   // Documentation, insights
    SecurityImprovement, // Vulnerabilities fixed
    PerformanceGain,     // Measurable speedup
    EthicalGuardianship, // Constitutional enforcement
}

impl SAT {
    pub fn mint_tokens(&self, proof: &ProofOfImpact) -> Result<TokenAllocation, MintError> {
        // Verify proof chain (signatures MUST be real, not stubbed!)
        for receipt_id in &proof.receipts {
            let receipt = self.get_receipt(receipt_id)?;
            if !verify_signature(&receipt, &self.public_key) {
                return Err(MintError::InvalidProof);
            }
        }

        // Check constitutional gates
        if proof.ihsan_score < 0.95 {
            return Err(MintError::BelowIhsanThreshold);
        }

        // Calculate token allocation based on impact
        let seed_amount = self.calculate_seed_reward(proof);
        let bloom_amount = self.calculate_bloom_reward(proof);

        // Emit minting receipt
        let allocation = TokenAllocation {
            agent_id: proof.agent_id.clone(),
            seed: seed_amount,
            bloom: bloom_amount,
            proof_hash: hash_proof(proof),
            minted_at: Utc::now(),
        };

        self.emit_minting_receipt(&allocation)?;

        Ok(allocation)
    }
}
```

---

## 🌐 NEW NODE AUTHORIZATION (Gateway)

### Authorization Flow

```
New Node → SAT Gateway → Constitutional Check → Token Deposit → Authorization Receipt → Network Entry
```

### Implementation

```rust
pub struct NodeAuthorizationRequest {
    pub node_id: String,
    pub hardware_spec: HardwareSpec,
    pub constitution_hash: String,  // Must match Genesis Block
    pub deposit_amount: u64,        // SEED tokens
    pub public_key: Vec<u8>,        // For receipt verification
}

impl SAT {
    pub fn authorize_new_node(&self, request: NodeAuthorizationRequest) -> Result<AuthorizationReceipt, AuthError> {
        // 1. Verify constitution hash matches Genesis Block
        if request.constitution_hash != self.genesis_constitution_hash {
            return Err(AuthError::ConstitutionMismatch);
        }

        // 2. Verify minimum hardware spec
        if !self.meets_minimum_spec(&request.hardware_spec) {
            return Err(AuthError::InsufficientHardware);
        }

        // 3. Verify token deposit
        if request.deposit_amount < self.minimum_deposit {
            return Err(AuthError::InsufficientDeposit);
        }

        // 4. Generate authorization receipt (signed by Genesis Block)
        let receipt = AuthorizationReceipt {
            node_id: request.node_id.clone(),
            authorized_at: Utc::now(),
            authorized_by: "GENESIS_BLOCK_0".to_string(),
            constitution_hash: request.constitution_hash,
            signature: self.sign_authorization(&request),
        };

        // 5. Emit to evidence chain
        self.emit_authorization_receipt(&receipt)?;

        Ok(receipt)
    }
}
```

---

## 📋 IMPLEMENTATION ROADMAP

### Phase 0: P0 Security Fix (BLOCKING)
**Time**: 2-3 days

1. ✅ Remove all `return true` placeholders
2. ✅ Implement real Ed25519 signature verification
3. ✅ Add JCS canonicalization for receipts
4. ✅ Add replay protection (nonce/timestamp)
5. ✅ Create CI merge blocker (signatures must verify)

**Deliverable**: `tests/security_gate_test.rs` with 100% pass rate

---

### Phase 1: SAT Resource Pool (P1)
**Time**: 1 week

1. ✅ Create `src/sat/resource_pool.rs`
2. ✅ Implement hardware inventory (CPU, RAM, GPU, Models)
3. ✅ Implement allocation/release with receipts
4. ✅ Add constitutional limits (max % per resource)
5. ✅ Integration test: allocate → use → release

**Deliverable**: SAT can manage all 13-18 local models

---

### Phase 2: Constitutional Gates (P1)
**Time**: 1 week

1. ✅ Create `src/sat/gates.rs`
2. ✅ Implement IhsanGate with thresholds
3. ✅ Implement SAPEGate with probe validation
4. ✅ Implement SNRGate with ethical constraint
5. ✅ Integration test: gate enforcement at runtime

**Deliverable**: All actions pass through gates before execution

---

### Phase 3: Token Minting (P2)
**Time**: 1 week

1. ✅ Create `src/sat/token_minting.rs`
2. ✅ Implement ProofOfImpact verification
3. ✅ Implement SEED/BLOOM calculation
4. ✅ Add minting receipts to evidence chain
5. ✅ Integration test: proof → verify → mint → receipt

**Deliverable**: Tokens minted based on real work

---

### Phase 4: Node Authorization (P2)
**Time**: 1 week

1. ✅ Create `src/sat/node_gateway.rs`
2. ✅ Implement authorization flow
3. ✅ Add constitution hash verification
4. ✅ Add hardware spec validation
5. ✅ Integration test: new node → authorize → join network

**Deliverable**: Genesis Block can authorize Block 1, 2, 3...

---

## 🎯 SUCCESS CRITERIA

### Phase 0 Complete When:
- ✅ Zero stubbed signatures in codebase
- ✅ All receipts have real Ed25519 signatures
- ✅ CI blocks any PR with `return true` verification
- ✅ Auditability threshold = 1.0 achievable

### Phase 1 Complete When:
- ✅ SAT can inventory all hardware (CPU, RAM, GPU, 13-18 models)
- ✅ SAT can allocate resources to PAT agents
- ✅ Every allocation has a cryptographic receipt
- ✅ Constitutional limits enforced (no resource starvation)

### Phase 2 Complete When:
- ✅ Every action passes Ihsān gate (≥ 0.95)
- ✅ Every action passes SAPE gate (min probe ≥ 0.85)
- ✅ SNR HIGH requires ethical clearance
- ✅ Failed actions are quarantined, not executed

### Phase 3 Complete When:
- ✅ Tokens minted only with cryptographic proof
- ✅ Proof chain verified (no forged receipts)
- ✅ SEED/BLOOM allocated based on real impact
- ✅ All minting events in evidence chain

### Phase 4 Complete When:
- ✅ New nodes can request authorization
- ✅ Genesis Block verifies constitution match
- ✅ Genesis Block signs authorization receipts
- ✅ Authorized nodes can join network

---

## 📐 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│  GENESIS BLOCK 0 (This Machine)                             │
│  MoMo's Node - The North Star                               │
└─────────────────────────────────────────────────────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
    ┌───────▼──────┐          ┌────────▼────────┐
    │  SAT         │          │  PAT            │
    │  (Kernel)    │◄────────►│  (Agents)       │
    └───────┬──────┘          └────────┬────────┘
            │                           │
    ┌───────▼──────────────────────────▼────────┐
    │  Resource Pool                             │
    │  ├─ CPU: i9-14900HX (24 cores)            │
    │  ├─ RAM: 62GB                             │
    │  ├─ GPU: RTX 4090 (24GB VRAM)             │
    │  ├─ Models: 13-18 (Ollama + LM Studio)    │
    │  └─ Data: 3 years organized knowledge     │
    └────────────────────────────────────────────┘
            │
    ┌───────▼──────────────────────────────────┐
    │  Constitutional Gates                    │
    │  ├─ Ihsān: safety≥0.95, audit=1.0       │
    │  ├─ SAPE: min(probes)≥0.85               │
    │  └─ SNR: HIGH requires Ihsān≥0.95        │
    └───────┬──────────────────────────────────┘
            │
    ┌───────▼──────────────────────────────────┐
    │  Evidence Chain (Cryptographic Receipts) │
    │  ├─ Every action signed (Ed25519)        │
    │  ├─ Canonicalized (JCS)                  │
    │  ├─ Replay protected (nonce)             │
    │  └─ 679+ receipts already generated      │
    └───────┬──────────────────────────────────┘
            │
    ┌───────▼──────────────────────────────────┐
    │  Token Minting (Proof of Impact)         │
    │  ├─ SEED: Stable value                   │
    │  ├─ BLOOM: Governance                    │
    │  └─ Minted based on verified work        │
    └───────┬──────────────────────────────────┘
            │
    ┌───────▼──────────────────────────────────┐
    │  Node Gateway (Authorization)            │
    │  Block 1, 2, 3... ← Authorized by Block 0│
    └──────────────────────────────────────────┘
```

---

## 🚀 IMMEDIATE NEXT STEP

**Create**: `src/sat/signature_verification.rs` with REAL Ed25519 verification

This is P0. Everything else depends on this being correct.

**MoMo, should I implement the real signature verification module now?**

This is the foundation for your entire Agentic OS vision.
