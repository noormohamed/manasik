#!/bin/bash

# Test script for hotel update endpoint

HOTEL_ID="hotel-001"
API_URL="http://localhost:3001"

echo "Testing Hotel Update Endpoint"
echo "=============================="
echo ""

# Test 1: Get current hotel data
echo "1. Getting current hotel data..."
CURRENT=$(curl -s -X GET "$API_URL/api/hotels/$HOTEL_ID" \
  -H "Content-Type: application/json")

echo "Current Check-in Time: $(echo $CURRENT | jq -r '.data.hotel.checkInTime')"
echo "Current Check-out Time: $(echo $CURRENT | jq -r '.data.hotel.checkOutTime')"
echo "Current Cancellation Policy: $(echo $CURRENT | jq -r '.data.hotel.cancellationPolicy')"
echo ""

# Test 2: Update hotel with new policies
echo "2. Updating hotel policies..."
UPDATE_RESPONSE=$(curl -s -X PUT "$API_URL/api/hotels/$HOTEL_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{
    "checkInTime": "15:00",
    "checkOutTime": "12:00",
    "cancellationPolicy": "Free cancellation up to 48 hours before check-in. 50% refund for cancellations 24-72 hours before check-in. No refund for cancellations within 24 hours.",
    "hotelRules": "No smoking in rooms or common areas.\nQuiet hours: 22:00 - 08:00\nMaximum occupancy per room must be respected.\nGuests must present valid ID at check-in.\nPets are not allowed."
  }')

echo "Update Response:"
echo $UPDATE_RESPONSE | jq '.' 2>/dev/null || echo "Error: Could not parse response"
echo ""

# Test 3: Verify update
echo "3. Verifying update..."
UPDATED=$(curl -s -X GET "$API_URL/api/hotels/$HOTEL_ID" \
  -H "Content-Type: application/json")

echo "Updated Check-in Time: $(echo $UPDATED | jq -r '.data.hotel.checkInTime')"
echo "Updated Check-out Time: $(echo $UPDATED | jq -r '.data.hotel.checkOutTime')"
echo "Updated Cancellation Policy: $(echo $UPDATED | jq -r '.data.hotel.cancellationPolicy')"
echo "Updated Hotel Rules: $(echo $UPDATED | jq -r '.data.hotel.hotelRules')"
echo ""

echo "Test Complete!"
