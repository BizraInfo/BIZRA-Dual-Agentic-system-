"""
BIZRA House of Wisdom - Complete Knowledge Hierarchy

Architecture:
    ROOT → Quran (Divine Revelation - Absolute Truth)
      ├─→ Hadith (Prophetic Tradition - Contextualizes Quran)
      ├─→ Quranic Themes (Extracted Concepts: Adl, Rahma, Ilm, Hikma, Ihsan)
      └─→ Human Knowledge Tree
            ├─→ Mathematics (Algebra, Geometry, Calculus, Number Theory, ...)
            ├─→ Sciences (Physics, Chemistry, Biology, Astronomy, ...)
            ├─→ Technology (Computer Science, Engineering, AI, ...)
            ├─→ Arts & Humanities (Literature, Philosophy, History, ...)
            └─→ BIZRA Codebase (Self-Knowledge - Code, Docs, Architecture)

Philosophy: "From divine revelation to human knowledge - all paths lead to Truth"

Growth Model:
    - Static Layer: Quran (6,236 verses - unchanging)
    - Semi-Static Layer: Hadith (34,178 narrations - authenticated collection)
    - Dynamic Layer: Human knowledge (infinite growth potential)
    - Self-Reflective Layer: BIZRA's own code and learnings

This is BIZRA's بيت الحكمة (House of Wisdom) - the foundation for all reasoning,
validation, and knowledge synthesis.
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, field
from datetime import datetime

from .schema import (
    GraphNode,
    GraphRelationship,
    NodeType,
    RelationType,
    GraphSchema,
)


# ============================================================================
# KNOWLEDGE DOMAINS - Hierarchical Structure
# ============================================================================

@dataclass
class KnowledgeDomain:
    """
    Represents a domain of knowledge in the hierarchy

    Examples:
        - Mathematics → Algebra → Linear Algebra → Vector Spaces
        - Sciences → Physics → Quantum Mechanics → Entanglement
        - Technology → Computer Science → Algorithms → Graph Algorithms
    """
    domain_id: str
    name: str
    description: str
    parent_domain: Optional[str] = None  # None for root domains
    level: int = 0  # 0=root (Quran), 1=major branches, 2=fields, 3=subfields
    tags: List[str] = field(default_factory=list)

    # Metadata
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    node_count: int = 0  # How many knowledge nodes in this domain
    relationship_count: int = 0  # How many relationships


class BizraHouseOfWisdom:
    """
    BIZRA's Complete Knowledge Hierarchy

    Root: Quran (Divine Revelation)
      ├─ Hadith (Prophetic Tradition)
      ├─ Quranic Themes (Extracted Concepts)
      └─ Human Knowledge
           ├─ Mathematics
           ├─ Sciences
           ├─ Technology
           ├─ Arts & Humanities
           └─ BIZRA Codebase (Self-Knowledge)

    This structure grows dynamically as BIZRA learns new knowledge,
    while maintaining the unchanging foundation of divine revelation.
    """

    def __init__(self):
        self.domains: Dict[str, KnowledgeDomain] = {}
        self.nodes: List[GraphNode] = []
        self.relationships: List[GraphRelationship] = []

        # Initialize the foundational hierarchy
        self._initialize_foundation()

    def _initialize_foundation(self):
        """
        Initialize the foundational knowledge hierarchy

        This creates the root structure that all knowledge extends from
        """

        # ====================================================================
        # LEVEL 0: ROOT - DIVINE REVELATION
        # ====================================================================

        self.add_domain(KnowledgeDomain(
            domain_id="quran",
            name="Quran",
            description="Divine Revelation - The absolute foundation of truth and wisdom",
            parent_domain=None,
            level=0,
            tags=["divine", "revelation", "root", "unchanging", "absolute_truth"],
        ))

        # ====================================================================
        # LEVEL 1: MAJOR BRANCHES FROM QURAN
        # ====================================================================

        # Hadith - Extends Quran
        self.add_domain(KnowledgeDomain(
            domain_id="hadith",
            name="Hadith (Prophetic Tradition)",
            description="Authentic narrations contextualizing and elaborating the Quran",
            parent_domain="quran",
            level=1,
            tags=["prophetic", "sunnah", "authentication", "contextual"],
        ))

        # Quranic Themes - Extracted Concepts
        self.add_domain(KnowledgeDomain(
            domain_id="quranic_themes",
            name="Quranic Themes & Concepts",
            description="Core themes and concepts extracted from divine revelation",
            parent_domain="quran",
            level=1,
            tags=["themes", "concepts", "principles", "values"],
        ))

        # Define major Quranic themes
        quranic_themes = [
            ("adl", "Justice (Adl)", "Divine justice and fairness"),
            ("rahma", "Mercy (Rahma)", "Divine mercy and compassion"),
            ("ilm", "Knowledge (Ilm)", "Pursuit of knowledge and understanding"),
            ("hikma", "Wisdom (Hikma)", "Divine wisdom and discernment"),
            ("ihsan", "Excellence (Ihsan)", "Perfection in worship and action"),
            ("taqwa", "Consciousness (Taqwa)", "God-consciousness and piety"),
            ("sabr", "Patience (Sabr)", "Steadfastness and perseverance"),
            ("shukr", "Gratitude (Shukr)", "Thankfulness and appreciation"),
        ]

        for theme_id, name, desc in quranic_themes:
            self.add_domain(KnowledgeDomain(
                domain_id=f"theme_{theme_id}",
                name=name,
                description=desc,
                parent_domain="quranic_themes",
                level=2,
                tags=["theme", "principle", "quranic_value"],
            ))

        # Human Knowledge Root
        self.add_domain(KnowledgeDomain(
            domain_id="human_knowledge",
            name="Human Knowledge",
            description="All human knowledge built upon divine guidance",
            parent_domain="quran",
            level=1,
            tags=["human", "empirical", "growing", "dynamic"],
        ))

        # ====================================================================
        # LEVEL 2: MAJOR HUMAN KNOWLEDGE DOMAINS
        # ====================================================================

        # Mathematics
        self.add_domain(KnowledgeDomain(
            domain_id="mathematics",
            name="Mathematics",
            description="The language of patterns, structures, and quantitative reasoning",
            parent_domain="human_knowledge",
            level=2,
            tags=["math", "logic", "abstract", "foundational"],
        ))

        math_fields = [
            ("algebra", "Algebra", "Study of mathematical symbols and rules"),
            ("geometry", "Geometry", "Study of shapes, sizes, and spatial properties"),
            ("calculus", "Calculus", "Study of change and continuous functions"),
            ("number_theory", "Number Theory", "Study of integers and their properties"),
            ("statistics", "Statistics", "Analysis and interpretation of data"),
            ("discrete_math", "Discrete Mathematics", "Study of discrete structures"),
        ]

        for field_id, name, desc in math_fields:
            self.add_domain(KnowledgeDomain(
                domain_id=f"math_{field_id}",
                name=name,
                description=desc,
                parent_domain="mathematics",
                level=3,
                tags=["mathematics", field_id],
            ))

        # Sciences
        self.add_domain(KnowledgeDomain(
            domain_id="sciences",
            name="Natural Sciences",
            description="Systematic study of the natural world through observation and experiment",
            parent_domain="human_knowledge",
            level=2,
            tags=["science", "empirical", "natural_world"],
        ))

        science_fields = [
            ("physics", "Physics", "Study of matter, energy, space, and time"),
            ("chemistry", "Chemistry", "Study of matter and its transformations"),
            ("biology", "Biology", "Study of living organisms and life"),
            ("astronomy", "Astronomy", "Study of celestial objects and the universe"),
            ("geology", "Geology", "Study of Earth's physical structure and substance"),
        ]

        for field_id, name, desc in science_fields:
            self.add_domain(KnowledgeDomain(
                domain_id=f"sci_{field_id}",
                name=name,
                description=desc,
                parent_domain="sciences",
                level=3,
                tags=["science", field_id],
            ))

        # Technology & Engineering
        self.add_domain(KnowledgeDomain(
            domain_id="technology",
            name="Technology & Engineering",
            description="Application of scientific knowledge for practical purposes",
            parent_domain="human_knowledge",
            level=2,
            tags=["technology", "engineering", "applied", "innovation"],
        ))

        tech_fields = [
            ("computer_science", "Computer Science", "Study of computation, information, and automation"),
            ("artificial_intelligence", "Artificial Intelligence", "Machines that simulate human intelligence"),
            ("software_engineering", "Software Engineering", "Design and development of software systems"),
            ("algorithms", "Algorithms & Data Structures", "Efficient problem-solving methods"),
            ("distributed_systems", "Distributed Systems", "Computing across multiple machines"),
            ("cryptography", "Cryptography", "Secure communication and data protection"),
        ]

        for field_id, name, desc in tech_fields:
            self.add_domain(KnowledgeDomain(
                domain_id=f"tech_{field_id}",
                name=name,
                description=desc,
                parent_domain="technology",
                level=3,
                tags=["technology", field_id],
            ))

        # Arts & Humanities
        self.add_domain(KnowledgeDomain(
            domain_id="arts_humanities",
            name="Arts & Humanities",
            description="Study of human culture, creativity, and expression",
            parent_domain="human_knowledge",
            level=2,
            tags=["arts", "humanities", "culture", "philosophy"],
        ))

        humanities_fields = [
            ("philosophy", "Philosophy", "Study of fundamental questions about existence and knowledge"),
            ("history", "History", "Study of past events and human societies"),
            ("literature", "Literature", "Written works of artistic or intellectual value"),
            ("linguistics", "Linguistics", "Scientific study of language"),
            ("ethics", "Ethics", "Study of moral principles and values"),
        ]

        for field_id, name, desc in humanities_fields:
            self.add_domain(KnowledgeDomain(
                domain_id=f"hum_{field_id}",
                name=name,
                description=desc,
                parent_domain="arts_humanities",
                level=3,
                tags=["humanities", field_id],
            ))

        # ====================================================================
        # SPECIAL DOMAIN: BIZRA SELF-KNOWLEDGE
        # ====================================================================

        self.add_domain(KnowledgeDomain(
            domain_id="bizra_self",
            name="BIZRA Self-Knowledge",
            description="BIZRA's own codebase, architecture, and learnings",
            parent_domain="human_knowledge",
            level=2,
            tags=["self_knowledge", "meta", "bizra", "evolving"],
        ))

        bizra_components = [
            ("codebase", "Codebase", "BIZRA's source code and implementation"),
            ("architecture", "Architecture", "System design and patterns"),
            ("documentation", "Documentation", "Technical documentation and guides"),
            ("learnings", "Learnings & Insights", "Discoveries and optimizations"),
            ("benchmarks", "Benchmarks", "Performance measurements and tests"),
        ]

        for comp_id, name, desc in bizra_components:
            self.add_domain(KnowledgeDomain(
                domain_id=f"bizra_{comp_id}",
                name=name,
                description=desc,
                parent_domain="bizra_self",
                level=3,
                tags=["bizra", "self_knowledge", comp_id],
            ))

    def add_domain(self, domain: KnowledgeDomain):
        """Add a domain to the hierarchy"""
        self.domains[domain.domain_id] = domain

    def get_domain_tree(self, root_id: str = "quran") -> Dict[str, Any]:
        """
        Get hierarchical tree structure starting from a domain

        Returns nested dict representing the tree
        """
        root = self.domains.get(root_id)
        if not root:
            return {}

        tree = {
            "domain_id": root.domain_id,
            "name": root.name,
            "description": root.description,
            "level": root.level,
            "tags": root.tags,
            "node_count": root.node_count,
            "children": []
        }

        # Find all children of this domain
        children = [
            d for d in self.domains.values()
            if d.parent_domain == root_id
        ]

        # Recursively build subtrees
        for child in sorted(children, key=lambda x: x.name):
            tree["children"].append(self.get_domain_tree(child.domain_id))

        return tree

    def get_path_to_root(self, domain_id: str) -> List[str]:
        """
        Get path from a domain back to root (Quran)

        Example: "tech_algorithms" → ["tech_algorithms", "technology", "human_knowledge", "quran"]
        """
        path = []
        current_id = domain_id

        while current_id:
            path.append(current_id)
            domain = self.domains.get(current_id)
            if not domain:
                break
            current_id = domain.parent_domain

        return path

    def link_knowledge_to_domain(
        self,
        knowledge_node: GraphNode,
        domain_id: str,
    ) -> GraphRelationship:
        """
        Link a knowledge node to its domain

        This creates the "BELONGS_TO" relationship connecting any piece
        of knowledge to its place in the hierarchy
        """
        return GraphRelationship(
            from_node=knowledge_node.node_id,
            to_node=f"domain:{domain_id}",
            rel_type=RelationType.BELONGS_TO,
            properties={
                "domain_name": self.domains[domain_id].name,
                "domain_level": self.domains[domain_id].level,
            },
            source="bizra-house-of-wisdom",
            confidence=1.0,
        )

    def visualize_tree_ascii(self, root_id: str = "quran", max_depth: int = 3) -> str:
        """
        Generate ASCII art visualization of the knowledge tree

        Example output:
            Quran
            ├── Hadith
            ├── Quranic Themes
            │   ├── Justice (Adl)
            │   └── Mercy (Rahma)
            └── Human Knowledge
                ├── Mathematics
                └── Sciences
        """
        def build_tree(domain_id: str, prefix: str = "", is_last: bool = True, depth: int = 0) -> str:
            if depth >= max_depth:
                return ""

            domain = self.domains.get(domain_id)
            if not domain:
                return ""

            # Tree characters
            connector = "└── " if is_last else "├── "
            extension = "    " if is_last else "│   "

            # Current line
            result = f"{prefix}{connector}{domain.name}"
            if domain.node_count > 0:
                result += f" ({domain.node_count:,} nodes)"
            result += "\n"

            # Get children
            children = [
                d for d in self.domains.values()
                if d.parent_domain == domain_id
            ]

            # Recursively add children
            for i, child in enumerate(sorted(children, key=lambda x: x.name)):
                is_last_child = (i == len(children) - 1)
                result += build_tree(
                    child.domain_id,
                    prefix + extension,
                    is_last_child,
                    depth + 1
                )

            return result

        root = self.domains.get(root_id)
        if not root:
            return "Domain not found"

        header = f"\n{'='*80}\n"
        header += f"🏛️  BIZRA HOUSE OF WISDOM - Knowledge Hierarchy\n"
        header += f"{'='*80}\n\n"

        tree = f"{root.name}"
        if root.node_count > 0:
            tree += f" ({root.node_count:,} nodes)"
        tree += "\n"

        # Get children of root
        children = [
            d for d in self.domains.values()
            if d.parent_domain == root_id
        ]

        for i, child in enumerate(sorted(children, key=lambda x: x.name)):
            is_last = (i == len(children) - 1)
            tree += build_tree(child.domain_id, "", is_last, 1)

        footer = f"\n{'='*80}\n"
        footer += f"Total Domains: {len(self.domains)}\n"
        footer += f"{'='*80}\n"

        return header + tree + footer

    def export_hierarchy(self, output_file: Path):
        """Export complete hierarchy to JSON"""
        tree = self.get_domain_tree("quran")

        export_data = {
            "metadata": {
                "name": "BIZRA House of Wisdom",
                "description": "Complete hierarchical knowledge structure from Quran to human knowledge",
                "created_at": datetime.utcnow().isoformat(),
                "total_domains": len(self.domains),
                "philosophy": "From divine revelation to human knowledge - all paths lead to Truth",
            },
            "hierarchy": tree,
            "domains": {
                domain_id: {
                    "name": domain.name,
                    "description": domain.description,
                    "parent": domain.parent_domain,
                    "level": domain.level,
                    "tags": domain.tags,
                    "node_count": domain.node_count,
                }
                for domain_id, domain in self.domains.items()
            }
        }

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)

        return export_data


# ============================================================================
# DEMONSTRATION
# ============================================================================

def demonstrate_house_of_wisdom():
    """Demonstrate the complete knowledge hierarchy"""

    print("\n" + "="*80)
    print("🏛️  BIZRA HOUSE OF WISDOM - Knowledge Hierarchy Initialization")
    print("="*80)
    print()
    print("Building BIZRA's complete knowledge structure:")
    print("  • Root: Quran (Divine Revelation)")
    print("  • Branch 1: Hadith (Prophetic Tradition)")
    print("  • Branch 2: Quranic Themes (Core Concepts)")
    print("  • Branch 3: Human Knowledge (Mathematics, Sciences, Technology, Arts)")
    print("  • Branch 4: BIZRA Self-Knowledge (Codebase, Architecture, Learnings)")
    print()

    # Initialize House of Wisdom
    house = BizraHouseOfWisdom()

    # Visualize the tree
    tree_viz = house.visualize_tree_ascii(max_depth=3)
    print(tree_viz)

    # Export hierarchy
    output_dir = Path("knowledge_graph_output")
    output_dir.mkdir(exist_ok=True)

    hierarchy_file = output_dir / "bizra_house_of_wisdom_hierarchy.json"
    export_data = house.export_hierarchy(hierarchy_file)

    print(f"\n✅ Hierarchy exported to: {hierarchy_file}")
    print(f"\n📊 Statistics:")
    print(f"   Total Domains: {len(house.domains)}")
    print(f"   Root Domain: Quran (Divine Revelation)")
    print(f"   Levels: 0 (Root) → 3 (Specific Fields)")
    print()

    # Show example domain paths
    print("📍 Example Domain Paths to Root:")
    examples = [
        "tech_algorithms",
        "math_algebra",
        "sci_physics",
        "hum_philosophy",
        "bizra_architecture",
        "theme_ihsan",
    ]

    for domain_id in examples:
        if domain_id in house.domains:
            path = house.get_path_to_root(domain_id)
            path_names = [house.domains[d].name for d in path]
            print(f"   {' ← '.join(path_names)}")

    print()
    print("الحمد لله - The House of Wisdom is established")
    print("This structure will grow as BIZRA learns, always rooted in divine guidance.")
    print()

    return house


if __name__ == "__main__":
    demonstrate_house_of_wisdom()
