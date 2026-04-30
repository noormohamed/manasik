/**
 * Score Calculation Audit Service
 *
 * Manages the immutable audit trail of all score calculations.
 * Logs every calculation performed on location metrics and experience friction,
 * enabling compliance, debugging, and transparency.
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../../../database/connection';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ScoreCalculationLog {
  id: string;
  hotelId: string;
  metricType: 'location' | 'experience_friction';
  calculatedValue: any;
  inputData: any;
  calculationTimestamp: Date;
  calculationBasis: string;
}

export interface CalculationAuditTrailEntry {
  id: string;
  hotelId: string;
  metricType: string;
  calculatedValue: any;
  inputData: any;
  calculationTimestamp: Date;
  calculationBasis: string;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Logs a score calculation to the immutable audit trail.
 *
 * Records:
 * - Calculation timestamp
 * - Input data used (gate proximity, review count, etc.)
 * - Calculated result
 * - Calculation basis (explanation of how the score was derived)
 * - Metric type (location or experience_friction)
 *
 * The audit trail is immutable and cannot be modified after creation.
 *
 * @param hotelId The ID of the hotel being scored
 * @param metricType The type of metric being calculated ('location' or 'experience_friction')
 * @param calculatedValue The calculated score/metrics object
 * @param inputData The input data used in the calculation
 * @param basis A human-readable explanation of how the score was calculated
 * @throws Error if validation fails or database operation fails
 */
export async function logScoreCalculation(
  hotelId: string,
  metricType: 'location' | 'experience_friction',
  calculatedValue: any,
  inputData: any,
  basis: string,
): Promise<void> {
  try {
    // Validate inputs
    if (!hotelId || typeof hotelId !== 'string') {
      throw new Error('hotelId must be a non-empty string');
    }
    if (!metricType || !['location', 'experience_friction'].includes(metricType)) {
      throw new Error('metricType must be either "location" or "experience_friction"');
    }
    if (!calculatedValue) {
      throw new Error('calculatedValue must be provided');
    }
    if (!inputData) {
      throw new Error('inputData must be provided');
    }
    if (!basis || typeof basis !== 'string') {
      throw new Error('basis must be a non-empty string');
    }

    // Generate UUID for the log entry
    const id = uuidv4();

    // Store in database
    const pool = getPool();
    await pool.query(
      `INSERT INTO score_calculations 
       (id, hotel_id, metric_type, calculated_value, input_data, calculation_timestamp, calculation_basis)
       VALUES (?, ?, ?, ?, ?, NOW(), ?)`,
      [
        id,
        hotelId,
        metricType,
        JSON.stringify(calculatedValue),
        JSON.stringify(inputData),
        basis,
      ],
    );

    console.log(
      `Logged score calculation: id=${id}, hotelId=${hotelId}, metricType=${metricType}, basis=${basis}`,
    );
  } catch (error) {
    console.error('Error logging score calculation:', error);
    throw error;
  }
}

/**
 * Retrieves the calculation audit trail for a hotel.
 *
 * Returns the most recent calculations first, limited by the specified limit.
 * Each entry includes:
 * - Calculation timestamp
 * - Input data used
 * - Calculated result
 * - Calculation basis
 * - Metric type
 *
 * @param hotelId The ID of the hotel
 * @param limit Maximum number of entries to return (default: 10)
 * @returns Array of calculation audit trail entries
 * @throws Error if database operation fails
 */
export async function getCalculationAuditTrail(
  hotelId: string,
  limit: number = 10,
): Promise<CalculationAuditTrailEntry[]> {
  try {
    if (!hotelId || typeof hotelId !== 'string') {
      throw new Error('hotelId must be a non-empty string');
    }
    if (limit < 1 || limit > 1000) {
      throw new Error('limit must be between 1 and 1000');
    }

    const pool = getPool();
    const [entries] = await pool.query<any>(
      `SELECT 
        id,
        hotel_id,
        metric_type,
        calculated_value,
        input_data,
        calculation_timestamp,
        calculation_basis
       FROM score_calculations
       WHERE hotel_id = ?
       ORDER BY calculation_timestamp DESC
       LIMIT ?`,
      [hotelId, limit],
    );

    // Parse JSON fields
    const parsedEntries = (entries || []).map((entry: any) => ({
      id: entry.id,
      hotelId: entry.hotel_id,
      metricType: entry.metric_type,
      calculatedValue: typeof entry.calculated_value === 'string'
        ? JSON.parse(entry.calculated_value)
        : entry.calculated_value,
      inputData: typeof entry.input_data === 'string'
        ? JSON.parse(entry.input_data)
        : entry.input_data,
      calculationTimestamp: entry.calculation_timestamp,
      calculationBasis: entry.calculation_basis,
    }));

    console.log(`Retrieved ${parsedEntries.length} audit trail entries for hotel ${hotelId}`);
    return parsedEntries;
  } catch (error) {
    console.error('Error retrieving calculation audit trail:', error);
    throw error;
  }
}

/**
 * Retrieves calculation history for a specific metric type and optional date range.
 *
 * Allows filtering by:
 * - Metric type (location or experience_friction)
 * - Date range (optional)
 *
 * Results are ordered by calculation timestamp (newest first).
 *
 * @param hotelId The ID of the hotel
 * @param metricType The type of metric to filter by ('location' or 'experience_friction')
 * @param dateRange Optional date range with startDate and endDate
 * @returns Array of calculation history entries
 * @throws Error if validation fails or database operation fails
 */
export async function getCalculationHistory(
  hotelId: string,
  metricType: 'location' | 'experience_friction',
  dateRange?: { startDate: Date; endDate: Date },
): Promise<CalculationAuditTrailEntry[]> {
  try {
    if (!hotelId || typeof hotelId !== 'string') {
      throw new Error('hotelId must be a non-empty string');
    }
    if (!metricType || !['location', 'experience_friction'].includes(metricType)) {
      throw new Error('metricType must be either "location" or "experience_friction"');
    }

    const pool = getPool();
    let query = `
      SELECT 
        id,
        hotel_id,
        metric_type,
        calculated_value,
        input_data,
        calculation_timestamp,
        calculation_basis
       FROM score_calculations
       WHERE hotel_id = ? AND metric_type = ?
    `;
    const params: any[] = [hotelId, metricType];

    // Add date range filter if provided
    if (dateRange) {
      if (!dateRange.startDate || !dateRange.endDate) {
        throw new Error('dateRange must include both startDate and endDate');
      }
      query += ` AND calculation_timestamp >= ? AND calculation_timestamp <= ?`;
      params.push(dateRange.startDate, dateRange.endDate);
    }

    query += ` ORDER BY calculation_timestamp DESC`;

    const [entries] = await pool.query<any>(query, params);

    // Parse JSON fields
    const parsedEntries = (entries || []).map((entry: any) => ({
      id: entry.id,
      hotelId: entry.hotel_id,
      metricType: entry.metric_type,
      calculatedValue: typeof entry.calculated_value === 'string'
        ? JSON.parse(entry.calculated_value)
        : entry.calculated_value,
      inputData: typeof entry.input_data === 'string'
        ? JSON.parse(entry.input_data)
        : entry.input_data,
      calculationTimestamp: entry.calculation_timestamp,
      calculationBasis: entry.calculation_basis,
    }));

    console.log(
      `Retrieved ${parsedEntries.length} calculation history entries for hotel ${hotelId}, metric type ${metricType}`,
    );
    return parsedEntries;
  } catch (error) {
    console.error('Error retrieving calculation history:', error);
    throw error;
  }
}
