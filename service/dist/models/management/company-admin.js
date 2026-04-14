"use strict";
/**
 * CompanyAdmin represents a company-level administrator
 * Can manage agents, view company bookings, and handle company settings
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyAdmin = void 0;
class CompanyAdmin {
    constructor() {
        this.permissions = []; // Specific permissions beyond role
        this.isActive = true;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    // Getters
    getId() { return this.id; }
    getUserId() { return this.userId; }
    getCompanyId() { return this.companyId; }
    getAdminRole() { return this.adminRole; }
    getName() { return this.name; }
    getEmail() { return this.email; }
    getPhone() { return this.phone; }
    getPermissions() { return this.permissions; }
    isActiveAdmin() { return this.isActive; }
    getCreatedAt() { return this.createdAt; }
    getUpdatedAt() { return this.updatedAt; }
    // Setters
    setAdminRole(role) {
        this.adminRole = role;
        return this.touch();
    }
    setActive(active) {
        this.isActive = active;
        return this.touch();
    }
    addPermission(permission) {
        if (!this.permissions.includes(permission)) {
            this.permissions.push(permission);
            this.touch();
        }
        return this;
    }
    removePermission(permission) {
        this.permissions = this.permissions.filter(p => p !== permission);
        return this.touch();
    }
    hasPermission(permission) {
        return this.permissions.includes(permission);
    }
    /**
     * Check if admin can manage agents
     */
    canManageAgents() {
        return this.adminRole === 'OWNER' || this.adminRole === 'MANAGER';
    }
    /**
     * Check if admin can view all company bookings
     */
    canViewAllBookings() {
        return this.adminRole === 'OWNER' || this.adminRole === 'MANAGER';
    }
    /**
     * Check if admin can manage company settings
     */
    canManageSettings() {
        return this.adminRole === 'OWNER';
    }
    touch() {
        this.updatedAt = new Date();
        return this;
    }
    static create(params) {
        const admin = new CompanyAdmin();
        admin.id = params.id;
        admin.userId = params.userId;
        admin.companyId = params.companyId;
        admin.adminRole = params.adminRole;
        admin.name = params.name;
        admin.email = params.email;
        admin.phone = params.phone;
        admin.createdAt = new Date();
        admin.updatedAt = new Date();
        return admin;
    }
}
exports.CompanyAdmin = CompanyAdmin;
