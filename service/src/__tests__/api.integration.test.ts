/**
 * API Integration Tests
 * Tests for authentication, authorization, and API endpoints
 */

import { authService } from '../services/auth.service';
import { permissionService } from '../services/permission.service';
import { User } from '../models/user';
import { UserRole } from '../typing/roles';

describe('API Integration Tests', () => {
  describe('Authentication Flow', () => {
    it('should complete full authentication flow', async () => {
      // 1. Create user
      const user = new User('user-123');
      user.first_name = 'John';
      user.last_name = 'Doe';
      user.email = 'john@example.com';
      user.role = 'CUSTOMER' as UserRole;

      // 2. Hash password
      const password = 'SecurePassword123!';
      const passwordHash = await authService.hashPassword(password);
      expect(passwordHash).toBeDefined();

      // 3. Generate tokens
      const { accessToken, refreshToken } = authService.generateTokens(user);
      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();

      // 4. Verify access token
      const payload = authService.verifyAccessToken(accessToken);
      expect(payload?.userId).toBe('user-123');
      expect(payload?.email).toBe('john@example.com');

      // 5. Verify refresh token
      const refreshPayload = authService.verifyRefreshToken(refreshToken);
      expect(refreshPayload?.userId).toBe('user-123');

      // 6. Compare password
      const isPasswordValid = await authService.comparePassword(password, passwordHash);
      expect(isPasswordValid).toBe(true);
    });

    it('should handle invalid credentials', async () => {
      const password = 'SecurePassword123!';
      const hash = await authService.hashPassword(password);

      const isValid = await authService.comparePassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should extract token from authorization header', () => {
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';
      const authHeader = `Bearer ${token}`;

      const extracted = authService.extractToken(authHeader);
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

      expect(permissionService.canAccessResource(user, 'user', 'delete')).toBe(true);
      expect(permissionService.canAccessResource(user, 'company', 'delete')).toBe(true);
      expect(permissionService.canAccessResource(user, 'admin', 'delete')).toBe(true);
      expect(permissionService.canManageAgents(user)).toBe(true);
      expect(permissionService.canManageCompany(user)).toBe(true);
      expect(permissionService.canManageHotels(user)).toBe(true);
      expect(permissionService.canViewAnalytics(user)).toBe(true);
    });

    it('should access any company resource', () => {
      const user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'SUPER_ADMIN',
      };

      expect(permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
      expect(permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(true);
    });

    it('should access any user resource', () => {
      const user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'SUPER_ADMIN',
      };

      expect(permissionService.canAccessUserResource(user, 'user-456')).toBe(true);
      expect(permissionService.canAccessUserResource(user, 'user-789')).toBe(true);
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

      expect(permissionService.canAccessResource(user, 'user', 'read')).toBe(true);
      expect(permissionService.canAccessResource(user, 'user', 'delete')).toBe(false);
      expect(permissionService.canAccessResource(user, 'company', 'update')).toBe(true);
      expect(permissionService.canAccessResource(user, 'company', 'delete')).toBe(false);
      expect(permissionService.canManageAgents(user)).toBe(true);
      expect(permissionService.canManageCompany(user)).toBe(true);
    });

    it('should only access their own company', () => {
      const user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'COMPANY_ADMIN',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
      expect(permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(false);
    });

    it('should only access users in their company', () => {
      const user = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'COMPANY_ADMIN',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessUserResource(user, 'user-456', 'comp-123')).toBe(true);
      expect(permissionService.canAccessUserResource(user, 'user-456', 'comp-456')).toBe(false);
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

      expect(permissionService.canAccessResource(user, 'hotel', 'create')).toBe(true);
      expect(permissionService.canAccessResource(user, 'booking', 'read')).toBe(true);
      expect(permissionService.canAccessResource(user, 'user', 'delete')).toBe(false);
      expect(permissionService.canAccessResource(user, 'admin', 'read')).toBe(false);
      expect(permissionService.canManageHotels(user)).toBe(true);
      expect(permissionService.canManageAgents(user)).toBe(false);
    });

    it('should only access their own company', () => {
      const user = {
        userId: 'agent-123',
        email: 'agent@example.com',
        role: 'AGENT',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
      expect(permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(false);
    });
  });

  describe('Authorization Flow - CUSTOMER', () => {
    it('should have customer permissions', () => {
      const user = {
        userId: 'customer-123',
        email: 'customer@example.com',
        role: 'CUSTOMER',
      };

      expect(permissionService.canAccessResource(user, 'booking', 'create')).toBe(true);
      expect(permissionService.canAccessResource(user, 'review', 'create')).toBe(true);
      expect(permissionService.canAccessResource(user, 'hotel', 'read')).toBe(true);
      expect(permissionService.canAccessResource(user, 'hotel', 'delete')).toBe(false);
      expect(permissionService.canAccessResource(user, 'admin', 'read')).toBe(false);
      expect(permissionService.canManageHotels(user)).toBe(false);
    });

    it('should only access their own profile', () => {
      const user = {
        userId: 'customer-123',
        email: 'customer@example.com',
        role: 'CUSTOMER',
      };

      expect(permissionService.canAccessUserResource(user, 'customer-123')).toBe(true);
      expect(permissionService.canAccessUserResource(user, 'customer-456')).toBe(false);
    });
  });

  describe('Token Lifecycle', () => {
    it('should handle token refresh', () => {
      const user = new User('user-123');
      user.email = 'user@example.com';
      user.role = 'CUSTOMER';

      // Generate initial tokens
      const { refreshToken: initialRefreshToken } = authService.generateTokens(user);

      // Verify refresh token
      const refreshPayload = authService.verifyRefreshToken(initialRefreshToken);
      expect(refreshPayload).toBeDefined();

      // Generate new tokens using refresh token
      if (refreshPayload) {
        const newUser = new User(refreshPayload.userId);
        newUser.email = refreshPayload.email;
        newUser.role = refreshPayload.role as UserRole;

        const { accessToken: newAccessToken } = authService.generateTokens(newUser);
        const newPayload = authService.verifyAccessToken(newAccessToken);

        expect(newPayload?.userId).toBe('user-123');
      }
    });

    it('should handle invalid token gracefully', () => {
      const payload = authService.verifyAccessToken('invalid.token.format');
      expect(payload).toBeNull();

      const decoded = authService.decodeToken('invalid.token.format');
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
      expect(permissionService.canManageHotels(agent)).toBe(true);
      expect(permissionService.canAccessCompanyResource(agent, 'hotel-comp-123')).toBe(true);

      // Agent cannot manage other companies
      expect(permissionService.canAccessCompanyResource(agent, 'taxi-comp-456')).toBe(false);

      // Agent cannot manage agents
      expect(permissionService.canManageAgents(agent)).toBe(false);
    });

    it('should handle company admin with multiple agents', () => {
      const admin = {
        userId: 'admin-123',
        email: 'admin@example.com',
        role: 'COMPANY_ADMIN',
        companyId: 'comp-123',
      };

      // Admin can manage agents
      expect(permissionService.canManageAgents(admin)).toBe(true);

      // Admin can access company resources
      expect(permissionService.canAccessCompanyResource(admin, 'comp-123')).toBe(true);

      // Admin cannot access other companies
      expect(permissionService.canAccessCompanyResource(admin, 'comp-456')).toBe(false);

      // Admin can view analytics
      expect(permissionService.canViewAnalytics(admin)).toBe(true);
    });
  });
});
