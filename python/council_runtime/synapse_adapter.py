from synapse_py import PySynapticGraph
import json

class CouncilSynapse:
    def __init__(self):
        self.g = PySynapticGraph()

    def propose(self, content: str, parents=None, meta=None) -> str:
        parents = parents or []
        # Support passing role in meta for now if needed, or expand API
        role = meta.get("role") if meta else None
        
        tid = self.g.add_thought(content, parents, role)
        # Gate: no skipping validation
        self.g.validate()
        return tid

    def receipt_payload(self) -> dict:
        return json.loads(self.g.receipt_payload())

    def snapshot(self) -> dict:
        return json.loads(self.g.snapshot_json())
