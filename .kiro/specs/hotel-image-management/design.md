# Hotel Image Management System - High-Level Design

## Feature Overview
A comprehensive image management system for hotels that enables property owners to upload, manage, and display images via Wasabi S3 storage with CDN delivery.

## System Architecture

### 1. Storage Layer (Wasabi S3)
- **Provider**: Wasabi (S3-compatible object storage)
- **Bucket**: `mk-images`
- **Region**: `eu-west-1`
- **CDN**: Wasabi CDN URLs for image delivery
- **Access**: Credentials stored in environment variables

### 2. Database Schema
```
hotels (existing)
├── id (PK)
├── name
├── hotel_id_md5 (MD5 hash of id - for shortened references)
├── ... (existing fields)

hotel_images (new)
├── id (PK)
├── hotel_id (FK → hotels.id)
├── image_key (S3 object key)
├── cdn_url (Wasabi CDN URL)
├── file_name (original filename)
├── file_size (bytes)
├── mime_type (image/jpeg, etc.)
├── uploaded_by (user_id - owner verification)
├── created_at
├── updated_at
├── is_primary (boolean - for hero image)
```

**Relationship**: Hotel → Many Images (1:N)

**MD5 Hash Strategy**:
- Store MD5 hash of hotel ID in `hotels.hotel_id_md5` column
- Image filename: `md5(hotel_id_md5 + image_number).jpg`
- Example: If hotel_id_md5 = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" and image_number = 1
  - Filename: `md5("a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p61").jpg` = `7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c.jpg`
- S3 path: `mk-images/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/7f8e9d0c1b2a3f4e5d6c7b8a9f0e1d2c.jpg`
- Enables URL shortening, cleaner CDN URLs, and deterministic filenames

### 3. Backend Services

#### 3.1 Wasabi S3 Service (`wasabi.service.ts`)
Handles all S3 operations:
- **Upload**: Multipart upload with progress tracking
- **Delete**: Remove objects from S3
- **Generate CDN URLs**: Convert S3 keys to Wasabi CDN URLs
- **Error handling**: Retry logic, validation

Key methods:
- `uploadImage(file, hotelIdMd5, userId): Promise<{key, cdnUrl}>`
- `deleteImage(imageKey): Promise<void>`
- `generateCdnUrl(imageKey): string`
- `validateImageFile(file): boolean`
- `generateImageFilename(hotelIdMd5, imageNumber): string` - Returns `md5(hotelIdMd5 + imageNumber).jpg`
- `generateS3Key(hotelIdMd5, imageFilename): string` - Creates path like `hotelIdMd5/imageFilename`

#### 3.2 Hotel Images Service (`hotel-images.service.ts`)
Business logic layer:
- **Create**: Save image metadata to DB after S3 upload
- **Read**: Fetch images for hotel(s)
- **Delete**: Remove from S3 and DB
- **Ownership verification**: Ensure user owns the hotel

Key methods:
- `uploadHotelImage(file, hotelId, userId): Promise<HotelImage>`
- `deleteHotelImage(imageId, userId): Promise<void>`
- `getHotelImages(hotelId): Promise<HotelImage[]>`
- `getMultipleHotelsImages(hotelIds): Promise<Map<hotelId, HotelImage[]>>`
- `verifyOwnership(hotelId, userId): Promise<boolean>`
- `getHotelIdMd5(hotelId): Promise<string>` - Retrieves or generates MD5 hash
- `getNextImageNumber(hotelId): Promise<number>` - Gets the next sequential image number for filename generation

### 4. API Endpoints

#### 4.1 Image Upload
```
POST /api/hotel/:hotelId/images
Headers: Authorization, Content-Type: multipart/form-data
Body: { file: File }
Response: { id, hotelId, cdnUrl, fileName, createdAt }
Auth: Required (owner of hotel)
```

#### 4.2 Image Deletion
```
DELETE /api/hotel/:hotelId/images/:imageId
Headers: Authorization
Response: { success: true }
Auth: Required (owner of hotel)
```

#### 4.3 Fetch Images (Single or Multiple Hotels)
```
GET /api/hotel/images?hotelIds=md5_1,md5_2,md5_3
Query Params:
  - hotelIds: comma-separated MD5 hotel IDs (required)
  - limit: max images per hotel (optional, default: 10)
  - offset: pagination offset (optional, default: 0)

Response: 
{
  "data": {
    "md5_1": [{ id, cdnUrl, fileName, ... }],
    "md5_2": [{ id, cdnUrl, fileName, ... }]
  }
}
Auth: Not required (public read)
```

Alternative single hotel endpoint:
```
GET /api/hotel/:hotelIdMd5/images
Response: [{ id, cdnUrl, fileName, ... }]
Auth: Not required (public read)
```

### 5. Frontend Integration Points

#### 5.1 Upload Component
- File input with validation (image types, size limits)
- Progress indicator during upload
- Error handling and retry
- Success confirmation

#### 5.2 Image Display
- Update `/stay` detail pages to fetch and display images
- Update hotel listing cards to show primary image
- Lazy loading for performance
- Fallback for missing images

#### 5.3 Management Dashboard
- Image gallery for property owners
- Upload/delete functionality
- Set primary image
- Reorder images (optional enhancement)

### 6. Security Considerations

#### 6.1 Upload Authorization
- Verify user owns the hotel before allowing upload
- Validate file type and size on backend
- Sanitize filenames
- Rate limiting on upload endpoint

#### 6.2 S3 Access
- Credentials stored in environment variables (never in code)
- Use IAM policies to restrict bucket access
- Consider presigned URLs for direct browser uploads (future optimization)

#### 6.3 Data Validation
- File size limits (e.g., 10MB per image)
- Allowed MIME types (image/jpeg, image/png, image/webp)
- Virus scanning (optional, future enhancement)

### 7. Error Handling

**Upload Failures**:
- S3 connection errors → Retry with exponential backoff
- File validation errors → Return 400 with specific error
- Ownership verification failures → Return 403 Forbidden

**Deletion Failures**:
- S3 deletion errors → Log and retry
- DB record not found → Return 404
- Ownership verification failures → Return 403

### 8. Performance Optimizations

- **CDN URLs**: Wasabi CDN for fast image delivery
- **Lazy loading**: Load images on demand in frontend
- **Batch fetching**: Support multiple hotel IDs in single request
- **Caching**: Cache image metadata in DB, invalidate on upload/delete
- **Image optimization**: Consider resizing/compression (future)

### 9. Data Flow

**Upload Flow**:
1. User selects image in frontend
2. Frontend validates file (type, size)
3. POST to `/api/hotel/:hotelId/images`
4. Backend verifies ownership
5. Backend retrieves hotel_id_md5
6. Backend gets next image_number for this hotel
7. Backend generates filename: `md5(hotel_id_md5 + image_number).jpg`
8. Backend uploads to Wasabi S3 at path: `hotel_id_md5/filename.jpg`
9. Backend saves metadata to DB with CDN URL and image_number
10. Return CDN URL to frontend
11. Frontend displays image

**Display Flow**:
1. Frontend requests images via GET `/api/hotel/images?hotelIds=...`
2. Backend fetches image records from DB
3. Backend returns CDN URLs
4. Frontend renders images using CDN URLs

**Delete Flow**:
1. User clicks delete on image
2. Frontend sends DELETE to `/api/hotel/:hotelId/images/:imageId`
3. Backend verifies ownership
4. Backend deletes from S3
5. Backend deletes DB record
6. Frontend removes image from UI

## Implementation Phases

### Phase 1: Core Infrastructure
- Wasabi S3 service setup
- Database schema and migrations
- Hotel images service
- Upload and delete endpoints

### Phase 2: Frontend Integration
- Upload component
- Image display in hotel details
- Image management dashboard

### Phase 3: Enhancements
- Image reordering
- Primary image selection
- Image optimization/resizing
- Batch operations

## Correctness Properties

1. **Ownership Verification**: Only hotel owners can upload/delete images for their hotels
2. **Data Consistency**: Image records in DB match objects in S3
3. **CDN URL Validity**: All returned CDN URLs are accessible and valid
4. **File Integrity**: Uploaded files match original files (checksum validation)
5. **Orphan Prevention**: Deleting a hotel cascades to delete its images from S3 and DB
