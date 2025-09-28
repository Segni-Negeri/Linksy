#!/bin/bash

# API Smoke Tests for Linksy
# Tests basic API endpoints to ensure they return expected status codes

BASE_URL="http://localhost:3000"
JWT_TOKEN=""
LINK_ID=""
TASK_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local expected_status="$2"
    local method="$3"
    local url="$4"
    local data="$5"
    local headers="$6"
    
    echo -n "Testing $test_name... "
    
    if [ -n "$data" ]; then
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "$headers" -d "$data" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" -d "$data" "$url")
        fi
    else
        if [ -n "$headers" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" -H "$headers" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" "$url")
        fi
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} ($status_code)"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}FAIL${NC} (expected $expected_status, got $status_code)"
        echo "Response: $body"
        ((TESTS_FAILED++))
    fi
}

echo "🚀 Starting API smoke tests for Linksy"
echo "========================================"

# Test 1: Hello endpoint
run_test "Hello endpoint" "200" "GET" "$BASE_URL/api/hello"

# Test 2: Public link endpoint (should work without auth)
run_test "Public link endpoint" "404" "GET" "$BASE_URL/api/links/slug/nonexistent"

# Test 3: Protected endpoints without auth (should return 401)
run_test "Links list without auth" "401" "GET" "$BASE_URL/api/links"
run_test "Create link without auth" "401" "POST" "$BASE_URL/api/links" '{"slug":"test","destination":"https://example.com"}'

# Test 4: Visit tracking (public endpoint)
run_test "Visit tracking" "400" "POST" "$BASE_URL/api/visits" '{}'
run_test "Visit tracking with link_id" "201" "POST" "$BASE_URL/api/visits" '{"link_id":"test-link-id"}'

# Test 5: Verification endpoint (public)
run_test "Verification without task_id" "400" "POST" "$BASE_URL/api/verify/invalid" '{}'
run_test "Verification with visit_id" "400" "POST" "$BASE_URL/api/verify/test-task" '{"visit_id":"test-visit"}'

# Test 6: Claims endpoint
run_test "Claims without data" "400" "POST" "$BASE_URL/api/claims" '{}'
run_test "Claims with visit_id and task_id" "400" "POST" "$BASE_URL/api/claims" '{"visit_id":"test-visit","task_id":"test-task"}'

# Test 7: Analytics endpoint without auth
run_test "Analytics without auth" "401" "GET" "$BASE_URL/api/analytics/test-link"

# Test 8: Rate limiting (make multiple requests)
echo -n "Testing rate limiting... "
for i in {1..5}; do
    curl -s -o /dev/null "$BASE_URL/api/links/slug/test"
done
echo -e "${YELLOW}SKIP${NC} (manual verification needed)"

# Test 9: Invalid methods
run_test "Invalid method on hello" "405" "POST" "$BASE_URL/api/hello"
run_test "Invalid method on links" "405" "PUT" "$BASE_URL/api/links"

# Test 10: Malformed JSON
run_test "Malformed JSON" "400" "POST" "$BASE_URL/api/links" '{"invalid": json}'

echo ""
echo "========================================"
echo "📊 Test Results:"
echo -e "✅ Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "❌ Failed: ${RED}$TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "🎉 ${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "💥 ${RED}Some tests failed!${NC}"
    exit 1
fi
