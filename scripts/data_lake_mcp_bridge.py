#!/usr/bin/env python3
"""
BIZRA Data Lake MCP Bridge
===========================
HTTPS MCP Server exposing the BIZRA Data Lake Hypergraph (709k nodes)
for technical context, project history, and architectural decisions.

Port: 8443 (TLS)
Protocol: MCP JSON-RPC 2.0

Usage:
    python3 scripts/data_lake_mcp_bridge.py

Environment Variables:
    BIZRA_MCP_PORT: Server port (default: 8443)
    BIZRA_MCP_HOST: Bind address (default: 0.0.0.0)
    BIZRA_MCP_CERT: Path to TLS certificate
    BIZRA_MCP_KEY: Path to TLS private key
"""

import asyncio
import json
import logging
import ssl
import os
import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field
import hashlib

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from aiohttp import web
except ImportError:
    print("❌ Error: 'aiohttp' is not installed.")
    print("Please run: pip install aiohttp")
    sys.exit(1)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
)
logger = logging.getLogger("bizra.mcp.bridge")


# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

MCP_PORT = int(os.getenv("BIZRA_MCP_PORT", "8443"))
MCP_HOST = os.getenv("BIZRA_MCP_HOST", "0.0.0.0")
CERT_PATH = os.getenv("BIZRA_MCP_CERT", "/root/bizra-genesis/certs/server.crt")
KEY_PATH = os.getenv("BIZRA_MCP_KEY", "/root/bizra-genesis/certs/server.key")

# ─────────────────────────────────────────────────────────────────────────────
# Data Lake paths - Windows via WSL mount
# Primary: C:\BIZRA-DATA-LAKE (56k nodes, 88k edges)
# Fallback: Local WSL copies
# ─────────────────────────────────────────────────────────────────────────────
DATA_LAKE_ROOT = Path(os.getenv("DATA_LAKE_PATH", "/mnt/c/BIZRA-DATA-LAKE"))
BIZRA_MAIN_PATH = Path(os.getenv("BIZRA_MAIN_PATH", "/mnt/c/BIZRA-Dual-Agentic-system--main"))

# Primary Data Lake sources (Windows mount)
GRAPH_NODES_PATH = DATA_LAKE_ROOT / "03_INDEXED/graph/nodes.jsonl"
GRAPH_EDGES_PATH = DATA_LAKE_ROOT / "03_INDEXED/graph/edges.jsonl"
GOLD_LEDGER_PATH = DATA_LAKE_ROOT / "04_GOLD/poi_ledger.jsonl"
GOLD_GEMS_PATH = DATA_LAKE_ROOT / "04_GOLD/golden_gems_v2.jsonl"

# Fallback paths (local WSL)
KNOWLEDGE_BASE_PATH = Path("/root/bizra-genesis/bizra-genesis-node/knowledge/REFINED_KNOWLEDGE_BASE.json")
LEDGER_PATH = Path("/root/bizra-genesis/BIZRA_KNOWLEDGE_LEDGER.jsonl")
MANIFEST_PATH = Path("/root/bizra-genesis/BIZRA_COMPLETE_MANIFEST_AND_MAPTREE.md")


# ─────────────────────────────────────────────────────────────────────────────
# Data Lake Backend
# ─────────────────────────────────────────────────────────────────────────────

class DataLakeHypergraph:
    """
    BIZRA Data Lake Hypergraph backend.
    Provides semantic search over 56k+ nodes, 88k+ edges from C:\BIZRA-DATA-LAKE
    """
    
    def __init__(self):
        self.nodes: List[Dict[str, Any]] = []
        self.edges: List[Dict[str, Any]] = []
        self.node_count = 0
        self.edge_count = 0
        self.loaded = False
        self.index: Dict[str, List[int]] = {}  # keyword -> node indices
        
    async def load(self) -> bool:
        """Load the hypergraph data from Windows Data Lake via WSL mount."""
        try:
            # PRIMARY: Load from Windows Data Lake (C:\BIZRA-DATA-LAKE)
            if GRAPH_NODES_PATH.exists():
                logger.info(f"Loading graph nodes from {GRAPH_NODES_PATH}")
                with open(GRAPH_NODES_PATH, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        try:
                            node = json.loads(line.strip())
                            self.nodes.append(node)
                        except:
                            continue
                logger.info(f"  ✓ Loaded {len(self.nodes):,} nodes from graph")
                
            if GRAPH_EDGES_PATH.exists():
                logger.info(f"Loading graph edges from {GRAPH_EDGES_PATH}")
                with open(GRAPH_EDGES_PATH, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        try:
                            edge = json.loads(line.strip())
                            self.edges.append(edge)
                        except:
                            continue
                self.edge_count = len(self.edges)
                logger.info(f"  ✓ Loaded {self.edge_count:,} edges from graph")
                
            # Load Gold Layer gems
            if GOLD_GEMS_PATH.exists():
                logger.info(f"Loading golden gems from {GOLD_GEMS_PATH}")
                with open(GOLD_GEMS_PATH, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        try:
                            gem = json.loads(line.strip())
                            gem['_source'] = 'gold_layer'
                            self.nodes.append(gem)
                        except:
                            continue
                            
            # Load PoI ledger
            if GOLD_LEDGER_PATH.exists():
                logger.info(f"Loading PoI ledger from {GOLD_LEDGER_PATH}")
                with open(GOLD_LEDGER_PATH, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        try:
                            entry = json.loads(line.strip())
                            entry['_source'] = 'poi_ledger'
                            self.nodes.append(entry)
                        except:
                            continue
            
            # FALLBACK: Load local knowledge if Windows mount has no data
            if len(self.nodes) == 0 and KNOWLEDGE_BASE_PATH.exists():
                logger.warning(f"No Windows data found, falling back to local: {KNOWLEDGE_BASE_PATH}")
                with open(KNOWLEDGE_BASE_PATH, 'r', encoding='utf-8', errors='ignore') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self.nodes.extend(data)
                    elif isinstance(data, dict):
                        self.nodes.extend(data.get("nodes", data.get("entries", [data])))
                        
            # Load local ledger entries
            if LEDGER_PATH.exists():
                logger.info(f"Loading local ledger from {LEDGER_PATH}")
                with open(LEDGER_PATH, 'r', encoding='utf-8', errors='ignore') as f:
                    for line in f:
                        try:
                            entry = json.loads(line.strip())
                            self.nodes.append(entry)
                        except:
                            continue
                            
            # Index nodes for fast search
            await self._build_index()
            
            self.node_count = len(self.nodes)
            self.loaded = True
            logger.info(f"✅ Loaded {self.node_count:,} hypergraph nodes")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load hypergraph: {e}")
            return False
            
    async def _build_index(self) -> None:
        """Build inverted index for keyword search."""
        for i, node in enumerate(self.nodes):
            text = json.dumps(node).lower()
            words = set(text.split())
            for word in words:
                if len(word) >= 3:
                    clean = ''.join(c for c in word if c.isalnum())
                    if clean:
                        if clean not in self.index:
                            self.index[clean] = []
                        self.index[clean].append(i)
                        
    def search(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Search the hypergraph for relevant nodes."""
        if not self.loaded:
            return []
            
        query_lower = query.lower()
        query_terms = [t for t in query_lower.split() if len(t) >= 3]
        
        # Score nodes by term matches
        scores: Dict[int, float] = {}
        
        for term in query_terms:
            clean = ''.join(c for c in term if c.isalnum())
            if clean in self.index:
                for idx in self.index[clean]:
                    scores[idx] = scores.get(idx, 0) + 1.0
                    
        # Also do fuzzy match for nodes with full query in text
        for i, node in enumerate(self.nodes[:10000]):  # Limit full scan
            text = json.dumps(node).lower()
            if query_lower in text:
                scores[i] = scores.get(i, 0) + 5.0
                
        # Sort by score and return top results
        sorted_nodes = sorted(scores.items(), key=lambda x: x[1], reverse=True)[:limit]
        
        results = []
        for idx, score in sorted_nodes:
            node = self.nodes[idx].copy()
            node["_relevance_score"] = score
            results.append(node)
            
        return results


# Global hypergraph instance
hypergraph = DataLakeHypergraph()


# ─────────────────────────────────────────────────────────────────────────────
# MCP Tools
# ─────────────────────────────────────────────────────────────────────────────

MCP_TOOLS = {
    "knowledge_retrieve": {
        "name": "knowledge_retrieve",
        "description": "Query the BIZRA Data Lake Hypergraph (709k nodes) for technical context, project history, and architectural decisions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Natural language query to search the knowledge graph"
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of results (default: 20)",
                    "default": 20
                }
            },
            "required": ["query"]
        }
    }
}


async def handle_knowledge_retrieve(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Handle knowledge_retrieve tool call."""
    query = arguments.get("query", "")
    limit = arguments.get("limit", 20)
    
    if not query:
        return {
            "error": "Query parameter is required",
            "results": []
        }
        
    results = hypergraph.search(query, limit)
    
    return {
        "query": query,
        "total_nodes": hypergraph.node_count,
        "results_count": len(results),
        "results": results,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


# ─────────────────────────────────────────────────────────────────────────────
# MCP Protocol Handler
# ─────────────────────────────────────────────────────────────────────────────

async def handle_mcp_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """Handle MCP JSON-RPC 2.0 request."""
    jsonrpc = request_data.get("jsonrpc", "2.0")
    method = request_data.get("method", "")
    params = request_data.get("params", {})
    req_id = request_data.get("id")
    
    response = {
        "jsonrpc": "2.0",
        "id": req_id
    }
    
    try:
        if method == "initialize":
            response["result"] = {
                "protocolVersion": "2024-11-05",
                "serverInfo": {
                    "name": "bizra-data-lake",
                    "version": "1.0.0"
                },
                "capabilities": {
                    "tools": {},
                    "resources": {}
                }
            }
            
        elif method == "tools/list":
            response["result"] = {
                "tools": list(MCP_TOOLS.values())
            }
            
        elif method == "tools/call":
            tool_name = params.get("name", "")
            arguments = params.get("arguments", {})
            
            if tool_name == "knowledge_retrieve":
                result = await handle_knowledge_retrieve(arguments)
                response["result"] = {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(result, indent=2)
                        }
                    ]
                }
            else:
                response["error"] = {
                    "code": -32601,
                    "message": f"Unknown tool: {tool_name}"
                }
                
        elif method == "resources/list":
            response["result"] = {
                "resources": []
            }
            
        elif method == "prompts/list":
            response["result"] = {
                "prompts": []
            }
            
        else:
            response["error"] = {
                "code": -32601,
                "message": f"Method not found: {method}"
            }
            
    except Exception as e:
        logger.error(f"Error handling request: {e}", exc_info=True)
        response["error"] = {
            "code": -32603,
            "message": str(e)
        }
        
    return response


# ─────────────────────────────────────────────────────────────────────────────
# HTTP Server
# ─────────────────────────────────────────────────────────────────────────────

async def mcp_handler(request: web.Request) -> web.Response:
    """Handle incoming MCP requests."""
    try:
        data = await request.json()
        response = await handle_mcp_request(data)
        return web.json_response(response)
    except json.JSONDecodeError:
        return web.json_response({
            "jsonrpc": "2.0",
            "id": None,
            "error": {
                "code": -32700,
                "message": "Parse error"
            }
        }, status=400)
    except Exception as e:
        logger.error(f"Request error: {e}", exc_info=True)
        return web.json_response({
            "jsonrpc": "2.0",
            "id": None,
            "error": {
                "code": -32603,
                "message": str(e)
            }
        }, status=500)


async def health_handler(request: web.Request) -> web.Response:
    """Health check endpoint."""
    return web.json_response({
        "status": "healthy",
        "nodes": hypergraph.node_count,
        "loaded": hypergraph.loaded,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


async def info_handler(request: web.Request) -> web.Response:
    """Server info page."""
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>BIZRA Data Lake MCP Bridge</title>
    <style>
        body {{ font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #0a0a0a; color: #e0e0e0; }}
        h1 {{ color: #4CAF50; }}
        code {{ background: #1a1a1a; padding: 2px 6px; border-radius: 4px; color: #ffab40; }}
        pre {{ background: #1a1a1a; padding: 16px; border-radius: 8px; overflow-x: auto; color: #a0a0a0; }}
        .status {{ color: #4CAF50; font-weight: bold; }}
        .badge {{ display: inline-block; padding: 4px 12px; background: #4CAF50; color: white; border-radius: 20px; font-size: 14px; }}
    </style>
</head>
<body>
    <h1>🔒 BIZRA Data Lake MCP Bridge</h1>
    <p><span class="badge">Status: ● ONLINE</span></p>
    <ul>
        <li><strong>Protocol:</strong> HTTPS (TLS)</li>
        <li><strong>Port:</strong> {MCP_PORT}</li>
        <li><strong>Method:</strong> POST only (MCP JSON-RPC 2.0)</li>
        <li><strong>Nodes:</strong> {hypergraph.node_count:,}</li>
    </ul>
    
    <h2>📦 Available Tools</h2>
    <h3><code>knowledge_retrieve</code></h3>
    <p>Query the BIZRA Data Lake Hypergraph ({hypergraph.node_count:,} nodes) for technical context, project history, and architectural decisions.</p>
    
    <h2>🔗 Usage Example</h2>
    <pre>curl -k -X POST https://localhost:{MCP_PORT} \\
  -H "Content-Type: application/json" \\
  -d '{{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {{
      "name": "knowledge_retrieve",
      "arguments": {{"query": "BIZRA architecture"}}
    }},
    "id": 1
  }}'</pre>
    
    <h2>⚙️ MCP Client Configuration</h2>
    <pre>{{
  "mcpServers": {{
    "bizra-data-lake": {{
      "url": "https://localhost:{MCP_PORT}",
      "transport": "http"
    }}
  }}
}}</pre>
</body>
</html>"""
    return web.Response(text=html, content_type='text/html')


def generate_self_signed_cert():
    """Generate self-signed certificate if not exists."""
    cert_dir = Path(CERT_PATH).parent
    cert_dir.mkdir(parents=True, exist_ok=True)
    
    if not Path(CERT_PATH).exists() or not Path(KEY_PATH).exists():
        import subprocess
        logger.info("Generating self-signed certificate...")
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:4096",
            "-keyout", KEY_PATH,
            "-out", CERT_PATH,
            "-days", "365",
            "-nodes",
            "-subj", "/CN=localhost/O=BIZRA/OU=DataLake"
        ], check=True)
        logger.info(f"✅ Certificate generated: {CERT_PATH}")


async def start_server():
    """Start the MCP bridge server."""
    # Load hypergraph data
    logger.info("Loading BIZRA Data Lake Hypergraph...")
    await hypergraph.load()
    
    # Create app
    app = web.Application()
    app.router.add_get("/", info_handler)
    app.router.add_get("/health", health_handler)
    app.router.add_post("/", mcp_handler)
    
    # Setup SSL
    ssl_context = None
    if Path(CERT_PATH).exists() and Path(KEY_PATH).exists():
        ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        ssl_context.load_cert_chain(CERT_PATH, KEY_PATH)
        logger.info(f"🔒 TLS enabled with {CERT_PATH}")
    else:
        logger.warning("⚠️ No TLS certificates found, generating self-signed...")
        try:
            generate_self_signed_cert()
            ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            ssl_context.load_cert_chain(CERT_PATH, KEY_PATH)
            logger.info(f"🔒 TLS enabled with self-signed cert")
        except Exception as e:
            logger.error(f"Failed to generate cert: {e}")
            logger.warning("⚠️ Running without TLS (HTTP only)")
    
    # Start server
    runner = web.AppRunner(app)
    await runner.setup()
    
    site = web.TCPSite(runner, MCP_HOST, MCP_PORT, ssl_context=ssl_context)
    await site.start()
    
    protocol = "https" if ssl_context else "http"
    logger.info(f"""
╔══════════════════════════════════════════════════════════════╗
║  🔒 BIZRA Data Lake MCP Bridge                               ║
║  Status: ● ONLINE                                            ║
║  URL: {protocol}://{MCP_HOST}:{MCP_PORT:<36}║
║  Nodes: {hypergraph.node_count:,} hypergraph nodes loaded{' ' * (40 - len(f'{hypergraph.node_count:,}'))}║
╚══════════════════════════════════════════════════════════════╝
""")
    
    # Keep running
    while True:
        await asyncio.sleep(3600)


def main():
    """Main entry point."""
    try:
        asyncio.run(start_server())
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    except Exception as e:
        logger.error(f"Server error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
