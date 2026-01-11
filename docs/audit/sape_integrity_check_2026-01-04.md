# SAPE Integrity Check (Node0) - 2026-01-04

## Scope

- Repo: `/root/bizra-genesis`
- Reviewed: `bizra-genesis-node/bizra_kernel`, `core`, `docs`, `schemas`
- Missing from repo: `deepseek_python_20260102_95881f.py`, `BIZRA_Genesis_Seal (3).ipynb`, `bizra_memory_bank_OMEGA.zip`

## Lens 1: System Architect

- Kernel gating pipeline exists (verification + Ihsan + SNR + SAPE) in `bizra-genesis-node/bizra_kernel/kernel.py`.
- Protocol typing is still partial: a SynapseFrame scaffold exists in `bizra-genesis-node/bizra_kernel/synapse_frame.py`, but there is no protobuf schema or cryptographic verification.
- Spec mismatch: `docs/node0_spec.md` sets `IM >= 0.99`, while `bizra-genesis-node/bizra_kernel/ihsan_vector.py` uses 0.95.

## Lens 2: Pragmatic Engineer

- SAPE prompt engine is implemented in `core/sape.py` with canonical lenses and fail-closed framing.
- SNR scoring is heuristic and vulnerable to gaming (token filler filtering only) in `bizra-genesis-node/bizra_kernel/snr_tracker.py`.
- Gini coefficient is referenced only in `calculate_poi_multiplier` and is not enforced as a gate.

## Lens 3: Ethicist

- Ihsan scoring exists but uses heuristic defaults for most dimensions (`bizra-genesis-node/bizra_kernel/ihsan_vector.py`).
- Safety and adversarial checks are regex-based in `bizra-genesis-node/bizra_kernel/verifier.py`; no explicit veto dimensions.

## Evidence Table

| Evidence ID | Source | Finding | Citation |
| --- | --- | --- | --- |
| E-001 | `bizra-genesis-node/bizra_kernel/kernel.py` | Kernel orchestrates verification, Ihsan, SNR, and SAPE elevation in one execution pipeline. | `bizra-genesis-node/bizra_kernel/kernel.py` |
| E-002 | `bizra-genesis-node/bizra_kernel/ihsan_vector.py` | Ihsan threshold constant set to 0.95 (not 0.99). | `bizra-genesis-node/bizra_kernel/ihsan_vector.py` |
| E-003 | `docs/node0_spec.md` | Spec defines IM >= 0.99 invariant. | `docs/node0_spec.md` |
| E-004 | `bizra-genesis-node/bizra_kernel/snr_tracker.py` | SNR uses token heuristics and filler stripping only. | `bizra-genesis-node/bizra_kernel/snr_tracker.py` |
| E-005 | `core/sape.py` | SAPE prompt engine implemented with canonical lenses and fail-closed directives. | `core/sape.py` |
| E-006 | `schemas/sape_cycle_v1.schema.json` | SAPE schema exists, but no SynapseFrame schema/proto found. | `schemas/sape_cycle_v1.schema.json` |

## Gaps / Blockers

- `--genesis-deploy`: missing `deepseek_python_20260102_95881f.py`, so the blueprint cannot be repaired or executed here.
- SynapseFrame validation is present but only checks field presence; signature and Merkle root verification are not implemented.
- Ihsan threshold drift between docs and kernel must be resolved before release.

## Artifacts Added In This Run

- SynapseFrame scaffold: `bizra-genesis-node/bizra_kernel/synapse_frame.py`
- LLM bridge gate: `bizra-genesis-node/bizra_kernel/llm_bridge.py`
- Graph-of-Thoughts: `docs/graphs/node0_got.md`
