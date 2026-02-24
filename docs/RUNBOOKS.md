# BIZRA v7.0 Operational Runbooks

## 1. Incident: Resilience Rebirth (Circuit 14 Triggered)

**Symptoms**: Log contains `🚨 Circuit 14: Resonance Drift detected`, mesh resets to zero nodes.
**Cause**: The Wisdom Root cluster’s SNR fell below 0.50, indicating constitutional corruption.

### Recovery Steps

1. **Verify Genesis**: Ensure the environment hasn't been tampered with.
2. **Restart Mesh**: The system does this automatically, but monitor the initial nodes.
3. **Manual Audit**: Query the SAPE engine to see the "noise" cluster that triggered the drift.
4. **Thermal Check**: Sometimes high-entropy noise is caused by hardware thermal throttling.

---

## 2. Incident: FATE Verification Stalls (Circuit 13)

**Symptoms**: Logs show `🚨 Circuit 13: Proof latency Xms exceeds 100ms budget`.
**Cause**: Z3 Solver is struggling with a complex formal proof or Byzantine load.

### Action Plan

1. **Identify the ID**: Locate the request ID causing the stall.
2. **Scalability Check**: If multiple warnings occur, increase the FATE background worker pool size.
3. **Property Audit**: Review `src/fate.rs` for overly complex SMT properties that may cause exponential state growth.

---

## 3. Maintenance: Key Rotation & PCR Evolution

**Requirement**: Periodically rotate attestation keys or update the Genesis Hash.

### Procedure

1. **Initialize AK**: Call `TpmContext::init_attestation_key()`.
2. **Re-seal Genesis**: If the kernel code changes, the Genesis Hash in `src/ihsan.rs` must be updated to the new SHA-256 value.
3. **PCR Update**: The next boot will measure the new binaries into PCR 12-15. Ensure `verify_attestation.py` is updated with the new expected hash.

---

## 4. Emergency: Safe Mode Trigger

**Requirement**: Force the system into a non-cognitive, verified-only state.

### Execution

1. Set environment variable `BIZRA_SAFE_MODE=true`.
2. Restart the `SovereignKernel`.
3. In this mode, the PAT (Personal Agentic Team) is disabled, and only hard-coded, formally-verified SAT responses are permitted.

---

## 5. Optimization: Progressive Tax Tuning

**Requirement**: Adjust the Harberger Tax to penalize inefficient usage.

### Tuning

1. Update `config/production.yaml` with new the tax multipliers.
2. Monitor `ExecutionReceipts` to ensure the tax doesn't disproportionately hit high-Ihsān requests.
3. **Discount Rule**: Ensure requests with Ihsān > 0.98 continue to receive the 0% "Ihsān Bonus".
