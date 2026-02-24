"""
Knowledge Graph Schema

Defines the elite-level graph data model for BIZRA's living knowledge graph.

Philosophy: "We don't assume. If we must, we do it with Ihsān."

Node Types:
- Quranic: Chapter, Verse, Word, Root, Theme, Concept
- Code: File, Function, Struct, Trait, Module, Crate
- Documentation: Document, Section, Reference, Example
- Meta: Source, Version, Timestamp, Evidence

Relationship Types:
- Structural: CONTAINS, PART_OF, BELONGS_TO
- Semantic: REFERENCES, RELATES_TO, SIMILAR_TO
- Linguistic: DERIVES_FROM, TRANSLATES_TO
- Code: IMPORTS, IMPLEMENTS, CALLS, USES, TESTS
- Documentation: DOCUMENTS, EXPLAINS, EXEMPLIFIES
- Meta: SOURCED_FROM, VERIFIED_BY, SUPERSEDES
"""

from dataclasses import dataclass, field, asdict
from datetime import datetime
from enum import Enum
from typing import Dict, List, Any, Optional
import hashlib
import json


class NodeType(Enum):
    """Types of nodes in the knowledge graph"""
    # Quranic nodes
    CHAPTER = "Chapter"
    VERSE = "Verse"
    WORD = "Word"
    ROOT = "Root"
    THEME = "Theme"
    CONCEPT = "Concept"

    # Hadith nodes
    HADITH = "Hadith"
    HADITH_COLLECTION = "HadithCollection"
    HADITH_BOOK = "HadithBook"
    HADITH_CHAPTER = "HadithChapter"
    NARRATOR = "Narrator"
    NARRATOR_CHAIN = "NarratorChain"

    # Code nodes
    FILE = "File"
    FUNCTION = "Function"
    STRUCT = "Struct"
    TRAIT = "Trait"
    MODULE = "Module"
    CRATE = "Crate"

    # Documentation nodes
    DOCUMENT = "Document"
    SECTION = "Section"
    REFERENCE = "Reference"
    EXAMPLE = "Example"

    # Meta nodes
    SOURCE = "Source"
    VERSION = "Version"
    EVIDENCE = "Evidence"


class RelationType(Enum):
    """Types of relationships in the knowledge graph"""
    # Structural
    CONTAINS = "CONTAINS"
    PART_OF = "PART_OF"
    BELONGS_TO = "BELONGS_TO"

    # Semantic
    REFERENCES = "REFERENCES"
    RELATES_TO = "RELATES_TO"
    SIMILAR_TO = "SIMILAR_TO"

    # Linguistic
    DERIVES_FROM = "DERIVES_FROM"
    TRANSLATES_TO = "TRANSLATES_TO"

    # Hadith-specific
    NARRATED_BY = "NARRATED_BY"
    CONTEXTUALIZES = "CONTEXTUALIZES"
    ELABORATES = "ELABORATES"
    AUTHENTIC_CHAIN = "AUTHENTIC_CHAIN"
    ABROGATES = "ABROGATES"
    SUPPORTS = "SUPPORTS"

    # Code
    IMPORTS = "IMPORTS"
    IMPLEMENTS = "IMPLEMENTS"
    CALLS = "CALLS"
    USES = "USES"
    TESTS = "TESTS"

    # Documentation
    DOCUMENTS = "DOCUMENTS"
    EXPLAINS = "EXPLAINS"
    EXEMPLIFIES = "EXEMPLIFIES"

    # Meta
    SOURCED_FROM = "SOURCED_FROM"
    VERIFIED_BY = "VERIFIED_BY"
    SUPERSEDES = "SUPERSEDES"


@dataclass
class GraphNode:
    """
    Universal node structure for knowledge graph

    Philosophy: Every node is identified, sourced, and timestamped
    """
    node_id: str
    node_type: NodeType
    properties: Dict[str, Any] = field(default_factory=dict)
    labels: List[str] = field(default_factory=list)

    # Meta properties (every node has these)
    source: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    evidence_hash: Optional[str] = None
    confidence: float = 1.0  # 0.0-1.0

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.utcnow().isoformat()
        if not self.updated_at:
            self.updated_at = self.created_at
        if not self.evidence_hash:
            self.evidence_hash = self.compute_hash()

    def compute_hash(self) -> str:
        """Compute deterministic hash of node content"""
        content = {
            "node_id": self.node_id,
            "node_type": self.node_type.value,
            "properties": sorted(self.properties.items()),
        }
        content_json = json.dumps(content, sort_keys=True)
        return hashlib.sha256(content_json.encode()).hexdigest()[:16]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        return {
            "node_id": self.node_id,
            "node_type": self.node_type.value,
            "properties": self.properties,
            "labels": self.labels,
            "source": self.source,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "evidence_hash": self.evidence_hash,
            "confidence": self.confidence,
        }


@dataclass
class GraphRelationship:
    """
    Universal relationship structure for knowledge graph

    Philosophy: Every relationship is typed, directional, and verifiable
    """
    from_node: str  # node_id
    to_node: str    # node_id
    rel_type: RelationType
    properties: Dict[str, Any] = field(default_factory=dict)

    # Meta properties
    source: Optional[str] = None
    created_at: Optional[str] = None
    evidence_hash: Optional[str] = None
    confidence: float = 1.0

    def __post_init__(self):
        if not self.created_at:
            self.created_at = datetime.utcnow().isoformat()
        if not self.evidence_hash:
            self.evidence_hash = self.compute_hash()

    def compute_hash(self) -> str:
        """Compute deterministic hash of relationship"""
        content = {
            "from": self.from_node,
            "to": self.to_node,
            "type": self.rel_type.value,
            "properties": sorted(self.properties.items()),
        }
        content_json = json.dumps(content, sort_keys=True)
        return hashlib.sha256(content_json.encode()).hexdigest()[:16]

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for storage"""
        return {
            "from_node": self.from_node,
            "to_node": self.to_node,
            "rel_type": self.rel_type.value,
            "properties": self.properties,
            "source": self.source,
            "created_at": self.created_at,
            "evidence_hash": self.evidence_hash,
            "confidence": self.confidence,
        }


# Specialized node factories for common types

def create_chapter_node(chapter_number: int, phonetic: str, translation: str, city: str) -> GraphNode:
    """Create a Quranic chapter node"""
    return GraphNode(
        node_id=f"chapter:{chapter_number}",
        node_type=NodeType.CHAPTER,
        properties={
            "number": chapter_number,
            "phonetic": phonetic,
            "translation": translation,
            "revelation_city": city,
        },
        labels=["Quran", "Chapter"],
        source="quranic-corpus-api",
        confidence=1.0,
    )


def create_verse_node(chapter: int, verse: int, text: Optional[str] = None) -> GraphNode:
    """Create a Quranic verse node"""
    props = {
        "chapter": chapter,
        "verse": verse,
        "reference": f"{chapter}:{verse}",
    }
    if text:
        props["text"] = text

    return GraphNode(
        node_id=f"verse:{chapter}:{verse}",
        node_type=NodeType.VERSE,
        properties=props,
        labels=["Quran", "Verse"],
        source="quranic-corpus-api",
        confidence=1.0,
    )


def create_file_node(file_path: str, language: str, size: int) -> GraphNode:
    """Create a code file node"""
    return GraphNode(
        node_id=f"file:{file_path}",
        node_type=NodeType.FILE,
        properties={
            "path": file_path,
            "language": language,
            "size_bytes": size,
        },
        labels=["Code", "File", language],
        source="codebase-analyzer",
        confidence=1.0,
    )


def create_function_node(file_path: str, function_name: str, signature: str) -> GraphNode:
    """Create a function node"""
    return GraphNode(
        node_id=f"function:{file_path}::{function_name}",
        node_type=NodeType.FUNCTION,
        properties={
            "name": function_name,
            "signature": signature,
            "file": file_path,
        },
        labels=["Code", "Function"],
        source="codebase-analyzer",
        confidence=1.0,
    )


# Specialized relationship factories

def create_contains_relationship(parent_id: str, child_id: str) -> GraphRelationship:
    """Create CONTAINS relationship (e.g., Chapter -> Verse)"""
    return GraphRelationship(
        from_node=parent_id,
        to_node=child_id,
        rel_type=RelationType.CONTAINS,
        confidence=1.0,
    )


def create_references_relationship(source_id: str, target_id: str, context: Optional[str] = None) -> GraphRelationship:
    """Create REFERENCES relationship"""
    props = {}
    if context:
        props["context"] = context

    return GraphRelationship(
        from_node=source_id,
        to_node=target_id,
        rel_type=RelationType.REFERENCES,
        properties=props,
        confidence=0.95,  # Slightly lower for inferred references
    )


def create_documents_relationship(doc_id: str, code_id: str) -> GraphRelationship:
    """Create DOCUMENTS relationship (Documentation -> Code)"""
    return GraphRelationship(
        from_node=doc_id,
        to_node=code_id,
        rel_type=RelationType.DOCUMENTS,
        confidence=0.98,
    )


# Hadith-specific node factories

def create_hadith_node(
    collection: str,
    book: str,
    hadith_number: int,
    arabic_text: str,
    english_text: str,
    grade: str,
    narrator_chain: Optional[str] = None,
) -> GraphNode:
    """Create a Hadith node"""
    props = {
        "collection": collection,
        "book": book,
        "hadith_number": hadith_number,
        "arabic_text": arabic_text,
        "english_text": english_text,
        "grade": grade,
    }
    if narrator_chain:
        props["narrator_chain"] = narrator_chain

    return GraphNode(
        node_id=f"hadith:{collection.lower()}:{book}:{hadith_number}",
        node_type=NodeType.HADITH,
        properties=props,
        labels=["Hadith", collection, grade],
        source="hadith-json",
        confidence=1.0 if grade in ["Sahih", "Authentic"] else 0.95,
    )


def create_hadith_collection_node(collection_name: str, description: str) -> GraphNode:
    """Create a Hadith collection node (e.g., Sahih Bukhari)"""
    return GraphNode(
        node_id=f"hadithcollection:{collection_name.lower().replace(' ', '_')}",
        node_type=NodeType.HADITH_COLLECTION,
        properties={
            "name": collection_name,
            "description": description,
        },
        labels=["Hadith", "Collection"],
        source="hadith-metadata",
        confidence=1.0,
    )


def create_hadith_book_node(collection: str, book_number: int, book_name: str) -> GraphNode:
    """Create a Hadith book node (chapter/book within a collection)"""
    return GraphNode(
        node_id=f"hadithbook:{collection.lower()}:{book_number}",
        node_type=NodeType.HADITH_BOOK,
        properties={
            "collection": collection,
            "book_number": book_number,
            "book_name": book_name,
        },
        labels=["Hadith", "Book"],
        source="hadith-metadata",
        confidence=1.0,
    )


def create_narrator_node(narrator_name: str, narrator_info: Optional[str] = None) -> GraphNode:
    """Create a narrator node"""
    props = {"name": narrator_name}
    if narrator_info:
        props["info"] = narrator_info

    return GraphNode(
        node_id=f"narrator:{narrator_name.lower().replace(' ', '_')}",
        node_type=NodeType.NARRATOR,
        properties=props,
        labels=["Hadith", "Narrator"],
        source="narrator-database",
        confidence=1.0,
    )


# Hadith-specific relationship factories

def create_contextualizes_relationship(
    hadith_id: str,
    verse_id: str,
    context: Optional[str] = None,
) -> GraphRelationship:
    """Create CONTEXTUALIZES relationship (Hadith -> Verse)"""
    props = {}
    if context:
        props["context"] = context

    return GraphRelationship(
        from_node=hadith_id,
        to_node=verse_id,
        rel_type=RelationType.CONTEXTUALIZES,
        properties=props,
        confidence=0.95,
    )


def create_elaborates_relationship(
    hadith_id: str,
    verse_id: str,
    elaboration_type: Optional[str] = None,
) -> GraphRelationship:
    """Create ELABORATES relationship (Hadith elaborates on Verse)"""
    props = {}
    if elaboration_type:
        props["elaboration_type"] = elaboration_type

    return GraphRelationship(
        from_node=hadith_id,
        to_node=verse_id,
        rel_type=RelationType.ELABORATES,
        properties=props,
        confidence=0.95,
    )


def create_narrated_by_relationship(hadith_id: str, narrator_id: str) -> GraphRelationship:
    """Create NARRATED_BY relationship (Hadith -> Narrator)"""
    return GraphRelationship(
        from_node=hadith_id,
        to_node=narrator_id,
        rel_type=RelationType.NARRATED_BY,
        confidence=1.0,
    )


def create_authentic_chain_relationship(hadith_id: str, chain_grade: str = "Sahih") -> GraphRelationship:
    """Create AUTHENTIC_CHAIN relationship (Hadith -> Narrator Chain)"""
    return GraphRelationship(
        from_node=hadith_id,
        to_node=f"chain:{hadith_id}",
        rel_type=RelationType.AUTHENTIC_CHAIN,
        properties={"grade": chain_grade},
        confidence=1.0 if chain_grade == "Sahih" else 0.90,
    )


class GraphSchema:
    """
    Knowledge graph schema validator and manager

    Ensures all nodes and relationships conform to the elite-level schema
    """

    @staticmethod
    def validate_node(node: GraphNode) -> bool:
        """Validate node conforms to schema"""
        # Required fields
        if not node.node_id or not node.node_type:
            return False

        # Node ID format validation
        expected_prefix = node.node_type.value.lower()
        if not node.node_id.startswith(expected_prefix + ":"):
            return False

        # Meta properties present
        if not node.created_at or not node.evidence_hash:
            return False

        # Confidence in valid range
        if not (0.0 <= node.confidence <= 1.0):
            return False

        return True

    @staticmethod
    def validate_relationship(rel: GraphRelationship) -> bool:
        """Validate relationship conforms to schema"""
        # Required fields
        if not rel.from_node or not rel.to_node or not rel.rel_type:
            return False

        # No self-loops (optional constraint)
        if rel.from_node == rel.to_node:
            return False

        # Meta properties present
        if not rel.created_at or not rel.evidence_hash:
            return False

        # Confidence in valid range
        if not (0.0 <= rel.confidence <= 1.0):
            return False

        return True

    @staticmethod
    def get_schema_stats() -> Dict[str, int]:
        """Get schema statistics"""
        return {
            "node_types": len(NodeType),
            "relationship_types": len(RelationType),
            "total_types": len(NodeType) + len(RelationType),
        }
