/**
 * Hotel Images API Routes
 */

import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware } from '../middleware/auth.middleware';
import * as hotelImagesService from '../services/hotel-images.service';
import { getPool } from '../database/connection';

export const createHotelImagesRouter = () => {
  const router = new Router({ prefix: '/hotel' });

  /**
   * POST /api/hotel/:hotelId/images
   * Upload image for hotel
   * Auth: Required (hotel owner)
   */
  router.post('/:hotelId/images', authMiddleware, async (ctx: Context) => {
    try {
      const hotelId = ctx.params.hotelId;
      const userId = (ctx as any).user?.userId;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      // Check rate limit
      const withinLimit = await hotelImagesService.checkRateLimit(userId);
      if (!withinLimit) {
        const rateLimitInfo = await hotelImagesService.getRateLimitInfo(userId);
        ctx.status = 429;
        ctx.body = {
          error: 'Rate limit exceeded',
          message: `You have reached the limit of ${rateLimitInfo.limit} uploads per hour`,
          resetAt: rateLimitInfo.resetAt,
        };
        return;
      }

      // Get uploaded file
      const file = (ctx.request as any).files?.file;
      if (!file) {
        ctx.status = 400;
        ctx.body = { error: 'No file provided' };
        return;
      }

      // Handle both single file and array of files
      const uploadFile = Array.isArray(file) ? file[0] : file;

      // Upload image
      const image = await hotelImagesService.uploadHotelImage({
        file: {
          buffer: uploadFile.data,
          mimetype: uploadFile.type,
          size: uploadFile.size,
          originalname: uploadFile.name,
        },
        hotelId,
        userId,
      });

      ctx.status = 201;
      ctx.body = {
        message: 'Image uploaded successfully',
        image: {
          id: image.id,
          hotelId: image.hotelId,
          cdnUrl: image.cdnUrl,
          fileName: image.fileName,
          fileSize: image.fileSize,
          mimeType: image.mimeType,
          isPrimary: image.isPrimary,
          createdAt: image.createdAt,
        },
      };
    } catch (error: any) {
      console.error('Error uploading image:', error);

      if (error.message.includes('Unauthorized')) {
        ctx.status = 403;
        ctx.body = { error: error.message };
      } else if (error.message.includes('Invalid file type') || error.message.includes('exceeds maximum')) {
        ctx.status = 400;
        ctx.body = { error: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { error: 'Failed to upload image' };
      }
    }
  });

  /**
   * DELETE /api/hotel/:hotelId/images/:imageId
   * Delete image from hotel
   * Auth: Required (hotel owner)
   */
  router.delete('/:hotelId/images/:imageId', authMiddleware, async (ctx: Context) => {
    try {
      const { hotelId, imageId } = ctx.params;
      const userId = (ctx as any).user?.userId;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      // Verify image exists and belongs to hotel
      const pool = getPool();
      const [rows] = await pool.query(
        'SELECT id FROM hotel_images WHERE id = ? AND hotel_id = ?',
        [imageId, hotelId]
      );

      if ((rows as any[]).length === 0) {
        ctx.status = 404;
        ctx.body = { error: 'Image not found' };
        return;
      }

      // Delete image
      await hotelImagesService.deleteHotelImage(imageId, userId);

      ctx.body = { message: 'Image deleted successfully' };
    } catch (error: any) {
      console.error('Error deleting image:', error);

      if (error.message.includes('Unauthorized')) {
        ctx.status = 403;
        ctx.body = { error: error.message };
      } else if (error.message.includes('not found')) {
        ctx.status = 404;
        ctx.body = { error: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { error: 'Failed to delete image' };
      }
    }
  });

  /**
   * GET /api/hotel/:hotelIdMd5/images
   * Fetch images for single hotel
   * Auth: Not required (public read)
   * Query params: limit (default 10), offset (default 0)
   */
  router.get('/:hotelIdMd5/images', async (ctx: Context) => {
    try {
      const hotelIdMd5 = ctx.params.hotelIdMd5;
      const { limit = '10', offset = '0' } = ctx.query;

      const limitNum = Math.min(parseInt(limit as string) || 10, 100);
      const offsetNum = Math.max(parseInt(offset as string) || 0, 0);

      // Find hotel by MD5 hash
      const pool = getPool();
      const [hotelRows] = await pool.query(
        'SELECT id FROM hotels WHERE hotel_id_md5 = ?',
        [hotelIdMd5]
      );

      if ((hotelRows as any[]).length === 0) {
        ctx.body = {
          images: [],
          pagination: {
            limit: limitNum,
            offset: offsetNum,
            total: 0,
          },
        };
        return;
      }

      const hotelId = (hotelRows as any[])[0].id;

      // Get images
      const { images, total } = await hotelImagesService.getHotelImages(hotelId, limitNum, offsetNum);

      ctx.body = {
        images: images.map(img => ({
          id: img.id,
          cdnUrl: img.cdnUrl,
          fileName: img.fileName,
          fileSize: img.fileSize,
          mimeType: img.mimeType,
          isPrimary: img.isPrimary,
          createdAt: img.createdAt,
        })),
        pagination: {
          limit: limitNum,
          offset: offsetNum,
          total,
        },
      };
    } catch (error: any) {
      console.error('Error fetching images:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch images' };
    }
  });

  /**
   * GET /api/hotel/images
   * Fetch images for multiple hotels
   * Auth: Not required (public read)
   * Query params: hotelIds (comma-separated MD5 hashes), limit (default 10), offset (default 0)
   */
  router.get('/images', async (ctx: Context) => {
    try {
      const { hotelIds, limit = '10', offset = '0' } = ctx.query;

      if (!hotelIds) {
        ctx.status = 400;
        ctx.body = { error: 'hotelIds parameter is required' };
        return;
      }

      const limitNum = Math.min(parseInt(limit as string) || 10, 100);
      const offsetNum = Math.max(parseInt(offset as string) || 0, 0);

      // Parse comma-separated hotel IDs
      const hotelIdMd5Array = (hotelIds as string).split(',').map(id => id.trim());

      // Find hotels by MD5 hashes
      const pool = getPool();
      const placeholders = hotelIdMd5Array.map(() => '?').join(',');
      const [hotelRows] = await pool.query(
        `SELECT id, hotel_id_md5 FROM hotels WHERE hotel_id_md5 IN (${placeholders})`,
        hotelIdMd5Array
      );

      // Create mapping of MD5 to hotel ID
      const md5ToHotelId = new Map<string, string>();
      for (const row of hotelRows as any[]) {
        md5ToHotelId.set(row.hotel_id_md5, row.id);
      }

      // Get hotel IDs
      const hotelIds_actual = Array.from(md5ToHotelId.values());

      // Get images for all hotels
      const imagesMap = await hotelImagesService.getMultipleHotelsImages(hotelIds_actual, limitNum, offsetNum);

      // Format response with MD5 hashes as keys
      const data: Record<string, any> = {};
      for (const [md5, hotelId] of md5ToHotelId.entries()) {
        const images = imagesMap.get(hotelId) || [];
        data[md5] = images.map(img => ({
          id: img.id,
          cdnUrl: img.cdnUrl,
          fileName: img.fileName,
          fileSize: img.fileSize,
          mimeType: img.mimeType,
          isPrimary: img.isPrimary,
          createdAt: img.createdAt,
        }));
      }

      // Add empty arrays for hotels not found
      for (const md5 of hotelIdMd5Array) {
        if (!data[md5]) {
          data[md5] = [];
        }
      }

      ctx.body = { data };
    } catch (error: any) {
      console.error('Error fetching multiple hotels images:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch images' };
    }
  });

  /**
   * PUT /api/hotel/:hotelId/images/:imageId/primary
   * Set image as primary for hotel
   * Auth: Required (hotel owner)
   */
  router.put('/:hotelId/images/:imageId/primary', authMiddleware, async (ctx: Context) => {
    try {
      const { hotelId, imageId } = ctx.params;
      const userId = (ctx as any).user?.userId;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      // Set primary image
      const image = await hotelImagesService.setPrimaryImage(imageId, userId);

      ctx.body = {
        message: 'Primary image set successfully',
        image: {
          id: image.id,
          hotelId: image.hotelId,
          cdnUrl: image.cdnUrl,
          fileName: image.fileName,
          isPrimary: image.isPrimary,
          createdAt: image.createdAt,
        },
      };
    } catch (error: any) {
      console.error('Error setting primary image:', error);

      if (error.message.includes('Unauthorized')) {
        ctx.status = 403;
        ctx.body = { error: error.message };
      } else if (error.message.includes('not found')) {
        ctx.status = 404;
        ctx.body = { error: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { error: 'Failed to set primary image' };
      }
    }
  });

  /**
   * PUT /api/hotel/:hotelId/images/reorder
   * Reorder images for hotel
   * Auth: Required (hotel owner)
   * Body: { imageIds: [id1, id2, id3, ...] }
   */
  router.put('/:hotelId/images/reorder', authMiddleware, async (ctx: Context) => {
    try {
      const hotelId = ctx.params.hotelId;
      const userId = (ctx as any).user?.userId;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      // @ts-ignore
      const { imageIds } = ctx.request.body;

      if (!Array.isArray(imageIds) || imageIds.length === 0) {
        ctx.status = 400;
        ctx.body = { error: 'imageIds must be a non-empty array' };
        return;
      }

      // Reorder images
      const images = await hotelImagesService.reorderImages(hotelId, imageIds, userId);

      ctx.body = {
        message: 'Images reordered successfully',
        images: images.map(img => ({
          id: img.id,
          cdnUrl: img.cdnUrl,
          fileName: img.fileName,
          displayOrder: img.displayOrder,
          isPrimary: img.isPrimary,
        })),
      };
    } catch (error: any) {
      console.error('Error reordering images:', error);

      if (error.message.includes('Unauthorized')) {
        ctx.status = 403;
        ctx.body = { error: error.message };
      } else if (error.message.includes('not found') || error.message.includes('do not belong')) {
        ctx.status = 404;
        ctx.body = { error: error.message };
      } else {
        ctx.status = 500;
        ctx.body = { error: 'Failed to reorder images' };
      }
    }
  });

  return router;
};
