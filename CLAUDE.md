# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

# Run server (default port 9091)
cargo run --release

# With Redis persistence
cargo run --release -- server --redis

# Dashboard (separate terminal)
cd bizra-genesis-node/apps/dashboard && npm run dev

# COVENANT Pipeline Demo (Week 1 Foundation)
cargo run --bin covenant_demo
# Shows SNR measurement in action
```

## Week 1 Foundation: COVENANT Infrastructure

The **COVENANT** is BIZRA's constitutional root document defining all system principles. Week 1 deliverables establish the measurement infrastructure that makes "truth pay rent":

**Key Documents**:

- [COVENANT.md](COVENANT.md) - Root constitutional document (immutable)
- [WEEK1_FOUNDATION_COMPLETE.md](WEEK1_FOUNDATION_COMPLETE.md) - Implementation summary

**Core Modules**:

- `src/thought.rs` - Canonical thought object (8-stage lifecycle)
- `src/snr_monitor.rs` - SNR autonomous measurement engine
- `src/thought_executor.rs` - 8-stage pipeline orchestrator
- `src/bin/covenant_demo.rs` - Live demonstration of complete pipeline

**SNR Measurement** (Signal-to-Noise Ratio):

```
SNR = (Verifiably Correct Actions) / (Total Compute Cycles)
Target: SNR ≥ 0.95 (COVENANT Article II)
```

Every thought is now measured - no unmeasured execution allowed.

## Project Overview

**BIZRA** is a **DDAGI** (Decentralized, Distributed AGI) ecosystem with native blockchain infrastructure.

**Key Philosophy**: "We don't assume. If we must, we do it with Ihsān." (THE LAW)

### Core System

- **PAT (Personal Agentic Team)**: 7 execution agents in `src/pat.rs`
- **SAT (System Agentic Team)**: 6 validator agents in `src/sat.rs` - **weighted consensus (70% threshold, any VETO blocks)**
- **FATE Engine**: Z3-backed formal verification in `src/fate/` - impossible actions can't execute
- **Third Fact Receipts**: Cryptographically signed execution logs in `docs/evidence/receipts/`
- **Ihsān Score**: Quality metric (0.0-1.0), target ≥ 0.95 for production

### Binary & CLI

After building, the binary is at `target/release/meta_alpha_dual_agentic`:

```bash
./target/release/meta_alpha_dual_agentic --help
./target/release/meta_alpha_dual_agentic server --port 8080 --redis
./target/release/meta_alpha_dual_agentic federation enroll --node-id node1 --tier bronze
./target/release/meta_alpha_dual_agentic chain status
```

## Architecture

```
bizra-genesis/
├── src/                      # Main Rust library
│   ├── lib.rs               # SovereignKernel, MetaAlphaDualAgentic
│   ├── pat.rs               # PAT 7 agents
│   ├── sat.rs               # SAT 6 validators (weighted consensus)
│   ├── fate/                # Z3 formal verification
│   ├── sape/                # Pattern elevation engine
│   ├── bridge.rs            # BridgeCoordinator (PAT↔SAT)
│   ├── ihsan.rs             # Quality scoring
│   ├── snr.rs               # Signal-to-noise ratio
│   ├── resonance.rs         # Self-optimizing mesh
│   ├── wasm/                # WASM sandbox isolation
│   ├── mcp.rs               # Model Context Protocol
│   ├── a2a.rs               # Agent-to-Agent protocol
│   ├── reasoning/           # CoT, ToT, GoT, ReAct, Reflexion modes
│   └── ffi/panic_airlock.rs # FFI safety wrapper
├── crates/                   # Workspace members
│   ├── bizra-jcs/           # JSON Canonical Serialization
│   ├── bizra-gateway/       # Gateway + bifurcator
│   └── policy_engine/       # Policy enforcement
├── bizra-genesis-node/
│   ├── backend/             # Rust API server
│   └── apps/dashboard/      # Next.js frontend
├── tests/                   # Integration tests
└── docs/evidence/receipts/  # Execution receipts (EXEC-*.json, REJ-*.json)
```

### Key Data Flows

1. **Request → BridgeCoordinator** (`src/bridge.rs`) → PAT execution → SAT validation → Receipt
2. **FATE verification** runs before execution - Z3 checks constraints
3. **Ihsān gate** enforces quality threshold (rejects below 0.95)
4. **Receipts** use JCS canonicalization for deterministic hashing

## Hard Gates (Non-Negotiable)

### 1. Determinism
No floats in receipt hashes or consensus logic. Use integer/fixed-point or canonicalize to string before hashing. JCS enforced.

### 2. FFI Safety
- Every `#[pyfunction]` must use `panic_airlock()` wrapper (`src/ffi/panic_airlock.rs`)
- Single Tokio runtime via OnceCell, never per-call
- `unwrap/expect` banned in critical paths

### 3. Single-Source Scoring
Python must call Rust for Ihsān scoring - no dual implementations. Rust validates inputs, returns structured reasons.

### 4. SAT Consensus
**Claude Code SAT**: All 5 agents must approve (weighted consensus with VETO power).
**Runtime SAT**: 6 validators with 70% weighted threshold (6.37 of 9.1 total weight).
Any VETO from Security, Formal, or Ethics agents blocks immediately. No bypassing.

### 5. Immutability Boundaries
- **IMMUTABLE**: Constitution hash, scoring rules, receipt schema
- **UPGRADEABLE**: Executors, sandboxes, model runtimes, UI

## Testing

```bash
# All tests (CI requires 76+)
cargo test --all-features

# Specific test files
cargo test --test elite_integration_test
cargo test --test sape_integration_tests
cargo test --test beg_gates
cargo test --test security_invariants

# Single test with output
cargo test test_name --all-features -- --nocapture

# Benchmarks
cargo bench --bench sovereign_bench
```

Performance targets: P50 < 30ms, P99 < 100ms, Throughput 1000+ req/s

## Environment Variables

**Core:**
- `REDIS_URL`: Redis connection (default: `redis://127.0.0.1:6379`)
- `RUST_LOG`: Log level (error/warn/info/debug/trace)

**External AI (optional):**
- `OLLAMA_URL`, `OLLAMA_MODEL`: Local Ollama
- `OPENAI_API_KEY`, `OPENAI_MODEL`: OpenAI
- `GOOGLE_API_KEY`, `GEMINI_MODEL`: Gemini

**Security:**
- `BIZRA_ALLOW_SOFTWARE_TPM`: Allow software TPM fallback (dev only)
- `BIZRA_IHSAN_ENFORCE`: Enforce Ihsān threshold (default: true)

## Python FFI (PyO3/Maturin)

```bash
pip install maturin
maturin develop --features python
# Or: maturin build --release --features python
```

## Makefile

```bash
make help          # Available commands
make test          # Run all tests
make build         # Build production
make clean         # Clean artifacts
make validate-apex # Generate evidence pack
```

## SAT Agents (Auto-Invokable)

Located in `.claude/agents/` - Claude invokes automatically based on context:

| Agent | Weight | VETO | Purpose |
|-------|--------|------|---------|
| `security-sentinel.md` | 2.5 | Yes | Blocklist detection, injection prevention |
| `formal-validator.md` | 1.8 | Yes | Z3 consistency, determinism enforcement |
| `ethics-guardian.md` | 2.0 | Yes | Ihsān enforcement, harm prevention |
| `resource-guardian.md` | 1.2 | No | Budget/performance constraints |
| `context-validator.md` | 1.0 | No | System coherence, interface validation |

**Note**: The runtime SAT in `src/sat.rs` has 6 validators (adds `performance_monitor` and `consistency_checker`).
Total weight: 9.1, consensus threshold: 70% (6.37 weight units).

## Hooks (Automated Gates)

Located in `.claude/hooks.json` with scripts in `.claude/hooks/`:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `security-gate.sh` | PreToolUse:Bash | SAT Security Sentinel - blocks dangerous patterns |
| `determinism-check.sh` | PreToolUse:Write/Edit | Warns on floats in receipt/consensus paths |
| `post-edit.sh` | PostToolUse:Write/Edit | Auto-format Rust/TS files |
| Stop (prompt-based) | Stop | LLM validates SAT 5-validator consensus |
| SessionStart | Session | Injects THE LAW + targets into context |

## Custom Slash Commands

Located in `.claude/commands/`:

| Command | Purpose |
|---------|---------|
| `/peak` | Full Peak Masterpiece execution protocol |
| `/pat` | 7-agent multi-perspective analysis |
| `/sat` | 5-validator consensus check |
| `/ihsan` | 8-dimensional excellence verification |
| `/snr` | Signal-to-noise optimization |
| `/got` | Graph of Thoughts reasoning |
| `/giants` | Interdisciplinary wisdom grounding |

Use `/peak` for: architecture decisions, security-critical code, core changes to `src/lib.rs`, `src/fate/`, `src/sape/`, receipt/consensus logic.

## CI/CD

GitHub Actions (`.github/workflows/apex_ci.yml`):
- **Targets**: Ihsān ≥ 0.95, SNR ≥ 0.98
- **Gate**: 76+ Rust tests must pass
- **Branches**: `main-v7`, `main`, `feature/genesis-v7.1-omega`

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
lsof -i :9091
cargo run --release -- server --port 8080
```

## Arabic/Islamic Terminology

- **Ihsān (إحسان)**: Excellence, perfection - quality metric
- **Amānah**: Trust, integrity
- **Adl**: Justice, balance
