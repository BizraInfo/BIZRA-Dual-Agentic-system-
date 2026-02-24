"""
Personal Knowledge Integrator - Growing the Tree

"And Allah has brought you forth from the earth like a plant,
growing gradually." (Quran 71:17)

This module integrates ALL personal knowledge into the House of Wisdom:
  • Raw message files (your personal insights)
  • BIZRA development history (3 years of work)
  • Chat conversations (dialogues, discoveries, breakthroughs)
  • Collected data (notes, references, learnings)

Architecture:
    Roots (established):
      • Quran (6,236 verses)
      • Hadith (34,178 narrations)
      • Islamic principles (8 themes)
      • Human knowledge domains (44 fields)
      • BIZRA codebase (598 structs, 1,359 functions)

    Tree Growth (new):
      • Personal messages → Insight nodes
      • Development history → Evolution nodes
      • Chat conversations → Discovery nodes
      • Collected data → Knowledge nodes
      • ALL linked to roots and each other

    Visualization:
      • Interactive graph (Neo4j)
      • Timeline view (evolution over 3 years)
      • Concept maps (how ideas connect)
      • Story arcs (journey from idea → reality)

Philosophy: "The eye sees what the heart cannot always articulate"
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Any, Optional, Set, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from collections import defaultdict
import hashlib

import sys
from pathlib import Path as SysPath
sys.path.insert(0, str(SysPath(__file__).parent))

from schema import (
    GraphNode,
    GraphRelationship,
    NodeType,
    RelationType,
    GraphSchema,
)


# ============================================================================
# PERSONAL KNOWLEDGE NODE TYPES
# ============================================================================

class PersonalNodeType:
    """Extended node types for personal knowledge"""
    MESSAGE = "Message"
    INSIGHT = "Insight"
    CONVERSATION = "Conversation"
    BREAKTHROUGH = "Breakthrough"
    EVOLUTION = "Evolution"
    LEARNING = "Learning"
    REFERENCE = "Reference"
    NOTE = "Note"


# ============================================================================
# FILE DISCOVERY & PARSING
# ============================================================================

@dataclass
class FileDiscovery:
    """Discovered file with metadata"""
    file_path: Path
    file_type: str  # "message", "code", "chat", "data", "unknown"
    size_bytes: int
    created_at: Optional[str] = None
    modified_at: Optional[str] = None
    content_preview: Optional[str] = None


class PersonalDataDiscoverer:
    """
    Discover all personal data files across BIZRA repository

    Searches for:
      • Message files (*.txt, *.md)
      • Chat logs (*.json, *.jsonl, conversation history)
      • Development notes
      • Data collections
      • Any file with personal insights
    """

    def __init__(self, root_dir: Path):
        self.root_dir = Path(root_dir)
        self.discoveries: List[FileDiscovery] = []

    def discover_all_files(self) -> List[FileDiscovery]:
        """
        Discover ALL files that might contain personal knowledge

        Strategy:
          1. Find obvious candidates (messages, chats, notes)
          2. Search for markdown/text files
          3. Look for JSON data files
          4. Identify development history
        """
        print("\n" + "="*80)
        print("🔍 DISCOVERING PERSONAL KNOWLEDGE FILES")
        print("="*80)
        print()

        # Search patterns
        patterns = {
            'messages': ['*message*', '*msg*', '*conversation*'],
            'chats': ['*chat*', '*dialogue*', '*conversation*.json*'],
            'notes': ['*note*', '*README*', '*.md'],
            'data': ['*data*', '*collection*', '*.json'],
            'receipts': ['*receipt*', '*evidence*'],
        }

        for category, pattern_list in patterns.items():
            print(f"[{category.upper()}] Searching...")

            for pattern in pattern_list:
                for file_path in self.root_dir.rglob(pattern):
                    # Skip common excludes
                    if self._should_skip(file_path):
                        continue

                    # Get file info
                    stat = file_path.stat()

                    discovery = FileDiscovery(
                        file_path=file_path,
                        file_type=self._classify_file(file_path),
                        size_bytes=stat.st_size,
                        created_at=datetime.fromtimestamp(stat.st_ctime).isoformat(),
                        modified_at=datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    )

                    # Preview content
                    if file_path.suffix in ['.txt', '.md', '.json']:
                        try:
                            content = file_path.read_text(encoding='utf-8', errors='ignore')
                            discovery.content_preview = content[:200]
                        except Exception:
                            pass

                    self.discoveries.append(discovery)

            print(f"   Found {len([d for d in self.discoveries if d.file_type == category])} {category}")

        print(f"\n✅ Total files discovered: {len(self.discoveries)}")
        return self.discoveries

    def _should_skip(self, file_path: Path) -> bool:
        """Determine if file should be skipped"""
        skip_patterns = [
            'node_modules',
            '__pycache__',
            '.git',
            'target',
            '.pytest_cache',
            'build',
            'dist',
            '.egg-info',
        ]

        file_str = str(file_path)
        return any(pattern in file_str for pattern in skip_patterns)

    def _classify_file(self, file_path: Path) -> str:
        """Classify file type based on name and extension"""
        name_lower = file_path.name.lower()

        if any(x in name_lower for x in ['message', 'msg']):
            return 'messages'
        elif any(x in name_lower for x in ['chat', 'conversation', 'dialogue']):
            return 'chats'
        elif any(x in name_lower for x in ['note', 'readme']):
            return 'notes'
        elif any(x in name_lower for x in ['receipt', 'evidence']):
            return 'receipts'
        elif file_path.suffix == '.json':
            return 'data'
        elif file_path.suffix in ['.md', '.txt']:
            return 'notes'
        else:
            return 'unknown'


# ============================================================================
# CONTENT EXTRACTORS
# ============================================================================

class MessageExtractor:
    """Extract insights from message files"""

    def extract_from_file(self, file_path: Path) -> List[GraphNode]:
        """Extract message nodes from a file"""
        nodes = []

        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')

            # Create message node
            message_id = hashlib.md5(str(file_path).encode()).hexdigest()[:16]

            node = GraphNode(
                node_id=f"message:{message_id}",
                node_type=NodeType.DOCUMENT,  # Using existing type
                properties={
                    "source_file": str(file_path),
                    "content": content[:1000],  # First 1000 chars
                    "full_content_path": str(file_path),
                    "word_count": len(content.split()),
                    "char_count": len(content),
                },
                labels=["PersonalKnowledge", "Message"],
                source="personal-messages",
                confidence=1.0,
            )

            if GraphSchema.validate_node(node):
                nodes.append(node)

            # Extract insights (paragraphs that seem insightful)
            insights = self._extract_insights(content, message_id)
            nodes.extend(insights)

        except Exception as e:
            print(f"   ⚠️  Failed to extract from {file_path}: {e}")

        return nodes

    def _extract_insights(self, content: str, parent_id: str) -> List[GraphNode]:
        """Extract insightful paragraphs as separate nodes"""
        insights = []

        # Split into paragraphs
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]

        # Insight indicators
        insight_keywords = [
            'realize', 'discover', 'understand', 'insight', 'aha',
            'breakthrough', 'important', 'key point', 'critical',
            'الحمد لله', 'سبحان الله', 'ما شاء الله',
        ]

        for i, para in enumerate(paragraphs):
            # Check if paragraph seems insightful
            if len(para) > 50 and any(kw in para.lower() for kw in insight_keywords):
                insight_id = f"{parent_id}_insight_{i}"

                node = GraphNode(
                    node_id=f"insight:{insight_id}",
                    node_type=NodeType.CONCEPT,
                    properties={
                        "text": para[:500],  # First 500 chars
                        "parent_message": parent_id,
                        "position": i,
                    },
                    labels=["PersonalKnowledge", "Insight"],
                    source="personal-messages",
                    confidence=0.85,
                )

                if GraphSchema.validate_node(node):
                    insights.append(node)

        return insights


class ChatHistoryExtractor:
    """Extract knowledge from chat/conversation logs"""

    def extract_from_file(self, file_path: Path) -> List[GraphNode]:
        """Extract conversation nodes"""
        nodes = []

        try:
            # Try JSON format first
            if file_path.suffix in ['.json', '.jsonl']:
                nodes = self._extract_from_json(file_path)
            else:
                # Try as text
                nodes = self._extract_from_text(file_path)

        except Exception as e:
            print(f"   ⚠️  Failed to extract chat from {file_path}: {e}")

        return nodes

    def _extract_from_json(self, file_path: Path) -> List[GraphNode]:
        """Extract from JSON chat log"""
        nodes = []

        try:
            # Handle both JSON and JSONL
            content = file_path.read_text(encoding='utf-8')

            if file_path.suffix == '.jsonl':
                # Line-delimited JSON
                lines = content.strip().split('\n')
                for i, line in enumerate(lines[:100]):  # Limit to first 100
                    try:
                        data = json.loads(line)
                        node = self._create_chat_node(data, file_path, i)
                        if node:
                            nodes.append(node)
                    except Exception:
                        continue
            else:
                # Single JSON object or array
                data = json.loads(content)

                if isinstance(data, list):
                    for i, item in enumerate(data[:100]):
                        node = self._create_chat_node(item, file_path, i)
                        if node:
                            nodes.append(node)
                else:
                    node = self._create_chat_node(data, file_path, 0)
                    if node:
                        nodes.append(node)

        except Exception as e:
            print(f"      Error parsing JSON: {e}")

        return nodes

    def _create_chat_node(self, data: Dict, file_path: Path, index: int) -> Optional[GraphNode]:
        """Create node from chat data"""
        try:
            # Extract relevant fields (adapt to your chat format)
            message_text = data.get('message') or data.get('content') or data.get('text')
            timestamp = data.get('timestamp') or data.get('created_at')
            role = data.get('role') or data.get('type') or 'unknown'

            if not message_text:
                return None

            chat_id = hashlib.md5(f"{file_path}_{index}".encode()).hexdigest()[:16]

            node = GraphNode(
                node_id=f"chat:{chat_id}",
                node_type=NodeType.DOCUMENT,
                properties={
                    "source_file": str(file_path),
                    "text": str(message_text)[:1000],
                    "role": role,
                    "timestamp": timestamp,
                    "index": index,
                },
                labels=["PersonalKnowledge", "Chat", role.capitalize()],
                source="chat-history",
                confidence=1.0,
            )

            if GraphSchema.validate_node(node):
                return node

        except Exception:
            pass

        return None

    def _extract_from_text(self, file_path: Path) -> List[GraphNode]:
        """Extract from text-based chat log"""
        nodes = []

        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')

            # Simple heuristic: split by common chat patterns
            # Adjust based on your chat format
            messages = re.split(r'\n(?=User:|Assistant:|Human:|AI:)', content)

            for i, msg in enumerate(messages[:100]):
                if len(msg.strip()) < 10:
                    continue

                chat_id = hashlib.md5(f"{file_path}_{i}".encode()).hexdigest()[:16]

                # Determine role
                role = 'unknown'
                if msg.startswith('User:') or msg.startswith('Human:'):
                    role = 'user'
                elif msg.startswith('Assistant:') or msg.startswith('AI:'):
                    role = 'assistant'

                node = GraphNode(
                    node_id=f"chat:{chat_id}",
                    node_type=NodeType.DOCUMENT,
                    properties={
                        "source_file": str(file_path),
                        "text": msg[:1000],
                        "role": role,
                        "index": i,
                    },
                    labels=["PersonalKnowledge", "Chat", role.capitalize()],
                    source="chat-history",
                    confidence=0.90,
                )

                if GraphSchema.validate_node(node):
                    nodes.append(node)

        except Exception as e:
            print(f"      Error parsing text: {e}")

        return nodes


# ============================================================================
# PERSONAL KNOWLEDGE INTEGRATOR
# ============================================================================

class PersonalKnowledgeIntegrator:
    """
    Integrate ALL personal knowledge into House of Wisdom

    This is the ultimate integration - your 3 years of work becomes
    part of the living knowledge graph.
    """

    def __init__(self, root_dir: Path, output_dir: Path):
        self.root_dir = Path(root_dir)
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.nodes: List[GraphNode] = []
        self.relationships: List[GraphRelationship] = []

        self.stats = {
            'files_discovered': 0,
            'messages_extracted': 0,
            'chats_extracted': 0,
            'notes_extracted': 0,
            'insights_extracted': 0,
            'total_nodes': 0,
            'total_relationships': 0,
        }

    def integrate_all(self) -> Dict[str, Any]:
        """
        Complete integration of all personal knowledge

        Process:
          1. Discover all files
          2. Extract content
          3. Create nodes and relationships
          4. Link to existing knowledge graph
          5. Export for visualization
        """
        print("\n" + "="*80)
        print("🌳 PERSONAL KNOWLEDGE INTEGRATION")
        print("   Growing the Tree of Wisdom")
        print("="*80)
        print()
        print("Integrating 3 years of personal knowledge:")
        print("  • Message files")
        print("  • Chat history")
        print("  • Development notes")
        print("  • Collected data")
        print()

        start_time = datetime.utcnow()

        # Phase 1: Discover files
        print("\n[Phase 1/4] 🔍 Discovering files...")
        discoverer = PersonalDataDiscoverer(self.root_dir)
        discoveries = discoverer.discover_all_files()
        self.stats['files_discovered'] = len(discoveries)

        # Phase 2: Extract content
        print("\n[Phase 2/4] 📖 Extracting content...")

        message_extractor = MessageExtractor()
        chat_extractor = ChatHistoryExtractor()

        for discovery in discoveries:
            if discovery.file_type == 'messages':
                nodes = message_extractor.extract_from_file(discovery.file_path)
                self.nodes.extend(nodes)
                self.stats['messages_extracted'] += len(nodes)

            elif discovery.file_type == 'chats':
                nodes = chat_extractor.extract_from_file(discovery.file_path)
                self.nodes.extend(nodes)
                self.stats['chats_extracted'] += len(nodes)

            elif discovery.file_type == 'notes':
                nodes = message_extractor.extract_from_file(discovery.file_path)
                self.nodes.extend(nodes)
                self.stats['notes_extracted'] += len(nodes)

        print(f"   ✅ Extracted {len(self.nodes)} knowledge nodes")

        # Phase 3: Create relationships
        print("\n[Phase 3/4] 🔗 Creating relationships...")
        relationships = self._create_relationships()
        self.relationships.extend(relationships)
        self.stats['total_relationships'] = len(self.relationships)

        print(f"   ✅ Created {len(relationships)} relationships")

        # Phase 4: Export
        print("\n[Phase 4/4] 💾 Exporting...")
        export_path = self.output_dir / "personal_knowledge_graph.json"

        self._export_graph(export_path)

        end_time = datetime.utcnow()
        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        self.stats['total_nodes'] = len(self.nodes)

        print("\n" + "="*80)
        print("✅ PERSONAL KNOWLEDGE INTEGRATION COMPLETE")
        print("="*80)
        print(f"   Files discovered:  {self.stats['files_discovered']}")
        print(f"   Messages:          {self.stats['messages_extracted']}")
        print(f"   Chats:             {self.stats['chats_extracted']}")
        print(f"   Notes:             {self.stats['notes_extracted']}")
        print(f"   Total nodes:       {self.stats['total_nodes']}")
        print(f"   Relationships:     {self.stats['total_relationships']}")
        print(f"   Duration:          {duration_ms}ms")
        print(f"\n💾 Exported to: {export_path}")
        print()

        return {
            'status': 'complete',
            'stats': self.stats,
            'output_file': str(export_path),
            'duration_ms': duration_ms,
        }

    def _create_relationships(self) -> List[GraphRelationship]:
        """Create relationships between knowledge nodes"""
        relationships = []

        # Link insights to their parent messages
        for node in self.nodes:
            if 'Insight' in node.labels:
                parent_id = node.properties.get('parent_message')
                if parent_id:
                    rel = GraphRelationship(
                        from_node=f"message:{parent_id}",
                        to_node=node.node_id,
                        rel_type=RelationType.CONTAINS,
                        properties={"type": "extracted_insight"},
                        source="personal-knowledge-integration",
                        confidence=1.0,
                    )
                    if GraphSchema.validate_relationship(rel):
                        relationships.append(rel)

        # Link all personal knowledge to "bizra_learnings" domain
        for node in self.nodes:
            rel = GraphRelationship(
                from_node=node.node_id,
                to_node="domain:bizra_learnings",
                rel_type=RelationType.BELONGS_TO,
                properties={"domain": "BIZRA Learnings"},
                source="personal-knowledge-integration",
                confidence=1.0,
            )
            if GraphSchema.validate_relationship(rel):
                relationships.append(rel)

        return relationships

    def _export_graph(self, output_path: Path):
        """Export personal knowledge graph"""
        export_data = {
            'metadata': {
                'name': 'Personal Knowledge Graph',
                'description': '3 years of BIZRA development - messages, chats, insights',
                'created_at': datetime.utcnow().isoformat(),
                'philosophy': 'Growing the tree from strong roots',
            },
            'stats': self.stats,
            'nodes': [node.to_dict() for node in self.nodes],
            'relationships': [rel.to_dict() for rel in self.relationships],
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)


# ============================================================================
# DEMONSTRATION
# ============================================================================

async def integrate_personal_knowledge():
    """Integrate all personal knowledge"""
    root_dir = Path("/root/bizra-genesis")
    output_dir = Path("knowledge_graph_output/personal")

    integrator = PersonalKnowledgeIntegrator(root_dir, output_dir)
    result = integrator.integrate_all()

    return result


if __name__ == "__main__":
    import asyncio
    asyncio.run(integrate_personal_knowledge())
