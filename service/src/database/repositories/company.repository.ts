/**
 * Company Repository
 */

import { BaseRepository } from '../repository';
import { Company } from '../../models/company';
import { RowDataPacket } from 'mysql2/promise';

export interface CompanyRow extends RowDataPacket {
  id: string;
  name: string;
  service_type: string;
  description?: string;
  logo?: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class CompanyRepository extends BaseRepository<Company> {
  constructor() {
    super('companies');
  }

  /**
   * Find companies by service type
   */
  async findByServiceType(serviceType: string, limit: number = 10, offset: number = 0): Promise<Company[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE service_type = ? LIMIT ? OFFSET ?`;
    const results = await this.query<CompanyRow>(query, [serviceType, limit, offset]);
    
    return results.map(row => this.mapRowToCompany(row));
  }

  /**
   * Find companies by city
   */
  async findByCity(city: string, limit: number = 10, offset: number = 0): Promise<Company[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE city = ? LIMIT ? OFFSET ?`;
    const results = await this.query<CompanyRow>(query, [city, limit, offset]);
    
    return results.map(row => this.mapRowToCompany(row));
  }

  /**
   * Find verified companies
   */
  async findVerified(limit: number = 10, offset: number = 0): Promise<Company[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE is_verified = TRUE AND is_active = TRUE LIMIT ? OFFSET ?`;
    const results = await this.query<CompanyRow>(query, [limit, offset]);
    
    return results.map(row => this.mapRowToCompany(row));
  }

  /**
   * Find active companies
   */
  async findActive(limit: number = 10, offset: number = 0): Promise<Company[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE is_active = TRUE LIMIT ? OFFSET ?`;
    const results = await this.query<CompanyRow>(query, [limit, offset]);
    
    return results.map(row => this.mapRowToCompany(row));
  }

  /**
   * Count companies by service type
   */
  async countByServiceType(serviceType: string): Promise<number> {
    return this.count('service_type = ?', [serviceType]);
  }

  /**
   * Count verified companies
   */
  async countVerified(): Promise<number> {
    return this.count('is_verified = TRUE AND is_active = TRUE');
  }

  /**
   * Search companies by name
   */
  async searchByName(name: string, limit: number = 10, offset: number = 0): Promise<Company[]> {
    const query = `SELECT * FROM ${this.tableName} WHERE name LIKE ? LIMIT ? OFFSET ?`;
    const results = await this.query<CompanyRow>(query, [`%${name}%`, limit, offset]);
    
    return results.map(row => this.mapRowToCompany(row));
  }

  /**
   * Map database row to Company model
   */
  private mapRowToCompany(row: CompanyRow): Company {
    return Company.create({
      id: row.id,
      name: row.name,
      serviceType: row.service_type as any,
      email: row.email,
      description: row.description,
      logo: row.logo,
      website: row.website,
      phone: row.phone,
      address: row.address,
      city: row.city,
      country: row.country,
    });
  }
}
