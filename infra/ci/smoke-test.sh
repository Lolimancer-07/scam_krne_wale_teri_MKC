#!/usr/bin/env bash
set -euo pipefail

# ScamShield Post-Deployment Smoke Test
BASE_URL="${1:-http://localhost:3000}"
echo "Running ScamShield smoke tests against: ${BASE_URL}"

# 1. Health check
echo -n "Checking /api/v1/health... "
HEALTH_RES=$(curl -s -f "${BASE_URL}/api/v1/health")
echo "${HEALTH_RES}" | grep -q '"status":"ok"'
echo "OK"

# 2. Readiness check
echo -n "Checking /api/v1/ready... "
READY_RES=$(curl -s -f "${BASE_URL}/api/v1/ready")
echo "${READY_RES}" | grep -q '"status"'
echo "OK"

# 3. Analyze text (Acceptance Criteria: Fake SBI KYC scam)
echo -n "Testing fake SBI KYC text analysis... "
ANALYSIS_RES=$(curl -s -f -X POST "${BASE_URL}/api/v1/analyze/text" \
  -H "Content-Type: application/json" \
  -d '{"text":"Dear Customer, your SBI KYC expires today, verify via http://sbi-kyc-update.xyz or account will be blocked"}')

echo "${ANALYSIS_RES}" | grep -q '"verdict":"likely_scam"'
echo "${ANALYSIS_RES}" | grep -q '"category":"bank_kyc"'
echo "OK (Verdict: likely_scam, Category: bank_kyc)"

# 4. Analyze URL
echo -n "Testing URL analysis endpoint... "
URL_RES=$(curl -s -f -X POST "${BASE_URL}/api/v1/analyze/url" \
  -H "Content-Type: application/json" \
  -d '{"url":"http://sbi-verification.xyz"}')

echo "${URL_RES}" | grep -q '"verdict":"likely_scam"'
echo "OK"

# 5. Public stats check
echo -n "Checking /api/v1/stats... "
STATS_RES=$(curl -s -f "${BASE_URL}/api/v1/stats")
echo "${STATS_RES}" | grep -q '"totalScans"'
echo "OK"

echo "=========================================="
echo "All post-deployment smoke tests PASSED! 🛡️"
echo "=========================================="

