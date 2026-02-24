// ============================================
// BIZRA Knowledge Graph Schema
// Neo4j Cypher DDL
// Version: 1.0.0
// ============================================

// ============================================
// CONSTRAINTS (Unique IDs)
// ============================================

CREATE CONSTRAINT doc_id IF NOT EXISTS
FOR (d:Document) REQUIRE d.doc_id IS UNIQUE;

CREATE CONSTRAINT chunk_id IF NOT EXISTS
FOR (c:Chunk) REQUIRE c.chunk_id IS UNIQUE;

CREATE CONSTRAINT entity_id IF NOT EXISTS
FOR (e:Entity) REQUIRE e.entity_id IS UNIQUE;

CREATE CONSTRAINT assertion_id IF NOT EXISTS
FOR (a:Assertion) REQUIRE a.assertion_id IS UNIQUE;

CREATE CONSTRAINT project_id IF NOT EXISTS
FOR (p:Project) REQUIRE p.project_id IS UNIQUE;

CREATE CONSTRAINT event_id IF NOT EXISTS
FOR (ev:Event) REQUIRE ev.event_id IS UNIQUE;

// ============================================
// INDEXES (Query Performance)
// ============================================

CREATE INDEX doc_source_type IF NOT EXISTS
FOR (d:Document) ON (d.source_type);

CREATE INDEX doc_project IF NOT EXISTS
FOR (d:Document) ON (d.project);

CREATE INDEX entity_type IF NOT EXISTS
FOR (e:Entity) ON (e.entity_type);

CREATE INDEX entity_canonical IF NOT EXISTS
FOR (e:Entity) ON (e.canonical_name);

CREATE INDEX assertion_type IF NOT EXISTS
FOR (a:Assertion) ON (a.assertion_type);

CREATE INDEX event_time IF NOT EXISTS
FOR (ev:Event) ON (ev.timestamp);

// ============================================
// NODE LABELS & PROPERTIES
// ============================================

// --- Document ---
// Represents any source document (PDF, code file, chat, note, etc.)
// Properties:
//   doc_id: string (sha256 hash)
//   source_type: string (repo_file, chat_turn, pdf, note, image, video)
//   uri: string (absolute path or URL)
//   title: string
//   mime: string
//   lang: string (ISO 639-1)
//   created_at: datetime
//   modified_at: datetime
//   project: string
//   tags: string[]
//   hash_sha256: string
//   text_quality: string (ok, partial, ocr, failed)
//   metadata: string (JSON)

// --- Chunk ---
// A semantic segment of a Document
// Properties:
//   chunk_id: string
//   doc_id: string (FK)
//   chunk_index: integer
//   chunk_text: string
//   token_count: integer
//   start_line: integer (optional)
//   end_line: integer (optional)
//   page_start: integer (optional, for PDFs)
//   page_end: integer (optional)
//   symbol_name: string (optional, for code)
//   embedding_model: string
//   created_at: datetime
//   metadata: string (JSON)

// --- Entity ---
// A named thing extracted from content
// Properties:
//   entity_id: string
//   entity_type: string (Person, Org, Concept, Tool, Method, Paper, Dataset, Repo, Function, etc.)
//   canonical_name: string (normalized)
//   aliases: string[]
//   description: string
//   first_seen: datetime
//   mention_count: integer
//   confidence: float
//   metadata: string (JSON)

// --- Assertion (HYPEREDGE) ---
// A multi-entity fact or claim (the hypergraph node)
// Properties:
//   assertion_id: string
//   assertion_type: string (experiment, claim, decision, definition, recipe, observation)
//   text: string (the assertion statement)
//   confidence: float
//   timestamp: datetime
//   source_count: integer
//   metadata: string (JSON)

// --- Project ---
// A research project or work area
// Properties:
//   project_id: string
//   name: string
//   description: string
//   created_at: datetime
//   status: string (active, archived, completed)
//   tags: string[]

// --- Event ---
// A time-anchored occurrence (discovery, decision, milestone)
// Properties:
//   event_id: string
//   event_type: string (discovery, decision, milestone, experiment, meeting)
//   title: string
//   description: string
//   timestamp: datetime
//   importance: float
//   metadata: string (JSON)

// ============================================
// EDGE TYPES & PROPERTIES
// ============================================

// --- Document Edges ---
// (Document)-[:BELONGS_TO]->(Project)
// (Document)-[:AUTHORED_BY]->(Entity:Person)
// (Document)-[:CITES]->(Document)
//   Properties: citation_context, page

// --- Chunk Edges ---
// (Chunk)-[:PART_OF]->(Document)
// (Chunk)-[:FOLLOWS]->(Chunk)
//   Properties: distance (0 = immediate)
// (Chunk)-[:MENTIONS {confidence, span_start, span_end}]->(Entity)

// --- Entity Edges ---
// (Entity)-[:ALIAS_OF]->(Entity)
//   Properties: confidence
// (Entity)-[:RELATED_TO {relation_type, confidence}]->(Entity)
//   relation_type: implements, extends, uses, contradicts, supports, derives_from
// (Entity)-[:INSTANCE_OF]->(Entity)
//   For type hierarchies (e.g., GPT-4 INSTANCE_OF LLM)

// --- Assertion Edges (Hypergraph Implementation) ---
// (Assertion)-[:INVOLVES {role}]->(Entity)
//   role: subject, object, method, dataset, result, tool, context
// (Assertion)-[:SUPPORTED_BY]->(Chunk)
//   The evidence chain
// (Assertion)-[:CONTRADICTS]->(Assertion)
// (Assertion)-[:SUPERSEDES]->(Assertion)
// (Assertion)-[:DERIVED_FROM]->(Assertion)

// --- Event Edges ---
// (Event)-[:OCCURRED_IN]->(Project)
// (Event)-[:INVOLVES]->(Entity)
// (Event)-[:DOCUMENTED_IN]->(Document)
// (Event)-[:TRIGGERED]->(Event)

// --- Cross-cutting Edges ---
// (Project)-[:HAS_MEMBER]->(Entity:Person)
// (Project)-[:USES]->(Entity:Tool)
// (Project)-[:EXPLORES]->(Entity:Concept)

// ============================================
// EXAMPLE HYPEREDGE PATTERN
// ============================================

// Scenario: "In Project BIZRA, using Rust + PyO3, we achieved 0.99 SNR
//            on the Resonance Mesh, documented in chat session X."

// CREATE (a:Assertion {
//   assertion_id: 'a-001',
//   assertion_type: 'experiment',
//   text: 'Achieved 0.99 SNR on Resonance Mesh using Rust+PyO3',
//   confidence: 0.95,
//   timestamp: datetime('2026-01-19')
// })
// CREATE (a)-[:INVOLVES {role: 'context'}]->(p:Project {name: 'BIZRA'})
// CREATE (a)-[:INVOLVES {role: 'tool'}]->(t1:Entity {canonical_name: 'Rust'})
// CREATE (a)-[:INVOLVES {role: 'tool'}]->(t2:Entity {canonical_name: 'PyO3'})
// CREATE (a)-[:INVOLVES {role: 'subject'}]->(m:Entity {canonical_name: 'Resonance Mesh'})
// CREATE (a)-[:INVOLVES {role: 'result'}]->(r:Entity {canonical_name: '0.99 SNR'})
// CREATE (a)-[:SUPPORTED_BY]->(c:Chunk {chunk_id: 'chunk-xyz'})

// ============================================
// FULL-TEXT SEARCH (Optional)
// ============================================

// CREATE FULLTEXT INDEX chunk_text_search IF NOT EXISTS
// FOR (c:Chunk) ON EACH [c.chunk_text];

// CREATE FULLTEXT INDEX entity_search IF NOT EXISTS
// FOR (e:Entity) ON EACH [e.canonical_name, e.aliases, e.description];

// CREATE FULLTEXT INDEX assertion_search IF NOT EXISTS
// FOR (a:Assertion) ON EACH [a.text];

// ============================================
// VECTOR INDEX (Neo4j 5.x+ with vector support)
// ============================================

// CALL db.index.vector.createNodeIndex(
//   'chunk_embeddings',
//   'Chunk',
//   'embedding',
//   3072,
//   'cosine'
// );
