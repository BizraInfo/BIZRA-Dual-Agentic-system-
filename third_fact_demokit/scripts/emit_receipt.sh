#!/bin/bash
set -euo pipefail

# emit_receipt.sh - Generate a BIZRA Canonical Receipt (JCS)
# Usage: ./emit_receipt.sh <TYPE> <PAYLOAD_JSON_FILE> <KEY_FILE>

TYPE=${1:-"generic_event"}
PAYLOAD_FILE=${2:-""}
KEY_FILE=${3:-"keys/demo.key"}
PREV_HASH=${4:-""}

# If absolute paths not provided, assume relative to P0 root
if [[ ! -f "$KEY_FILE" ]] && [[ -f "third_fact_demokit/$KEY_FILE" ]]; then
    KEY_FILE="third_fact_demokit/$KEY_FILE"
fi

if [[ -z "$PAYLOAD_FILE" ]]; then
  echo "Usage: $0 <TYPE> <PAYLOAD_FILE> [KEY_FILE]"
  exit 1
fi

if [[ ! -f "$PAYLOAD_FILE" ]]; then
  echo "Error: Payload file not found: $PAYLOAD_FILE"
  exit 1
fi

if [[ -f "target/release/bizra-verify-receipt" ]]; then
    VERIFIER_BIN="target/release/bizra-verify-receipt"
else
    # Fallback to local build if running standalone
    if [[ -d "third_fact_demokit/verifier" ]]; then
       (cd third_fact_demokit/verifier && cargo build --release --quiet)
       # Determine where cargo put it. If workspace, it's in root target.
       if [[ -f "target/release/bizra-verify-receipt" ]]; then
          VERIFIER_BIN="target/release/bizra-verify-receipt"
       elif [[ -f "third_fact_demokit/verifier/target/release/bizra-verify-receipt" ]]; then
          VERIFIER_BIN="third_fact_demokit/verifier/target/release/bizra-verify-receipt"
       else
           echo "Error: Could not locate verifier binary after build."
           exit 1
       fi
    elif [[ -d "verifier" ]]; then
        (cd verifier && cargo build --release --quiet)
        VERIFIER_BIN="verifier/target/release/bizra-verify-receipt"
    else 
        echo "Error: verifier source not found"
        exit 1
    fi
fi

# 1. Create Base Receipt JSON
TS=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
CONTENT=$(cat "$PAYLOAD_FILE")
TMP_BASE=$(mktemp)

# Handle Evidence Hash
EVIDENCE_HASH=$(echo "$CONTENT" | jq -r .evidence_hash)
if [[ "$EVIDENCE_HASH" == "null" ]]; then
  EVIDENCE_HASH="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
fi

jq -n \
  --arg ctx "https://bizra.ai/contexts/receipt/v1" \
  --arg type "$TYPE" \
  --arg ts "$TS" \
  --arg ev "$EVIDENCE_HASH" \
  --argjson meta "$CONTENT" \
  '{
    "@context": $ctx,
    "receipt_id": "", 
    "prev_hash": null,
    "type": $type,
    "timestamp": $ts,
    "evidence_hash": $ev,
    "signatures": [],
    "metadata": $meta
  }' > "$TMP_BASE"

# 2. Sign and Finalize
ARGS="sign --file $TMP_BASE --key $KEY_FILE --signer node-0-genesis"
if [[ -n "$PREV_HASH" ]]; then
  ARGS="$ARGS --prev-hash $PREV_HASH"
fi

$VERIFIER_BIN $ARGS > /dev/null

cat "$TMP_BASE"
rm "$TMP_BASE"
