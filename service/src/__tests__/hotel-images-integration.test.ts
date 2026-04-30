/**
 * Integration tests for complete hotel image management workflows
 */

import { getPool } from '../database/connection';
import * as hotelImagesService from '../services/hotel-images.service';
import * as wasabiService from '../services/wasabi-s3.service';

// Mock the database and Wasabi service
jest.mock('../database/connection');
jest.mock('../services/wasabi-s3.service');

describe('Hotel Images Integration Tests', () => {
  const mockPool = {
    query: jest.fn(),
  };

  const testHotel = {
    id: 'hotel-1',
    name: 'Test Hotel',
    agent_id: 'user-1',
  };

  const testUser = {
    id: 'user-1',
    email: 'user@example.com',
  };

  const testFile = {
    buffer: Buffer.from('fake image data'),
    mimetype: 'image/jpeg',
    size: 1024 * 100,
    originalname: 'test.jpg',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getPool as jest.Mock).mockReturnValue(mockPool);
  });

  describe('Complete Upload Workflow', () => {
    it('should upload image and save metadata', async () => {
      // Mock ownership verification
      mockPool.query
        .mockResolvedValueOnce([[{ id: 'hotel-1' }]]) // verifyOwnership
        .mockResolvedValueOnce([[{ hotel_id_md5: null }]]) // getHotelIdMd5 - first query
        .mockResolvedValueOnce(undefined) // getHotelIdMd5 - update
        .mockResolvedValueOnce([[{ max_number: null }]]) // getNextImageNumber
        .mockResolvedValueOnce(undefined) // INSERT hotel_images
        .mockResolvedValueOnce(undefined); // INSERT image_upload_audit

      // Mock Wasabi upload
      (wasabiService.uploadImage as jest.Mock).mockResolvedValueOnce({
        key: 'mk-images/test-md5/test.jpg',
        cdnUrl: 'https://mk-images.wasabisys.com/mk-images/test-md5/test.jpg',
        fileSize: 1024 * 100,
        mimeType: 'image/jpeg',
      });

      const result = await hotelImagesService.uploadHotelImage({
        file: testFile,
        hotelId: 'hotel-1',
        userId: 'user-1',
      });

      expect(result).toBeDefined();
      expect(result.cdnUrl).toContain('wasabisys.com');
      expect(result.fileName).toBe('test.jpg');
      expect(result.imageNumber).toBe(1);
    });

    it('should fail if user does not own hotel', async () => {
      mockPool.query.mockResolvedValueOnce([]); // verifyOwnership returns empty

      await expect(
        hotelImagesService.uploadHotelImage({
          file: testFile,
          hotelId: 'hotel-1',
          userId: 'user-2',
        })
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('Complete Deletion Workflow', () => {
    it('should delete image from S3 and database', async () => {
      const imageId = 'img-1';
      const s3Key = 'mk-images/test-md5/test.jpg';

      // Mock image retrieval
      mockPool.query
        .mockResolvedValueOnce([
          [
            {
              id: imageId,
              hotel_id: 'hotel-1',
              image_key: s3Key,
            },
          ],
        ]) // SELECT image
        .mockResolvedValueOnce([[{ id: 'hotel-1' }]]) // verifyOwnership
        .mockResolvedValueOnce(undefined); // DELETE image

      // Mock Wasabi deletion
      (wasabiService.deleteImage as jest.Mock).mockResolvedValueOnce(undefined);

      await hotelImagesService.deleteHotelImage(imageId, 'user-1');

      expect(wasabiService.deleteImage).toHaveBeenCalledWith(s3Key);
      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM hotel_images WHERE id = ?',
        [imageId]
      );
    });

    it('should fail if user does not own hotel', async () => {
      mockPool.query
        .mockResolvedValueOnce([
          [
            {
              id: 'img-1',
              hotel_id: 'hotel-1',
              image_key: 'mk-images/test-md5/test.jpg',
            },
          ],
        ]) // SELECT image
        .mockResolvedValueOnce([]); // verifyOwnership returns empty

      await expect(
        hotelImagesService.deleteHotelImage('img-1', 'user-2')
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('Complete Fetch Workflow', () => {
    it('should fetch images for single hotel with pagination', async () => {
      const mockImages = [
        {
          id: 'img-1',
          hotel_id: 'hotel-1',
          image_key: 'key-1',
          cdn_url: 'url-1',
          file_name: 'test1.jpg',
          file_size: 1024,
          mime_type: 'image/jpeg',
          uploaded_by: 'user-1',
          is_primary: true,
          image_number: 1,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPool.query
        .mockResolvedValueOnce([[{ total: 1 }]]) // COUNT
        .mockResolvedValueOnce([mockImages]); // SELECT images

      const result = await hotelImagesService.getHotelImages('hotel-1', 10, 0);

      expect(result.total).toBe(1);
      expect(result.images).toHaveLength(1);
      expect(result.images[0].isPrimary).toBe(true);
    });

    it('should fetch images for multiple hotels', async () => {
      const mockImages = [
        {
          id: 'img-1',
          hotel_id: 'hotel-1',
          is_primary: true,
          image_number: 1,
          display_order: 1,
        },
        {
          id: 'img-2',
          hotel_id: 'hotel-2',
          is_primary: true,
          image_number: 1,
          display_order: 1,
        },
      ];

      mockPool.query.mockResolvedValueOnce([mockImages]);

      const result = await hotelImagesService.getMultipleHotelsImages(
        ['hotel-1', 'hotel-2'],
        10,
        0
      );

      expect(result.get('hotel-1')).toHaveLength(1);
      expect(result.get('hotel-2')).toHaveLength(1);
    });
  });

  describe('Complete Primary Image Workflow', () => {
    it('should set primary image and unset previous', async () => {
      mockPool.query
        .mockResolvedValueOnce([
          [
            {
              id: 'img-2',
              hotel_id: 'hotel-1',
            },
          ],
        ]) // SELECT image
        .mockResolvedValueOnce([[{ id: 'hotel-1' }]]) // verifyOwnership
        .mockResolvedValueOnce(undefined) // UPDATE previous primary to false
        .mockResolvedValueOnce(undefined) // UPDATE new primary to true
        .mockResolvedValueOnce([
          [
            {
              id: 'img-2',
              hotel_id: 'hotel-1',
              is_primary: true,
              image_number: 2,
              display_order: 2,
            },
          ],
        ]); // SELECT updated image

      const result = await hotelImagesService.setPrimaryImage('img-2', 'user-1');

      expect(result.isPrimary).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE hotel_images SET is_primary = FALSE WHERE hotel_id = ? AND is_primary = TRUE',
        ['hotel-1']
      );
    });
  });

  describe('Complete Reorder Workflow', () => {
    it('should reorder images and persist order', async () => {
      const imageIds = ['img-2', 'img-1', 'img-3'];

      mockPool.query
        .mockResolvedValueOnce([
          [
            { id: 'img-2' },
            { id: 'img-1' },
            { id: 'img-3' },
          ],
        ]) // Verify all images belong to hotel
        .mockResolvedValueOnce(undefined) // UPDATE img-2 order
        .mockResolvedValueOnce(undefined) // UPDATE img-1 order
        .mockResolvedValueOnce(undefined) // UPDATE img-3 order
        .mockResolvedValueOnce([[{ total: 3 }]]) // COUNT for getHotelImages
        .mockResolvedValueOnce([
          [
            { id: 'img-2', display_order: 1 },
            { id: 'img-1', display_order: 2 },
            { id: 'img-3', display_order: 3 },
          ],
        ]); // SELECT reordered images

      const result = await hotelImagesService.reorderImages('hotel-1', imageIds, 'user-1');

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('img-2');
      expect(result[1].id).toBe('img-1');
      expect(result[2].id).toBe('img-3');
    });
  });

  describe('Complete Cascade Delete Workflow', () => {
    it('should delete all images when hotel is deleted', async () => {
      const imageKeys = [
        'mk-images/test-md5/img1.jpg',
        'mk-images/test-md5/img2.jpg',
      ];

      mockPool.query
        .mockResolvedValueOnce([
          [{ image_key: imageKeys[0] }, { image_key: imageKeys[1] }],
        ]) // SELECT images
        .mockResolvedValueOnce(undefined); // DELETE images

      (wasabiService.deleteImage as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      await hotelImagesService.cascadeDeleteHotelImages('hotel-1');

      expect(wasabiService.deleteImage).toHaveBeenCalledTimes(2);
      expect(wasabiService.deleteImage).toHaveBeenCalledWith(imageKeys[0]);
      expect(wasabiService.deleteImage).toHaveBeenCalledWith(imageKeys[1]);
    });

    it('should continue deletion even if S3 deletion fails', async () => {
      const imageKeys = [
        'mk-images/test-md5/img1.jpg',
        'mk-images/test-md5/img2.jpg',
      ];

      mockPool.query
        .mockResolvedValueOnce([
          [{ image_key: imageKeys[0] }, { image_key: imageKeys[1] }],
        ]) // SELECT images
        .mockResolvedValueOnce(undefined); // DELETE images

      (wasabiService.deleteImage as jest.Mock)
        .mockRejectedValueOnce(new Error('S3 error'))
        .mockResolvedValueOnce(undefined);

      // Should not throw
      await hotelImagesService.cascadeDeleteHotelImages('hotel-1');

      expect(wasabiService.deleteImage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Rate Limiting Workflow', () => {
    it('should enforce rate limit', async () => {
      mockPool.query.mockResolvedValueOnce([[{ count: 10 }]]);

      const withinLimit = await hotelImagesService.checkRateLimit('user-1');

      expect(withinLimit).toBe(false);
    });

    it('should allow uploads within rate limit', async () => {
      mockPool.query.mockResolvedValueOnce([[{ count: 5 }]]);

      const withinLimit = await hotelImagesService.checkRateLimit('user-1');

      expect(withinLimit).toBe(true);
    });
  });
});
