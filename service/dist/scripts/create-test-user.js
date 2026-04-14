"use strict";
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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function createTestUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const connection = yield promise_1.default.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'booking_user',
            password: process.env.DB_PASSWORD || 'booking_password',
            database: process.env.DB_NAME || 'booking_platform'
        });
        try {
            // Hash the password
            const passwordHash = yield bcryptjs_1.default.hash('password123', 10);
            // Insert test user
            yield connection.execute(`INSERT INTO users (id, first_name, last_name, email, password_hash, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`, ['admin-001', 'Admin', 'User', 'admin@bookingplatform.com', passwordHash, 'SUPER_ADMIN', true]);
            console.log('✅ Test user created successfully!');
            console.log('Email: admin@bookingplatform.com');
            console.log('Password: password123');
            yield connection.end();
            process.exit(0);
        }
        catch (error) {
            console.error('❌ Error creating user:', error.message);
            process.exit(1);
        }
    });
}
createTestUser();
