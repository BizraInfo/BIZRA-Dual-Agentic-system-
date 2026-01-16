"""
BIZRA Ultimate Knowledge Integration

Peak Masterpiece: Complete integration of all knowledge sources into
the House of Wisdom

Integrates:
  1. Quran (6,236 verses) - Divine Foundation
  2. Hadith (34,178 narrations) - Prophetic Tradition
  3. Quranic Themes (8+ principles) - Conceptual Layer
  4. BIZRA Codebase (598+ structs, 1,359+ functions) - Self-Knowledge
  5. Human Knowledge Domains (44 domains) - Universal Knowledge

Architecture:
    🕋 Quran
      ├─ 📚 Hadith (420 cross-refs)
      ├─ 🌟 Themes (Ihsan, Adl, Amānah, ...)
      └─ 🌍 Human Knowledge
           ├─ 📐 Mathematics
           ├─ 🔬 Sciences
           ├─ 💻 Technology
           │    └─ 🏛️  BIZRA Self (598 structs linked to principles)
           └─ 🎨 Arts & Humanities

Philosophy: "From divine revelation to running code - all paths lead to Truth"
"""

import json
import asyncio
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

from .islamic_knowledge_loader import IslamicKnowledgeGraphLoader
from .bizra_house_of_wisdom import BizraHouseOfWisdom
from .codebase_self_awareness import CodebaseSelfAwarenessEngine
from .schema import GraphNode, GraphRelationship, RelationType


class UltimateKnowledgeIntegration:
    """
    The Ultimate Integration

    Combines:
      - Islamic Knowledge (Quran + Hadith)
      - Hierarchical Domains (House of Wisdom)
      - Self-Awareness (BIZRA Codebase)
      - Interdisciplinary Links (Code ↔ Principles ↔ Concepts)

    Result: Complete self-aware knowledge system rooted in divine guidance
    """

    def __init__(self, output_dir: str = "knowledge_graph_output/ultimate"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        self.all_nodes: List[GraphNode] = []
        self.all_relationships: List[GraphRelationship] = []

        self.stats = {
            "quran_nodes": 0,
            "hadith_nodes": 0,
            "code_nodes": 0,
            "domain_nodes": 0,
            "total_nodes": 0,
            "total_relationships": 0,
            "cross_domain_links": 0,
        }

    async def build_ultimate_graph(self) -> Dict[str, Any]:
        """
        Build the ultimate knowledge graph

        Phase 1: Islamic Foundation (Quran + Hadith)
        Phase 2: Hierarchical Structure (House of Wisdom)
        Phase 3: Self-Awareness (BIZRA Codebase)
        Phase 4: Interdisciplinary Integration
        Phase 5: Synthesis & Export
        """

        print("\n" + "="*80)
        print("🌟 ULTIMATE KNOWLEDGE INTEGRATION")
        print("   Peak Masterpiece: Complete House of Wisdom")
        print("="*80)
        print()
        print("Building comprehensive knowledge system:")
        print("  🕋 Foundation: Quran (6,236 verses)")
        print("  📚 Tradition: Hadith (34,178 narrations)")
        print("  🌟 Concepts: Quranic Themes (8+ principles)")
        print("  🏛️  Structure: 44 knowledge domains")
        print("  💻 Self: BIZRA Codebase (598+ structs, 1,359+ functions)")
        print("  🌐 Links: Interdisciplinary relationships")
        print()

        start_time = datetime.utcnow()

        # ====================================================================
        # PHASE 1: ISLAMIC FOUNDATION
        # ====================================================================

        print("\n" + "="*80)
        print("PHASE 1: ISLAMIC FOUNDATION")
        print("="*80)

        islamic_loader = IslamicKnowledgeGraphLoader(
            enable_big3=False,  # Disable for speed
            enable_omega=False,
            output_dir=str(self.output_dir / "islamic"),
        )

        islamic_result = await islamic_loader.build_complete_graph()

        self.all_nodes.extend(islamic_loader.nodes)
        self.all_relationships.extend(islamic_loader.relationships)

        self.stats["quran_nodes"] = islamic_loader.stats.chapters_extracted + islamic_loader.stats.verses_extracted
        self.stats["hadith_nodes"] = islamic_loader.stats.hadiths_extracted

        print(f"\n✅ Phase 1 Complete:")
        print(f"   Quran: {self.stats['quran_nodes']:,} nodes")
        print(f"   Hadith: {self.stats['hadith_nodes']:,} nodes")

        # ====================================================================
        # PHASE 2: HIERARCHICAL STRUCTURE
        # ====================================================================

        print("\n" + "="*80)
        print("PHASE 2: HIERARCHICAL STRUCTURE (HOUSE OF WISDOM)")
        print("="*80)

        house = BizraHouseOfWisdom()

        # Create domain nodes
        for domain_id, domain in house.domains.items():
            domain_node = GraphNode(
                node_id=f"domain:{domain_id}",
                node_type="CONCEPT",  # Using existing node type
                properties={
                    "name": domain.name,
                    "description": domain.description,
                    "level": domain.level,
                    "tags": domain.tags,
                },
                labels=["Domain", "HouseOfWisdom"],
                source="bizra-house-of-wisdom",
                confidence=1.0,
            )
            self.all_nodes.append(domain_node)
            self.stats["domain_nodes"] += 1

            # Create parent-child relationships
            if domain.parent_domain:
                rel = GraphRelationship(
                    from_node=f"domain:{domain_id}",
                    to_node=f"domain:{domain.parent_domain}",
                    rel_type=RelationType.PART_OF,
                    properties={"hierarchy_level": domain.level},
                    source="house-of-wisdom",
                    confidence=1.0,
                )
                self.all_relationships.append(rel)

        # Export hierarchy visualization
        tree_viz = house.visualize_tree_ascii(max_depth=4)
        tree_file = self.output_dir / "hierarchy_tree.txt"
        tree_file.write_text(tree_viz, encoding='utf-8')

        house.export_hierarchy(self.output_dir / "hierarchy.json")

        print(f"\n✅ Phase 2 Complete:")
        print(f"   Domains: {self.stats['domain_nodes']}")
        print(f"   Hierarchy: 4 levels deep")
        print(f"   Tree exported: {tree_file}")

        # ====================================================================
        # PHASE 3: SELF-AWARENESS (BIZRA CODEBASE)
        # ====================================================================

        print("\n" + "="*80)
        print("PHASE 3: SELF-AWARENESS (BIZRA CODEBASE)")
        print("="*80)

        codebase_engine = CodebaseSelfAwarenessEngine(
            codebase_root=Path("/root/bizra-genesis")
        )

        codebase_result = codebase_engine.run_complete_analysis()

        self.all_nodes.extend(codebase_engine.nodes)
        self.all_relationships.extend(codebase_engine.relationships)

        self.stats["code_nodes"] = len(codebase_engine.nodes)

        print(f"\n✅ Phase 3 Complete:")
        print(f"   Code nodes: {self.stats['code_nodes']:,}")
        print(f"   Structs: {codebase_result['stats']['structs']}")
        print(f"   Functions: {codebase_result['stats']['functions']}")
        print(f"   SNR: {codebase_result['stats']['snr_score']:.4f}")

        # ====================================================================
        # PHASE 4: INTERDISCIPLINARY INTEGRATION
        # ====================================================================

        print("\n" + "="*80)
        print("PHASE 4: INTERDISCIPLINARY INTEGRATION")
        print("="*80)

        # Link Quran to "quran" domain
        quran_links = self._link_quran_to_domain()
        self.all_relationships.extend(quran_links)

        # Link Hadith to "hadith" domain
        hadith_links = self._link_hadith_to_domain()
        self.all_relationships.extend(hadith_links)

        # Link code to domains (already done by codebase_engine)
        # Additional: Link code principles to Quranic themes
        principle_links = self._link_code_to_quran_themes(codebase_engine)
        self.all_relationships.extend(principle_links)

        cross_domain = len(quran_links) + len(hadith_links) + len(principle_links)
        self.stats["cross_domain_links"] = cross_domain

        print(f"\n✅ Phase 4 Complete:")
        print(f"   Quran → domain links: {len(quran_links)}")
        print(f"   Hadith → domain links: {len(hadith_links)}")
        print(f"   Code → theme links: {len(principle_links)}")
        print(f"   Total cross-domain: {cross_domain:,}")

        # ====================================================================
        # PHASE 5: SYNTHESIS & EXPORT
        # ====================================================================

        print("\n" + "="*80)
        print("PHASE 5: SYNTHESIS & EXPORT")
        print("="*80)

        self.stats["total_nodes"] = len(self.all_nodes)
        self.stats["total_relationships"] = len(self.all_relationships)

        # Export complete graph
        complete_graph = {
            "metadata": {
                "name": "BIZRA Ultimate Knowledge Graph",
                "description": "Complete integration from Quran to running code",
                "created_at": datetime.utcnow().isoformat(),
                "philosophy": "From divine revelation to human knowledge - all paths lead to Truth",
            },
            "stats": self.stats,
            "nodes": [node.to_dict() for node in self.all_nodes],
            "relationships": [rel.to_dict() for rel in self.all_relationships],
        }

        graph_file = self.output_dir / "complete_knowledge_graph.json"
        with open(graph_file, 'w', encoding='utf-8') as f:
            json.dump(complete_graph, f, indent=2, ensure_ascii=False)

        # Export stats summary
        stats_file = self.output_dir / "integration_stats.json"
        with open(stats_file, 'w', encoding='utf-8') as f:
            json.dump({
                "stats": self.stats,
                "islamic_result": islamic_result["stats"],
                "codebase_result": codebase_result["stats"],
                "got_synthesis": codebase_result["got_synthesis"],
                "got_confidence": codebase_result["got_confidence"],
                "snr_report": codebase_result["snr_report"],
                "giants_synthesis": codebase_result["giants_synthesis"],
            }, f, indent=2, ensure_ascii=False)

        end_time = datetime.utcnow()
        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        print(f"\n✅ Phase 5 Complete:")
        print(f"   Complete graph: {graph_file}")
        print(f"   Stats summary: {stats_file}")
        print(f"   Total size: ~{len(str(complete_graph)) // 1024}KB")

        # ====================================================================
        # FINAL REPORT
        # ====================================================================

        print("\n" + "="*80)
        print("🎯 ULTIMATE INTEGRATION COMPLETE")
        print("="*80)
        print()
        print("📊 Final Statistics:")
        print(f"   Quran nodes:        {self.stats['quran_nodes']:>10,}")
        print(f"   Hadith nodes:       {self.stats['hadith_nodes']:>10,}")
        print(f"   Code nodes:         {self.stats['code_nodes']:>10,}")
        print(f"   Domain nodes:       {self.stats['domain_nodes']:>10,}")
        print(f"   " + "-"*40)
        print(f"   Total nodes:        {self.stats['total_nodes']:>10,}")
        print()
        print(f"   Relationships:      {self.stats['total_relationships']:>10,}")
        print(f"   Cross-domain links: {self.stats['cross_domain_links']:>10,}")
        print()
        print(f"   Duration:           {duration_ms:>10,}ms")
        print()
        print("🌟 Knowledge Pathways:")
        print("   • Any verse → Quran domain → Root")
        print("   • Any hadith → Hadith domain → Quran → Root")
        print("   • Any code struct → BIZRA Self → Human Knowledge → Quran → Root")
        print("   • Any struct embodying Ihsan → Ihsan theme → Quranic Themes → Quran")
        print()
        print("الحمد لله - The House of Wisdom is complete")
        print("From divine revelation to running code - all paths lead to Truth")
        print()

        return {
            "status": "complete",
            "stats": self.stats,
            "output_dir": str(self.output_dir),
            "files": {
                "graph": str(graph_file),
                "stats": str(stats_file),
                "hierarchy": str(self.output_dir / "hierarchy.json"),
                "tree": str(tree_file),
            },
            "duration_ms": duration_ms,
        }

    def _link_quran_to_domain(self) -> List[GraphRelationship]:
        """Link all Quran nodes to the 'quran' domain"""
        links = []
        for node in self.all_nodes:
            if "Quran" in node.labels or "Chapter" in str(node.node_type) or "Verse" in str(node.node_type):
                rel = GraphRelationship(
                    from_node=node.node_id,
                    to_node="domain:quran",
                    rel_type=RelationType.BELONGS_TO,
                    properties={"domain": "Quran", "level": 0},
                    source="ultimate-integration",
                    confidence=1.0,
                )
                links.append(rel)
        return links

    def _link_hadith_to_domain(self) -> List[GraphRelationship]:
        """Link all Hadith nodes to the 'hadith' domain"""
        links = []
        for node in self.all_nodes:
            if "Hadith" in node.labels or "hadith:" in node.node_id:
                rel = GraphRelationship(
                    from_node=node.node_id,
                    to_node="domain:hadith",
                    rel_type=RelationType.BELONGS_TO,
                    properties={"domain": "Hadith", "level": 1},
                    source="ultimate-integration",
                    confidence=1.0,
                )
                links.append(rel)
        return links

    def _link_code_to_quran_themes(self, codebase_engine) -> List[GraphRelationship]:
        """
        Link code that embodies Islamic principles to Quranic themes

        Example: IhsanValidator struct → theme_ihsan → Quranic Themes → Quran
        """
        links = []

        theme_keywords = {
            "theme_ihsan": ["ihsan", "quality", "excellence", "validation"],
            "theme_adl": ["justice", "fair", "consensus", "byzantine"],
            "theme_amānah": ["trust", "receipt", "evidence", "proof", "signature"],
        }

        for node in codebase_engine.nodes:
            node_name = node.properties.get("name", "").lower()
            file_path = node.properties.get("file", "").lower()

            for theme_id, keywords in theme_keywords.items():
                if any(kw in node_name or kw in file_path for kw in keywords):
                    rel = GraphRelationship(
                        from_node=node.node_id,
                        to_node=theme_id,
                        rel_type=RelationType.RELATES_TO,
                        properties={
                            "theme": theme_id,
                            "evidence": "keyword match",
                        },
                        source="ultimate-integration",
                        confidence=0.90,
                    )
                    links.append(rel)
                    break  # One theme per node

        return links


# ============================================================================
# ENTRY POINT
# ============================================================================

async def build_ultimate_house_of_wisdom():
    """Build the complete House of Wisdom"""
    integration = UltimateKnowledgeIntegration()
    result = await integration.build_ultimate_graph()
    return result


if __name__ == "__main__":
    asyncio.run(build_ultimate_house_of_wisdom())
