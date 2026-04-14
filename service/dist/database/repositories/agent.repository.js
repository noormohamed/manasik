"use strict";
/**
 * Agent Repository
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
exports.AgentRepository = void 0;
const repository_1 = require("../repository");
const agent_1 = require("../../models/management/agent");
class AgentRepository extends repository_1.BaseRepository {
    constructor() {
        super('agents');
    }
    /**
     * Find agents by company
     */
    findByCompany(companyId_1) {
        return __awaiter(this, arguments, void 0, function* (companyId, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [companyId, limit, offset]);
            return results.map(row => this.mapRowToAgent(row));
        });
    }
    /**
     * Find agents by status
     */
    findByStatus(status_1) {
        return __awaiter(this, arguments, void 0, function* (status, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE status = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [status, limit, offset]);
            return results.map(row => this.mapRowToAgent(row));
        });
    }
    /**
     * Find agents by service type
     */
    findByServiceType(serviceType_1) {
        return __awaiter(this, arguments, void 0, function* (serviceType, limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE service_type = ? LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [serviceType, limit, offset]);
            return results.map(row => this.mapRowToAgent(row));
        });
    }
    /**
     * Find active agents
     */
    findActive() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' LIMIT ? OFFSET ?`;
            const results = yield this.query(query, [limit, offset]);
            return results.map(row => this.mapRowToAgent(row));
        });
    }
    /**
     * Find agent by user ID
     */
    findByUserId(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE user_id = ?`;
            const result = yield this.queryOne(query, [userId]);
            return result ? this.mapRowToAgent(result) : null;
        });
    }
    /**
     * Count agents by company
     */
    countByCompany(companyId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('company_id = ?', [companyId]);
        });
    }
    /**
     * Count agents by status
     */
    countByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.count('status = ?', [status]);
        });
    }
    /**
     * Find top agents by rating
     */
    findTopByRating() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' ORDER BY average_rating DESC LIMIT ?`;
            const results = yield this.query(query, [limit]);
            return results.map(row => this.mapRowToAgent(row));
        });
    }
    /**
     * Find top agents by revenue
     */
    findTopByRevenue() {
        return __awaiter(this, arguments, void 0, function* (limit = 10) {
            const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' ORDER BY total_revenue DESC LIMIT ?`;
            const results = yield this.query(query, [limit]);
            return results.map(row => this.mapRowToAgent(row));
        });
    }
    /**
     * Map database row to Agent model
     */
    mapRowToAgent(row) {
        return agent_1.Agent.create({
            id: row.id,
            userId: row.user_id,
            companyId: row.company_id,
            serviceType: row.service_type,
            name: row.name,
            email: row.email,
            phone: row.phone,
            commissionRate: row.commission_rate,
        });
    }
}
exports.AgentRepository = AgentRepository;
