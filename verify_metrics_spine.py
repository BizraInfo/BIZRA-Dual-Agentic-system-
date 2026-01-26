import requests
import sys

METRICS_URL = "http://127.0.0.1:8080/metrics"
TOKEN = "genesis-token-777" # Default token
HEADERS = {"Authorization": f"Bearer {TOKEN}"}

def verify_metrics():
    print(f"Fetching metrics from {METRICS_URL}...")
    try:
        resp = requests.get(METRICS_URL, headers=HEADERS, timeout=5)
        # Fallback for unauthorized if token mismatch (try without or warn)
        if resp.status_code == 401:
             print("⚠️  Unauthorized. Trying without token (if endpoint is public)...")
             resp = requests.get(METRICS_URL, timeout=5)
             
        resp.raise_for_status()
        content = resp.text
    except Exception as e:
        print(f"❌ FAIL: Could not fetch metrics: {e}")
        sys.exit(1)

    # Check for required metric families
    required_metrics = [
        "bizra_ihsan_score", 
        "bizra_sat_requests_total",
        # "bizra_mcp_tool_calls_total" # Might not be present if no tools called yet
    ]

    missing = []
    for m in required_metrics:
        if m not in content:
            missing.append(m)
    
    if missing:
        print(f"❌ FAIL: Missing metrics: {missing}")
        print("Content sample:\n" + content[:500])
        sys.exit(1)

    print("✅ PASS: Core metric families present.")

    # Check for specific data points we expect from previous phases
    if 'result="rejected"' in content and 'bizra_sat_requests_total' in content:
         print("✅ PASS: SAT Rejection recorded.")
    else:
         print("⚠️ WARNING: SAT Rejection NOT found in metrics (did B2 run against this instance?)")

    # Check ihsan score observations
    if 'bizra_ihsan_score_count' in content:
        print("✅ PASS: Ihsan score observations recorded.")
    else:
        print("⚠️ WARNING: No Ihsan score observations.")

    # Check tool timeout specifically (might not exist)
    if 'bizra_mcp_tool_calls_total' in content and 'timeout' in content:
         print("✅ PASS: Tool timeouts recorded.")
    else:
         print("ℹ️ INFO: No tool timeouts recorded yet (expected if none occurred).")

if __name__ == "__main__":
    verify_metrics()
