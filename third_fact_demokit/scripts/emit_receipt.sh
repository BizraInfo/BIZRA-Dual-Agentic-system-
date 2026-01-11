#!/usr/bin/env bash
set -euo pipefail
source scripts/demo_functions.sh

TYPE=""
METADATA="{}"
EVIDENCE_DIR=""
SIGN=1
SIGNER_ID="${SIGNER_ID:-demo_hsm_slot_0}"
KEY_PATH="${KEY_PATH:-keys/demo_private_key.pem}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --type) TYPE="$2"; shift 2;;
    --metadata) METADATA="$2"; shift 2;;
    --evidence-dir) EVIDENCE_DIR="$2"; shift 2;;
    --no-sign) SIGN=0; shift 1;;
    --signer) SIGNER_ID="$2"; shift 2;;
    --key) KEY_PATH="$2"; shift 2;;
    *) shift 1;;
  esac
done

timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
evidence_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" # Empty sha256

if [[ -n "$EVIDENCE_DIR" ]]; then
    evidence_hash="$(verifier/bizra-verify-receipt hash-evidence --dir "$EVIDENCE_DIR" --write-manifest)"
fi

prev="$(last_receipt_id)"
metadata_with_chain="$(python3 -c "import json,sys; m=json.loads(sys.argv[1]); prev=sys.argv[2]; m['prev_receipt']=prev if prev and 'prev_receipt' not in m else m.get('prev_receipt'); print(json.dumps(m))" "$METADATA" "$prev")"

tmp_payload="receipts/tmp_payload.json"
cat > "$tmp_payload" <<EOF
{
  "@context": "https://bizra.ai/contexts/receipt/v1",
  "type": "$TYPE",
  "timestamp": "$timestamp",
  "evidence_hash": "$evidence_hash",
  "metadata": $metadata_with_chain
}
EOF

rid="$(verifier/bizra-verify-receipt payload-id --file "$tmp_payload")"
rm -f "$tmp_payload"

receipt_path="receipts/${rid}.json"
cat > "$receipt_path" <<EOF
{
  "@context": "https://bizra.ai/contexts/receipt/v1",
  "receipt_id": "$rid",
  "type": "$TYPE",
  "timestamp": "$timestamp",
  "evidence_hash": "$evidence_hash",
  "signatures": [],
  "metadata": $metadata_with_chain
}
EOF

if [[ "$SIGN" == "1" && -f "$KEY_PATH" ]]; then
    verifier/bizra-verify-receipt sign --file "$receipt_path" --key "$KEY_PATH" --signer "$SIGNER_ID" >/dev/null
fi

# Generate canonical form for verification ease
verifier/bizra-verify-receipt canonicalize --file "$receipt_path" > "receipts/${rid}.canonical.json"

update_chain "$rid"
echo "$rid"