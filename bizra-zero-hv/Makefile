# BIZRA-ZERO-HV Makefile
# Phase 1: Proof-of-Life
# ================================================

.PHONY: all build run clean fmt clippy help install test-boot

# Configuration
CARGO = cargo
QEMU = qemu-system-x86_64
TARGET = x86_64-unknown-none

# Build targets
all: build

build:
	@echo "==> Building BIZRA-ZERO-HV..."
	$(CARGO) build --target $(TARGET)

build-release:
	@echo "==> Building BIZRA-ZERO-HV (release)..."
	$(CARGO) build --release --target $(TARGET)

# Run in QEMU (using bootimage runner)
run: build
	@echo "==> Starting QEMU with BIZRA-ZERO-HV..."
	$(CARGO) run

# Debug with GDB
debug: build
	@echo "==> Starting QEMU with GDB stub (port 1234)..."
	$(QEMU) \
		-drive format=raw,file=target/$(TARGET)/debug/bootimage-bizra-zero-hv.bin \
		-serial stdio \
		-display none \
		-m 512M \
		-s -S \
		-gdb tcp::1234

# Format code
fmt:
	@echo "==> Formatting code..."
	$(CARGO) fmt --all 2>/dev/null || true

# Clean build artifacts
clean:
	@echo "==> Cleaning build artifacts..."
	$(CARGO) clean

# Install prerequisites
install:
	@echo "==> Installing prerequisites..."
	rustup toolchain install nightly-2025-01-01
	rustup component add --toolchain nightly-2025-01-01 rust-src llvm-tools-preview
	cargo install bootimage

# Verification test
test-boot:
	@echo "==> Testing boot sequence..."
	timeout 5s $(CARGO) run 2>&1 | head -30

# Help
help:
	@echo "BIZRA-ZERO-HV Build System:"
	@echo "  make install    - Install prerequisites"
	@echo "  make build      - Build debug version"
	@echo "  make run        - Run in QEMU"
	@echo "  make debug      - Debug with GDB (port 1234)"
	@echo "  make fmt        - Format code"
	@echo "  make clean      - Clean build"
	@echo "  make test-boot  - Quick boot test"
