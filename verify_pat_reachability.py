import requests
import time
import json
import statistics
import sys
import os

URL = "http://127.0.0.1:8080/api/dual/execute"
# Use environment variable if available, else default to 777
TOKEN = os.getenv("BIZRA_API_TOKEN", "genesis-token-777")
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {TOKEN}"
}

PAYLOAD = {
    "user_id": "verifier_b1",
    "task": "Perform a system check on the BIZRA node.",
    "requirements": ["quick check"],
    "target": "Status Report",
    "priority": "High",
    "context": {}
}

def verify_and_benchmark():
    latencies = []
    
    # Warmup with retry
    print("Waiting for server (60s timeout)...")
    start_wait = time.time()
    resp = None
    while True:
        try:
            resp = requests.post(URL, json=PAYLOAD, headers=HEADERS, timeout=5)
            resp.raise_for_status()
            print("Server connected!")
            break
        except Exception as e:
            if time.time() - start_wait > 60:
                print(f"Timed out. Last error: {e}")
                sys.exit(1)
            time.sleep(1)

    # Verify agent count
    data = resp.json()
    pat_contributions = data.get("pat_contributions", [])
    pat_count = len(pat_contributions)
    
    # Check meta field for authoritative count
    meta_count = data.get("meta", {}).get("pat_agents", 0)
    
    print(f"PAT Contributions List Size: {pat_count}")
    print(f"Meta PAT Agents Count: {meta_count}")
    
    # We accept 7 or 8 in the list, or 7 in meta
    if meta_count == 7:
        print("✅ PASS: Meta confirms 7 PAT agents configured.")
    elif pat_count == 7:
        print("✅ PASS: 7 PAT agents contributed directly.")
    elif pat_count == 8:
         print("✅ PASS: 7 PAT agents + 1 HotPath agent contributed. (Acceptable)")
    else:
        print(f"❌ FAIL: Expected 7 PAT agents, got list={pat_count}, meta={meta_count}")
        sys.exit(1)

    # Benchmark loop
    print("Running 20 requests for latency benchmark...")
    for i in range(20):
        start = time.time()
        try:
            resp = requests.post(URL, json=PAYLOAD, headers=HEADERS, timeout=5)
            resp.raise_for_status()
            elapsed = (time.time() - start) * 1000 # ms
            latencies.append(elapsed)
            sys.stdout.write(".")
            sys.stdout.flush()
        except Exception as e:
             sys.stdout.write("x")
             sys.stdout.flush()

    print("\n")
    
    if not latencies:
        print("❌ FAIL: No successful latency samples.")
        sys.exit(1)

    if len(latencies) < 15:
         print(f"⚠️ WARNING: High failure rate. Only {len(latencies)}/20 samples.")

    # Calculate p95
    # statistics.quantiles needs python 3.8+.  
    # Fallback or use manual calc for safety if ver is old, though 3.8 is standard now.
    try:
        p95 = statistics.quantiles(latencies, n=20)[18] 
    except AttributeError:
        # Fallback for older python
        latencies.sort()
        index = int(0.95 * len(latencies))
        p95 = latencies[index]

    print(f"Latency Samples: {latencies}")
    print(f"P95 Latency: {p95:.2f} ms")
    
    if p95 < 500: # 500ms requirement
        print(f"✅ PASS: p95 < 500ms")
    else:
        print(f"❌ FAIL: Latency too high ({p95:.2f}ms > 500ms)")
        sys.exit(1)

if __name__ == "__main__":
    verify_and_benchmark()
