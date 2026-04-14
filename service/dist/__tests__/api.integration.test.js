"use strict";
/**
 * API Integration Tests
 * Tests for authentication, authorization, and API endpoints
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
const permission_service_1 = require("../services/permission.service");
const user_1 = require("../models/user");
describe('API Integration Tests', () => {
    describe('Authentication Flow', () => {
        it('should complete full authentication flow', () => __awaiter(void 0, void 0, void 0, function* () {
            // 1. Create user
            const user = new user_1.User('user-123');
            user.first_name = 'John';
            user.last_name = 'Doe';
            user.email = 'john@example.com';
            user.role = 'CUSTOMER';
            // 2. Hash password
            const password = 'SecurePassword123!';
            const passwordHash = yield auth_service_1.authService.hashPassword(password);
            expect(passwordHash).toBeDefined();
            // 3. Generate tokens
            const { accessToken, refreshToken } = auth_service_1.authService.generateTokens(user);
            expect(accessToken).toBeDefined();
            expect(refreshToken).toBeDefined();
            // 4. Verify access token
            const payload = auth_service_1.authService.verifyAccessToken(accessToken);
            expect(payload === null || payload === void 0 ? void 0 : payload.userId).toBe('user-123');
            expect(payload === null || payload === void 0 ? void 0 : payload.email).toBe('john@example.com');
            // 5. Verify refresh token
            const refreshPayload = auth_service_1.authService.verifyRefreshToken(refreshToken);
            expect(refreshPayload === null || refreshPayload === void 0 ? void 0 : refreshPayload.userId).toBe('user-123');
            // 6. Compare password
            const isPasswordValid = yield auth_service_1.authService.comparePassword(password, passwordHash);
            expect(isPasswordValid).toBe(true);
        }));
        it('should handle invalid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const password = 'SecurePassword123!';
            const hash = yield auth_service_1.authService.hashPassword(password);
            const isValid = yield auth_service_1.authService.comparePassword('WrongPassword', hash);
            expect(isValid).toBe(false);
        }));
        it('should extract token from authorization header', () => {
            const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
            const authHeader = `Bearer ${token}`;
            const extracted = auth_service_1.authService.extractToken(authHeader);
            expect(extracted).toBe(token);
        });
    });
    describe('Authorization Flow - SUPER_ADMIN', () => {
        it('should have all permissions', () => {
            const user = {
                userId: 'admin-123',
                email: 'admin@example.com',
                role: 'SUPER_ADMIN',
            };
            expect(permission_service_1.permissionService.canAccessResource(user, 'user', 'delete')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'company', 'delete')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'admin', 'delete')).toBe(true);
            expect(permission_service_1.permissionService.canManageAgents(user)).toBe(true);
            expect(permission_service_1.permissionService.canManageCompany(user)).toBe(true);
            expect(permission_service_1.permissionService.canManageHotels(user)).toBe(true);
            expect(permission_service_1.permissionService.canViewAnalytics(user)).toBe(true);
        });
        it('should access any company resource', () => {
            const user = {
                userId: 'admin-123',
                email: 'admin@example.com',
                role: 'SUPER_ADMIN',
            };
            expect(permission_service_1.permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
            expect(permission_service_1.permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(true);
        });
        it('should access any user resource', () => {
            const user = {
                userId: 'admin-123',
                email: 'admin@example.com',
                role: 'SUPER_ADMIN',
            };
            expect(permission_service_1.permissionService.canAccessUserResource(user, 'user-456')).toBe(true);
            expect(permission_service_1.permissionService.canAccessUserResource(user, 'user-789')).toBe(true);
        });
    });
    describe('Authorization Flow - COMPANY_ADMIN', () => {
        it('should have limited permissions', () => {
            const user = {
                userId: 'admin-123',
                email: 'admin@example.com',
                role: 'COMPANY_ADMIN',
                companyId: 'comp-123',
            };
            expect(permission_service_1.permissionService.canAccessResource(user, 'user', 'read')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'user', 'delete')).toBe(false);
            expect(permission_service_1.permissionService.canAccessResource(user, 'company', 'update')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'company', 'delete')).toBe(false);
            expect(permission_service_1.permissionService.canManageAgents(user)).toBe(true);
            expect(permission_service_1.permissionService.canManageCompany(user)).toBe(true);
        });
        it('should only access their own company', () => {
            const user = {
                userId: 'admin-123',
                email: 'admin@example.com',
                role: 'COMPANY_ADMIN',
                companyId: 'comp-123',
            };
            expect(permission_service_1.permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
            expect(permission_service_1.permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(false);
        });
        it('should only access users in their company', () => {
            const user = {
                userId: 'admin-123',
                email: 'admin@example.com',
                role: 'COMPANY_ADMIN',
                companyId: 'comp-123',
            };
            expect(permission_service_1.permissionService.canAccessUserResource(user, 'user-456', 'comp-123')).toBe(true);
            expect(permission_service_1.permissionService.canAccessUserResource(user, 'user-456', 'comp-456')).toBe(false);
        });
    });
    describe('Authorization Flow - AGENT', () => {
        it('should have agent permissions', () => {
            const user = {
                userId: 'agent-123',
                email: 'agent@example.com',
                role: 'AGENT',
                companyId: 'comp-123',
                serviceType: 'HOTEL',
            };
            expect(permission_service_1.permissionService.canAccessResource(user, 'hotel', 'create')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'booking', 'read')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'user', 'delete')).toBe(false);
            expect(permission_service_1.permissionService.canAccessResource(user, 'admin', 'read')).toBe(false);
            expect(permission_service_1.permissionService.canManageHotels(user)).toBe(true);
            expect(permission_service_1.permissionService.canManageAgents(user)).toBe(false);
        });
        it('should only access their own company', () => {
            const user = {
                userId: 'agent-123',
                email: 'agent@example.com',
                role: 'AGENT',
                companyId: 'comp-123',
            };
            expect(permission_service_1.permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
            expect(permission_service_1.permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(false);
        });
    });
    describe('Authorization Flow - CUSTOMER', () => {
        it('should have customer permissions', () => {
            const user = {
                userId: 'customer-123',
                email: 'customer@example.com',
                role: 'CUSTOMER',
            };
            expect(permission_service_1.permissionService.canAccessResource(user, 'booking', 'create')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'review', 'create')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'hotel', 'read')).toBe(true);
            expect(permission_service_1.permissionService.canAccessResource(user, 'hotel', 'delete')).toBe(false);
            expect(permission_service_1.permissionService.canAccessResource(user, 'admin', 'read')).toBe(false);
            expect(permission_service_1.permissionService.canManageHotels(user)).toBe(false);
        });
        it('should only access their own profile', () => {
            const user = {
                userId: 'customer-123',
                email: 'customer@example.com',
                role: 'CUSTOMER',
            };
            expect(permission_service_1.permissionService.canAccessUserResource(user, 'customer-123')).toBe(true);
            expect(permission_service_1.permissionService.canAccessUserResource(user, 'customer-456')).toBe(false);
        });
    });
    describe('Token Lifecycle', () => {
        it('should handle token refresh', () => {
            const user = new user_1.User('user-123');
            user.email = 'user@example.com';
            user.role = 'CUSTOMER';
            // Generate initial tokens
            const { refreshToken: initialRefreshToken } = auth_service_1.authService.generateTokens(user);
            // Verify refresh token
            const refreshPayload = auth_service_1.authService.verifyRefreshToken(initialRefreshToken);
            expect(refreshPayload).toBeDefined();
            // Generate new tokens using refresh token
            if (refreshPayload) {
                const newUser = new user_1.User(refreshPayload.userId);
                newUser.email = refreshPayload.email;
                newUser.role = refreshPayload.role;
                const { accessToken: newAccessToken } = auth_service_1.authService.generateTokens(newUser);
                const newPayload = auth_service_1.authService.verifyAccessToken(newAccessToken);
                expect(newPayload === null || newPayload === void 0 ? void 0 : newPayload.userId).toBe('user-123');
            }
        });
        it('should handle invalid token gracefully', () => {
            const payload = auth_service_1.authService.verifyAccessToken('invalid.token.format');
            expect(payload).toBeNull();
            const decoded = auth_service_1.authService.decodeToken('invalid.token.format');
            expect(decoded).toBeNull();
        });
    });
    describe('Multi-role Scenarios', () => {
        it('should handle agent with company context', () => {
            const agent = {
                userId: 'agent-123',
                email: 'agent@example.com',
                role: 'AGENT',
                companyId: 'hotel-comp-123',
                serviceType: 'HOTEL',
            };
            // Agent can manage hotels in their company
            expect(permission_service_1.permissionService.canManageHotels(agent)).toBe(true);
            expect(permission_service_1.permissionService.canAccessCompanyResource(agent, 'hotel-comp-123')).toBe(true);
            // Agent cannot manage other companies
            expect(permission_service_1.permissionService.canAccessCompanyResource(agent, 'taxi-comp-456')).toBe(false);
            // Agent cannot manage agents
            expect(permission_service_1.permissionService.canManageAgents(agent)).toBe(false);
        });
        it('should handle company admin with multiple agents', () => {
            const admin = {
                userId: 'admin-123',
                email: 'admin@example.com',
                role: 'COMPANY_ADMIN',
                companyId: 'comp-123',
            };
            // Admin can manage agents
            expect(permission_service_1.permissionService.canManageAgents(admin)).toBe(true);
            // Admin can access company resources
            expect(permission_service_1.permissionService.canAccessCompanyResource(admin, 'comp-123')).toBe(true);
            // Admin cannot access other companies
            expect(permission_service_1.permissionService.canAccessCompanyResource(admin, 'comp-456')).toBe(false);
            // Admin can view analytics
            expect(permission_service_1.permissionService.canViewAnalytics(admin)).toBe(true);
        });
    });
});
