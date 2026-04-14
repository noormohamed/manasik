/**
 * Admin Audit Logging Service - Comprehensive action logging for compliance
 */

import { Database } from '../database/connection';

export interface AuditLogEntry {
  id?: number;
  admin_user_id: number;
  action_type: string;
  entity_type: string;
  entity_id?: number;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at?: Date;
}

export interface AuditLogFilter {
  actionType?: string;
  entityType?: string;
  adminUserId?: number;
  entityId?: number;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export class AdminAuditService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  /**
   * Log an administrative action
   */
  async logAction(entry: AuditLogEntry): Promise<number> {
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

      const result = await this.db.query(query, values);
      return result.insertId;
    } catch (error) {
      // Silently fail if audit_logs table doesn't exist
      console.warn('Audit logging failed (table may not exist):', error instanceof Error ? error.message : String(error));
      return 0;
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(filter: AuditLogFilter): Promise<{ logs: AuditLogEntry[]; total: number }> {
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

    const values: any[] = [];

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
    const countQuery = query.replace(
      /SELECT.*FROM/,
      'SELECT COUNT(*) as count FROM'
    );
    const countResult = await this.db.query(countQuery, values);
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

    const logs = await this.db.query(query, values);

    return {
      logs: logs.map((log: any) => ({
        ...log,
        old_values: log.old_values ? JSON.parse(log.old_values) : null,
        new_values: log.new_values ? JSON.parse(log.new_values) : null,
      })),
      total,
    };
  }

  /**
   * Get audit log by ID
   */
  async getAuditLogById(id: number): Promise<AuditLogEntry | null> {
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

    const result = await this.db.query(query, [id]);

    if (result.length === 0) {
      return null;
    }

    const log = result[0];
    return {
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null,
    };
  }

  /**
   * Get audit logs for a specific entity
   */
  async getEntityAuditLog(
    entityType: string,
    entityId: number,
    limit: number = 50
  ): Promise<AuditLogEntry[]> {
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

    const logs = await this.db.query(query, [entityType, entityId, limit]);

    return logs.map((log: any) => ({
      ...log,
      old_values: log.old_values ? JSON.parse(log.old_values) : null,
      new_values: log.new_values ? JSON.parse(log.new_values) : null,
    }));
  }

  /**
   * Delete old audit logs (retention policy)
   */
  async deleteOldAuditLogs(daysToKeep: number = 730): Promise<number> {
    const query = `
      DELETE FROM audit_logs
      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
    `;

    const result = await this.db.query(query, [daysToKeep]);
    return result.affectedRows;
  }
}

export const createAdminAuditService = (database: Database) => {
  return new AdminAuditService(database);
};
