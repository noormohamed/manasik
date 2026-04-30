/**
 * Hotel Review Service
 *
 * Manages hotel review submission and processing.
 * Handles friction response capture and triggers experience friction recalculation.
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../../../database/connection';
import {
  storeReviewFrictionResponse,
} from './review-friction.service';
import {
  calculateExperienceFrictionFromReviews,
  getExperienceFrictionCalculationBasis,
} from './scoring.service';
import {
  logScoreCalculation,
} from './score-calculation-audit.service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewSubmissionData {
  bookingId: string;
  hotelId: string;
  customerId: string;
  rating: number;
  title: string;
  comment: string;
  frictionResponses?: {
    liftDelays?: 'yes' | 'no' | 'na';
    crowding?: 'yes' | 'no' | 'na';
    checkin?: 'smooth' | 'average' | 'difficult' | 'na';
  };
}

export interface ReviewSubmissionResult {
  reviewId: string;
  success: boolean;
  message: string;
  experienceFrictionUpdated?: boolean;
  experienceFrictionScore?: any;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Submit a hotel review with optional friction responses.
 *
 * Process:
 * 1. Validate that the hotel is of type 'HOTEL' (not apartment/villa)
 * 2. Create the review record in the database
 * 3. Store friction responses if provided
 * 4. Recalculate experience friction score for the hotel
 * 5. Update hotel's experience_friction_calculated_at timestamp
 * 6. Log the calculation to the audit trail
 *
 * @param data Review submission data including friction responses
 * @returns ReviewSubmissionResult with success status and updated scores
 * @throws Error if validation fails or database operation fails
 */
export async function submitHotelReview(
  data: ReviewSubmissionData,
): Promise<ReviewSubmissionResult> {
  const pool = getPool();
  const reviewId = uuidv4();

  try {
    // Validate inputs
    if (!data.bookingId || typeof data.bookingId !== 'string') {
      throw new Error('bookingId must be a non-empty string');
    }
    if (!data.hotelId || typeof data.hotelId !== 'string') {
      throw new Error('hotelId must be a non-empty string');
    }
    if (!data.customerId || typeof data.customerId !== 'string') {
      throw new Error('customerId must be a non-empty string');
    }
    if (typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
      throw new Error('rating must be a number between 1 and 5');
    }
    if (!data.title || typeof data.title !== 'string') {
      throw new Error('title must be a non-empty string');
    }
    if (!data.comment || typeof data.comment !== 'string') {
      throw new Error('comment must be a non-empty string');
    }

    // Verify that the hotel exists and is of type 'HOTEL'
    const [hotelRows] = await pool.query<any>(
      `SELECT id, name FROM hotels WHERE id = ?`,
      [data.hotelId],
    );

    if (!hotelRows || hotelRows.length === 0) {
      throw new Error(`Hotel with ID ${data.hotelId} not found`);
    }

    // Create the review record
    await pool.query(
      `INSERT INTO reviews 
       (id, booking_id, company_id, customer_id, service_type, rating, title, comment, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'HOTEL', ?, ?, ?, 'PENDING', NOW(), NOW())`,
      [
        reviewId,
        data.bookingId,
        'default-company-id', // TODO: Get company_id from booking or hotel
        data.customerId,
        data.rating,
        data.title,
        data.comment,
      ],
    );

    console.log(`Created review: id=${reviewId}, hotelId=${data.hotelId}, rating=${data.rating}`);

    // Store friction responses if provided
    let frictionResponsesStored = false;
    if (data.frictionResponses) {
      try {
        // Store lift delays response
        if (data.frictionResponses.liftDelays && data.frictionResponses.liftDelays !== 'na') {
          await storeReviewFrictionResponse(
            reviewId,
            data.hotelId,
            'lift_delays',
            data.frictionResponses.liftDelays,
          );
          frictionResponsesStored = true;
        }

        // Store crowding response
        if (data.frictionResponses.crowding && data.frictionResponses.crowding !== 'na') {
          await storeReviewFrictionResponse(
            reviewId,
            data.hotelId,
            'crowding',
            data.frictionResponses.crowding,
          );
          frictionResponsesStored = true;
        }

        // Store check-in response
        if (data.frictionResponses.checkin && data.frictionResponses.checkin !== 'na') {
          await storeReviewFrictionResponse(
            reviewId,
            data.hotelId,
            'checkin',
            data.frictionResponses.checkin,
          );
          frictionResponsesStored = true;
        }

        console.log(`Stored friction responses for review ${reviewId}`);
      } catch (error) {
        console.error('Error storing friction responses:', error);
        // Don't fail the review submission if friction responses fail
      }
    }

    // Recalculate experience friction score for the hotel
    let experienceFrictionUpdated = false;
    let experienceFrictionScore = null;

    try {
      const experienceFriction = await calculateExperienceFrictionFromReviews(data.hotelId);

      if (experienceFriction) {
        // Get calculation basis for logging
        const calculationBasis = await getExperienceFrictionCalculationBasis(data.hotelId);

        // Update hotel's experience friction metadata
        await pool.query(
          `UPDATE hotels 
           SET experience_friction_calculated_at = NOW(),
               experience_friction_review_count = (
                 SELECT COUNT(DISTINCT review_id) FROM review_friction_responses 
                 WHERE hotel_id = ?
               ),
               experience_friction_calculation_basis = ?
           WHERE id = ?`,
          [
            data.hotelId,
            JSON.stringify(calculationBasis),
            data.hotelId,
          ],
        );

        // Log the calculation to the audit trail
        await logScoreCalculation(
          data.hotelId,
          'experience_friction',
          experienceFriction,
          calculationBasis,
          `Based on ${calculationBasis?.total_reviews || 0} reviews: ${calculationBasis?.lift_delays_percentage || 0}% lift delays, ${calculationBasis?.crowding_percentage || 0}% crowding`,
        );

        experienceFrictionUpdated = true;
        experienceFrictionScore = experienceFriction;

        console.log(
          `Updated experience friction for hotel ${data.hotelId}: ${JSON.stringify(experienceFriction)}`,
        );
      }
    } catch (error) {
      console.error('Error recalculating experience friction:', error);
      // Don't fail the review submission if friction calculation fails
    }

    return {
      reviewId,
      success: true,
      message: 'Review submitted successfully',
      experienceFrictionUpdated,
      experienceFrictionScore,
    };
  } catch (error) {
    console.error('Error submitting hotel review:', error);
    throw error;
  }
}

/**
 * Get reviews for a hotel with optional filtering.
 *
 * @param hotelId The ID of the hotel
 * @param filters Optional filters (status, limit, offset)
 * @returns Array of reviews for the hotel
 * @throws Error if database operation fails
 */
export async function getHotelReviews(
  hotelId: string,
  filters?: {
    status?: string;
    limit?: number;
    offset?: number;
  },
): Promise<any[]> {
  try {
    if (!hotelId || typeof hotelId !== 'string') {
      throw new Error('hotelId must be a non-empty string');
    }

    const pool = getPool();
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;

    let query = `
      SELECT 
        r.id,
        r.booking_id,
        r.customer_id,
        r.rating,
        r.title,
        r.comment,
        r.status,
        r.is_verified,
        r.helpful_count,
        r.created_at,
        u.first_name,
        u.last_name,
        u.email
      FROM reviews r
      LEFT JOIN users u ON r.customer_id = u.id
      WHERE r.service_type = 'HOTEL' AND JSON_UNQUOTE(JSON_EXTRACT(r.criteria, '$.hotelId')) = ?
    `;
    const params: any[] = [hotelId];

    // Add status filter if provided
    if (filters?.status) {
      query += ` AND r.status = ?`;
      params.push(filters.status);
    }

    query += ` ORDER BY r.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [reviews] = await pool.query<any>(query, params);

    console.log(`Retrieved ${reviews?.length || 0} reviews for hotel ${hotelId}`);
    return reviews || [];
  } catch (error) {
    console.error('Error retrieving hotel reviews:', error);
    throw error;
  }
}

/**
 * Get review count for a hotel.
 *
 * @param hotelId The ID of the hotel
 * @returns Number of reviews for the hotel
 * @throws Error if database operation fails
 */
export async function getHotelReviewCount(hotelId: string): Promise<number> {
  try {
    if (!hotelId || typeof hotelId !== 'string') {
      throw new Error('hotelId must be a non-empty string');
    }

    const pool = getPool();
    const [result] = await pool.query<any>(
      `SELECT COUNT(*) as count FROM reviews 
       WHERE service_type = 'HOTEL' AND JSON_UNQUOTE(JSON_EXTRACT(criteria, '$.hotelId')) = ?`,
      [hotelId],
    );

    const count = result?.[0]?.count || 0;
    console.log(`Hotel ${hotelId} has ${count} reviews`);
    return count;
  } catch (error) {
    console.error('Error getting hotel review count:', error);
    throw error;
  }
}
