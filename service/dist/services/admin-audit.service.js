"use strict";
/**
 * Admin Audit Logging Service - Comprehensive action logging for compliance
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
exports.createAdminAuditService = exports.AdminAuditService = void 0;
class AdminAuditService {
    constructor(database) {
        this.db = database;
    }
    /**
     * Log an administrative action
     */
    logAction(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const query = `
        INSERT INTO audit_logs (
          admin_user_id,
          action_type,
          entity_type,
          entity_id,
          old_values,
          new_values,
          reason,
          ip_address,
          user_agent,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `;
                const values = [
                    entry.admin_user_id,
                    entry.action_type,
                    entry.entity_type,
                    entry.entity_id || null,
                    entry.old_values ? JSON.stringify(entry.old_values) : null,
                    entry.new_values ? JSON.stringify(entry.new_values) : null,
                    entry.reason || null,
                    entry.ip_address || null,
                    entry.user_agent || null,
                ];
                const result = yield this.db.query(query, values);
                return result.insertId;
            }
            catch (error) {
                // Silently fail if audit_logs table doesn't exist
                console.warn('Audit logging failed (table may not exist):', error instanceof Error ? error.message : String(error));
                return 0;
            }
        });
    }
    /**
     * Get audit logs with filtering and pagination
     */
    getAuditLogs(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `
      SELECT
        id,
        admin_user_id,
        action_type,
        entity_type,
        entity_id,
        old_values,
        new_values,
        reason,
        ip_address,
        user_agent,
        created_at
      FROM audit_logs
      WHERE 1=1
    `;
            const values = [];
            if (filter.actionType) {
                query += ' AND action_type = ?';
                values.push(filter.actionType);
            }
            if (filter.entityType) {
                query += ' AND entity_type = ?';
                values.push(filter.entityType);
            }
            if (filter.adminUserId) {
                query += ' AND admin_user_id = ?';
                values.push(filter.adminUserId);
            }
            if (filter.entityId) {
                query += ' AND entity_id = ?';
                values.push(filter.entityId);
            }
            if (filter.dateFrom) {
                query += ' AND created_at >= ?';
                values.push(filter.dateFrom);
            }
            if (filter.dateTo) {
                query += ' AND created_at <= ?';
                values.push(filter.dateTo);
            }
            // Get total count
            const countQuery = query.replace(/SELECT.*FROM/, 'SELECT COUNT(*) as count FROM');
            const countResult = yield this.db.query(countQuery, values);
            const total = countResult[0].count;
            // Add ordering and pagination
            query += ' ORDER BY created_at DESC';
            if (filter.limit) {
                query += ' LIMIT ?';
                values.push(filter.limit);
                if (filter.offset) {
                    query += ' OFFSET ?';
                    values.push(filter.offset);
                }
            }
            const logs = yield this.db.query(query, values);
            return {
                logs: logs.map((log) => (Object.assign(Object.assign({}, log), { old_values: log.old_values ? JSON.parse(log.old_values) : null, new_values: log.new_values ? JSON.parse(log.new_values) : null }))),
                total,
            };
        });
    }
    /**
     * Get audit log by ID
     */
    getAuditLogById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `
      SELECT
        id,
        admin_user_id,
        action_type,
        entity_type,
        entity_id,
        old_values,
        new_values,
        reason,
        ip_address,
        user_agent,
        created_at
      FROM audit_logs
      WHERE id = ?
    `;
            const result = yield this.db.query(query, [id]);
            if (result.length === 0) {
                return null;
            }
            const log = result[0];
            return Object.assign(Object.assign({}, log), { old_values: log.old_values ? JSON.parse(log.old_values) : null, new_values: log.new_values ? JSON.parse(log.new_values) : null });
        });
    }
    /**
     * Get audit logs for a specific entity
     */
    getEntityAuditLog(entityType_1, entityId_1) {
        return __awaiter(this, arguments, void 0, function* (entityType, entityId, limit = 50) {
            const query = `
      SELECT
        id,
        admin_user_id,
        action_type,
        entity_type,
        entity_id,
        old_values,
        new_values,
        reason,
        ip_address,
        user_agent,
        created_at
      FROM audit_logs
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;
            const logs = yield this.db.query(query, [entityType, entityId, limit]);
            return logs.map((log) => (Object.assign(Object.assign({}, log), { old_values: log.old_values ? JSON.parse(log.old_values) : null, new_values: log.new_values ? JSON.parse(log.new_values) : null })));
        });
    }
    /**
     * Delete old audit logs (retention policy)
     */
    deleteOldAuditLogs() {
        return __awaiter(this, arguments, void 0, function* (daysToKeep = 730) {
            const query = `
      DELETE FROM audit_logs
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;
            const result = yield this.db.query(query, [daysToKeep]);
            return result.affectedRows;
        });
    }
}
exports.AdminAuditService = AdminAuditService;
const createAdminAuditService = (database) => {
    return new AdminAuditService(database);
};
exports.createAdminAuditService = createAdminAuditService;
