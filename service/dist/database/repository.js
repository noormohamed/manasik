"use strict";
/**
 * Base Repository - Generic CRUD operations
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
exports.BaseRepository = void 0;
const connection_1 = require("./connection");
class BaseRepository {
    constructor(tableName) {
        this.pool = (0, connection_1.getPool)();
        this.tableName = tableName;
    }
    /**
     * Create a new record
     */
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const columns = Object.keys(data).filter(key => data[key] !== undefined);
            const values = columns.map(col => data[col]);
            const placeholders = columns.map(() => '?').join(', ');
            const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
            try {
                yield this.pool.execute(query, values);
                return data;
            }
            catch (error) {
                console.error(`Error creating record in ${this.tableName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Find record by ID
     */
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;
            try {
                const [rows] = yield this.pool.execute(query, [id]);
                return rows.length > 0 ? rows[0] : null;
            }
            catch (error) {
                console.error(`Error finding record in ${this.tableName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Find all records with pagination
     */
    findAll() {
        return __awaiter(this, arguments, void 0, function* (limit = 10, offset = 0) {
            const query = `SELECT * FROM ${this.tableName} LIMIT ? OFFSET ?`;
            try {
                const [rows] = yield this.pool.execute(query, [limit, offset]);
                return rows;
            }
            catch (error) {
                console.error(`Error finding all records in ${this.tableName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Update a record
     */
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const columns = Object.keys(data).filter(key => data[key] !== undefined);
            if (columns.length === 0) {
                return this.findById(id);
            }
            const setClause = columns.map(col => `${col} = ?`).join(', ');
            const values = columns.map(col => data[col]);
            values.push(id);
            const query = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
            try {
                yield this.pool.execute(query, values);
                return this.findById(id);
            }
            catch (error) {
                console.error(`Error updating record in ${this.tableName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Delete a record
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
            try {
                const [result] = yield this.pool.execute(query, [id]);
                return result.affectedRows > 0;
            }
            catch (error) {
                console.error(`Error deleting record in ${this.tableName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Count records
     */
    count(whereClause, params) {
        return __awaiter(this, void 0, void 0, function* () {
            let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
            if (whereClause) {
                query += ` WHERE ${whereClause}`;
            }
            try {
                const [rows] = yield this.pool.execute(query, params || []);
                return rows[0].count;
            }
            catch (error) {
                console.error(`Error counting records in ${this.tableName}:`, error);
                throw error;
            }
        });
    }
    /**
     * Execute custom query
     */
    query(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield this.pool.execute(sql, params || []);
                return rows;
            }
            catch (error) {
                console.error(`Error executing query:`, error);
                throw error;
            }
        });
    }
    /**
     * Execute custom query with single result
     */
    queryOne(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const [rows] = yield this.pool.execute(sql, params || []);
                return rows.length > 0 ? rows[0] : null;
            }
            catch (error) {
                console.error(`Error executing query:`, error);
                throw error;
            }
        });
    }
}
exports.BaseRepository = BaseRepository;
