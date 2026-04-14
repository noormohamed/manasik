/**
 * Agent Repository
 */

import { BaseRepository } from '../repository';
import { Agent } from '../../models/management/agent';
import { RowDataPacket } from 'mysql2/promise';

export interface AgentRow extends RowDataPacket {
  id: string;
  user_id: string;
  company_id: string;
  service_type: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  commission_rate: number;
  total_bookings: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  created_at: Date;
  updated_at: Date;
}

export class AgentRepository extends BaseRepository<Agent> {
  constructor() {
    super('agents');
  }

  /**
   * Find agents by company
   */
  async findByCompany(companyId: string, limit: number = 10, offset: number = 0): Promise<Agent[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE company_id = ? LIMIT ? OFFSET ?`;
    const results = await this.query<AgentRow>(query, [companyId, limit, offset]);
    
    return results.map(row => this.mapRowToAgent(row));
  }

  /**
   * Find agents by status
   */
  async findByStatus(status: string, limit: number = 10, offset: number = 0): Promise<Agent[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = ? LIMIT ? OFFSET ?`;
    const results = await this.query<AgentRow>(query, [status, limit, offset]);
    
    return results.map(row => this.mapRowToAgent(row));
  }

  /**
   * Find agents by service type
   */
  async findByServiceType(serviceType: string, limit: number = 10, offset: number = 0): Promise<Agent[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE service_type = ? LIMIT ? OFFSET ?`;
    const results = await this.query<AgentRow>(query, [serviceType, limit, offset]);
    
    return results.map(row => this.mapRowToAgent(row));
  }

  /**
   * Find active agents
   */
  async findActive(limit: number = 10, offset: number = 0): Promise<Agent[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' LIMIT ? OFFSET ?`;
    const results = await this.query<AgentRow>(query, [limit, offset]);
    
    return results.map(row => this.mapRowToAgent(row));
  }

  /**
   * Find agent by user ID
   */
  async findByUserId(userId: string): Promise<Agent | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE user_id = ?`;
    const result = await this.queryOne<AgentRow>(query, [userId]);
    
    return result ? this.mapRowToAgent(result) : null;
  }

  /**
   * Count agents by company
   */
  async countByCompany(companyId: string): Promise<number> {
    return this.count('company_id = ?', [companyId]);
  }

  /**
   * Count agents by status
   */
  async countByStatus(status: string): Promise<number> {
    return this.count('status = ?', [status]);
  }

  /**
   * Find top agents by rating
   */
  async findTopByRating(limit: number = 10): Promise<Agent[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' ORDER BY average_rating DESC LIMIT ?`;
    const results = await this.query<AgentRow>(query, [limit]);
    
    return results.map(row => this.mapRowToAgent(row));
  }

  /**
   * Find top agents by revenue
   */
  async findTopByRevenue(limit: number = 10): Promise<Agent[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE status = 'ACTIVE' ORDER BY total_revenue DESC LIMIT ?`;
    const results = await this.query<AgentRow>(query, [limit]);
    
    return results.map(row => this.mapRowToAgent(row));
  }

  /**
   * Map database row to Agent model
   */
  private mapRowToAgent(row: AgentRow): Agent {
    return Agent.create({
      id: row.id,
      userId: row.user_id,
      companyId: row.company_id,
      serviceType: row.service_type as any,
      name: row.name,
      email: row.email,
      phone: row.phone,
      commissionRate: row.commission_rate,
    });
  }
}
