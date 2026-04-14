/**
 * Repository exports
 */

import { UserRepository } from './user.repository';
import { CompanyRepository } from './company.repository';
import { AgentRepository } from './agent.repository';
import { CompanyAdminRepository } from './company-admin.repository';
import { RoleRepository } from './role.repository';
import { PermissionRepository } from './permission.repository';

export { BaseRepository } from '../repository';
export { UserRepository } from './user.repository';
export { CompanyRepository } from './company.repository';
export { AgentRepository } from './agent.repository';
export { CompanyAdminRepository } from './company-admin.repository';
export { RoleRepository } from './role.repository';
export { PermissionRepository } from './permission.repository';

// Singleton instances
let userRepository: UserRepository | null = null;
let companyRepository: CompanyRepository | null = null;
let agentRepository: AgentRepository | null = null;
let companyAdminRepository: CompanyAdminRepository | null = null;
let roleRepository: RoleRepository | null = null;
let permissionRepository: PermissionRepository | null = null;

export function getUserRepository(): UserRepository {
  if (!userRepository) {
    userRepository = new UserRepository();
  }
  return userRepository;
}

export function getCompanyRepository(): CompanyRepository {
  if (!companyRepository) {
    companyRepository = new CompanyRepository();
  }
  return companyRepository;
}

export function getAgentRepository(): AgentRepository {
  if (!agentRepository) {
    agentRepository = new AgentRepository();
  }
  return agentRepository;
}

export function getCompanyAdminRepository(): CompanyAdminRepository {
  if (!companyAdminRepository) {
    companyAdminRepository = new CompanyAdminRepository();
  }
  return companyAdminRepository;
}

export function getRoleRepository(): RoleRepository {
  if (!roleRepository) {
    roleRepository = new RoleRepository();
  }
  return roleRepository;
}

export function getPermissionRepository(): PermissionRepository {
  if (!permissionRepository) {
    permissionRepository = new PermissionRepository();
  }
  return permissionRepository;
}
