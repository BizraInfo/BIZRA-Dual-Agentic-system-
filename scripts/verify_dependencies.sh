#!/bin/bash
# SAPE v1.∞ EXECUTION: DEPENDENCY SECURITY VERIFICATION
# Part of 72-Hour Critical Gap Remediation Sprint
set -e

echo "🛡️  BIZRA SECURITY: VERIFYING DEPENDENCY CHAIN..."
echo "========================================================================"

GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$GIT_ROOT"

# Critical dependencies with required versions
declare -A CRITICAL_DEPS=(
    ["wasmtime"]="24.0"
    ["pyo3"]="0.24"
    ["ed25519-dalek"]="2.1"
    ["tokio"]="1.41"
    ["z3"]="0.12"
    ["axum"]="0.7"
    ["sha2"]="0.10"
    ["blake3"]="1.5"
)

# 1. Check for cargo-audit
echo ""
echo "📋 Phase 1: Checking security tools..."
if ! command -v cargo-audit &>/dev/null; then
    echo "  ⚠ cargo-audit not found, installing..."
    cargo install cargo-audit
fi
echo "  ✓ cargo-audit available"

if ! command -v cargo-deny &>/dev/null; then
    echo "  ⚠ cargo-deny not found, installing..."
    cargo install cargo-deny
fi
echo "  ✓ cargo-deny available"

# 2. Run security audit
echo ""
echo "📋 Phase 2: Running security audit..."
AUDIT_RESULT=$(cargo audit 2>&1 || true)
VULN_COUNT=$(echo "$AUDIT_RESULT" | grep -c "Vulnerability found" || echo "0")

if [ "$VULN_COUNT" -gt 0 ]; then
    echo "  ⚠ $VULN_COUNT vulnerabilities found:"
    echo "$AUDIT_RESULT" | grep -A 3 "Vulnerability found" || true
else
    echo "  ✓ No known vulnerabilities"
fi

# 3. Verify critical dependency versions
echo ""
echo "📋 Phase 3: Verifying critical dependency versions..."
TREE_OUTPUT=$(cargo tree --depth 1 2>/dev/null || echo "")

for dep in "${!CRITICAL_DEPS[@]}"; do
    version="${CRITICAL_DEPS[$dep]}"
    if echo "$TREE_OUTPUT" | grep -q "$dep v$version"; then
        echo "  ✓ $dep v$version+ (secure)"
    else
        ACTUAL=$(echo "$TREE_OUTPUT" | grep -o "$dep v[0-9.]*" | head -1 || echo "not found")
        echo "  ⚠ $dep expected v$version+, found: $ACTUAL"
    fi
done

# 4. Check for post-quantum cryptography
echo ""
echo "📋 Phase 4: Checking post-quantum cryptography status..."
if grep -q "pqcrypto" Cargo.toml; then
    echo "  ✓ PQC dependencies configured"
else
    echo "  ⚠ PQC not yet implemented"
    echo "    Recommendation: Add pqcrypto-kyber and pqcrypto-dilithium"
fi

# 5. Generate security report
echo ""
echo "📋 Phase 5: Generating security report..."
REPORT_FILE="reports/dependency_security_$(date +%Y%m%d_%H%M%S).md"
mkdir -p reports

cat > "$REPORT_FILE" << EOF
# Dependency Security Report
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Audit Tool**: cargo-audit

## Vulnerability Summary
- **Total Vulnerabilities**: $VULN_COUNT
- **Critical**: $(echo "$AUDIT_RESULT" | grep -c "critical" || echo "0")
- **High**: $(echo "$AUDIT_RESULT" | grep -c "high" || echo "0")
- **Medium**: $(echo "$AUDIT_RESULT" | grep -c "medium" || echo "0")

## Critical Dependencies

| Crate | Required | Status |
|-------|----------|--------|
EOF

for dep in "${!CRITICAL_DEPS[@]}"; do
    version="${CRITICAL_DEPS[$dep]}"
    if echo "$TREE_OUTPUT" | grep -q "$dep v$version"; then
        echo "| \`$dep\` | v$version+ | ✅ Verified |" >> "$REPORT_FILE"
    else
        echo "| \`$dep\` | v$version+ | ⚠️ Check Required |" >> "$REPORT_FILE"
    fi
done

cat >> "$REPORT_FILE" << EOF

## Post-Quantum Cryptography

| Algorithm | Crate | Status |
|-----------|-------|--------|
| ML-KEM (Kyber) | pqcrypto-kyber | $(grep -q "pqcrypto-kyber" Cargo.toml && echo "✅ Added" || echo "⚠️ Pending") |
| ML-DSA (Dilithium) | pqcrypto-dilithium | $(grep -q "pqcrypto-dilithium" Cargo.toml && echo "✅ Added" || echo "⚠️ Pending") |

## Recommendations

1. Run \`cargo update\` to get latest patches
2. Enable \`post-quantum\` feature for PQC support
3. Re-audit after any dependency changes
EOF

echo "  ✓ Report saved to: $REPORT_FILE"

# 6. Final status
echo ""
echo "========================================================================"
if [ "$VULN_COUNT" -eq 0 ]; then
    echo "✅ DEPENDENCY VERIFICATION COMPLETE: No vulnerabilities found"
else
    echo "⚠️  DEPENDENCY VERIFICATION PENDING: $VULN_COUNT vulnerabilities need attention"
fi
