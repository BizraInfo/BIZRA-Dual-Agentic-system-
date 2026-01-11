# BIZRA Node Appliance v0.1 - Definition of Done & Test Matrix

## 1. Governance & Quality Gates
- [ ] **Specs Sealed**: BNAS, BTPF, and BDS specs reviewed, versioned (v0.1), and marked as authoritative.
- [ ] **Repository Structure**: Monorepo created with all 7 key directories (constitution, control, cognitive, proof, data, delivery, warper).
- [ ] **License**: Open Source license (e.g., Apache 2.0 / MIT) applied to all new code.
- [ ] **Ihsān Policy**: "Fail-Close" logic demonstrable in at least one key flow (e.g., resource violation = node stop).

## 2. Warper Installer (MVP - Windows)
| Test ID | Scenario | Expected Outcome | Criticality |
|---|---|---|---|
| **W-01** | **Clean Install** | Installer runs on fresh Windows 11; Docker Desktop detected/installed; App starts. | **BLOCKER** |
| **W-02** | **Prerequisites** | Warns if virtualization (Hyper-V) is disabled; Guides user to enable. | HIGH |
| **W-03** | **Hardware Check** | Detects CPU cores/RAM correctly using PowerShell. | HIGH |
| **W-04** | **Resource Contract** | User selects "Standard Tier"; Config generated matches selection. | HIGH |
| **W-05** | **Dashboard Launch** | `localhost:8443` loads within 30s of install completion. | **BLOCKER** |

## 3. Appliance Runtime (Container)
| Test ID | Scenario | Expected Outcome | Criticality |
|---|---|---|---|
| **RT-01** | **Resource Caps** | Container attempts to use 100% CPU; Capped at Contract % (±5%). | **BLOCKER** |
| **RT-02** | **Memory OOM** | Container attempts to exceed RAM limit; Process killed/restarted (no host crash). | HIGH |
| **RT-03** | **Network Isolation** | Container cannot access private host IPs (192.168.x.x) except gateway. | MEDIUM |
| **RT-04** | **Persistence** | Reboot container; Data in `/data` volume remains intact. | HIGH |

## 4. Proof Plane (PoI Receipt)
| Test ID | Scenario | Expected Outcome | Criticality |
|---|---|---|---|
| **PP-01** | **Generate Receipt** | Running a task produces valid JSON/ProtoBuf receipt. | **BLOCKER** |
| **PP-02** | **Verify Signature** | Receipt signature validates against Node Identity public key. | HIGH |
| **PP-03** | **Monotonic Time** | Subsequent receipts have strictly increasing timestamps. | HIGH |
| **PP-04** | **Attestation** | Receipt includes field indicating "Software Attestation" (for Bronze/Silver). | MEDIUM |

## 5. Delivery & Update
| Test ID | Scenario | Expected Outcome | Criticality |
|---|---|---|---|
| **DL-01** | **SBOM Gen** | Build process outputs `sbom.xml` (CycloneDX). | HIGH |
| **DL-02** | **Update Flow** | Available update detected -> Downloaded -> Signature Verified -> Applied. | **BLOCKER** |
| **DL-03** | **Bad Update** | Update missing signature -> Rejected before installation. | HIGH |
| **DL-04** | **Rollback** | Update fails health check -> System reverts to previous container version. | HIGH |
