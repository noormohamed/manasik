/**
 * Agent represents a service provider (hotel owner, taxi firm owner, etc.)
 * Agents belong to a company and manage their own listings/services
 */

import { ServiceType } from '../../typing/roles';

export type AgentStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export class Agent {
  id!: string;
  private userId!: string;  // Reference to User
  private companyId!: string;
  private serviceType!: ServiceType;
  private name!: string;
  private email!: string;
  private phone?: string;
  private status!: AgentStatus;
  private commissionRate: number = 0;  // Percentage commission
  private totalBookings: number = 0;
  private totalRevenue: number = 0;
  private averageRating: number = 0;
  private totalReviews: number = 0;
  private bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    routingNumber: string;
  };
  private documents?: {
    businessLicense?: string;
    taxId?: string;
    identityProof?: string;
  };
  private createdAt: Date = new Date();
  private updatedAt: Date = new Date();

  // Getters
  getId(): string { return this.id; }
  getUserId(): string { return this.userId; }
  getCompanyId(): string { return this.companyId; }
  getServiceType(): ServiceType { return this.serviceType; }
  getName(): string { return this.name; }
  getEmail(): string { return this.email; }
  getPhone(): string | undefined { return this.phone; }
  getStatus(): AgentStatus { return this.status; }
  getCommissionRate(): number { return this.commissionRate; }
  getTotalBookings(): number { return this.totalBookings; }
  getTotalRevenue(): number { return this.totalRevenue; }
  getAverageRating(): number { return this.averageRating; }
  getTotalReviews(): number { return this.totalReviews; }
  getBankDetails(): any { return this.bankDetails; }
  getDocuments(): any { return this.documents; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  // Setters
  setStatus(status: AgentStatus): this {
    this.status = status;
    return this.touch();
  }

  setCommissionRate(rate: number): this {
    if (rate < 0 || rate > 100) throw new Error('Commission rate must be between 0 and 100');
    this.commissionRate = rate;
    return this.touch();
  }

  setBankDetails(details: any): this {
    this.bankDetails = details;
    return this.touch();
  }

  setDocuments(documents: any): this {
    this.documents = documents;
    return this.touch();
  }

  /**
   * Update statistics after a booking
   */
  recordBooking(revenue: number): this {
    this.totalBookings++;
    this.totalRevenue += revenue;
    return this.touch();
  }

  /**
   * Update rating after a review
   */
  updateRating(newRating: number): this {
    this.totalReviews++;
    this.averageRating = (this.averageRating * (this.totalReviews - 1) + newRating) / this.totalReviews;
    return this.touch();
  }

  private touch(): this {
    this.updatedAt = new Date();
    return this;
  }

  static create(params: {
    id: string;
    userId: string;
    companyId: string;
    serviceType: ServiceType;
    name: string;
    email: string;
    phone?: string;
    commissionRate?: number;
  }): Agent {
    const agent = new Agent();
    agent.id = params.id;
    agent.userId = params.userId;
    agent.companyId = params.companyId;
    agent.serviceType = params.serviceType;
    agent.name = params.name;
    agent.email = params.email;
    agent.phone = params.phone;
    agent.status = 'PENDING';
    agent.commissionRate = params.commissionRate ?? 0;
    agent.createdAt = new Date();
    agent.updatedAt = new Date();
    return agent;
  }
}
