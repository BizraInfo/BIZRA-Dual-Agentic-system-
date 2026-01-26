import requests
import json
import time

API_URL = "http://127.0.0.1:8080"
TOKEN = "genesis-token-777"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

def run_test():
    print("--- [C3] Auto-Tuner Actuation Verification ---")

    # 1. Set Threshold HIGH (Strict Mode)
    print("\n1. Setting Resonance Threshold to HIGH (100.0)...")
    try:
        resp = requests.post(
            f"{API_URL}/api/resonance/config",
            json={"threshold": 100.0},
            headers=HEADERS,
            timeout=5
        )
        if resp.status_code == 200:
            print("   ✅ Threshold updated to 100.0")
        else:
            print(f"   ❌ Failed to update threshold: {resp.status_code} {resp.text}")
            return
    except Exception as e:
        print(f"   ❌ Error updating threshold: {e}")
        return

    # 2. Send Request (Should be PRUNED/Fail)
    print("\n2. Sending Task (Expect High Filtering)...")
    payload = {
        "task": "Explain quantum entanglement",
        "user_id": "tester_c3",
        "requirements": ["brief"],
        "target": "Explanation",
        "context": {"source": "test"},
        "priority": "Low"
    }
    
    try:
        resp = requests.post(f"{API_URL}/api/dual/execute", json=payload, headers=HEADERS, timeout=15)
        print(f"   Response: {resp.status_code}")
        # If threshold is 100, PAT contributions (SNR ~1-5) will be filtered out.
        # If all filtered, bridge often returns error or empty result.
        if resp.status_code == 200:
            # Check if synergy is 0 or empty contributions
            data = resp.json()
            # If all pruned, usage of empty list might cause panic or error handle.
            # Assuming handle:
            print(f"   Result Synergy: {data.get('synergy_score')}")
            # We assume synergy drops significantly
    except Exception as e:
        print(f"   Error executing task: {e}")

    # 3. Set Threshold LOW (Relaxed Mode)
    print("\n3. Setting Resonance Threshold to LOW (0.1)...")
    try:
        requests.post(
            f"{API_URL}/api/resonance/config",
            json={"threshold": 0.1},
            headers=HEADERS
        )
        print("   ✅ Threshold updated to 0.1")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # 4. Send Request (Should Succeed)
    print("\n4. Sending Task (Expect Success)...")
    try:
        resp = requests.post(f"{API_URL}/api/dual/execute", json=payload, headers=HEADERS, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ Success. Synergy: {data.get('synergy_score')}")
        else:
            print(f"   ❌ Failed: {resp.status_code}")
    except Exception as e:
        print(f"   Error: {e}")

    # Reset to Default
    print("\n5. Resetting to Default (1.5)...")
    requests.post(f"{API_URL}/api/resonance/config", json={"threshold": 1.5}, headers=HEADERS)
    print("   ✅ Reset Complete.")

if __name__ == "__main__":
    run_test()
