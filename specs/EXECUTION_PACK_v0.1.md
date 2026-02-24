# EXECUTION PACK: NODE APPLIANCE v0.1 KICKOFF

### Immediate Next Steps (Next 7 Days)

```
DAY 1-2: SPEC FINALIZATION
├── Finalize BNAS v0.1 with team review
├── Create acceptance tests for each spec component
├── Establish versioning scheme (semver + build metadata)
└── Publish specs to internal documentation

DAY 3-4: REPO SKELETON CREATION
├── Create monorepo structure:
│   ├── constitution/ (policies, tiers, allowlists)
│   ├── control-plane/ (orchestrator, resource manager)
│   ├── cognitive-plane/ (PAT/SAT, LLM gateway)
│   ├── proof-plane/ (PoI receipts, attestation)
│   ├── data-plane/ (refinery, storage)
│   ├── delivery/ (CI/CD, signing, SBOM)
│   └── warper/ (installer, hardware introspection)
├── Implement initial CI with:
│   ├── Build reproducibility check
│   ├── Basic test gates
│   └── SBOM generation
└── Set up development environment container

DAY 5-7: WARPER INSTALLER MVP (Windows-first)
├── Create Windows installer using:
│   ├── Inno Setup for GUI installer
│   ├── PowerShell for hardware introspection
│   └── Docker Desktop integration for containers
├── Implement:
│   ├── Hardware introspection (CPU, RAM, storage check)
│   ├── Resource contract wizard with sensible defaults
│   ├── Container image download + verification
│   └── Basic dashboard on localhost:8443
└── Test on clean Windows 11 VM

WEEK 2: FIRST DEMONSTRATION
├── Prove full flow:
│   ├── Download → Install → Configure
│   ├── Resource dedication enforcement
│   ├── Simple computation task
│   └── PoI receipt generation + validation
├── Gather feedback from test users
└── Begin parallel work on Linux/macOS installers
```

### Container vs VM Recommendation

**Recommendation: Containers-first for MVP, VM-first roadmap**

```
RATIONALE:
1. Speed to Market: Containers deploy in minutes vs hours for VMs
2. Development Velocity: Faster iteration cycles
3. Cross-platform consistency: Docker works everywhere
4. Gradual hardening: Start with containers, add VM isolation later

MVP TIMELINE:
Containers: 2-4 weeks to functional MVP
VMs: 8-12 weeks to same functionality

ROADMAP:
Phase 1 (Now): Container MVP with security profiles
Phase 2 (Month 2): VM appliance beta
Phase 3 (Month 3): VM appliance stable
Phase 4 (Ongoing): Hypervisor purity (R&D track)
```

### Success Metrics for v0.1

```yaml
success_criteria:
  installation:
    time_to_install: "< 10 minutes"
    success_rate: "> 95%"
    no_technical_knowledge_required: true
    
  resource_dedication:
    cpu_enforcement: "accurate within 5%"
    memory_enforcement: "no host OOM"
    isolation: "no escape vulnerabilities"
    
  poi_system:
    receipt_generation: "< 1 second"
    validation_success: "> 99%"
    fraud_detection: "basic working"
    
  update_system:
    update_success: "> 98%"
    rollback_success: "100%"
    zero_data_loss: true
    
  user_experience:
    dashboard_uptime: "> 99.9%"
    response_time: "< 200ms"
    error_rate: "< 1%"
```
