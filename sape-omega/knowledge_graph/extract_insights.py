#!/usr/bin/env python3
"""
Extract Insights from BIZRA Documentation
Focused extraction from key markdown files containing vision, learnings, and evolution
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime
import hashlib
import re

sys.path.insert(0, str(Path(__file__).parent))
from schema import GraphNode, GraphRelationship, NodeType, RelationType


class InsightExtractor:
    """Extract insights from BIZRA documentation"""

    # Key insight markers
    INSIGHT_MARKERS = [
        'vision', 'philosophy', 'principle', 'lesson', 'breakthrough',
        'discovery', 'realization', 'الحمد لله', 'ما شاء الله', 'alhamdulillah',
        'we learned', 'we discovered', 'we realized', 'critical', 'essential',
        'ultimate', 'peak', 'masterpiece', 'elite', 'genesis', 'omega',
        'roots', 'tree', 'house of wisdom', 'بيت الحكمة'
    ]

    def __init__(self, root_dir: Path):
        self.root_dir = root_dir
        self.nodes = []
        self.relationships = []

    def extract_from_markdown(self, file_path: Path) -> List[GraphNode]:
        """Extract insights from a markdown file"""
        nodes = []

        try:
            content = file_path.read_text(encoding='utf-8', errors='ignore')

            # Extract title
            title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
            title = title_match.group(1) if title_match else file_path.stem

            # Create document node
            doc_node = self._create_document_node(file_path, title, content)
            nodes.append(doc_node)

            # Extract sections with insights
            sections = self._extract_sections(content, file_path)
            nodes.extend(sections)

            # Link sections to document
            for section in sections:
                self.relationships.append(GraphRelationship(
                    from_node=section.node_id,
                    to_node=doc_node.node_id,
                    rel_type=RelationType.PART_OF,
                    properties={'context': 'section of document'},
                    source='InsightExtractor',
                    confidence=1.0
                ))

            return nodes

        except Exception as e:
            print(f"   ⚠️  Failed to extract from {file_path}: {e}")
            return []

    def _create_document_node(self, file_path: Path, title: str, content: str) -> GraphNode:
        """Create node for document"""
        node_id = f"doc:{hashlib.sha256(str(file_path).encode()).hexdigest()[:16]}"

        # Extract first paragraph as summary
        summary_match = re.search(r'\n\n(.{50,300}?)\n', content)
        summary = summary_match.group(1) if summary_match else content[:200]

        return GraphNode(
            node_id=node_id,
            node_type=NodeType.CONCEPT,
            properties={
                'title': title,
                'summary': summary,
                'file_path': str(file_path.relative_to(self.root_dir)),
                'file_size': len(content),
                'word_count': len(content.split()),
                'created_from': 'documentation',
                'category': 'vision_document' if any(k in title.lower() for k in ['vision', 'blueprint', 'framework']) else 'documentation'
            },
            labels=['Document', 'Vision'],
            source='BIZRA Documentation',
            confidence=1.0
        )

    def _extract_sections(self, content: str, file_path: Path) -> List[GraphNode]:
        """Extract sections that contain insights"""
        sections = []

        # Find all headers with their content
        header_pattern = r'(#{1,4})\s+(.+?)\n((?:(?!#{1,4}\s).)*)'
        matches = re.finditer(header_pattern, content, re.DOTALL)

        for match in matches:
            level = len(match.group(1))
            header_text = match.group(2).strip()
            section_content = match.group(3).strip()

            # Only extract if contains insight markers
            combined = (header_text + " " + section_content).lower()
            if any(marker in combined for marker in self.INSIGHT_MARKERS):
                node = self._create_insight_node(header_text, section_content, file_path, level)
                sections.append(node)

        return sections

    def _create_insight_node(self, header: str, content: str, file_path: Path, level: int) -> GraphNode:
        """Create node for an insight section"""
        node_id = f"insight:{hashlib.sha256((header + str(file_path)).encode()).hexdigest()[:16]}"

        # Truncate content if too long
        display_content = content[:500] + "..." if len(content) > 500 else content

        # Identify category
        category = 'insight'
        labels = ['Insight']
        if any(k in header.lower() for k in ['vision', 'dream', 'ultimate']):
            category = 'vision'
            labels.append('Vision')
        elif any(k in header.lower() for k in ['philosophy', 'principle']):
            category = 'philosophy'
            labels.append('Philosophy')
        elif any(k in header.lower() for k in ['lesson', 'learned']):
            category = 'learning'
            labels.append('Learning')
        elif any(k in header.lower() for k in ['architecture', 'design', 'implementation']):
            category = 'technical'
            labels.append('Technical')

        return GraphNode(
            node_id=node_id,
            node_type=NodeType.CONCEPT,
            properties={
                'header': header,
                'content': display_content,
                'source_file': str(file_path.relative_to(self.root_dir)),
                'section_level': level,
                'category': category,
                'word_count': len(content.split()),
                'contains_arabic': bool(re.search(r'[\u0600-\u06FF]', content)),
                'contains_code': '```' in content,
                'full_content_length': len(content)
            },
            labels=labels,
            source='BIZRA Documentation',
            confidence=0.95
        )


def main():
    """Extract insights from key BIZRA documents"""
    print("=" * 80)
    print("🌳 EXTRACTING INSIGHTS FROM BIZRA DOCUMENTATION")
    print("   Growing the Tree from 3 Years of Vision")
    print("=" * 80)
    print()

    root_dir = Path("/root/bizra-genesis")
    output_dir = root_dir / "knowledge_graph_output" / "insights"
    output_dir.mkdir(parents=True, exist_ok=True)

    extractor = InsightExtractor(root_dir)

    # Priority documents (user's vision and learnings)
    priority_docs = [
        "BIZRA_ELITE_BLUEPRINT_v9.1.md",
        "BIZRA_PINNACLE_BLUEPRINT_v7.1_OMEGA.md",
        "BIZRA_OMEGA_SYNTHESIS_FRAMEWORK.md",
        "BIZRA_AEON_OMEGA_MANIFEST.md",
        "BIZRA_LESSON_01_NO_ASSUMPTIONS.md",
        "BIZRA_SOT.md",
        "BIZRA_HOUSE_OF_WISDOM.md",
        "QURANIC_DISCOVERY_VISION.md",
        "PEAK_MASTERPIECE_COMPLETE.md",
        "BIZRA_SYSTEMATIC_ANALYSIS_REPORT.md",
        "BIZRA_Ultimate_Optimized_Blueprint_v9.0.md",
        "BIZRA_UNIFIED_ROADMAP_v9.1.md",
        "BIZRA_Master_Convergence_Blueprint_v9.0.md",
        "BIZRA_PINNACLE_FRAMEWORK_v9.0.md",
        "BIZRA_MASTERPIECE_INTEGRATION.md",
        "BIZRA_SELF_OPTIMIZATION_LOG.md",
        "BIZRA_SAPE_FINAL_ANALYSIS.md",
        "BIZRA-Node0-Repository-Structure.md",
        "BIZRA-Elite-Implementation-Blueprint-v4.0.md",
        "BIZRA-Model-Family-8B-Humans.md",
    ]

    print("[Phase 1/3] 📖 Extracting from priority documents...")
    print()

    all_nodes = []
    files_processed = 0

    for doc_name in priority_docs:
        doc_path = root_dir / doc_name
        if doc_path.exists():
            print(f"   📄 {doc_name}")
            nodes = extractor.extract_from_markdown(doc_path)
            all_nodes.extend(nodes)
            files_processed += 1

    print()
    print(f"   ✅ Processed {files_processed} documents")
    print(f"   ✅ Extracted {len(all_nodes)} nodes")
    print(f"   ✅ Created {len(extractor.relationships)} relationships")
    print()

    print("[Phase 2/3] 🔗 Analyzing patterns...")
    print()

    # Categorize insights
    categories = {}
    for node in all_nodes:
        cat = node.properties.get('category', 'other')
        categories[cat] = categories.get(cat, 0) + 1

    for cat, count in sorted(categories.items(), key=lambda x: x[1], reverse=True):
        print(f"   {cat:20} {count:4} nodes")

    print()
    print("[Phase 3/3] 💾 Exporting...")
    print()

    # Export to JSON
    output = {
        'metadata': {
            'name': 'BIZRA Insights Knowledge Graph',
            'description': '3 years of vision, philosophy, and technical evolution',
            'created_at': datetime.now().isoformat(),
            'philosophy': 'From roots to tree - الحمد لله',
            'files_processed': files_processed
        },
        'stats': {
            'total_nodes': len(all_nodes),
            'total_relationships': len(extractor.relationships),
            'categories': categories,
            'documents': files_processed
        },
        'nodes': [
            {
                'node_id': n.node_id,
                'node_type': n.node_type.value if hasattr(n.node_type, 'value') else str(n.node_type),
                'properties': n.properties,
                'labels': n.labels,
                'source': n.source,
                'confidence': n.confidence
            }
            for n in all_nodes
        ],
        'relationships': [
            {
                'from_node': r.from_node,
                'to_node': r.to_node,
                'rel_type': r.rel_type.value if hasattr(r.rel_type, 'value') else str(r.rel_type),
                'properties': r.properties,
                'source': r.source,
                'confidence': r.confidence
            }
            for r in extractor.relationships
        ]
    }

    output_file = output_dir / "bizra_insights_graph.json"
    output_file.write_text(json.dumps(output, indent=2, ensure_ascii=False))

    print("=" * 80)
    print("✅ INSIGHT EXTRACTION COMPLETE")
    print("=" * 80)
    print(f"   Files processed:   {files_processed}")
    print(f"   Insights extracted: {len(all_nodes)}")
    print(f"   Relationships:      {len(extractor.relationships)}")
    print()
    print(f"💾 Exported to: {output_file.relative_to(root_dir)}")
    print()

    # Print sample insights
    print("📊 SAMPLE INSIGHTS:")
    print()
    vision_nodes = [n for n in all_nodes if n.properties.get('category') == 'vision']
    for node in vision_nodes[:5]:
        header = node.properties.get('header', node.properties.get('title', 'Unknown'))
        content = node.properties.get('content', node.properties.get('summary', ''))[:100]
        print(f"   • {header}")
        print(f"     {content}...")
        print()


if __name__ == '__main__':
    main()
