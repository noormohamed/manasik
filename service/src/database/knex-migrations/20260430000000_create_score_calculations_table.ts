import type { Knex } from 'knex';

/**
 * Migration: Create score_calculations audit trail table
 * 
 * Stores immutable audit trail of all score calculations for compliance and debugging.
 * Tracks every calculation performed on location metrics and experience friction.
 * 
 * This table is used to:
 * - Maintain a complete history of all score calculations
 * - Enable audit trails for compliance purposes
 * - Support debugging and troubleshooting of calculation issues
 * - Provide transparency to users about how scores were calculated
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

  // Create the score_calculations table
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS score_calculations (
      id VARCHAR(36) PRIMARY KEY,
      hotel_id VARCHAR(36) NOT NULL,
      metric_type ENUM('location', 'experience_friction') NOT NULL,
      calculated_value JSON NOT NULL,
      input_data JSON NOT NULL,
      calculation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      calculation_basis VARCHAR(500),
      
      -- Foreign key
      CONSTRAINT fk_calc_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE,
      
      -- Indexes for performance and querying
      INDEX idx_calc_hotel_id (hotel_id),
      INDEX idx_calc_metric_type (metric_type),
      INDEX idx_calc_timestamp (calculation_timestamp),
      INDEX idx_calc_hotel_metric (hotel_id, metric_type),
      INDEX idx_calc_hotel_timestamp (hotel_id, calculation_timestamp)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

  // Drop the score_calculations table
  await knex.raw(`
    DROP TABLE IF EXISTS score_calculations
  `);

  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
}
