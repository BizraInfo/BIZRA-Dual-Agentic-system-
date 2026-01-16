# Peak Masterpiece Implementation Tasks

## Phase 0: Foundation Hardening (CRITICAL - Week 1-2)

### 1. Float Determinism Fix

- [ ] **1.1** Migrate `ExecutionReceipt` struct to use `Fixed64`
  - File: `src/receipts.rs:92-96`
  - Fields: `synergy_score`, `ihsan_score`
  - Action: Change `f64` → `Fixed64`

- [ ] **1.2** Update Ihsān scoring to return `Fixed64`
  - File: `src/ihsan.rs`
  - Action: All scoring functions return `Fixed64` instead of `f64`

- [ ] **1.3** Fix `impact_delta` field in hookchain
  - File: `src/hookchain.rs:269`
  - Action: Change `impact_delta: f64` → `Fixed64`

- [ ] **1.4** Add property tests for cross-platform determinism
  - File: `tests/determinism_tests.rs` (new)
  - Action: Test that same inputs produce same receipt hashes on different platforms

### 2. CI Gate Validation

- [ ] **2.1** Fix test count verification
  - File: `.github/workflows/apex_ci.yml:89-95`
  - Action: Use JSON output parsing instead of regex

- [ ] **2.2** Implement actual Ihsān calculation in CI
  - File: `.github/workflows/apex_ci.yml:211-213`
  - Action: Replace hardcoded `0.9826` with calculated value

- [ ] **2.3** Implement actual SNR calculation in CI
  - Action: Replace hardcoded `0.985` with calculated value

- [ ] **2.4** Fix pytest path
  - File: `.github/workflows/apex_ci.yml:115`
  - Action: Change `cognitive-plane/` to actual test path

### 3. Security Hardening

- [ ] **3.1** Implement timing-safe token comparison
  - File: `src/http.rs:971-976`
  - Action: Use `subtle::ConstantTimeEq` or similar

- [ ] **3.2** Add entropy to rate limiter client ID
  - File: `src/http.rs:172-214`
  - Action: Include timestamp/nonce in hash

- [ ] **3.3** Pin all Docker image versions
  - Files: `docker-compose.yml`, `docker-compose.prod.yml`
  - Action: Replace `latest` and floating tags with specific versions

---

## Phase 1: Architectural Decoupling (Week 3-4)

### 4. Trait Extraction

- [ ] **4.1** Define `Validator` trait
  - File: `src/traits.rs` (new)
  - Interface: `async fn validate(&self, request: &DualAgenticRequest) -> Result<ValidationResult>`

- [ ] **4.2** Define `Agent` trait
  - File: `src/traits.rs`
  - Interface: `async fn execute(&self, request: &DualAgenticRequest) -> Result<AgentResult>`

- [ ] **4.3** Define `Persister` trait
  - File: `src/traits.rs`
  - Interface: `async fn persist(&self, receipt: &ExecutionReceipt) -> Result<()>`

### 5. BridgeCoordinator Decomposition

- [ ] **5.1** Extract `ExecutionOrchestrator`
  - Action: Move execution flow logic out of BridgeCoordinator

- [ ] **5.2** Extract `ValidationService`
  - Action: SAT validation as independent service

- [ ] **5.3** Extract `PersistenceService`
  - Action: Receipt/ledger persistence as independent service

### 6. Dependency Injection

- [ ] **6.1** Implement factory pattern
  - Action: Create `SystemBuilder` for component assembly

- [ ] **6.2** Configuration-driven assembly
  - Action: Load component configuration from YAML/TOML

---

## Phase 2: Performance Optimization (Week 5-6)

### 7. Hot Path Optimization

- [ ] **7.1** Eliminate SNR result cloning
  - File: `src/bridge.rs:208`
  - Action: Use `Vec<&AgentResult>` instead of cloning

- [ ] **7.2** Cache synergy keyword analysis
  - File: `src/bridge.rs:470-492`
  - Action: LRU cache for keyword extraction results

- [ ] **7.3** Batch mutex acquisitions
  - File: `src/bridge.rs`
  - Action: Reduce 7+ lock operations to 2-3

### 8. LLM Integration Hardening

- [ ] **8.1** Implement circuit breaker
  - File: `src/ollama.rs`
  - Action: Fail-open after 3 consecutive failures

- [ ] **8.2** Enforce timeout (5s max)
  - Action: Add tokio::timeout wrapper

- [ ] **8.3** Cache fallback responses
  - Action: Store deterministic fallback responses

---

## Phase 3: Observability Enhancement (Week 7-8)

### 9. Dashboard Creation

- [ ] **9.1** Health dashboard
- [ ] **9.2** Performance dashboard
- [ ] **9.3** Ihsān/SNR dashboard
- [ ] **9.4** Federation dashboard

### 10. Alerting Implementation

- [ ] **10.1** SLO violation alerts
- [ ] **10.2** Security event alerts
- [ ] **10.3** Resource exhaustion alerts

### 11. Distributed Tracing

- [ ] **11.1** OpenTelemetry integration
- [ ] **11.2** Trace correlation implementation

---

## Phase 4: Documentation (Ongoing)

### 12. Documentation Completion

- [ ] **12.1** Expand BIZRA_SOT.md to 3000+ lines
- [ ] **12.2** Generate OpenAPI specification
- [ ] **12.3** Create deployment runbooks
- [ ] **12.4** Write federation protocol specification

---

## Phase 5: Verification (Week 9-10)

### 13. Testing Suite

- [ ] **13.1** Integration testing suite
- [ ] **13.2** Performance regression suite
- [ ] **13.3** Chaos engineering tests
- [ ] **13.4** Evidence pack generation

---

## Priority Matrix

| Task | Impact | Effort | Priority |
|------|--------|--------|----------|
| 1.1-1.4 Float Fix | Critical | Medium | P0 |
| 2.1-2.4 CI Gates | Critical | Low | P0 |
| 3.1-3.3 Security | High | Low | P0 |
| 4.1-4.3 Traits | High | Medium | P1 |
| 5.1-5.3 Decomposition | High | High | P1 |
| 7.1-7.3 Hot Path | Medium | Medium | P2 |
| 8.1-8.3 LLM | Medium | Low | P2 |
| 9-11 Observability | Medium | Medium | P2 |
| 12 Documentation | Low | High | P3 |
| 13 Verification | High | Medium | P1 |

---

## Execution Order

```
Week 1: Tasks 1.1-1.4, 2.1-2.4 (Foundation)
Week 2: Tasks 3.1-3.3, Property tests (Security)
Week 3: Tasks 4.1-4.3 (Traits)
Week 4: Tasks 5.1-5.3 (Decomposition)
Week 5: Tasks 7.1-7.3 (Hot Path)
Week 6: Tasks 8.1-8.3 (LLM)
Week 7: Tasks 9.1-9.4 (Dashboards)
Week 8: Tasks 10.1-10.3, 11.1-11.2 (Alerts + Tracing)
Week 9: Tasks 13.1-13.4 (Testing)
Week 10: Tasks 12.1-12.4, Final validation (Docs + Verification)
```

---

**Status**: READY FOR EXECUTION
**Next Action**: Start with Task 1.1 (Float Determinism Fix)
