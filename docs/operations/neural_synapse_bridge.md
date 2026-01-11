# Neural-Synapse Bridge (LLM -> SynapseFrame -> Kernel)

This bridge enforces a typed SynapseFrame envelope before executing the Node0 kernel.

## Usage (sync example)

```python
from bizra_kernel import LLMBridge, BridgeConfig

def call_llm(prompt: str) -> str:
    # Replace with core.llm or your provider wrapper.
    return """{
      "frame_id": "00000000-0000-0000-0000-000000000000",
      "node_id": "node0",
      "intent": "Summarize the repo health",
      "content": "Summary response text here.",
      "timestamp": "2026-01-04T06:20:00+00:00",
      "fate_signature": "sig_placeholder",
      "zero_g_root": "merkle_root_placeholder",
      "ihsan_score": 0.96,
      "gini_coefficient": 0.2
    }"""

bridge = LLMBridge(config=BridgeConfig())
result = bridge.run("Provide a SynapseFrame JSON response.", call_llm)

if not result.verified:
    print("Blocked:", result.errors)
else:
    print("Kernel pass:", result.kernel_result.passed)
```

## Required SynapseFrame Fields

- `frame_id`
- `node_id`
- `intent`
- `content`
- `timestamp` (ISO 8601)
- `fate_signature`
- `zero_g_root`
- `ihsan_score`
- `gini_coefficient`
