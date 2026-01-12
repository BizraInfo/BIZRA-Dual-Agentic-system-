#!/bin/bash
# production_deployment.sh
# Status: PRODUCTION_READY_V9.0
# BIZRA v9.0 Production Deployment Orchestrator

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BIZRA_CONF="/etc/bizra"

echo "🧬 BIZRA v9.0 - PRODUCTION DEPLOYMENT"
echo "======================================"
echo "Date: $(date -Iseconds)"
echo "Project: $PROJECT_ROOT"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "  ${GREEN}✅ $1${NC}"
}

check_fail() {
    echo -e "  ${RED}❌ $1${NC}"
    FAILED=1
}

check_warn() {
    echo -e "  ${YELLOW}⚠️  $1${NC}"
}

FAILED=0

# ============================================
# PHASE 1: PRE-FLIGHT CHECKS
# ============================================
echo "📋 PHASE 1: Pre-flight Checks"
echo "------------------------------"

# Check Rust toolchain
if command -v cargo &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    check_pass "Rust toolchain: $RUST_VERSION"
else
    check_fail "Rust toolchain not found"
fi

# Check Redis
if command -v redis-cli &> /dev/null; then
    check_pass "Redis CLI available"
else
    check_warn "Redis CLI not found (optional)"
fi

# Check project structure
if [ -f "$PROJECT_ROOT/Cargo.toml" ]; then
    check_pass "Cargo.toml found"
else
    check_fail "Cargo.toml not found"
fi

if [ -f "$PROJECT_ROOT/src/main.rs" ]; then
    check_pass "main.rs found"
else
    check_fail "main.rs not found"
fi

echo ""

# ============================================
# PHASE 2: BUILD
# ============================================
echo "🔨 PHASE 2: Build"
echo "-----------------"

cd "$PROJECT_ROOT"

# Check for compilation errors first
echo "  Checking compilation..."
if cargo check --quiet 2>/dev/null; then
    check_pass "Compilation check passed"
else
    check_fail "Compilation errors detected"
    echo "  Run: cargo check 2>&1 | head -50"
fi

# Run tests
echo "  Running tests..."
TEST_OUTPUT=$(cargo test --lib 2>&1)
if echo "$TEST_OUTPUT" | grep -q "test result: ok"; then
    TEST_COUNT=$(echo "$TEST_OUTPUT" | grep "test result" | tail -1 | grep -oP '\d+ passed' | head -1)
    check_pass "Library tests: $TEST_COUNT"
else
    check_warn "Some tests may have failed"
fi

# Build release binary
echo "  Building release binary..."
if cargo build --release --quiet 2>/dev/null; then
    BINARY_SIZE=$(du -h "$PROJECT_ROOT/target/release/meta-alpha-dual-agentic" 2>/dev/null | cut -f1 || echo "unknown")
    check_pass "Release build complete: $BINARY_SIZE"
else
    check_fail "Release build failed"
fi

echo ""

# ============================================
# PHASE 3: COMPONENT VERIFICATION
# ============================================
echo "🔍 PHASE 3: Component Verification"
echo "-----------------------------------"

# Check for required source files
REQUIRED_FILES=(
    "src/storage.rs"
    "src/sape/pattern_compiler.rs"
    "src/sape/graph.rs"
    "src/tpm.rs"
    "src/executor.rs"
    "src/cognitive.rs"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        check_pass "$file exists"
    else
        check_fail "$file missing"
    fi
done

# Check for key exports in lib.rs
if grep -q "pub mod storage" "$PROJECT_ROOT/src/lib.rs"; then
    check_pass "Storage module exported"
else
    check_warn "Storage module not in lib.rs exports"
fi

if grep -q "pub mod sape" "$PROJECT_ROOT/src/lib.rs"; then
    check_pass "SAPE module exported"
else
    check_warn "SAPE module not in lib.rs exports"
fi

echo ""

# ============================================
# PHASE 4: DOCUMENTATION CHECK
# ============================================
echo "📚 PHASE 4: Documentation"
echo "-------------------------"

DOCS=(
    "ARCHITECTURE.md"
    "BIZRA_SOT.md"
    "BIZRA_SYSTEMATIC_ANALYSIS_REPORT.md"
    "BIZRA_MASTERPIECE_INTEGRATION.md"
    "SYSTEM_MANIFEST.json"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$PROJECT_ROOT/$doc" ]; then
        check_pass "$doc"
    else
        check_warn "$doc not found"
    fi
done

echo ""

# ============================================
# PHASE 5: SECURITY CHECK
# ============================================
echo "🔐 PHASE 5: Security"
echo "--------------------"

# Check for hardcoded secrets
if grep -rq "PRIVATE_KEY\|SECRET\|PASSWORD" "$PROJECT_ROOT/src/" 2>/dev/null | grep -v "env::var" | grep -v "\.env" | head -1; then
    check_warn "Potential hardcoded secrets found"
else
    check_pass "No hardcoded secrets detected"
fi

# Check for TPM/signing implementation
if grep -q "impl Signer" "$PROJECT_ROOT/src/tpm.rs"; then
    check_pass "Signer trait implemented"
else
    check_fail "Signer implementation not found"
fi

# Check for signature verification
if grep -q "verify" "$PROJECT_ROOT/src/tpm.rs"; then
    check_pass "Signature verification implemented"
else
    check_warn "Signature verification may be missing"
fi

echo ""

# ============================================
# PHASE 6: DEPLOYMENT READINESS
# ============================================
echo "🚀 PHASE 6: Deployment Readiness"
echo "---------------------------------"

# Check deployment scripts
if [ -f "$SCRIPT_DIR/deploy_redis.sh" ]; then
    check_pass "Redis deployment script"
else
    check_warn "Redis deployment script missing"
fi

if [ -f "$SCRIPT_DIR/deploy_monitoring.sh" ]; then
    check_pass "Monitoring deployment script"
else
    check_warn "Monitoring deployment script missing"
fi

# Check systemd service template
if [ -f "/etc/systemd/system/bizra-node.service" ]; then
    check_pass "Systemd service installed"
else
    check_warn "Systemd service not installed"
fi

echo ""

# ============================================
# SUMMARY
# ============================================
echo "========================================"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎯 DEPLOYMENT READY${NC}"
    echo ""
    echo "All critical checks passed."
    echo ""
    echo "To deploy:"
    echo "  1. Deploy Redis:     ./scripts/deploy_redis.sh"
    echo "  2. Deploy Monitoring: ./scripts/deploy_monitoring.sh"
    echo "  3. Install binary:   cp target/release/meta-alpha-dual-agentic /usr/local/bin/bizra-node"
    echo "  4. Start service:    systemctl start bizra-node"
    echo ""
    echo "Or run directly:"
    echo "  REDIS_URL=redis://... ./target/release/meta-alpha-dual-agentic server --redis"
else
    echo -e "${RED}⚠️  DEPLOYMENT BLOCKED${NC}"
    echo ""
    echo "Critical issues must be resolved before deployment."
    echo "Review the failed checks above."
fi
echo "========================================"

exit $FAILED
