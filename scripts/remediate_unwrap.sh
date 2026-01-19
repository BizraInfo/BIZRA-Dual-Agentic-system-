#!/bin/bash
# SAPE v1.∞ EXECUTION: UNWRAP REMEDIATION PROTOCOL
# Part of 72-Hour Critical Gap Remediation Sprint
set -e

echo "🔒 BIZRA SECURITY HARDENING: REMOVING UNWRAP() FROM CRITICAL PATHS..."
echo "========================================================================"

GIT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || echo ".")
cd "$GIT_ROOT"

# Critical modules that must not use unwrap
CRITICAL_MODULES=(
    "src/receipts.rs"
    "src/hookchain.rs"
    "src/sape/ihsan.rs"
    "src/fate.rs"
    "src/omega.rs"
    "src/tpm.rs"
)

# 1. Add deny lint to critical modules
echo ""
echo "📋 Phase 1: Adding #![deny(clippy::unwrap_used)] to critical modules..."
for file in "${CRITICAL_MODULES[@]}"; do
    if [ -f "$file" ]; then
        # Check if deny already exists
        if grep -q '#!\[deny(clippy::unwrap_used)\]' "$file"; then
            echo "  ✓ $file (already has deny)"
        else
            # Add deny at the beginning (after any existing attributes)
            # Find first non-attribute, non-comment line
            sed -i '1{
                /^#!/!{
                    i #![deny(clippy::unwrap_used)]
                }
            }' "$file"
            echo "  ✓ $file (deny added)"
        fi
    else
        echo "  ⚠ $file (not found, skipping)"
    fi
done

# 2. Count remaining unwrap() calls
echo ""
echo "📊 Phase 2: Analyzing unwrap() usage across codebase..."
TOTAL_UNWRAP=$(grep -r "\.unwrap()" src/*.rs 2>/dev/null | wc -l || echo "0")
CRITICAL_UNWRAP=0

for file in "${CRITICAL_MODULES[@]}"; do
    if [ -f "$file" ]; then
        COUNT=$(grep -c "\.unwrap()" "$file" 2>/dev/null || echo "0")
        CRITICAL_UNWRAP=$((CRITICAL_UNWRAP + COUNT))
        if [ "$COUNT" -gt 0 ]; then
            echo "  ⚠ $file: $COUNT unwrap() calls (REQUIRES MANUAL FIX)"
        else
            echo "  ✓ $file: 0 unwrap() calls"
        fi
    fi
done

echo ""
echo "📈 Summary:"
echo "  - Total unwrap() in src/: $TOTAL_UNWRAP"
echo "  - Critical path unwrap(): $CRITICAL_UNWRAP"

# 3. Generate migration report
echo ""
echo "📝 Phase 3: Generating migration report..."
REPORT_FILE="reports/unwrap_migration_$(date +%Y%m%d_%H%M%S).md"
mkdir -p reports

cat > "$REPORT_FILE" << EOF
# Unwrap() Migration Report
**Generated**: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Status**: IN_PROGRESS

## Critical Modules Status

| Module | Unwrap Count | Status |
|--------|--------------|--------|
EOF

for file in "${CRITICAL_MODULES[@]}"; do
    if [ -f "$file" ]; then
        COUNT=$(grep -c "\.unwrap()" "$file" 2>/dev/null || echo "0")
        if [ "$COUNT" -gt 0 ]; then
            echo "| \`$file\` | $COUNT | ⚠️ NEEDS FIX |" >> "$REPORT_FILE"
        else
            echo "| \`$file\` | $COUNT | ✅ CLEAN |" >> "$REPORT_FILE"
        fi
    fi
done

cat >> "$REPORT_FILE" << EOF

## Recommended Replacements

| Pattern | Replacement |
|---------|-------------|
| \`.unwrap()\` on Result | \`.context("description")?\` |
| \`.unwrap()\` on Option | \`.ok_or_else(\|\| anyhow!("reason"))?\` |
| \`.unwrap_or(default)\` | Keep (safe pattern) |
| \`.unwrap_or_else(f)\` | Keep (safe pattern) |

## Next Steps

1. Run \`cargo clippy -- -D clippy::unwrap_used\` to find all violations
2. Replace each unwrap() with proper error handling
3. Re-run validation script
EOF

echo "  ✓ Report saved to: $REPORT_FILE"

# 4. Final status
echo ""
echo "========================================================================"
if [ "$CRITICAL_UNWRAP" -eq 0 ]; then
    echo "✅ UNWRAP REMEDIATION COMPLETE: No unwrap() in critical paths"
else
    echo "⚠️  UNWRAP REMEDIATION PENDING: $CRITICAL_UNWRAP calls need manual fix"
    echo "   Run: cargo clippy -- -D clippy::unwrap_used"
fi
