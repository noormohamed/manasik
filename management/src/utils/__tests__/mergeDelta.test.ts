import { mergeDelta } from '../mergeDelta';
import type { AnalyticsResponse, IncrementalDelta } from '@/types/analytics';

/**
 * Helper to create a minimal valid AnalyticsResponse for testing.
 */
function makeBaselineResponse(overrides?: Partial<AnalyticsResponse>): AnalyticsResponse {
  return {
    revenue: {
      total: 10000,
      average: 500,
      trend: 5,
      daily: [],
      byHotel: [],
      bySource: [],
      brokerFees: 200,
    },
    bookings: {
      total: 100,
      conversionRate: 60,
      averageStayDuration: 3,
      averageLeadTime: 14,
      byStatus: {
        CONFIRMED: 30,
        COMPLETED: 30,
        EXPIRED: 20,
        CANCELLED: 10,
        PENDING: 10,
      },
      bySource: {
        DIRECT: 60,
        BROKER: 30,
        STAFF_CREATED: 10,
      },
      dailyVolume: [],
      byPaymentStatus: {
        PAID: 50,
        UNPAID: 20,
        PENDING: 20,
        FAILED: 5,
        REFUNDED: 5,
      },
      expiredRate: 20,
    },
    hotels: {
      performance: [],
      zeroBookingCount: 5,
    },
    reviews: {
      ratingDistribution: { 1: 5, 2: 10, 3: 20, 4: 30, 5: 15 },
      averageRating: 3.5,
    },
    users: {
      byRole: { CUSTOMER: 80, AGENT: 15, SUPER_ADMIN: 3, COMPANY_ADMIN: 2 },
      totalCount: 100,
      topAgents: [],
    },
    meta: {
      generatedAt: '2024-01-15T10:00:00.000Z',
      range: 30,
      periodStart: '2023-12-16',
      periodEnd: '2024-01-15',
    },
    ...overrides,
  };
}

describe('mergeDelta', () => {
  describe('null/missing baseline handling', () => {
    it('returns null when current is null', () => {
      const delta: IncrementalDelta = { revenueAdjustment: 100 };
      expect(mergeDelta(null, delta)).toBeNull();
    });

    it('returns null when current is undefined', () => {
      const delta: IncrementalDelta = { revenueAdjustment: 100 };
      expect(mergeDelta(undefined, delta)).toBeNull();
    });
  });

  describe('null/missing delta handling', () => {
    it('returns current state unchanged when delta is null', () => {
      const current = makeBaselineResponse();
      expect(mergeDelta(current, null)).toBe(current);
    });

    it('returns current state unchanged when delta is undefined', () => {
      const current = makeBaselineResponse();
      expect(mergeDelta(current, undefined)).toBe(current);
    });
  });

  describe('revenue updates', () => {
    it('adds revenueAdjustment to revenue.total', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = { revenueAdjustment: 500 };
      const result = mergeDelta(current, delta)!;
      expect(result.revenue.total).toBe(10500);
    });

    it('handles negative revenue adjustment', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = { revenueAdjustment: -1000 };
      const result = mergeDelta(current, delta)!;
      expect(result.revenue.total).toBe(9000);
    });

    it('recalculates revenue.average based on active booking count', () => {
      const current = makeBaselineResponse();
      // active = CONFIRMED(30) + COMPLETED(30) = 60
      const delta: IncrementalDelta = { revenueAdjustment: 600 };
      const result = mergeDelta(current, delta)!;
      // new total = 10600, active = 60, average = 10600/60
      expect(result.revenue.average).toBeCloseTo(10600 / 60);
    });
  });

  describe('booking count updates', () => {
    it('adds bookingCountAdjustment to bookings.total', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = { bookingCountAdjustment: 5 };
      const result = mergeDelta(current, delta)!;
      expect(result.bookings.total).toBe(105);
    });

    it('updates status counts from statusCountAdjustments', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = {
        statusCountAdjustments: { CONFIRMED: 2, EXPIRED: -1 },
      };
      const result = mergeDelta(current, delta)!;
      expect(result.bookings.byStatus['CONFIRMED']).toBe(32);
      expect(result.bookings.byStatus['EXPIRED']).toBe(19);
    });

    it('updates source counts from sourceCountAdjustments', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = {
        sourceCountAdjustments: { DIRECT: 3 },
      };
      const result = mergeDelta(current, delta)!;
      expect(result.bookings.bySource['DIRECT']).toBe(63);
    });

    it('updates payment status counts from paymentStatusAdjustments', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = {
        paymentStatusAdjustments: { PAID: 1, PENDING: -1 },
      };
      const result = mergeDelta(current, delta)!;
      expect(result.bookings.byPaymentStatus['PAID']).toBe(51);
      expect(result.bookings.byPaymentStatus['PENDING']).toBe(19);
    });

    it('initializes missing status keys to 0 before adjusting', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = {
        statusCountAdjustments: { NEW_STATUS: 3 },
      };
      const result = mergeDelta(current, delta)!;
      expect(result.bookings.byStatus['NEW_STATUS']).toBe(3);
    });
  });

  describe('derived metrics recalculation', () => {
    it('recalculates conversionRate after status changes', () => {
      const current = makeBaselineResponse();
      // Add 10 confirmed bookings and 10 total bookings
      const delta: IncrementalDelta = {
        bookingCountAdjustment: 10,
        statusCountAdjustments: { CONFIRMED: 10 },
      };
      const result = mergeDelta(current, delta)!;
      // active = 40 + 30 = 70, total = 110
      expect(result.bookings.conversionRate).toBeCloseTo((70 / 110) * 100);
    });

    it('recalculates expiredRate after status changes', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = {
        bookingCountAdjustment: 0,
        statusCountAdjustments: { EXPIRED: 5 },
      };
      const result = mergeDelta(current, delta)!;
      // expired = 25, total = 100
      expect(result.bookings.expiredRate).toBeCloseTo((25 / 100) * 100);
    });

    it('sets conversionRate and expiredRate to 0 when total bookings is 0', () => {
      const current = makeBaselineResponse({
        bookings: {
          ...makeBaselineResponse().bookings,
          total: 0,
          byStatus: {},
        },
      });
      const delta: IncrementalDelta = {};
      const result = mergeDelta(current, delta)!;
      expect(result.bookings.conversionRate).toBe(0);
      expect(result.bookings.expiredRate).toBe(0);
    });
  });

  describe('review metrics updates', () => {
    it('updates ratingDistribution with ratingAdjustment', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = {
        ratingAdjustment: { rating: 5, count: 1 },
      };
      const result = mergeDelta(current, delta)!;
      expect(result.reviews.ratingDistribution[5]).toBe(16);
    });

    it('recalculates averageRating after rating adjustment', () => {
      const current = makeBaselineResponse();
      // Original: 1*5 + 2*10 + 3*20 + 4*30 + 5*15 = 5+20+60+120+75 = 280, count=80, avg=3.5
      const delta: IncrementalDelta = {
        ratingAdjustment: { rating: 5, count: 1 },
      };
      const result = mergeDelta(current, delta)!;
      // New: 280 + 5 = 285, count = 81, avg = 285/81 ≈ 3.5185... → rounded to 3.5
      expect(result.reviews.averageRating).toBeCloseTo(3.5, 1);
    });

    it('does not modify ratingDistribution when ratingAdjustment is absent', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = { revenueAdjustment: 100 };
      const result = mergeDelta(current, delta)!;
      expect(result.reviews.ratingDistribution).toBe(current.reviews.ratingDistribution);
      expect(result.reviews.averageRating).toBe(current.reviews.averageRating);
    });

    it('initializes missing rating key to 0 before adjusting', () => {
      const current = makeBaselineResponse({
        reviews: {
          ratingDistribution: { 3: 10 },
          averageRating: 3.0,
        },
      });
      const delta: IncrementalDelta = {
        ratingAdjustment: { rating: 1, count: 1 },
      };
      const result = mergeDelta(current, delta)!;
      expect(result.reviews.ratingDistribution[1]).toBe(1);
    });
  });

  describe('immutability', () => {
    it('does not mutate the original state', () => {
      const current = makeBaselineResponse();
      const originalTotal = current.revenue.total;
      const originalByStatus = { ...current.bookings.byStatus };

      const delta: IncrementalDelta = {
        revenueAdjustment: 500,
        bookingCountAdjustment: 5,
        statusCountAdjustments: { CONFIRMED: 3 },
      };

      mergeDelta(current, delta);

      expect(current.revenue.total).toBe(originalTotal);
      expect(current.bookings.byStatus).toEqual(originalByStatus);
    });

    it('returns a new object reference', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = { revenueAdjustment: 1 };
      const result = mergeDelta(current, delta);
      expect(result).not.toBe(current);
    });
  });

  describe('combined delta', () => {
    it('applies all delta fields together', () => {
      const current = makeBaselineResponse();
      const delta: IncrementalDelta = {
        bookingCountAdjustment: 1,
        revenueAdjustment: 200,
        statusCountAdjustments: { CONFIRMED: 1 },
        sourceCountAdjustments: { BROKER: 1 },
        paymentStatusAdjustments: { PAID: 1 },
        ratingAdjustment: { rating: 4, count: 1 },
      };

      const result = mergeDelta(current, delta)!;

      expect(result.bookings.total).toBe(101);
      expect(result.revenue.total).toBe(10200);
      expect(result.bookings.byStatus['CONFIRMED']).toBe(31);
      expect(result.bookings.bySource['BROKER']).toBe(31);
      expect(result.bookings.byPaymentStatus['PAID']).toBe(51);
      expect(result.reviews.ratingDistribution[4]).toBe(31);
    });
  });
});
