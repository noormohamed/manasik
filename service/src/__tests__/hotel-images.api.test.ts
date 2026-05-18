import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import { createHotelImagesRouter } from '../routes/hotel-images.routes';

// Mock the database connection
const mockQuery = jest.fn();
jest.mock('../database/connection', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getPool: jest.fn(() => ({
    query: mockQuery,
  })),
}));

// Mock the auth middleware
jest.mock('../middleware/auth.middleware', () => ({
  authMiddleware: async (ctx: any, next: any) => {
    const authHeader = ctx.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      if (token === 'valid-agent-token') {
        (ctx as any).user = {
          userId: 'agent-010',
          email: 'agent-10@bookingplatform.com',
          role: 'AGENT',
          companyId: 'comp-005',
        };
      } else if (token === 'valid-customer-token') {
        (ctx as any).user = {
          userId: 'customer-001',
          email: 'customer@test.com',
          role: 'CUSTOMER',
        };
      } else {
        ctx.status = 401;
        ctx.body = { error: 'Invalid token' };
        return;
      }
    } else {
      ctx.status = 401;
      ctx.body = { error: 'No token provided' };
      return;
    }
    await next();
  },
}));

// Mock the hotel images service
jest.mock('../services/hotel-images.service', () => ({
  checkRateLimit: jest.fn().mockResolvedValue(true),
  getRateLimitInfo: jest.fn().mockResolvedValue({
    uploadsThisHour: 2,
    limit: 10,
    remaining: 8,
    resetAt: new Date(),
  }),
  uploadHotelImage: jest.fn().mockResolvedValue({
    id: 'img-001',
    hotelId: 'hotel-010',
    imageKey: 'mk-images/abc123/1.jpg',
    cdnUrl: 'https://mk-images.wasabisys.com/mk-images/abc123/1.jpg',
    fileName: 'test-image.jpg',
    fileSize: 102400,
    mimeType: 'image/jpeg',
    uploadedBy: 'agent-010',
    isPrimary: false,
    imageNumber: 1,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  deleteHotelImage: jest.fn().mockResolvedValue(undefined),
  setPrimaryImage: jest.fn().mockResolvedValue({
    id: 'img-001',
    hotelId: 'hotel-010',
    imageKey: 'mk-images/abc123/1.jpg',
    cdnUrl: 'https://mk-images.wasabisys.com/mk-images/abc123/1.jpg',
    fileName: 'test-image.jpg',
    fileSize: 102400,
    mimeType: 'image/jpeg',
    uploadedBy: 'agent-010',
    isPrimary: true,
    imageNumber: 1,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  reorderImages: jest.fn().mockResolvedValue([
    {
      id: 'img-002',
      cdnUrl: 'https://mk-images.wasabisys.com/mk-images/abc123/2.jpg',
      fileName: 'image-2.jpg',
      displayOrder: 1,
      isPrimary: false,
    },
    {
      id: 'img-001',
      cdnUrl: 'https://mk-images.wasabisys.com/mk-images/abc123/1.jpg',
      fileName: 'image-1.jpg',
      displayOrder: 2,
      isPrimary: true,
    },
  ]),
  getHotelImages: jest.fn().mockResolvedValue({ images: [], total: 0 }),
  getMultipleHotelsImages: jest.fn().mockResolvedValue(new Map()),
  verifyOwnership: jest.fn().mockResolvedValue(true),
}));

function createTestApp() {
  const app = new Koa();
  app.use(bodyParser());

  const mainRouter = new Router({ prefix: '/api' });
  const hotelImagesRouter = createHotelImagesRouter();
  mainRouter.use(hotelImagesRouter.routes());
  mainRouter.use(hotelImagesRouter.allowedMethods());

  app.use(mainRouter.routes());
  app.use(mainRouter.allowedMethods());

  return app;
}

describe('Hotel Images API', () => {
  let app: Koa;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
  });

  describe('GET /api/hotel/:hotelIdMd5/images', () => {
    it('should return images for a valid hotel MD5 hash', async () => {
      // Mock: find hotel by MD5
      mockQuery
        .mockResolvedValueOnce([[{ id: 'hotel-010' }]]) // hotel lookup
        .mockResolvedValueOnce([[{ total: 3 }]]) // count
        .mockResolvedValueOnce([[ // images
          {
            id: 481,
            hotel_id: 'hotel-010',
            image_url: 'https://images.unsplash.com/photo-1566073771259?w=800',
            display_order: 1,
            created_at: '2026-05-01T11:08:29.000Z',
          },
          {
            id: 482,
            hotel_id: 'hotel-010',
            image_url: 'https://images.unsplash.com/photo-1582719508461?w=800',
            display_order: 2,
            created_at: '2026-05-01T11:08:29.000Z',
          },
          {
            id: 483,
            hotel_id: 'hotel-010',
            image_url: 'https://images.unsplash.com/photo-1520250497591?w=800',
            display_order: 3,
            created_at: '2026-05-01T11:08:29.000Z',
          },
        ]]);

      const res = await request(app.callback())
        .get('/api/hotel/d774492212eb250967af62f4bb555dc7/images?limit=50')
        .expect(200);

      expect(res.body.images).toHaveLength(3);
      expect(res.body.pagination).toEqual({
        limit: 50,
        offset: 0,
        total: 3,
      });
      expect(res.body.images[0]).toMatchObject({
        id: '481',
        hotelId: 'hotel-010',
        cdnUrl: 'https://images.unsplash.com/photo-1566073771259?w=800',
        isPrimary: true, // display_order === 1
        displayOrder: 1,
      });
    });

    it('should return empty array for unknown MD5 hash', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // no hotel found

      const res = await request(app.callback())
        .get('/api/hotel/0000000000000000000000000000dead/images')
        .expect(200);

      expect(res.body.images).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should respect limit and offset query params', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ id: 'hotel-010' }]])
        .mockResolvedValueOnce([[{ total: 9 }]])
        .mockResolvedValueOnce([[
          {
            id: 484,
            hotel_id: 'hotel-010',
            image_url: 'https://images.unsplash.com/photo-4?w=800',
            display_order: 4,
            created_at: '2026-05-01T11:08:29.000Z',
          },
        ]]);

      const res = await request(app.callback())
        .get('/api/hotel/d774492212eb250967af62f4bb555dc7/images?limit=1&offset=3')
        .expect(200);

      expect(res.body.images).toHaveLength(1);
      expect(res.body.pagination).toEqual({
        limit: 1,
        offset: 3,
        total: 9,
      });
    });

    it('should cap limit at 100', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ id: 'hotel-010' }]])
        .mockResolvedValueOnce([[{ total: 0 }]])
        .mockResolvedValueOnce([[]]);

      const res = await request(app.callback())
        .get('/api/hotel/d774492212eb250967af62f4bb555dc7/images?limit=500')
        .expect(200);

      expect(res.body.pagination.limit).toBe(100);
    });

    it('should handle new schema with cdn_url and full metadata', async () => {
      mockQuery
        .mockResolvedValueOnce([[{ id: 'hotel-010' }]])
        .mockResolvedValueOnce([[{ total: 1 }]])
        .mockResolvedValueOnce([[
          {
            id: 'img-uuid-001',
            hotel_id: 'hotel-010',
            image_key: 'mk-images/abc123/1.jpg',
            cdn_url: 'https://mk-images.wasabisys.com/mk-images/abc123/1.jpg',
            file_name: 'lobby.jpg',
            file_size: 204800,
            mime_type: 'image/jpeg',
            uploaded_by: 'agent-010',
            is_primary: 1,
            image_number: 1,
            display_order: 1,
            created_at: '2026-05-01T12:00:00.000Z',
            updated_at: '2026-05-01T12:00:00.000Z',
          },
        ]]);

      const res = await request(app.callback())
        .get('/api/hotel/d774492212eb250967af62f4bb555dc7/images?limit=10')
        .expect(200);

      expect(res.body.images[0]).toMatchObject({
        id: 'img-uuid-001',
        hotelId: 'hotel-010',
        cdnUrl: 'https://mk-images.wasabisys.com/mk-images/abc123/1.jpg',
        fileName: 'lobby.jpg',
        fileSize: 204800,
        mimeType: 'image/jpeg',
        isPrimary: true,
        imageNumber: 1,
        displayOrder: 1,
      });
    });
  });

  describe('DELETE /api/hotel/:hotelId/images/:imageId', () => {
    it('should delete an image when authenticated as owner', async () => {
      // Mock: image exists for this hotel
      mockQuery.mockResolvedValueOnce([[{ id: 'img-001' }]]);

      const res = await request(app.callback())
        .delete('/api/hotel/hotel-010/images/img-001')
        .set('Authorization', 'Bearer valid-agent-token')
        .expect(200);

      expect(res.body.message).toBe('Image deleted successfully');
    });

    it('should return 401 without auth token', async () => {
      const res = await request(app.callback())
        .delete('/api/hotel/hotel-010/images/img-001')
        .expect(401);

      expect(res.body.error).toBeDefined();
    });

    it('should return 404 when image does not exist', async () => {
      mockQuery.mockResolvedValueOnce([[]]); // no image found

      const res = await request(app.callback())
        .delete('/api/hotel/hotel-010/images/nonexistent')
        .set('Authorization', 'Bearer valid-agent-token')
        .expect(404);

      expect(res.body.error).toBe('Image not found');
    });
  });

  describe('PUT /api/hotel/:hotelId/images/:imageId/primary', () => {
    it('should set an image as primary', async () => {
      const res = await request(app.callback())
        .put('/api/hotel/hotel-010/images/img-001/primary')
        .set('Authorization', 'Bearer valid-agent-token')
        .expect(200);

      expect(res.body.message).toBe('Primary image set successfully');
      expect(res.body.image.isPrimary).toBe(true);
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.callback())
        .put('/api/hotel/hotel-010/images/img-001/primary')
        .expect(401);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('PUT /api/hotel/:hotelId/images/reorder', () => {
    it('should reorder images', async () => {
      const res = await request(app.callback())
        .put('/api/hotel/hotel-010/images/reorder')
        .set('Authorization', 'Bearer valid-agent-token')
        .send({ imageIds: ['img-002', 'img-001'] })
        .expect(200);

      expect(res.body.message).toBe('Images reordered successfully');
      expect(res.body.images).toHaveLength(2);
      expect(res.body.images[0].displayOrder).toBe(1);
      expect(res.body.images[1].displayOrder).toBe(2);
    });

    it('should return 400 with empty imageIds', async () => {
      const res = await request(app.callback())
        .put('/api/hotel/hotel-010/images/reorder')
        .set('Authorization', 'Bearer valid-agent-token')
        .send({ imageIds: [] })
        .expect(400);

      expect(res.body.error).toContain('non-empty array');
    });

    it('should return 400 without imageIds field', async () => {
      const res = await request(app.callback())
        .put('/api/hotel/hotel-010/images/reorder')
        .set('Authorization', 'Bearer valid-agent-token')
        .send({})
        .expect(400);

      expect(res.body.error).toContain('non-empty array');
    });

    it('should return 401 without auth', async () => {
      const res = await request(app.callback())
        .put('/api/hotel/hotel-010/images/reorder')
        .send({ imageIds: ['img-001', 'img-002'] })
        .expect(401);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/hotel/images (multi-hotel)', () => {
    it('should return 400 without hotelIds param', async () => {
      const res = await request(app.callback())
        .get('/api/hotel/images')
        .expect(400);

      expect(res.body.error).toContain('hotelIds parameter is required');
    });

    it('should return images grouped by hotel MD5', async () => {
      const md5_1 = 'aaaa1111bbbb2222cccc3333dddd4444';
      const md5_2 = 'eeee5555ffff6666aaaa7777bbbb8888';

      // Mock: find hotels by MD5 hashes
      mockQuery.mockResolvedValueOnce([[
        { id: 'hotel-001', hotel_id_md5: md5_1 },
        { id: 'hotel-002', hotel_id_md5: md5_2 },
      ]]);

      // Mock getMultipleHotelsImages via the already-mocked module
      const hotelImagesService = require('../services/hotel-images.service');
      const imagesMap = new Map();
      imagesMap.set('hotel-001', [
        {
          id: 'img-a',
          cdnUrl: 'https://example.com/a.jpg',
          fileName: 'a.jpg',
          fileSize: 1024,
          mimeType: 'image/jpeg',
          isPrimary: true,
          createdAt: new Date(),
        },
      ]);
      imagesMap.set('hotel-002', []);
      (hotelImagesService.getMultipleHotelsImages as jest.Mock).mockResolvedValueOnce(imagesMap);

      const res = await request(app.callback())
        .get(`/api/hotel/images?hotelIds=${md5_1},${md5_2}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data[md5_1]).toHaveLength(1);
      expect(res.body.data[md5_2]).toHaveLength(0);
      expect(res.body.data[md5_1][0].cdnUrl).toBe('https://example.com/a.jpg');
    });
  });
});
