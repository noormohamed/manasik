/**
 * Manasik Hotel Scoring Service
 *
 * Computes the weighted Manasik score from per-hotel characteristic inputs
 * and globally configured category weights.
 *
 * Characteristic inputs are on a 1–3 scale (entered by the hotel manager).
 * They are normalised to 0–10 before averaging and weighting.
 * The User Reviews category is derived from the verified review average.
 */

import { getPool } from '../../../database/connection';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationScores {
  /** Walking time to Haram / Masjid Nabawi.  1–3 */
  walkingTimeToHaram: number;
  /** How close and convenient the nearest gate is.  1–3 */
  gateProximity: number;
  /** Ease of navigating the route (steps, obstacles, shade).  1–3 */
  routeEase: number;
}

export interface PilgrimSuitabilityScores {
  /** Suitability for elderly guests.  1–3 */
  elderlyFriendliness: number;
  /** Wheelchair / mobility-aid friendliness.  1–3 */
  wheelchairFriendliness: number;
  /** Family suitability (space, facilities, connecting rooms).  1–3 */
  familySuitability: number;
  /** Room practicality for pilgrims (storage, prayer space, etc.).  1–3 */
  roomPracticality: number;
}

export interface HotelQualityScores {
  /** Cleanliness of rooms and common areas.  1–3 */
  cleanliness: number;
  /** Overall room comfort.  1–3 */
  roomComfort: number;
  /** Consistency of staff service.  1–3 */
  serviceConsistency: number;
}

export interface ExperienceFrictionScores {
  /** Lift / elevator delays and availability.  1–3 */
  liftDelays: number;
  /** Crowding during peak prayer and meal times.  1–3 */
  crowdingAtPeakTimes: number;
  /** Check-in / check-out process smoothness.  1–3 */
  checkinSmoothness: number;
}

export interface ScoringData {
  location: LocationScores;
  pilgrimSuitability: PilgrimSuitabilityScores;
  hotelQuality: HotelQualityScores;
  experienceFriction: ExperienceFrictionScores;
}

export interface ScoringWeights {
  location: number;            // e.g. 35
  pilgrimSuitability: number;  // e.g. 25
  hotelQuality: number;        // e.g. 20
  experienceFriction: number;  // e.g. 10
  userReviews: number;         // e.g. 10
}

export interface CategoryBreakdown {
  score: number;   // 0–10
  weight: number;  // %
}

export interface ScoringBreakdown {
  overall: number;
  categories: {
    location: CategoryBreakdown;
    pilgrimSuitability: CategoryBreakdown;
    hotelQuality: CategoryBreakdown;
    experienceFriction: CategoryBreakdown;
    userReviews: CategoryBreakdown;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_WEIGHTS: ScoringWeights = {
  location: 35,
  pilgrimSuitability: 25,
  hotelQuality: 20,
  experienceFriction: 10,
  userReviews: 10,
};

/**
 * Auto-score walking time to Haram based on the user-defined thresholds.
 * Returns a 1–3 score.
 */
export function walkingTimeToScore(minutes: number): number {
  if (minutes <= 3)  return 3;   // 10/10 → top of 1–3
  if (minutes <= 5)  return 3;   // 9/10  → still top
  if (minutes <= 8)  return 2;   // 7.5/10 → mid
  if (minutes <= 12) return 2;   // 6/10  → mid
  return 1;                      // 4/10  → low
}

// ─── Normalisation ────────────────────────────────────────────────────────────

/**
 * Normalise a 1–3 manager input to a 0–10 display score.
 * 1 → 0, 2 → 5, 3 → 10
 */
export function normalise(input: number): number {
  const clamped = Math.min(3, Math.max(1, input));
  return ((clamped - 1) / 2) * 10;
}

/**
 * Convert a review average (0–5 stars) to a 0–10 score.
 */
export function reviewRatingToScore(rating: number): number {
  return Math.min(10, Math.max(0, (rating / 5) * 10));
}

/**
 * Average an array of 0–10 values.
 */
function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ─── Core calculation ─────────────────────────────────────────────────────────

/**
 * Compute the full scoring breakdown from characteristic data, weights and the
 * hotel's verified review average.
 */
export function computeScoring(
  data: ScoringData,
  weights: ScoringWeights,
  averageRating: number,
): ScoringBreakdown {
  // Category raw scores (0–10 each)
  const locationScore = avg([
    normalise(data.location.walkingTimeToHaram),
    normalise(data.location.gateProximity),
    normalise(data.location.routeEase),
  ]);

  const pilgrimScore = avg([
    normalise(data.pilgrimSuitability.elderlyFriendliness),
    normalise(data.pilgrimSuitability.wheelchairFriendliness),
    normalise(data.pilgrimSuitability.familySuitability),
    normalise(data.pilgrimSuitability.roomPracticality),
  ]);

  const qualityScore = avg([
    normalise(data.hotelQuality.cleanliness),
    normalise(data.hotelQuality.roomComfort),
    normalise(data.hotelQuality.serviceConsistency),
  ]);

  const frictionScore = avg([
    normalise(data.experienceFriction.liftDelays),
    normalise(data.experienceFriction.crowdingAtPeakTimes),
    normalise(data.experienceFriction.checkinSmoothness),
  ]);

  const reviewScore = reviewRatingToScore(averageRating);

  const totalWeight =
    weights.location +
    weights.pilgrimSuitability +
    weights.hotelQuality +
    weights.experienceFriction +
    weights.userReviews;

  // Weighted overall (normalised to 0–10 regardless of weight total)
  const overall = Math.round(
    ((locationScore    * weights.location +
      pilgrimScore     * weights.pilgrimSuitability +
      qualityScore     * weights.hotelQuality +
      frictionScore    * weights.experienceFriction +
      reviewScore      * weights.userReviews) / totalWeight) * 10,
  ) / 10;

  return {
    overall,
    categories: {
      location:          { score: Math.round(locationScore * 10) / 10, weight: weights.location },
      pilgrimSuitability:{ score: Math.round(pilgrimScore  * 10) / 10, weight: weights.pilgrimSuitability },
      hotelQuality:      { score: Math.round(qualityScore  * 10) / 10, weight: weights.hotelQuality },
      experienceFriction:{ score: Math.round(frictionScore * 10) / 10, weight: weights.experienceFriction },
      userReviews:       { score: Math.round(reviewScore   * 10) / 10, weight: weights.userReviews },
    },
  };
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

/**
 * Load the current global scoring weights from the database.
 * Falls back to DEFAULT_WEIGHTS if no row exists.
 */
export async function loadWeights(): Promise<ScoringWeights> {
  try {
    const pool = getPool();
    const [rows] = await pool.query<any>(
      'SELECT * FROM scoring_weights ORDER BY id ASC LIMIT 1',
    );
    if (rows && rows.length > 0) {
      const r = rows[0];
      return {
        location:           parseFloat(r.location_weight),
        pilgrimSuitability: parseFloat(r.pilgrim_suitability_weight),
        hotelQuality:       parseFloat(r.hotel_quality_weight),
        experienceFriction: parseFloat(r.experience_friction_weight),
        userReviews:        parseFloat(r.user_reviews_weight),
      };
    }
  } catch (e) {
    console.error('Failed to load scoring weights, using defaults:', e);
  }
  return { ...DEFAULT_WEIGHTS };
}

/**
 * Persist updated global scoring weights.
 * Upserts the single config row.
 */
export async function saveWeights(
  weights: ScoringWeights,
  updatedBy?: string,
): Promise<void> {
  const pool = getPool();
  const [existing] = await pool.query<any>(
    'SELECT id FROM scoring_weights LIMIT 1',
  );
  if (existing && existing.length > 0) {
    await pool.execute(
      `UPDATE scoring_weights SET
        location_weight = ?,
        pilgrim_suitability_weight = ?,
        hotel_quality_weight = ?,
        experience_friction_weight = ?,
        user_reviews_weight = ?,
        updated_by = ?,
        updated_at = NOW()
       WHERE id = ?`,
      [
        weights.location,
        weights.pilgrimSuitability,
        weights.hotelQuality,
        weights.experienceFriction,
        weights.userReviews,
        updatedBy ?? null,
        existing[0].id,
      ],
    );
  } else {
    await pool.execute(
      `INSERT INTO scoring_weights
        (location_weight, pilgrim_suitability_weight, hotel_quality_weight,
         experience_friction_weight, user_reviews_weight, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        weights.location,
        weights.pilgrimSuitability,
        weights.hotelQuality,
        weights.experienceFriction,
        weights.userReviews,
        updatedBy ?? null,
      ],
    );
  }
}

/**
 * Validate that weights object has valid values summing to 100 (±0.01 tolerance).
 */
export function validateWeights(weights: ScoringWeights): string | null {
  const keys: (keyof ScoringWeights)[] = [
    'location', 'pilgrimSuitability', 'hotelQuality', 'experienceFriction', 'userReviews',
  ];
  for (const key of keys) {
    if (typeof weights[key] !== 'number' || weights[key] < 0 || weights[key] > 100) {
      return `Weight for "${key}" must be a number between 0 and 100`;
    }
  }
  const total = keys.reduce((sum, k) => sum + weights[k], 0);
  if (Math.abs(total - 100) > 0.01) {
    return `Weights must sum to 100 (current total: ${total.toFixed(2)})`;
  }
  return null;
}

/**
 * Parse scoring_data from DB row (handles both string and object).
 */
export function parseScoringData(raw: any): ScoringData | null {
  if (!raw) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

/**
 * Build a default ScoringData object (all characteristics set to 2 = mid).
 */
export function defaultScoringData(): ScoringData {
  return {
    location: { walkingTimeToHaram: 2, gateProximity: 2, routeEase: 2 },
    pilgrimSuitability: {
      elderlyFriendliness: 2,
      wheelchairFriendliness: 2,
      familySuitability: 2,
      roomPracticality: 2,
    },
    hotelQuality: { cleanliness: 2, roomComfort: 2, serviceConsistency: 2 },
    experienceFriction: { liftDelays: 2, crowdingAtPeakTimes: 2, checkinSmoothness: 2 },
  };
}

/**
 * Clamp a value to 1–3.
 */
function clamp13(v: number): number {
  return Math.min(3, Math.max(1, Math.round(v)));
}

/**
 * Map a star rating (1–5) to a 1–3 characteristic score.
 * 1–2 stars → 1, 3 stars → 2, 4–5 stars → 3
 */
function starToScore(stars: number): number {
  if (stars >= 4) return 3;
  if (stars >= 3) return 2;
  return 1;
}

/**
 * Auto-derive ScoringData from a raw hotel DB row when the manager has not
 * entered explicit scores yet.  Uses existing fields:
 *   walking_time_to_haram, distance_to_haram_meters,
 *   is_elderly_friendly, has_family_rooms, star_rating
 *
 * The derived flag is returned alongside so callers can mark the breakdown
 * as estimated rather than manager-verified.
 */
export function deriveFromHotelRow(row: any): { data: ScoringData; derived: true } {
  const walkMins: number     = row.walking_time_to_haram    ?? 15;
  const distMeters: number   = row.distance_to_haram_meters ?? 1500;
  const isElderly: boolean   = !!(row.is_elderly_friendly);
  const hasFamilyRooms: boolean = !!(row.has_family_rooms);
  const stars: number        = row.star_rating              ?? 3;

  // Location
  const walkScore  = walkingTimeToScore(walkMins);  // already 1–3
  const gateScore  = clamp13(distMeters <= 200 ? 3 : distMeters <= 600 ? 2 : 1);
  const routeScore = 2; // unknown without specific info — default mid

  // Pilgrim Suitability
  const elderlyScore    = isElderly ? 3 : 1;
  const wheelchairScore = isElderly ? 2 : 1;
  const familyScore     = hasFamilyRooms ? 3 : 1;
  const roomScore       = starToScore(stars);

  // Hotel Quality  (star-based proxy)
  const cleanScore   = starToScore(stars);
  const comfortScore = starToScore(stars);
  const serviceScore = starToScore(stars);

  // Experience Friction  (star-based proxy — higher star = less friction)
  const liftScore      = starToScore(stars);
  const crowdScore     = 2; // unknown — default mid
  const checkinScore   = starToScore(stars);

  const data: ScoringData = {
    location: {
      walkingTimeToHaram: walkScore,
      gateProximity:      gateScore,
      routeEase:          routeScore,
    },
    pilgrimSuitability: {
      elderlyFriendliness:    elderlyScore,
      wheelchairFriendliness: wheelchairScore,
      familySuitability:      familyScore,
      roomPracticality:       roomScore,
    },
    hotelQuality: {
      cleanliness:        cleanScore,
      roomComfort:        comfortScore,
      serviceConsistency: serviceScore,
    },
    experienceFriction: {
      liftDelays:           liftScore,
      crowdingAtPeakTimes:  crowdScore,
      checkinSmoothness:    checkinScore,
    },
  };

  return { data, derived: true };
}

// ─── Location Calculation Functions ───────────────────────────────────────────

/**
 * Calculate walking time score from distance in meters.
 * Formula: distance / 1.4 / 60, rounded to nearest minute
 * Returns 1-3 score based on minutes (≤3min=3, ≤5min=3, ≤8min=2, ≤12min=2, >12min=1)
 *
 * @param distanceMeters Distance from hotel to Haram gate in meters
 * @returns Score 1-3 representing walking time difficulty
 */
export function calculateWalkingTimeFromDistance(distanceMeters: number): number {
  // Calculate walking time in minutes using standard pilgrim pace of 1.4 m/s
  const walkingTimeMinutes = Math.round(distanceMeters / 1.4 / 60);
  
  // Convert minutes to 1-3 score using the same thresholds as walkingTimeToScore
  return walkingTimeToScore(walkingTimeMinutes);
}

/**
 * Calculate route ease score from distance and optional terrain data.
 * Base scoring: <200m=3, 200-500m=2, >500m=1
 * Adjustments: elevation changes (>20m) -1, stairs required -1, wheelchair accessible +1
 * Returns 1-3 score clamped to valid range.
 *
 * @param distanceMeters Distance from hotel to Haram gate in meters
 * @param terrainData Optional object with elevation, hasStairs, wheelchairAccessible properties
 * @returns Score 1-3 representing route ease
 */
export function calculateRouteEaseFromDistance(
  distanceMeters: number,
  terrainData?: any,
): number {
  // Base score from distance
  let score: number;
  if (distanceMeters < 200) {
    score = 3;
  } else if (distanceMeters <= 500) {
    score = 2;
  } else {
    score = 1;
  }

  // Apply terrain adjustments if provided
  if (terrainData) {
    // Reduce score for significant elevation changes (>20 meters)
    if (terrainData.elevation && terrainData.elevation > 20) {
      score -= 1;
    }

    // Reduce score if stairs are required
    if (terrainData.hasStairs) {
      score -= 1;
    }

    // Increase score if wheelchair accessible (but minimum is 2 = "Average")
    if (terrainData.wheelchairAccessible) {
      score = Math.min(3, score + 1);
      score = Math.max(2, score); // Ensure minimum of 2 for accessible routes
    }
  }

  // Clamp to valid 1-3 range
  return clamp13(score);
}

/**
 * Calculate all location metrics from gate proximity distance.
 * Returns LocationScores object with calculated walking time, gate proximity, and route ease.
 *
 * @param gateProximityMeters Distance from hotel to nearest Haram gate in meters
 * @param terrainData Optional terrain information for route ease calculation
 * @returns LocationScores object with all three metrics calculated
 */
export function calculateLocationMetrics(
  gateProximityMeters: number,
  terrainData?: any,
): LocationScores {
  return {
    walkingTimeToHaram: calculateWalkingTimeFromDistance(gateProximityMeters),
    gateProximity: clamp13(
      gateProximityMeters < 200 ? 3 : gateProximityMeters <= 500 ? 2 : 1,
    ),
    routeEase: calculateRouteEaseFromDistance(gateProximityMeters, terrainData),
  };
}

// ─── Experience Friction Calculation Functions ────────────────────────────────

/**
 * Convert a percentage value to a 1-3 score.
 * 0-33% = 3 (Good), 34-66% = 2 (Average), 67-100% = 1 (Poor)
 *
 * @param percentage Percentage value (0-100)
 * @returns Score 1-3
 */
function percentageToScore(percentage: number): number {
  if (percentage <= 33) return 3;
  if (percentage <= 66) return 2;
  return 1;
}

/**
 * Calculate Experience Friction scores from review friction responses.
 * Queries the review_friction_responses table for the hotel and aggregates responses.
 * Returns null if fewer than 5 reviews exist.
 *
 * Calculation:
 * - Lift Delays: percentage of "yes" responses / total applicable responses
 * - Crowding: percentage of "yes" responses / total applicable responses
 * - Check-in: average of responses (smooth=3, average=2, difficult=1)
 *
 * Percentages are converted to 1-3 scores:
 * - 0-33% = 3 (Good)
 * - 34-66% = 2 (Average)
 * - 67-100% = 1 (Poor)
 *
 * @param hotelId Hotel ID to calculate friction for
 * @returns ExperienceFrictionScores object or null if insufficient data
 */
export async function calculateExperienceFrictionFromReviews(
  hotelId: string,
): Promise<ExperienceFrictionScores | null> {
  try {
    const pool = getPool();

    // Query all friction responses for this hotel
    const [responses] = await pool.query<any>(
      `SELECT friction_type, response FROM review_friction_responses 
       WHERE hotel_id = ? 
       ORDER BY created_at ASC`,
      [hotelId],
    );

    if (!responses || responses.length === 0) {
      return null;
    }

    // Count unique reviews (by grouping responses)
    const reviewIds = new Set<string>();
    const [reviewData] = await pool.query<any>(
      `SELECT DISTINCT review_id FROM review_friction_responses 
       WHERE hotel_id = ?`,
      [hotelId],
    );

    const totalReviews = reviewData?.length ?? 0;

    // If fewer than 5 reviews, return null (insufficient data)
    if (totalReviews < 5) {
      return null;
    }

    // Aggregate responses by friction type
    const liftDelaysResponses: string[] = [];
    const crowdingResponses: string[] = [];
    const checkinResponses: string[] = [];

    for (const row of responses) {
      if (row.friction_type === 'lift_delays' && row.response !== 'na') {
        liftDelaysResponses.push(row.response);
      } else if (row.friction_type === 'crowding' && row.response !== 'na') {
        crowdingResponses.push(row.response);
      } else if (row.friction_type === 'checkin' && row.response !== 'na') {
        checkinResponses.push(row.response);
      }
    }

    // Calculate lift delays percentage
    let liftDelaysScore = 2; // Default to average if no data
    if (liftDelaysResponses.length > 0) {
      const liftDelaysYes = liftDelaysResponses.filter(r => r === 'yes').length;
      const liftDelaysPercentage = (liftDelaysYes / liftDelaysResponses.length) * 100;
      liftDelaysScore = percentageToScore(liftDelaysPercentage);
    }

    // Calculate crowding percentage
    let crowdingScore = 2; // Default to average if no data
    if (crowdingResponses.length > 0) {
      const crowdingYes = crowdingResponses.filter(r => r === 'yes').length;
      const crowdingPercentage = (crowdingYes / crowdingResponses.length) * 100;
      crowdingScore = percentageToScore(crowdingPercentage);
    }

    // Calculate check-in average
    let checkinScore = 2; // Default to average if no data
    if (checkinResponses.length > 0) {
      const checkinValues = checkinResponses.map(r => {
        if (r === 'smooth') return 3;
        if (r === 'average') return 2;
        if (r === 'difficult') return 1;
        return 2; // Default to average for unknown values
      });
      const checkinAverage = checkinValues.reduce((a, b) => a + b, 0) / checkinValues.length;
      // Convert average (1-3) to percentage (0-100) then to score
      const checkinPercentage = ((checkinAverage - 1) / 2) * 100;
      checkinScore = percentageToScore(checkinPercentage);
    }

    return {
      liftDelays: liftDelaysScore,
      crowdingAtPeakTimes: crowdingScore,
      checkinSmoothness: checkinScore,
    };
  } catch (error) {
    console.error('Error calculating experience friction from reviews:', error);
    return null;
  }
}

/**
 * Get the calculation basis for Experience Friction scores.
 * Returns an object with review counts per friction type and calculated percentages.
 *
 * @param hotelId Hotel ID to get calculation basis for
 * @returns Object with friction response counts and percentages, or null if no data
 */
export async function getExperienceFrictionCalculationBasis(
  hotelId: string,
): Promise<any> {
  try {
    const pool = getPool();

    // Query all friction responses for this hotel
    const [responses] = await pool.query<any>(
      `SELECT friction_type, response FROM review_friction_responses 
       WHERE hotel_id = ? 
       ORDER BY created_at ASC`,
      [hotelId],
    );

    if (!responses || responses.length === 0) {
      return null;
    }

    // Count unique reviews
    const [reviewData] = await pool.query<any>(
      `SELECT DISTINCT review_id FROM review_friction_responses 
       WHERE hotel_id = ?`,
      [hotelId],
    );

    const totalReviews = reviewData?.length ?? 0;

    // Aggregate responses by friction type
    const liftDelaysResponses: string[] = [];
    const crowdingResponses: string[] = [];
    const checkinResponses: string[] = [];

    for (const row of responses) {
      if (row.friction_type === 'lift_delays' && row.response !== 'na') {
        liftDelaysResponses.push(row.response);
      } else if (row.friction_type === 'crowding' && row.response !== 'na') {
        crowdingResponses.push(row.response);
      } else if (row.friction_type === 'checkin' && row.response !== 'na') {
        checkinResponses.push(row.response);
      }
    }

    // Calculate percentages
    const liftDelaysYes = liftDelaysResponses.filter(r => r === 'yes').length;
    const liftDelaysPercentage = liftDelaysResponses.length > 0
      ? Math.round((liftDelaysYes / liftDelaysResponses.length) * 100)
      : 0;

    const crowdingYes = crowdingResponses.filter(r => r === 'yes').length;
    const crowdingPercentage = crowdingResponses.length > 0
      ? Math.round((crowdingYes / crowdingResponses.length) * 100)
      : 0;

    // Count check-in responses by type
    const checkinSmoothCount = checkinResponses.filter(r => r === 'smooth').length;
    const checkinAverageCount = checkinResponses.filter(r => r === 'average').length;
    const checkinDifficultCount = checkinResponses.filter(r => r === 'difficult').length;

    return {
      total_reviews: totalReviews,
      lift_delays_count: liftDelaysResponses.length,
      lift_delays_yes_count: liftDelaysYes,
      lift_delays_percentage: liftDelaysPercentage,
      crowding_count: crowdingResponses.length,
      crowding_yes_count: crowdingYes,
      crowding_percentage: crowdingPercentage,
      checkin_smooth_count: checkinSmoothCount,
      checkin_average_count: checkinAverageCount,
      checkin_difficult_count: checkinDifficultCount,
      checkin_total_count: checkinResponses.length,
    };
  } catch (error) {
    console.error('Error getting experience friction calculation basis:', error);
    return null;
  }
}
