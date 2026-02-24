# BEG Nodes P0 (Bizra Ecosystem Graph)
# Priority: Zero (Foundation)
# Definition of the core node types in the DDAGI architecture.

## 1. Pocket Node (Edge/Mobile)
- **Role**: The "Remote Control" or "Wallet" interface.
- **Hardware**: iOS/Android devices, ARM SBCs.
- **Capacity**: Limited (Low CPU, ~4GB RAM constraint).
- **Responsibilities**:
  - Signing transactions (Keys held in Secure Enclave).
  - Hosting the **LOGOS** agent (UI/Interaction).
  - Issuing commands to Home Nodes.
  - displaying notifications from **AESTHETE**.
- **SAT Constraint**: strict_energy_saver_policy.

## 2. Home Node (Core/Server)
- **Role**: The "Heavy Lifter" and "Data Haven".
- **Hardware**: Desktop PC (x86_64), NAS, Private Cloud.
- **Capacity**: High (Multi-core, GPU preferred, >16GB RAM).
- **Responsibilities**:
  - Running local LLM inference (e.g., Llama-3-8B).
  - Hosting the full **PAT** council (7 Agents).
  - Compiling code via **TEKNE**.
  - Validating blocks via **FATE**.
  - Storing the full user "Knowledge Shard" (Vector DB).
- **SAT Constraint**: performance_max_policy.

## Connectivity
- **Protocol**: LibP2P + WireGuard.
- **Topology**: Mesh. Pocket Nodes connect to Home Nodes via encrypted tunnels.
- **Synchronization**: `git` style delta updates for state; CRDTs for realtime data.

## Deployment Strategy
- **Phase 1**: CLI-only Rust binary (`player_node_mvi`).
- **Phase 2**: Docker container for Home Nodes.
- **Phase 3**: Mobile App wrapper for Pocket Nodes.
