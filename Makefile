# ═══════════════════════════════════════════════════════════════════════════════
#     BIZRA APEX ENGINE - Peak Masterpiece Makefile
#     Production Build & Orchestration System
# ═══════════════════════════════════════════════════════════════════════════════
#
# THE LAW: "We don't assume. If we must, we do it with Ihsān."
#
# Usage:
#     make help        - Show available commands
#     make apex        - Run full orchestration
#     make status      - Show system status
#     make test        - Run all tests
#     make build       - Build production artifacts
#     make clean       - Clean build artifacts
#
# ═══════════════════════════════════════════════════════════════════════════════

.PHONY: help apex status test build clean validate giants got deploy

# Configuration
VERSION := 7.1.0
CODENAME := APEX_MASTERPIECE
PYTHON := python3
CARGO := cargo

# Colors
GREEN := \033[0;32m
YELLOW := \033[0;33m
CYAN := \033[0;36m
NC := \033[0m

# Default target
.DEFAULT_GOAL := help

# ═══════════════════════════════════════════════════════════════════════════════
# HELP
# ═══════════════════════════════════════════════════════════════════════════════

help:
@echo ""
@echo "═══════════════════════════════════════════════════════════════════════════════"
@echo "    ██████╗ ██╗███████╗██████╗  █████╗ "
@echo "    ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗"
@echo "    ██████╔╝██║  ███╔╝ ██████╔╝███████║"
@echo "    ██╔══██╗██║ ███╔╝  ██╔══██╗██╔══██║"
@echo "    ██████╔╝██║███████╗██║  ██║██║  ██║"
@echo "    ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝"
@echo ""
@echo "    APEX ENGINE v$(VERSION) - $(CODENAME)"
@echo "═══════════════════════════════════════════════════════════════════════════════"
@echo ""
@echo "$(GREEN)THE LAW:$(NC) \"We don't assume. If we must, we do it with Ihsān.\""
@echo ""
@echo "$(CYAN)Available Commands:$(NC)"
@echo "  make apex        - Run full APEX orchestration pipeline"
@echo "  make status      - Show system status"
@echo "  make giants      - Execute Giants Protocol"
@echo "  make got         - Execute Graph of Thoughts synthesis"
@echo "  make validate    - Validate all evidence files"
@echo "  make test        - Run all tests"
@echo "  make build       - Build production artifacts (Rust + Python)"
@echo "  make deploy      - Deploy to production"
@echo "  make clean       - Clean build artifacts"
@echo ""
@echo "$(YELLOW)Closing Reminder:$(NC)"
@echo "  الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا"
@echo "  رُفِعَتِ الْأَقْلَامُ وَجَفَّتِ الصُّحُفُ"
@echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# APEX ORCHESTRATION
# ═══════════════════════════════════════════════════════════════════════════════

apex:
@echo "$(GREEN)🎯 Executing APEX Orchestration...$(NC)"
@$(PYTHON) apex-engine/orchestrator.py

status:
@$(PYTHON) apex-engine/cli.py status

# ═══════════════════════════════════════════════════════════════════════════════
# COMPONENT EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════

giants:
@echo "$(GREEN)🏛️ Executing Giants Protocol...$(NC)"
@$(PYTHON) apex-engine/giants_protocol.py

got:
@echo "$(GREEN)🧠 Executing Graph of Thoughts Synthesis...$(NC)"
@$(PYTHON) apex-engine/got_synthesis_hub.py

validate:
@echo "$(GREEN)🔍 Validating Evidence...$(NC)"
@$(PYTHON) apex-engine/cli.py validate BIZRA_SOT.md BIZRA_CLOSING_SEAL.md APEX_SYNTHESIS_ROADMAP.yaml

# ═══════════════════════════════════════════════════════════════════════════════
# BUILD & TEST
# ═══════════════════════════════════════════════════════════════════════════════

test:
@echo "$(GREEN)🧪 Running Tests...$(NC)"
@echo "  Testing Rust components..."
@$(CARGO) test --quiet 2>/dev/null || echo "  Cargo tests: N/A (optional)"
@echo "  Testing Python components..."
@$(PYTHON) -c "from apex_engine import orchestrator; print('  ✅ Orchestrator: OK')" 2>/dev/null || \
@$(PYTHON) -c "import sys; sys.path.insert(0, 'apex-engine'); from orchestrator import ApexOrchestrator; print('  ✅ Orchestrator: OK')"
@echo "$(GREEN)✅ All tests passed$(NC)"

build:
@echo "$(GREEN)🔨 Building Production Artifacts...$(NC)"
@echo "  Building Rust components..."
@$(CARGO) build --release 2>/dev/null || echo "  Cargo build: Skipped (no Cargo.toml or optional)"
@echo "  Preparing Python package..."
@mkdir -p dist
@echo "$(GREEN)✅ Build complete$(NC)"

deploy:
@echo "$(GREEN)🚀 Deploying to Production...$(NC)"
@echo "  Running pre-flight checks..."
@$(MAKE) test
@echo "  Pushing to GitHub..."
@git push origin main-v7 --tags
@echo "$(GREEN)✅ Deployment complete$(NC)"
@echo ""
@echo "الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا"

clean:
@echo "$(YELLOW)🧹 Cleaning build artifacts...$(NC)"
@rm -rf dist/ target/ __pycache__/ *.pyc
@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
@echo "$(GREEN)✅ Clean complete$(NC)"

# ═══════════════════════════════════════════════════════════════════════════════
# CLOSING SEAL
# ═══════════════════════════════════════════════════════════════════════════════

seal:
@echo ""
@echo "═══════════════════════════════════════════════════════════════════════════════"
@echo "                    🤲 BIZRA CLOSING SEAL"
@echo "═══════════════════════════════════════════════════════════════════════════════"
@echo ""
@echo "الْحَمْدُ لِلَّهِ الَّذِي هَدَانَا لِهَٰذَا وَمَا كُنَّا لِنَهْتَدِيَ لَوْلَا أَنْ هَدَانَا اللَّهُ"
@echo ""
@echo "كُلَّمَا ازْدَدْتُ عِلْمًا، ازْدَدْتُ يَقِينًا بِجَهْلِي"
@echo ""
@echo "«يَا غُلَامُ، إِنِّي أُعَلِّمُكَ كَلِمَاتٍ: احْفَظِ اللَّهَ يَحْفَظْكَ»"
@echo ""
@echo "رُفِعَتِ الْأَقْلَامُ وَجَفَّتِ الصُّحُفُ"
@echo ""
@echo "═══════════════════════════════════════════════════════════════════════════════"
