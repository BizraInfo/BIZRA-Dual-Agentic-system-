#!/usr/bin/env python3
"""
BIZRA Knowledge Vault - Python Ingestion Engine
Lightweight alternative to R pipeline for quick wins.
"""

import json
import hashlib
import os
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, asdict, is_dataclass
from typing import List, Dict, Optional, Any
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger("KnowledgeVault")

VAULT_ROOT = Path(__file__).parent.parent
REPO_ROOT = VAULT_ROOT.parent

@dataclass
class Document:
    doc_id: str
    source_type: str
    uri: str
    title: str
    text: str
    created_at: str
    project: str
    tags: List[str]
    metadata: Dict[str, Any]

@dataclass
class Chunk:
    chunk_id: str
    doc_id: str
    chunk_index: int
    chunk_text: str
    token_est: int
    chunk_type: str
    metadata: Dict[str, Any]

@dataclass
class Entity:
    entity_id: str
    entity_type: str
    canonical_name: str
    aliases: List[str]
    confidence: float
    mention_count: int
    source_chunks: List[str]


def hash_content(content: str) -> str:
    """Generate SHA256 hash of content."""
    return hashlib.sha256(content.encode()).hexdigest()[:16]


def estimate_tokens(text: str) -> int:
    """Rough token estimation (4 chars per token)."""
    return len(text) // 4


def _to_repo_relative(path: Path) -> str:
    """Return a repository-relative path when possible."""
    try:
        return str(path.relative_to(REPO_ROOT))
    except ValueError:
        return str(path)


def resolve_uri(uri: str, repo_root: Path = REPO_ROOT) -> Path:
    """Resolve a repo-relative document URI to an absolute path."""
    return (repo_root / uri).resolve()


def load_chat_export(path: Path) -> Document:
    """Load a chat export JSON file."""
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as err:
        raise RuntimeError(f"Failed to load chat export at {path}: {err}") from err
    
    # Format messages to text
    messages = data.get("messages", [])
    text_parts = []
    for msg in messages:
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        text_parts.append(f"[{role}]: {content}")
    
    full_text = "\n\n".join(text_parts)
    
    return Document(
        doc_id=hash_content(str(path) + full_text),
        source_type="chat",
        uri=_to_repo_relative(path),
        title=data.get("title", path.stem),
        text=full_text,
        created_at=data.get("created_at", datetime.now().isoformat()),
        project=data.get("metadata", {}).get("project", "default"),
        tags=data.get("metadata", {}).get("topics", []),
        metadata={
            "model": data.get("model"),
            "message_count": len(messages),
            "tools_used": data.get("metadata", {}).get("tools_used", [])
        }
    )


def chunk_by_turns(doc: Document, window_size: int = 3, overlap: int = 0) -> List[Chunk]:
    """Chunk chat by conversation turns using a fixed window and optional overlap."""
    if window_size <= 0:
        raise ValueError(f"window_size must be > 0 (got {window_size})")
    if overlap < 0:
        raise ValueError(f"overlap must be >= 0 (got {overlap})")
    if overlap >= window_size:
        raise ValueError(
            f"overlap must be smaller than window_size to avoid infinite loop (overlap={overlap}, window_size={window_size})"
        )

    turns = doc.text.split("\n\n")
    turns = [t for t in turns if t.strip()]
    
    chunks = []
    i = 0
    chunk_idx = 0
    step = window_size - overlap
    
    while i < len(turns):
        end = min(i + window_size, len(turns))
        chunk_text = "\n\n".join(turns[i:end])
        
        chunks.append(Chunk(
            chunk_id=f"{doc.doc_id}-c{chunk_idx}",
            doc_id=doc.doc_id,
            chunk_index=chunk_idx,
            chunk_text=chunk_text,
            token_est=estimate_tokens(chunk_text),
            chunk_type="conversation_turn",
            metadata={"turn_start": i, "turn_end": end - 1}
        ))
        
        i += step
        chunk_idx += 1
    
    return chunks


def extract_entities_rules(chunks: List[Chunk]) -> List[Entity]:
    """Rule-based entity extraction with disambiguation for single-letter tokens."""
    import re
    
    entity_patterns = {
        "Language": r"\b(Python|Rust|JavaScript|TypeScript|Julia|Go|Java|C\+\+)\b",
        "Library": r"\b(PyTorch|TensorFlow|PyO3|maturin|tidyverse|NumPy|Pandas|arrow)\b",
        "Model": r"\b(GPT-4|Claude|Llama|Mistral|Gemini|BERT|text-embedding-3)\b",
        "Tool": r"\b(Docker|Kubernetes|Git|GitHub|Neo4j|PostgreSQL|DuckDB|Qdrant)\b",
        "Concept": r"\b(Hypergraph|RAG|Knowledge Graph|FFI|Resonance Mesh|SNR)\b",
        "Method": r"\b(AST|chunking|embedding|entity extraction|vectorization)\b"
    }
    
    # Special pattern for R programming language - requires contextual signals
    # to avoid false positives from single-letter matches
    r_language_patterns = [
        r"\bR\s+language\b",
        r"\bR\s+package\b",
        r"\bR\s+pipeline\b",
        r"\btargets\s+R\b",
        r"`targets`\s+R\b",
        r"\bR's\s+`targets`\b",
        r"\bR\s+script\b",
        r"\bstatistical\s+.*\bR\b",
    ]
    
    entity_map: Dict[str, Entity] = {}  # canonical_key -> Entity
    
    for chunk in chunks:
        text = chunk.chunk_text
        
        for entity_type, pattern in entity_patterns.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                canonical = match.strip()
                canonical_key = canonical.lower().strip()
                
                # Skip single-character entities (too ambiguous)
                if len(canonical_key) <= 1:
                    continue
                
                if canonical_key not in entity_map:
                    entity_map[canonical_key] = Entity(
                        entity_id=f"e-{hash_content(canonical_key + entity_type)[:8]}",
                        entity_type=entity_type,
                        canonical_name=canonical,
                        aliases=[],
                        confidence=0.9,
                        mention_count=0,
                        source_chunks=[]
                    )
                else:
                    # Preserve first-seen casing; push other casings into aliases
                    if canonical != entity_map[canonical_key].canonical_name and canonical not in entity_map[canonical_key].aliases:
                        entity_map[canonical_key].aliases.append(canonical)
                
                entity_map[canonical_key].mention_count += 1
                if chunk.chunk_id not in entity_map[canonical_key].source_chunks:
                    entity_map[canonical_key].source_chunks.append(chunk.chunk_id)
        
        # Special handling for R programming language with contextual matching
        for r_pattern in r_language_patterns:
            if re.search(r_pattern, text, re.IGNORECASE):
                canonical_key = "r_language"
                if canonical_key not in entity_map:
                    entity_map[canonical_key] = Entity(
                        entity_id=f"e-{hash_content(canonical_key + 'Language')[:8]}",
                        entity_type="Language",
                        canonical_name="R (programming language)",
                        aliases=["R language", "R package", "targets R"],
                        confidence=0.7,  # Lower confidence due to disambiguation
                        mention_count=0,
                        source_chunks=[]
                    )
                entity_map[canonical_key].mention_count += 1
                if chunk.chunk_id not in entity_map[canonical_key].source_chunks:
                    entity_map[canonical_key].source_chunks.append(chunk.chunk_id)
                break  # Only count once per chunk
    
    return list(entity_map.values())


def build_graph_jsonl(docs: List[Document], chunks: List[Chunk], entities: List[Entity], output_path: Path):
    """Export graph to JSONL format."""
    with open(output_path, "w") as f:
        # Document nodes
        for doc in docs:
            node = {
                "type": "node",
                "id": doc.doc_id,
                "label": "Document",
                "properties": {
                    "title": doc.title,
                    "source_type": doc.source_type,
                    "project": doc.project
                }
            }
            f.write(json.dumps(node) + "\n")
        
        # Chunk nodes
        for chunk in chunks:
            node = {
                "type": "node",
                "id": chunk.chunk_id,
                "label": "Chunk",
                "properties": {
                    "text_preview": chunk.chunk_text[:200],
                    "token_est": chunk.token_est
                }
            }
            f.write(json.dumps(node) + "\n")
            
            # Chunk -> Document edge
            edge = {
                "type": "edge",
                "source": chunk.chunk_id,
                "target": chunk.doc_id,
                "label": "PART_OF"
            }
            f.write(json.dumps(edge) + "\n")
        
        # Entity nodes
        for entity in entities:
            node = {
                "type": "node",
                "id": entity.entity_id,
                "label": "Entity",
                "properties": {
                    "name": entity.canonical_name,
                    "display_name": entity.canonical_name,
                    "canonical_key": entity.canonical_name.lower().strip(),
                    "entity_type": entity.entity_type,
                    "mention_count": entity.mention_count
                }
            }
            f.write(json.dumps(node) + "\n")
            
            # Chunk -> Entity edges
            for chunk_id in entity.source_chunks:
                edge = {
                    "type": "edge",
                    "source": chunk_id,
                    "target": entity.entity_id,
                    "label": "MENTIONS"
                }
                f.write(json.dumps(edge) + "\n")
    
    logger.info(f"Wrote graph to {output_path}")


def save_parquet_like_json(data: List[Any], output_path: Path):
    """Save as JSONL (parquet-like for now)."""
    with open(output_path, "w") as f:
        for item in data:
            if is_dataclass(item):
                f.write(json.dumps(asdict(item)) + "\n")
            else:
                f.write(json.dumps(item) + "\n")
    logger.info(f"Wrote {len(data)} records to {output_path}")


def ingest_chats(window_size: int = 3, overlap: int = 0):
    """Ingest all chat exports."""
    chat_dir = VAULT_ROOT / "raw" / "chats"
    index_dir = VAULT_ROOT / "index"
    if not chat_dir.exists():
        raise FileNotFoundError(f"Chat directory does not exist: {chat_dir}")
    if not chat_dir.is_dir():
        raise NotADirectoryError(f"Chat directory path is not a directory: {chat_dir}")
    try:
        index_dir.mkdir(parents=True, exist_ok=True)
    except OSError as err:
        raise OSError(f"Failed to create index directory {index_dir}: {err}")
    if not os.access(index_dir, os.W_OK):
        raise PermissionError(f"Index directory is not writable: {index_dir}")
    
    all_docs = []
    all_chunks = []
    all_entities = []
    
    # Find all JSON chat files
    chat_files = list(chat_dir.glob("*.json"))
    logger.info(f"Found {len(chat_files)} chat files")
    
    for chat_file in chat_files:
        logger.info(f"Processing: {chat_file.name}")
        
        # Load document
        doc = load_chat_export(chat_file)
        all_docs.append(doc)
        
        # Chunk
        chunks = chunk_by_turns(doc, window_size=window_size, overlap=overlap)
        all_chunks.extend(chunks)
        logger.info(f"  Created {len(chunks)} chunks")
        
        # Extract entities
        entities = extract_entities_rules(chunks)
        all_entities.extend(entities)
        logger.info(f"  Extracted {len(entities)} entities")
    
    # Deduplicate entities
    entity_map: Dict[str, Entity] = {}
    for e in all_entities:
        key = e.canonical_name.lower().strip()
        if key not in entity_map:
            e.source_chunks = list(dict.fromkeys(e.source_chunks))
            entity_map[key] = e
        else:
            existing = entity_map[key]
            if e.canonical_name != existing.canonical_name and e.canonical_name not in existing.aliases:
                existing.aliases.append(e.canonical_name)
            for alias in e.aliases:
                if alias not in existing.aliases and alias != existing.canonical_name:
                    existing.aliases.append(alias)
            existing.mention_count += e.mention_count
            for chunk_id in e.source_chunks:
                if chunk_id not in existing.source_chunks:
                    existing.source_chunks.append(chunk_id)

    # Align mention counts with exported edges (one per chunk)
    for ent in entity_map.values():
        ent.mention_count = len(ent.source_chunks)

    all_entities = list(entity_map.values())
    
    # Save outputs
    save_parquet_like_json(all_docs, index_dir / "documents.jsonl")
    save_parquet_like_json(all_chunks, index_dir / "chunks.jsonl")
    save_parquet_like_json(all_entities, index_dir / "entities.jsonl")
    
    # Build graph
    build_graph_jsonl(all_docs, all_chunks, all_entities, index_dir / "graph.jsonl")
    
    # Summary
    logger.info("=" * 50)
    logger.info("INGESTION COMPLETE")
    logger.info(f"  Documents: {len(all_docs)}")
    logger.info(f"  Chunks:    {len(all_chunks)}")
    logger.info(f"  Entities:  {len(all_entities)}")
    logger.info("=" * 50)
    
    return {
        "documents": len(all_docs),
        "chunks": len(all_chunks),
        "entities": len(all_entities)
    }


if __name__ == "__main__":
    logger.info("🚀 BIZRA Knowledge Vault - Python Ingestion Engine")
    logger.info(f"Vault root: {VAULT_ROOT}")
    
    result = ingest_chats()
    
    print("\n✅ Ingestion complete!")
    print(f"   📄 Documents: {result['documents']}")
    print(f"   📦 Chunks:    {result['chunks']}")
    print(f"   🏷️  Entities:  {result['entities']}")
