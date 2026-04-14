"use strict";
/**
 * Repository Tests
 * Tests for database repositories
 */
Object.defineProperty(exports, "__esModule", { value: true });
const user_repository_1 = require("../database/repositories/user.repository");
const company_repository_1 = require("../database/repositories/company.repository");
const agent_repository_1 = require("../database/repositories/agent.repository");
const role_repository_1 = require("../database/repositories/role.repository");
const permission_repository_1 = require("../database/repositories/permission.repository");
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
            const repo = new user_repository_1.UserRepository();
            expect(repo).toBeDefined();
        });
        it('should have required methods', () => {
            const repo = new user_repository_1.UserRepository();
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
            const repo = new company_repository_1.CompanyRepository();
            expect(repo).toBeDefined();
        });
        it('should have required methods', () => {
            const repo = new company_repository_1.CompanyRepository();
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
            const repo = new agent_repository_1.AgentRepository();
            expect(repo).toBeDefined();
        });
        it('should have required methods', () => {
            const repo = new agent_repository_1.AgentRepository();
            expect(typeof repo.findByCompany).toBe('function');
            expect(typeof repo.findByServiceType).toBe('function');
            expect(typeof repo.findByUserId).toBe('function');
            expect(typeof repo.findActive).toBe('function');
            expect(typeof repo.countByCompany).toBe('function');
        });
    });
    describe('RoleRepository', () => {
        it('should be instantiable', () => {
            const repo = new role_repository_1.RoleRepository();
            expect(repo).toBeDefined();
        });
        it('should have required methods', () => {
            const repo = new role_repository_1.RoleRepository();
            expect(typeof repo.findByName).toBe('function');
            expect(typeof repo.findSystemRoles).toBe('function');
            expect(typeof repo.getRoleWithPermissions).toBe('function');
            expect(typeof repo.addPermissionToRole).toBe('function');
            expect(typeof repo.removePermissionFromRole).toBe('function');
        });
    });
    describe('PermissionRepository', () => {
        it('should be instantiable', () => {
            const repo = new permission_repository_1.PermissionRepository();
            expect(repo).toBeDefined();
        });
        it('should have required methods', () => {
            const repo = new permission_repository_1.PermissionRepository();
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
            const repo = new user_repository_1.UserRepository();
            expect(repo).toBeDefined();
        });
        it('CompanyRepository should be instantiable with inherited functionality', () => {
            const repo = new company_repository_1.CompanyRepository();
            expect(repo).toBeDefined();
        });
        it('RoleRepository should be instantiable with inherited functionality', () => {
            const repo = new role_repository_1.RoleRepository();
            expect(repo).toBeDefined();
        });
    });
});
