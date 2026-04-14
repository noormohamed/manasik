"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_cors_1 = __importDefault(require("koa-cors"));
const api_routes_1 = require("../routes/api.routes");
const error_1 = require("../middleware/error");
const response_1 = require("../middleware/response");
const UserRepositoryModule = __importStar(require("../database/repositories/user.repository"));
// Mock the database connection
jest.mock('../database/connection', () => ({
    initializeDatabase: jest.fn().mockResolvedValue(undefined),
    getPool: jest.fn(),
}));
describe('Auth API Endpoints', () => {
    let accessToken;
    let refreshToken;
    let app;
    let mockUserRepository;
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
        app = new koa_1.default();
        app.use(error_1.errorHandler);
        app.use((0, koa_cors_1.default)());
        app.use((0, koa_bodyparser_1.default)());
        app.use(response_1.responseWrapper);
        const apiRouter = (0, api_routes_1.createApiRouter)();
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
        it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(testUser);
            const response = yield (0, supertest_1.default)(app.callback())
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
        }));
        it('should not register duplicate email', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserRepository.findByEmail.mockResolvedValue(testUser);
            const response = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/register')
                .send({
                email: testUser.email,
                password: 'password123',
                firstName: testUser.first_name,
                lastName: testUser.last_name,
            })
                .expect(409);
            expect(response.body).toHaveProperty('error', 'User already exists');
        }));
        it('should not register with missing fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/register')
                .send({ email: testUser.email })
                .expect(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /api/auth/login', () => {
        it('should login user with correct credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserRepository.findByEmail.mockResolvedValue(testUser);
            const response = yield (0, supertest_1.default)(app.callback())
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
        }));
        it('should not login with wrong email', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserRepository.findByEmail.mockResolvedValue(null);
            const response = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/login')
                .send({
                email: 'wrong@example.com',
                password: 'password123',
            })
                .expect(401);
            expect(response.body).toHaveProperty('error', 'Invalid credentials');
        }));
        it('should not login with missing fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/login')
                .send({ email: testUser.email })
                .expect(400);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('GET /api/auth/me', () => {
        it('should get current user with valid token', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserRepository.findByEmail.mockResolvedValue(testUser);
            mockUserRepository.findById.mockResolvedValue(testUser);
            // First login to get token
            const loginResponse = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: 'password123',
            });
            const token = loginResponse.body.data.tokens.accessToken;
            // Then use token to get user
            const response = yield (0, supertest_1.default)(app.callback())
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body.data.user).toHaveProperty('email', testUser.email);
            expect(response.body.data.user).toHaveProperty('role', 'CUSTOMER');
            // Verify findById was called (the ID will be from the token payload)
            expect(mockUserRepository.findById).toHaveBeenCalled();
            const findByIdCall = mockUserRepository.findById.mock.calls[0][0];
            expect(findByIdCall).toBeDefined();
        }));
        it('should not get user without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app.callback())
                .get('/api/auth/me')
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
        it('should not get user with invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app.callback())
                .get('/api/auth/me')
                .set('Authorization', 'Bearer invalid_token')
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /api/auth/refresh', () => {
        it('should refresh access token with valid refresh token', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserRepository.findByEmail.mockResolvedValue(testUser);
            mockUserRepository.findById.mockResolvedValue(testUser);
            // First login to get refresh token
            const loginResponse = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: 'password123',
            });
            const token = loginResponse.body.data.tokens.refreshToken;
            // Then refresh
            const response = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/refresh')
                .send({ refreshToken: token })
                .expect(200);
            expect(response.body.data).toHaveProperty('message', 'Token refreshed');
            expect(response.body.data.tokens).toHaveProperty('accessToken');
        }));
        it('should not refresh with invalid token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/refresh')
                .send({ refreshToken: 'invalid_token' })
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('POST /api/auth/logout', () => {
        it('should logout user with valid token', () => __awaiter(void 0, void 0, void 0, function* () {
            mockUserRepository.findByEmail.mockResolvedValue(testUser);
            // First login to get token
            const loginResponse = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/login')
                .send({
                email: testUser.email,
                password: 'password123',
            });
            const token = loginResponse.body.data.tokens.accessToken;
            // Then logout
            const response = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
            expect(response.body.data).toHaveProperty('message', 'Logout successful');
        }));
        it('should not logout without token', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app.callback())
                .post('/api/auth/logout')
                .expect(401);
            expect(response.body).toHaveProperty('error');
        }));
    });
    describe('GET /api/health', () => {
        it('should return health status', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app.callback())
                .get('/api/health')
                .expect(200);
            expect(response.body.data).toHaveProperty('status', 'ok');
            expect(response.body.data).toHaveProperty('features');
        }));
    });
});
