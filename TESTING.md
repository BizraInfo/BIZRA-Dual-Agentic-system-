# Testing Guide

This guide explains how to test the BIZRA Dual Agentic System.

## Rust Tests

Run the Rust test suite:

```bash
cargo test
```

Run tests with output:

```bash
cargo test -- --nocapture
```

## Python Dependency Validation

### Installing Python Dependencies

Install the required Python packages:

```bash
pip install -r requirements.txt
```

Or with user-local installation:

```bash
pip install --user -r requirements.txt
```

### Validating Dependency Constraints

Run the validation script to ensure dependencies meet the version constraints:

```bash
python3 validate_dependencies.py
```

This will check:
- neo4j version is < 5.0 (SEC-003 mitigation)
- numpy version is < 2.0 (SEC-003 mitigation)

Expected output:
```
======================================================================
SEC-003: neo4j/numpy Compatibility Validation
======================================================================

Checking dependency constraints from requirements.txt...

✓ neo4j: 4.4.13 (constraint: <5.0)
✓ numpy: 1.26.4 (constraint: <2.0)

======================================================================
✅ All dependency constraints validated successfully!
   The system is protected against SEC-003 compatibility issue.
```

### Manual Compatibility Test

Test that neo4j and numpy can be imported together:

```bash
python3 -c "
import neo4j
import numpy as np
print('neo4j version:', neo4j.__version__)
print('numpy version:', np.__version__)
print('numpy.bool_ available:', hasattr(np, 'bool_'))
"
```

Expected output:
```
neo4j version: 4.4.13
numpy version: 1.26.4
numpy.bool_ available: True
```

## Python Tests (Future)

Once Python components are added (`core/wisdom.py`, `test_kernel_receipt_integrity.py`), run:

```bash
# Using pytest
pytest tests/

# Using unittest
python3 -m unittest discover tests/
```

## Security Testing

Review security advisories and mitigations:

```bash
cat SECURITY.md
```

## Integration Testing

For full integration tests including both Rust and Python components:

```bash
# Build Rust components
cargo build --release

# Install Python dependencies
pip install -r requirements.txt

# Run all tests
cargo test && python3 -m pytest tests/
```

## Continuous Integration

The CI pipeline should:
1. Build Rust components (`cargo build --release`)
2. Run Rust tests (`cargo test`)
3. Install Python dependencies (`pip install -r requirements.txt`)
4. Validate dependency constraints (`python3 validate_dependencies.py`)
5. Run Python tests (once added)

---

**الحمد لله - All praise belongs to Allah**

*Testing with إحسان (excellence) ensures system reliability and security.*
