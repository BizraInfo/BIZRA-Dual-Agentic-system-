# Multi-Stage Elite Build for BIZRA Genesis Node v7.0
# Stage 1: The Forge (Rust Compilation)
FROM rust:1.85-slim-bookworm as builder

WORKDIR /usr/src/bizra-genesis

# Install build dependencies (clang/llvm needed for some crates, pkg-config for others)
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    python3-dev \
    python3-pip \
    clang \
    llvm-dev \
    libclang-dev \
    cmake \
    make \
    git \
    && rm -rf /var/lib/apt/lists/*

ENV LIBCLANG_PATH=/usr/lib/llvm-14/lib

# Copy manifests
COPY Cargo.toml Cargo.lock ./
COPY crates/finance-v1/Cargo.toml ./crates/finance-v1/Cargo.toml
COPY crates/bizra-gateway/Cargo.toml ./crates/bizra-gateway/Cargo.toml
COPY bizra-genesis-node/backend/Cargo.toml ./bizra-genesis-node/backend/Cargo.toml
COPY third_fact_demokit/verifier/Cargo.toml ./third_fact_demokit/verifier/Cargo.toml

# Create dummy main.rs to build dependencies first (caching layer)
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    echo "pub mod py;" > src/lib.rs && \
    touch src/py.rs && \
    mkdir -p crates/finance-v1/src && \
    echo "pub fn dummy() {}" > crates/finance-v1/src/lib.rs && \
    mkdir -p crates/bizra-gateway/src && \
    echo "pub fn dummy() {}" > crates/bizra-gateway/src/lib.rs && \
    mkdir -p bizra-genesis-node/backend/src && \
    echo "fn main() {}" > bizra-genesis-node/backend/src/main.rs && \
    mkdir -p bizra-genesis-node/backend/benches && \
    echo "fn main() {}" > bizra-genesis-node/backend/benches/core_benchmarks.rs && \
    mkdir -p third_fact_demokit/verifier/src && \
    echo "fn main() {}" > third_fact_demokit/verifier/src/main.rs && \
    mkdir -p benches && \
    echo "fn main() {}" > benches/sovereign_bench.rs

# Build dependencies (release mode)
RUN cargo build --release --features python

# Now copy actual source
COPY src ./src
COPY crates ./crates
COPY bizra-genesis-node ./bizra-genesis-node
COPY third_fact_demokit ./third_fact_demokit
COPY pyproject.toml ./

# Build the Python extension using maturin
# We install maturin in a venv or via pip to use it as a build tool, or use cargo-run
RUN pip3 install --break-system-packages 'maturin[patchelf]'
RUN maturin build --release --features python --out dist

# Stage 2: The Sanctum (Runtime)
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    BIZRA_KERNEL_HOST=0.0.0.0 \
    BIZRA_KERNEL_PORT=8000 \
    RUST_LOG=info

WORKDIR /app

# Install runtime dependencies (OpenSSL usually needed)
RUN apt-get update && apt-get install -y \
    libssl3 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy Python requirements
COPY requirements-kernel.txt .
RUN pip install --no-cache-dir -r requirements-kernel.txt

# Copy logic and config
COPY core /app/core
COPY tools /app/tools
COPY constitution /app/constitution
COPY model-family-genesis-v1-SEALED.yaml /app/model-family-genesis-v1-SEALED.yaml
COPY bizra_production.py /app/bizra_production.py

# Install the built Rust extension wheel
COPY --from=builder /usr/src/bizra-genesis/dist/*.whl /tmp/
RUN pip install /tmp/*.whl

# Create evidence directories
RUN mkdir -p /app/docs/evidence/receipts /app/attestations

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the FastAPI sovereign kernel server
CMD ["python", "-m", "core.main"]
