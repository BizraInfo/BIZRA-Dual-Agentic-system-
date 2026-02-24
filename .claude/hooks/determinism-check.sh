#!/bin/bash
# BIZRA Determinism Gate - PreToolUse hook for Write/Edit
# Warns about float operations in receipt/consensus paths

set -e

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")
CONTENT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin).get('tool_input',{}); print(d.get('content','') or d.get('new_string',''))" 2>/dev/null || echo "")

# Check if file is in receipt/consensus path
if echo "$FILE_PATH" | grep -qE "(receipt|consensus|hash|evidence)"; then
    # Check for float operations that could cause non-determinism
    if echo "$CONTENT" | grep -qE "\b(f32|f64|float|double)\b.*[+\-*/]"; then
        echo "SAT Formal Validator WARNING: Float arithmetic in determinism-critical path" >&2
        echo "Hard Gate: Use integer/fixed-point or canonicalize before hashing" >&2
        # Warning only, not blocking
    fi
fi

exit 0
