class MockArray(list):
    def tolist(self): return self

class Random:
    def randn(self, n): return MockArray([0.5] * n)
    def seed(self, s): pass

random = Random()
__version__ = "1.26.4"
