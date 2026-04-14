"use strict";
/**
 * User Repository
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
exports.UserRepository = void 0;
const repository_1 = require("../repository");
const user_1 = require("../../models/user");
class UserRepository extends repository_1.BaseRepository {
    constructor() {
        super('users');
    }
    /**
     * Find user by email
     */
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE email = ?`;
            const result = yield this.queryOne(query, [email]);
            if (!result)
                return null;
            return this.mapRowToUser(result);
        });
    }
    /**
     * Find users by company
     */
    findByCompany(companyId_1) {
        return __awaiter(this, arguments, void 0, function* (companyId, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [companyId, limit, offset]);
            return results.map(row => this.mapRowToUser(row));
        });
    }
    /**
     * Find users by role
     */
    findByRole(role_1) {
        return __awaiter(this, arguments, void 0, function* (role, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE role = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [role, limit, offset]);
            return results.map(row => this.mapRowToUser(row));
        });
    }
    /**
     * Find active users
     */
    findActive() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE is_active = TRUE LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [limit, offset]);
            return results.map(row => this.mapRowToUser(row));
        });
    }
    /**
     * Count users by role
     */
    countByRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('role = ?', [role]);
        });
    }
    /**
     * Count users by company
     */
    countByCompany(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('company_id = ?', [companyId]);
        });
    }
    /**
     * Check if email exists
     */
    emailExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = yield this.count('email = ?', [email]);
            return count > 0;
        });
    }
    /**
     * Map database row to User model
     */
    mapRowToUser(row) {
        const user = new user_1.User(row.id);
        user.first_name = row.first_name;
        user.last_name = row.last_name;
        user.email = row.email;
        user.accessToken = ''; // Will be set during authentication
        user.role = row.role;
        user.company_id = row.company_id;
        user.service_type = row.service_type;
        user.is_active = row.is_active;
        user.created_at = row.created_at;
        user.updated_at = row.updated_at;
        return user;
    }
}
exports.UserRepository = UserRepository;
