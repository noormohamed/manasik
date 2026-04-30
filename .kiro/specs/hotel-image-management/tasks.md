# Implementation Plan: Hotel Image Management System

## Overview

This implementation plan breaks down the hotel image management feature into discrete, manageable coding tasks. The feature enables hotel owners to upload, manage, and display images using Wasabi S3 storage with CDN delivery. Images are stored with deterministic MD5-based filenames, enabling clean URLs and efficient retrieval.

The implementation follows a logical progression: database setup → backend services (Wasabi S3 integration, image service) → API endpoints (upload, delete, fetch) → frontend components (upload, display, management) → comprehensive testing.

## Tasks

- [x] 1. Database Setup and Migrations
  - [ ] 1.1 Create hotel_images table migration
    - Create migration file for hotel_images table with all required columns (id, hotel_id, image_key, cdn_url, file_name, file_size, mime_type, uploaded_by, created_at, updated_at, is_primary)
    - Add indexes for hotel_id, uploaded_by, created_at, and is_primary
    - Add foreign key constraints to hotels and users tables
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 1.2 Add hotel_id_md5 column to hotels table
    - Create migration to add hotel_id_md5 column to hotels table
    - Add unique index on hotel_id_md5
    - Add comment explaining the MD5 hash purpose
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ] 1.3 Create image_upload_audit table migration
    - Create migration file for image_upload_audit table to track upload attempts and errors
    - Include columns for user_id, hotel_id, status, error_message, created_at
    - Add indexes for user_id, hotel_id, and created_at
    - _Requirements: 13.4, 14.3, 18.1, 18.2_

- [ ] 2. Backend Service Implementation - Wasabi S3 Service
  - [ ] 2.1 Create WasabiS3Service with core S3 operations
    - Create service file at service/src/services/wasabi-s3.service.ts
    - Implement uploadImage() method with file validation and S3 upload
    - Implement deleteImage() method with S3 deletion
    - Implement generateCdnUrl() method to create Wasabi CDN URLs
    - Implement validateImageFile() method for MIME type and size validation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [ ] 2.2 Implement filename generation with MD5 hashing
    - Implement generateImageFilename() method using MD5(hotel_id_md5 + image_number).jpg
    - Implement generateS3Key() method to create S3 path: mk-images/hotel_id_md5/filename.jpg
    - Ensure deterministic filename generation (same inputs = same output)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ] 2.3 Implement retry logic with exponential backoff
    - Implement retryWithBackoff() private method for S3 operations
    - Configure retry count (3 attempts) and backoff multiplier (2x)
    - Log retry attempts for debugging
    - _Requirements: 2.7, 2.8, 13.1, 13.2, 14.1, 14.2_

  - [ ] 2.4 Implement error handling and logging
    - Implement comprehensive error handling for S3 operations
    - Log all errors with context (user_id, hotel_id, operation type)
    - Return descriptive error messages to caller
    - _Requirements: 13.3, 13.4, 13.5, 14.3, 14.4_

  - [ ]* 2.5 Write property tests for WasabiS3Service
    - **Property 1: Deterministic Filename Generation**
    - **Property 2: Valid CDN URL Format**
    - **Property 3: File Validation - MIME Type**
    - **Property 4: File Validation - Size Limits**
    - **Validates: Requirements 8.1, 8.2, 11.2, 12.2_

  - [ ]* 2.6 Write unit tests for WasabiS3Service
    - Test uploadImage() with valid and invalid files
    - Test deleteImage() with valid and invalid keys
    - Test generateCdnUrl() with various S3 keys
    - Test validateImageFile() with different MIME types and sizes
    - Test retry logic with simulated failures
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

- [ ] 3. Backend Service Implementation - Hotel Images Service
  - [ ] 3.1 Create HotelImagesService with business logic
    - Create service file at service/src/services/hotel-images.service.ts
    - Implement uploadHotelImage() method with ownership verification
    - Implement deleteHotelImage() method with ownership verification
    - Implement getHotelImages() method for single hotel
    - Implement getMultipleHotelsImages() method for batch fetching
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ] 3.2 Implement ownership verification
    - Implement verifyOwnership() method to check if user owns hotel
    - Implement getHotelOwner() method to retrieve hotel owner
    - Return 403 Forbidden if ownership verification fails
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 3.3 Implement MD5 hash management
    - Implement getHotelIdMd5() method to retrieve or generate MD5 hash
    - Implement generateAndStoreHotelIdMd5() method to create and save hash
    - Ensure hash is generated on first image upload if not already present
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ] 3.4 Implement image number tracking
    - Implement getNextImageNumber() method to get sequential image number
    - Implement incrementImageCounter() method to track image count per hotel
    - Ensure image numbers are sequential and unique per hotel
    - _Requirements: 2.3, 2.4, 2.5_

  - [ ] 3.5 Implement primary image management
    - Implement setPrimaryImage() method to set hero image
    - Implement getPrimaryImage() method to retrieve primary image
    - Ensure only one primary image per hotel
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 3.6 Implement image reordering
    - Implement reorderImages() method to update image display order
    - Implement getImageOrder() method to retrieve current order
    - Store order in database for persistence
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

  - [ ] 3.7 Implement rate limiting
    - Implement checkRateLimit() method to enforce upload limits
    - Configure rate limit: 10 uploads per hour per user
    - Return 429 Too Many Requests if limit exceeded
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

  - [ ]* 3.8 Write property tests for HotelImagesService
    - **Property 5: Ownership Verification**
    - **Property 6: MD5 Hash Generation and Storage**
    - **Property 7: Image Number Sequencing**
    - **Property 8: Primary Image Uniqueness**
    - **Property 9: Rate Limit Enforcement**
    - **Validates: Requirements 4.1, 9.1, 10.4, 15.2_

  - [ ]* 3.9 Write unit tests for HotelImagesService
    - Test uploadHotelImage() with ownership verification
    - Test deleteHotelImage() with ownership verification
    - Test getHotelImages() and getMultipleHotelsImages()
    - Test MD5 hash generation and retrieval
    - Test image number sequencing
    - Test primary image management
    - Test rate limiting
    - _Requirements: 1.1, 3.1, 4.1, 9.1, 10.1, 15.1, 19.1_

- [ ] 4. API Endpoint Implementation - Image Upload
  - [ ] 4.1 Implement POST /api/hotel/:hotelId/images endpoint
    - Create route handler with authentication middleware
    - Implement multipart/form-data file handling
    - Call HotelImagesService.uploadHotelImage()
    - Return image metadata with CDN URL on success
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ] 4.2 Implement file validation in endpoint
    - Validate MIME type (JPEG, PNG, WebP only)
    - Validate file size (maximum 10MB)
    - Return 400 Bad Request with specific error message if validation fails
    - _Requirements: 11.4, 11.5, 12.4, 12.5_

  - [ ] 4.3 Implement error handling and response formatting
    - Handle ownership verification errors (403 Forbidden)
    - Handle file validation errors (400 Bad Request)
    - Handle S3 upload errors with retry logic
    - Handle rate limit errors (429 Too Many Requests)
    - Return appropriate HTTP status codes and error messages
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [ ] 4.4 Implement upload progress tracking
    - Track upload progress for multipart uploads
    - Return progress information to frontend
    - Log upload attempts to image_upload_audit table
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 20.1, 20.2_

  - [ ]* 4.5 Write integration tests for upload endpoint
    - Test successful image upload
    - Test file validation (MIME type, size)
    - Test ownership verification
    - Test error handling
    - Test rate limiting
    - _Requirements: 1.1, 11.1, 12.1, 4.1, 15.1_

- [ ] 5. API Endpoint Implementation - Image Deletion
  - [ ] 5.1 Implement DELETE /api/hotel/:hotelId/images/:imageId endpoint
    - Create route handler with authentication middleware
    - Verify image exists and belongs to hotel
    - Call HotelImagesService.deleteHotelImage()
    - Return success response on deletion
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ] 5.2 Implement error handling for deletion
    - Handle ownership verification errors (403 Forbidden)
    - Handle image not found errors (404 Not Found)
    - Handle S3 deletion errors with retry logic
    - Return appropriate HTTP status codes and error messages
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 5.3 Write integration tests for delete endpoint
    - Test successful image deletion
    - Test ownership verification
    - Test image not found error
    - Test S3 deletion failure handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 6. API Endpoint Implementation - Fetch Single Hotel Images
  - [ ] 6.1 Implement GET /api/hotel/:hotelIdMd5/images endpoint
    - Create route handler without authentication (public read)
    - Accept query parameters: limit (default 10), offset (default 0)
    - Call HotelImagesService.getHotelImages()
    - Return images with CDN URLs and metadata
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ] 6.2 Implement pagination support
    - Support limit and offset query parameters
    - Return pagination metadata (total count, limit, offset)
    - Validate pagination parameters (positive integers)
    - _Requirements: 6.5_

  - [ ] 6.3 Implement error handling
    - Handle invalid hotel ID format
    - Handle hotel not found (return empty array)
    - Return appropriate HTTP status codes
    - _Requirements: 6.6, 6.7_

  - [ ]* 6.4 Write integration tests for single hotel fetch
    - Test successful image fetch
    - Test pagination
    - Test empty result handling
    - Test invalid hotel ID handling
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. API Endpoint Implementation - Fetch Multiple Hotels Images
  - [ ] 7.1 Implement GET /api/hotel/images endpoint
    - Create route handler without authentication (public read)
    - Accept query parameters: hotelIds (comma-separated MD5 hashes), limit, offset
    - Call HotelImagesService.getMultipleHotelsImages()
    - Return images organized by hotel MD5 hash
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

  - [ ] 7.2 Implement batch fetching optimization
    - Fetch images for multiple hotels in single database query
    - Organize results by hotel MD5 hash
    - Return primary image first for each hotel
    - _Requirements: 7.4, 7.5, 7.6_

  - [ ] 7.3 Implement pagination support
    - Support limit and offset query parameters
    - Apply pagination per hotel (not globally)
    - Return pagination metadata for each hotel
    - _Requirements: 7.5_

  - [ ] 7.4 Implement error handling
    - Handle invalid hotel ID format
    - Handle missing hotelIds parameter
    - Return appropriate HTTP status codes
    - _Requirements: 7.7, 7.8_

  - [ ]* 7.5 Write integration tests for multiple hotels fetch
    - Test successful fetch for multiple hotels
    - Test pagination per hotel
    - Test empty result handling
    - Test invalid hotel ID handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. API Endpoint Implementation - Set Primary Image
  - [ ] 8.1 Implement PUT /api/hotel/:hotelId/images/:imageId/primary endpoint
    - Create route handler with authentication middleware
    - Verify image exists and belongs to hotel
    - Call HotelImagesService.setPrimaryImage()
    - Return updated image metadata
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

  - [ ] 8.2 Implement error handling
    - Handle ownership verification errors (403 Forbidden)
    - Handle image not found errors (404 Not Found)
    - Return appropriate HTTP status codes
    - _Requirements: 10.3, 10.4_

  - [ ]* 8.3 Write integration tests for set primary image
    - Test successful primary image setting
    - Test ownership verification
    - Test image not found error
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 9. API Endpoint Implementation - Reorder Images
  - [ ] 9.1 Implement PUT /api/hotel/:hotelId/images/reorder endpoint
    - Create route handler with authentication middleware
    - Accept request body with image IDs in new order
    - Call HotelImagesService.reorderImages()
    - Return updated image list in new order
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

  - [ ] 9.2 Implement error handling
    - Handle ownership verification errors (403 Forbidden)
    - Handle invalid image ID errors (404 Not Found)
    - Validate all image IDs belong to the hotel
    - _Requirements: 19.3, 19.4_

  - [ ]* 9.3 Write integration tests for reorder images
    - Test successful image reordering
    - Test ownership verification
    - Test invalid image ID handling
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [ ] 10. API Endpoint Enhancement - Cascade Delete on Hotel Deletion
  - [ ] 10.1 Enhance DELETE /api/hotel/:hotelId endpoint
    - Add logic to identify all images for the hotel
    - Call WasabiS3Service.deleteImage() for each image
    - Delete image metadata from database
    - Handle S3 deletion failures gracefully
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 10.2 Implement error handling and logging
    - Log cascade delete operations
    - Continue deletion even if individual S3 deletions fail
    - Return appropriate error status if cascade delete fails
    - _Requirements: 17.4, 17.5_

  - [ ]* 10.3 Write integration tests for cascade delete
    - Test successful cascade delete
    - Test S3 deletion failure handling
    - Verify all images deleted from database
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

- [ ] 11. Frontend Component Implementation - Image Upload Component
  - [ ] 11.1 Create ImageUploadComponent
    - Create component file at frontend/src/components/HotelManagement/ImageUploadComponent.tsx
    - Implement file input with drag-and-drop support
    - Implement file preview before upload
    - Implement upload button and cancel button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 11.2 Implement frontend file validation
    - Validate MIME type (JPEG, PNG, WebP only)
    - Validate file size (maximum 10MB)
    - Display validation error messages
    - _Requirements: 11.1, 11.2, 11.3, 12.1, 12.2, 12.3_

  - [ ] 11.3 Implement upload progress tracking
    - Display progress bar during upload
    - Show percentage uploaded
    - Allow cancel during upload
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6_

  - [ ] 11.4 Implement error handling and retry
    - Display error messages for upload failures
    - Provide retry button on failure
    - Display success message on successful upload
    - _Requirements: 1.9, 1.10, 13.5, 13.6_

  - [ ]* 11.5 Write unit tests for ImageUploadComponent
    - Test file input and drag-and-drop
    - Test file validation
    - Test upload submission
    - Test error handling
    - Test progress tracking
    - _Requirements: 1.1, 11.1, 12.1, 20.1_

- [ ] 12. Frontend Component Implementation - Image Gallery Component
  - [ ] 12.1 Create ImageGalleryComponent
    - Create component file at frontend/src/components/HotelManagement/ImageGalleryComponent.tsx
    - Display images in grid layout
    - Show image metadata (upload date, size)
    - Implement delete button for each image
    - _Requirements: 5.1, 5.2, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7_

  - [ ] 12.2 Implement image reordering
    - Implement drag-and-drop to reorder images
    - Display reorder UI (drag handles)
    - Call API to save new order
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

  - [ ] 12.3 Implement primary image selection
    - Display "Set as Primary" button for each image
    - Show visual indicator for primary image
    - Call API to set primary image
    - _Requirements: 10.1, 10.2, 10.6, 10.7_

  - [ ] 12.4 Implement delete confirmation
    - Display confirmation dialog before deletion
    - Call API to delete image
    - Remove image from gallery on success
    - Display error message on failure
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 12.5 Write unit tests for ImageGalleryComponent
    - Test image display
    - Test delete functionality
    - Test reordering
    - Test primary image selection
    - _Requirements: 5.1, 12.1, 19.1, 10.1_

- [ ] 13. Frontend Component Implementation - Hotel Details Image Display
  - [ ] 13.1 Enhance hotel details page to display images
    - Fetch images using GET /api/hotel/:hotelIdMd5/images
    - Display primary image prominently
    - Display image gallery below
    - Implement lazy loading for performance
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ] 13.2 Implement image carousel/slider
    - Display images in carousel format
    - Implement next/previous navigation
    - Implement thumbnail strip
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 13.3 Implement fallback for missing images
    - Display placeholder image if no images available
    - Display error message if image fails to load
    - _Requirements: 6.6, 6.7_

  - [ ]* 13.4 Write unit tests for hotel details image display
    - Test image fetching
    - Test image display
    - Test carousel functionality
    - Test fallback handling
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 14. Frontend Component Implementation - Hotel Listing Image Display
  - [ ] 14.1 Enhance hotel listing page to display images
    - Fetch images using GET /api/hotel/images?hotelIds=...
    - Display primary image for each hotel
    - Implement lazy loading for performance
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

  - [ ] 14.2 Implement image fallback
    - Display placeholder image if no images available
    - Display error message if image fails to load
    - _Requirements: 7.7, 7.8_

  - [ ]* 14.3 Write unit tests for hotel listing image display
    - Test batch image fetching
    - Test image display
    - Test fallback handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 15. Checkpoint - Core Feature Complete
  - Ensure all database migrations run successfully
  - Ensure all backend services are implemented and tested
  - Ensure all API endpoints are implemented and tested
  - Ensure all frontend components are implemented and tested
  - Verify image upload and display workflow end-to-end
  - Ask the user if questions arise

- [ ] 16. Integration Testing - Complete Workflows
  - [ ] 16.1 Write integration test for complete upload workflow
    - Test hotel owner uploads image
    - Verify image stored in S3
    - Verify image metadata stored in database
    - Verify CDN URL generated correctly
    - Verify image appears in gallery
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ] 16.2 Write integration test for complete deletion workflow
    - Test hotel owner deletes image
    - Verify image deleted from S3
    - Verify image metadata deleted from database
    - Verify image removed from gallery
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ] 16.3 Write integration test for image fetching workflows
    - Test single hotel image fetch
    - Test multiple hotels image fetch
    - Verify pagination works correctly
    - Verify primary image returned first
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 16.4 Write integration test for primary image management
    - Test setting primary image
    - Verify previous primary image unset
    - Verify primary image returned first in fetch
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 16.5 Write integration test for image reordering
    - Test reordering images
    - Verify new order persisted
    - Verify new images added to end
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

  - [ ] 16.6 Write integration test for cascade delete
    - Test hotel deletion cascades to images
    - Verify all images deleted from S3
    - Verify all image metadata deleted from database
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_

  - [ ] 16.7 Write integration test for error handling
    - Test S3 upload failure with retry
    - Test S3 deletion failure with retry
    - Test ownership verification failure
    - Test rate limiting
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 17. E2E Testing - Complete User Flows
  - [ ] 17.1 Write E2E test for hotel owner upload workflow
    - Test hotel owner logs in
    - Test hotel owner navigates to hotel management
    - Test hotel owner uploads image
    - Verify image appears in gallery
    - Verify image appears on hotel details page
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10_

  - [ ] 17.2 Write E2E test for hotel owner delete workflow
    - Test hotel owner deletes image
    - Verify delete confirmation dialog
    - Verify image removed from gallery
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ] 17.3 Write E2E test for guest viewing images
    - Test guest views hotel listing
    - Verify primary image displayed
    - Test guest clicks on hotel
    - Verify all images displayed on hotel details
    - Verify image carousel works
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 17.4 Write E2E test for image management workflows
    - Test hotel owner sets primary image
    - Test hotel owner reorders images
    - Verify changes reflected on hotel details page
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [ ] 18. Final Checkpoint - All Tests Pass
  - Ensure all unit tests pass
  - Ensure all integration tests pass
  - Ensure all E2E tests pass
  - Verify no console errors or warnings
  - Verify image upload/display works end-to-end
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate workflows across multiple components
- E2E tests validate complete user flows through the UI
- All code should follow existing project patterns and conventions
- Database migrations should be versioned and reversible
- Frontend components should be fully typed with TypeScript
- All API endpoints should have proper error handling and logging
- Wasabi S3 credentials should be stored in environment variables
- CDN URLs should be generated consistently and cached in database
- Image metadata should be tracked for audit purposes
- Rate limiting should be enforced per user per hour
- All file operations should include proper error handling and retry logic

