import type { Knex } from 'knex';

/**
 * Add has_direct_kaaba_access and floor_level to haram_gates.
 * These columns existed in the migration definition but the table was
 * created before the baseline, so CREATE TABLE IF NOT EXISTS skipped them.
 */
export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasColumn('haram_gates', 'has_direct_kaaba_access'))) {
    await knex.schema.alterTable('haram_gates', (t) => {
      t.boolean('has_direct_kaaba_access').defaultTo(false);
    });
  }
  if (!(await knex.schema.hasColumn('haram_gates', 'floor_level'))) {
    await knex.schema.alterTable('haram_gates', (t) => {
      t.integer('floor_level').nullable();
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('haram_gates', (t) => {
    t.dropColumn('has_direct_kaaba_access');
    t.dropColumn('floor_level');
  });
}

