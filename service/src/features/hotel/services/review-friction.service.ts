/**
 * Review Friction Service
 *
 * Manages storage and retrieval of friction responses from hotel reviews.
 * Friction responses capture guest feedback about operational challenges:
 * - Lift/elevator delays
 * - Crowding at peak times
 * - Check-in experience smoothness
 *
 * These responses are used to calculate Experience Friction scores in the Manasik Score system.
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../../../database/connection';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FrictionType = 'lift_delays' | 'crowding' | 'checkin';
export type FrictionResponse = 'yes' | 'no' | 'na' | 'smooth' | 'average' | 'difficult';

export interface ReviewFrictionResponse {
  id: string;
  reviewId: string;
  hotelId: string;
  frictionType: FrictionType;
  response: FrictionResponse;
  createdAt: Date;
}

// ─── Validation ────────────────────────────────────────────────────────────────

const VALID_FRICTION_TYPES: FrictionType[] = ['lift_delays', 'crowding', 'checkin'];

const VALID_RESPONSES_BY_TYPE: Record<FrictionType, FrictionResponse[]> = {
  lift_delays: ['yes', 'no', 'na'],
  crowding: ['yes', 'no', 'na'],
  checkin: ['smooth', 'average', 'difficult', 'na'],
};

/**
 * Validates that frictionType is one of the allowed types
 * @param frictionType The friction type to validate
 * @throws Error if friction type is invalid
 */
function validateFrictionType(frictionType: string): asserts frictionType is FrictionType {
  if (!VALID_FRICTION_TYPES.includes(frictionType as FrictionType)) {
    throw new Error(
      `Invalid friction type: ${frictionType}. Must be one of: ${VALID_FRICTION_TYPES.join(', ')}`,
    );
  }
}

/**
 * Validates that response is valid for the given friction type
 * @param frictionType The friction type
 * @param response The response to validate
 * @throws Error if response is invalid for the friction type
 */
function validateResponse(frictionType: FrictionType, response: string): asserts response is FrictionResponse {
  const validResponses = VALID_RESPONSES_BY_TYPE[frictionType];
  if (!validResponses.includes(response as FrictionResponse)) {
    throw new Error(
      `Invalid response "${response}" for friction type "${frictionType}". Must be one of: ${validResponses.join(', ')}`,
    );
  }
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Stores a friction response from a review in the database.
 *
 * Validates that:
 * - frictionType is one of: lift_delays, crowding, checkin
 * - response is valid for the friction type
 * - reviewId and hotelId are provided
 *
 * Generates a UUID for the response ID and stores with current timestamp.
 *
 * @param reviewId The ID of the review this response belongs to
 * @param hotelId The ID of the hotel being reviewed
 * @param frictionType The type of friction (lift_delays, crowding, checkin)
 * @param response The guest's response to the friction question
 * @throws Error if validation fails or database operation fails
 */
export async function storeReviewFrictionResponse(
  reviewId: string,
  hotelId: string,
  frictionType: string,
  response: string,
): Promise<void> {
  try {
    // Validate inputs
    if (!reviewId || typeof reviewId !== 'string') {
      throw new Error('reviewId must be a non-empty string');
    }
    if (!hotelId || typeof hotelId !== 'string') {
      throw new Error('hotelId must be a non-empty string');
    }

    // Validate friction type
    validateFrictionType(frictionType);

    // Validate response for this friction type
    validateResponse(frictionType, response);

    // Generate UUID for the response
    const id = uuidv4();

    // Store in database
    const pool = getPool();
    await pool.query(
      `INSERT INTO review_friction_responses (id, review_id, hotel_id, friction_type, response, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [id, reviewId, hotelId, frictionType, response],
    );

    console.log(
      `Stored friction response: id=${id}, reviewId=${reviewId}, hotelId=${hotelId}, type=${frictionType}, response=${response}`,
    );
  } catch (error) {
    console.error('Error storing review friction response:', error);
    throw error;
  }
}

/**
 * Retrieves all friction responses for a hotel.
 *
 * Returns an array of friction responses with the following fields:
 * - review_id: The ID of the review
 * - friction_type: The type of friction (lift_delays, crowding, checkin)
 * - response: The guest's response (yes, no, na, smooth, average, difficult)
 * - created_at: When the response was recorded
 *
 * Results are ordered by creation date (oldest first).
 *
 * @param hotelId The ID of the hotel
 * @returns Array of friction responses for the hotel
 * @throws Error if database operation fails
 */
export async function getReviewFrictionResponses(hotelId: string): Promise<any[]> {
  try {
    if (!hotelId || typeof hotelId !== 'string') {
      throw new Error('hotelId must be a non-empty string');
    }

    const pool = getPool();
    const [responses] = await pool.query<any>(
      `SELECT review_id, friction_type, response, created_at 
       FROM review_friction_responses 
       WHERE hotel_id = ? 
       ORDER BY created_at ASC`,
      [hotelId],
    );

    console.log(`Retrieved ${responses?.length ?? 0} friction responses for hotel ${hotelId}`);
    return responses || [];
  } catch (error) {
    console.error('Error retrieving review friction responses:', error);
    throw error;
  }
}

/**
 * Deletes all friction responses for a specific review.
 *
 * This is typically called when a review is deleted to maintain referential integrity.
 * The database has a CASCADE DELETE constraint, but this function provides an explicit
 * way to clean up friction responses.
 *
 * @param reviewId The ID of the review whose friction responses should be deleted
 * @throws Error if database operation fails
 */
export async function deleteReviewFrictionResponses(reviewId: string): Promise<void> {
  try {
    if (!reviewId || typeof reviewId !== 'string') {
      throw new Error('reviewId must be a non-empty string');
    }

    const pool = getPool();
    const result = await pool.query(
      `DELETE FROM review_friction_responses WHERE review_id = ?`,
      [reviewId],
    );

    const affectedRows = (result as any)[0]?.affectedRows ?? 0;
    console.log(`Deleted ${affectedRows} friction responses for review ${reviewId}`);
  } catch (error) {
    console.error('Error deleting review friction responses:', error);
    throw error;
  }
}
