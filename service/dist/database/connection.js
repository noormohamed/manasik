"use strict";
/**
 * MySQL Database Connection
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
exports.initializeDatabase = initializeDatabase;
exports.getPool = getPool;
exports.closeDatabase = closeDatabase;
const promise_1 = __importDefault(require("mysql2/promise"));
let pool = null;
class Database {
    constructor(pool) {
        this.pool = pool;
    }
    query(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const connection = yield this.pool.getConnection();
            try {
                const [results] = yield connection.execute(sql, params);
                return results;
            }
            finally {
                connection.release();
            }
        });
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool.getConnection();
        });
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pool.end();
        });
    }
}
exports.Database = Database;
function initializeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (pool) {
            return new Database(pool);
        }
        pool = promise_1.default.createPool({
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'booking_user',
            password: process.env.DB_PASSWORD || 'booking_password',
            database: process.env.DB_NAME || 'booking_platform',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        });
        // Test connection
        try {
            const connection = yield pool.getConnection();
            console.log('✅ Database connected successfully');
            connection.release();
        }
        catch (error) {
            console.error('❌ Database connection failed:', error);
            throw error;
        }
        return new Database(pool);
    });
}
function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initializeDatabase() first.');
    }
    return pool;
}
function closeDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        if (pool) {
            yield pool.end();
            pool = null;
            console.log('✅ Database connection closed');
        }
    });
}
