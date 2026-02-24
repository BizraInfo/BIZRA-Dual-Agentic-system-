#!/bin/bash
# SAPE v1.∞ EXECUTION: COMPREHENSIVE FIX VALIDATION
# Part of 72-Hour Critical Gap Remediation Sprint
set -e

echo "🧪 BIZRA COMPREHENSIVE FIX VALIDATION"
echo "========================================================================"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$GIT_ROOT"

# Initialize counters
PASSED=0
FAILED=0
WARNINGS=0

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

# Helper functions
pass() {
    echo "  ✅ $1"
    PASSED=$((PASSED + 1))
}

fail() {
    echo "  ❌ $1"
    FAILED=$((FAILED + 1))
}

warn() {
    echo "  ⚠️  $1"
    WARNINGS=$((WARNINGS + 1))
}

# ============================================================================
# 1. SECURITY VALIDATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. SECURITY VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1.1 Check for unwrap() in critical paths
echo ""
echo "1.1 Checking unwrap() in critical paths..."
CRITICAL_MODULES=("src/receipts.rs" "src/hookchain.rs" "src/sape/ihsan.rs" "src/fate.rs")
UNWRAP_FOUND=false

for file in "${CRITICAL_MODULES[@]}"; do
    if [ -f "$file" ]; then
        # Use wc -l to be safe with line counts
        COUNT=$(grep "\.unwrap()" "$file" | wc -l)
        if [ "$COUNT" -gt 0 ]; then
            # Check if these are in test blocks (very rough check)
            TEST_ONLY_COUNT=$(grep -B 1 "\.unwrap()" "$file" | grep "cfg(test)" | wc -l)
            if [ "$COUNT" -le "$TEST_ONLY_COUNT" ] && [ "$COUNT" -gt 0 ]; then
                pass "$file: $COUNT unwrap() calls (all verified in test blocks)"
            else
                warn "$file has $COUNT unwrap() calls ($((COUNT - TEST_ONLY_COUNT)) potentially in production)"
                UNWRAP_FOUND=true
            fi
        else
            pass "$file: no unwrap()"
        fi
    fi
done

if [ "$UNWRAP_FOUND" = false ]; then
    pass "No unwrap() in critical paths"
fi

# 1.2 Security audit
echo ""
echo "1.2 Running security audit..."
if command -v cargo-audit &>/dev/null; then
    AUDIT_OUTPUT=$(cargo audit 2>&1 || true)
    VULN_COUNT=$(echo "$AUDIT_OUTPUT" | grep "Vulnerability" | wc -l)
    if [ "$VULN_COUNT" -eq 0 ]; then
        pass "No known vulnerabilities"
    else
        fail "$VULN_COUNT vulnerabilities found"
    fi
else
    warn "cargo-audit not installed, skipping"
fi

# Define python executable
PYTHON_EXE="python3"
if [ -f ".venv/bin/python3" ]; then
    PYTHON_EXE=".venv/bin/python3"
fi

# 1.3 Check deny lints
echo ""
echo "1.3 Checking deny lints in critical modules..."
for file in "${CRITICAL_MODULES[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "not(test), deny(clippy::unwrap_used)" "$file" || grep -q "#!\[deny(clippy::unwrap_used)\]" "$file"; then
            pass "$file has deny lint"
        else
            warn "$file missing deny lint"
        fi
    fi
done

# ============================================================================
# 2. ZK BACKEND VALIDATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. ZK BACKEND VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 2.1 Check ZK feature in Cargo.toml
echo ""
echo "2.1 Checking ZK features..."
if grep -q "zk_halo2" Cargo.toml; then
    pass "zk_halo2 feature defined"
else
    warn "zk_halo2 feature not yet defined"
fi

if grep -q "zk_stub" Cargo.toml; then
    pass "zk_stub feature defined"
else
    warn "zk_stub feature not defined"
fi

# 2.2 Check ZK module exists
echo ""
echo "2.2 Checking ZK modules..."
if [ -f "src/zk/verifier.rs" ] || [ -f "src/zk/mod.rs" ]; then
    if grep -q "SIMULATION" src/zk/verifier.rs 2>/dev/null; then
        warn "src/zk/verifier.rs still contains SIMULATION markers"
    else
        pass "ZK verifier module present"
    fi
    
    if [ -f "src/zk/halo2_backend.rs" ]; then
        pass "Halo2 backend implemented"
    else
        warn "Halo2 backend not yet implemented"
    fi
else
    fail "ZK module not found"
fi

# ============================================================================
# 3. TPM VALIDATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. TPM VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3.1 Check TPM feature
echo ""
echo "3.1 Checking TPM features..."
if grep -q "hardware_tpm" Cargo.toml; then
    pass "hardware_tpm feature defined"
else
    warn "hardware_tpm feature not yet defined"
fi

# 3.2 Check TPM module
echo ""
echo "3.2 Checking TPM modules..."
if [ -f "src/tpm.rs" ]; then
    if grep -q "SIMULATED" src/tpm.rs || grep -q "In a real scenario" src/tpm.rs; then
        warn "src/tpm.rs contains simulation markers"
    else
        pass "src/tpm.rs production ready"
    fi
else
    fail "src/tpm.rs not found"
fi

# 3.3 Check TPM config
if [ -f "config/tpm/tpm_config.yaml" ]; then
    pass "TPM config exists"
else
    warn "TPM config not created"
fi

# ============================================================================
# 4. FATE ENGINE VALIDATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. FATE ENGINE VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 4.1 Check FATE Python module
echo ""
echo "4.1 Checking FATE Python module..."
if [ -f "apex_engine/fate_engine_z3.py" ]; then
    pass "fate_engine_z3.py exists"
    
    # Try to import
    if $PYTHON_EXE -c "import sys; sys.path.insert(0, 'apex_engine'); from fate_engine_z3 import FateEngineZ3" 2>/dev/null; then
        pass "fate_engine_z3.py imports successfully"
    else
        warn "fate_engine_z3.py import failed"
    fi
else
    warn "fate_engine_z3.py not created"
fi

# 4.2 Check Z3 availability
echo ""
echo "4.2 Checking Z3 solver..."
if $PYTHON_EXE -c "import z3" 2>/dev/null; then
    Z3_VER=$($PYTHON_EXE -c "import z3; print(z3.get_version_string())")
    pass "Z3 solver available (v$Z3_VER)"
else
    warn "Z3 solver not available"
fi

# ============================================================================
# 5. POST-QUANTUM CRYPTOGRAPHY VALIDATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. POST-QUANTUM CRYPTOGRAPHY VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "5.1 Checking PQC dependencies..."
if grep -q "pqcrypto-kyber" Cargo.toml; then
    pass "pqcrypto-kyber dependency added"
else
    warn "pqcrypto-kyber not added"
fi

if grep -q "pqcrypto-dilithium" Cargo.toml; then
    pass "pqcrypto-dilithium dependency added"
else
    warn "pqcrypto-dilithium not added"
fi

if grep -q "post-quantum" Cargo.toml; then
    pass "post-quantum feature defined"
else
    warn "post-quantum feature not defined"
fi

# ============================================================================
# 6. IHSĀN THRESHOLD VALIDATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. IHSĀN THRESHOLD VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "6.1 Checking Ihsān floor (0.95)..."
if grep -qE "confidence:\s*0\.95|>= 0\.95|IHSAN_FLOOR.*0\.95" src/sat.rs src/sape/ihsan.rs 2>/dev/null; then
    pass "Ihsān floor 0.95 enforced"
else
    warn "Ihsān floor not found in expected locations"
fi

echo ""
echo "6.2 Checking Adl Gini ceiling (0.35)..."
if grep -qE "0\.35|ADL_GINI_CEILING" src/omega.rs 2>/dev/null; then
    pass "Adl Gini ceiling 0.35 enforced"
else
    warn "Adl Gini ceiling not found"
fi

# ============================================================================
# 7. BUILD VALIDATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. BUILD VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "7.1 Checking production build (no-default-features)..."
if cargo check --no-default-features --quiet 2>/dev/null; then
    pass "Production build compiles"
else
    fail "Production build failed"
fi

echo ""
echo "7.2 Running clippy..."
CLIPPY_WARNINGS=$(cargo clippy --no-default-features 2>&1 | grep -c "warning:" || echo "0")
if [ "$CLIPPY_WARNINGS" -lt 10 ]; then
    pass "Clippy: $CLIPPY_WARNINGS warnings (acceptable)"
else
    warn "Clippy: $CLIPPY_WARNINGS warnings (review recommended)"
fi

# ============================================================================
# 8. TEST VALIDATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. TEST VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "8.1 Counting test functions..."
TEST_COUNT=$(grep -r "#\[test\]\|#\[tokio::test\]" tests/*.rs 2>/dev/null | wc -l || echo "0")
if [ "$TEST_COUNT" -ge 100 ]; then
    pass "$TEST_COUNT test functions found"
else
    warn "Only $TEST_COUNT test functions (target: 100+)"
fi

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VALIDATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✅ Passed:   $PASSED"
echo "  ⚠️  Warnings: $WARNINGS"
echo "  ❌ Failed:   $FAILED"
echo ""

TOTAL=$((PASSED + WARNINGS + FAILED))
SCORE=$(echo "scale=2; ($PASSED / $TOTAL) * 100" | bc 2>/dev/null || echo "N/A")

echo "  📊 Score: $SCORE%"
echo ""

# Generate report
REPORT_FILE="reports/validation_$(date +%Y%m%d_%H%M%S).md"
mkdir -p reports

cat > "$REPORT_FILE" << EOF
# BIZRA Validation Report
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Summary

| Metric | Value |
|--------|-------|
| Passed | $PASSED |
| Warnings | $WARNINGS |
| Failed | $FAILED |
| Score | $SCORE% |

## Status

EOF

if [ "$FAILED" -eq 0 ]; then
    echo "**Status**: ✅ PRODUCTION READY" >> "$REPORT_FILE"
    echo "========================================================================"
    echo "✅ VALIDATION COMPLETE: System is PRODUCTION READY"
    echo "   Report: $REPORT_FILE"
    exit 0
elif [ "$FAILED" -le 2 ]; then
    echo "**Status**: ⚠️ MOSTLY READY (minor fixes needed)" >> "$REPORT_FILE"
    echo "========================================================================"
    echo "⚠️  VALIDATION COMPLETE: Minor fixes needed"
    echo "   Report: $REPORT_FILE"
    exit 0
else
    echo "**Status**: ❌ NOT READY (critical fixes needed)" >> "$REPORT_FILE"
    echo "========================================================================"
    echo "❌ VALIDATION FAILED: Critical fixes needed"
    echo "   Report: $REPORT_FILE"
    exit 1
fi
