#!/usr/bin/env python3
"""
BIZRA Memory Server V2 - With Knowledge Graph Search
Loads MoMo's context and provides searchable access to knowledge graph

Usage: python3 memory_server_v2.py
Access: http://localhost:7999
"""

import json
import os
from pathlib import Path
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import re

# Global memory cache
MOMO_MEMORY = None
KNOWLEDGE_GRAPH_PATH = None
KNOWLEDGE_GRAPH = None  # Lazy loaded

def load_memory():
    """Load MoMo's persistent memory on startup"""
    global MOMO_MEMORY, KNOWLEDGE_GRAPH_PATH

    memory_path = Path("/root/bizra_data_vault/MOMO_GENESIS_ARCHITECT_MEMORY.json")

    with open(memory_path, 'r') as f:
        MOMO_MEMORY = json.load(f)

    KNOWLEDGE_GRAPH_PATH = Path(MOMO_MEMORY['assets']['knowledge_graph']['location'])

    print("=" * 70)
    print("🧠 BIZRA MEMORY SERVER V2 - WITH KNOWLEDGE GRAPH SEARCH")
    print("=" * 70)
    print(f"👤 Loaded memory for: {MOMO_MEMORY['architect']['name']}")
    print(f"   Role: {MOMO_MEMORY['architect']['role']}")
    print(f"   Journey: {MOMO_MEMORY['journey']['duration_years']} years, {MOMO_MEMORY['journey']['hours_invested']:,} hours")
    print(f"   Hardware: {MOMO_MEMORY['assets']['hardware']['description']}")
    print()
    print(f"📊 Data Sources:")
    print(f"   ✅ Knowledge Graph: {MOMO_MEMORY['assets']['knowledge_graph']['size']}")
    print(f"   ✅ Chat History: {MOMO_MEMORY['assets']['chat_history']['manifest_entries']} entries")
    print(f"   ✅ Receipts: {MOMO_MEMORY['assets']['execution_receipts']['total_receipts']} receipts")
    print()
    print(f"🌐 Server ready at: http://localhost:7999")
    print(f"   /memory - Get full memory context")
    print(f"   /architect - Get architect info")
    print(f"   /journey - Get journey stats")
    print(f"   /data - Get data sources info")
    print(f"   /kg/stats - Get knowledge graph stats")
    print(f"   /kg/search?q=<query>&limit=10 - Search knowledge graph 🔍")
    print(f"   /kg/chapter/<num> - Get specific Quran chapter")
    print("=" * 70)
    print()

def load_knowledge_graph():
    """Lazy load the knowledge graph (79MB)"""
    global KNOWLEDGE_GRAPH

    if KNOWLEDGE_GRAPH is not None:
        return KNOWLEDGE_GRAPH

    print(f"📖 Loading knowledge graph ({MOMO_MEMORY['assets']['knowledge_graph']['size']})...")
    start_time = datetime.now()

    with open(KNOWLEDGE_GRAPH_PATH, 'r') as f:
        KNOWLEDGE_GRAPH = json.load(f)

    elapsed = (datetime.now() - start_time).total_seconds()
    print(f"✅ Knowledge graph loaded in {elapsed:.2f}s")
    print(f"   Nodes: {len(KNOWLEDGE_GRAPH.get('nodes', []))}")
    print(f"   Edges: {len(KNOWLEDGE_GRAPH.get('edges', []))}")

    return KNOWLEDGE_GRAPH

def search_knowledge_graph(query, limit=10):
    """Search knowledge graph for query string"""
    kg = load_knowledge_graph()

    query_lower = query.lower()
    results = []

    # Search through nodes
    for node in kg.get('nodes', []):
        # Check if query matches node properties
        matches = []

        # Search in properties
        if 'properties' in node:
            for key, value in node['properties'].items():
                if isinstance(value, str) and query_lower in value.lower():
                    matches.append(f"{key}: {value}")

        # Search in node_type
        if 'node_type' in node and query_lower in node['node_type'].lower():
            matches.append(f"type: {node['node_type']}")

        # If we found matches, add to results
        if matches:
            results.append({
                'node_id': node.get('node_id'),
                'node_type': node.get('node_type'),
                'properties': node.get('properties', {}),
                'matches': matches,
                'confidence': node.get('confidence', 1.0),
                'evidence_hash': node.get('evidence_hash')
            })

        if len(results) >= limit:
            break

    return results

def get_chapter(chapter_num):
    """Get specific Quran chapter by number"""
    kg = load_knowledge_graph()

    for node in kg.get('nodes', []):
        if node.get('node_type') == 'Chapter':
            if node.get('properties', {}).get('number') == chapter_num:
                return node

    return None

class MemoryHandler(BaseHTTPRequestHandler):
    """HTTP request handler with KG search"""

    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {MOMO_MEMORY['architect']['name']}'s request: {format % args}")

    def send_json_response(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode())

    def do_GET(self):
        """Handle GET requests"""
        parsed_path = urlparse(self.path)
        path = parsed_path.path

        if path == '/':
            self.send_json_response({
                "service": "BIZRA Memory Server V2",
                "architect": MOMO_MEMORY['architect']['name'],
                "status": "ONLINE - Memory loaded and persistent",
                "message": f"Welcome back, {MOMO_MEMORY['architect']['name']}! Your context is loaded.",
                "capabilities": [
                    "Persistent memory across sessions",
                    "Knowledge graph search (79MB Islamic KG)",
                    "Chat history access (1831 files)",
                    "Execution receipt tracking (679 receipts)"
                ],
                "endpoints": [
                    "/memory", "/architect", "/journey", "/data",
                    "/kg/stats", "/kg/search?q=<query>&limit=10",
                    "/kg/chapter/<number>"
                ]
            })

        elif path == '/memory':
            self.send_json_response({
                "architect": MOMO_MEMORY['architect'],
                "journey": MOMO_MEMORY['journey'],
                "mission": MOMO_MEMORY['mission'],
                "pain_points": MOMO_MEMORY['pain_points'],
                "current_priorities": MOMO_MEMORY['current_priorities'],
                "message": "This is your persistent memory - it remembers you across all sessions"
            })

        elif path == '/architect':
            self.send_json_response({
                **MOMO_MEMORY['architect'],
                "journey_summary": f"{MOMO_MEMORY['journey']['duration_years']} years, {MOMO_MEMORY['journey']['hours_invested']:,} hours invested",
                "hardware": MOMO_MEMORY['assets']['hardware']['description'],
                "message": f"Welcome back, {MOMO_MEMORY['architect']['name']}!"
            })

        elif path == '/journey':
            self.send_json_response({
                **MOMO_MEMORY['journey'],
                "repositories": MOMO_MEMORY['assets']['github']['repositories'],
                "domains": MOMO_MEMORY['assets']['domains'],
                "message": "Your 3-year journey - documented and remembered"
            })

        elif path == '/data':
            self.send_json_response({
                "knowledge_graph": {
                    "size": MOMO_MEMORY['assets']['knowledge_graph']['size'],
                    "description": MOMO_MEMORY['assets']['knowledge_graph']['description'],
                    "location": MOMO_MEMORY['assets']['knowledge_graph']['location'],
                    "status": "ACCESSIBLE - Searchable"
                },
                "chat_history": {
                    "entries": MOMO_MEMORY['assets']['chat_history']['manifest_entries'],
                    "description": MOMO_MEMORY['assets']['chat_history']['description'],
                    "status": "ACCESSIBLE"
                },
                "receipts": {
                    "total": MOMO_MEMORY['assets']['execution_receipts']['total_receipts'],
                    "genesis_block": MOMO_MEMORY['assets']['execution_receipts']['genesis_block'],
                    "status": "ACCESSIBLE"
                },
                "message": "All your data is recorded, hashed, and accessible"
            })

        elif path == '/kg/stats':
            try:
                kg = load_knowledge_graph()

                self.send_json_response({
                    "metadata": kg['metadata'],
                    "file_size": f"{KNOWLEDGE_GRAPH_PATH.stat().st_size / (1024*1024):.1f} MB",
                    "location": str(KNOWLEDGE_GRAPH_PATH),
                    "node_count": len(kg.get('nodes', [])),
                    "edge_count": len(kg.get('edges', [])),
                    "loaded": KNOWLEDGE_GRAPH is not None,
                    "status": "READY - Full knowledge graph loaded in memory",
                    "search_example": "/kg/search?q=fatiha&limit=5"
                })
            except Exception as e:
                self.send_json_response({
                    "error": f"Failed to load knowledge graph: {str(e)}",
                    "status": "ERROR"
                }, status=500)

        elif path.startswith('/kg/search'):
            # Parse query parameters
            query_params = parse_qs(parsed_path.query)
            query = query_params.get('q', [''])[0]
            limit = int(query_params.get('limit', ['10'])[0])

            if not query:
                self.send_json_response({
                    "error": "Missing query parameter 'q'",
                    "example": "/kg/search?q=fatiha&limit=10",
                    "tip": "Search for Quran chapters, verses, or concepts"
                }, status=400)
                return

            try:
                results = search_knowledge_graph(query, limit)

                self.send_json_response({
                    "query": query,
                    "results_count": len(results),
                    "limit": limit,
                    "results": results,
                    "status": "SUCCESS",
                    "message": f"Found {len(results)} matches for '{query}' in knowledge graph"
                })
            except Exception as e:
                self.send_json_response({
                    "error": f"Search failed: {str(e)}",
                    "query": query
                }, status=500)

        elif path.startswith('/kg/chapter/'):
            # Extract chapter number
            try:
                chapter_num = int(path.split('/')[-1])
                chapter = get_chapter(chapter_num)

                if chapter:
                    self.send_json_response({
                        "chapter_number": chapter_num,
                        "chapter": chapter,
                        "status": "SUCCESS"
                    })
                else:
                    self.send_json_response({
                        "error": f"Chapter {chapter_num} not found",
                        "tip": "Valid chapters are 1-114"
                    }, status=404)
            except ValueError:
                self.send_json_response({
                    "error": "Invalid chapter number",
                    "example": "/kg/chapter/1"
                }, status=400)

        else:
            self.send_json_response({
                "error": "Endpoint not found",
                "available_endpoints": [
                    "/", "/memory", "/architect", "/journey",
                    "/data", "/kg/stats", "/kg/search?q=<query>",
                    "/kg/chapter/<number>"
                ]
            }, status=404)

def main():
    # Load MoMo's memory on server start
    load_memory()

    # Start HTTP server
    server_address = ('', 7999)
    httpd = HTTPServer(server_address, MemoryHandler)

    print(f"🚀 Server listening on port 7999...")
    print(f"   Press Ctrl+C to stop")
    print()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print()
        print("=" * 70)
        print("🛑 Server stopped")
        print(f"   Goodbye, {MOMO_MEMORY['architect']['name']}!")
        print("   Your memory has been preserved.")
        print("=" * 70)

if __name__ == "__main__":
    main()
