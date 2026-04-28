/**
 * Frontend scoring types and helpers.
 * Mirrors the backend scoring.service.ts so UIs can compute live previews
 * without a round-trip while editing or displaying hotel scores.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LocationScores {
  walkingTimeToHaram: number;   // 1–3
  gateProximity: number;        // 1–3
  routeEase: number;            // 1–3
}

export interface PilgrimSuitabilityScores {
  elderlyFriendliness: number;    // 1–3
  wheelchairFriendliness: number; // 1–3
  familySuitability: number;      // 1–3
  roomPracticality: number;       // 1–3
}

export interface HotelQualityScores {
  cleanliness: number;         // 1–3
  roomComfort: number;         // 1–3
  serviceConsistency: number;  // 1–3
}

export interface ExperienceFrictionScores {
  liftDelays: number;           // 1–3
  crowdingAtPeakTimes: number;  // 1–3
  checkinSmoothness: number;    // 1–3
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

// ─── Category metadata (labels, icons, characteristic labels) ─────────────────

export interface CharacteristicMeta {
  key: string;
  label: string;
}

export interface CategoryMeta {
  key: keyof ScoringData;
  label: string;
  icon: string;
  characteristics: CharacteristicMeta[];
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: 'location',
    label: 'Location',
    icon: '📍',
    characteristics: [
      { key: 'walkingTimeToHaram', label: 'Walking Time to Haram' },
      { key: 'gateProximity',      label: 'Gate Proximity' },
      { key: 'routeEase',          label: 'Route Ease' },
    ],
  },
  {
    key: 'pilgrimSuitability',
    label: 'Pilgrim Suitability',
    icon: '🕌',
    characteristics: [
      { key: 'elderlyFriendliness',    label: 'Elderly Friendliness' },
      { key: 'wheelchairFriendliness', label: 'Wheelchair Friendliness' },
      { key: 'familySuitability',      label: 'Family Suitability' },
      { key: 'roomPracticality',       label: 'Room Practicality' },
    ],
  },
  {
    key: 'hotelQuality',
    label: 'Hotel Quality',
    icon: '🏨',
    characteristics: [
      { key: 'cleanliness',        label: 'Cleanliness' },
      { key: 'roomComfort',        label: 'Room Comfort' },
      { key: 'serviceConsistency', label: 'Service Consistency' },
    ],
  },
  {
    key: 'experienceFriction',
    label: 'Experience Friction',
    icon: '⚡',
    characteristics: [
      { key: 'liftDelays',          label: 'Lift Delays' },
      { key: 'crowdingAtPeakTimes', label: 'Crowding at Peak Times' },
      { key: 'checkinSmoothness',   label: 'Check-in Smoothness' },
    ],
  },
];

export const DEFAULT_WEIGHTS: ScoringWeights = {
  location: 35,
  pilgrimSuitability: 25,
  hotelQuality: 20,
  experienceFriction: 10,
  userReviews: 10,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise 1–3 manager input to 0–10. */
export function normalise(input: number): number {
  const clamped = Math.min(3, Math.max(1, input));
  return ((clamped - 1) / 2) * 10;
}

/** Convert 0–5 star review average to 0–10. */
export function reviewRatingToScore(rating: number): number {
  return Math.min(10, Math.max(0, (rating / 5) * 10));
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Walking time (minutes) → 1–3 characteristic score. */
export function walkingTimeToScore(minutes: number): number {
  if (minutes <= 5)  return 3;
  if (minutes <= 12) return 2;
  return 1;
}

/**
 * Compute the full scoring breakdown client-side.
 * Used for live previews in the editor.
 */
export function computeScoring(
  data: ScoringData,
  weights: ScoringWeights,
  averageRating: number,
): ScoringBreakdown {
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
    weights.location + weights.pilgrimSuitability + weights.hotelQuality +
    weights.experienceFriction + weights.userReviews;

  const overall =
    Math.round(
      ((locationScore   * weights.location +
        pilgrimScore    * weights.pilgrimSuitability +
        qualityScore    * weights.hotelQuality +
        frictionScore   * weights.experienceFriction +
        reviewScore     * weights.userReviews) / totalWeight) * 10,
    ) / 10;

  return {
    overall,
    categories: {
      location:          { score: Math.round(locationScore  * 10) / 10, weight: weights.location },
      pilgrimSuitability:{ score: Math.round(pilgrimScore   * 10) / 10, weight: weights.pilgrimSuitability },
      hotelQuality:      { score: Math.round(qualityScore   * 10) / 10, weight: weights.hotelQuality },
      experienceFriction:{ score: Math.round(frictionScore  * 10) / 10, weight: weights.experienceFriction },
      userReviews:       { score: Math.round(reviewScore    * 10) / 10, weight: weights.userReviews },
    },
  };
}

/** Build a default ScoringData object (all characteristics = 2 = mid). */
export function defaultScoringData(): ScoringData {
  return {
    location:          { walkingTimeToHaram: 2, gateProximity: 2, routeEase: 2 },
    pilgrimSuitability:{ elderlyFriendliness: 2, wheelchairFriendliness: 2, familySuitability: 2, roomPracticality: 2 },
    hotelQuality:      { cleanliness: 2, roomComfort: 2, serviceConsistency: 2 },
    experienceFriction:{ liftDelays: 2, crowdingAtPeakTimes: 2, checkinSmoothness: 2 },
  };
}

/** Score colour based on value (0–10). Green for high scores, amber for everything else. */
export function scoreColour(score: number): string {
  if (score >= 8) return '#10b981'; // green
  return '#f59e0b';                  // amber
}
