# BIZRA v7.0 CI/CD & Gating Story

## 1. Pipeline Overview

The BIZRA CI/CD pipeline enforces the **Elite Quality Standard**. No code is merged into `main` without passing the **Peak Masterpiece Attestation Gate**.

```mermaid
graph LR
    Push[Push/PR] --> Build[Build & Lint]
    Build --> Test[Unit/Integration Tests]
    Test --> Attest[SNR Attestation Gate]
    Attest --> Certify[Certification Created]
    Certify --> Merge[Merge to Main]
```

## 2. The Gating Logic

### Gate 1: Build & Rust Integrity

- **Command**: `cargo clippy --all-targets --all-features -- -D warnings`
- **Goal**: Zero warnings, zero lint errors. Ensures memory safety and idiomatic Rust.

### Gate 2: Attestation Gate (The Masterpiece Gate)

- **Command**: `./scripts/ci_attestation.sh`
- **Criteria**:
  - `SNR >= 0.85`: The system must demonstrate high cognitive clarity.
  - `Ihsān >= 0.90`: The system must adhere to ethical excellence.
  - **Failure**: Any score below these thresholds blocks the PR.

## 3. GitHub Actions Architecture

The pipeline (`.github/workflows/ci.yml`) is split into jobs:

1. **Build & Test**: Standard Rust validation.
2. **SNR Attestation**: Executes the `peak_masterpiece.sh` script to generate a YAML certification.
3. **Audit**: Runs `cargo audit` to scan for security vulnerabilities in dependencies.

## 4. Self-Hosted vs GitHub-Hosted

- **Current**: Running on GitHub-hosted runners with software TPM simulation.
- **Production Recommendation**: Use self-hosted runners equipped with physical TPM 2.0 hardware for immutable attestation of the CI agent itself.

## 5. Deployment Gating

Automated deployment to the BIZRA Node Mesh requires:

- A valid `highest_snr_<timestamp>.yaml` certificate.
- A matching Genesis Hash in PCR-15.
- Successful verification via `verify_attestation.py`.
