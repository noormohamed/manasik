# Hotel Image Management System - Implementation Guide

## Overview

This document describes the complete implementation of the Hotel Image Management System for the Manasik booking platform. The system enables hotel owners to upload, manage, and display images using Wasabi S3 storage with CDN delivery.

## Architecture

### Technology Stack

- **Backend**: Node.js/TypeScript with Koa framework
- **Database**: MySQL
- **Storage**: Wasabi S3 (S3-compatible object storage)
- **CDN**: Wasabi CDN for image delivery
- **Frontend**: React/TypeScript with Next.js
- **Testing**: Jest (unit/integration), Playwright (E2E)

### System Components

#### 1. Database Layer

**Migrations Created:**
- `020-create-hotel-images-table.sql` - Main hotel_images table
- `021-add-hotel-id-md5-column.sql` - MD5 hash column for clean URLs
- `022-create-image-upload-audit-table.sql` - Audit logging

**Schema:**
```sql
hotel_images:
  - id (PK)
  - hotel_id (FK)
  - image_key (S3 path)
  - cdn_url (Wasabi CDN URL)
  - file_name (original filename)
  - file_size (bytes)
  - mime_type (MIME type)
  - uploaded_by (user_id)
  - is_primary (boolean)
  - image_number (sequential)
  - display_order (for sorting)
  - created_at, updated_at

hotels:
  - hotel_id_md5 (MD5 hash of hotel ID)
```

#### 2. Backend Services

**Wasabi S3 Service** (`service/src/services/wasabi-s3.service.ts`)
- `uploadImage()` - Upload with retry logic
- `deleteImage()` - Delete from S3
- `validateImageFile()` - File validation
- `generateImageFilename()` - MD5-based deterministic naming
- `generateS3Key()` - S3 path generation
- `generateCdnUrl()` - CDN URL generation

**Hotel Images Service** (`service/src/services/hotel-images.service.ts`)
- `uploadHotelImage()` - Complete upload workflow
- `deleteHotelImage()` - Complete deletion workflow
- `getHotelImages()` - Fetch single hotel images
- `getMultipleHotelsImages()` - Batch fetch for multiple hotels
- `setPrimaryImage()` - Set hero image
- `reorderImages()` - Reorder gallery
- `checkRateLimit()` - Rate limiting (10/hour)
- `cascadeDeleteHotelImages()` - Delete on hotel deletion

#### 3. API Routes

**Hotel Images Routes** (`service/src/routes/hotel-images.routes.ts`)

```
POST   /api/hotel/:hotelId/images              - Upload image (auth required)
DELETE /api/hotel/:hotelId/images/:imageId     - Delete image (auth required)
GET    /api/hotel/:hotelIdMd5/images           - Fetch single hotel images (public)
GET    /api/hotel/images                       - Fetch multiple hotels images (public)
PUT    /api/hotel/:hotelId/images/:imageId/primary - Set primary image (auth required)
PUT    /api/hotel/:hotelId/images/reorder      - Reorder images (auth required)
```

#### 4. Frontend Components

**Image Upload Component** (`frontend/src/components/HotelManagement/ImageUploadComponent.tsx`)
- Drag-and-drop file input
- File validation (type, size)
- Image preview
- Upload progress tracking
- Error handling with retry

**Image Gallery Component** (`frontend/src/components/HotelManagement/ImageGalleryComponent.tsx`)
- Grid display of images
- Delete with confirmation
- Set primary image
- Drag-to-reorder functionality
- Image metadata display

**Hotel Image Carousel** (`frontend/src/components/HotelManagement/HotelImageCarousel.tsx`)
- Carousel display for hotel details
- Navigation buttons
- Thumbnail strip
- Dot indicators
- Primary image badge

**Hotel Listing Images** (`frontend/src/components/HotelManagement/HotelListingImages.tsx`)
- Primary image display for listings
- Lazy loading support
- Placeholder handling

## Key Features

### 1. Deterministic Filename Generation

Images are named using MD5 hashing for clean, predictable URLs:
```
Filename: md5(hotel_id_md5 + image_number).jpg
S3 Path: mk-images/hotel_id_md5/filename.jpg
CDN URL: https://mk-images.wasabisys.com/mk-images/hotel_id_md5/filename.jpg
```

### 2. Ownership Verification

All write operations verify that the user owns the hotel:
```typescript
const isOwner = await verifyOwnership(hotelId, userId);
if (!isOwner) throw new Error('Unauthorized');
```

### 3. Rate Limiting

Users are limited to 10 uploads per hour:
```typescript
const withinLimit = await checkRateLimit(userId);
if (!withinLimit) return 429 Too Many Requests;
```

### 4. Retry Logic with Exponential Backoff

S3 operations retry up to 3 times with exponential backoff:
```typescript
await retryWithBackoff(async () => {
  await s3.putObject(...).promise();
}, 3, 1000); // 3 attempts, 1s base delay
```

### 5. Cascade Delete

When a hotel is deleted, all associated images are removed from S3 and database:
```typescript
await cascadeDeleteHotelImages(hotelId);
```

### 6. Primary Image Management

Hotels can set one image as primary (hero image):
- Primary image is returned first in API responses
- Displayed prominently on listing pages
- Only one primary per hotel

### 7. Image Reordering

Hotel owners can reorder images via drag-and-drop:
- Display order is persisted in database
- New images added to end of gallery

## Environment Configuration

Add to `.env`:
```
WASABI_ACCESS_KEY_ID=your-access-key
WASABI_SECRET_ACCESS_KEY=your-secret-key
WASABI_ENDPOINT=https://s3.eu-west-1.wasabisys.com
```

## Testing

### Unit Tests

**Backend:**
- `service/src/__tests__/wasabi-s3.service.test.ts` - S3 service tests
- `service/src/__tests__/hotel-images.service.test.ts` - Business logic tests

**Frontend:**
- `frontend/src/components/HotelManagement/__tests__/ImageUploadComponent.test.tsx`
- `frontend/src/components/HotelManagement/__tests__/ImageGalleryComponent.test.tsx`

### Integration Tests

- `service/src/__tests__/hotel-images-integration.test.ts` - Complete workflows
- `service/src/__tests__/hotel-images.api.test.ts` - API endpoint tests

### E2E Tests

- `frontend/e2e/hotel-images.spec.ts` - Complete user flows

### Running Tests

```bash
# Backend unit tests
cd service
npm test -- wasabi-s3.service.test.ts
npm test -- hotel-images.service.test.ts

# Backend integration tests
npm test -- hotel-images-integration.test.ts
npm test -- hotel-images.api.test.ts

# Frontend unit tests
cd frontend
npm test -- ImageUploadComponent.test.tsx
npm test -- ImageGalleryComponent.test.tsx

# E2E tests
npm run test:e2e -- hotel-images.spec.ts
```

## API Documentation

### Upload Image

```
POST /api/hotel/:hotelId/images
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  file: <image file>

Response (201):
{
  "message": "Image uploaded successfully",
  "image": {
    "id": "img-1",
    "hotelId": "hotel-1",
    "cdnUrl": "https://mk-images.wasabisys.com/...",
    "fileName": "test.jpg",
    "fileSize": 102400,
    "mimeType": "image/jpeg",
    "isPrimary": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Delete Image

```
DELETE /api/hotel/:hotelId/images/:imageId
Authorization: Bearer <token>

Response (200):
{
  "message": "Image deleted successfully"
}
```

### Fetch Single Hotel Images

```
GET /api/hotel/:hotelIdMd5/images?limit=10&offset=0

Response (200):
{
  "images": [
    {
      "id": "img-1",
      "cdnUrl": "https://mk-images.wasabisys.com/...",
      "fileName": "test.jpg",
      "fileSize": 102400,
      "mimeType": "image/jpeg",
      "isPrimary": true,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 5
  }
}
```

### Fetch Multiple Hotels Images

```
GET /api/hotel/images?hotelIds=md5_1,md5_2,md5_3&limit=10&offset=0

Response (200):
{
  "data": {
    "md5_1": [
      {
        "id": "img-1",
        "cdnUrl": "https://mk-images.wasabisys.com/...",
        ...
      }
    ],
    "md5_2": [...]
  }
}
```

### Set Primary Image

```
PUT /api/hotel/:hotelId/images/:imageId/primary
Authorization: Bearer <token>

Response (200):
{
  "message": "Primary image set successfully",
  "image": {
    "id": "img-1",
    "isPrimary": true,
    ...
  }
}
```

### Reorder Images

```
PUT /api/hotel/:hotelId/images/reorder
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "imageIds": ["img-2", "img-1", "img-3"]
}

Response (200):
{
  "message": "Images reordered successfully",
  "images": [
    {
      "id": "img-2",
      "displayOrder": 1,
      ...
    },
    ...
  ]
}
```

## Error Handling

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Invalid file type | File is not JPEG, PNG, or WebP |
| 400 | File size exceeds limit | File is larger than 10MB |
| 401 | Unauthorized | Missing or invalid auth token |
| 403 | Forbidden | User does not own the hotel |
| 404 | Not found | Image or hotel not found |
| 429 | Too Many Requests | Rate limit exceeded (10/hour) |
| 500 | Internal error | S3 or database error |

### Error Response Format

```json
{
  "error": "Error message",
  "message": "Detailed error message (if applicable)",
  "resetAt": "2024-01-01T01:00:00Z" (for rate limit errors)
}
```

## Performance Considerations

### Optimization Strategies

1. **CDN Delivery**: All images served through Wasabi CDN for fast delivery
2. **Lazy Loading**: Frontend components support lazy loading for images
3. **Batch Fetching**: Multiple hotel images fetched in single request
4. **Database Indexes**: Indexes on hotel_id, uploaded_by, created_at, is_primary
5. **Pagination**: API supports limit/offset for large galleries

### Caching

- Image metadata cached in database
- CDN URLs cached in database (no regeneration needed)
- Browser caching via CDN headers

## Security Considerations

### Authentication & Authorization

- All write operations require authentication
- Ownership verification on all hotel-specific operations
- Rate limiting prevents abuse

### File Validation

- MIME type validation on frontend and backend
- File size validation (10MB limit)
- Filename sanitization

### S3 Access

- Credentials stored in environment variables
- IAM policies restrict bucket access
- Public read access for CDN delivery
- Private write access via backend only

## Deployment

### Prerequisites

1. Wasabi S3 account with bucket `mk-images`
2. AWS SDK installed (`npm install aws-sdk`)
3. Environment variables configured

### Database Migration

```bash
# Run migrations
npm run migrate:latest

# Or manually execute SQL files in order:
# 1. 020-create-hotel-images-table.sql
# 2. 021-add-hotel-id-md5-column.sql
# 3. 022-create-image-upload-audit-table.sql
```

### Environment Setup

```bash
# Add to .env
WASABI_ACCESS_KEY_ID=your-key
WASABI_SECRET_ACCESS_KEY=your-secret
WASABI_ENDPOINT=https://s3.eu-west-1.wasabisys.com
```

### Verification

```bash
# Test S3 connection
curl -X GET https://mk-images.wasabisys.com/

# Test API endpoint
curl -X GET http://localhost:3001/api/hotel/test-md5/images

# Run tests
npm test
```

## Future Enhancements

1. **Image Optimization**: Automatic resizing/compression
2. **Batch Upload**: Multiple file upload support
3. **Image Editing**: Crop, rotate, filter capabilities
4. **Watermarking**: Add hotel branding to images
5. **Analytics**: Track image views and engagement
6. **Backup**: Automated backup to secondary storage
7. **Virus Scanning**: Malware detection on upload
8. **Presigned URLs**: Direct browser-to-S3 uploads

## Troubleshooting

### Common Issues

**Issue**: Images not uploading
- Check Wasabi credentials in .env
- Verify bucket exists and is accessible
- Check rate limit (10/hour per user)

**Issue**: CDN URLs not accessible
- Verify S3 object ACL is public-read
- Check CDN configuration in Wasabi
- Verify bucket name and region

**Issue**: Database errors
- Run migrations: `npm run migrate:latest`
- Check database connection in .env
- Verify hotel_id_md5 column exists

**Issue**: Tests failing
- Clear jest cache: `jest --clearCache`
- Reinstall dependencies: `npm install`
- Check mock setup in test files

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review test files for usage examples
3. Check API documentation for endpoint details
4. Review error messages and logs

## Files Created

### Backend
- `service/database/migrations/020-create-hotel-images-table.sql`
- `service/database/migrations/021-add-hotel-id-md5-column.sql`
- `service/database/migrations/022-create-image-upload-audit-table.sql`
- `service/src/services/wasabi-s3.service.ts`
- `service/src/services/hotel-images.service.ts`
- `service/src/routes/hotel-images.routes.ts`
- `service/src/__tests__/wasabi-s3.service.test.ts`
- `service/src/__tests__/hotel-images.service.test.ts`
- `service/src/__tests__/hotel-images.api.test.ts`
- `service/src/__tests__/hotel-images-integration.test.ts`

### Frontend
- `frontend/src/components/HotelManagement/ImageUploadComponent.tsx`
- `frontend/src/components/HotelManagement/ImageUploadComponent.module.css`
- `frontend/src/components/HotelManagement/ImageGalleryComponent.tsx`
- `frontend/src/components/HotelManagement/ImageGalleryComponent.module.css`
- `frontend/src/components/HotelManagement/HotelImageCarousel.tsx`
- `frontend/src/components/HotelManagement/HotelImageCarousel.module.css`
- `frontend/src/components/HotelManagement/HotelListingImages.tsx`
- `frontend/src/components/HotelManagement/HotelListingImages.module.css`
- `frontend/src/components/HotelManagement/__tests__/ImageUploadComponent.test.tsx`
- `frontend/src/components/HotelManagement/__tests__/ImageGalleryComponent.test.tsx`
- `frontend/e2e/hotel-images.spec.ts`

### Configuration
- Updated `service/.env.example` with Wasabi credentials
- Updated `service/package.json` with aws-sdk dependency
- Updated `service/src/routes/api.routes.ts` to include hotel images routes

## Summary

The Hotel Image Management System is now fully implemented with:
- ✅ Database schema and migrations
- ✅ Wasabi S3 integration with retry logic
- ✅ Complete backend services
- ✅ RESTful API endpoints
- ✅ Frontend components (upload, gallery, carousel, listing)
- ✅ Comprehensive unit tests
- ✅ Integration tests
- ✅ E2E tests
- ✅ Error handling and validation
- ✅ Rate limiting
- ✅ Ownership verification
- ✅ Cascade delete on hotel deletion

The system is production-ready and follows best practices for security, performance, and maintainability.
