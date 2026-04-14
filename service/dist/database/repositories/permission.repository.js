"use strict";
/**
 * Permission Repository
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
exports.PermissionRepository = void 0;
const repository_1 = require("../repository");
class PermissionRepository extends repository_1.BaseRepository {
    constructor() {
        super('permissions');
    }
    /**
     * Find permission by name
     */
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE name = ?`;
            const result = yield this.queryOne(query, [name]);
            return result ? this.mapRowToPermission(result) : null;
        });
    }
    /**
     * Find all permissions
     */
    findAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName}`;
            const results = yield this.query(query);
            return results.map(row => this.mapRowToPermission(row));
        });
    }
    /**
     * Find permission by resource and action
     */
    findByResourceAction(resource, action) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE resource = ? AND action = ?`;
            const result = yield this.queryOne(query, [resource, action]);
            return result ? this.mapRowToPermission(result) : null;
        });
    }
    /**
     * Get user permissions (from role + custom)
     */
    getUserPermissions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT DISTINCT p.* FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      INNER JOIN users u ON u.role = r.name
      WHERE u.id = ?
      UNION
      SELECT p.* FROM permissions p
      INNER JOIN user_permissions up ON p.id = up.permission_id
      WHERE up.user_id = ?
    `;
            const results = yield this.query(query, [userId, userId]);
            return results.map(row => this.mapRowToPermission(row));
        });
    }
    /**
     * Add custom permission to user
     */
    addPermissionToUser(userId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)`;
            try {
                yield this.pool.execute(query, [userId, permissionId]);
                return true;
            }
            catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    return true; // Already exists
                }
                throw error;
            }
        });
    }
    /**
     * Remove custom permission from user
     */
    removePermissionFromUser(userId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE FROM user_permissions WHERE user_id = ? AND permission_id = ?`;
            const [result] = yield this.pool.execute(query, [userId, permissionId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Map database row to Permission model
     */
    mapRowToPermission(row) {
        return {
            id: row.id.toString(),
            name: row.name,
            description: row.description,
            resource: row.resource,
            action: row.action,
            createdAt: row.created_at,
        };
    }
}
exports.PermissionRepository = PermissionRepository;
