/**
 * Hotel Images Service
 * Business logic for hotel image management
 */

import { getPool } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as wasabiService from './wasabi-s3.service';

export interface HotelImage {
  id: string;
  hotelId: string;
  imageKey: string;
  cdnUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  isPrimary: boolean;
  imageNumber: number;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadHotelImageInput {
  file: {
    buffer: Buffer;
    mimetype: string;
    size: number;
    originalname: string;
  };
  hotelId: string;
  userId: string;
}

/**
 * Verify that user owns the hotel
 */
export async function verifyOwnership(hotelId: string, userId: string): Promise<boolean> {
  const pool = getPool();

  const [rows] = await pool.query(
    'SELECT id FROM hotels WHERE id = ? AND agent_id = ?',
    [hotelId, userId]
  );

  return (rows as any[]).length > 0;
}

/**
 * Get or generate MD5 hash for hotel ID
 */
export async function getHotelIdMd5(hotelId: string): Promise<string> {
  const pool = getPool();

  // Check if MD5 hash already exists
  const [rows] = await pool.query(
    'SELECT hotel_id_md5 FROM hotels WHERE id = ?',
    [hotelId]
  );

  if ((rows as any[]).length === 0) {
    throw new Error('Hotel not found');
  }

  let hotelIdMd5 = (rows as any[])[0].hotel_id_md5;

  // If not exists, generate and store it
  if (!hotelIdMd5) {
    hotelIdMd5 = crypto.createHash('md5').update(hotelId).digest('hex');

    await pool.query(
      'UPDATE hotels SET hotel_id_md5 = ? WHERE id = ?',
      [hotelIdMd5, hotelId]
    );
  }

  return hotelIdMd5;
}

/**
 * Get next sequential image number for hotel
 */
export async function getNextImageNumber(hotelId: string): Promise<number> {
  const pool = getPool();

  const [rows] = await pool.query(
    'SELECT MAX(image_number) as max_number FROM hotel_images WHERE hotel_id = ?',
    [hotelId]
  );

  const maxNumber = (rows as any[])[0]?.max_number || 0;
  return maxNumber + 1;
}

/**
 * Upload hotel image
 */
export async function uploadHotelImage(input: UploadHotelImageInput): Promise<HotelImage> {
  const { file, hotelId, userId } = input;
  const pool = getPool();

  // Verify ownership
  const isOwner = await verifyOwnership(hotelId, userId);
  if (!isOwner) {
    throw new Error('Unauthorized: You do not own this hotel');
  }

  // Get or generate MD5 hash
  const hotelIdMd5 = await getHotelIdMd5(hotelId);

  // Get next image number
  const imageNumber = await getNextImageNumber(hotelId);

  // Upload to S3
  const uploadResult = await wasabiService.uploadImage(file, hotelIdMd5, imageNumber, userId);

  // Save metadata to database
  const imageId = uuidv4();
  const now = new Date();

  await pool.query(
    `INSERT INTO hotel_images 
     (id, hotel_id, image_key, cdn_url, file_name, file_size, mime_type, uploaded_by, image_number, display_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      imageId,
      hotelId,
      uploadResult.key,
      uploadResult.cdnUrl,
      file.originalname,
      uploadResult.fileSize,
      uploadResult.mimeType,
      userId,
      imageNumber,
      imageNumber, // display_order defaults to image_number
      now,
      now,
    ]
  );

  // Log to audit table
  await pool.query(
    `INSERT INTO image_upload_audit 
     (id, user_id, hotel_id, status, file_name, file_size, mime_type, s3_key, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      userId,
      hotelId,
      'SUCCESS',
      file.originalname,
      uploadResult.fileSize,
      uploadResult.mimeType,
      uploadResult.key,
      now,
    ]
  );

  return {
    id: imageId,
    hotelId,
    imageKey: uploadResult.key,
    cdnUrl: uploadResult.cdnUrl,
    fileName: file.originalname,
    fileSize: uploadResult.fileSize,
    mimeType: uploadResult.mimeType,
    uploadedBy: userId,
    isPrimary: false,
    imageNumber,
    displayOrder: imageNumber,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Delete hotel image
 */
export async function deleteHotelImage(imageId: string, userId: string): Promise<void> {
  const pool = getPool();

  // Get image details
  const [imageRows] = await pool.query(
    'SELECT * FROM hotel_images WHERE id = ?',
    [imageId]
  );

  if ((imageRows as any[]).length === 0) {
    throw new Error('Image not found');
  }

  const image = (imageRows as any[])[0];

  // Verify ownership
  const isOwner = await verifyOwnership(image.hotel_id, userId);
  if (!isOwner) {
    throw new Error('Unauthorized: You do not own this hotel');
  }

  // Delete from S3
  await wasabiService.deleteImage(image.image_key);

  // Delete from database
  await pool.query('DELETE FROM hotel_images WHERE id = ?', [imageId]);
}

/**
 * Get images for single hotel
 */
export async function getHotelImages(
  hotelId: string,
  limit: number = 10,
  offset: number = 0
): Promise<{ images: HotelImage[]; total: number }> {
  const pool = getPool();

  // Get total count
  const [countRows] = await pool.query(
    'SELECT COUNT(*) as total FROM hotel_images WHERE hotel_id = ?',
    [hotelId]
  );

  const total = (countRows as any[])[0].total;

  // Get images, primary first
  const [rows] = await pool.query(
    `SELECT * FROM hotel_images 
     WHERE hotel_id = ? 
     ORDER BY is_primary DESC, display_order ASC
     LIMIT ? OFFSET ?`,
    [hotelId, limit, offset]
  );

  const images = (rows as any[]).map(row => ({
    id: row.id,
    hotelId: row.hotel_id,
    imageKey: row.image_key,
    cdnUrl: row.cdn_url,
    fileName: row.file_name,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    uploadedBy: row.uploaded_by,
    isPrimary: row.is_primary === 1 || row.is_primary === true,
    imageNumber: row.image_number,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return { images, total };
}

/**
 * Get images for multiple hotels
 */
export async function getMultipleHotelsImages(
  hotelIds: string[],
  limit: number = 10,
  offset: number = 0
): Promise<Map<string, HotelImage[]>> {
  const pool = getPool();

  if (hotelIds.length === 0) {
    return new Map();
  }

  // Create placeholders for SQL IN clause
  const placeholders = hotelIds.map(() => '?').join(',');

  // Get images for all hotels, primary first
  const [rows] = await pool.query(
    `SELECT * FROM hotel_images 
     WHERE hotel_id IN (${placeholders})
     ORDER BY hotel_id, is_primary DESC, display_order ASC
     LIMIT ? OFFSET ?`,
    [...hotelIds, limit, offset]
  );

  // Group by hotel ID
  const result = new Map<string, HotelImage[]>();

  for (const hotelId of hotelIds) {
    result.set(hotelId, []);
  }

  for (const row of rows as any[]) {
    const image: HotelImage = {
      id: row.id,
      hotelId: row.hotel_id,
      imageKey: row.image_key,
      cdnUrl: row.cdn_url,
      fileName: row.file_name,
      fileSize: row.file_size,
      mimeType: row.mime_type,
      uploadedBy: row.uploaded_by,
      isPrimary: row.is_primary === 1 || row.is_primary === true,
      imageNumber: row.image_number,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    const images = result.get(row.hotel_id) || [];
    images.push(image);
    result.set(row.hotel_id, images);
  }

  return result;
}

/**
 * Set primary image for hotel
 */
export async function setPrimaryImage(imageId: string, userId: string): Promise<HotelImage> {
  const pool = getPool();

  // Get image details
  const [imageRows] = await pool.query(
    'SELECT * FROM hotel_images WHERE id = ?',
    [imageId]
  );

  if ((imageRows as any[]).length === 0) {
    throw new Error('Image not found');
  }

  const image = (imageRows as any[])[0];

  // Verify ownership
  const isOwner = await verifyOwnership(image.hotel_id, userId);
  if (!isOwner) {
    throw new Error('Unauthorized: You do not own this hotel');
  }

  // Unset previous primary image
  await pool.query(
    'UPDATE hotel_images SET is_primary = FALSE WHERE hotel_id = ? AND is_primary = TRUE',
    [image.hotel_id]
  );

  // Set new primary image
  const now = new Date();
  await pool.query(
    'UPDATE hotel_images SET is_primary = TRUE, updated_at = ? WHERE id = ?',
    [now, imageId]
  );

  // Return updated image
  const [updatedRows] = await pool.query(
    'SELECT * FROM hotel_images WHERE id = ?',
    [imageId]
  );

  const updatedImage = (updatedRows as any[])[0];

  return {
    id: updatedImage.id,
    hotelId: updatedImage.hotel_id,
    imageKey: updatedImage.image_key,
    cdnUrl: updatedImage.cdn_url,
    fileName: updatedImage.file_name,
    fileSize: updatedImage.file_size,
    mimeType: updatedImage.mime_type,
    uploadedBy: updatedImage.uploaded_by,
    isPrimary: updatedImage.is_primary === 1 || updatedImage.is_primary === true,
    imageNumber: updatedImage.image_number,
    displayOrder: updatedImage.display_order,
    createdAt: updatedImage.created_at,
    updatedAt: updatedImage.updated_at,
  };
}

/**
 * Reorder images for hotel
 */
export async function reorderImages(
  hotelId: string,
  imageIds: string[],
  userId: string
): Promise<HotelImage[]> {
  const pool = getPool();

  // Verify ownership
  const isOwner = await verifyOwnership(hotelId, userId);
  if (!isOwner) {
    throw new Error('Unauthorized: You do not own this hotel');
  }

  // Verify all images belong to this hotel
  const placeholders = imageIds.map(() => '?').join(',');
  const [rows] = await pool.query(
    `SELECT id FROM hotel_images WHERE id IN (${placeholders}) AND hotel_id = ?`,
    [...imageIds, hotelId]
  );

  if ((rows as any[]).length !== imageIds.length) {
    throw new Error('One or more images do not belong to this hotel');
  }

  // Update display order
  const now = new Date();
  for (let i = 0; i < imageIds.length; i++) {
    await pool.query(
      'UPDATE hotel_images SET display_order = ?, updated_at = ? WHERE id = ?',
      [i + 1, now, imageIds[i]]
    );
  }

  // Return reordered images
  const { images } = await getHotelImages(hotelId, imageIds.length, 0);
  return images;
}

/**
 * Check rate limit for user uploads
 */
export async function checkRateLimit(userId: string): Promise<boolean> {
  const pool = getPool();

  // Get uploads in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM image_upload_audit 
     WHERE user_id = ? AND status = 'SUCCESS' AND created_at > ?`,
    [userId, oneHourAgo]
  );

  const uploadCount = (rows as any[])[0].count;
  const RATE_LIMIT = 10; // 10 uploads per hour

  return uploadCount < RATE_LIMIT;
}

/**
 * Get rate limit info for user
 */
export async function getRateLimitInfo(userId: string): Promise<{
  uploadsThisHour: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}> {
  const pool = getPool();

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const [rows] = await pool.query(
    `SELECT COUNT(*) as count FROM image_upload_audit 
     WHERE user_id = ? AND status = 'SUCCESS' AND created_at > ?`,
    [userId, oneHourAgo]
  );

  const uploadsThisHour = (rows as any[])[0].count;
  const RATE_LIMIT = 10;

  return {
    uploadsThisHour,
    limit: RATE_LIMIT,
    remaining: Math.max(0, RATE_LIMIT - uploadsThisHour),
    resetAt: new Date(Date.now() + 60 * 60 * 1000),
  };
}

/**
 * Cascade delete images when hotel is deleted
 */
export async function cascadeDeleteHotelImages(hotelId: string): Promise<void> {
  const pool = getPool();

  // Get all images for this hotel
  const [rows] = await pool.query(
    'SELECT image_key FROM hotel_images WHERE hotel_id = ?',
    [hotelId]
  );

  // Delete from S3 (continue even if some fail)
  const errors: string[] = [];
  for (const row of rows as any[]) {
    try {
      await wasabiService.deleteImage(row.image_key);
    } catch (error) {
      console.error(`Failed to delete S3 image ${row.image_key}:`, error);
      errors.push(`Failed to delete S3 image ${row.image_key}`);
    }
  }

  // Delete from database
  await pool.query('DELETE FROM hotel_images WHERE hotel_id = ?', [hotelId]);

  if (errors.length > 0) {
    console.warn(`Cascade delete completed with ${errors.length} S3 deletion errors:`, errors);
  }
}
