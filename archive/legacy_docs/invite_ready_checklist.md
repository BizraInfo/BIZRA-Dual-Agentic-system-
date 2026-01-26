# BIZRA Invite-Ready Checklist

This checklist outlines the critical missing elements required to make the BIZRA system invite-ready. Items are prioritized in the recommended implementation order.

## 1. Genesis Hash Consistency Reconciliation

**Description**: Resolve mismatch between user-provided genesis hash and current manifest hash to ensure system integrity and trust.

**Evidence of Issue**:

- User-provided genesis hash: `a19811...`
- Current manifest hash: `8c5ee15603b937c4e4556ebf25ada33f92023b661582ac977a8b2c75a2872580`
- Health report indicates: "The user-provided genesis hash (a19811...) does not match the current manifest hash (8c5ee...). The manifest now verifies at 8c5ee1..., so a mismatch needs reconciliation."

**Actionable Steps**:

- [ ] Review genesis hash calculation logic in `evidence/genesis/GENESIS_MANIFEST.json`
- [ ] Identify source of user-provided hash discrepancy
- [x] Review genesis hash calculation logic in `evidence/genesis/GENESIS_MANIFEST.json`
- [x] Identify source of user-provided hash discrepancy
- [x] Update or reconcile hash verification process
- [x] Test hash consistency across all system components
- [x] Document resolution in genesis verification receipts

## 2. Authentication + Onboarding Flow Implementation (COMPLETED)

**Description**: Implement complete user authentication and onboarding system to enable secure user registration and access.

**Evidence of Issue**:

- No authentication endpoints visible in current API routes
- No user profile management or session handling implemented
- Missing integration with identity management components

**Actionable Steps**:

- [x] Design authentication flow (JWT/OAuth integration)
- [x] Implement user registration endpoint (`/api/auth/register`)
- [x] Implement login endpoint (`/api/auth/login`)
- [x] Add user profile management (`/api/user/profile`)
- [x] Integrate with existing identity service (`bizra_kernel/identity.py`)
- [x] Add session management and token validation
- [x] Implement onboarding wizard in frontend
- [x] Add authentication middleware to protected routes

## 3. PoI Schema Implementation (COMPLETED)

**Description**: Complete the Proof-of-Impact (PoI) ledger implementation including database schema and API endpoints.

**Evidence of Issue**:

- `poi_ledger` table not present in `bizra_genesis` database (only `schema_migrations` exists)
- `/api/poi/stats` endpoint returns HTTP 404 despite being defined in code
- PoI lifecycle marked as "BLOCKED" in health reports

**Actionable Steps**:

- [x] Apply database migration to create `poi_ledger` table (defined in `bizra-genesis-node/scripts/init-db.sql`)
- [x] Verify `poi_ledger.rs` service implementation is complete
- [x] Test `/api/poi/stats` endpoint functionality
- [x] Implement `/api/poi/log` endpoint for event recording
- [x] Add PoI minting and verification logic
- [x] Integrate PoI stats with frontend dashboard
- [x] Add database indexes for performance (already defined in init-db.sql)

## 4. Dual-Agentic Execution Endpoint (COMPLETED)

**Description**: Implement the `/dual/execute` endpoint for coordinated execution between Kernel and TaskMaster agents.

**Evidence of Issue**:

- Endpoint not present in current API routes (`bizra-genesis-node/backend/src/main.rs`)
- Referenced in documentation as "primary execution endpoint" but not implemented
- Missing from health check reports (not tested)

**Actionable Steps**:

- [x] Add `/dual/execute` route to main.rs router
- [x] Implement dual execution handler coordinating Kernel and TaskMaster
- [x] Define request/response schemas for dual execution
- [x] Add validation and error handling
- [x] Integrate with existing agent orchestration logic
- [x] Test endpoint with sample dual-agentic tasks
- [x] Update API documentation

## 5. Public Health/Stats Endpoints (COMPLETED)

**Description**: Complete implementation of health and statistics endpoints for both Kernel and TaskMaster services.

**Evidence of Issue**:

- Kernel: `/health` and `/stats` return 404 (only `/healthz` works)
- TaskMaster: `/health` works but `/stats` returns 404
- TaskMaster: `/api/poi/stats` returns 404 (related to missing poi_ledger table)

**Actionable Steps**:

- [ ] Implement Kernel `/health` endpoint (comprehensive health check)
- [ ] Implement Kernel `/stats` endpoint (system metrics and statistics)
- [ ] Implement TaskMaster `/stats` endpoint (task execution statistics)
- [ ] Ensure all endpoints return proper JSON responses
- [ ] Add health checks to monitoring systems
- [ ] Update health check scripts to test all endpoints
- [ ] Document endpoint responses and expected status codes
