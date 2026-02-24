#!/bin/bash
# scripts/commit_to_thought.sh
# Wraps git commit metadata into a Thought JSON structure

set -euo pipefail

HASH=""
MESSAGE=""
OUTPUT=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --hash) HASH="$2"; shift ;;
        --message) MESSAGE="$2"; shift ;;
        --output) OUTPUT="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

if [[ -z "$HASH" || -z "$MESSAGE" || -z "$OUTPUT" ]]; then
    echo "Usage: $0 --hash <hash> --message <msg> --output <file>"
    exit 1
fi

# Get diff stats size
DIFF_SIZE=$(git show --stat --oneline $HASH | tail -n1 | awk '{print $1}')

cat > "$OUTPUT" <<EOF
{
  "type": "commit_thought",
  "commit_hash": "$HASH",
  "message": "$MESSAGE",
  "diff_size": "${DIFF_SIZE:-0}",
  "timestamp": $(date +%s),
  "author": "$(git show -s --format='%an' $HASH)",
  "context": "internal_evaluation"
}
EOF
