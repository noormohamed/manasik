#!/bin/bash

echo "🧪 Testing Admin Panel..."
echo ""

# Test 1: Check if login page loads
echo "1️⃣  Testing login page..."
LOGIN_PAGE=$(curl -s http://localhost:3002/admin/login)
if echo "$LOGIN_PAGE" | grep -q "Admin Panel"; then
  echo "✅ Login page loads successfully"
else
  echo "❌ Login page failed to load"
  exit 1
fi

# Test 2: Check if API is responding
echo ""
echo "2️⃣  Testing API health..."
API_HEALTH=$(curl -s http://localhost:3001/api/health 2>&1)
if [ $? -eq 0 ]; then
  echo "✅ API is responding"
else
  echo "❌ API is not responding"
  exit 1
fi

# Test 3: Test login endpoint
echo ""
echo "3️⃣  Testing login endpoint..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bookingplatform.com","password":"password123"}')

if echo "$LOGIN_RESPONSE" | grep -q "success"; then
  echo "✅ Login endpoint working"
  echo "Response: $LOGIN_RESPONSE" | head -c 200
  echo ""
else
  echo "❌ Login endpoint failed"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

# Test 4: Check database
echo ""
echo "4️⃣  Testing database..."
DB_CHECK=$(docker exec booking_mysql mysql -u booking_user -pbooking_password booking_platform -e "SELECT COUNT(*) FROM admin_users;" 2>&1)
if echo "$DB_CHECK" | grep -q "COUNT"; then
  echo "✅ Database is accessible"
  echo "Admin users count: $(echo "$DB_CHECK" | tail -1)"
else
  echo "❌ Database is not accessible"
  exit 1
fi

# Test 5: Check containers
echo ""
echo "5️⃣  Checking container status..."
CONTAINERS=$(docker-compose ps --format "table {{.Service}}\t{{.Status}}")
echo "$CONTAINERS"

echo ""
echo "✅ All tests passed! Admin panel is running."
echo ""
echo "📍 Access the admin panel at: http://localhost:3002"
echo "📧 Email: admin@bookingplatform.com"
echo "🔐 Password: password123"
