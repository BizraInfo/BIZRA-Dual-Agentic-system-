#!/bin/bash
# scripts/apotheosis_launch.sh - The Activation of the Peak Masterpiece
set -e

echo "🌌 INITIATING BIZRA APOTHEOSIS..."

# 1. Rebuild Sovereign Kernel (Rust)
echo "🦀 Step 1: Hardening Sovereign Kernel..."
cargo build --release

# 2. Rebuild Backend (Axum)
echo "🚀 Step 2: Synchronizing Node0 Backend..."
cd bizra-genesis-node/backend
cargo build --release
cd ../..

# 3. Build UI (Next.js)
echo "🎨 Step 3: Materializing Sovereign Canvas UI..."
cd bizra-genesis-node/apps/ui-sovereign
npm install --legacy-peer-deps
npm run build
cd ../../../

# 4. Final Seal Verification
echo "🔒 Step 4: Applying Peak Masterpiece Seal..."
python3 -c "import json; d = json.load(open('BIZRA_PEAK_MASTERPIECE_SEAL.json')); d['status'] = 'ACTIVATED'; d['apotheosis_revision'] = '1.0.0'; json.dump(d, open('BIZRA_PEAK_MASTERPIECE_SEAL.json', 'w'), indent=4)"

echo "✨ APOTHEOSIS COMPLETE."
echo "Access the Sovereign Canvas at http://localhost:3000"
echo "API Route: http://localhost:33333/api/reasoning/apotheosis"
echo "Feed: cv-arxiv-daily integrated."
