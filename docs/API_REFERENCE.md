# BIZRA v7.0 API Reference & Integration

## 1. Core Entry Point: `MetaAlphaDualAgentic`

The primary interface for integrating with the BIZRA system.

### `initialize()`

Initializes the bridge, core agents (SAT/PAT), and hardware anchors.

- **Returns**: `anyhow::Result<Self>`
- **Prerequisites**: Redis running (for Synapse), valid TPM configuration.

### `execute(request: DualAgenticRequest)`

Executes the full dual-agentic workflow (SAT → PAT → Resonance).

- **Arguments**: `DualAgenticRequest`
- **Returns**: `anyhow::Result<DualAgenticResponse>`
- **Errors**: `IhsanGateFailed`, `SecurityThreat`, `EthicsViolation`.

---

## 2. Kernel Interface: `SovereignKernel`

For low-level cluster management and direct subsystem access.

### `new(constitution_path, wasm_memory_limit, resonance_threshold)`

- **`constitution_path`**: Path to `ihsan_v1.yaml`.
- **`wasm_memory_limit`**: RAM budget for isolated execution.
- **`resonance_threshold`**: SNR pruning sensitivity (0.3 recommended).

---

## 3. Data Structures

### `DualAgenticRequest` (Input)

```rust
pub struct DualAgenticRequest {
    pub task: String,            // The primary goal
    pub context: HashMap<String, String>, // Metadata
    pub priority: Priority,      // Low/Medium/High/Critical
}
```

### `DualAgenticResponse` (Output)

```rust
pub struct DualAgenticResponse {
    pub pat_contributions: Vec<String>, // Reasoning outputs
    pub synergy_score: Fixed64,         // Collaboration quality
    pub ihsan_score: Fixed64,           // Ethical excellence
    pub latency: Duration,              // Performance metric
}
```

---

## 4. Subsystems API

### **FATE (Formal Agentic Trust Engine)**

Used for SMT proofs and constitutional escalations.

- `escalate_rejection(id, evidence)`: Triggers formal proof of violation.
- `verify_async(id, output, properties)`: Background Z3 solver.

### **Resonance Mesh**

Used for cognitive graph optimization.

- `optimize_resonance()`: Manually trigger the pruning/amplification loop.
- `monitor_root_ihsan()`: (Circuit 14) Manual check for constitutional drift.

### **WASM Sandbox**

Used for untrusted code or isolated logic.

- `run_module(wasm_bytes, env_map)`: Execute code with fuel limits.

---

## 5. Integration Best Practices

1. **Determinism**: Always provide an `input_hash` or deterministic task description.
2. **Error Handling**: Implement custom logic for `IhsanGateFailed` to provide user feedback on ethical alignment.
3. **Observability**: Monitor the `synergy_score` to identify when agent collaboration is degrading.
4. **Resilience**: Listen for `ResonanceUpdate` events via the metrics channel to detect system-wide rebirths.
