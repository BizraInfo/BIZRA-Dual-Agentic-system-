# BIZRA Genesis - Quick Start Guide

## What is BIZRA?

BIZRA is a **Decentralized Distributed AGI (DDAGI)** ecosystem with native blockchain infrastructure designed for consumer-grade sovereignty. This means you can run AI locally on your device without depending on centralized cloud providers.

## 5-Minute Setup

### Prerequisites

- Rust 1.75+ (`curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`)
- 4GB RAM minimum (8GB recommended)

### Build & Run

```bash
# Clone the repository
git clone https://github.com/bizra/bizra-genesis.git
cd bizra-genesis

# Build release version
cargo build --release

# Start the server (default port 9091)
./target/release/meta_alpha_dual_agentic server

# Verify it's running
curl http://localhost:9091/health
```

### Quick Test

```bash
# Run the test suite
cargo test --all-features

# Expected: 76+ tests passing
```

## Sovereignty Tiers

BIZRA runs on any device with graceful degradation:

| Tier | Device | Capabilities |
|------|--------|--------------|
| **T0** | Mobile/Phone | Offline-first, strict budgets, minimal tools |
| **T1** | Consumer PC | 7B-14B local models, standard features |
| **T2** | Pro Workstation | Expanded capabilities, heavier verification |
| **T3** | Pooled Compute | Federation contributions, full features |

## Core Concepts

### PAT (Personal Agentic Team)
Your 7-agent execution team that handles tasks locally:
- Strategic Visionary, Creative Innovator, Analytical Optimizer
- Implementation Specialist, Quality Guardian, User Advocate, Integration Coordinator

### SAT (System Agentic Team)
5 guardian validators ensuring safety and quality:
- Security Guardian, Ethics Validator, Performance Monitor
- Consistency Checker, Resource Optimizer

### Ihsān (Excellence)
Quality scoring system (0.0-1.0) targeting ≥0.95 for production. Every execution generates a verifiable receipt.

## API Endpoints

```bash
# Health check
GET /health

# Execute reasoning
POST /api/execute
Content-Type: application/json
{"task": "your task here", "context": {}}

# Get Ihsān metrics
GET /api/ihsan/score

# SAPE probe (quality check)
POST /api/sape/probe
Content-Type: application/json
{"content": "content to analyze"}
```

## Configuration

### Environment Variables

```bash
# Server configuration
export BIZRA_PORT=9091
export BIZRA_HOST=127.0.0.1

# Redis (optional, for persistence)
export REDIS_URL=redis://127.0.0.1:6379

# Logging
export RUST_LOG=info  # debug, trace for more detail

# Ihsān enforcement
export BIZRA_IHSAN_ENFORCE=true
```

### With Redis (Persistent Storage)

```bash
# Start Redis
docker run -d -p 6379:6379 redis:latest

# Start BIZRA with Redis
./target/release/meta_alpha_dual_agentic server --redis
```

## Dashboard (Optional)

```bash
# Start the Next.js dashboard
cd bizra-genesis-node/apps/dashboard
npm install
npm run dev

# Open http://localhost:3000
```

## Troubleshooting

### Port Already in Use
```bash
lsof -i :9091
kill -9 $(lsof -ti:9091)
```

### Build Failures
```bash
cargo clean
cargo build --release --all-features
```

### Test Failures
```bash
# Run with verbose output
cargo test --all-features -- --nocapture
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib.rs` | Core library entry point |
| `src/pat.rs` | Personal Agentic Team |
| `src/sat.rs` | System Agentic Team |
| `src/ihsan.rs` | Quality scoring |
| `src/receipts.rs` | Execution receipts |

## Philosophy

**"We don't assume. If we must, we do it with Ihsān."**

Every action is:
- **Verifiable**: Receipts are cryptographically signed
- **Deterministic**: Same input → same output (Fixed64 arithmetic)
- **Sovereign**: Runs locally, your data stays yours
- **Ethical**: SAT validators enforce safety and fairness

## Next Steps

1. Explore the [CLAUDE.md](CLAUDE.md) for detailed architecture
2. Check [BIZRA_SOT.md](BIZRA_SOT.md) for the Source of Truth
3. Run `cargo bench` for performance benchmarks
4. Join the federation: `./target/release/meta_alpha_dual_agentic federation enroll`

## Support

- Issues: https://github.com/bizra/bizra-genesis/issues
- Documentation: See `docs/` directory
- Architecture: See `.claude/specs/` for technical specifications
