from synapse_py import PySynapticGraph
import json

class CouncilSynapse:
    def __init__(self):
        self.g = PySynapticGraph()

    def propose(self, content: str, parents=None, meta=None) -> str:
        parents = parents or []
        # Type guard: only call .get() if meta is dict-like
        role = None
        if meta is not None and hasattr(meta, 'get'):
            role = meta.get("role")
        
        tid = self.g.add_thought(content, parents, role)
        # Gate: no skipping validation
        self.g.validate()
        return tid

    def receipt_payload(self) -> dict:
        return json.loads(self.g.receipt_payload())

    def snapshot(self) -> dict:
        return json.loads(self.g.snapshot_json())
