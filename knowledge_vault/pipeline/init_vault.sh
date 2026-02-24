#!/bin/bash
# ============================================
# BIZRA Knowledge Vault - Initialization Script
# ============================================

set -e

VAULT_ROOT="$(dirname "$(dirname "$(readlink -f "$0")")")"
echo "🏗️  Initializing BIZRA Knowledge Vault at: $VAULT_ROOT"

# Create directory structure
echo "📁 Creating directory structure..."

mkdir -p "$VAULT_ROOT/raw/repos"
mkdir -p "$VAULT_ROOT/raw/chats"
mkdir -p "$VAULT_ROOT/raw/pdfs"
mkdir -p "$VAULT_ROOT/raw/notes"
mkdir -p "$VAULT_ROOT/raw/media/images"
mkdir -p "$VAULT_ROOT/raw/media/videos"
mkdir -p "$VAULT_ROOT/raw/media/audio"
mkdir -p "$VAULT_ROOT/raw/exports"

mkdir -p "$VAULT_ROOT/derived/text"
mkdir -p "$VAULT_ROOT/derived/chunks"
mkdir -p "$VAULT_ROOT/derived/embeddings"
mkdir -p "$VAULT_ROOT/derived/entities"
mkdir -p "$VAULT_ROOT/derived/assertions"

mkdir -p "$VAULT_ROOT/index"
mkdir -p "$VAULT_ROOT/graph/neo4j"
mkdir -p "$VAULT_ROOT/graph/snapshots"
mkdir -p "$VAULT_ROOT/logs"

# Create .gitkeep files
find "$VAULT_ROOT" -type d -empty -exec touch {}/.gitkeep \;

# Create .gitignore
echo "📝 Creating .gitignore..."
cat > "$VAULT_ROOT/.gitignore" << 'EOF'
# Raw data (too large for git)
raw/

# Derived data (reproducible)
derived/
index/
graph/

# Logs
logs/*.log

# R pipeline cache
pipeline/_targets/
pipeline/.Rproj.user/

# Secrets
.env
*.key
EOF

# Create environment template
echo "📝 Creating .env.template..."
cat > "$VAULT_ROOT/.env.template" << 'EOF'
# BIZRA Knowledge Vault - Environment Variables

# LLM API Keys (for entity extraction)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Graph Database
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=

# Vector Database (optional)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
EOF

# Verify R installation
echo "🔍 Checking R installation..."
if command -v Rscript &> /dev/null; then
    R_VERSION=$(Rscript --version 2>&1 | head -1)
    echo "✅ R found: $R_VERSION"
else
    echo "⚠️  R not found. Please install R to run the pipeline."
    echo "   Ubuntu: sudo apt install r-base"
    echo "   macOS: brew install r"
fi

# Summary
echo ""
echo "✅ BIZRA Knowledge Vault initialized!"
echo ""
echo "📂 Directory structure:"
echo "   raw/      - Place your source files here"
echo "   derived/  - Generated artifacts (auto)"
echo "   index/    - Queryable parquet files (auto)"
echo "   graph/    - Knowledge graph exports (auto)"
echo "   logs/     - Pipeline logs"
echo ""
echo "🚀 Next steps:"
echo "   1. Copy .env.template to .env and fill in API keys"
echo "   2. Configure sources in config/sources.yaml"
echo "   3. Run: Rscript pipeline/run.R"
echo ""
