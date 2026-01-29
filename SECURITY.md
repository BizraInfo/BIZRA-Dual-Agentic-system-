# Security Advisories and Mitigations

This document tracks security issues, compatibility problems, and their mitigations in the BIZRA Dual Agentic System.

## SEC-003: neo4j/numpy Compatibility Issue

### Summary
The `neo4j` Python package (versions 5.20-5.28) has a breaking compatibility issue with NumPy 2.x due to deprecated `np.bool_` usage.

### Error Details
```python
AttributeError: module 'numpy' has no attribute 'bool_'
# Location: neo4j/_codec/packstream/v1/types.py:38
# Code: TRUE_VALUES = (*TRUE_VALUES, np.bool_(True))
```

### Impact
- **Affected Components**: Future Python components (`core/wisdom.py`, `test_kernel_receipt_integrity.py`)
- **Root Cause**: `neo4j.GraphDatabase` import incompatibility with NumPy 2.x
- **Severity**: Medium (tests would fail, but core Rust functionality unaffected)

### Mitigation Applied
**Option 1: Pin older neo4j and numpy versions (Recommended)**

We have implemented version constraints in `requirements.txt`:
```python
neo4j<5.0      # Avoid versions 5.20-5.28 with NumPy 2.x incompatibility
numpy<2.0      # Use NumPy 1.x for compatibility with neo4j < 5.0
```

### Alternative Mitigations Considered

**Option 2: Mock neo4j in tests**
- Could mock `neo4j.GraphDatabase` in test files
- Would avoid the dependency issue in tests only
- Not chosen: Doesn't solve the issue for production code

**Option 3: Wait for upstream fix**
- Monitor: https://github.com/neo4j/neo4j-python-driver/issues
- Not chosen: Proactive mitigation is better than waiting

### Future Resolution
Once the neo4j Python driver is updated to support NumPy 2.x, the version constraints can be relaxed:
```python
neo4j>=5.30  # Hypothetical fixed version
numpy>=2.0   # Can use NumPy 2.x once neo4j is compatible
```

### References
- **Flagged by**: SAPE v1.∞ Analysis
- **Related PR**: BizraInfo/BIZRA-Dual-Agentic-system-#4
- **Issue**: SEC-003
- **Date Identified**: 2026-01-29
- **Status**: Mitigated (proactive version pinning)

---

**الحمد لله - All praise belongs to Allah**

*This document follows the principle of إحسان (excellence) in security practices.*
