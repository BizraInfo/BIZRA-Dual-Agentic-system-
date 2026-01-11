# BIZRA Release Gating (v1.0)
**Protocol:** MASTERPIECE-GATE
**Target:** Continuous Deployment of Sovereign Federation

## 1. Compliance Checklist (Binary)
All items MUST be PASS for a release artifact (Seal) to be generated.

- [ ] **BES Regression Suite:** 100% stability ($Pass^K = 1.0$) for all tasks.
- [ ] **Formal Proof Verification:** All Z3 invariant proofs in `harness.rs` must pass.
- [ ] **Security Audit:** `cargo audit` must return 0 vulnerabilities (manual/CI).
- [ ] **SAT Reflex Baseline:** Fail-Closed test for unauthorized data access must pass.

## 2. Performance Thresholds (Relative)
New releases must not degrade performance beyond these thresholds:

- **p95 Latency:** < 5ms for local fixed-point ops.
- **Join Delay:** < 2s for Node1 enrollment (local test).
- **PoI Throughput:** > 1000 receipts/sec on Node0 aggregator.

## 3. Seal Metadata Requirements
The `BIZRA_MASTERPIECE_SEAL.json` must now include:
- `git_sha`: current commit.
- `bes_stability_score`: float (0.0 to 1.0).
- `policy_fingerprint`: sha256 of the current SAT manifest.
- `bom_hash`: digest of the software bill of materials.

## 4. Enforcement Strategy
If any gate fails, the system enters **QUARANTINE_MODE** (Safe State):
- No new enrollments accepted.
- Impact weights reduced to 0.1x.
- Critical logs mirrored to redundant forensic vault.
