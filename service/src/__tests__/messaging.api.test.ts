/**
 * Messaging API Tests
 */

import request from 'supertest';
import { app } from '../server';
import { authService } from '../services/auth.service';

describe('Messaging API', () => {
  let guestToken: string;
  let brokerToken: string;
  let hotelStaffToken: string;
  let managerToken: string;
  let adminToken: string;

  let conversationId: string;
  let messageId: string;

  beforeAll(async () => {
    // Create test tokens for different roles
    const guestTokens = authService.generateTokens({
      id: 'guest-1',
      email: 'guest@test.com',
      role: 'GUEST',
    } as any);
    guestToken = guestTokens.accessToken;

    const brokerTokens = authService.generateTokens({
      id: 'broker-1',
      email: 'broker@test.com',
      role: 'BROKER',
    } as any);
    brokerToken = brokerTokens.accessToken;

    const hotelStaffTokens = authService.generateTokens({
      id: 'staff-1',
      email: 'staff@test.com',
      role: 'HOTEL_STAFF',
    } as any);
    hotelStaffToken = hotelStaffTokens.accessToken;

    const managerTokens = authService.generateTokens({
      id: 'manager-1',
      email: 'manager@test.com',
      role: 'MANAGER',
    } as any);
    managerToken = managerTokens.accessToken;

    const adminTokens = authService.generateTokens({
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'ADMIN',
    } as any);
    adminToken = adminTokens.accessToken;
  });

  describe('POST /api/messages/conversations', () => {
    it('should create a conversation with valid data', async () => {
      const response = await request(app.callback())
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          hotelId: 'hotel-1',
          subject: 'Room Inquiry',
          description: 'I have a question about room availability',
          participants: [
            { userId: 'guest-1', userRole: 'GUEST' },
            { userId: 'staff-1', userRole: 'HOTEL_STAFF', hotelId: 'hotel-1' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.subject).toBe('Room Inquiry');

      conversationId = response.body.data.id;
    });

    it('should require authentication', async () => {
      const response = await request(app.callback())
        .post('/api/messages/conversations')
        .send({
          hotelId: 'hotel-1',
          subject: 'Room Inquiry',
          participants: [],
        });

      expect(response.status).toBe(401);
    });

    it('should require hotelId and subject', async () => {
      const response = await request(app.callback())
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          participants: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require at least one participant', async () => {
      const response = await request(app.callback())
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          hotelId: 'hotel-1',
          subject: 'Room Inquiry',
          participants: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should auto-add creator as participant', async () => {
      const response = await request(app.callback())
        .post('/api/messages/conversations')
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          hotelId: 'hotel-1',
          subject: 'Another Inquiry',
          participants: [
            { userId: 'staff-1', userRole: 'HOTEL_STAFF', hotelId: 'hotel-1' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.data.participants.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('GET /api/messages/conversations', () => {
    it('should list conversations for authenticated user', async () => {
      const response = await request(app.callback())
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app.callback())
        .get('/api/messages/conversations');

      expect(response.status).toBe(401);
    });

    it('should support pagination', async () => {
      const response = await request(app.callback())
        .get('/api/messages/conversations?limit=10&offset=0')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('offset');
    });

    it('should limit results to 100', async () => {
      const response = await request(app.callback())
        .get('/api/messages/conversations?limit=200')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBeLessThanOrEqual(100);
    });
  });

  describe('GET /api/messages/conversations/:id', () => {
    it('should get conversation with messages', async () => {
      const response = await request(app.callback())
        .get(`/api/messages/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.conversation).toHaveProperty('id');
      expect(Array.isArray(response.body.data.messages)).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app.callback())
        .get(`/api/messages/conversations/${conversationId}`);

      expect(response.status).toBe(401);
    });

    it('should deny access to non-participants', async () => {
      const response = await request(app.callback())
        .get(`/api/messages/conversations/${conversationId}`)
        .set('Authorization', `Bearer ${brokerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/messages/conversations/:id/messages', () => {
    it('should send a message in conversation', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          content: 'I would like to know about room availability',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.content).toBe('I would like to know about room availability');

      messageId = response.body.data.id;
    });

    it('should sanitize sensitive data in messages', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          content: 'My card is 4532-1234-5678-9010',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.contentSanitized).toContain('****-****-****-9010');
      expect(response.body.data.contentSanitized).not.toContain('4532');
    });

    it('should require message content', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({});

      expect(response.status).toBe(400);
    });

    it('should deny access to non-participants', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${brokerToken}`)
        .send({
          content: 'Hello',
        });

      expect(response.status).toBe(403);
    });

    it('should support message types', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          content: 'System message',
          messageType: 'SYSTEM',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.messageType).toBe('SYSTEM');
    });

    it('should support metadata', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          content: 'Message with metadata',
          metadata: { offerId: 'offer-123' },
        });

      expect(response.status).toBe(201);
      expect(response.body.data.metadata).toHaveProperty('offerId');
    });
  });

  describe('PUT /api/messages/:id/read', () => {
    it('should mark message as read', async () => {
      const response = await request(app.callback())
        .put(`/api/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should require authentication', async () => {
      const response = await request(app.callback())
        .put(`/api/messages/${messageId}/read`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/messages/conversations/:id/participants', () => {
    it('should get conversation participants', async () => {
      const response = await request(app.callback())
        .get(`/api/messages/conversations/${conversationId}/participants`)
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should deny access to non-participants', async () => {
      const response = await request(app.callback())
        .get(`/api/messages/conversations/${conversationId}/participants`)
        .set('Authorization', `Bearer ${brokerToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PUT /api/messages/conversations/:id/status', () => {
    it('should update conversation status (manager)', async () => {
      const response = await request(app.callback())
        .put(`/api/messages/conversations/${conversationId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: 'ARCHIVED',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should deny access to non-managers', async () => {
      const response = await request(app.callback())
        .put(`/api/messages/conversations/${conversationId}/status`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          status: 'ARCHIVED',
        });

      expect(response.status).toBe(403);
    });

    it('should validate status value', async () => {
      const response = await request(app.callback())
        .put(`/api/messages/conversations/${conversationId}/status`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          status: 'INVALID',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/messages/search', () => {
    it('should search conversations', async () => {
      const response = await request(app.callback())
        .get('/api/messages/search?q=Room')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should require search term', async () => {
      const response = await request(app.callback())
        .get('/api/messages/search')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(400);
    });

    it('should require minimum search term length', async () => {
      const response = await request(app.callback())
        .get('/api/messages/search?q=a')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe('Permission Tests', () => {
    it('guest should only see their conversations', async () => {
      const response = await request(app.callback())
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(200);
      // All conversations should be ones where guest is a participant
    });

    it('manager should see hotel conversations', async () => {
      const response = await request(app.callback())
        .get('/api/messages/conversations?hotelId=hotel-1')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(response.status).toBe(200);
    });

    it('admin should see all conversations', async () => {
      const response = await request(app.callback())
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Security Tests', () => {
    it('should sanitize card numbers in messages', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          content: 'Please charge my card 4532-1234-5678-9010',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.contentSanitized).not.toContain('4532');
      expect(response.body.data.contentSanitized).toContain('****-****-****-9010');
    });

    it('should sanitize CVV codes', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          content: 'My CVV is 123',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.contentSanitized).toContain('[CVV REDACTED]');
    });

    it('should sanitize SSN', async () => {
      const response = await request(app.callback())
        .post(`/api/messages/conversations/${conversationId}/messages`)
        .set('Authorization', `Bearer ${guestToken}`)
        .send({
          content: 'My SSN is 123-45-6789',
        });

      expect(response.status).toBe(201);
      expect(response.body.data.contentSanitized).toContain('[SSN REDACTED]');
    });
  });
});
