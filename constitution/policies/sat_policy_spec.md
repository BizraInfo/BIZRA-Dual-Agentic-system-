# SAT Policy Hooks v0.1 (Adapted from "Claude Code Damage Control")

**Integration Target:** Cognitive Plane (SAT Gateway)  
**Origin:** Adapted from "Claude Code Damage Control" (Hybrid Deterministic/Probabilistic Hooks)

### 1.0 The Hybrid Hook Architecture

Instead of relying solely on "Allowlists," we adopt the **Hybrid Hook** pattern to protect BIZRA Nodes from hallucinating agents.

```mermaid
graph TD
    A[Agent Request] --> B{SAT Reflex Gate\n(Deterministic)}
    B -- Match Blocked --> C[Reject (Fast)]
    B -- Match Allowed --> D{SAT Oracle Gate\n(Probabilistic)}
    D -- Safe (Ihsān > 0.95) --> E[Execute]
    D -- Unsafe/Ambiguous --> F[Ask Human / Quarantine]
    C --> G[Audit Log]
    E --> G
    F --> G
```

### 2.0 Hook Primitives (The "Why" and "How")

| Video Component | BIZRA Component | Implementation Strategy |
| :--- | :--- | :--- |
| **Patterns.yaml** | **SAT_Manifest.yaml** | Define `read_only`, `no_delete`, and `zero_access` paths for the Appliance filesystem (e.g., preventing deletion of `/var/lib/bizra/poi`). |
| **Prompt Hook** | **Ihsān Oracle** | A lightweight "Pre-Flight" LLM call (e.g., Haiku/3.5) that analyzes the *intent* of a command against the Ihsān constitution before execution. |
| **Deterministic Scripts** | **Reflex Circuit** | Regex-based blockers for known destructive commands (`rm -rf /`, `mkfs`, crypto-mining signatures) running in the orchestration layer (Python). |
| **"Ask" Flag** | **Veto/Confirm Loop** | Critical operations (e.g., updating the Node Identity) trigger a mandatory `await_confirmation` state in the Glass Cockpit. |

### 3.0 SAT Manifest Specification (`sat_policy.yaml`)

```yaml
# .bizra/config/sat_policy.yaml

version: "0.1"
policy_mode: "strict" # strict | permissive | learning

filesystem_gates:
  zero_access:
    - "/root/.ssh"
    - "/etc/shadow"
    - "/var/lib/bizra/identity/private_keys"  # The "Crown Jewels"
  
  read_only:
    - "/var/lib/bizra/config"
    - "/var/log"
    - "/root/.bashrc"
    
  no_delete:
    - "/root/bizra-genesis"
    - "*.json"  # Protect receipts

command_gates:
  blocked_patterns:
    - "rm -rf /$"               # Root deletion
    - ":(){ :|:& };:"           # Fork bomb
    - "wget * | bash"           # Unverified pipe-to-shell
    - "docker kill bizra-sat"   # Self-termination attempt

  prompt_hook_triggers:
    - description: "Any command involving network configuration"
      pattern: "ip|ifconfig|iptables|ufw"
      grader_prompt: "Is this network change necessary for standard node operation? If it opens ports 22 or 80 globally, BLOCK."

    - description: "Mass file modification"
      pattern: "find . -name *.json -delete"
      grader_prompt: "Is this a routine cleanup or a data wipe? If data wipe, REJECT."

resource_gates:
  cpu_spike_protection:
    trigger: "cpu_usage > 90% for 30s"
    action: "throttle_process"
    
  memory_leak_protection:
    trigger: "oom_score_adj near_limit"
    action: "restart_container_gracefully"
```

### 4.0 The "Ihsān Oracle" (Pre-Tool Prompt Hook)

**System Prompt for the Oracle:**
```text
You are the BIZRA Safety Oracle (SAT).
You are evaluating a command requested by a Sub-Agent (PAT).
Current Ihsān Context: BENEVOLENCE (Do no harm) + AMANAH (Protect the Node).

COMMAND: {command}
CONTEXT: {cwd}

Analyze the command for:
1. Irreversibility (formatting disks, deleting receipts)
2. Resource Exhaustion (fork bombs, crypto miners)
3. Exfiltration (uploading private keys)

Output JSON:
{
  "verdict": "ALLOW" | "BLOCK" | "ASK_HUMAN",
  "risk_score": 0.0-1.0,
  "reasoning": "Command attempts to delete immutable receipt history."
}
```

### 5.0 Implementation Roadmap
1.  **Day 1:** Add `sat_policy.yaml` to the default Warper installation config.
2.  **Day 2:** Implement the **Reflex Circuit** (Regex matcher) in `control-plane/policy_engine.py`.
3.  **Day 3:** Wire the **Oracle Circuit** (LLM check) into the Tool Execution Gateway.
