# BIZRA Governance & Synaptic Kernel

This directory contains the formal specifications for the BIZRA Meta-Council logic and execution workflows.

## 1. Governance Structure (`meta_council.yaml`)
Defines the "Mag7" / "High Table" architecture of the BIZRA Dual Agentic System.
- **8 Specialized Roles** (Orchestrator, Architect, Librarian, Skeptic, Verifier, Security, Operator, UX).
- **Cross-Pollination Rules**: Enforced peer review paths (e.g., Architect code must be reviewed by Operator).

## 2. Execution Workflow (`elite_execution_loop_v1.json`)
The strict 9-step state machine for mission execution.
1. `INTAKE`
2. `DECOMPOSE`
3. `ALLOCATE`
4. `DRAFT`
5. `CRITIQUE`
6. `VERIFY`
7. `HARDEN`
8. `INTEGRATE`
9. `POST_MORTEM`

## 3. Synaptic Protocol (`../bizra-synapse`)
The Rust implementation of the "Graph of Thoughts" (GoT) logic.
- **Traceability**: Every thought is a content-addressable node in a DAG.
- **Immutability**: Thoughts are signed and hashed.
- **Causality**: Except for root goals, all thoughts must have parents.

### Usage
This logic forms the "Brain" of the next-generation kernel, allowing the agent team to reason in a verifiable, auditable graph rather than linear chat logs.
