"use strict";
/**
 * Permission Service - Role-based access control
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionService = exports.PermissionService = void 0;
class PermissionService {
    /**
     * Get permissions for a role
     */
    getPermissionsByRole(role) {
        const rolePermissions = {
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
    hasPermission(user, permission) {
        const permissions = this.getPermissionsByRole(user.role);
        return permissions.includes(permission);
    }
    /**
     * Check if user can access resource
     */
    canAccessResource(user, resourceType, action) {
        const permission = `${resourceType}:${action}`;
        return this.hasPermission(user, permission);
    }
    /**
     * Check if user can access company resource
     */
    canAccessCompanyResource(user, companyId) {
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
    canAccessUserResource(user, targetUserId, targetUserCompanyId) {
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
    canManageAgents(user) {
        return user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN';
    }
    /**
     * Check if user can manage company
     */
    canManageCompany(user) {
        return user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN';
    }
    /**
     * Check if user can manage hotels
     */
    canManageHotels(user) {
        return user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN' || user.role === 'AGENT';
    }
    /**
     * Check if user can view analytics
     */
    canViewAnalytics(user) {
        return user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN' || user.role === 'AGENT';
    }
}
exports.PermissionService = PermissionService;
exports.permissionService = new PermissionService();
