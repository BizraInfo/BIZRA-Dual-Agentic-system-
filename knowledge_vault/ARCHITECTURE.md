# BIZRA Knowledge Vault Architecture
## Hypergraph RAG + Knowledge Graph System
**Version:** 1.0.0-genesis
**Owner:** Mumu-BIZRA Kernel

---

## 1. Folder Taxonomy

```
knowledge_vault/
├── ARCHITECTURE.md          # This file
├── config/
│   ├── sources.yaml         # Source definitions (repos, chats, PDFs)
│   ├── extraction.yaml      # LLM extraction rules
│   ├── graph_schema.cypher  # Neo4j schema
│   └── embeddings.yaml      # Model configs
│
├── raw/                     # IMMUTABLE originals
│   ├── repos/               # Git repos (symlinks or clones)
│   ├── chats/               # Exported chat histories (JSON/MD)
│   ├── pdfs/                # Academic papers, books
│   ├── notes/               # Obsidian/Markdown vaults
│   ├── media/               # Images, videos, audio
│   └── exports/             # Browser exports, API dumps
│
├── derived/                 # GENERATED artifacts (reproducible)
│   ├── text/                # Extracted plaintext per doc
│   ├── chunks/              # Context-aware chunks (parquet)
│   ├── embeddings/          # Vector stores
│   ├── entities/            # Extracted entities (jsonl)
│   └── assertions/          # Hyperedge facts (jsonl)
│
├── index/                   # QUERYABLE spine
│   ├── documents.parquet    # Master document table
│   ├── chunks.parquet       # All chunks + vectors
│   ├── entities.parquet     # Deduplicated entities
│   └── graph.jsonl          # Graph export for import
│
├── graph/                   # GRAPH DB artifacts
│   ├── neo4j/               # Neo4j import files
│   └── snapshots/           # Graph backups
│
├── logs/                    # OBSERVABILITY
│   ├── extraction.log
│   ├── embedding.log
│   └── metrics.jsonl
│
└── pipeline/                # ORCHESTRATION
    ├── _targets.R           # targets pipeline definition
    ├── R/                   # Pipeline functions
    └── run.R                # Entry point
```

---

## 2. Core Principles

### 2.1 Every Item Has Provenance
```yaml
doc_id: sha256(content + uri)
source_type: repo_file | chat_turn | pdf | note | image | video
uri: absolute path or URL
created_at: ISO8601
modified_at: ISO8601
owner: string
project: string[]
tags: string[]
license: string
```

### 2.2 Store Raw Once, Derive Many
- `raw/` is append-only, never modified
- `derived/` is fully reproducible from `raw/` + `config/`
- `index/` is the queryable view

### 2.3 Separate Concerns
```
Text Extraction → Chunking → Embedding → Entity Extraction → Graph Linking
     ↓               ↓           ↓              ↓                ↓
   cached         cached      cached         cached           cached
```

---

## 3. Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAW SOURCES                               │
│  repos/ │ chats/ │ pdfs/ │ notes/ │ media/ │ exports/           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    TEXT EXTRACTION                               │
│  pdftools │ readtext │ whisper │ VLM │ git-log │ json-parse     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  documents.parquet (SPINE)                       │
│  doc_id │ source_type │ uri │ text │ metadata_json              │
└────────────────────────────┬────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│  CONTEXT-AWARE   │ │  EMBEDDING   │ │  LLM EXTRACTION  │
│    CHUNKING      │ │  GENERATION  │ │  (Structured)    │
└────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
│ chunks.parquet   │ │ vectors.bin  │ │ entities.jsonl   │
│                  │ │              │ │ assertions.jsonl │
└────────┬─────────┘ └──────┬───────┘ └────────┬─────────┘
         │                  │                  │
         └──────────────────┼──────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE GRAPH                               │
│  Nodes: Document, Chunk, Entity, Assertion, Project, Event      │
│  Edges: MENTIONS, DERIVES_FROM, IMPLEMENTS, CITES, INVOLVES     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Automation Strategy

### 4.1 `targets` Pipeline
- Incremental builds (only changed files reprocess)
- Parallel execution across cores
- Reproducible from scratch

### 4.2 Scheduling
| Frequency | Task |
|-----------|------|
| On-demand | Full rebuild |
| Hourly | Ingest new raw files |
| Daily | Incremental embed + entity extract |
| Weekly | Graph consolidation (dedupe, merge aliases) |
| Monthly | Full re-embedding (if model changes) |

### 4.3 Observability
- Extraction failure rates
- OCR quality scores
- Embedding costs (tokens)
- Graph growth metrics
- Retrieval quality (human eval set)

---

## 5. Technology Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Storage | `arrow`, `parquet` | Columnar, compressed, queryable |
| Query | `duckdb` | SQL on Parquet |
| Vectors | `pgvector` / Qdrant | Vector similarity search |
| Graph | Neo4j / ArangoDB | Knowledge graph |
| Orchestration | `targets` | Pipeline automation |
| Extraction | `pdftools`, `readtext` | Text extraction |
| Embeddings | OpenAI / local | Vector generation |
| LLM | Claude / GPT-4 | Structured extraction |

---

## 6. Quick Start

```bash
# 1. Initialize vault structure
./pipeline/init_vault.sh

# 2. Configure sources
vim config/sources.yaml

# 3. Run pipeline
Rscript pipeline/run.R

# 4. Query
duckdb -c "SELECT * FROM 'index/documents.parquet' LIMIT 10"
```
