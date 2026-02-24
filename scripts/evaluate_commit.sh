#!/bin/bash
# scripts/evaluate_commit.sh
# Core logic for BIZRA Internal Evaluation (Self-Reflection)

set -euo pipefail

COMMIT_HASH=""

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --hash) COMMIT_HASH="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

if [[ -z "$COMMIT_HASH" ]]; then
    echo "Usage: $0 --hash <commit_hash>"
    exit 1
fi

echo "🧠 Evaluating Commit: $COMMIT_HASH"
COMMIT_MSG=$(git log -1 --format="%s" $COMMIT_HASH)

# Ensure executor is built
if [ ! -f "target/release/cognitive_executor" ]; then
    echo "⚙️ Building cognitive_executor..."
    cargo build --release --bin cognitive_executor >/dev/null 2>&1
fi

# 1. Convert Limit to Thought
TEMP_THOUGHT=$(mktemp)
TEMP_RECEIPT=$(mktemp)

./scripts/commit_to_thought.sh --hash "$COMMIT_HASH" \
                               --message "$COMMIT_MSG" \
                               --output "$TEMP_THOUGHT"

# 2. Execute via Cognitive Layer
echo "⚡ Executing thought via SAPE-E..."
export BIZRA_ALLOW_SOFTWARE_TPM=1
if ./target/release/cognitive_executor --probe "$TEMP_THOUGHT" --output "$TEMP_RECEIPT"; then
    # Parse receipt for stats
    IHSAN=$(grep -o '"ihsan_score": [0-9.]*' "$TEMP_RECEIPT" | awk '{print $2}')
    echo "✅ Receipt Verified. Ihsan: ${IHSAN:-N/A}"
    
    # Clean up
    rm "$TEMP_THOUGHT" "$TEMP_RECEIPT"
    exit 0
else
    EXIT_CODE=$?
    echo "❌ COMMIT REJECTED (Burn Initiated)"
    
    # Burn Logic (Simulated)
    if [ "$EXIT_CODE" -eq 99 ]; then
        echo "🔥 BURN EVENT: 5.0% Compute Credits Penalyzed"
    fi
    
    rm "$TEMP_THOUGHT" "$TEMP_RECEIPT"
    exit $EXIT_CODE
fi
