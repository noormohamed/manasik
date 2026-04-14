"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(u) {
        this.is_active = true;
        this.created_at = new Date();
        this.updated_at = new Date();
        this.id = u;
    }
    save() {
        // TODO: Implement persistence
    }
    get() {
        // TODO: Implement retrieval
    }
    /**
     * Check if user has permission for a resource action
     */
    hasPermission(resource, action) {
        // TODO: Implement permission checking based on role
        return true;
    }
    /**
     * Get user's company ID (for agents and company admins)
     */
    getCompanyId() {
        return this.company_id;
    }
    /**
     * Check if user is an agent
     */
    isAgent() {
        return this.role === 'AGENT';
    }
    /**
     * Check if user is a company admin
     */
    isCompanyAdmin() {
        return this.role === 'COMPANY_ADMIN';
    }
    /**
     * Check if user is a super admin
     */
    isSuperAdmin() {
        return this.role === 'SUPER_ADMIN';
    }
}
exports.User = User;
