# Hotel Image Management System - Requirements

## Introduction

This feature enables hotel property owners to upload, manage, and display images for their hotels using Wasabi S3 storage with CDN delivery. The system provides a secure, scalable solution for storing hotel images with deterministic naming based on MD5 hashing, enabling clean CDN URLs and efficient image retrieval. Images are stored in Wasabi S3 with public read access for display, while write operations (upload/delete) are restricted to hotel owners.

## Glossary

- **Hotel_Owner**: A user who owns or manages a hotel and has permission to upload/delete images
- **Hotel_Image**: A digital image file stored in Wasabi S3 with metadata tracked in the database
- **Wasabi_S3**: Wasabi object storage service (S3-compatible) used for image storage and CDN delivery
- **CDN_URL**: Content Delivery Network URL provided by Wasabi for fast image delivery
- **MD5_Hash**: Cryptographic hash used for generating deterministic filenames and shortened hotel references
- **Image_Metadata**: Database record containing image information (URL, filename, size, MIME type, etc.)
- **Ownership_Verification**: Process of confirming the user owns the hotel before allowing write operations
- **Image_Number**: Sequential number assigned to each image for a hotel, used in filename generation

## Requirements

### Requirement 1: Upload Hotel Image

**User Story:** As a hotel owner, I want to upload images for my hotel, so that potential guests can see what the property looks like.

#### Acceptance Criteria

1. WHEN a hotel owner navigates to the hotel management page, THE system SHALL display an upload button or area for adding images
2. WHEN the hotel owner clicks the upload button, THE system SHALL open a file picker allowing selection of image files
3. WHEN the hotel owner selects an image file, THE system SHALL validate the file type (JPEG, PNG, WebP only)
4. IF the file type is invalid, THE system SHALL display an error message indicating only image files are allowed
5. WHEN the hotel owner selects a valid image file, THE system SHALL validate the file size (maximum 10MB)
6. IF the file size exceeds the limit, THE system SHALL display an error message indicating the maximum file size
7. WHEN a valid image file is selected, THE system SHALL display a preview of the image before upload
8. WHEN the hotel owner confirms the upload, THE system SHALL send the image to the backend for processing
9. WHEN the image is successfully uploaded, THE system SHALL display a success message and add the image to the hotel's image gallery
10. WHEN the image upload fails, THE system SHALL display an error message with details about the failure

### Requirement 2: Store Image in Wasabi S3

**User Story:** As a system, I want to store hotel images in Wasabi S3, so that images are reliably stored and delivered via CDN.

#### Acceptance Criteria

1. WHEN an image upload request is received, THE system SHALL retrieve the hotel's MD5 hash (hotel_id_md5)
2. IF the hotel does not have an MD5 hash, THE system SHALL generate and store the MD5 hash of the hotel ID
3. WHEN the MD5 hash is available, THE system SHALL determine the next sequential image number for the hotel
4. WHEN the image number is determined, THE system SHALL generate the image filename using MD5(hotel_id_md5 + image_number).jpg
5. WHEN the filename is generated, THE system SHALL construct the S3 path as mk-images/hotel_id_md5/filename.jpg
6. WHEN the S3 path is constructed, THE system SHALL upload the image file to Wasabi S3 at that path
7. IF the S3 upload fails, THE system SHALL retry the upload with exponential backoff (up to 3 attempts)
8. IF all upload attempts fail, THE system SHALL return an error to the user and not create a database record
9. WHEN the image is successfully uploaded to S3, THE system SHALL generate the CDN URL for the image
10. WHEN the CDN URL is generated, THE system SHALL save the image metadata to the database

### Requirement 3: Store Image Metadata in Database

**User Story:** As a system, I want to store image metadata in the database, so that I can track and manage hotel images.

#### Acceptance Criteria

1. WHEN an image is successfully uploaded to S3, THE system SHALL create a record in the hotel_images table
2. THE hotel_images record SHALL include the hotel ID, image key (S3 path), CDN URL, filename, file size, MIME type, and upload timestamp
3. THE hotel_images record SHALL include the user ID of the person who uploaded the image (for ownership verification)
4. THE hotel_images record SHALL include an is_primary flag (default: false) to indicate if it's the hero image
5. WHEN the image metadata is saved, THE system SHALL return the image ID and CDN URL to the frontend
6. WHEN the image metadata is saved, THE system SHALL make the image immediately available for display

### Requirement 4: Verify Ownership Before Upload

**User Story:** As a system, I want to verify that only hotel owners can upload images, so that unauthorized users cannot modify hotel images.

#### Acceptance Criteria

1. WHEN an image upload request is received, THE system SHALL verify the user is authenticated
2. IF the user is not authenticated, THE system SHALL return a 401 Unauthorized error
3. WHEN the user is authenticated, THE system SHALL verify the user owns the specified hotel
4. IF the user does not own the hotel, THE system SHALL return a 403 Forbidden error
5. WHEN ownership is verified, THE system SHALL proceed with the upload process
6. WHEN ownership verification fails, THE system SHALL log the failed attempt for audit purposes

### Requirement 5: Delete Hotel Image

**User Story:** As a hotel owner, I want to delete images from my hotel, so that I can remove outdated or unwanted photos.

#### Acceptance Criteria

1. WHEN a hotel owner views the hotel's image gallery, THE system SHALL display a delete button or option for each image
2. WHEN the hotel owner clicks the delete button, THE system SHALL display a confirmation dialog
3. WHEN the hotel owner confirms the deletion, THE system SHALL verify ownership of the hotel
4. IF ownership verification fails, THE system SHALL return a 403 Forbidden error
5. WHEN ownership is verified, THE system SHALL delete the image from Wasabi S3
6. IF the S3 deletion fails, THE system SHALL retry the deletion with exponential backoff (up to 3 attempts)
7. WHEN the image is successfully deleted from S3, THE system SHALL delete the image metadata from the database
8. WHEN the image is deleted, THE system SHALL remove it from the hotel's image gallery
9. WHEN the image deletion fails, THE system SHALL display an error message to the user

### Requirement 6: Fetch Images for Single Hotel

**User Story:** As a frontend application, I want to fetch images for a single hotel, so that I can display them on the hotel details page.

#### Acceptance Criteria

1. WHEN the hotel details page loads, THE system SHALL fetch images for the hotel using the hotel's MD5 hash
2. THE fetch request SHALL use the endpoint GET /api/hotel/:hotelIdMd5/images
3. WHEN the request is received, THE system SHALL retrieve all images for the hotel from the database
4. THE system SHALL return the images as a JSON array with CDN URLs and metadata
5. WHEN images are returned, THE system SHALL include pagination information (limit, offset, total count)
6. WHEN no images exist for the hotel, THE system SHALL return an empty array
7. THE fetch request SHALL NOT require authentication (public read access)
8. WHEN the images are received, THE frontend SHALL display them on the hotel details page

### Requirement 7: Fetch Images for Multiple Hotels

**User Story:** As a frontend application, I want to fetch images for multiple hotels in a single request, so that I can efficiently display images on listing pages.

#### Acceptance Criteria

1. WHEN the hotel listing page loads, THE system SHALL fetch images for multiple hotels in a single request
2. THE fetch request SHALL use the endpoint GET /api/hotel/images?hotelIds=md5_1,md5_2,md5_3
3. WHEN the request is received, THE system SHALL retrieve images for all specified hotels from the database
4. THE system SHALL return images organized by hotel MD5 hash in a JSON object
5. THE system SHALL support pagination parameters (limit, offset) to control the number of images per hotel
6. WHEN images are returned, THE system SHALL include the primary image first (if set)
7. WHEN no images exist for a hotel, THE system SHALL return an empty array for that hotel
8. THE fetch request SHALL NOT require authentication (public read access)
9. WHEN the images are received, THE frontend SHALL display them on the listing page

### Requirement 8: Generate Deterministic Image Filenames

**User Story:** As a system, I want to generate deterministic image filenames using MD5 hashing, so that URLs are clean and predictable.

#### Acceptance Criteria

1. WHEN an image is uploaded, THE system SHALL generate the filename using MD5(hotel_id_md5 + image_number).jpg
2. THE filename generation SHALL be deterministic (same inputs always produce the same filename)
3. THE filename SHALL be exactly 32 hexadecimal characters followed by .jpg extension
4. WHEN the filename is generated, THE system SHALL use it to construct the S3 path
5. THE S3 path SHALL follow the format: mk-images/hotel_id_md5/filename.jpg
6. WHEN the S3 path is constructed, THE system SHALL generate the CDN URL from the S3 path
7. THE CDN URL SHALL be in the format: https://mk-images.wasabisys.com/mk-images/hotel_id_md5/filename.jpg

### Requirement 9: Store Hotel MD5 Hash

**User Story:** As a system, I want to store the MD5 hash of each hotel ID, so that I can generate clean URLs and shortened references.

#### Acceptance Criteria

1. WHEN a hotel is created, THE system SHALL generate and store the MD5 hash of the hotel ID in the hotel_id_md5 column
2. IF a hotel already exists without an MD5 hash, THE system SHALL generate and store the hash on first image upload
3. THE MD5 hash SHALL be stored in the hotels table in the hotel_id_md5 column
4. THE MD5 hash SHALL be exactly 32 hexadecimal characters
5. WHEN the MD5 hash is stored, THE system SHALL use it for all image operations for that hotel
6. THE MD5 hash SHALL never change for a given hotel (immutable)

### Requirement 10: Set Primary Image

**User Story:** As a hotel owner, I want to set one image as the primary/hero image, so that it displays prominently on listing pages.

#### Acceptance Criteria

1. WHEN a hotel owner views the image gallery, THE system SHALL display an option to set an image as primary
2. WHEN the hotel owner clicks the set primary button, THE system SHALL verify ownership of the hotel
3. IF ownership verification fails, THE system SHALL return a 403 Forbidden error
4. WHEN ownership is verified, THE system SHALL update the is_primary flag for the selected image to true
5. WHEN a new primary image is set, THE system SHALL set the is_primary flag to false for the previous primary image
6. WHEN the primary image is set, THE system SHALL return the updated image metadata
7. WHEN images are fetched, THE system SHALL return the primary image first in the list

### Requirement 11: Validate Image File Type

**User Story:** As a system, I want to validate image file types, so that only valid image formats are uploaded.

#### Acceptance Criteria

1. WHEN an image file is selected for upload, THE system SHALL validate the MIME type on the frontend
2. THE system SHALL accept only JPEG (image/jpeg), PNG (image/png), and WebP (image/webp) formats
3. IF the file type is invalid, THE system SHALL display an error message on the frontend
4. WHEN the file is uploaded to the backend, THE system SHALL validate the MIME type again
5. IF the backend validation fails, THE system SHALL reject the upload and return a 400 Bad Request error
6. WHEN the file type is valid, THE system SHALL proceed with the upload

### Requirement 12: Validate Image File Size

**User Story:** As a system, I want to validate image file sizes, so that uploads don't exceed storage limits.

#### Acceptance Criteria

1. WHEN an image file is selected for upload, THE system SHALL validate the file size on the frontend
2. THE maximum file size SHALL be 10MB (10,485,760 bytes)
3. IF the file size exceeds the limit, THE system SHALL display an error message on the frontend
4. WHEN the file is uploaded to the backend, THE system SHALL validate the file size again
5. IF the backend validation fails, THE system SHALL reject the upload and return a 413 Payload Too Large error
6. WHEN the file size is valid, THE system SHALL proceed with the upload

### Requirement 13: Handle Upload Errors Gracefully

**User Story:** As a system, I want to handle upload errors gracefully, so that users understand what went wrong.

#### Acceptance Criteria

1. IF an S3 upload fails, THE system SHALL retry the upload with exponential backoff (up to 3 attempts)
2. IF all retry attempts fail, THE system SHALL return a descriptive error message to the user
3. WHEN an upload error occurs, THE system SHALL NOT create a database record for the image
4. WHEN an upload error occurs, THE system SHALL log the error for debugging purposes
5. WHEN an upload error occurs, THE system SHALL display a user-friendly error message
6. WHEN an upload error occurs, THE system SHALL allow the user to retry the upload

### Requirement 14: Handle Deletion Errors Gracefully

**User Story:** As a system, I want to handle deletion errors gracefully, so that users understand what went wrong.

#### Acceptance Criteria

1. IF an S3 deletion fails, THE system SHALL retry the deletion with exponential backoff (up to 3 attempts)
2. IF all retry attempts fail, THE system SHALL return a descriptive error message to the user
3. WHEN a deletion error occurs, THE system SHALL NOT delete the database record
4. WHEN a deletion error occurs, THE system SHALL log the error for debugging purposes
5. WHEN a deletion error occurs, THE system SHALL display a user-friendly error message
6. WHEN a deletion error occurs, THE system SHALL allow the user to retry the deletion

### Requirement 15: Rate Limit Image Uploads

**User Story:** As a system, I want to rate limit image uploads, so that the system is not overwhelmed by excessive uploads.

#### Acceptance Criteria

1. WHEN an image upload request is received, THE system SHALL check the rate limit for the user
2. THE rate limit SHALL be 10 uploads per hour per user
3. IF the rate limit is exceeded, THE system SHALL return a 429 Too Many Requests error
4. WHEN the rate limit is exceeded, THE system SHALL include a Retry-After header in the response
5. WHEN the rate limit is not exceeded, THE system SHALL proceed with the upload

### Requirement 16: Generate CDN URLs

**User Story:** As a system, I want to generate valid CDN URLs for images, so that images can be delivered quickly.

#### Acceptance Criteria

1. WHEN an image is uploaded to S3, THE system SHALL generate a CDN URL for the image
2. THE CDN URL SHALL be in the format: https://mk-images.wasabisys.com/mk-images/hotel_id_md5/filename.jpg
3. THE CDN URL SHALL be valid and accessible immediately after upload
4. WHEN the CDN URL is generated, THE system SHALL store it in the database
5. WHEN images are fetched, THE system SHALL return the CDN URLs
6. WHEN a CDN URL is accessed, THE image SHALL be delivered from the Wasabi CDN

### Requirement 17: Cascade Delete Images on Hotel Deletion

**User Story:** As a system, I want to automatically delete images when a hotel is deleted, so that orphaned images don't accumulate.

#### Acceptance Criteria

1. WHEN a hotel is deleted, THE system SHALL identify all images associated with the hotel
2. WHEN images are identified, THE system SHALL delete them from Wasabi S3
3. WHEN images are deleted from S3, THE system SHALL delete the image metadata from the database
4. IF an S3 deletion fails during cascade delete, THE system SHALL log the error and continue with other deletions
5. WHEN all images are deleted, THE system SHALL complete the hotel deletion

### Requirement 18: Track Image Upload Metadata

**User Story:** As a system, I want to track image upload metadata, so that I can audit and manage images.

#### Acceptance Criteria

1. WHEN an image is uploaded, THE system SHALL record the upload timestamp
2. WHEN an image is uploaded, THE system SHALL record the user ID of the uploader
3. WHEN an image is uploaded, THE system SHALL record the file size in bytes
4. WHEN an image is uploaded, THE system SHALL record the MIME type
5. WHEN an image is uploaded, THE system SHALL record the original filename
6. WHEN images are fetched, THE system SHALL include the upload metadata in the response
7. WHEN images are listed, THE system SHALL allow filtering and sorting by upload date

### Requirement 19: Support Image Reordering

**User Story:** As a hotel owner, I want to reorder images in my gallery, so that I can control the display order.

#### Acceptance Criteria

1. WHEN a hotel owner views the image gallery, THE system SHALL display images in a specific order
2. WHEN the hotel owner drags an image to a new position, THE system SHALL update the image order
3. WHEN the image order is updated, THE system SHALL verify ownership of the hotel
4. IF ownership verification fails, THE system SHALL return a 403 Forbidden error
5. WHEN ownership is verified, THE system SHALL save the new image order to the database
6. WHEN images are fetched, THE system SHALL return them in the saved order
7. WHEN a new image is uploaded, THE system SHALL add it to the end of the gallery

### Requirement 20: Display Image Upload Progress

**User Story:** As a hotel owner, I want to see upload progress, so that I know the upload is proceeding.

#### Acceptance Criteria

1. WHEN an image is being uploaded, THE system SHALL display a progress indicator
2. THE progress indicator SHALL show the percentage of the file uploaded
3. WHEN the upload completes, THE system SHALL display a success message
4. WHEN the upload fails, THE system SHALL display an error message
5. WHEN the upload is in progress, THE system SHALL allow the user to cancel the upload
6. WHEN the upload is cancelled, THE system SHALL stop the upload and clean up any partial files

</content>
