/**
 * Scoring Service - Location Calculation Functions Tests
 *
 * Tests for the location metrics calculation functions:
 * - calculateWalkingTimeFromDistance
 * - calculateRouteEaseFromDistance
 * - calculateLocationMetrics
 */

import {
  calculateWalkingTimeFromDistance,
  calculateRouteEaseFromDistance,
  calculateLocationMetrics,
  LocationScores,
} from '../features/hotel/services/scoring.service';

describe('Scoring Service - Location Calculation Functions', () => {
  describe('calculateWalkingTimeFromDistance', () => {
    it('should calculate walking time score for very close distance (≤3 min)', () => {
      // 252 meters = 252 / 1.4 / 60 = 3 minutes → score 3
      const score = calculateWalkingTimeFromDistance(252);
      expect(score).toBe(3);
    });

    it('should calculate walking time score for close distance (≤5 min)', () => {
      // 420 meters = 420 / 1.4 / 60 = 5 minutes → score 3
      const score = calculateWalkingTimeFromDistance(420);
      expect(score).toBe(3);
    });

    it('should calculate walking time score for medium distance (≤8 min)', () => {
      // 672 meters = 672 / 1.4 / 60 = 8 minutes → score 2
      const score = calculateWalkingTimeFromDistance(672);
      expect(score).toBe(2);
    });

    it('should calculate walking time score for medium-far distance (≤12 min)', () => {
      // 1008 meters = 1008 / 1.4 / 60 = 12 minutes → score 2
      const score = calculateWalkingTimeFromDistance(1008);
      expect(score).toBe(2);
    });

    it('should calculate walking time score for far distance (>12 min)', () => {
      // 1344 meters = 1344 / 1.4 / 60 = 16 minutes → score 1
      const score = calculateWalkingTimeFromDistance(1344);
      expect(score).toBe(1);
    });

    it('should handle zero distance', () => {
      const score = calculateWalkingTimeFromDistance(0);
      expect(score).toBe(3);
    });

    it('should handle very large distance', () => {
      // 5000 meters = 5000 / 1.4 / 60 = 59.5 minutes → score 1
      const score = calculateWalkingTimeFromDistance(5000);
      expect(score).toBe(1);
    });

    it('should round walking time correctly', () => {
      // 300 meters = 300 / 1.4 / 60 = 3.57 minutes → rounds to 4 → score 3
      const score = calculateWalkingTimeFromDistance(300);
      expect(score).toBe(3);
    });

    it('should return score between 1 and 3', () => {
      const distances = [0, 100, 250, 500, 1000, 2000, 5000];
      distances.forEach(distance => {
        const score = calculateWalkingTimeFromDistance(distance);
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(3);
      });
    });
  });

  describe('calculateRouteEaseFromDistance', () => {
    describe('base scoring without terrain data', () => {
      it('should return 3 for very close distance (<200m)', () => {
        const score = calculateRouteEaseFromDistance(100);
        expect(score).toBe(3);
      });

      it('should return 3 for distance at 200m boundary', () => {
        const score = calculateRouteEaseFromDistance(200);
        expect(score).toBe(2);
      });

      it('should return 2 for medium distance (200-500m)', () => {
        const score = calculateRouteEaseFromDistance(350);
        expect(score).toBe(2);
      });

      it('should return 2 for distance at 500m boundary', () => {
        const score = calculateRouteEaseFromDistance(500);
        expect(score).toBe(2);
      });

      it('should return 1 for far distance (>500m)', () => {
        const score = calculateRouteEaseFromDistance(1000);
        expect(score).toBe(1);
      });
    });

    describe('terrain adjustments', () => {
      it('should reduce score by 1 for significant elevation (>20m)', () => {
        // Base score 3 (100m) - 1 (elevation) = 2
        const score = calculateRouteEaseFromDistance(100, { elevation: 25 });
        expect(score).toBe(2);
      });

      it('should not reduce score for elevation ≤20m', () => {
        // Base score 3 (100m), no reduction
        const score = calculateRouteEaseFromDistance(100, { elevation: 20 });
        expect(score).toBe(3);
      });

      it('should reduce score by 1 for stairs', () => {
        // Base score 3 (100m) - 1 (stairs) = 2
        const score = calculateRouteEaseFromDistance(100, { hasStairs: true });
        expect(score).toBe(2);
      });

      it('should not reduce score when hasStairs is false', () => {
        // Base score 3 (100m), no reduction
        const score = calculateRouteEaseFromDistance(100, { hasStairs: false });
        expect(score).toBe(3);
      });

      it('should increase score by 1 for wheelchair accessibility', () => {
        // Base score 2 (350m) + 1 (accessible) = 3
        const score = calculateRouteEaseFromDistance(350, { wheelchairAccessible: true });
        expect(score).toBe(3);
      });

      it('should clamp wheelchair accessible score to minimum 2', () => {
        // Base score 1 (1000m) + 1 (accessible) = 2 (clamped to min 2)
        const score = calculateRouteEaseFromDistance(1000, { wheelchairAccessible: true });
        expect(score).toBe(2);
      });

      it('should apply multiple adjustments correctly', () => {
        // Base score 3 (100m) - 1 (elevation) - 1 (stairs) = 1
        const score = calculateRouteEaseFromDistance(100, {
          elevation: 25,
          hasStairs: true,
        });
        expect(score).toBe(1);
      });

      it('should apply elevation and stairs reduction, then accessibility increase', () => {
        // Base score 3 (100m) - 1 (elevation) - 1 (stairs) + 1 (accessible) = 2
        const score = calculateRouteEaseFromDistance(100, {
          elevation: 25,
          hasStairs: true,
          wheelchairAccessible: true,
        });
        expect(score).toBe(2);
      });

      it('should clamp final score to 1-3 range', () => {
        // Base score 1 (1000m) - 1 (elevation) - 1 (stairs) = -1 → clamped to 1
        const score = calculateRouteEaseFromDistance(1000, {
          elevation: 25,
          hasStairs: true,
        });
        expect(score).toBe(1);
      });
    });

    describe('edge cases', () => {
      it('should handle zero distance', () => {
        const score = calculateRouteEaseFromDistance(0);
        expect(score).toBe(3);
      });

      it('should handle very large distance', () => {
        const score = calculateRouteEaseFromDistance(5000);
        expect(score).toBe(1);
      });

      it('should return score between 1 and 3', () => {
        const distances = [0, 100, 250, 500, 1000, 5000];
        distances.forEach(distance => {
          const score = calculateRouteEaseFromDistance(distance);
          expect(score).toBeGreaterThanOrEqual(1);
          expect(score).toBeLessThanOrEqual(3);
        });
      });

      it('should handle undefined terrain data', () => {
        const score = calculateRouteEaseFromDistance(350, undefined);
        expect(score).toBe(2);
      });

      it('should handle empty terrain data object', () => {
        const score = calculateRouteEaseFromDistance(350, {});
        expect(score).toBe(2);
      });
    });
  });

  describe('calculateLocationMetrics', () => {
    it('should return LocationScores object with all three metrics', () => {
      const metrics = calculateLocationMetrics(350);
      expect(metrics).toHaveProperty('walkingTimeToHaram');
      expect(metrics).toHaveProperty('gateProximity');
      expect(metrics).toHaveProperty('routeEase');
    });

    it('should calculate all metrics for close distance', () => {
      const metrics = calculateLocationMetrics(150);
      expect(metrics.walkingTimeToHaram).toBe(3); // ~2 min
      expect(metrics.gateProximity).toBe(3); // <200m
      expect(metrics.routeEase).toBe(3); // <200m
    });

    it('should calculate all metrics for medium distance', () => {
      const metrics = calculateLocationMetrics(350);
      expect(metrics.walkingTimeToHaram).toBe(3); // ~4 min
      expect(metrics.gateProximity).toBe(2); // 200-500m
      expect(metrics.routeEase).toBe(2); // 200-500m
    });

    it('should calculate all metrics for far distance', () => {
      const metrics = calculateLocationMetrics(1000);
      expect(metrics.walkingTimeToHaram).toBe(2); // ~12 min (≤12min=2)
      expect(metrics.gateProximity).toBe(1); // >500m
      expect(metrics.routeEase).toBe(1); // >500m
    });

    it('should apply terrain data to route ease only', () => {
      const metricsWithTerrain = calculateLocationMetrics(350, {
        elevation: 25,
        hasStairs: true,
      });
      // Walking time and gate proximity should be unaffected
      expect(metricsWithTerrain.walkingTimeToHaram).toBe(3);
      expect(metricsWithTerrain.gateProximity).toBe(2);
      // Route ease should be reduced
      expect(metricsWithTerrain.routeEase).toBe(1); // 2 - 1 (elevation) - 1 (stairs) = 0 → clamped to 1
    });

    it('should handle zero distance', () => {
      const metrics = calculateLocationMetrics(0);
      expect(metrics.walkingTimeToHaram).toBe(3);
      expect(metrics.gateProximity).toBe(3);
      expect(metrics.routeEase).toBe(3);
    });

    it('should handle very large distance', () => {
      const metrics = calculateLocationMetrics(5000);
      expect(metrics.walkingTimeToHaram).toBe(1);
      expect(metrics.gateProximity).toBe(1);
      expect(metrics.routeEase).toBe(1);
    });

    it('should return all scores in 1-3 range', () => {
      const distances = [0, 100, 250, 500, 1000, 5000];
      distances.forEach(distance => {
        const metrics = calculateLocationMetrics(distance);
        expect(metrics.walkingTimeToHaram).toBeGreaterThanOrEqual(1);
        expect(metrics.walkingTimeToHaram).toBeLessThanOrEqual(3);
        expect(metrics.gateProximity).toBeGreaterThanOrEqual(1);
        expect(metrics.gateProximity).toBeLessThanOrEqual(3);
        expect(metrics.routeEase).toBeGreaterThanOrEqual(1);
        expect(metrics.routeEase).toBeLessThanOrEqual(3);
      });
    });

    it('should handle undefined terrain data', () => {
      const metrics = calculateLocationMetrics(350, undefined);
      expect(metrics.walkingTimeToHaram).toBe(3);
      expect(metrics.gateProximity).toBe(2);
      expect(metrics.routeEase).toBe(2);
    });

    it('should handle empty terrain data object', () => {
      const metrics = calculateLocationMetrics(350, {});
      expect(metrics.walkingTimeToHaram).toBe(3);
      expect(metrics.gateProximity).toBe(2);
      expect(metrics.routeEase).toBe(2);
    });
  });

  describe('Determinism Property', () => {
    it('should produce identical results for same input (walking time)', () => {
      const distance = 350;
      const result1 = calculateWalkingTimeFromDistance(distance);
      const result2 = calculateWalkingTimeFromDistance(distance);
      const result3 = calculateWalkingTimeFromDistance(distance);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should produce identical results for same input (route ease)', () => {
      const distance = 350;
      const terrain = { elevation: 15, hasStairs: false };
      const result1 = calculateRouteEaseFromDistance(distance, terrain);
      const result2 = calculateRouteEaseFromDistance(distance, terrain);
      const result3 = calculateRouteEaseFromDistance(distance, terrain);
      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should produce identical results for same input (location metrics)', () => {
      const distance = 350;
      const terrain = { elevation: 15, hasStairs: false };
      const result1 = calculateLocationMetrics(distance, terrain);
      const result2 = calculateLocationMetrics(distance, terrain);
      const result3 = calculateLocationMetrics(distance, terrain);
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it('should produce different results for different inputs', () => {
      const result1 = calculateWalkingTimeFromDistance(100);
      const result2 = calculateWalkingTimeFromDistance(500);
      expect(result1).not.toBe(result2);
    });
  });

  describe('Boundary Testing', () => {
    it('should handle boundary at 3 minutes for walking time', () => {
      // 252 meters = 3 minutes exactly
      const score = calculateWalkingTimeFromDistance(252);
      expect(score).toBe(3);
    });

    it('should handle boundary at 5 minutes for walking time', () => {
      // 420 meters = 5 minutes exactly
      const score = calculateWalkingTimeFromDistance(420);
      expect(score).toBe(3);
    });

    it('should handle boundary at 8 minutes for walking time', () => {
      // 672 meters = 8 minutes exactly
      const score = calculateWalkingTimeFromDistance(672);
      expect(score).toBe(2);
    });

    it('should handle boundary at 12 minutes for walking time', () => {
      // 1008 meters = 12 minutes exactly
      const score = calculateWalkingTimeFromDistance(1008);
      expect(score).toBe(2);
    });

    it('should handle boundary at 200m for route ease', () => {
      const score1 = calculateRouteEaseFromDistance(199);
      const score2 = calculateRouteEaseFromDistance(200);
      expect(score1).toBe(3);
      expect(score2).toBe(2);
    });

    it('should handle boundary at 500m for route ease', () => {
      const score1 = calculateRouteEaseFromDistance(500);
      const score2 = calculateRouteEaseFromDistance(501);
      expect(score1).toBe(2);
      expect(score2).toBe(1);
    });

    it('should handle boundary at 20m elevation for route ease', () => {
      const score1 = calculateRouteEaseFromDistance(350, { elevation: 20 });
      const score2 = calculateRouteEaseFromDistance(350, { elevation: 21 });
      expect(score1).toBe(2); // No reduction
      expect(score2).toBe(1); // Reduced by 1
    });
  });

  describe('Real-world Scenarios', () => {
    it('should calculate metrics for hotel very close to gate', () => {
      const metrics = calculateLocationMetrics(100);
      expect(metrics.walkingTimeToHaram).toBe(3);
      expect(metrics.gateProximity).toBe(3);
      expect(metrics.routeEase).toBe(3);
    });

    it('should calculate metrics for hotel with moderate distance and stairs', () => {
      const metrics = calculateLocationMetrics(400, { hasStairs: true });
      expect(metrics.walkingTimeToHaram).toBe(3);
      expect(metrics.gateProximity).toBe(2);
      expect(metrics.routeEase).toBe(1); // 2 - 1 (stairs) = 1
    });

    it('should calculate metrics for hotel with far distance but wheelchair accessible', () => {
      const metrics = calculateLocationMetrics(800, { wheelchairAccessible: true });
      expect(metrics.walkingTimeToHaram).toBe(2); // ~9.5 min (≤12min=2)
      expect(metrics.gateProximity).toBe(1);
      expect(metrics.routeEase).toBe(2); // 1 + 1 (accessible) = 2 (clamped to min 2)
    });

    it('should calculate metrics for hotel with elevation and stairs but accessible', () => {
      const metrics = calculateLocationMetrics(300, {
        elevation: 30,
        hasStairs: true,
        wheelchairAccessible: true,
      });
      expect(metrics.walkingTimeToHaram).toBe(3);
      expect(metrics.gateProximity).toBe(2);
      // 3 - 1 (elevation) - 1 (stairs) + 1 (accessible) = 2
      expect(metrics.routeEase).toBe(2);
    });
  });
});
