#!/bin/bash
file=$1

# Validate input
if [ -z "$file" ]; then
    echo "Usage: $0 <markdown-file>" >&2
    echo "Error: No file argument provided." >&2
    exit 1
fi

if [ ! -f "$file" ]; then
    echo "Error: File '$file' does not exist or is not a regular file." >&2
    exit 1
fi

# Portable sed wrapper: writes to temp file and atomically replaces
sed_inplace() {
    local pattern="$1"
    local target="$2"
    local tmpfile
    tmpfile=$(mktemp) || { echo "Error: Failed to create temp file" >&2; exit 1; }
    if sed "$pattern" "$target" > "$tmpfile"; then
        mv "$tmpfile" "$target"
    else
        rm -f "$tmpfile"
        echo "Error: sed failed on $target" >&2
        exit 1
    fi
}

# Add newline before code blocks if missing (opening fences)
sed_inplace '/^[^[:space:]].*/{N;s/\n```/\n\n```/;P;D;}' "$file"
# Add newline after CLOSING code blocks only (lines with just ``` and optional whitespace)
# Only target closing fences followed by non-blank content
sed_inplace '/^```[[:space:]]*$/{N;s/^```[[:space:]]*\n\([^[:space:]]\)/```\n\n\1/;P;D;}' "$file"
# Ensure one newline before headers
sed_inplace '/^[^#\n].*/{N;s/\n#/\n\n#/;P;D;}' "$file"
