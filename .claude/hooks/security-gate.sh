#!/bin/bash
# BIZRA SAT Security Sentinel - PreToolUse hook for Bash commands
# Blocks dangerous patterns before execution

set -e

# Read JSON input from stdin
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null || echo "")

if [ -z "$COMMAND" ]; then
    exit 0
fi

# Security blocklist - VETO power patterns
# Note: These are regex patterns for grep -E
BLOCKLIST=(
    "rm[[:space:]]+-rf[[:space:]]+/($|[[:space:]])"
    "rm[[:space:]]+-rf[[:space:]]+/\\*"
    ">[[:space:]]*/dev/sd"
    "\\bmkfs\\b"
    "dd[[:space:]]+if=/dev/zero"
    ":\\(\\)\\{[[:space:]]*:\\|:&[[:space:]]*\\};:"
    "chmod[[:space:]]+-R[[:space:]]+777[[:space:]]+/"
    "curl[[:space:]].*\\|[[:space:]]*sh"
    "curl[[:space:]].*\\|[[:space:]]*bash"
    "wget[[:space:]].*\\|[[:space:]]*sh"
    "wget[[:space:]].*\\|[[:space:]]*bash"
)

for pattern in "${BLOCKLIST[@]}"; do
    if echo "$COMMAND" | grep -qE "$pattern"; then
        echo "SAT Security Sentinel VETO: Blocked dangerous pattern" >&2
        exit 2
    fi
done

# SQL injection patterns
if echo "$COMMAND" | grep -qiE "('.*--)|(\bDROP\b.*\bTABLE\b)|(\bDELETE\b.*\bFROM\b.*\bWHERE\b.*=.*)|(\bOR\b.*1.*=.*1)"; then
    echo "SAT Security Sentinel VETO: SQL injection pattern detected" >&2
    exit 2
fi

exit 0
