/**
 * CompanyAdmin represents a company-level administrator
 * Can manage agents, view company bookings, and handle company settings
 */

export type AdminRole = 'OWNER' | 'MANAGER' | 'SUPPORT';

export class CompanyAdmin {
  id!: string;
  userId!: string;  // Reference to User
  companyId!: string;
  adminRole!: AdminRole;
  name!: string;
  email!: string;
  phone?: string;
  permissions: string[] = [];  // Specific permissions beyond role
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  // Getters
  getId(): string { return this.id; }
  getUserId(): string { return this.userId; }
  getCompanyId(): string { return this.companyId; }
  getAdminRole(): AdminRole { return this.adminRole; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
  getPhone(): string | undefined { return this.phone; }
  getPermissions(): string[] { return this.permissions; }
  isActiveAdmin(): boolean { return this.isActive; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Setters
  setAdminRole(role: AdminRole): this {
    this.adminRole = role;
    return this.touch();
  }

  setActive(active: boolean): this {
    this.isActive = active;
    return this.touch();
  }

  addPermission(permission: string): this {
    if (!this.permissions.includes(permission)) {
      this.permissions.push(permission);
      this.touch();
    }
    return this;
  }

  removePermission(permission: string): this {
    this.permissions = this.permissions.filter(p => p !== permission);
    return this.touch();
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  /**
   * Check if admin can manage agents
   */
  canManageAgents(): boolean {
    return this.adminRole === 'OWNER' || this.adminRole === 'MANAGER';
  }

  /**
   * Check if admin can view all company bookings
   */
  canViewAllBookings(): boolean {
    return this.adminRole === 'OWNER' || this.adminRole === 'MANAGER';
  }

  /**
   * Check if admin can manage company settings
   */
  canManageSettings(): boolean {
    return this.adminRole === 'OWNER';
  }

  private touch(): this {
    this.updatedAt = new Date();
    return this;
  }

  static create(params: {
    id: string;
    userId: string;
    companyId: string;
    adminRole: AdminRole;
    name: string;
    email: string;
    phone?: string;
  }): CompanyAdmin {
    const admin = new CompanyAdmin();
    admin.id = params.id;
    admin.userId = params.userId;
    admin.companyId = params.companyId;
    admin.adminRole = params.adminRole;
    admin.name = params.name;
    admin.email = params.email;
    admin.phone = params.phone;
    admin.createdAt = new Date();
    admin.updatedAt = new Date();
    return admin;
  }
}
