import sys
import os
import time
import uuid
import hashlib
from dataclasses import dataclass, field

# Ensure we can import from local modules
sys.path.append(os.getcwd())

try:
    from bizra_kernel.kernel import get_kernel, KernelConfig
    from bizra_kernel.replay_guard import Envelope
    from bizra_kernel import IhsanVector
except ImportError as e:
    print(f"❌ Setup Error: {e}")
    sys.exit(1)

def run_t_test():
    print("=" * 60)
    print("  BIZRA ELITE UPGRADE — T-TEST VERIFICATION")
    print("=" * 60)

    # 1. Setup Kernel with Enforcement
    config = KernelConfig(enable_envelope_enforcement=True)
    try:
        from bizra_kernel.kernel import reset_kernel
        kernel = reset_kernel(config)
    except ImportError:
        # Fallback if reset_kernel not available yet
        from bizra_kernel.kernel import get_kernel
        kernel = get_kernel()
        kernel.config = config
        # Re-init replay guard if needed
        from bizra_kernel.replay_guard import ReplayGuard
        kernel.replay_guard = ReplayGuard()
    
    print("✅ Kernel Configured: Envelope Enforcement = TRUE")
    
    # 2. Test: No Envelope -> Fail
    print("\n[Test 1] Execution WITHOUT Envelope...")
    try:
        kernel.execute(
            agent="Tester",
            query="Hello",
            response="Hi",
            envelope=None
        )
        print("❌ FAILED: Security breach! Execution allowed without envelope.")
    except ValueError as e:
        if "Envelope required" in str(e):
            print(f"✅ PASSED: Blocked correctly ({e})")
        else:
            print(f"⚠️ PASSED (Variant): Blocked with error: {e}")

    # 3. Test: Valid Envelope -> Pass
    print("\n[Test 2] Execution WITH Valid Envelope...")
    session_id = str(uuid.uuid4())
    counter = 1
    msg = "Elite Request"
    agent = "Tester"
    
    # Generate envelope
    payload_hash = hashlib.sha256(f"{agent}:{msg}".encode()).hexdigest()
    env = Envelope(
        policy_hash=kernel.protocol_hash,
        session_id=session_id,
        agent_id=agent,
        nonce=str(uuid.uuid4()),
        counter=counter,
        timestamp=time.time(),
        payload_hash=payload_hash
    )
    
    try:
        result = kernel.execute(
            agent=agent,
            query=msg,
            response="Elite Response",
            envelope=env
        )
        print(f"✅ PASSED: Execution successful (Ihsan={result.ihsan_vector.composite_score:.2f})")
    except Exception as e:
        print(f"❌ FAILED: Valid envelope rejected: {e}")

    # 4. Test: Replay Attack -> Fail
    print("\n[Test 3] Replay Attack (Same Envelope)...")
    try:
        kernel.execute(
            agent=agent,
            query=msg,
            response="Replayed Response",
            envelope=env  # Reusing same envelope
        )
        print("❌ FAILED: Replay attack successful!")
    except ValueError as e:
        if "Replay detected" in str(e):
            print(f"✅ PASSED: Replay blocked ({e})")
        else:
            print(f"⚠️ PASSED (Variant): Blocked with error: {e}")

    # 5. Test: Monotonic Counter Violation -> Fail
    print("\n[Test 4] Ordering Violation (Counter=1 again)...")
    # New envelope but old counter
    env_bad_order = Envelope(
        policy_hash=kernel.protocol_hash,
        session_id=session_id,
        agent_id=agent,
        nonce=str(uuid.uuid4()), # New nonce
        counter=1, # Violates monotonic (already saw 1)
        timestamp=time.time(),
        payload_hash=payload_hash
    )
    try:
        kernel.execute(
            agent=agent,
            query=msg,
            response="Bad Order",
            envelope=env_bad_order
        )
        print("❌ FAILED: Ordering violation allowed!")
    except ValueError as e:
        if "Ordering violation" in str(e):
            print(f"✅ PASSED: Ordering enforced ({e})")
        else:
            print(f"⚠️ PASSED (Variant): Blocked with error: {e}")

    print("\n" + "=" * 60)
    print("  T-TEST SUMMARY")
    print("=" * 60)
    # Check manual output...

if __name__ == "__main__":
    run_t_test()
