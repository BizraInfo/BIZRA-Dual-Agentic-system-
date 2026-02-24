# Specification: Synaptic Bridge Protocol (VΩ.5.1)

The **Synaptic Bridge Protocol** is the core neural-symbolic interface of the BIZRA system. it provides a deterministic, verifiable link between high-dimensional neural representations and discrete symbolic logical invariants.

## 1. The Neural-Symbolic Transformation

The bridge operates in four discrete stages:

1. **Neural Fluency Stage**: Extraction of raw claims/reasoning from the LLM or Agentsociety.
2. **Symbolic Grounding Stage**: Mapping of extracted claims to `TypedDefinitions` (e.g., `Uuid`, `IhsanVector`).
3. **Invariant Verification Stage**: Testing grounded expressions against domain-specific logical invariants.
4. **Proof Attachment Stage**: Generating a `VerifiedFrame` containing the symbolic proof and 'Isnad' (provenance chain).

## 2. The 6-Check Validation Gate

Every frame crossing the bridge must pass the **Validator** across six dimensions:

| Check | Description | Fail-Closed Policy |
| :--- | :--- | :--- |
| **Correctness** | Logical validity of internal reasoning | `VETO` if confidence < 0.95 |
| **Consistency** | Zero contradictions across claims | `VETO` on detected contradiction |
| **Completeness** | Edge case and boundary condition coverage | `WARN` if missing |
| **Causality** | Explicit causal links (A → B) | `VETO` if purely statistical |
| **Ethics (Ihsān)** | Alignment with Maqasid principles | `APOPTOSIS` if < 0.85 |
| **Evidence** | Direct links to manifest/ledger entries | `VETO` if unanchored |

## 3. Ihsān Refinement Types

We utilize Rust's type system to enforce ethical constraints at compile/runtime:

```rust
pub struct IhsanScore(f64); // Guaranteed [0.0, 1.0]

impl IhsanScore {
    pub fn new(val: f64) -> Option<Self> {
        if (0.0..=1.0).contains(&val) { Some(Self(val)) } else { None }
    }
}

pub struct EthicalAction<T> {
    pub payload: T,
    pub proof: VerifiedProof, 
    pub score: IhsanScore, // Must be ≥ 0.95 for direct execution
}
```

## 4. Hardware Binding (Gate 7+)

The Synaptic Bridge is bound to the UEFI Firmware level via the **Apoptosis Circuit**. A violation of an `InvariantSeverity::Veto` on the Ethics check triggers the hardware-enforced system lock.

---
**Status**: Formalized (V1.∞)
**SNR Target**: 99.5/100
