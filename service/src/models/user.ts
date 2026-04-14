import { UserRole, ServiceType } from '../typing/roles';

export class User {
  id: string;
  first_name!: string;
  last_name!: string;
  email!: string;
  password_hash?: string;
  accessToken!: string;
  role!: UserRole;
  company_id?: string;  // For COMPANY_ADMIN and AGENT roles
  service_type?: ServiceType;  // For AGENT role - what service they provide
  is_active: boolean = true;
  created_at: Date = new Date();
  updated_at: Date = new Date();

  constructor(u: any) {
    this.id = u;
  }

  save() {
    // TODO: Implement persistence
  }

  get() {
    // TODO: Implement retrieval
  }

  /**
   * Check if user has permission for a resource action
   */
  hasPermission(resource: string, action: string): boolean {
    // TODO: Implement permission checking based on role
    return true;
  }

  /**
   * Get user's company ID (for agents and company admins)
   */
  getCompanyId(): string | undefined {
    return this.company_id;
  }

  /**
   * Check if user is an agent
   */
  isAgent(): boolean {
    return this.role === 'AGENT';
  }

  /**
   * Check if user is a company admin
   */
  isCompanyAdmin(): boolean {
    return this.role === 'COMPANY_ADMIN';
  }

  /**
   * Check if user is a super admin
   */
  isSuperAdmin(): boolean {
    return this.role === 'SUPER_ADMIN';
  }
}
