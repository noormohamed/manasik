/**
 * Permission Service Tests
 */

import { permissionService } from '../services/permission.service';
import { JWTPayload } from '../services/auth.service';

describe('PermissionService', () => {
  describe('getPermissionsByRole', () => {
    it('should return all permissions for SUPER_ADMIN', () => {
      const permissions = permissionService.getPermissionsByRole('SUPER_ADMIN');

      expect(permissions.length).toBeGreaterThan(20);
      expect(permissions).toContain('user:read');
      expect(permissions).toContain('user:delete');
      expect(permissions).toContain('admin:delete');
    });

    it('should return limited permissions for COMPANY_ADMIN', () => {
      const permissions = permissionService.getPermissionsByRole('COMPANY_ADMIN');

      expect(permissions.length).toBeGreaterThan(10);
      expect(permissions).toContain('user:read');
      expect(permissions).toContain('company:update');
      expect(permissions).not.toContain('user:delete');
      expect(permissions).not.toContain('company:delete');
    });

    it('should return limited permissions for AGENT', () => {
      const permissions = permissionService.getPermissionsByRole('AGENT');

      expect(permissions.length).toBeGreaterThan(5);
      expect(permissions).toContain('hotel:create');
      expect(permissions).toContain('booking:read');
      expect(permissions).not.toContain('user:delete');
      expect(permissions).not.toContain('admin:read');
    });

    it('should return limited permissions for CUSTOMER', () => {
      const permissions = permissionService.getPermissionsByRole('CUSTOMER');

      expect(permissions.length).toBeGreaterThan(3);
      expect(permissions).toContain('booking:create');
      expect(permissions).toContain('review:create');
      expect(permissions).not.toContain('hotel:delete');
      expect(permissions).not.toContain('admin:read');
    });

    it('should return empty array for unknown role', () => {
      const permissions = permissionService.getPermissionsByRole('UNKNOWN_ROLE');
      expect(permissions).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'SUPER_ADMIN',
      };

      const hasPermission = permissionService.hasPermission(user, 'user:delete');
      expect(hasPermission).toBe(true);
    });

    it('should return false if user does not have permission', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      };

      const hasPermission = permissionService.hasPermission(user, 'user:delete');
      expect(hasPermission).toBe(false);
    });
  });

  describe('canAccessResource', () => {
    it('should return true for SUPER_ADMIN accessing any resource', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'SUPER_ADMIN',
      };

      expect(permissionService.canAccessResource(user, 'user', 'delete')).toBe(true);
      expect(permissionService.canAccessResource(user, 'admin', 'delete')).toBe(true);
    });

    it('should return false for CUSTOMER accessing admin resources', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      };

      expect(permissionService.canAccessResource(user, 'admin', 'read')).toBe(false);
    });

    it('should return true for CUSTOMER creating booking', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      };

      expect(permissionService.canAccessResource(user, 'booking', 'create')).toBe(true);
    });
  });

  describe('canAccessCompanyResource', () => {
    it('should return true for SUPER_ADMIN accessing any company', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'SUPER_ADMIN',
      };

      expect(permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
      expect(permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(true);
    });

    it('should return true for COMPANY_ADMIN accessing their own company', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'COMPANY_ADMIN',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
    });

    it('should return false for COMPANY_ADMIN accessing other company', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'COMPANY_ADMIN',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(false);
    });

    it('should return true for AGENT accessing their own company', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'AGENT',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessCompanyResource(user, 'comp-123')).toBe(true);
    });

    it('should return false for AGENT accessing other company', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'AGENT',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessCompanyResource(user, 'comp-456')).toBe(false);
    });
  });

  describe('canAccessUserResource', () => {
    it('should return true for SUPER_ADMIN accessing any user', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'SUPER_ADMIN',
      };

      expect(permissionService.canAccessUserResource(user, 'user-456')).toBe(true);
    });

    it('should return true for COMPANY_ADMIN accessing user in their company', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'COMPANY_ADMIN',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessUserResource(user, 'user-456', 'comp-123')).toBe(true);
    });

    it('should return false for COMPANY_ADMIN accessing user in other company', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'COMPANY_ADMIN',
        companyId: 'comp-123',
      };

      expect(permissionService.canAccessUserResource(user, 'user-456', 'comp-456')).toBe(false);
    });

    it('should return true for CUSTOMER accessing their own profile', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      };

      expect(permissionService.canAccessUserResource(user, 'user-123')).toBe(true);
    });

    it('should return false for CUSTOMER accessing other user profile', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      };

      expect(permissionService.canAccessUserResource(user, 'user-456')).toBe(false);
    });
  });

  describe('canManageAgents', () => {
    it('should return true for SUPER_ADMIN', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'SUPER_ADMIN',
      };

      expect(permissionService.canManageAgents(user)).toBe(true);
    });

    it('should return true for COMPANY_ADMIN', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'COMPANY_ADMIN',
      };

      expect(permissionService.canManageAgents(user)).toBe(true);
    });

    it('should return false for AGENT', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'AGENT',
      };

      expect(permissionService.canManageAgents(user)).toBe(false);
    });

    it('should return false for CUSTOMER', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      };

      expect(permissionService.canManageAgents(user)).toBe(false);
    });
  });

  describe('canManageHotels', () => {
    it('should return true for SUPER_ADMIN', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'SUPER_ADMIN',
      };

      expect(permissionService.canManageHotels(user)).toBe(true);
    });

    it('should return true for COMPANY_ADMIN', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'COMPANY_ADMIN',
      };

      expect(permissionService.canManageHotels(user)).toBe(true);
    });

    it('should return true for AGENT', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'AGENT',
      };

      expect(permissionService.canManageHotels(user)).toBe(true);
    });

    it('should return false for CUSTOMER', () => {
      const user: JWTPayload = {
        userId: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER',
      };

      expect(permissionService.canManageHotels(user)).toBe(false);
    });
  });
});
