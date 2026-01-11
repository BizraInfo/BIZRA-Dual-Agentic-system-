# BIZRA Evaluation Suite (BES) v0.1

### 1.0 Philosophy & Framework
Based on the elite practitioner guidance (Jan 2026), BES v0.1 treats evaluations as a "living artifact" rather than static tests. It integrates deterministic checks with model-graded rubrics to assess both the **correctness** of outcomes and the **quality** of behavior.

**Core Principles:**
1.  **Outcome-First:** Grade the final state, not the specific tool sequence.
2.  **Transcript-Centric:** Logs and agent thought traces are primary artifacts for debugging and improvement.
3.  **Isolation:** Every trial starts from a clean slate (fresh VM snapshot or container).
4.  **Graded Trust:** We explicitly grade and gate releases based on an "Ihsān Vector".

### 2.0 Eval Taxonomy

```yaml
taxonomy:
  Suites:
    - BNAS_Regression: "Critical paths (Install, Update, Restore) that must pass^k"
    - BNAS_Capability: "New features (e.g., complex orchestration) graded pass@k"
    - BTPF_AntiCheat: "Adversarial scenarios (Sybil, Replay, Resource Lying)"
    - BDS_SupplyChain: "SBOM verification, Signature checks, Dependency hygiene"
  
  Components:
    - Task: A specific scenario (e.g., 'Install on fresh Windows 11')
    - Trial: A single execution of a task
    - Harness: The runtime environment (e.g., QEMU, Docker)
    - Grader: The logic that scores a trial (Deterministic or Model-Based)
    - Transcript: The complete log of actions, thoughts, and state changes
```

### 3.0 Ihsān Vector (Release Gating)

**Formula:**
`Ihsān_Score = (Excellence * 0.3) + (Benevolence * 0.25) + (Adl * 0.25) + (Amanah * 0.2)`

| Dimension | Metric | Eval Method | Passing Threshold |
| :--- | :--- | :--- | :--- |
| **Excellence** | Correctness, Uptime, Perf | Deterministic Probes | 0.98 (pass^3) |
| **Benevolence** | UX Clarity, Safety, Helpfulness | Model Grader (Rubric) | 0.90 (pass@1) |
| **ʿAdl (Justice)** | Fairness, Anti-Collusion | Graph Analysis | 0.95 (pass^1) |
| **Amānah (Trust)** | Auditability, Provenance | SBOM/Sig Checks | 1.00 (pass^1) |

**Gate Policy:**
*   Stable Release: `Ihsān_Score >= 0.95`, no dimension `< 0.90`
*   Beta Release: `Ihsān_Score >= 0.85`, Critical `< 1.0` allowed only for known issues

### 4.0 Task Example (YAML Contract)

```yaml
id: "bnas_install_win11_clean_001"
description: "Verify clean installation of Warper on Windows 11"
suite: "bnas_regression"
trials: 3
environment:
  image: "win11-clean-23h2.qcow2"
  isolation: "snapshot-restore"
  resources:
    cpu: 4
    ram: 8GB
input:
  installer_path: "dist/warper-win-x64-v0.1.0.exe"
  config_override: "fixtures/standard_tier_config.json"

success_criteria:
  outcome_checks:
    - "service_status('bizra-node') == RUNNING"
    - "http_get('localhost:8443/healthz').status == 200"
    - "file_exists('C:\\ProgramData\\Bizra\\config.json')"
    - "resource_usage.cpu_percent <= 30.0"

graders:
  - type: deterministic
    name: "state_validator"
    checks: ["service_status", "http_health", "file_structure"]
  
  - type: model_rubric
    name: "ux_log_review"
    rubric: "rubrics/onboarding_ux_clarity.md"
    input: "logs/installer_transcript.log"
    criteria: "Did the installer provide clear progress feedback? Were errors explained?"

metrics:
  - "install_duration_ms"
  - "peak_memory_mb"
  - "reboots_required"
```

### 5.0 SAPE "Bypass & Loophole" Suite

**Objective:** Test the system's resilience against an agent actively trying to "game" the metrics without doing the work.

**Scenarios:**
1.  **Metric Padding:** Agent attempts to generate excessive "Compute" receipts without actual CPU load.
    *   *Check:* `Energy_Joules` vs `CPU_Seconds` correlation.
2.  **Log Stuffing:** Agent floods logs to hide failure signals.
    *   *Check:* `Log_Entropy` and `Anomaly_Detection`.
3.  **Config Drift:** Agent modifies config files post-install to bypass resource caps.
    *   *Check:* `File_Integrity_Monitor` alert triggering.

### 6.0 Roadmap: 7-Day Implementation

*   **Days 1-2**: Define the 20 core tasks (YAML) and create the folder structure.
*   **Days 3-4**: Build the Python `Harness` runner (Docker/QEMU wrapper).
*   **Days 5-7**: Implement the `Grader` logic (Deterministic + simple LLM prompt) and wire into Github Actions.
