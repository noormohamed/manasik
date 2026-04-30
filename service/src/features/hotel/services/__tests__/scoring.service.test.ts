/**
 * Unit tests for Scoring Service
 * Tests location metrics calculation and experience friction calculation functions
 */

import {
  calculateWalkingTimeFromDistance,
  calculateRouteEaseFromDistance,
  calculateLocationMetrics,
  calculateExperienceFrictionFromReviews,
  getExperienceFrictionCalculationBasis,
  walkingTimeToScore,
  normalise,
  computeScoring,
  defaultScoringData,
  DEFAULT_WEIGHTS,
} from '../scoring.service';
import { getPool } from '../../../../database/connection';

// Mock the database connection
jest.mock('../../../../database/connection');

describe('Scoring Service', () => {
  let mockPool: any;

  beforeEach(() => {
    mockPool = {
      query: jest.fn(),
      execute: jest.fn(),
    };
    (getPool as jest.Mock).mockReturnValue(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ─── Location Metrics Tests ───────────────────────────────────────────────

  describe('calculateWalkingTimeFromDistance', () => {
    it('should calculate walking time score for short distances', () => {
      // 280 meters at 1.4 m/s = 200 seconds = 3.33 minutes ≈ 3 minutes → score 3
      const score = calculateWalkingTimeFromDistance(280);
      expect(score).toBe(3);
    });

    it('should calculate walking time score for medium distances', () => {
      // 420 meters at 1.4 m/s = 300 seconds = 5 minutes → score 3
      const score = calculateWalkingTimeFromDistance(420);
      expect(score).toBe(3);
    });

    it('should calculate walking time score for longer distances', () => {
      // 672 meters at 1.4 m/s = 480 seconds = 8 minutes → score 2
      const score = calculateWalkingTimeFromDistance(672);
      expect(score).toBe(2);
    });

    it('should calculate walking time score for very long distances', () => {
      // 1008 meters at 1.4 m/s = 720 seconds = 12 minutes → score 2
      const score = calculateWalkingTimeFromDistance(1008);
      expect(score).toBe(2);
    });

    it('should calculate walking time score for extremely long distances', () => {
      // 1400 meters at 1.4 m/s = 1000 seconds = 16.67 minutes ≈ 17 minutes → score 1
      const score = calculateWalkingTimeFromDistance(1400);
      expect(score).toBe(1);
    });

    it('should handle zero distance', () => {
      const score = calculateWalkingTimeFromDistance(0);
      expect(score).toBe(3); // 0 minutes → score 3
    });
  });

  describe('calculateRouteEaseFromDistance', () => {
    it('should assign score 3 for distances < 200m', () => {
      const score = calculateRouteEaseFromDistance(150);
      expect(score).toBe(3);
    });

    it('should assign score 2 for distances 200-500m', () => {
      const score = calculateRouteEaseFromDistance(350);
      expect(score).toBe(2);
    });

    it('should assign score 1 for distances > 500m', () => {
      const score = calculateRouteEaseFromDistance(600);
      expect(score).toBe(1);
    });

    it('should reduce score for significant elevation changes', () => {
      // Base score 3 (< 200m), reduced by 1 for elevation > 20m
      const score = calculateRouteEaseFromDistance(150, { elevation: 25 });
      expect(score).toBe(2);
    });

    it('should reduce score for stairs', () => {
      // Base score 3 (< 200m), reduced by 1 for stairs
      const score = calculateRouteEaseFromDistance(150, { hasStairs: true });
      expect(score).toBe(2);
    });

    it('should reduce score for both elevation and stairs', () => {
      // Base score 3 (< 200m), reduced by 2 for elevation and stairs
      const score = calculateRouteEaseFromDistance(150, {
        elevation: 25,
        hasStairs: true,
      });
      expect(score).toBe(1);
    });

    it('should increase score for wheelchair accessibility', () => {
      // Base score 1 (> 500m), increased by 1 for wheelchair accessible
      const score = calculateRouteEaseFromDistance(600, {
        wheelchairAccessible: true,
      });
      expect(score).toBe(2);
    });

    it('should clamp wheelchair accessible score to minimum 2', () => {
      // Base score 1 (> 500m), increased by 1 for wheelchair accessible → 2
      const score = calculateRouteEaseFromDistance(600, {
        wheelchairAccessible: true,
      });
      expect(score).toBeGreaterThanOrEqual(2);
    });

    it('should clamp score to valid 1-3 range', () => {
      // Base score 1, reduced by 2 for elevation and stairs → should clamp to 1
      const score = calculateRouteEaseFromDistance(600, {
        elevation: 25,
        hasStairs: true,
      });
      expect(score).toBeGreaterThanOrEqual(1);
      expect(score).toBeLessThanOrEqual(3);
    });
  });

  describe('calculateLocationMetrics', () => {
    it('should calculate all location metrics from gate proximity', () => {
      const metrics = calculateLocationMetrics(350);
      
      expect(metrics).toHaveProperty('walkingTimeToHaram');
      expect(metrics).toHaveProperty('gateProximity');
      expect(metrics).toHaveProperty('routeEase');
      
      expect(metrics.walkingTimeToHaram).toBeGreaterThanOrEqual(1);
      expect(metrics.walkingTimeToHaram).toBeLessThanOrEqual(3);
      expect(metrics.gateProximity).toBeGreaterThanOrEqual(1);
      expect(metrics.gateProximity).toBeLessThanOrEqual(3);
      expect(metrics.routeEase).toBeGreaterThanOrEqual(1);
      expect(metrics.routeEase).toBeLessThanOrEqual(3);
    });

    it('should calculate metrics with terrain data', () => {
      const metrics = calculateLocationMetrics(350, {
        elevation: 15,
        hasStairs: false,
        wheelchairAccessible: true,
      });
      
      // 350m at 1.4 m/s = 250 seconds = 4.17 minutes → score 3
      expect(metrics.walkingTimeToHaram).toBe(3);
      expect(metrics.gateProximity).toBe(2);
      expect(metrics.routeEase).toBeGreaterThanOrEqual(1);
      expect(metrics.routeEase).toBeLessThanOrEqual(3);
    });
  });

  // ─── Experience Friction Tests ────────────────────────────────────────────

  describe('calculateExperienceFrictionFromReviews', () => {
    it('should return null when no friction responses exist', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);
      
      const result = await calculateExperienceFrictionFromReviews('hotel-123');
      
      expect(result).toBeNull();
    });

    it('should return null when fewer than 5 reviews exist', async () => {
      mockPool.query
        .mockResolvedValueOnce([[
          { friction_type: 'lift_delays', response: 'yes' },
          { friction_type: 'crowding', response: 'no' },
          { friction_type: 'checkin', response: 'smooth' },
        ]])
        .mockResolvedValueOnce([[
          { review_id: 'review-1' },
          { review_id: 'review-2' },
          { review_id: 'review-3' },
        ]]);
      
      const result = await calculateExperienceFrictionFromReviews('hotel-123');
      
      expect(result).toBeNull();
    });

    it('should calculate friction scores with sufficient reviews', async () => {
      const frictionResponses = [
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'lift_delays', response: 'no' },
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'crowding', response: 'yes' },
        { friction_type: 'crowding', response: 'yes' },
        { friction_type: 'crowding', response: 'no' },
        { friction_type: 'checkin', response: 'smooth' },
        { friction_type: 'checkin', response: 'smooth' },
        { friction_type: 'checkin', response: 'average' },
      ];

      mockPool.query
        .mockResolvedValueOnce([frictionResponses])
        .mockResolvedValueOnce([[
          { review_id: 'review-1' },
          { review_id: 'review-2' },
          { review_id: 'review-3' },
          { review_id: 'review-4' },
          { review_id: 'review-5' },
        ]]);
      
      const result = await calculateExperienceFrictionFromReviews('hotel-123');
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('liftDelays');
      expect(result).toHaveProperty('crowdingAtPeakTimes');
      expect(result).toHaveProperty('checkinSmoothness');
      
      // Verify scores are in valid range
      expect(result!.liftDelays).toBeGreaterThanOrEqual(1);
      expect(result!.liftDelays).toBeLessThanOrEqual(3);
      expect(result!.crowdingAtPeakTimes).toBeGreaterThanOrEqual(1);
      expect(result!.crowdingAtPeakTimes).toBeLessThanOrEqual(3);
      expect(result!.checkinSmoothness).toBeGreaterThanOrEqual(1);
      expect(result!.checkinSmoothness).toBeLessThanOrEqual(3);
    });

    it('should handle "na" responses by excluding them', async () => {
      const frictionResponses = [
        { friction_type: 'lift_delays', response: 'na' },
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'crowding', response: 'na' },
        { friction_type: 'crowding', response: 'no' },
        { friction_type: 'checkin', response: 'smooth' },
      ];

      mockPool.query
        .mockResolvedValueOnce([frictionResponses])
        .mockResolvedValueOnce([[
          { review_id: 'review-1' },
          { review_id: 'review-2' },
          { review_id: 'review-3' },
          { review_id: 'review-4' },
          { review_id: 'review-5' },
        ]]);
      
      const result = await calculateExperienceFrictionFromReviews('hotel-123');
      
      expect(result).not.toBeNull();
      // Should only count non-na responses
      expect(result!.liftDelays).toBeDefined();
      expect(result!.crowdingAtPeakTimes).toBeDefined();
    });

    it('should calculate correct percentage for lift delays', async () => {
      // 2 out of 3 "yes" responses = 66.67% → score 1 (Poor)
      const frictionResponses = [
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'lift_delays', response: 'no' },
        { friction_type: 'crowding', response: 'no' },
        { friction_type: 'checkin', response: 'smooth' },
      ];

      mockPool.query
        .mockResolvedValueOnce([frictionResponses])
        .mockResolvedValueOnce([[
          { review_id: 'review-1' },
          { review_id: 'review-2' },
          { review_id: 'review-3' },
          { review_id: 'review-4' },
          { review_id: 'review-5' },
        ]]);
      
      const result = await calculateExperienceFrictionFromReviews('hotel-123');
      
      expect(result).not.toBeNull();
      expect(result!.liftDelays).toBe(1); // 66.67% → Poor
    });

    it('should calculate correct average for check-in smoothness', async () => {
      // 2 smooth (3) + 1 average (2) = average 2.67 → 83.33% → score 1 (Poor)
      const frictionResponses = [
        { friction_type: 'lift_delays', response: 'no' },
        { friction_type: 'crowding', response: 'no' },
        { friction_type: 'checkin', response: 'smooth' },
        { friction_type: 'checkin', response: 'smooth' },
        { friction_type: 'checkin', response: 'average' },
      ];

      mockPool.query
        .mockResolvedValueOnce([frictionResponses])
        .mockResolvedValueOnce([[
          { review_id: 'review-1' },
          { review_id: 'review-2' },
          { review_id: 'review-3' },
          { review_id: 'review-4' },
          { review_id: 'review-5' },
        ]]);
      
      const result = await calculateExperienceFrictionFromReviews('hotel-123');
      
      expect(result).not.toBeNull();
      expect(result!.checkinSmoothness).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await calculateExperienceFrictionFromReviews('hotel-123');
      
      expect(result).toBeNull();
    });
  });

  describe('getExperienceFrictionCalculationBasis', () => {
    it('should return null when no friction responses exist', async () => {
      mockPool.query.mockResolvedValueOnce([[]]);
      
      const result = await getExperienceFrictionCalculationBasis('hotel-123');
      
      expect(result).toBeNull();
    });

    it('should return calculation basis with review counts and percentages', async () => {
      const frictionResponses = [
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'lift_delays', response: 'no' },
        { friction_type: 'crowding', response: 'yes' },
        { friction_type: 'crowding', response: 'yes' },
        { friction_type: 'checkin', response: 'smooth' },
        { friction_type: 'checkin', response: 'average' },
        { friction_type: 'checkin', response: 'difficult' },
      ];

      mockPool.query
        .mockResolvedValueOnce([frictionResponses])
        .mockResolvedValueOnce([[
          { review_id: 'review-1' },
          { review_id: 'review-2' },
          { review_id: 'review-3' },
          { review_id: 'review-4' },
          { review_id: 'review-5' },
        ]]);
      
      const result = await getExperienceFrictionCalculationBasis('hotel-123');
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('total_reviews');
      expect(result).toHaveProperty('lift_delays_count');
      expect(result).toHaveProperty('lift_delays_yes_count');
      expect(result).toHaveProperty('lift_delays_percentage');
      expect(result).toHaveProperty('crowding_count');
      expect(result).toHaveProperty('crowding_yes_count');
      expect(result).toHaveProperty('crowding_percentage');
      expect(result).toHaveProperty('checkin_smooth_count');
      expect(result).toHaveProperty('checkin_average_count');
      expect(result).toHaveProperty('checkin_difficult_count');
      expect(result).toHaveProperty('checkin_total_count');
    });

    it('should calculate correct percentages', async () => {
      const frictionResponses = [
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'lift_delays', response: 'no' },
        { friction_type: 'crowding', response: 'no' },
        { friction_type: 'checkin', response: 'smooth' },
      ];

      mockPool.query
        .mockResolvedValueOnce([frictionResponses])
        .mockResolvedValueOnce([[
          { review_id: 'review-1' },
          { review_id: 'review-2' },
          { review_id: 'review-3' },
          { review_id: 'review-4' },
          { review_id: 'review-5' },
        ]]);
      
      const result = await getExperienceFrictionCalculationBasis('hotel-123');
      
      expect(result).not.toBeNull();
      expect(result!.total_reviews).toBe(5);
      expect(result!.lift_delays_count).toBe(3);
      expect(result!.lift_delays_yes_count).toBe(2);
      expect(result!.lift_delays_percentage).toBe(67); // 2/3 = 66.67% ≈ 67%
      expect(result!.crowding_count).toBe(1);
      expect(result!.crowding_yes_count).toBe(0);
      expect(result!.crowding_percentage).toBe(0);
      expect(result!.checkin_smooth_count).toBe(1);
      expect(result!.checkin_average_count).toBe(0);
      expect(result!.checkin_difficult_count).toBe(0);
      expect(result!.checkin_total_count).toBe(1);
    });

    it('should handle "na" responses by excluding them', async () => {
      const frictionResponses = [
        { friction_type: 'lift_delays', response: 'na' },
        { friction_type: 'lift_delays', response: 'yes' },
        { friction_type: 'crowding', response: 'na' },
        { friction_type: 'crowding', response: 'no' },
        { friction_type: 'checkin', response: 'smooth' },
      ];

      mockPool.query
        .mockResolvedValueOnce([frictionResponses])
        .mockResolvedValueOnce([[
          { review_id: 'review-1' },
          { review_id: 'review-2' },
          { review_id: 'review-3' },
          { review_id: 'review-4' },
          { review_id: 'review-5' },
        ]]);
      
      const result = await getExperienceFrictionCalculationBasis('hotel-123');
      
      expect(result).not.toBeNull();
      // Should only count non-na responses
      expect(result!.lift_delays_count).toBe(1); // Only the 'yes' response
      expect(result!.crowding_count).toBe(1); // Only the 'no' response
    });

    it('should handle database errors gracefully', async () => {
      mockPool.query.mockRejectedValueOnce(new Error('Database error'));
      
      const result = await getExperienceFrictionCalculationBasis('hotel-123');
      
      expect(result).toBeNull();
    });
  });

  // ─── Existing Function Tests (for regression) ────────────────────────────

  describe('walkingTimeToScore', () => {
    it('should return 3 for times <= 3 minutes', () => {
      expect(walkingTimeToScore(1)).toBe(3);
      expect(walkingTimeToScore(3)).toBe(3);
    });

    it('should return 3 for times <= 5 minutes', () => {
      expect(walkingTimeToScore(4)).toBe(3);
      expect(walkingTimeToScore(5)).toBe(3);
    });

    it('should return 2 for times 6-8 minutes', () => {
      expect(walkingTimeToScore(6)).toBe(2);
      expect(walkingTimeToScore(8)).toBe(2);
    });

    it('should return 2 for times 9-12 minutes', () => {
      expect(walkingTimeToScore(9)).toBe(2);
      expect(walkingTimeToScore(12)).toBe(2);
    });

    it('should return 1 for times > 12 minutes', () => {
      expect(walkingTimeToScore(13)).toBe(1);
      expect(walkingTimeToScore(20)).toBe(1);
    });
  });

  describe('normalise', () => {
    it('should convert 1 to 0', () => {
      expect(normalise(1)).toBe(0);
    });

    it('should convert 2 to 5', () => {
      expect(normalise(2)).toBe(5);
    });

    it('should convert 3 to 10', () => {
      expect(normalise(3)).toBe(10);
    });

    it('should clamp values outside 1-3 range', () => {
      expect(normalise(0)).toBe(0); // Clamped to 1 → 0
      expect(normalise(4)).toBe(10); // Clamped to 3 → 10
    });
  });

  describe('computeScoring', () => {
    it('should compute overall score from data and weights', () => {
      const data = defaultScoringData();
      const weights = DEFAULT_WEIGHTS;
      
      const breakdown = computeScoring(data, weights, 4.5);
      
      expect(breakdown).toHaveProperty('overall');
      expect(breakdown).toHaveProperty('categories');
      expect(breakdown.overall).toBeGreaterThanOrEqual(0);
      expect(breakdown.overall).toBeLessThanOrEqual(10);
    });

    it('should weight categories correctly', () => {
      const data = defaultScoringData();
      const weights = DEFAULT_WEIGHTS;
      
      const breakdown = computeScoring(data, weights, 4.5);
      
      expect(breakdown.categories.location.weight).toBe(weights.location);
      expect(breakdown.categories.pilgrimSuitability.weight).toBe(weights.pilgrimSuitability);
      expect(breakdown.categories.hotelQuality.weight).toBe(weights.hotelQuality);
      expect(breakdown.categories.experienceFriction.weight).toBe(weights.experienceFriction);
      expect(breakdown.categories.userReviews.weight).toBe(weights.userReviews);
    });
  });
});
