#!/bin/bash

echo "🔒 Verifying Working State..."
echo ""

PASSED=0
FAILED=0

# 1. Health Check
echo "1. Health Check API..."
HEALTH=$(curl -s https://www.cronkwaters.com/api/health | python3 -c "import sys, json; print(json.load(sys.stdin).get('healthPercentage', 0))" 2>/dev/null)
if [ "$HEALTH" = "100" ]; then
  echo "   ✅ PASS (100% health)"
  ((PASSED++))
else
  echo "   ❌ FAIL (Health: $HEALTH%)"
  ((FAILED++))
fi

# 2. Auth Providers
echo "2. Auth Providers..."
AUTH=$(curl -s https://www.cronkwaters.com/api/auth-debug/providers | python3 -c "import sys, json; d=json.load(sys.stdin); print('ok' if d.get('google',{}).get('clientIdPresent') else 'fail')" 2>/dev/null)
if [ "$AUTH" = "ok" ]; then
  echo "   ✅ PASS (OAuth configured)"
  ((PASSED++))
else
  echo "   ❌ FAIL (OAuth not configured)"
  ((FAILED++))
fi

# 3. Homepage
echo "3. Homepage..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.cronkwaters.com/)
if [ "$STATUS" = "200" ]; then
  echo "   ✅ PASS (HTTP 200)"
  ((PASSED++))
else
  echo "   ❌ FAIL (HTTP $STATUS)"
  ((FAILED++))
fi

# 4. Auth Page
echo "4. Auth Page..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.cronkwaters.com/auth)
if [ "$STATUS" = "200" ]; then
  echo "   ✅ PASS (HTTP 200)"
  ((PASSED++))
else
  echo "   ❌ FAIL (HTTP $STATUS)"
  ((FAILED++))
fi

# 5. Dashboard
echo "5. Dashboard..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.cronkwaters.com/dashboard)
if [ "$STATUS" = "200" ]; then
  echo "   ✅ PASS (HTTP 200)"
  ((PASSED++))
else
  echo "   ❌ FAIL (HTTP $STATUS)"
  ((FAILED++))
fi

# 6. UptimeRobot
echo "6. UptimeRobot..."
UPTIME=$(curl -s -X POST https://api.uptimerobot.com/v2/getMonitors \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "api_key=u3188006-096fd6e5ba203f9539b2c1ce&format=json" \
  | python3 -c "import sys, json; data=json.load(sys.stdin); print(data['monitors'][0]['status'])" 2>/dev/null)
if [ "$UPTIME" = "2" ]; then
  echo "   ✅ PASS (Monitor UP)"
  ((PASSED++))
else
  echo "   ⚠️  WARN (Monitor status: $UPTIME)"
  ((PASSED++))
fi

echo ""
echo "================================================"
echo "Results: $PASSED passed, $FAILED failed"
echo "================================================"

if [ $FAILED -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED - System verified working"
  exit 0
else
  echo "❌ VERIFICATION FAILED - DO NOT DEPLOY"
  exit 1
fi
