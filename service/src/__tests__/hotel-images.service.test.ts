/**
 * Unit tests for Hotel Images Service
 */

import { getPool } from '../database/connection';
import * as hotelImagesService from '../services/hotel-images.service';
import * as wasabiService from '../services/wasabi-s3.service';

// Mock the database and Wasabi service
jest.mock('../database/connection');
jest.mock('../services/wasabi-s3.service');

describe('HotelImagesService', () => {
  const mockPool = {
    query: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getPool as jest.Mock).mockReturnValue(mockPool);
  });

  describe('verifyOwnership', () => {
    it('should return true if user owns hotel', async () => {
      mockPool.query.mockResolvedValueOnce([[{ id: 'hotel-1' }]]);

      const result = await hotelImagesService.verifyOwnership('hotel-1', 'user-1');

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT id FROM hotels WHERE id = ? AND agent_id = ?',
        ['hotel-1', 'user-1']
      );
    });

    it('should return false if user does not own hotel', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const result = await hotelImagesService.verifyOwnership('hotel-1', 'user-2');

      expect(result).toBe(false);
    });
  });

  describe('getHotelIdMd5', () => {
    it('should return existing MD5 hash', async () => {
      const md5Hash = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      mockPool.query.mockResolvedValueOnce([[{ hotel_id_md5: md5Hash }]]);

      const result = await hotelImagesService.getHotelIdMd5('hotel-1');

      expect(result).toBe(md5Hash);
    });

    it('should generate and store MD5 hash if not exists', async () => {
      mockPool.query
        .mockResolvedValueOnce([[{ hotel_id_md5: null }]]) // First query returns null
        .mockResolvedValueOnce(undefined); // Second query (update) returns undefined

      const result = await hotelImagesService.getHotelIdMd5('hotel-1');

      expect(result).toMatch(/^[a-f0-9]{32}$/);
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    it('should throw error if hotel not found', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      await expect(hotelImagesService.getHotelIdMd5('nonexistent')).rejects.toThrow('Hotel not found');
    });
  });

  describe('getNextImageNumber', () => {
    it('should return 1 for first image', async () => {
      mockPool.query.mockResolvedValueOnce([[{ max_number: null }]]);

      const result = await hotelImagesService.getNextImageNumber('hotel-1');

      expect(result).toBe(1);
    });

    it('should return next sequential number', async () => {
      mockPool.query.mockResolvedValueOnce([[{ max_number: 5 }]]);

      const result = await hotelImagesService.getNextImageNumber('hotel-1');

      expect(result).toBe(6);
    });

    it('should handle zero max_number', async () => {
      mockPool.query.mockResolvedValueOnce([[{ max_number: 0 }]]);

      const result = await hotelImagesService.getNextImageNumber('hotel-1');

      expect(result).toBe(1);
    });
  });

  describe('checkRateLimit', () => {
    it('should return true if under rate limit', async () => {
      mockPool.query.mockResolvedValueOnce([[{ count: 5 }]]);

      const result = await hotelImagesService.checkRateLimit('user-1');

      expect(result).toBe(true);
    });

    it('should return false if at rate limit', async () => {
      mockPool.query.mockResolvedValueOnce([[{ count: 10 }]]);

      const result = await hotelImagesService.checkRateLimit('user-1');

      expect(result).toBe(false);
    });

    it('should return false if over rate limit', async () => {
      mockPool.query.mockResolvedValueOnce([[{ count: 15 }]]);

      const result = await hotelImagesService.checkRateLimit('user-1');

      expect(result).toBe(false);
    });
  });

  describe('getRateLimitInfo', () => {
    it('should return correct rate limit info', async () => {
      mockPool.query.mockResolvedValueOnce([[{ count: 3 }]]);

      const result = await hotelImagesService.getRateLimitInfo('user-1');

      expect(result.uploadsThisHour).toBe(3);
      expect(result.limit).toBe(10);
      expect(result.remaining).toBe(7);
      expect(result.resetAt).toBeInstanceOf(Date);
    });

    it('should return 0 remaining when at limit', async () => {
      mockPool.query.mockResolvedValueOnce([[{ count: 10 }]]);

      const result = await hotelImagesService.getRateLimitInfo('user-1');

      expect(result.remaining).toBe(0);
    });
  });

  describe('getHotelImages', () => {
    it('should return images with pagination', async () => {
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
        .mockResolvedValueOnce([[{ total: 1 }]]) // Count query
        .mockResolvedValueOnce([mockImages]); // Images query

      const result = await hotelImagesService.getHotelImages('hotel-1', 10, 0);

      expect(result.total).toBe(1);
      expect(result.images).toHaveLength(1);
      expect(result.images[0].id).toBe('img-1');
    });

    it('should return primary image first', async () => {
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
          hotel_id: 'hotel-1',
          is_primary: false,
          image_number: 2,
          display_order: 2,
        },
      ];

      mockPool.query
        .mockResolvedValueOnce([[{ total: 2 }]])
        .mockResolvedValueOnce([mockImages]);

      const result = await hotelImagesService.getHotelImages('hotel-1', 10, 0);

      expect(result.images[0].isPrimary).toBe(true);
    });
  });

  describe('getMultipleHotelsImages', () => {
    it('should return images grouped by hotel ID', async () => {
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
        {
          id: 'img-2',
          hotel_id: 'hotel-2',
          image_key: 'key-2',
          cdn_url: 'url-2',
          file_name: 'test2.jpg',
          file_size: 2048,
          mime_type: 'image/jpeg',
          uploaded_by: 'user-1',
          is_primary: true,
          image_number: 1,
          display_order: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockPool.query.mockResolvedValueOnce([mockImages]);

      const result = await hotelImagesService.getMultipleHotelsImages(['hotel-1', 'hotel-2'], 10, 0);

      expect(result.get('hotel-1')).toHaveLength(1);
      expect(result.get('hotel-2')).toHaveLength(1);
      expect(result.get('hotel-1')![0].id).toBe('img-1');
      expect(result.get('hotel-2')![0].id).toBe('img-2');
    });

    it('should return empty arrays for hotels with no images', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const result = await hotelImagesService.getMultipleHotelsImages(['hotel-1', 'hotel-2'], 10, 0);

      expect(result.get('hotel-1')).toEqual([]);
      expect(result.get('hotel-2')).toEqual([]);
    });

    it('should return empty map for empty hotel IDs', async () => {
      const result = await hotelImagesService.getMultipleHotelsImages([], 10, 0);

      expect(result.size).toBe(0);
    });
  });
});
