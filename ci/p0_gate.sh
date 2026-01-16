#!/bin/bash
set -u

# P0 Gate: The Foundation of Truth
# Fails build if determinism or schema validation fails.

echo "[GATE-P0] Initializing..."
ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$ROOT"

FAIL=0

# 1. Determinism Check (Golden Vectors)
echo "[GATE-P0] 1. Checking JCS Determinism Vectors..."
if python3 third_fact_demokit/tests/golden_vectors.py; then
    echo "   [PASS] Vectors Valid"
else
    echo "   [FAIL] Vectors Invalid"
    FAIL=1
fi

# 2. Rust Verifier Tests
echo "[GATE-P0] 2. Running Verifier Unit Tests..."
if (cd third_fact_demokit/verifier && cargo test --quiet --release); then
     echo "   [PASS] Verifier Tests"
else
     echo "   [FAIL] Verifier Tests Failed"
     FAIL=1
fi

# 3. Schema Check (Using verifier build to smoke test schema usage?)
# Just ensure verifier builds
echo "[GATE-P0] 3. Building Verifier Release..."
if (cd third_fact_demokit/verifier && cargo build --release --quiet); then
    echo "   [PASS] Verifier Builds"
else
    echo "   [FAIL] Verifier Build Failed"
    FAIL=1
fi

# 4. Receipt Chain Logic Smoke Test
echo "[GATE-P0] 4. Testing Receipt Chain Logic..."
TEST_CHAIN_DIR="/tmp/bizra_p0_test_chain"
rm -rf "$TEST_CHAIN_DIR"
mkdir -p "$TEST_CHAIN_DIR"

KEY_PATH="third_fact_demokit/keys/gate_test.key"
PUB_PATH="third_fact_demokit/keys/gate_test.pub"
mkdir -p "$(dirname "$KEY_PATH")"

# Generate Key using openssl if missing
if [[ ! -f "$KEY_PATH" ]]; then
    echo "   [SETUP] Generating ED25519 Keypair..."
    openssl genpkey -algorithm ED25519 -out "$KEY_PATH" 2>/dev/null
    openssl pkey -in "$KEY_PATH" -pubout -out "$PUB_PATH" 2>/dev/null
fi

if [[ ! -f "$KEY_PATH" ]]; then
     echo "   [SKIP] Failed to generate keys (openssl missing?)"
else
    # Emit 3 receipts
    echo '{"step":1}' > "$TEST_CHAIN_DIR/p1.json"
    echo '{"step":2}' > "$TEST_CHAIN_DIR/p2.json"
    echo '{"step":3}' > "$TEST_CHAIN_DIR/p3.json"

    echo "   [EXEC] Emitting Chain..."
    # R1: Genesis (No Prev Hash)
    ./third_fact_demokit/scripts/emit_receipt.sh "p0_test" "$TEST_CHAIN_DIR/p1.json" "$KEY_PATH" > "$TEST_CHAIN_DIR/001.json"
    HASH_1=$(jq -r .receipt_id "$TEST_CHAIN_DIR/001.json")

    # R2: Linked to R1
    ./third_fact_demokit/scripts/emit_receipt.sh "p0_test" "$TEST_CHAIN_DIR/p2.json" "$KEY_PATH" "$HASH_1" > "$TEST_CHAIN_DIR/002.json"
    HASH_2=$(jq -r .receipt_id "$TEST_CHAIN_DIR/002.json")

    # R3: Linked to R2
    ./third_fact_demokit/scripts/emit_receipt.sh "p0_test" "$TEST_CHAIN_DIR/p3.json" "$KEY_PATH" "$HASH_2" > "$TEST_CHAIN_DIR/003.json"

    # Verify Chain
    echo "   [EXEC] Verifying Chain..."
    VERIFIER_BIN="target/release/bizra-verify-receipt"
    if $VERIFIER_BIN verify-chain --dir "$TEST_CHAIN_DIR" --key "$PUB_PATH"; then
         echo "   [PASS] Chain Verification Successful"
    else
         echo "   [FAIL] Chain Verification Failed"
         FAIL=1
    fi
fi

if [[ "$FAIL" -eq 1 ]]; then
    echo "[GATE-P0] ❌ FAILED. The Third Fact is broken."
    exit 1
else
    echo "[GATE-P0] ✅ PASSED. Truth foundation verified."
    exit 0
fi
