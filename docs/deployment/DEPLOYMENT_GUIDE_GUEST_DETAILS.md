# Guest Details Feature - Deployment Guide

## 🚀 Quick Deployment

### Step 1: Database Migration (5 minutes)

```bash
# Connect to your database
mysql -u your_user -p your_database < service/database/migrations/010-add-guest-details-table.sql
```

**What it does:**
- Creates `guests` table
- Adds `guest_details` JSON column to `bookings` table
- Creates indexes for performance

**Verify:**
```sql
SHOW TABLES LIKE 'guests';
DESCRIBE guests;
DESCRIBE bookings;
```

---

### Step 2: Backend Deployment (10 minutes)

**Files to deploy:**
1. `service/src/features/hotel/routes/hotel.routes.ts`
2. `service/src/routes/user.routes.ts`

**Steps:**
```bash
# 1. Build backend
cd service
npm run build

# 2. Check for errors
npm run lint

# 3. Deploy (your deployment method)
# Example: docker build, push, deploy
```

**Verify:**
```bash
# Test booking creation endpoint
curl -X POST http://localhost:3001/api/hotels/hotel-id/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token" \
  -d '{
    "roomTypeId": "room-id",
    "checkIn": "2026-05-01",
    "checkOut": "2026-05-05",
    "guestCount": 2,
    "guestName": "John Doe",
    "guestEmail": "john@example.com",
    "guestDetails": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "nationality": "United Kingdom",
        "passportNumber": "AB123456",
        "dateOfBirth": "1990-01-15",
        "isLeadPassenger": true
      }
    ]
  }'
```

---

### Step 3: Frontend Deployment (10 minutes)

**Files to deploy:**
1. `frontend/src/components/Checkout/CheckoutContent.tsx`
2. `frontend/src/components/Dashboard/DashboardBookingsContent.tsx`
3. `frontend/src/components/MyBookings/MyBookingsContent.tsx`

**Steps:**
```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Check for errors
npm run lint

# 3. Deploy (your deployment method)
# Example: docker build, push, deploy
```

**Verify:**
```bash
# Check that checkout page loads
# Check that guest form displays
# Check that confirmation shows guests
```

---

### Step 4: Testing (15 minutes)

#### Test 1: Single Guest Booking
1. Go to checkout
2. Add 1 hotel (1 guest)
3. Fill lead passenger form
4. Complete payment
5. Verify confirmation shows guest

#### Test 2: Multiple Guest Booking
1. Go to checkout
2. Add 2 hotels (2 guests each = 4 total)
3. Fill lead passenger form
4. Add 3 additional guests
5. Fill all guest details
6. Complete payment
7. Verify confirmation shows all 4 guests

#### Test 3: Guest Data Verification
1. Create booking with guests
2. Check database:
   ```sql
   SELECT * FROM guests WHERE booking_id = 'booking-id';
   SELECT guest_details FROM bookings WHERE id = 'booking-id';
   ```
3. Verify all data stored correctly

#### Test 4: API Response
1. Call GET /users/me/bookings
2. Verify guestDetails array returned
3. Verify lead passenger marked
4. Verify all fields present

#### Test 5: Frontend Display
1. Go to My Bookings
2. Click "View Details" on booking
3. Verify all guests displayed
4. Verify lead passenger has badge
5. Verify all fields visible

#### Test 6: Mobile Responsive
1. Open checkout on mobile
2. Fill guest form
3. Verify layout responsive
4. Verify form easy to fill
5. Verify confirmation readable

---

## 📋 Pre-Deployment Checklist

- [ ] Database migration tested locally
- [ ] Backend builds without errors
- [ ] Frontend builds without errors
- [ ] All TypeScript types correct
- [ ] No console errors
- [ ] API endpoints tested
- [ ] Guest data stored correctly
- [ ] Guest data retrieved correctly
- [ ] Frontend displays guests correctly
- [ ] Mobile layout works
- [ ] Print layout works

---

## 🔄 Rollback Plan

If issues occur:

### Rollback Database
```sql
-- Drop guests table
DROP TABLE guests;

-- Remove guest_details column
ALTER TABLE bookings DROP COLUMN guest_details;
```

### Rollback Backend
- Revert to previous version of:
  - `service/src/features/hotel/routes/hotel.routes.ts`
  - `service/src/routes/user.routes.ts`

### Rollback Frontend
- Revert to previous version of:
  - `frontend/src/components/Checkout/CheckoutContent.tsx`
  - `frontend/src/components/Dashboard/DashboardBookingsContent.tsx`
  - `frontend/src/components/MyBookings/MyBookingsContent.tsx`

---

## 🐛 Troubleshooting

### Database Migration Fails
**Error**: "Table already exists"
- Solution: Check if guests table already exists
- Run: `SHOW TABLES LIKE 'guests';`

**Error**: "Column already exists"
- Solution: Check if guest_details column exists
- Run: `DESCRIBE bookings;`

### Backend Deployment Issues
**Error**: "Cannot find module"
- Solution: Run `npm install` in service directory
- Rebuild: `npm run build`

**Error**: "TypeScript compilation error"
- Solution: Check for type mismatches
- Run: `npm run lint`

### Frontend Deployment Issues
**Error**: "Cannot find module"
- Solution: Run `npm install` in frontend directory
- Rebuild: `npm run build`

**Error**: "Build fails"
- Solution: Clear node_modules and reinstall
- Run: `rm -rf node_modules && npm install`

### Guest Data Not Showing
**Issue**: Guests not displayed in confirmation
- Check: API returns guestDetails
- Check: Frontend receives data
- Check: Browser console for errors
- Solution: Clear browser cache

**Issue**: Guest count mismatch
- Check: Total guests from cart
- Check: Guests added in form
- Solution: Ensure count matches

---

## 📊 Monitoring

### After Deployment

**Monitor these metrics:**
1. Booking creation success rate
2. Guest data storage errors
3. API response times
4. Frontend load times
5. User feedback

**Check logs for:**
- Database errors
- API errors
- Frontend errors
- Guest data issues

---

## 📞 Support

### If Issues Occur

1. **Check logs**
   - Backend logs for errors
   - Database logs for issues
   - Browser console for frontend errors

2. **Verify data**
   - Check database for guest records
   - Verify API responses
   - Check frontend state

3. **Test endpoints**
   - Test booking creation
   - Test guest retrieval
   - Test API responses

4. **Rollback if needed**
   - Follow rollback plan above
   - Revert to previous version
   - Investigate issue

---

## ✅ Success Criteria

Deployment is successful when:

- ✅ Database migration applied
- ✅ Backend deploys without errors
- ✅ Frontend deploys without errors
- ✅ Checkout form displays correctly
- ✅ Guest form validation works
- ✅ Guests stored in database
- ✅ Guests retrieved from API
- ✅ Confirmation displays guests
- ✅ Mobile layout works
- ✅ No console errors
- ✅ Users can complete bookings
- ✅ All guest data displays correctly

---

## 📅 Timeline

| Step | Time | Status |
|------|------|--------|
| Database Migration | 5 min | ⏳ Ready |
| Backend Deployment | 10 min | ⏳ Ready |
| Frontend Deployment | 10 min | ⏳ Ready |
| Testing | 15 min | ⏳ Ready |
| Monitoring | Ongoing | ⏳ Ready |
| **Total** | **~40 min** | ⏳ Ready |

---

## 🎯 Summary

Guest details feature is ready for deployment:

1. **Database**: Migration file ready
2. **Backend**: Code updated and tested
3. **Frontend**: Components updated and tested
4. **Documentation**: Complete
5. **Testing**: Checklist provided
6. **Rollback**: Plan documented

**Status**: ✅ READY FOR DEPLOYMENT

---

**Deployment Date**: April 19, 2026
**Feature**: Guest Details Collection & Display
**Priority**: High
**Estimated Downtime**: None (backward compatible)
