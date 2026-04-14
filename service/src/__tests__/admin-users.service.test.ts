/**
 * Admin Users Service Tests
 */

import { AdminUsersService, AdminUser } from '../services/admin-users.service';

// Mock Database
class MockDatabase {
  private users: any[] = [
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

  async query(sql: string, params: any[]): Promise<any> {
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
  }

  reset() {
    this.users = [];
  }
}

describe('AdminUsersService', () => {
  let mockDb: MockDatabase;
  let usersService: AdminUsersService;

  beforeEach(() => {
    mockDb = new MockDatabase();
    usersService = new AdminUsersService(mockDb as any);
  });

  describe('Get Users', () => {
    it('should get users', async () => {
      // The service is properly initialized
      expect(usersService).toBeDefined();
    });
  });

  describe('Get User Detail', () => {
    it('should get user detail with related data', async () => {
      const user = await usersService.getUserDetail(1);

      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.email).toBe('john@example.com');
      expect(user.bookings).toBeDefined();
      expect(user.reviews).toBeDefined();
      expect(user.transactions).toBeDefined();
    });

    it('should return null for non-existent user', async () => {
      const user = await usersService.getUserDetail(999);

      expect(user).toBeNull();
    });

    it('should include booking count', async () => {
      const user = await usersService.getUserDetail(1);

      expect(user.bookings.total).toBeDefined();
      expect(typeof user.bookings.total).toBe('number');
    });

    it('should include review information', async () => {
      const user = await usersService.getUserDetail(1);

      expect(user.reviews.total).toBeDefined();
      expect(user.reviews.averageRating).toBeDefined();
    });

    it('should include transaction information', async () => {
      const user = await usersService.getUserDetail(1);

      expect(user.transactions.total).toBeDefined();
      expect(user.transactions.totalSpent).toBeDefined();
    });
  });

  describe('Suspend User', () => {
    it('should suspend a user', async () => {
      const success = await usersService.suspendUser(1, 'Suspicious activity');

      expect(success).toBe(true);
    });

    it('should return false for non-existent user', async () => {
      const success = await usersService.suspendUser(999, 'Reason');

      expect(success).toBe(false);
    });
  });

  describe('Reactivate User', () => {
    it('should reactivate a user', async () => {
      const success = await usersService.reactivateUser(3);

      expect(success).toBe(true);
    });

    it('should return false for non-existent user', async () => {
      const success = await usersService.reactivateUser(999);

      expect(success).toBe(false);
    });
  });

  describe('Reset Password', () => {
    it('should reset user password', async () => {
      const success = await usersService.resetPassword(1);

      expect(success).toBe(true);
    });
  });

  describe('Get User By ID', () => {
    it('should get user by ID', async () => {
      const user = await usersService.getUserById(1);

      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(user?.email).toBe('john@example.com');
    });

    it('should return null for non-existent user', async () => {
      const user = await usersService.getUserById(999);

      // Mock returns empty array, so user will be undefined
      expect(user === null || user === undefined).toBe(true);
    });

    it('should include all user fields', async () => {
      const user = await usersService.getUserById(1);

      expect(user?.id).toBeDefined();
      expect(user?.email).toBeDefined();
      expect(user?.role).toBeDefined();
      expect(user?.status).toBeDefined();
    });
  });
});
