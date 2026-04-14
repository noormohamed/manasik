#!/bin/bash

echo "🧪 Testing CORS and Login API"
echo ""

# Test 1: Direct API call without CORS (should work)
echo "1️⃣  Testing direct API call (no CORS)..."
DIRECT_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookingplatform.com","password":"password123"}')

echo "Response: $DIRECT_RESPONSE"
echo ""

# Test 2: API call with Origin header (CORS preflight)
echo "2️⃣  Testing API call with Origin header (CORS)..."
CORS_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3002" \
  -d '{"email":"admin@bookingplatform.com","password":"password123"}')

echo "Response: $CORS_RESPONSE"
echo ""

# Test 3: OPTIONS preflight request
echo "3️⃣  Testing OPTIONS preflight request..."
OPTIONS_RESPONSE=$(curl -s -X OPTIONS http://localhost:3001/api/admin/auth/login \
  -H "Origin: http://localhost:3002" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v 2>&1 | grep -i "access-control")

echo "CORS Headers:"
echo "$OPTIONS_RESPONSE"
echo ""

# Test 4: Check if endpoint exists
echo "4️⃣  Checking if endpoint exists..."
ENDPOINT_CHECK=$(curl -s -w "\n%{http_code}" http://localhost:3001/api/admin/auth/login)
HTTP_CODE=$(echo "$ENDPOINT_CHECK" | tail -1)
echo "HTTP Status Code: $HTTP_CODE"
echo ""

# Test 5: Check API health
echo "5️⃣  Checking API health..."
HEALTH=$(curl -s http://localhost:3001/api/health | grep -o '"status":"ok"')
if [ -n "$HEALTH" ]; then
  echo "✅ API is healthy"
else
  echo "❌ API health check failed"
fi
echo ""

# Test 6: Check if admin_users table exists
echo "6️⃣  Checking if admin_users table exists..."
TABLE_CHECK=$(docker exec booking_mysql mysql -u booking_user -pbooking_password booking_platform -e "SHOW TABLES LIKE 'admin_users';" 2>&1)
if echo "$TABLE_CHECK" | grep -q "admin_users"; then
  echo "✅ admin_users table exists"
else
  echo "❌ admin_users table does not exist"
fi
echo ""

echo "✅ Test complete!"
