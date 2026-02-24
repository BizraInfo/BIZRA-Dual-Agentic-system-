# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Production Deployment

| Service | Port | Description |
|---------|------|-------------|
| **Dual Agentic** | 9091 | Rust backend (PAT/SAT orchestration) |
| **MCP Bridge** | 8443 | HTTPS knowledge retrieval (Data Lake access) |
| **LM Studio** | 1234 | Windows host model inference (`192.168.56.1`) |

### Cross-Platform (WSL ↔ Windows)

```bash
# Windows Data Lake accessed via WSL mount
DATA_LAKE_PATH="/mnt/c/BIZRA-DATA-LAKE"   # 56K+ nodes, 88K+ edges
OLLAMA_URL="http://192.168.56.1:1234"      # LM Studio on Windows
OLLAMA_API_TYPE="lmstudio"
```

## Quick Reference

```bash
# Build
cargo build --release --all-features

# Test (CI requires 76+ tests pass)
cargo test --all-features

# Run single test
cargo test test_name_here --all-features -- --nocapture

# Lint
cargo fmt && cargo clippy --all-features

# Run Dual Agentic server (port 9091)
cargo run --release

# Run MCP Bridge (port 8443)
python3 scripts/data_lake_mcp_bridge.py

# With Redis persistence
cargo run --release -- server --redis

# Dashboard (separate terminal)
cd bizra-genesis-node/apps/dashboard && npm run dev
```

## Project Overview

**BIZRA** is a **DDAGI** (Decentralized, Distributed AGI) ecosystem with native blockchain infrastructure.

**Key Philosophy**: "We don't assume. If we must, we do it with Ihsān." (THE LAW)

### Core System

- **PAT (Personal Agentic Team)**: 7 execution agents in `src/pat.rs`
- **SAT (System Agentic Team)**: 6 validator agents in `src/sat.rs` - **weighted consensus (70% threshold, any VETO blocks)**
- **FATE Engine**: Z3-backed formal verification in `src/fate.rs` - impossible actions can't execute
- **SAPE Engine**: Pattern elevation in `src/sape/` - self-improving scoring
- **Third Fact Receipts**: Cryptographically signed execution logs in `docs/evidence/receipts/`
- **Ihsān Score**: Quality metric (0.0-1.0), target ≥ 0.95 for production
- **SNR (Signal-to-Noise Ratio)**: `(Verifiably Correct Actions) / (Total Compute Cycles)`, target ≥ 0.95

### COVENANT Infrastructure

The **COVENANT** (`COVENANT.md`) is BIZRA's immutable constitutional root document. Every thought follows the 8-stage lifecycle in `src/thought.rs` and is measured by `src/snr_monitor.rs`.

### Binary & CLI

After building, the binary is at `target/release/meta_alpha_dual_agentic`:

```bash
./target/release/meta_alpha_dual_agentic --help
./target/release/meta_alpha_dual_agentic server --port 8080 --redis
./target/release/meta_alpha_dual_agentic federation enroll --node-id node1 --tier bronze
./target/release/meta_alpha_dual_agentic chain status
```

## Architecture

### Key Data Flows

1. **Request → BridgeCoordinator** (`src/bridge.rs`) → PAT execution → SAT validation → Receipt
2. **FATE verification** runs before execution - Z3 checks constraints
3. **Ihsān gate** enforces quality threshold (rejects below 0.95)
4. **Receipts** use JCS canonicalization (`crates/bizra-jcs/`) for deterministic hashing

### Critical Modules

| Module | Purpose |
|--------|---------|
| `src/lib.rs` | SovereignKernel, MetaAlphaDualAgentic entry point |
| `src/pat.rs` | PAT 7 agents (Strategic, Creative, Analytical, Implementation, Quality, User Advocate, Coordination) |
| `src/sat.rs` | SAT 6 validators (Security, Ethics, Formal, Performance, Consistency, Resources) |
| `src/bridge.rs` | BridgeCoordinator (PAT↔SAT communication) |
| `src/fate.rs` | Z3-backed formal verification |
| `src/sape/` | Self-Adaptive Pattern Elevation engine |
| `src/ihsan.rs` | 8-dimensional quality scoring |
| `src/receipts.rs` | Third Fact receipt generation |
| `src/hookchain.rs` | Security enforcement chain |
| `src/thought.rs` | Canonical thought object (8-stage lifecycle) |
| `src/thought_executor.rs` | 8-stage pipeline orchestrator |
| `src/snr_monitor.rs` | SNR autonomous measurement engine |
| `src/resonance.rs` | Self-optimizing mesh |
| `src/wasm.rs` | WASM sandbox isolation |
| `src/mcp.rs` | Model Context Protocol |
| `src/a2a.rs` | Agent-to-Agent protocol |
| `src/reasoning/` | CoT, ToT, GoT, ReAct, Reflexion modes |
| `src/ffi/` | FFI safety with `panic_airlock()` wrapper |

### Workspace Crates

| Crate | Purpose |
|-------|---------|
| `crates/bizra-jcs` | JSON Canonical Serialization (deterministic hashing) |
| `crates/bizra-gateway` | Gateway + bifurcator |
| `crates/policy_engine` | Policy enforcement |
| `crates/bizra-synapse` | Neural pathway abstractions |
| `crates/bizra-sdk-core` | SDK core functionality |
| `bizra-genesis-node/backend` | Rust API server |

## Hard Gates (Non-Negotiable)

### 1. Determinism
No floats in receipt hashes or consensus logic. Use integer/fixed-point (`src/fixed.rs`) or canonicalize to string before hashing. JCS enforced.

### 2. FFI Safety
- Every `#[pyfunction]` must use `panic_airlock()` wrapper (`src/ffi/panic_airlock.rs`)
- Single Tokio runtime via OnceCell, never per-call
- `unwrap/expect` banned in critical paths (receipts, hookchain, sape, fate, omega)

### 3. Single-Source Scoring
Python must call Rust for Ihsān scoring - no dual implementations. Rust validates inputs, returns structured reasons.

### 4. SAT Consensus
- **Claude Code SAT**: 5 agents in `.claude/agents/` with weighted consensus and VETO power
- **Runtime SAT**: 6 validators in `src/sat.rs` with 70% threshold (6.37 of 9.1 total weight)
- Security, Formal, and Ethics validators have absolute VETO - no bypassing

### 5. Immutability Boundaries
- **IMMUTABLE**: Constitution hash, scoring rules, receipt schema, genesis manifest
- **UPGRADEABLE**: Executors, sandboxes, model runtimes, UI

## Testing

```bash
# All tests (CI requires 76+)
cargo test --all-features

# Key integration test suites
cargo test --test elite_integration_test    # Full system integration
cargo test --test sape_integration_tests    # SAPE scoring engine
cargo test --test beg_gates                 # BEG (Bizra Excellence Gate)
cargo test --test security_invariants       # Security properties
cargo test --test formal_verification_tests # Z3 formal proofs

# Single test with output
cargo test test_name --all-features -- --nocapture

# Benchmarks
cargo bench --bench sovereign_bench
```

Performance targets: P50 < 30ms, P99 < 100ms, Throughput 1000+ req/s

## Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `REDIS_URL` | Redis connection | `redis://127.0.0.1:6379` |
| `RUST_LOG` | Log level (error/warn/info/debug/trace) | `info` |
| `OLLAMA_URL` | LM Studio/Ollama endpoint | `http://192.168.56.1:1234` |
| `OLLAMA_MODEL` | Model name | `qwen2.5-0.5b-instruct` |
| `OLLAMA_API_TYPE` | API type (`lmstudio` or `ollama`) | `lmstudio` |
| `DATA_LAKE_PATH` | Windows Data Lake mount path | `/mnt/c/BIZRA-DATA-LAKE` |
| `BIZRA_MAIN_PATH` | Main codebase on Windows | `/mnt/c/BIZRA-Dual-Agentic-system--main` |
| `OPENAI_API_KEY` | OpenAI API key | - |
| `BIZRA_ALLOW_SOFTWARE_TPM` | Allow software TPM fallback (dev only) | `false` |
| `BIZRA_IHSAN_ENFORCE` | Enforce Ihsān threshold | `true` |

## Claude Code Integration

### SAT Agents (Auto-Invokable)

Located in `.claude/agents/` - invoked automatically based on context:

| Agent | Weight | VETO | Purpose |
|-------|--------|------|---------|
| `security-sentinel.md` | 2.5 | Yes | Blocklist detection, injection prevention |
| `formal-validator.md` | 1.8 | Yes | Z3 consistency, determinism enforcement |
| `ethics-guardian.md` | 2.0 | Yes | Ihsān enforcement, harm prevention |
| `resource-guardian.md` | 1.2 | No | Budget/performance constraints |
| `context-validator.md` | 1.0 | No | System coherence, interface validation |

### Hooks (Automated Gates)

Located in `.claude/hooks.json`:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `security-gate.sh` | PreToolUse:Bash | Blocks dangerous command patterns |
| `determinism-check.sh` | PreToolUse:Write/Edit | Warns on floats in receipt/consensus paths |
| `post-edit.sh` | PostToolUse:Write/Edit | Auto-format Rust/TS files |

### Custom Slash Commands

| Command | Purpose |
|---------|---------|
| `/peak` | Full Peak Masterpiece execution protocol |
| `/pat` | 7-agent multi-perspective analysis |
| `/sat` | 5-validator consensus check |
| `/ihsan` | 8-dimensional excellence verification |
| `/snr` | Signal-to-noise optimization |
| `/got` | Graph of Thoughts reasoning |
| `/giants` | Interdisciplinary wisdom grounding |

Use `/peak` for: architecture decisions, security-critical code, core changes to `src/lib.rs`, `src/fate.rs`, `src/sape/`, receipt/consensus logic.

## Makefile

```bash
make help          # Available commands
make test          # Run all tests
make build         # Build production
make clean         # Clean artifacts
make validate-apex # Generate evidence pack
```

## CI/CD

GitHub Actions (`.github/workflows/apex_ci.yml`):
- **Targets**: Ihsān ≥ 0.95, SNR ≥ 0.98
- **Gate**: 76+ Rust tests must pass
- **Feature flag**: Use `--features all-safe` for CI (no hardware TPM)

## Troubleshooting

**Build fails (Z3/linker):**
```bash
sudo apt-get install build-essential cmake pkg-config libssl-dev
cargo clean && cargo build --release --all-features
```

**Redis fallback:**
System auto-falls back to in-memory if Redis unavailable. Check with `redis-cli ping`.

**Port 9091 in use:**
```bash
fuser -k 9091/tcp
cargo run --release -- server --port 9091
```

**Port 8443 in use (MCP Bridge):**
```bash
fuser -k 8443/tcp
python3 scripts/data_lake_mcp_bridge.py
```

## Arabic/Islamic Terminology

- **Ihsān (إحسان)**: Excellence, perfection - quality metric
- **Amānah**: Trust, integrity
- **Adl**: Justice, balance
- **Hikmah**: Wisdom
- **Bayān**: Clarity, transparency

## MCP Bridge (Data Lake Knowledge Access)

The MCP Bridge (`scripts/data_lake_mcp_bridge.py`) provides HTTPS access to the Windows Data Lake hypergraph.

**Features:**
- 61,827+ indexed nodes (Windows + local sources)
- 88,649+ relationship edges
- 688+ verified assertions
- TLS/HTTPS on port 8443

**Usage:**
```bash
# Start MCP Bridge
python3 scripts/data_lake_mcp_bridge.py

# Query knowledge
curl -k -X POST https://127.0.0.1:8443/mcp/tools \
  -H "Content-Type: application/json" \
  -d '{"name": "knowledge_retrieve", "arguments": {"query": "your query"}}'

# Check health
curl -k https://127.0.0.1:8443/health
```

**Data Sources (loaded at startup):**
- `/mnt/c/BIZRA-DATA-LAKE/graph_nodes.json` - Windows Data Lake nodes
- `/mnt/c/BIZRA-DATA-LAKE/graph_edges.json` - Relationship edges
- `/mnt/c/BIZRA-DATA-LAKE/gold_ledger.jsonl` - Verified assertions
- `/mnt/c/BIZRA-DATA-LAKE/gold_gems/*.json` - Curated knowledge gems
