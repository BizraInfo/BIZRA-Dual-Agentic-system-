# Node-0 Ecosystem Health & Verification Report

Timestamp (UTC): 2026-01-04T04:35:09Z
Scope: Phase 1-3 validation (services, core tests, lifecycle receipt)

## Phase 1: Service Status & Connectivity

Ports listening (host):
- 8010 (kernel), 8000 (taskmaster api), 5432 (postgres), 6379 (redis), 7687 (neo4j bolt), 8001 (vectors)

Containers (docker ps):
- bizra-dual-agentic-system--main-kernel-1: Up (healthy) -> 8010/tcp
- bizra-api: Up (healthy) -> 8000/tcp
- bizra-node0-db: Up (healthy) -> 5432/tcp
- bizra-redis: Up (healthy) -> 6379/tcp
- bizra-dual-agentic-system--main-wisdom-1: Up -> 7474/tcp, 7687/tcp
- bizra-dual-agentic-system--main-vectors-1: Up -> 8001/tcp

HTTP checks:
- Kernel /healthz: HTTP 200 in 0.009688s
- Kernel /health: HTTP 404
- Kernel /stats: HTTP 404
- TaskMaster API /health: HTTP 200 in 0.001695s (database ok, redis ok, api ok)
- TaskMaster API /stats: HTTP 404
- TaskMaster API /api/poi/stats: HTTP 404
- TaskMaster API /api/assets/stats: HTTP 404
- Neo4j HTTP root: HTTP 200 in 0.387731s
- Chroma /api/v2/heartbeat: HTTP 200 in 0.002527s
- Chroma /api/v1/heartbeat: HTTP 410 (deprecated)

Database checks (postgres):
- pg_isready: accepting connections
- Database exists: bizra_genesis
- Tables in bizra_genesis: schema_migrations only (no poi_ledger found)

Redis checks:
- redis-cli ping: PONG

## Phase 2: Core Functionality Tests

Dual-Agentic test:
- POST /dual/execute on kernel (8010): HTTP 404 (endpoint not available on this service)
- Result: BLOCKED (no accessible /dual/execute endpoint)

PAT/SAT orchestration:
- Not verifiable without /dual/execute endpoint or running Meta Alpha HTTP server

Proof-of-Impact (PoI) lifecycle:
- /api/poi/stats endpoint: HTTP 404
- poi_ledger table: not present in bizra_genesis
- Result: BLOCKED (no API or DB schema evidence)

## Phase 3: Lifecycle Health Reporting

Third Fact (Genesis Seal verification):
- seal_genesis.py --verify: SUCCESS
- Receipt: evidence/genesis/third_fact_receipt_20260104T043509Z.txt
- Genesis hash (manifest): 8c5ee15603b937c4e4556ebf25ada33f92023b661582ac977a8b2c75a2872580

## Notes / Gaps

- The user-provided genesis hash (a19811...) does not match the current manifest hash (8c5ee...). The manifest now verifies at 8c5ee1..., so a mismatch needs reconciliation.
- PoI minting and dual-agentic orchestration are not testable with current running endpoints.
