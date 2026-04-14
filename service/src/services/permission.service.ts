/**
 * Permission Service - Role-based access control
 */

import { JWTPayload } from './auth.service';

export type Permission = 
  | 'user:read'
  | 'user:create'
  | 'user:update'
  | 'user:delete'
  | 'company:read'
  | 'company:create'
  | 'company:update'
  | 'company:delete'
  | 'agent:read'
  | 'agent:create'
  | 'agent:update'
  | 'agent:delete'
  | 'hotel:read'
  | 'hotel:create'
  | 'hotel:update'
  | 'hotel:delete'
  | 'booking:read'
  | 'booking:create'
  | 'booking:update'
  | 'booking:delete'
  | 'review:read'
  | 'review:create'
  | 'review:update'
  | 'review:delete'
  | 'admin:read'
  | 'admin:create'
  | 'admin:update'
  | 'admin:delete';

export class PermissionService {
  /**
   * Get permissions for a role
   */
  getPermissionsByRole(role: string): Permission[] {
    const rolePermissions: Record<string, Permission[]> = {
      SUPER_ADMIN: [
        'user:read', 'user:create', 'user:update', 'user:delete',
        'company:read', 'company:create', 'company:update', 'company:delete',
        'agent:read', 'agent:create', 'agent:update', 'agent:delete',
        'hotel:read', 'hotel:create', 'hotel:update', 'hotel:delete',
        'booking:read', 'booking:create', 'booking:update', 'booking:delete',
        'review:read', 'review:create', 'review:update', 'review:delete',
        'admin:read', 'admin:create', 'admin:update', 'admin:delete',
      ],
      COMPANY_ADMIN: [
        'user:read', 'user:create', 'user:update',
        'company:read', 'company:update',
        'agent:read', 'agent:create', 'agent:update',
        'hotel:read', 'hotel:create', 'hotel:update',
        'booking:read',
        'review:read',
        'admin:read', 'admin:update',
      ],
      AGENT: [
        'user:read', 'user:update',
        'company:read',
        'agent:read', 'agent:update',
        'hotel:read', 'hotel:create', 'hotel:update',
        'booking:read',
        'review:read',
      ],
      CUSTOMER: [
        'user:read', 'user:update',
        'hotel:read',
        'booking:read', 'booking:create',
        'review:read', 'review:create',
      ],
    };

    return rolePermissions[role] || [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(user: JWTPayload, permission: Permission): boolean {
    const permissions = this.getPermissionsByRole(user.role);
    return permissions.includes(permission);
  }

  /**
   * Check if user can access resource
   */
  canAccessResource(user: JWTPayload, resourceType: string, action: string): boolean {
    const permission = `${resourceType}:${action}` as Permission;
    return this.hasPermission(user, permission);
  }

  /**
   * Check if user can access company resource
   */
  canAccessCompanyResource(user: JWTPayload, companyId: string): boolean {
    // SUPER_ADMIN can access any company
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // COMPANY_ADMIN can only access their own company
    if (user.role === 'COMPANY_ADMIN') {
      return user.companyId === companyId;
    }

    // AGENT can only access their own company
    if (user.role === 'AGENT') {
      return user.companyId === companyId;
    }

    return false;
  }

  /**
   * Check if user can access user resource
   */
  canAccessUserResource(user: JWTPayload, targetUserId: string, targetUserCompanyId?: string): boolean {
    // SUPER_ADMIN can access any user
    if (user.role === 'SUPER_ADMIN') {
      return true;
    }

    // COMPANY_ADMIN can access users in their company
    if (user.role === 'COMPANY_ADMIN') {
      return user.companyId === targetUserCompanyId;
    }

    // Users can only access their own profile
    if (user.role === 'CUSTOMER' || user.role === 'AGENT') {
      return user.userId === targetUserId;
    }

    return false;
  }

  /**
   * Check if user can manage agents
   */
  canManageAgents(user: JWTPayload): boolean {
    return user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN';
  }

  /**
   * Check if user can manage company
   */
  canManageCompany(user: JWTPayload): boolean {
    return user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN';
  }

  /**
   * Check if user can manage hotels
   */
  canManageHotels(user: JWTPayload): boolean {
    return user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN' || user.role === 'AGENT';
  }

  /**
   * Check if user can view analytics
   */
  canViewAnalytics(user: JWTPayload): boolean {
    return user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN' || user.role === 'AGENT';
  }
}

export const permissionService = new PermissionService();
