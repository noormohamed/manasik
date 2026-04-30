/**
 * Integration tests for Hotel Images API endpoints
 */

import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import { createApiRouter } from '../routes/api.routes';
import { errorHandler } from '../middleware/error';
import { responseWrapper } from '../middleware/response';

// Mock the database connection
jest.mock('../database/connection', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getPool: jest.fn(),
}));

// Mock Wasabi S3 service
jest.mock('../services/wasabi-s3.service', () => ({
  validateImageFile: jest.fn((file) => ({ valid: true })),
  generateImageFilename: jest.fn((hotelIdMd5, imageNumber) => `${hotelIdMd5}_${imageNumber}.jpg`),
  generateS3Key: jest.fn((hotelIdMd5, filename) => `mk-images/${hotelIdMd5}/${filename}`),
  generateCdnUrl: jest.fn((s3Key) => `https://mk-images.wasabisys.com/${s3Key}`),
  uploadImage: jest.fn().mockResolvedValue({
    key: 'mk-images/test-md5/test.jpg',
    cdnUrl: 'https://mk-images.wasabisys.com/mk-images/test-md5/test.jpg',
    fileSize: 1024,
    mimeType: 'image/jpeg',
  }),
  deleteImage: jest.fn().mockResolvedValue(undefined),
}));

// Mock hotel images service
jest.mock('../services/hotel-images.service', () => ({
  verifyOwnership: jest.fn().mockResolvedValue(true),
  getHotelIdMd5: jest.fn().mockResolvedValue('test-md5-hash'),
  getNextImageNumber: jest.fn().mockResolvedValue(1),
  uploadHotelImage: jest.fn().mockResolvedValue({
    id: 'img-1',
    hotelId: 'hotel-1',
    imageKey: 'mk-images/test-md5/test.jpg',
    cdnUrl: 'https://mk-images.wasabisys.com/mk-images/test-md5/test.jpg',
    fileName: 'test.jpg',
    fileSize: 1024,
    mimeType: 'image/jpeg',
    uploadedBy: 'user-1',
    isPrimary: false,
    imageNumber: 1,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  deleteHotelImage: jest.fn().mockResolvedValue(undefined),
  getHotelImages: jest.fn().mockResolvedValue({
    images: [
      {
        id: 'img-1',
        hotelId: 'hotel-1',
        cdnUrl: 'https://mk-images.wasabisys.com/mk-images/test-md5/test.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        isPrimary: true,
        createdAt: new Date(),
      },
    ],
    total: 1,
  }),
  getMultipleHotelsImages: jest.fn().mockResolvedValue(
    new Map([
      [
        'hotel-1',
        [
          {
            id: 'img-1',
            hotelId: 'hotel-1',
            cdnUrl: 'https://mk-images.wasabisys.com/mk-images/test-md5/test.jpg',
            fileName: 'test.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            isPrimary: true,
            createdAt: new Date(),
          },
        ],
      ],
    ])
  ),
  setPrimaryImage: jest.fn().mockResolvedValue({
    id: 'img-1',
    hotelId: 'hotel-1',
    cdnUrl: 'https://mk-images.wasabisys.com/mk-images/test-md5/test.jpg',
    fileName: 'test.jpg',
    isPrimary: true,
    createdAt: new Date(),
  }),
  reorderImages: jest.fn().mockResolvedValue([
    {
      id: 'img-1',
      cdnUrl: 'https://mk-images.wasabisys.com/mk-images/test-md5/test1.jpg',
      fileName: 'test1.jpg',
      displayOrder: 1,
      isPrimary: true,
    },
    {
      id: 'img-2',
      cdnUrl: 'https://mk-images.wasabisys.com/mk-images/test-md5/test2.jpg',
      fileName: 'test2.jpg',
      displayOrder: 2,
      isPrimary: false,
    },
  ]),
  checkRateLimit: jest.fn().mockResolvedValue(true),
  getRateLimitInfo: jest.fn().mockResolvedValue({
    uploadsThisHour: 3,
    limit: 10,
    remaining: 7,
    resetAt: new Date(),
  }),
}));

describe('Hotel Images API Endpoints', () => {
  let app: Koa;
  const mockPool = {
    query: jest.fn(),
  };

  beforeAll(() => {
    // Create app
    app = new Koa();
    app.use(errorHandler);
    app.use(cors());
    app.use(bodyParser());
    app.use(responseWrapper);

    const apiRouter = createApiRouter();
    app.use(apiRouter.routes());
    app.use(apiRouter.allowedMethods());
  });

  beforeEach(() => {
    jest.clearAllMocks();
    const { getPool } = require('../database/connection');
    getPool.mockReturnValue(mockPool);
  });

  describe('POST /api/hotel/:hotelId/images', () => {
    it('should upload image successfully', async () => {
      const response = await request(app.callback())
        .post('/api/hotel/hotel-1/images')
        .set('Authorization', 'Bearer test-token')
        .attach('file', Buffer.from('fake image'), 'test.jpg');

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Image uploaded successfully');
      expect(response.body.image).toBeDefined();
      expect(response.body.image.cdnUrl).toBeDefined();
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app.callback())
        .post('/api/hotel/hotel-1/images')
        .attach('file', Buffer.from('fake image'), 'test.jpg');

      expect(response.status).toBe(401);
    });

    it('should return 400 if no file provided', async () => {
      const response = await request(app.callback())
        .post('/api/hotel/hotel-1/images')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('No file provided');
    });
  });

  describe('DELETE /api/hotel/:hotelId/images/:imageId', () => {
    it('should delete image successfully', async () => {
      mockPool.query.mockResolvedValueOnce([[{ id: 'img-1' }]]);

      const response = await request(app.callback())
        .delete('/api/hotel/hotel-1/images/img-1')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Image deleted successfully');
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app.callback())
        .delete('/api/hotel/hotel-1/images/img-1');

      expect(response.status).toBe(401);
    });

    it('should return 404 if image not found', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const response = await request(app.callback())
        .delete('/api/hotel/hotel-1/images/nonexistent')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/hotel/:hotelIdMd5/images', () => {
    it('should fetch images for single hotel', async () => {
      mockPool.query.mockResolvedValueOnce([[{ id: 'hotel-1' }]]);

      const response = await request(app.callback())
        .get('/api/hotel/test-md5-hash/images');

      expect(response.status).toBe(200);
      expect(response.body.images).toBeDefined();
      expect(Array.isArray(response.body.images)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      mockPool.query.mockResolvedValueOnce([[{ id: 'hotel-1' }]]);

      const response = await request(app.callback())
        .get('/api/hotel/test-md5-hash/images?limit=5&offset=10');

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.offset).toBe(10);
    });

    it('should return empty array if hotel not found', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);

      const response = await request(app.callback())
        .get('/api/hotel/nonexistent-md5/images');

      expect(response.status).toBe(200);
      expect(response.body.images).toEqual([]);
    });
  });

  describe('GET /api/hotel/images', () => {
    it('should fetch images for multiple hotels', async () => {
      mockPool.query.mockResolvedValueOnce([
        [
          { id: 'hotel-1', hotel_id_md5: 'md5-1' },
          { id: 'hotel-2', hotel_id_md5: 'md5-2' },
        ],
      ]);

      const response = await request(app.callback())
        .get('/api/hotel/images?hotelIds=md5-1,md5-2');

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.data['md5-1']).toBeDefined();
      expect(response.body.data['md5-2']).toBeDefined();
    });

    it('should return 400 if hotelIds not provided', async () => {
      const response = await request(app.callback())
        .get('/api/hotel/images');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('hotelIds parameter is required');
    });

    it('should support pagination parameters', async () => {
      mockPool.query.mockResolvedValueOnce([[{ id: 'hotel-1', hotel_id_md5: 'md5-1' }]]);

      const response = await request(app.callback())
        .get('/api/hotel/images?hotelIds=md5-1&limit=5&offset=10');

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/hotel/:hotelId/images/:imageId/primary', () => {
    it('should set primary image successfully', async () => {
      const response = await request(app.callback())
        .put('/api/hotel/hotel-1/images/img-1/primary')
        .set('Authorization', 'Bearer test-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Primary image set successfully');
      expect(response.body.image.isPrimary).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app.callback())
        .put('/api/hotel/hotel-1/images/img-1/primary');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/hotel/:hotelId/images/reorder', () => {
    it('should reorder images successfully', async () => {
      const response = await request(app.callback())
        .put('/api/hotel/hotel-1/images/reorder')
        .set('Authorization', 'Bearer test-token')
        .send({ imageIds: ['img-1', 'img-2'] });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Images reordered successfully');
      expect(response.body.images).toBeDefined();
      expect(Array.isArray(response.body.images)).toBe(true);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app.callback())
        .put('/api/hotel/hotel-1/images/reorder')
        .send({ imageIds: ['img-1', 'img-2'] });

      expect(response.status).toBe(401);
    });

    it('should return 400 if imageIds not provided', async () => {
      const response = await request(app.callback())
        .put('/api/hotel/hotel-1/images/reorder')
        .set('Authorization', 'Bearer test-token')
        .send({});

      expect(response.status).toBe(400);
    });
  });
});
