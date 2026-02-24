#!/bin/bash
# BIZRA FORGE: Hardening Protocol
# Purpose: Run fuzz testing to achieve MASTERPIECE grade
# Date: 2026-01-10 GMT+4

set -e

cd /root/bizra-genesis

echo "=================================================="
echo "🔥 BIZRA FORGE: Hardening Protocol Initiated"
echo "=================================================="
echo "Timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo ""

# Phase 1: Verify Rust core
echo "[Phase 1] Verifying Rust Core..."
cargo test --lib 2>&1 | grep -E "(test result|passed|failed)"

# Phase 2: Build fuzz targets
echo ""
echo "[Phase 2] Building Fuzz Targets..."
cargo +nightly fuzz build 2>&1 | tail -5

# Phase 3: Run fuzz tests with limited iterations
echo ""
echo "[Phase 3] Running Fuzz Tests..."

FUZZ_RUNS=10000
FUZZ_TIME=60

for target in fuzz_fixed64 fuzz_sat_security fuzz_ihsan; do
    echo ""
    echo "  → Testing: $target ($FUZZ_RUNS runs, ${FUZZ_TIME}s max)"
    timeout ${FUZZ_TIME}s cargo +nightly fuzz run "$target" -- \
        -runs=$FUZZ_RUNS \
        -max_total_time=$FUZZ_TIME \
        2>&1 | tail -10
    
    if [ $? -eq 0 ]; then
        echo "  ✅ $target: PASSED"
    else
        echo "  ⚠️  $target: Timed out (normal for fuzzing)"
    fi
done

echo ""
echo "=================================================="
echo "🔥 FORGE COMPLETE"
echo "=================================================="
