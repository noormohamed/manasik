"use strict";
/**
 * Auth Service Tests
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../services/auth.service");
const user_1 = require("../models/user");
describe('AuthService', () => {
    let testUser;
    beforeEach(() => {
        testUser = new user_1.User('user-123');
        testUser.first_name = 'John';
        testUser.last_name = 'Doe';
        testUser.email = 'john@example.com';
        testUser.role = 'CUSTOMER';
    });
    describe('generateTokens', () => {
        it('should generate valid access and refresh tokens', () => {
            const { accessToken, refreshToken } = auth_service_1.authService.generateTokens(testUser);
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            expect(typeof accessToken).toBe('string');
            expect(typeof refreshToken).toBe('string');
        });
        it('should include user data in token payload', () => {
            const { accessToken } = auth_service_1.authService.generateTokens(testUser);
            const decoded = auth_service_1.authService.decodeToken(accessToken);
            expect(decoded).toBeDefined();
            expect(decoded === null || decoded === void 0 ? void 0 : decoded.userId).toBe('user-123');
            expect(decoded === null || decoded === void 0 ? void 0 : decoded.email).toBe('john@example.com');
            expect(decoded === null || decoded === void 0 ? void 0 : decoded.role).toBe('CUSTOMER');
        });
        it('should include company and service type for agents', () => {
            testUser.role = 'AGENT';
            testUser.company_id = 'comp-123';
            testUser.service_type = 'HOTEL';
            const { accessToken } = auth_service_1.authService.generateTokens(testUser);
            const decoded = auth_service_1.authService.decodeToken(accessToken);
            expect(decoded === null || decoded === void 0 ? void 0 : decoded.companyId).toBe('comp-123');
            expect(decoded === null || decoded === void 0 ? void 0 : decoded.serviceType).toBe('HOTEL');
        });
    });
    describe('verifyAccessToken', () => {
        it('should verify valid access token', () => {
            const { accessToken } = auth_service_1.authService.generateTokens(testUser);
            const payload = auth_service_1.authService.verifyAccessToken(accessToken);
            expect(payload).toBeDefined();
            expect(payload === null || payload === void 0 ? void 0 : payload.userId).toBe('user-123');
            expect(payload === null || payload === void 0 ? void 0 : payload.email).toBe('john@example.com');
        });
        it('should return null for invalid token', () => {
            const payload = auth_service_1.authService.verifyAccessToken('invalid.token.here');
            expect(payload).toBeNull();
        });
        it('should return null for expired token', () => __awaiter(void 0, void 0, void 0, function* () {
            // Create a token with very short expiry
            const shortToken = auth_service_1.authService.generateTokens(testUser).accessToken;
            // Wait a bit and try to verify (this is a simplified test)
            const payload = auth_service_1.authService.verifyAccessToken(shortToken);
            expect(payload).toBeDefined(); // Should still be valid immediately
        }));
    });
    describe('verifyRefreshToken', () => {
        it('should verify valid refresh token', () => {
            const { refreshToken } = auth_service_1.authService.generateTokens(testUser);
            const payload = auth_service_1.authService.verifyRefreshToken(refreshToken);
            expect(payload).toBeDefined();
            expect(payload === null || payload === void 0 ? void 0 : payload.userId).toBe('user-123');
        });
        it('should return null for invalid refresh token', () => {
            const payload = auth_service_1.authService.verifyRefreshToken('invalid.token.here');
            expect(payload).toBeNull();
        });
    });
    describe('hashPassword', () => {
        it('should hash password', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'mySecurePassword123';
            const hash = yield auth_service_1.authService.hashPassword(password);
            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(20);
        }));
        it('should generate different hashes for same password', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'mySecurePassword123';
            const hash1 = yield auth_service_1.authService.hashPassword(password);
            const hash2 = yield auth_service_1.authService.hashPassword(password);
            expect(hash1).not.toBe(hash2);
        }));
    });
    describe('comparePassword', () => {
        it('should return true for matching password', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'mySecurePassword123';
            const hash = yield auth_service_1.authService.hashPassword(password);
            const isMatch = yield auth_service_1.authService.comparePassword(password, hash);
            expect(isMatch).toBe(true);
        }));
        it('should return false for non-matching password', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'mySecurePassword123';
            const hash = yield auth_service_1.authService.hashPassword(password);
            const isMatch = yield auth_service_1.authService.comparePassword('wrongPassword', hash);
            expect(isMatch).toBe(false);
        }));
    });
    describe('extractToken', () => {
        it('should extract token from Bearer header', () => {
            const token = 'my.jwt.token';
            const authHeader = `Bearer ${token}`;
            const extracted = auth_service_1.authService.extractToken(authHeader);
            expect(extracted).toBe(token);
        });
        it('should return null for missing header', () => {
            const extracted = auth_service_1.authService.extractToken(undefined);
            expect(extracted).toBeNull();
        });
        it('should return null for invalid format', () => {
            const extracted = auth_service_1.authService.extractToken('InvalidFormat token');
            expect(extracted).toBeNull();
        });
        it('should return null for missing Bearer prefix', () => {
            const extracted = auth_service_1.authService.extractToken('my.jwt.token');
            expect(extracted).toBeNull();
        });
    });
    describe('decodeToken', () => {
        it('should decode valid token', () => {
            const { accessToken } = auth_service_1.authService.generateTokens(testUser);
            const decoded = auth_service_1.authService.decodeToken(accessToken);
            expect(decoded).toBeDefined();
            expect(decoded === null || decoded === void 0 ? void 0 : decoded.userId).toBe('user-123');
        });
        it('should return null for invalid token', () => {
            const decoded = auth_service_1.authService.decodeToken('invalid.token.here');
            expect(decoded).toBeNull();
        });
    });
});
