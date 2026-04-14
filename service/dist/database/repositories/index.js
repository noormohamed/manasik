"use strict";
/**
 * Repository exports
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionRepository = exports.RoleRepository = exports.CompanyAdminRepository = exports.AgentRepository = exports.CompanyRepository = exports.UserRepository = exports.BaseRepository = void 0;
exports.getUserRepository = getUserRepository;
exports.getCompanyRepository = getCompanyRepository;
exports.getAgentRepository = getAgentRepository;
exports.getCompanyAdminRepository = getCompanyAdminRepository;
exports.getRoleRepository = getRoleRepository;
exports.getPermissionRepository = getPermissionRepository;
const user_repository_1 = require("./user.repository");
const company_repository_1 = require("./company.repository");
const agent_repository_1 = require("./agent.repository");
const company_admin_repository_1 = require("./company-admin.repository");
const role_repository_1 = require("./role.repository");
const permission_repository_1 = require("./permission.repository");
var repository_1 = require("../repository");
Object.defineProperty(exports, "BaseRepository", { enumerable: true, get: function () { return repository_1.BaseRepository; } });
var user_repository_2 = require("./user.repository");
Object.defineProperty(exports, "UserRepository", { enumerable: true, get: function () { return user_repository_2.UserRepository; } });
var company_repository_2 = require("./company.repository");
Object.defineProperty(exports, "CompanyRepository", { enumerable: true, get: function () { return company_repository_2.CompanyRepository; } });
var agent_repository_2 = require("./agent.repository");
Object.defineProperty(exports, "AgentRepository", { enumerable: true, get: function () { return agent_repository_2.AgentRepository; } });
var company_admin_repository_2 = require("./company-admin.repository");
Object.defineProperty(exports, "CompanyAdminRepository", { enumerable: true, get: function () { return company_admin_repository_2.CompanyAdminRepository; } });
var role_repository_2 = require("./role.repository");
Object.defineProperty(exports, "RoleRepository", { enumerable: true, get: function () { return role_repository_2.RoleRepository; } });
var permission_repository_2 = require("./permission.repository");
Object.defineProperty(exports, "PermissionRepository", { enumerable: true, get: function () { return permission_repository_2.PermissionRepository; } });
// Singleton instances
let userRepository = null;
let companyRepository = null;
let agentRepository = null;
let companyAdminRepository = null;
let roleRepository = null;
let permissionRepository = null;
function getUserRepository() {
    if (!userRepository) {
        userRepository = new user_repository_1.UserRepository();
    }
    return userRepository;
}
function getCompanyRepository() {
    if (!companyRepository) {
        companyRepository = new company_repository_1.CompanyRepository();
    }
    return companyRepository;
}
function getAgentRepository() {
    if (!agentRepository) {
        agentRepository = new agent_repository_1.AgentRepository();
    }
    return agentRepository;
}
function getCompanyAdminRepository() {
    if (!companyAdminRepository) {
        companyAdminRepository = new company_admin_repository_1.CompanyAdminRepository();
    }
    return companyAdminRepository;
}
function getRoleRepository() {
    if (!roleRepository) {
        roleRepository = new role_repository_1.RoleRepository();
    }
    return roleRepository;
}
function getPermissionRepository() {
    if (!permissionRepository) {
        permissionRepository = new permission_repository_1.PermissionRepository();
    }
    return permissionRepository;
}
