#!/bin/bash
# scripts/ensure_no_mocks_in_prod.sh
# CI Guard: Ensure strict mock hygiene for production builds.

set -e

# Directories to audit (Production source)
AUDIT_DIRS="src"
EXCLUDE_DIRS="tests examples benches docs demo"

echo "🛡️  BIZRA CI Guard: Auditing for 'Mock' and 'Simulate' artifacts in production paths..."

# Build exclusion lists
RG_EXCLUDES=""
GREP_EXCLUDES=""
for dir in $EXCLUDE_DIRS; do
    RG_EXCLUDES="$RG_EXCLUDES -g '!$dir/*'"
    GREP_EXCLUDES="$GREP_EXCLUDES --exclude-dir=$dir"
done

# 1. Search for "Mock" in Rust/Python source, excluding tests
if command -v rg >/dev/null 2>&1; then
    echo "   (Using ripgrep for audit)"
    
    # Check for "Mock" - exclude tests, panic messages, and cfg-gated blocks
    # We use || true to prevent failure if no matches found before filtering, though wc catches it without pipefail.
    MOCK_COUNT=$(rg "Mock" $AUDIT_DIRS -g '!*test*' $RG_EXCLUDES -t rust -t py 2>/dev/null | grep -vE "cfg\(.*test.*\)|cfg\(.*simulation.*\)|panic\!|//|///" | wc -l)
    
    # Check for "Simulation"
    SIM_COUNT=$(rg -i "Simulat" $AUDIT_DIRS -g '!*test*' $RG_EXCLUDES -t rust -t py 2>/dev/null | grep -vE "cfg\(.*test.*\)|cfg\(.*simulation.*\)|panic\!|//|///" | wc -l)

else
    echo "⚠️  ripgrep not found, falling back to basic grep. Results may be noisy."
    # Basic Grep fallback
    # Note: grep -r supports --exclude-dir (GNU grep).
    
    MOCK_COUNT=$(grep -r "Mock" $AUDIT_DIRS $GREP_EXCLUDES | grep -v "test" | grep -vE "panic|//|cfg\(.*simulation.*\)" | wc -l)
    SIM_COUNT=$(grep -r -i "Simulat" $AUDIT_DIRS $GREP_EXCLUDES | grep -v "test" | grep -vE "panic|//|cfg\(.*simulation.*\)" | wc -l)
fi


if [ "$MOCK_COUNT" -gt 0 ] || [ "$SIM_COUNT" -gt 0 ]; then
    echo " "
    echo "❌ SECURITY FAILURE: Simulation artifacts detected in production paths."
    echo "   - 'Mock' occurrences: $MOCK_COUNT"
    echo "   - 'Simulate' occurrences: $SIM_COUNT"
    echo " "
    echo "   Action: Feature-gate mocks with #[cfg(any(test, feature = \"simulation\"))] or remove them."
    echo " "
    
    # Show specifics if small count
    if [ "$MOCK_COUNT" -lt 20 ]; then
        echo "   [Mock Findings]:"
        if command -v rg >/dev/null 2>&1; then
             rg "Mock" $AUDIT_DIRS -g '!*test*' -t rust -t py | grep -vE "cfg\(.*test.*\)|cfg\(.*simulation.*\)" || true
        else
             grep -r "Mock" $AUDIT_DIRS | grep -v -E "test|docs|demo" || true
        fi
    fi
    
    exit 1
else
    echo "✅ CI Guard Passed: No unguarded simulation artifacts found."
    exit 0
fi
