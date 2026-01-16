#!/bin/bash
# BIZRA PostToolUse hook for Write/Edit
# Auto-format Rust files after modification

set -e

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))" 2>/dev/null || echo "")

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Auto-format Rust files
if [[ "$FILE_PATH" == *.rs ]]; then
    if command -v rustfmt &> /dev/null; then
        rustfmt "$FILE_PATH" 2>/dev/null || true
    fi
fi

# Auto-format TypeScript/JavaScript files
if [[ "$FILE_PATH" == *.ts ]] || [[ "$FILE_PATH" == *.tsx ]] || [[ "$FILE_PATH" == *.js ]]; then
    if [ -f "$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier" ]; then
        "$CLAUDE_PROJECT_DIR/node_modules/.bin/prettier" --write "$FILE_PATH" 2>/dev/null || true
    fi
fi

exit 0
