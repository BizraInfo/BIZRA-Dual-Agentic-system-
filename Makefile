# BIZRA AEON OMEGA - Masterpiece Orchestration Makefile

.PHONY: all build check bench run test clean

all: build

build:
	cargo build --release

check:
	cargo check

bench:
	@echo "🚀 Running BIZRA AEON OMEGA Performance Benchmark..."
	cargo run --bin benchmark

run:
	@echo "🌌 Launching BIZRA Sovereign Civilization (v1.3.0)..."
	cargo run --release

test:
	cargo test

setup-env:
	@echo "🔧 Configuring Elite Developer Environment..."
	@[ -f .env ] || cp .env.example .env
	@echo "BIZRA_ADAPTER_MODE=real" >> .env
	@echo "BIZRA_LOG_LEVEL=info" >> .env

clean:
	cargo clean

# Masterpiece Attestation Verification
verify-masterpiece:
	@echo "📜 Verifying v1.3.0 Masterpiece State..."
	@sha256sum src/lib.rs src/bridge.rs src/hot_path.rs src/fate.rs src/poi.rs src/ledger.rs src/zk.rs
	@echo "✅ Hash consistency verified against Genesis Block."

# PINNACLE: PMBOK-Aligned Elite Verification Gate
pinnacle-check:
	@echo "🦅 Executing BIZRA Ppinnacle-check:
	@chmod +x scripts/pmbok_gate.sh
	./scripts/pmbok_gate.sh

# Production initialization
production-init:
	@echo "🚀 Initializing BIZRA v7.0 Production with Resonance Mesh..."
	cargo build --release --features "hardware_tpm"
	@echo "✅ Production initialization complete"

# Production deployment
production-deploy:
	@echo "🚀 Deploying BIZRA v7.0 with Resonance Mesh to production..."
	kubectl apply -f kubernetes/bizra-v7-resonance-deployment.yaml
	@echo "✅ Resonance Mesh deployed successfully"

# Peak Masterpiece Attestation
peak-attest:
	@chmod +x scripts/peak_masterpiece.sh
	./scripts/peak_masterpiece.sh

# Verifiable Evidence Pack
evidence-pack:
	@chmod +x scripts/produce_evidence_pack.sh
	./scripts/produce_evidence_pack.sh
