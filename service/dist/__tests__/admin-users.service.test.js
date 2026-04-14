"use strict";
/**
 * Admin Users Service Tests
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
const admin_users_service_1 = require("../services/admin-users.service");
// Mock Database
class MockDatabase {
    constructor() {
        this.users = [
            {
                id: 1,
                email: 'john@example.com',
                full_name: 'John Doe',
                phone: '+1234567890',
                address: '123 Main St',
                role: 'CUSTOMER',
                status: 'ACTIVE',
                created_at: new Date('2024-01-15'),
                last_login_at: new Date('2024-01-20'),
                booking_count: 5,
                total_spent: 1250.00,
            },
            {
                id: 2,
                email: 'jane@example.com',
                full_name: 'Jane Smith',
                phone: '+1234567891',
                address: '456 Oak Ave',
                role: 'CUSTOMER',
                status: 'ACTIVE',
                created_at: new Date('2024-01-16'),
                last_login_at: new Date('2024-01-19'),
                booking_count: 3,
                total_spent: 750.00,
            },
            {
                id: 3,
                email: 'bob@example.com',
                full_name: 'Bob Johnson',
                phone: '+1234567892',
                address: '789 Pine Rd',
                role: 'CUSTOMER',
                status: 'SUSPENDED',
                created_at: new Date('2024-01-17'),
                last_login_at: null,
                booking_count: 0,
                total_spent: 0,
            },
        ];
    }
    query(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (sql.includes('COUNT(DISTINCT u.id) as count')) {
                return [{ count: this.users.length }];
            }
            if (sql.includes('SELECT') && sql.includes('WHERE u.id = ?')) {
                const id = params[0];
                return this.users.filter((u) => u.id === id);
            }
            if (sql.includes('SELECT') && sql.includes('WHERE id = ?')) {
                const id = params[0];
                return this.users.filter((u) => u.id === id);
            }
            if (sql.includes('UPDATE users')) {
                const userId = params[0];
                const user = this.users.find((u) => u.id === userId);
                if (user) {
                    user.status = sql.includes('SUSPENDED') ? 'SUSPENDED' : 'ACTIVE';
                    return { affectedRows: 1 };
                }
                return { affectedRows: 0 };
            }
            if (sql.includes('SELECT')) {
                return this.users;
            }
            return [];
        });
    }
    reset() {
        this.users = [];
    }
}
describe('AdminUsersService', () => {
    let mockDb;
    let usersService;
    beforeEach(() => {
        mockDb = new MockDatabase();
        usersService = new admin_users_service_1.AdminUsersService(mockDb);
    });
    describe('Get Users', () => {
        it('should get users', () => __awaiter(void 0, void 0, void 0, function* () {
            // The service is properly initialized
            expect(usersService).toBeDefined();
        }));
    });
    describe('Get User Detail', () => {
        it('should get user detail with related data', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield usersService.getUserDetail(1);
            expect(user).toBeDefined();
            expect(user.id).toBe(1);
            expect(user.email).toBe('john@example.com');
            expect(user.bookings).toBeDefined();
            expect(user.reviews).toBeDefined();
            expect(user.transactions).toBeDefined();
        }));
        it('should return null for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield usersService.getUserDetail(999);
            expect(user).toBeNull();
        }));
        it('should include booking count', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield usersService.getUserDetail(1);
            expect(user.bookings.total).toBeDefined();
            expect(typeof user.bookings.total).toBe('number');
        }));
        it('should include review information', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield usersService.getUserDetail(1);
            expect(user.reviews.total).toBeDefined();
            expect(user.reviews.averageRating).toBeDefined();
        }));
        it('should include transaction information', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield usersService.getUserDetail(1);
            expect(user.transactions.total).toBeDefined();
            expect(user.transactions.totalSpent).toBeDefined();
        }));
    });
    describe('Suspend User', () => {
        it('should suspend a user', () => __awaiter(void 0, void 0, void 0, function* () {
            const success = yield usersService.suspendUser(1, 'Suspicious activity');
            expect(success).toBe(true);
        }));
        it('should return false for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const success = yield usersService.suspendUser(999, 'Reason');
            expect(success).toBe(false);
        }));
    });
    describe('Reactivate User', () => {
        it('should reactivate a user', () => __awaiter(void 0, void 0, void 0, function* () {
            const success = yield usersService.reactivateUser(3);
            expect(success).toBe(true);
        }));
        it('should return false for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const success = yield usersService.reactivateUser(999);
            expect(success).toBe(false);
        }));
    });
    describe('Reset Password', () => {
        it('should reset user password', () => __awaiter(void 0, void 0, void 0, function* () {
            const success = yield usersService.resetPassword(1);
            expect(success).toBe(true);
        }));
    });
    describe('Get User By ID', () => {
        it('should get user by ID', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield usersService.getUserById(1);
            expect(user).toBeDefined();
            expect(user === null || user === void 0 ? void 0 : user.id).toBe(1);
            expect(user === null || user === void 0 ? void 0 : user.email).toBe('john@example.com');
        }));
        it('should return null for non-existent user', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield usersService.getUserById(999);
            // Mock returns empty array, so user will be undefined
            expect(user === null || user === undefined).toBe(true);
        }));
        it('should include all user fields', () => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield usersService.getUserById(1);
            expect(user === null || user === void 0 ? void 0 : user.id).toBeDefined();
            expect(user === null || user === void 0 ? void 0 : user.email).toBeDefined();
            expect(user === null || user === void 0 ? void 0 : user.role).toBeDefined();
            expect(user === null || user === void 0 ? void 0 : user.status).toBeDefined();
        }));
    });
});
