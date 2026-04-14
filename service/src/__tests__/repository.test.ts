/**
 * Repository Tests
 * Tests for database repositories
 */

import { UserRepository } from '../database/repositories/user.repository';
import { CompanyRepository } from '../database/repositories/company.repository';
import { AgentRepository } from '../database/repositories/agent.repository';
import { RoleRepository } from '../database/repositories/role.repository';
import { PermissionRepository } from '../database/repositories/permission.repository';

// Mock the database connection
jest.mock('../database/connection', () => ({
  getPool: jest.fn(() => ({
    execute: jest.fn(),
    query: jest.fn(),
  })),
  initializeDatabase: jest.fn(),
  closeDatabase: jest.fn(),
}));

describe('Repository Pattern', () => {
  describe('UserRepository', () => {
    it('should be instantiable', () => {
      const repo = new UserRepository();
      expect(repo).toBeDefined();
    });

    it('should have required methods', () => {
      const repo = new UserRepository();

      expect(typeof repo.findByEmail).toBe('function');
      expect(typeof repo.findByRole).toBe('function');
      expect(typeof repo.findByCompany).toBe('function');
      expect(typeof repo.findActive).toBe('function');
      expect(typeof repo.countByRole).toBe('function');
      expect(typeof repo.countByCompany).toBe('function');
      expect(typeof repo.emailExists).toBe('function');
    });
  });

  describe('CompanyRepository', () => {
    it('should be instantiable', () => {
      const repo = new CompanyRepository();
      expect(repo).toBeDefined();
    });

    it('should have required methods', () => {
      const repo = new CompanyRepository();

      expect(typeof repo.findByServiceType).toBe('function');
      expect(typeof repo.findByCity).toBe('function');
      expect(typeof repo.findVerified).toBe('function');
      expect(typeof repo.findActive).toBe('function');
      expect(typeof repo.countByServiceType).toBe('function');
      expect(typeof repo.countVerified).toBe('function');
      expect(typeof repo.searchByName).toBe('function');
    });
  });

  describe('AgentRepository', () => {
    it('should be instantiable', () => {
      const repo = new AgentRepository();
      expect(repo).toBeDefined();
    });

    it('should have required methods', () => {
      const repo = new AgentRepository();

      expect(typeof repo.findByCompany).toBe('function');
      expect(typeof repo.findByServiceType).toBe('function');
      expect(typeof repo.findByUserId).toBe('function');
      expect(typeof repo.findActive).toBe('function');
      expect(typeof repo.countByCompany).toBe('function');
    });
  });

  describe('RoleRepository', () => {
    it('should be instantiable', () => {
      const repo = new RoleRepository();
      expect(repo).toBeDefined();
    });

    it('should have required methods', () => {
      const repo = new RoleRepository();

      expect(typeof repo.findByName).toBe('function');
      expect(typeof repo.findSystemRoles).toBe('function');
      expect(typeof repo.getRoleWithPermissions).toBe('function');
      expect(typeof repo.addPermissionToRole).toBe('function');
      expect(typeof repo.removePermissionFromRole).toBe('function');
    });
  });

  describe('PermissionRepository', () => {
    it('should be instantiable', () => {
      const repo = new PermissionRepository();
      expect(repo).toBeDefined();
    });

    it('should have required methods', () => {
      const repo = new PermissionRepository();

      expect(typeof repo.findByName).toBe('function');
      expect(typeof repo.findAll).toBe('function');
      expect(typeof repo.findByResourceAction).toBe('function');
      expect(typeof repo.getUserPermissions).toBe('function');
      expect(typeof repo.addPermissionToUser).toBe('function');
      expect(typeof repo.removePermissionFromUser).toBe('function');
    });
  });
});

describe('Repository Inheritance', () => {
  describe('BaseRepository Methods', () => {
    it('UserRepository should be instantiable with inherited functionality', () => {
      const repo = new UserRepository();
      expect(repo).toBeDefined();
    });

    it('CompanyRepository should be instantiable with inherited functionality', () => {
      const repo = new CompanyRepository();
      expect(repo).toBeDefined();
    });

    it('RoleRepository should be instantiable with inherited functionality', () => {
      const repo = new RoleRepository();
      expect(repo).toBeDefined();
    });
  });
});
