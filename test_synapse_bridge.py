
import sys
import os

# Ensure we can find the built library
# It is likely in target/debug/libbizra_synapse_py.so or similar, but Python needs it in PYTHONPATH

try:
    import synapse_py as bizra_synapse_py
    print("✅ SUCCESS: Imported synapse_py")
    
    # Test basic functionality if available
    node = bizra_synapse_py.ThoughtNode("Test Content", "TESTER", "Plan")
    print(f"Created node: {node}")

except ImportError as e:
    print(f"❌ FAIL: Could not import synapse_py: {e}")
    print("Checking search path...")
    print(sys.path)
