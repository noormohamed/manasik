/**
 * Base Repository - Generic CRUD operations
 */

import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2/promise';
import { getPool } from './connection';

export interface IRepository<T> {
  create(data: T): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(limit?: number, offset?: number): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseRepository<T extends { id: string }> implements IRepository<T> {
  protected pool: Pool;
  protected tableName: string;

  constructor(tableName: string) {
    this.pool = getPool();
    this.tableName = tableName;
  }

  /**
   * Create a new record
   */
  async create(data: T): Promise<T> {
    const columns = Object.keys(data).filter(key => data[key as keyof T] !== undefined);
    const values = columns.map(col => data[col as keyof T]) as any[];
    const placeholders = columns.map(() => '?').join(', ');

    const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;

    try {
      await this.pool.execute(query, values);
      return data;
    } catch (error) {
      console.error(`Error creating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<T | null> {
    const query = `SELECT * FROM ${this.tableName} WHERE id = ?`;

    try {
      const [rows] = await this.pool.execute<RowDataPacket[]>(query, [id]);
      return rows.length > 0 ? (rows[0] as T) : null;
    } catch (error) {
      console.error(`Error finding record in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find all records with pagination
   */
  async findAll(limit: number = 10, offset: number = 0): Promise<T[]> {
    const query = `SELECT * FROM ${this.tableName} LIMIT ? OFFSET ?`;

    try {
      const [rows] = await this.pool.execute<RowDataPacket[]>(query, [limit, offset]);
      return rows as T[];
    } catch (error) {
      console.error(`Error finding all records in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<T>): Promise<T | null> {
    const columns = Object.keys(data).filter(key => data[key as keyof Partial<T>] !== undefined);
    if (columns.length === 0) {
      return this.findById(id);
    }

    const setClause = columns.map(col => `${col} = ?`).join(', ');
    const values: any[] = columns.map(col => data[col as keyof Partial<T>]);
    values.push(id);

    const query = `UPDATE ${this.tableName} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    try {
      await this.pool.execute(query, values);
      return this.findById(id);
    } catch (error) {
      console.error(`Error updating record in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<boolean> {
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;

    try {
      const [result] = await this.pool.execute<ResultSetHeader>(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting record in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Count records
   */
  async count(whereClause?: string, params?: any[]): Promise<number> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }

    try {
      const [rows] = await this.pool.execute<RowDataPacket[]>(query, params || []);
      return rows[0].count as number;
    } catch (error) {
      console.error(`Error counting records in ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Execute custom query
   */
  async query<R = any>(sql: string, params?: any[]): Promise<R[]> {
    try {
      const [rows] = await this.pool.execute<RowDataPacket[]>(sql, params || []);
      return rows as R[];
    } catch (error) {
      console.error(`Error executing query:`, error);
      throw error;
    }
  }

  /**
   * Execute custom query with single result
   */
  async queryOne<R = any>(sql: string, params?: any[]): Promise<R | null> {
    try {
      const [rows] = await this.pool.execute<RowDataPacket[]>(sql, params || []);
      return rows.length > 0 ? (rows[0] as R) : null;
    } catch (error) {
      console.error(`Error executing query:`, error);
      throw error;
    }
  }
}
