"use strict";
/**
 * Role Repository
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
exports.RoleRepository = void 0;
const repository_1 = require("../repository");
class RoleRepository extends repository_1.BaseRepository {
    constructor() {
        super('roles');
    }
    /**
     * Find role by name
     */
    findByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE name = ?`;
            const result = yield this.queryOne(query, [name]);
            return result ? this.mapRowToRole(result) : null;
        });
    }
    /**
     * Find all system roles
     */
    findSystemRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE is_system = TRUE`;
            const results = yield this.query(query);
            return results.map(row => this.mapRowToRole(row));
        });
    }
    /**
     * Get role with permissions
     */
    getRoleWithPermissions(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleQuery = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            const role = yield this.queryOne(roleQuery, [roleId]);
            if (!role)
                return null;
            const permissionsQuery = `
      SELECT p.* FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `;
            const permissions = yield this.query(permissionsQuery, [roleId]);
            return Object.assign(Object.assign({}, this.mapRowToRole(role)), { permissions });
        });
    }
    /**
     * Add permission to role
     */
    addPermissionToRole(roleId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`;
            try {
                yield this.pool.execute(query, [roleId, permissionId]);
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
     * Remove permission from role
     */
    removePermissionFromRole(roleId, permissionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?`;
            const [result] = yield this.pool.execute(query, [roleId, permissionId]);
            return result.affectedRows > 0;
        });
    }
    /**
     * Map database row to Role model
     */
    mapRowToRole(row) {
        return {
            id: row.id.toString(),
            name: row.name,
            description: row.description,
            isSystem: row.is_system,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        };
    }
}
exports.RoleRepository = RoleRepository;
