import request from 'supertest';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import { createApiRouter } from '../routes/api.routes';
import { errorHandler } from '../middleware/error';
import { responseWrapper } from '../middleware/response';
import * as UserRepositoryModule from '../database/repositories/user.repository';
import { User } from '../models/user';

// Mock the database connection
jest.mock('../database/connection', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
  getPool: jest.fn(),
}));

describe('Auth API Endpoints', () => {
  let accessToken: string;
  let refreshToken: string;
  let app: Koa;
  let mockUserRepository: any;
  
  const testUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    password_hash: 'hashed_password',
    first_name: 'Test',
    last_name: 'User',
    role: 'CUSTOMER',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
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
    // Mock UserRepository
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    jest.spyOn(UserRepositoryModule, 'UserRepository').mockImplementation(() => mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(testUser);

      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: 'password123',
          firstName: testUser.first_name,
          lastName: testUser.last_name,
        })
        .expect(201);

      expect(response.body.data).toHaveProperty('message', 'User registered successfully');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(mockUserRepository.create).toHaveBeenCalled();
      
      // Verify the create was called with correct user data
      const createCall = mockUserRepository.create.mock.calls[0][0];
      expect(createCall.email).toBe(testUser.email);
      expect(createCall.first_name).toBe(testUser.first_name);
      expect(createCall.last_name).toBe(testUser.last_name);
      expect(createCall.role).toBe('CUSTOMER');
      expect(createCall.is_active).toBe(true);
      expect(createCall.password_hash).toBeDefined();
    });

    it('should not register duplicate email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);

      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          password: 'password123',
          firstName: testUser.first_name,
          lastName: testUser.last_name,
        })
        .expect(409);

      expect(response.body).toHaveProperty('error', 'User already exists');
    });

    it('should not register with missing fields', async () => {
      const response = await request(app.callback())
        .post('/api/auth/register')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);

      const response = await request(app.callback())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('message', 'Login successful');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');

      // Verify findByEmail was called with correct email
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(testUser.email);

      accessToken = response.body.data.tokens.accessToken;
      refreshToken = response.body.data.tokens.refreshToken;
    });

    it('should not login with wrong email', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(null);

      const response = await request(app.callback())
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should not login with missing fields', async () => {
      const response = await request(app.callback())
        .post('/api/auth/login')
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user with valid token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockUserRepository.findById.mockResolvedValue(testUser);

      // First login to get token
      const loginResponse = await request(app.callback())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        });

      const token = loginResponse.body.data.tokens.accessToken;

      // Then use token to get user
      const response = await request(app.callback())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).toHaveProperty('role', 'CUSTOMER');
      
      // Verify findById was called (the ID will be from the token payload)
      expect(mockUserRepository.findById).toHaveBeenCalled();
      const findByIdCall = mockUserRepository.findById.mock.calls[0][0];
      expect(findByIdCall).toBeDefined();
    });

    it('should not get user without token', async () => {
      const response = await request(app.callback())
        .get('/api/auth/me')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should not get user with invalid token', async () => {
      const response = await request(app.callback())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);
      mockUserRepository.findById.mockResolvedValue(testUser);

      // First login to get refresh token
      const loginResponse = await request(app.callback())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        });

      const token = loginResponse.body.data.tokens.refreshToken;

      // Then refresh
      const response = await request(app.callback())
        .post('/api/auth/refresh')
        .send({ refreshToken: token })
        .expect(200);

      expect(response.body.data).toHaveProperty('message', 'Token refreshed');
      expect(response.body.data.tokens).toHaveProperty('accessToken');
    });

    it('should not refresh with invalid token', async () => {
      const response = await request(app.callback())
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid_token' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user with valid token', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(testUser);

      // First login to get token
      const loginResponse = await request(app.callback())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123',
        });

      const token = loginResponse.body.data.tokens.accessToken;

      // Then logout
      const response = await request(app.callback())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('message', 'Logout successful');
    });

    it('should not logout without token', async () => {
      const response = await request(app.callback())
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app.callback())
        .get('/api/health')
        .expect(200);

      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body.data).toHaveProperty('features');
    });
  });
});
