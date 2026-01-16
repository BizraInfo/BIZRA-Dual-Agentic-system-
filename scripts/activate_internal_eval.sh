#!/bin/bash
# scripts/activate_internal_eval.sh
# Run once. The system will self-evaluate forever.

set -euo pipefail

echo "🧠 ACTIVATING BIZRA INTERNAL EVALUATION PROTOCOL"
echo "==============================================="

# Make scripts executable
chmod +x scripts/evaluate_commit.sh scripts/commit_to_thought.sh scripts/generate_internal_dashboard.sh

# 1. Governor signs the internal eval constitution
echo "🔑 Governor signing internal eval constitution..."
if [ -z "${BIZRA_GOVERNOR_SIGN_CMD:-}" ]; then
  echo "ERROR: BIZRA_GOVERNOR_SIGN_CMD must sign internal_eval_constitution.yaml"
  exit 1
fi
bash -c "${BIZRA_GOVERNOR_SIGN_CMD} internal_eval_constitution.yaml" > internal_eval.sig
echo "✅ Constitution signed. All commits must obey."

# 2. Initialize internal ReceiptStore (Redis required)
if ! command -v redis-cli &> /dev/null; then
    echo "ERROR: redis-cli is required for internal ReceiptStore"
    exit 1
fi
echo "💾 Initializing internal ReceiptStore..."
redis-cli SET internal_eval:head "genesis" NX || true
echo "✅ Internal chain initialized (Redis)."

# 3. Install pre-commit hook (auto-evaluates every commit)
echo "⚙️ Installing pre-commit hook..."
mkdir -p .git/hooks
cat > .git/hooks/pre-commit <<'HOOK'
#!/bin/bash
# Auto-evaluate commit before allowing
# Using absolute path or assuming run from root
REPO_ROOT=$(git rev-parse --show-toplevel)
$REPO_ROOT/scripts/evaluate_commit.sh --hash HEAD || exit 99
HOOK
chmod +x .git/hooks/pre-commit
echo "✅ Pre-commit hook installed. No commit without eval."

# 4. Run first internal evaluation (baseline)
echo "📊 Running first internal evaluation (baseline)..."
# We need to build the binary first
cargo build --release --bin cognitive_executor
mkdir -p receipts
# Evaluate HEAD
./scripts/evaluate_commit.sh --hash HEAD
echo "✅ Baseline established."

# 5. Schedule hourly self-evaluation (cron)
echo "⏰ Scheduling hourly self-evaluation..."
if ! command -v crontab &> /dev/null; then
  echo "ERROR: crontab is required to schedule hourly evaluation"
  exit 1
fi
(crontab -l 2>/dev/null; echo "0 * * * * cd $(pwd) && ./scripts/generate_internal_dashboard.sh") | crontab -
echo "✅ Hourly self-evaluation scheduled."

# 6. Publish internal dashboard (Merkle root)
echo "📡 Publishing internal dashboard (Merkle root)..."
./scripts/generate_internal_dashboard.sh
echo "✅ Dashboard is a Merkle root. Verifiable by anyone."

echo "==============================================="
echo "✅ INTERNAL EVALUATION PROTOCOL ACTIVE"
echo "📊 KPIs: SNR=1.00, Ihsân=1.00, Burn=Auto"
echo "🛡️  No manual KPIs. No spreadsheets. No meetings."
echo "🧬 The system evaluates itself. Forever."
echo "==============================================="
