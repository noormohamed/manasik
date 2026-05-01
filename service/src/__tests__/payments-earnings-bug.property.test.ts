/**
 * Bug Condition Exploration Property Test
 *
 * This test demonstrates two bugs in the payments/earnings system:
 *
 * Bug 1 — Agent Mapping: The `agents` table record for `agent-10` has a stale
 * `user_id` because the seed SQL's `ON DUPLICATE KEY UPDATE` clause does not
 * include `user_id`. After re-seeding, `user_id` remains the old UUID instead
 * of `'agent-010'`.
 *
 * Bug 2 — Manual Payment in Earnings: The `bookings` table has no
 * `payment_method` column, so there is no way to distinguish Stripe-verified
 * payments from manually-marked payments. The earnings endpoint counts ALL
 * PAID bookings regardless of payment source.
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 */

import * as fc from 'fast-check';
import * as mysql from 'mysql2/promise';

describe('Payments Earnings Bug Condition Exploration', () => {
  let pool: mysql.Pool;

  beforeAll(async () => {
    pool = mysql.createPool({
      host: 'localhost',
      port: 3306,
      user: 'booking_user',
      password: 'booking_password',
      database: 'booking_platform',
      waitForConnections: true,
      connectionLimit: 5,
    });
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * Property 1: Bug Condition — Agent Mapping
   *
   * For the agent record with id = 'agent-10', the user_id SHOULD equal
   * 'agent-010' (the correct mapping for William Smith). On unfixed code,
   * the ON DUPLICATE KEY UPDATE in seed-william-smith.sql does not update
   * user_id, so a stale value like '556e10c0-c6c1-48d5-9c73-c17beffc02d6'
   * persists after re-seeding.
   *
   * **Validates: Requirements 1.1, 1.2**
   */
  it('Bug 1: agent-10 user_id should equal agent-010', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant('agent-10'), async (agentId) => {
        const [rows] = await pool.query<mysql.RowDataPacket[]>(
          'SELECT user_id FROM agents WHERE id = ?',
          [agentId]
        );

        // Agent record must exist
        expect(rows.length).toBe(1);

        // user_id must be 'agent-010' — the correct mapping for William Smith
        // On unfixed code, this will be '556e10c0-c6c1-48d5-9c73-c17beffc02d6'
        expect(rows[0].user_id).toBe('agent-010');
      }),
      { numRuns: 1 }
    );
  });

  /**
   * Property 2: Bug Condition — Manual Payment in Earnings
   *
   * The bookings table SHOULD have a `payment_method` column to distinguish
   * Stripe-verified payments from manually-marked payments. On unfixed code,
   * this column does not exist.
   *
   * **Validates: Requirements 1.3, 1.4**
   */
  it('Bug 2: bookings table should have payment_method column', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant('payment_method'), async (columnName) => {
        const [rows] = await pool.query<mysql.RowDataPacket[]>(
          "SHOW COLUMNS FROM bookings LIKE ?",
          [columnName]
        );

        // payment_method column must exist on the bookings table
        // On unfixed code, this column does not exist (rows.length === 0)
        expect(rows.length).toBe(1);
        expect(rows[0].Field).toBe('payment_method');
      }),
      { numRuns: 1 }
    );
  });
});
