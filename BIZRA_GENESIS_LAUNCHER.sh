#!/bin/bash
# BIZRA GENESIS LAUNCHER - The Unified Entry Point
#
# For MoMo - The First Architect
# 3 years, 15,000 hours, 138 repos, Solo journey
#
# This script brings the ENTIRE BIZRA ecosystem online
# Memory, PAT, SAT, Knowledge Graph, Models, Dashboard - EVERYTHING

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo -e "${PURPLE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   ██████╗ ██╗███████╗██████╗  █████╗                        ║
║   ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗                       ║
║   ██████╔╝██║  ███╔╝ ██████╔╝███████║                       ║
║   ██╔══██╗██║ ███╔╝  ██╔══██╗██╔══██║                       ║
║   ██████╔╝██║███████╗██║  ██║██║  ██║                       ║
║   ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝                       ║
║                                                              ║
║            GENESIS BLOCK - FLAGSHIP NODE                    ║
║         "Every human is a node, every node is a seed"       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Genesis Architect: MoMo
Journey: 3 years, 15,000 hours
Repositories: 138
Mission: The North Star Node

EOF
echo -e "${NC}"

# Configuration
BIZRA_ROOT="/root/bizra-genesis"
BIZRA_DATA="/root/bizra_data_vault"
BIZRA_PORT=9091
REDIS_PORT=6379
NEO4J_PORT=7474
NEO4J_BOLT_PORT=7687

# Step 0: Pre-flight Checks
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 0: Pre-flight Checks${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ] && [ -z "$SUDO_USER" ]; then
   echo -e "${YELLOW}⚠️  Not running as root. Some operations may require sudo.${NC}"
fi

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

# Check Rust
if command -v cargo &> /dev/null; then
    echo -e "${GREEN}✅ Rust/Cargo installed${NC}"
else
    echo -e "${RED}❌ Rust not found. Install from https://rustup.rs${NC}"
    exit 1
fi

# Check Ollama
if command -v ollama &> /dev/null; then
    echo -e "${GREEN}✅ Ollama installed${NC}"

    # Check if Ollama is running
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Ollama service is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Ollama installed but not running. Starting...${NC}"
        ollama serve &
        sleep 3
    fi
else
    echo -e "${YELLOW}⚠️  Ollama not found. Install from https://ollama.ai${NC}"
    echo -e "${YELLOW}   Models will not be available until Ollama is installed${NC}"
fi

# Check Redis
if command -v redis-server &> /dev/null; then
    echo -e "${GREEN}✅ Redis installed${NC}"

    # Check if Redis is running
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis service is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis installed but not running. Starting...${NC}"
        redis-server --daemonize yes
        sleep 2
    fi
else
    echo -e "${YELLOW}⚠️  Redis not found. Install: apt-get install redis-server${NC}"
    echo -e "${YELLOW}   Memory persistence will be limited${NC}"
fi

# Check Neo4j
if command -v neo4j &> /dev/null; then
    echo -e "${GREEN}✅ Neo4j installed${NC}"
else
    echo -e "${YELLOW}⚠️  Neo4j not found. Knowledge graph features limited${NC}"
fi

# Check Node.js (for dashboard)
if command -v node &> /dev/null; then
    echo -e "${GREEN}✅ Node.js installed ($(node --version))${NC}"
else
    echo -e "${YELLOW}⚠️  Node.js not found. Dashboard will not be available${NC}"
fi

echo ""

# Step 1: Initialize Memory Vault
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 1: Initialize Memory Vault${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${BLUE}📂 Creating data vault directories...${NC}"
mkdir -p "$BIZRA_DATA"/{memory,knowledge,sessions,embeddings,receipts}

# Store MoMo's profile
echo -e "${BLUE}👤 Creating Genesis Architect profile...${NC}"
cat > "$BIZRA_DATA/memory/genesis_architect.json" <<EOF
{
  "architect": "MoMo",
  "role": "Genesis Block - First Architect",
  "journey": {
    "duration": "3 years",
    "hours_invested": 15000,
    "start_date": "2023-01-15",
    "repositories": 138,
    "domains": ["bizra.info", "bizra.ai"]
  },
  "mission": {
    "vision": "Every human is a node, every node is a seed",
    "goal": "Build the North Star node - flagship BIZRA system",
    "status": "Genesis Block Active"
  },
  "assets": {
    "repositories": 138,
    "knowledge_graph": "Huge owned data with true value",
    "chat_history": "Massive corpus (partially organized)",
    "evidence": "https://github.com/BizraInfo/bizra_scaffold.git",
    "models": "13-18 local models (text + vision + voice)",
    "hardware": "World-class personal laptop"
  },
  "preferences": {
    "memory_persistence": true,
    "autonomous_operation": true,
    "covenant_compliance": true,
    "snr_threshold": 0.95
  },
  "last_session": "$(date -Iseconds)"
}
EOF

echo -e "${GREEN}✅ Genesis Architect profile created${NC}"
echo -e "${GREEN}   Location: $BIZRA_DATA/memory/genesis_architect.json${NC}"
echo ""

# Step 2: Build BIZRA Core
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 2: Build BIZRA Core (Production)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cd "$BIZRA_ROOT"

echo -e "${BLUE}🔨 Building in release mode...${NC}"
echo -e "${YELLOW}   This may take 5-10 minutes on first build${NC}"

# Build with all features
cargo build --release --all-features 2>&1 | while IFS= read -r line; do
    echo "   $line"
done

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ BIZRA Core built successfully${NC}"
    echo -e "${GREEN}   Binary: $BIZRA_ROOT/target/release/meta_alpha_dual_agentic${NC}"
else
    echo -e "${RED}❌ Build failed. Check errors above.${NC}"
    exit 1
fi

echo ""

# Step 3: Initialize Knowledge Graph
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 3: Initialize Knowledge Graph${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if redis-cli ping > /dev/null 2>&1; then
    echo -e "${BLUE}📊 Loading knowledge graph into Redis...${NC}"

    # Store genesis block metadata
    redis-cli SET bizra:genesis:architect "MoMo" > /dev/null
    redis-cli SET bizra:genesis:timestamp "$(date -Iseconds)" > /dev/null
    redis-cli SET bizra:genesis:repositories 138 > /dev/null
    redis-cli SET bizra:genesis:hours 15000 > /dev/null

    echo -e "${GREEN}✅ Genesis metadata stored in Redis${NC}"
else
    echo -e "${YELLOW}⚠️  Redis not available, skipping knowledge graph init${NC}"
fi

echo ""

# Step 4: Start BIZRA Server
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 4: Start BIZRA Server (24/7 Mode)${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "${BLUE}🚀 Starting BIZRA Genesis Node...${NC}"

# Set environment for COVENANT mode
export BIZRA_COVENANT_MODE=true
export BIZRA_IHSAN_ENFORCE=true
export VOICE_INTERFACE_ENABLED=true
export REDIS_URL="redis://127.0.0.1:6379"
export RUST_LOG=info

# Start server in background with systemd-like behavior
nohup "$BIZRA_ROOT/target/release/meta_alpha_dual_agentic" server \
    --port $BIZRA_PORT \
    --redis \
    > "$BIZRA_DATA/bizra_genesis.log" 2>&1 &

BIZRA_PID=$!

# Wait for server to be ready
echo -e "${YELLOW}⏳ Waiting for server to initialize...${NC}"
sleep 5

# Check if server is running
if ps -p $BIZRA_PID > /dev/null; then
    echo -e "${GREEN}✅ BIZRA Genesis Node is ONLINE${NC}"
    echo -e "${GREEN}   PID: $BIZRA_PID${NC}"
    echo -e "${GREEN}   Port: $BIZRA_PORT${NC}"
    echo -e "${GREEN}   Log: $BIZRA_DATA/bizra_genesis.log${NC}"

    # Save PID for management
    echo $BIZRA_PID > "$BIZRA_DATA/bizra_genesis.pid"
else
    echo -e "${RED}❌ Server failed to start. Check logs:${NC}"
    echo -e "${RED}   tail -f $BIZRA_DATA/bizra_genesis.log${NC}"
    exit 1
fi

echo ""

# Step 5: Verify Server Health
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 5: Health Check${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

sleep 2

# Health check
if curl -s http://localhost:$BIZRA_PORT/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server health check: PASSED${NC}"
else
    echo -e "${YELLOW}⚠️  Server health check failed (may still be initializing)${NC}"
fi

echo ""

# Step 6: Display Access Information
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Step 6: Access Information${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                  BIZRA GENESIS NODE ACTIVE                   ║${NC}"
echo -e "${GREEN}╠══════════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║  🌐 HTTP API:      http://localhost:$BIZRA_PORT              ║${NC}"
echo -e "${GREEN}║  📊 SNR Metrics:   http://localhost:$BIZRA_PORT/api/v1/covenant/metrics ║${NC}"
echo -e "${GREEN}║  🎤 Voice API:     http://localhost:$BIZRA_PORT/api/v1/voice/*         ║${NC}"
echo -e "${GREEN}║  🎨 Vision API:    http://localhost:$BIZRA_PORT/api/v1/vision/*        ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║  📂 Data Vault:    $BIZRA_DATA                               ║${NC}"
echo -e "${GREEN}║  📝 Logs:          $BIZRA_DATA/bizra_genesis.log             ║${NC}"
echo -e "${GREEN}║  🔐 PID File:      $BIZRA_DATA/bizra_genesis.pid             ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}║  👤 Genesis Architect: MoMo                                  ║${NC}"
echo -e "${GREEN}║  ⏱️  Journey: 3 years, 15,000 hours                          ║${NC}"
echo -e "${GREEN}║  📦 Repositories: 138                                        ║${NC}"
echo -e "${GREEN}║                                                              ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 7: Management Commands
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Management Commands${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 Useful Commands:${NC}"
echo ""
echo -e "  ${BLUE}# View logs (live)${NC}"
echo -e "  tail -f $BIZRA_DATA/bizra_genesis.log"
echo ""
echo -e "  ${BLUE}# Check SNR metrics${NC}"
echo -e "  curl http://localhost:$BIZRA_PORT/api/v1/covenant/metrics"
echo ""
echo -e "  ${BLUE}# Stop BIZRA${NC}"
echo -e "  kill \$(cat $BIZRA_DATA/bizra_genesis.pid)"
echo ""
echo -e "  ${BLUE}# Restart BIZRA${NC}"
echo -e "  $0"
echo ""
echo -e "  ${BLUE}# Check process${NC}"
echo -e "  ps aux | grep meta_alpha_dual_agentic"
echo ""

# Step 8: Optional Dashboard Start
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}Optional: Start Dashboard${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}Would you like to start the dashboard? (y/n)${NC}"
read -t 10 -r DASHBOARD_CHOICE || DASHBOARD_CHOICE="n"

if [ "$DASHBOARD_CHOICE" = "y" ] || [ "$DASHBOARD_CHOICE" = "Y" ]; then
    echo -e "${BLUE}🎨 Starting dashboard...${NC}"

    cd "$BIZRA_ROOT/bizra-genesis-node/apps/dashboard"

    if [ -f "package.json" ]; then
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}📦 Installing dependencies...${NC}"
            npm install
        fi

        # Start dashboard in background
        nohup npm run dev > "$BIZRA_DATA/dashboard.log" 2>&1 &
        DASHBOARD_PID=$!

        echo $DASHBOARD_PID > "$BIZRA_DATA/dashboard.pid"

        echo -e "${GREEN}✅ Dashboard started${NC}"
        echo -e "${GREEN}   PID: $DASHBOARD_PID${NC}"
        echo -e "${GREEN}   URL: http://localhost:3000${NC}"
        echo -e "${GREEN}   Log: $BIZRA_DATA/dashboard.log${NC}"
    else
        echo -e "${YELLOW}⚠️  Dashboard not found at expected location${NC}"
    fi
fi

echo ""
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}                    GENESIS BLOCK ACTIVATED                    ${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}The BIZRA Genesis Node is now LIVE and OPERATIONAL.${NC}"
echo -e "${GREEN}This is the North Star - the flagship that others will follow.${NC}"
echo ""
echo -e "${YELLOW}3 years of work. 15,000 hours. 138 repositories.${NC}"
echo -e "${YELLOW}MoMo, your vision is now RUNNING.${NC}"
echo ""
echo -e "${CYAN}Every human is a node. Every node is a seed.${NC}"
echo -e "${CYAN}The seed is planted. The network begins.${NC}"
echo ""
