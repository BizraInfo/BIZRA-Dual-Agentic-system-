#!/bin/bash
# scripts/ensure_no_mocks_in_prod.sh
# CI Guard: Ensure strict mock hygiene for production builds.

set -e

# Directories to audit (Production source)
AUDIT_DIRS="src"
EXCLUDE_DIRS="tests examples benches docs demo"

echo "🛡️  BIZRA CI Guard: Auditing for 'Mock' and 'Simulate' artifacts in production paths..."

# 1. Search for "Mock" in Rust/Python source, excluding tests
# -g '!tests/**/*.rs' is for ripgrep, but we'll use grep for standard envs or rigprep if available.

if command -v rg >/dev/null 2>&1; then
    echo "   (Using ripgrep for audit)"
    # Fail if "Mock" is found in src/ but not inside a test module or test cfg
    # We search for "struct .*Mock" or "class .*Mock" or similar dangerous definitions
    # Note: We can't parse everything, but we can look for "Mock" token in non-test files.
    
    # Check for "Mock" - exclude tests, panic messages, and cfg-gated blocks
    MOCK_COUNT=$(rg "Mock" $AUDIT_DIRS -g '!*test*' -t rust -t py | grep -vE "cfg\(.*test.*\)|cfg\(.*simulation.*\)|panic\!|//|///" | wc -l)
    
    # Check for "Simulation" - exclude tests, panic messages, regex-lines, and feature-gates
    SIM_COUNT=$(rg -i "Simulat" $AUDIT_DIRS -g '!*test*' -t rust -t py | grep -vE "cfg\(.*test.*\)|cfg\(.*simulation.*\)|panic\!|//|///" | wc -l)

else
    echo "⚠️  ripgrep not found, falling back to basic grep. Results may be noisy."
    # Basic Grep fallback - exclude tests, panic messages, comments, and cfg gates for simulation feature
    MOCK_COUNT=$(grep -r "Mock" $AUDIT_DIRS | grep -v -E "test|docs|demo" | grep -vE "panic|//|cfg\(.*simulation.*\)" | wc -l)
    SIM_COUNT=$(grep -r -i "Simulat" $AUDIT_DIRS | grep -v -E "test|docs|demo" | grep -vE "panic|//|cfg\(.*simulation.*\)" | wc -l)
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
