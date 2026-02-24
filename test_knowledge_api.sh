#!/bin/bash

# Test Knowledge Graph API Endpoints
# Usage: ./test_knowledge_api.sh

set -e

API_BASE="http://localhost:33333"
echo "=================================="
echo "Testing BIZRA Knowledge Graph API"
echo "=================================="
echo ""
echo "API Base URL: $API_BASE"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local endpoint=$2

    echo -e "${YELLOW}Testing:${NC} $name"
    echo -e "${YELLOW}URL:${NC} $API_BASE$endpoint"
    echo ""

    if response=$(curl -s -w "\n%{http_code}" "$API_BASE$endpoint"); then
        http_code=$(echo "$response" | tail -n1)
        body=$(echo "$response" | sed '$d')

        if [ "$http_code" = "200" ]; then
            echo -e "${GREEN}✓ SUCCESS${NC} (HTTP $http_code)"
            echo ""
            echo "Response (pretty-printed):"
            echo "$body" | jq '.' 2>/dev/null || echo "$body"
            echo ""
        else
            echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
            echo "$body"
            echo ""
        fi
    else
        echo -e "${RED}✗ FAILED${NC} - Could not connect to server"
        echo ""
    fi

    echo "---"
    echo ""
}

# Check if server is running
echo -e "${YELLOW}Checking if server is running...${NC}"
if ! curl -s "$API_BASE/health" > /dev/null 2>&1; then
    echo -e "${RED}✗ Server is not running at $API_BASE${NC}"
    echo ""
    echo "Start the server with:"
    echo "  cd bizra-genesis-node/backend && cargo run --release"
    echo ""
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""
echo "=================================="
echo ""

# Test all endpoints
test_endpoint "Graph Statistics" "/api/knowledge/stats"
test_endpoint "Daily Insight" "/api/knowledge/daily-insight"
test_endpoint "Recent Discoveries" "/api/knowledge/discoveries"
test_endpoint "Graph Data (first 100 nodes)" "/api/knowledge/graph-data"

echo "=================================="
echo -e "${GREEN}All tests complete!${NC}"
echo "=================================="
