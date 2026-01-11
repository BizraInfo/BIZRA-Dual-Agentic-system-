# BIZRA — The Third Fact (DemoKit v1.0)

**Truth anchored to proof.**

### Quickstart
1. Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
2. Build Verifier: `cd verifier && cargo build --release && cd ..`
3. Run Demo: `./scripts/run_demo.sh`
4. Verify: `./scripts/verify_all.sh`

### Key Components
- **Receipts**: RFC 8785 JCS canonical JSON.
- **Evidence**: SHA256 hashed artifact manifests.
- **Verifier**: Rust-based CLI for cryptographic audits.
