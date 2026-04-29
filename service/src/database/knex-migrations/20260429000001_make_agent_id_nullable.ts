import type { Knex } from 'knex';

/**
 * Migration: Make agent_id nullable in hotels table
 * 
 * Allows individual users to create hotels without being part of the agent system.
 * This enables the POST /api/hotels endpoint to work for regular users.
 */

export async function up(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

  // Drop the existing foreign key constraint
  await knex.raw(`
    ALTER TABLE hotels 
    DROP FOREIGN KEY hotels_ibfk_2
  `);

  // Modify the column to be nullable
  await knex.raw(`
    ALTER TABLE hotels 
    MODIFY COLUMN agent_id VARCHAR(36) NULL
  `);

  // Re-add the foreign key constraint
  await knex.raw(`
    ALTER TABLE hotels 
    ADD CONSTRAINT hotels_ibfk_2 
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
  `);

  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('SET FOREIGN_KEY_CHECKS = 0');

  // Revert: Drop the foreign key constraint
  await knex.raw(`
    ALTER TABLE hotels 
    DROP FOREIGN KEY hotels_ibfk_2
  `);

  // Modify the column back to NOT NULL
  await knex.raw(`
    ALTER TABLE hotels 
    MODIFY COLUMN agent_id VARCHAR(36) NOT NULL
  `);

  // Re-add the foreign key constraint
  await knex.raw(`
    ALTER TABLE hotels 
    ADD CONSTRAINT hotels_ibfk_2 
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
  `);

  await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
}
