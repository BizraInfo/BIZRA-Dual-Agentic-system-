#!/bin/bash
# Phase 3: Sovereign Launch Ceremony (Production)
set -euo pipefail

echo "🏛️  SOVEREIGN LAUNCH CEREMONY"
echo "=============================="

echo "🔐 INITIATING 3-OF-5 HSM SIGNING CEREMONY..."
if [ ! -f "scripts/hsm_signing_ceremony.py" ]; then
  echo "ERROR: scripts/hsm_signing_ceremony.py is required for production launch"
  exit 1
fi
python3 scripts/hsm_signing_ceremony.py

echo "💰 MINTING GENESIS BLOCK WITH SWEAT EQUITY..."
if [ ! -f "scripts/mint_genesis_block.py" ]; then
  echo "ERROR: scripts/mint_genesis_block.py is required for production launch"
  exit 1
fi
python3 scripts/mint_genesis_block.py

echo "🌐 LAUNCHING BIZRA NETWORK AND MONITORING..."
if [ -z "${BIZRA_NETWORK_LAUNCH_CMD:-}" ]; then
  echo "ERROR: BIZRA_NETWORK_LAUNCH_CMD must be set to a production launch command"
  exit 1
fi
bash -c "$BIZRA_NETWORK_LAUNCH_CMD"

echo "✅ Sovereign launch complete."
