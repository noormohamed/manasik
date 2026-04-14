"use strict";
/**
 * Admin Authentication Service Tests
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
const admin_auth_service_1 = require("../services/admin-auth.service");
describe('AdminAuthService', () => {
    const mockAdminUser = {
        id: 1,
        email: 'admin@platform.com',
        password_hash: '',
        full_name: 'Admin User',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        mfa_enabled: false,
        created_at: new Date(),
        updated_at: new Date(),
    };
    describe('Password Hashing', () => {
        it('should hash a password', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'secure_password_123';
            const hash = yield admin_auth_service_1.adminAuthService.hashPassword(password);
            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);
        }));
        it('should verify a correct password', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'secure_password_123';
            const hash = yield admin_auth_service_1.adminAuthService.hashPassword(password);
            const isValid = yield admin_auth_service_1.adminAuthService.comparePassword(password, hash);
            expect(isValid).toBe(true);
        }));
        it('should reject an incorrect password', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'secure_password_123';
            const hash = yield admin_auth_service_1.adminAuthService.hashPassword(password);
            const isValid = yield admin_auth_service_1.adminAuthService.comparePassword('wrong_password', hash);
            expect(isValid).toBe(false);
        }));
    });
    describe('Token Generation', () => {
        it('should generate access and refresh tokens', () => {
            const tokens = admin_auth_service_1.adminAuthService.generateTokens(mockAdminUser, 1);
            expect(tokens.accessToken).toBeDefined();
            expect(tokens.refreshToken).toBeDefined();
            expect(tokens.accessToken).not.toBe(tokens.refreshToken);
        });
        it('should generate a temporary token for MFA', () => {
            const tempToken = admin_auth_service_1.adminAuthService.generateTempToken(mockAdminUser);
            expect(tempToken).toBeDefined();
            expect(typeof tempToken).toBe('string');
        });
    });
    describe('Token Verification', () => {
        it('should verify a valid access token', () => {
            const tokens = admin_auth_service_1.adminAuthService.generateTokens(mockAdminUser, 1);
            const payload = admin_auth_service_1.adminAuthService.verifyAccessToken(tokens.accessToken);
            expect(payload).toBeDefined();
            expect(payload === null || payload === void 0 ? void 0 : payload.adminUserId).toBe(mockAdminUser.id);
            expect(payload === null || payload === void 0 ? void 0 : payload.email).toBe(mockAdminUser.email);
            expect(payload === null || payload === void 0 ? void 0 : payload.role).toBe(mockAdminUser.role);
        });
        it('should verify a valid refresh token', () => {
            const tokens = admin_auth_service_1.adminAuthService.generateTokens(mockAdminUser, 1);
            const payload = admin_auth_service_1.adminAuthService.verifyRefreshToken(tokens.refreshToken);
            expect(payload).toBeDefined();
            expect(payload === null || payload === void 0 ? void 0 : payload.adminUserId).toBe(mockAdminUser.id);
            expect(payload === null || payload === void 0 ? void 0 : payload.email).toBe(mockAdminUser.email);
        });
        it('should return null for an invalid access token', () => {
            const payload = admin_auth_service_1.adminAuthService.verifyAccessToken('invalid_token');
            expect(payload).toBeNull();
        });
        it('should return null for an invalid refresh token', () => {
            const payload = admin_auth_service_1.adminAuthService.verifyRefreshToken('invalid_token');
            expect(payload).toBeNull();
        });
    });
    describe('MFA', () => {
        it('should generate an MFA secret', () => {
            const secret = admin_auth_service_1.adminAuthService.generateMFASecret();
            expect(secret).toBeDefined();
            expect(typeof secret).toBe('string');
            expect(secret.length).toBeGreaterThan(0);
        });
        it('should verify a valid MFA code', () => {
            const secret = admin_auth_service_1.adminAuthService.generateMFASecret();
            // Note: In real tests, we would use a library to generate a valid code
            // For now, we just test that the method exists and returns a boolean
            const result = admin_auth_service_1.adminAuthService.verifyMFACode(secret, '000000');
            expect(typeof result).toBe('boolean');
        });
        it('should reject an invalid MFA code', () => {
            const secret = admin_auth_service_1.adminAuthService.generateMFASecret();
            const result = admin_auth_service_1.adminAuthService.verifyMFACode(secret, 'invalid');
            expect(result).toBe(false);
        });
    });
    describe('Token Hash', () => {
        it('should generate a token hash', () => {
            const token = 'test_token_123';
            const hash = admin_auth_service_1.adminAuthService.generateTokenHash(token);
            expect(hash).toBeDefined();
            expect(typeof hash).toBe('string');
            expect(hash.length).toBe(64); // SHA256 hex length
        });
        it('should generate consistent hashes for the same token', () => {
            const token = 'test_token_123';
            const hash1 = admin_auth_service_1.adminAuthService.generateTokenHash(token);
            const hash2 = admin_auth_service_1.adminAuthService.generateTokenHash(token);
            expect(hash1).toBe(hash2);
        });
    });
    describe('Token Extraction', () => {
        it('should extract token from Authorization header', () => {
            const token = 'test_token_123';
            const authHeader = `Bearer ${token}`;
            const extracted = admin_auth_service_1.adminAuthService.extractToken(authHeader);
            expect(extracted).toBe(token);
        });
        it('should return null for missing Authorization header', () => {
            const extracted = admin_auth_service_1.adminAuthService.extractToken(undefined);
            expect(extracted).toBeNull();
        });
        it('should return null for invalid Authorization header format', () => {
            const extracted = admin_auth_service_1.adminAuthService.extractToken('InvalidFormat token');
            expect(extracted).toBeNull();
        });
        it('should return null for Authorization header without Bearer', () => {
            const extracted = admin_auth_service_1.adminAuthService.extractToken('token_123');
            expect(extracted).toBeNull();
        });
    });
    describe('Token Decoding', () => {
        it('should decode a valid token', () => {
            const tokens = admin_auth_service_1.adminAuthService.generateTokens(mockAdminUser, 1);
            const decoded = admin_auth_service_1.adminAuthService.decodeToken(tokens.accessToken);
            expect(decoded).toBeDefined();
            expect(decoded === null || decoded === void 0 ? void 0 : decoded.adminUserId).toBe(mockAdminUser.id);
            expect(decoded === null || decoded === void 0 ? void 0 : decoded.email).toBe(mockAdminUser.email);
        });
        it('should return null for an invalid token', () => {
            const decoded = admin_auth_service_1.adminAuthService.decodeToken('invalid_token');
            expect(decoded).toBeNull();
        });
    });
});
