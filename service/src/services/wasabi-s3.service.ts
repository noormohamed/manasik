/**
 * Wasabi S3 Service
 * Handles all S3 operations for hotel image management
 */

import * as crypto from 'crypto';
import AWS from 'aws-sdk';

interface UploadResult {
  key: string;
  cdnUrl: string;
  fileSize: number;
  mimeType: string;
}

interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const WASABI_BUCKET = 'mk-images';
const WASABI_REGION = 'eu-west-1';
const CDN_BASE_URL = 'https://mk-images.wasabisys.com';

let s3Client: AWS.S3 | null = null;

/**
 * Initialize S3 client with Wasabi credentials
 */
function getS3Client(): AWS.S3 {
  if (s3Client) {
    return s3Client;
  }

  const accessKeyId = process.env.WASABI_ACCESS_KEY_ID;
  const secretAccessKey = process.env.WASABI_SECRET_ACCESS_KEY;
  const endpoint = process.env.WASABI_ENDPOINT || `https://s3.${WASABI_REGION}.wasabisys.com`;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Wasabi S3 credentials not configured. Set WASABI_ACCESS_KEY_ID and WASABI_SECRET_ACCESS_KEY environment variables.');
  }

  s3Client = new AWS.S3({
    accessKeyId,
    secretAccessKey,
    endpoint,
    region: WASABI_REGION,
    s3ForcePathStyle: true,
  });

  return s3Client;
}

/**
 * Validate image file
 */
export function validateImageFile(file: {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
}): FileValidationResult {
  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`,
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate deterministic image filename using MD5
 * Format: md5(hotel_id_md5 + image_number).jpg
 */
export function generateImageFilename(hotelIdMd5: string, imageNumber: number): string {
  const input = `${hotelIdMd5}${imageNumber}`;
  const hash = crypto.createHash('md5').update(input).digest('hex');
  return `${hash}.jpg`;
}

/**
 * Generate S3 key (path) for image
 * Format: mk-images/hotel_id_md5/filename.jpg
 */
export function generateS3Key(hotelIdMd5: string, imageFilename: string): string {
  return `${WASABI_BUCKET}/${hotelIdMd5}/${imageFilename}`;
}

/**
 * Generate CDN URL for image
 * Format: https://mk-images.wasabisys.com/mk-images/hotel_id_md5/filename.jpg
 */
export function generateCdnUrl(s3Key: string): string {
  return `${CDN_BASE_URL}/${s3Key}`;
}

/**
 * Retry logic with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt}/${maxAttempts} failed:`, lastError.message);

      if (attempt < maxAttempts) {
        const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Operation failed after all retry attempts');
}

/**
 * Upload image to Wasabi S3
 */
export async function uploadImage(
  file: {
    buffer: Buffer;
    mimetype: string;
    size: number;
    originalname: string;
  },
  hotelIdMd5: string,
  imageNumber: number,
  userId: string
): Promise<UploadResult> {
  // Validate file
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Generate filename and S3 key
  const filename = generateImageFilename(hotelIdMd5, imageNumber);
  const s3Key = generateS3Key(hotelIdMd5, filename);

  // Upload to S3 with retry logic
  const s3 = getS3Client();

  await retryWithBackoff(async () => {
    await s3
      .putObject({
        Bucket: WASABI_BUCKET,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
        Metadata: {
          'original-filename': file.originalname,
          'uploaded-by': userId,
          'upload-date': new Date().toISOString(),
        },
      })
      .promise();
  });

  // Generate CDN URL
  const cdnUrl = generateCdnUrl(s3Key);

  return {
    key: s3Key,
    cdnUrl,
    fileSize: file.size,
    mimeType: file.mimetype,
  };
}

/**
 * Delete image from Wasabi S3
 */
export async function deleteImage(s3Key: string): Promise<void> {
  const s3 = getS3Client();

  await retryWithBackoff(async () => {
    await s3
      .deleteObject({
        Bucket: WASABI_BUCKET,
        Key: s3Key,
      })
      .promise();
  });
}

/**
 * Check if image exists in S3
 */
export async function imageExists(s3Key: string): Promise<boolean> {
  const s3 = getS3Client();

  try {
    await s3
      .headObject({
        Bucket: WASABI_BUCKET,
        Key: s3Key,
      })
      .promise();
    return true;
  } catch (error: any) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
}

/**
 * Get image metadata from S3
 */
export async function getImageMetadata(s3Key: string): Promise<any> {
  const s3 = getS3Client();

  const response = await s3
    .headObject({
      Bucket: WASABI_BUCKET,
      Key: s3Key,
    })
    .promise();

  return {
    size: response.ContentLength,
    mimeType: response.ContentType,
    lastModified: response.LastModified,
    metadata: response.Metadata,
  };
}
