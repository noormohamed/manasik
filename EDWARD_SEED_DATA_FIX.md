# Edward Sanchez Seed Data Fix

## Problem
Edward's hotels were not appearing in the `/api/hotels/listings` endpoint even though the seed data had been created.

## Root Cause
The seed data was using an incorrect user ID (`edward-001`) instead of Edward's actual user ID in the system (`11aacd48-5b1e-48dc-8abe-862716d53e41`).

The hotel listing endpoint queries for hotels where:
- The user is a company admin, OR
- The user is an agent managing the hotel, OR
- The user's ID matches the agent's user_id

Since the seed data used `edward-001` as the agent's user_id, but Edward's actual user ID is `11aacd48-5b1e-48dc-8abe-862716d53e41`, the query didn't find any matching hotels.

## Solution
Updated `service/database/seed-edward-listings.sql` to use Edward's correct user ID:

### Changes Made:
1. **Agent Record**: Updated the `user_id` in the agents table insert from `edward-001` to `11aacd48-5b1e-48dc-8abe-862716d53e41`
2. **Hotel Images**: Updated all `uploaded_by` fields in the hotel_images table inserts from `edward-001` to `11aacd48-5b1e-48dc-8abe-862716d53e41`

### Updated Seed File
File: `service/database/seed-edward-listings.sql`

**Before:**
```sql
INSERT INTO agents (id, user_id, company_id, service_type, name, email, phone, status, commission_rate)
VALUES ('agent-edward', 'edward-001', 'comp-001', 'HOTEL', 'Edward Sanchez', 'edward.sanchez@email.com', '+1234567890', 'ACTIVE', 10.00)
```

**After:**
```sql
INSERT INTO agents (id, user_id, company_id, service_type, name, email, phone, status, commission_rate)
VALUES ('agent-edward', '11aacd48-5b1e-48dc-8abe-862716d53e41', 'comp-001', 'HOTEL', 'Edward Sanchez', 'edward.sanchez@email.com', '+1234567890', 'ACTIVE', 10.00)
```

## How to Apply
1. Re-run the seed file: `mysql -h localhost -u root -proot -D makkahotels < service/database/seed-edward-listings.sql`
2. Test the endpoint: `curl 'http://localhost:3001/api/hotels/listings?includeRooms=true' -H 'Authorization: Bearer <edward_token>'`

## Expected Result
Edward's 3 hotels should now appear:
- Sanchez Makkah Suites (hotel-edward-001)
- Al-Sanchez Boutique Hotel (hotel-edward-002)
- Edward's Medina Retreat (hotel-edward-003)

Each hotel will have:
- 2 images with MD5-based deterministic filenames
- Primary image marked (first image)
- CDN URLs for image delivery
- Complete metadata (file size, MIME type, upload timestamp, etc.)

## Hotel Image Management System Integration
The seed data now properly integrates with the hotel image management system:
- Images stored with new schema (image_key, cdn_url, file_name, file_size, mime_type, uploaded_by, is_primary, image_number)
- MD5-based deterministic filenames: `md5(hotel_id_md5 + image_number).jpg`
- S3 paths: `mk-images/hotel_id_md5/filename.jpg`
- CDN URLs: `https://mk-images.wasabisys.com/mk-images/hotel_id_md5/filename.jpg`
- hotel_id_md5 column populated for all hotels
