"use strict";
/**
 * Company Admin Repository
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
exports.CompanyAdminRepository = void 0;
const repository_1 = require("../repository");
const company_admin_1 = require("../../models/management/company-admin");
class CompanyAdminRepository extends repository_1.BaseRepository {
    constructor() {
        super('company_admins');
    }
    /**
     * Find admins by company
     */
    findByCompany(companyId_1) {
        return __awaiter(this, arguments, void 0, function* (companyId, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [companyId, limit, offset]);
            return results.map(row => this.mapRowToAdmin(row));
        });
    }
    /**
     * Find admins by role
     */
    findByRole(role_1) {
        return __awaiter(this, arguments, void 0, function* (role, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE admin_role = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [role, limit, offset]);
            return results.map(row => this.mapRowToAdmin(row));
        });
    }
    /**
     * Find active admins
     */
    findActive() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE is_active = TRUE LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [limit, offset]);
            return results.map(row => this.mapRowToAdmin(row));
        });
    }
    /**
     * Find admin by user ID
     */
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE user_id = ?`;
            const result = yield this.queryOne(query, [userId]);
            return result ? this.mapRowToAdmin(result) : null;
        });
    }
    /**
     * Find company owner
     */
    findOwner(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? AND admin_role = 'OWNER'`;
            const result = yield this.queryOne(query, [companyId]);
            return result ? this.mapRowToAdmin(result) : null;
        });
    }
    /**
     * Count admins by company
     */
    countByCompany(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('company_id = ?', [companyId]);
        });
    }
    /**
     * Count admins by role
     */
    countByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('admin_role = ?', [role]);
        });
    }
    /**
     * Get admin permissions
     */
    getPermissions(adminId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT permission_name FROM permissions WHERE admin_id = ?`;
            const results = yield this.query(query, [adminId]);
            return results.map(row => row.permission_name);
        });
    }
    /**
     * Add permission to admin
     */
    addPermission(adminId, permission) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO permissions (admin_id, permission_name) VALUES (?, ?)`;
            try {
                yield this.pool.execute(query, [adminId, permission]);
                return true;
            }
            catch (error) {
                // Ignore duplicate key error
                if (error.code === 'ER_DUP_ENTRY') {
                    return true;
                }
                throw error;
            }
        });
    }
    /**
     * Remove permission from admin
     */
    removePermission(adminId, permission) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE FROM permissions WHERE admin_id = ? AND permission_name = ?`;
            const [result] = yield this.pool.execute(query, [adminId, permission]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Map database row to CompanyAdmin model
     */
    mapRowToAdmin(row) {
        return company_admin_1.CompanyAdmin.create({
            id: row.id,
            userId: row.user_id,
            companyId: row.company_id,
            adminRole: row.admin_role,
            name: row.name,
            email: row.email,
            phone: row.phone,
        });
    }
}
exports.CompanyAdminRepository = CompanyAdminRepository;
