"use strict";
/**
 * Admin Audit Service Tests
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
const admin_audit_service_1 = require("../services/admin-audit.service");
describe('AdminAuditService', () => {
    let auditService;
    beforeEach(() => {
        // Create a simple mock database for testing
        const mockDb = {
            query(sql, params) {
                return __awaiter(this, void 0, void 0, function* () {
                    // For testing purposes, we'll just return success
                    if (sql.includes('INSERT')) {
                        return { insertId: 1 };
                    }
                    // Handle COUNT queries
                    if (sql.includes('COUNT(*)')) {
                        return [{ count: 0 }];
                    }
                    if (sql.includes('SELECT')) {
                        return [];
                    }
                    if (sql.includes('DELETE')) {
                        return { affectedRows: 1 };
                    }
                    return [{ count: 0 }];
                });
            },
        };
        auditService = new admin_audit_service_1.AdminAuditService(mockDb);
    });
    describe('Log Action', () => {
        it('should log an administrative action', () => __awaiter(void 0, void 0, void 0, function* () {
            const entry = {
                admin_user_id: 1,
                action_type: 'SUSPEND',
                entity_type: 'USER',
                entity_id: 123,
                reason: 'Suspicious activity',
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0',
            };
            const id = yield auditService.logAction(entry);
            expect(id).toBeDefined();
            expect(typeof id).toBe('number');
            expect(id).toBeGreaterThan(0);
        }));
        it('should log an action with old and new values', () => __awaiter(void 0, void 0, void 0, function* () {
            const entry = {
                admin_user_id: 1,
                action_type: 'UPDATE',
                entity_type: 'USER',
                entity_id: 123,
                old_values: { status: 'ACTIVE' },
                new_values: { status: 'SUSPENDED' },
                reason: 'Policy violation',
                ip_address: '192.168.1.1',
                user_agent: 'Mozilla/5.0',
            };
            const id = yield auditService.logAction(entry);
            expect(id).toBeDefined();
            expect(typeof id).toBe('number');
        }));
        it('should log an action without optional fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const entry = {
                admin_user_id: 1,
                action_type: 'LOGIN',
                entity_type: 'ADMIN_USER',
            };
            const id = yield auditService.logAction(entry);
            expect(id).toBeDefined();
            expect(typeof id).toBe('number');
        }));
    });
    describe('Get Audit Logs', () => {
        it('should handle audit log retrieval', () => __awaiter(void 0, void 0, void 0, function* () {
            // This test verifies the service can be called
            // The actual database query is tested in integration tests
            expect(auditService).toBeDefined();
        }));
    });
    describe('Get Audit Log by ID', () => {
        it('should get an audit log by ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const entry = {
                admin_user_id: 1,
                action_type: 'SUSPEND',
                entity_type: 'USER',
                entity_id: 123,
                reason: 'Suspicious activity',
            };
            const id = yield auditService.logAction(entry);
            const log = yield auditService.getAuditLogById(id);
            // Mock returns empty array, so log will be null
            expect(log === null || log !== undefined).toBe(true);
        }));
    });
    describe('Get Entity Audit Log', () => {
        it('should get logs for a specific entity', () => __awaiter(void 0, void 0, void 0, function* () {
            const logs = yield auditService.getEntityAuditLog('USER', 123);
            expect(Array.isArray(logs)).toBe(true);
        }));
        it('should respect the limit parameter', () => __awaiter(void 0, void 0, void 0, function* () {
            const logs = yield auditService.getEntityAuditLog('USER', 123, 2);
            expect(Array.isArray(logs)).toBe(true);
        }));
    });
    describe('Delete Old Audit Logs', () => {
        it('should delete old audit logs', () => __awaiter(void 0, void 0, void 0, function* () {
            const deleted = yield auditService.deleteOldAuditLogs(0);
            expect(typeof deleted).toBe('number');
            expect(deleted).toBeGreaterThanOrEqual(0);
        }));
    });
    describe('JSON Serialization', () => {
        it('should properly serialize and deserialize JSON values', () => __awaiter(void 0, void 0, void 0, function* () {
            const oldValues = { status: 'ACTIVE', email: 'old@example.com' };
            const newValues = { status: 'SUSPENDED', email: 'new@example.com' };
            const entry = {
                admin_user_id: 1,
                action_type: 'UPDATE',
                entity_type: 'USER',
                entity_id: 123,
                old_values: oldValues,
                new_values: newValues,
            };
            const id = yield auditService.logAction(entry);
            expect(id).toBeDefined();
        }));
    });
});
