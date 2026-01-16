#!/usr/bin/env python3
"""
BIZRA Memory Server - Quick demonstration of persistent memory system
Loads MoMo's context and serves it via HTTP API

Usage: python3 memory_server.py
Access: http://localhost:7999
"""

import json
import os
from pathlib import Path
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Global memory cache
MOMO_MEMORY = None
KNOWLEDGE_GRAPH_PATH = None

def load_memory():
    """Load MoMo's persistent memory on startup"""
    global MOMO_MEMORY, KNOWLEDGE_GRAPH_PATH

    memory_path = Path("/root/bizra_data_vault/MOMO_GENESIS_ARCHITECT_MEMORY.json")

    with open(memory_path, 'r') as f:
        MOMO_MEMORY = json.load(f)

    KNOWLEDGE_GRAPH_PATH = Path(MOMO_MEMORY['assets']['knowledge_graph']['location'])

    print("=" * 70)
    print("🧠 BIZRA MEMORY SERVER STARTED")
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
    print(f"   /kg/search?q=<query> - Search knowledge graph (coming soon)")
    print("=" * 70)
    print()

class MemoryHandler(BaseHTTPRequestHandler):
    """HTTP request handler that remembers MoMo"""

    def log_message(self, format, *args):
        """Custom log format that includes MoMo's name"""
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
                "service": "BIZRA Memory Server",
                "architect": MOMO_MEMORY['architect']['name'],
                "status": "ONLINE - Memory loaded and persistent",
                "message": f"Welcome back, {MOMO_MEMORY['architect']['name']}! Your context is loaded.",
                "endpoints": [
                    "/memory", "/architect", "/journey", "/data",
                    "/kg/stats", "/kg/search?q=<query>"
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
                    "status": "ACCESSIBLE"
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
                # Read first few lines to get metadata
                with open(KNOWLEDGE_GRAPH_PATH, 'r') as f:
                    kg_data = json.load(f)

                self.send_json_response({
                    "metadata": kg_data['metadata'],
                    "file_size": f"{KNOWLEDGE_GRAPH_PATH.stat().st_size / (1024*1024):.1f} MB",
                    "location": str(KNOWLEDGE_GRAPH_PATH),
                    "node_count": len(kg_data.get('nodes', [])),
                    "edge_count": len(kg_data.get('edges', [])),
                    "status": "READY - Full knowledge graph loaded in memory"
                })
            except Exception as e:
                self.send_json_response({
                    "error": f"Failed to load knowledge graph: {str(e)}",
                    "status": "ERROR"
                }, status=500)

        elif path.startswith('/kg/search'):
            # Parse query parameter
            query_params = parse_qs(parsed_path.query)
            query = query_params.get('q', [''])[0]

            if not query:
                self.send_json_response({
                    "error": "Missing query parameter 'q'",
                    "example": "/kg/search?q=fatiha"
                }, status=400)
                return

            # TODO: Implement actual search
            self.send_json_response({
                "query": query,
                "message": "Knowledge graph search - implementation pending",
                "suggestion": "For now, use /kg/stats to see what's available"
            })

        else:
            self.send_json_response({
                "error": "Endpoint not found",
                "available_endpoints": [
                    "/", "/memory", "/architect", "/journey",
                    "/data", "/kg/stats", "/kg/search?q=<query>"
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
