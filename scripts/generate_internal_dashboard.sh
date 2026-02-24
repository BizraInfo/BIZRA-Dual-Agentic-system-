#!/bin/bash
# scripts/generate_internal_dashboard.sh
# Generates the Merkle Root Dashboard for Internal KPIs

set -euo pipefail

OUTPUT="dashboard.internal.json"

if [ -z "${BIZRA_DASHBOARD_METRICS_PATH:-}" ]; then
  echo "ERROR: BIZRA_DASHBOARD_METRICS_PATH must point to a metrics JSON file"
  exit 1
fi

if [ ! -f "$BIZRA_DASHBOARD_METRICS_PATH" ]; then
  echo "ERROR: Metrics file not found: $BIZRA_DASHBOARD_METRICS_PATH"
  exit 1
fi

METRICS_JSON=$(cat "$BIZRA_DASHBOARD_METRICS_PATH")

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
RECEIPT_ID="rec_INTERNAL_DASHBOARD_$(uuidgen | tr -d '-')"

# Construct Dashboard JSON
cat > "$OUTPUT" <<EOF
{
  "receipt_id": "$RECEIPT_ID",
  "timestamp": "$TIMESTAMP",
  "metrics": $METRICS_JSON
}
EOF

# Calculate Merkle Root (SHA256 of content)
MERKLE_ROOT=$(sha256sum "$OUTPUT" | awk '{print $1}')

# Update JSON with root
# Using temp file to allow self-reference if needed, but here just appending or editing
# Creating final wrapper
cat > "${OUTPUT}.final" <<EOF
{
  "head": {
    "receipt_id": "$RECEIPT_ID",
    "timestamp": "$TIMESTAMP",
    "merkle_root": "0x$MERKLE_ROOT"
  },
  "body": $(cat "$OUTPUT")
}
EOF

mv "${OUTPUT}.final" "$OUTPUT"

echo "✅ Internal Dashboard Generated: $OUTPUT"
echo "🔐 Merkle Root: 0x$MERKLE_ROOT"
