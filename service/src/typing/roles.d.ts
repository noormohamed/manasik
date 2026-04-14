/**
 * Role-based access control types
 */

export type UserRole = 
  | 'SUPER_ADMIN'      // System administrator
  | 'COMPANY_ADMIN'    // Company management (can manage agents, view all bookings)
  | 'AGENT'            // Service provider (hotel owner, taxi firm, etc.)
  | 'CUSTOMER';        // End user making bookings

export type ServiceType = 
  | 'HOTEL'
  | 'EXPERIENCE'
  | 'CAR'
  | 'TAXI'
  | 'FOOD';

export interface Permission {
  resource: string;    // 'booking', 'review', 'management'
  action: string;      // 'create', 'read', 'update', 'delete'
  scope: 'own' | 'company' | 'all';  // own = own records, company = company records, all = system-wide
}

export interface RolePermissions {
  [key: string]: Permission[];
}
