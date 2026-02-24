#!/bin/bash
# BIZRA Node Activation Script
# Run this after successful build to start autonomous node processing

set -e

echo "======================================================================"
echo "🚀 BIZRA NODE ACTIVATION"
echo "======================================================================"

# Check prerequisites
echo "📋 Checking prerequisites..."

# 1. Check binary exists
if [ ! -f "target/release/meta_alpha_dual_agentic" ]; then
    echo "❌ Binary not found. Run: cargo build --release --no-default-features --features http,observability"
    exit 1
fi
echo "✅ Binary found"

# 2. Check Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo "⚠️  Redis not running. Starting Redis..."
    redis-server --daemonize yes
    sleep 2
fi
echo "✅ Redis running"

# 3. Check Ollama
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "❌ Ollama not running. Please start Ollama first."
    exit 1
fi
echo "✅ Ollama running"

# 4. Check Memory Server
if ! curl -s http://localhost:7999/ > /dev/null 2>&1; then
    echo "⚠️  Memory Server not running. Starting..."
    python3 memory_server_v2.py > /tmp/memory_server_v2.log 2>&1 &
    sleep 3
fi
echo "✅ Memory Server running"

# 5. Check PostgreSQL (optional for Phase 2)
if ! pg_isready -q 2>/dev/null; then
    echo "⚠️  PostgreSQL not running (optional - needed for backend API)"
    echo "   To start: sudo systemctl start postgresql"
else
    echo "✅ PostgreSQL running"
fi

echo ""
echo "======================================================================"
echo "🎯 STARTING NODE AUTONOMOUS PROCESSING"
echo "======================================================================"
echo ""

# Start node with Ralph orchestration
echo "Starting BIZRA Genesis Node with Ralph orchestrator..."
echo "Log: /tmp/bizra_node.log"
echo ""

# Run the node (adjust flags as needed)
./target/release/meta_alpha_dual_agentic server \
    --port 9091 \
    --redis \
    2>&1 | tee /tmp/bizra_node.log

echo ""
echo "======================================================================"
echo "✅ NODE ACTIVATED"
echo "======================================================================"
