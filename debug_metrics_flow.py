import requests
import time
import re

API_URL = "http://127.0.0.1:8080"

def run_test():
    print("1. Sending execution request...")
    try:
        resp = requests.post(
            f"{API_URL}/api/dual/execute",
            json={
                "task": "Test metric spine debugging",
                "user_id": "debugger_v1",
                "requirements": ["quick check"],
                "target": "Status Report",
                "context": {"source": "debugger"},
                "priority": "Medium"
            },
            headers={"Authorization": "Bearer genesis-token-777"},
            timeout=10
        )
        if resp.status_code == 200:
            data = resp.json()
            print(f"   Success. Ihsan Score: {data.get('ihsan_score')}")
        else:
            print(f"   Failed: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"   Error: {e}")

    print("\n2. Fetching metrics...")
    try:
        resp = requests.get(
            f"{API_URL}/metrics",
             headers={"Authorization": "Bearer genesis-token-777"}
        )
        if resp.status_code == 200:
            metrics = resp.text
            print(f"   Metrics Length: {len(metrics)}")
            
            # Check for ihsan_score
            match = re.search(r'bizra_ihsan_score_count', metrics)
            if match:
                print("   [OK] found 'bizra_ihsan_score_count'")
            else:
                print("   [FAIL] 'bizra_ihsan_score' NOT found")
                
            # Print a snippet of metrics to see what IS there
            print("\n   Snippet:")
            print("\n".join(metrics.split("\n")[:20]))
        else:
            print(f"   Failed to get metrics: {resp.status_code}")
    except Exception as e:
        print(f"   Error fetching metrics: {e}")

if __name__ == "__main__":
    run_test()
