/**
 * Analytics Event Emitter Tests
 */

import {
  AnalyticsEventEmitter,
  AnalyticsEvent,
  BookingCreatedData,
  BookingStatusChangedData,
  PaymentReceivedData,
  ReviewSubmittedData,
} from '../websocket/analytics-events';

describe('AnalyticsEventEmitter', () => {
  let emitter: AnalyticsEventEmitter;

  beforeEach(() => {
    // Reset the singleton between tests by accessing the private static field
    (AnalyticsEventEmitter as any).instance = undefined;
    emitter = AnalyticsEventEmitter.getInstance();
  });

  describe('Singleton', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = AnalyticsEventEmitter.getInstance();
      const instance2 = AnalyticsEventEmitter.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('emitBookingCreated', () => {
    it('should emit an analyticsEvent with correct eventType and delta for an active booking', (done) => {
      const data: BookingCreatedData = {
        bookingId: 1,
        source: 'DIRECT',
        amount: 250,
        status: 'CONFIRMED',
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.eventType).toBe('booking:created');
        expect(event.timestamp).toBeDefined();
        expect(new Date(event.timestamp).toISOString()).toBe(event.timestamp);
        expect(event.data).toEqual(data);
        expect(event.delta.bookingCountAdjustment).toBe(1);
        expect(event.delta.revenueAdjustment).toBe(250);
        expect(event.delta.statusCountAdjustments).toEqual({ CONFIRMED: 1 });
        expect(event.delta.sourceCountAdjustments).toEqual({ DIRECT: 1 });
        expect(event.delta.ratingAdjustment).toBeNull();
        done();
      });

      emitter.emitBookingCreated(data);
    });

    it('should set revenueAdjustment to 0 for non-active booking statuses', (done) => {
      const data: BookingCreatedData = {
        bookingId: 2,
        source: 'BROKER',
        amount: 100,
        status: 'PENDING',
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.delta.revenueAdjustment).toBe(0);
        expect(event.delta.bookingCountAdjustment).toBe(1);
        expect(event.delta.statusCountAdjustments).toEqual({ PENDING: 1 });
        expect(event.delta.sourceCountAdjustments).toEqual({ BROKER: 1 });
        done();
      });

      emitter.emitBookingCreated(data);
    });

    it('should include revenue for COMPLETED status bookings', (done) => {
      const data: BookingCreatedData = {
        bookingId: 3,
        source: 'STAFF_CREATED',
        amount: 500,
        status: 'COMPLETED',
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.delta.revenueAdjustment).toBe(500);
        done();
      });

      emitter.emitBookingCreated(data);
    });

    it('should not throw on malformed data and log error instead', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Force an error by passing null as data
      expect(() => {
        emitter.emitBookingCreated(null as any);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });

  describe('emitBookingStatusChanged', () => {
    it('should emit an analyticsEvent with correct status adjustments', (done) => {
      const data: BookingStatusChangedData = {
        bookingId: 10,
        previousStatus: 'PENDING',
        newStatus: 'CONFIRMED',
        revenueImpact: 300,
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.eventType).toBe('booking:statusChanged');
        expect(event.data).toEqual(data);
        expect(event.delta.bookingCountAdjustment).toBe(0);
        expect(event.delta.revenueAdjustment).toBe(300);
        expect(event.delta.statusCountAdjustments).toEqual({
          PENDING: -1,
          CONFIRMED: 1,
        });
        expect(event.delta.ratingAdjustment).toBeNull();
        done();
      });

      emitter.emitBookingStatusChanged(data);
    });

    it('should handle negative revenue impact for cancellations', (done) => {
      const data: BookingStatusChangedData = {
        bookingId: 11,
        previousStatus: 'CONFIRMED',
        newStatus: 'CANCELLED',
        revenueImpact: -200,
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.delta.revenueAdjustment).toBe(-200);
        expect(event.delta.statusCountAdjustments).toEqual({
          CONFIRMED: -1,
          CANCELLED: 1,
        });
        done();
      });

      emitter.emitBookingStatusChanged(data);
    });
  });

  describe('emitPaymentReceived', () => {
    it('should emit an analyticsEvent with payment delta', (done) => {
      const data: PaymentReceivedData = {
        paymentId: 100,
        bookingId: 10,
        amount: 150,
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.eventType).toBe('payment:received');
        expect(event.data).toEqual(data);
        expect(event.delta.revenueAdjustment).toBe(0);
        expect(event.delta.paymentStatusAdjustments).toEqual({ PAID: 1 });
        expect(event.delta.ratingAdjustment).toBeNull();
        done();
      });

      emitter.emitPaymentReceived(data);
    });
  });

  describe('emitReviewSubmitted', () => {
    it('should emit an analyticsEvent with rating delta', (done) => {
      const data: ReviewSubmittedData = {
        reviewId: 50,
        hotelId: 5,
        rating: 4,
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.eventType).toBe('review:submitted');
        expect(event.data).toEqual(data);
        expect(event.delta.ratingAdjustment).toEqual({ rating: 4, count: 1 });
        // Other delta fields should be undefined for review events
        expect(event.delta.bookingCountAdjustment).toBeUndefined();
        expect(event.delta.revenueAdjustment).toBeUndefined();
        done();
      });

      emitter.emitReviewSubmitted(data);
    });

    it('should handle rating value of 1', (done) => {
      const data: ReviewSubmittedData = {
        reviewId: 51,
        hotelId: 6,
        rating: 1,
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.delta.ratingAdjustment).toEqual({ rating: 1, count: 1 });
        done();
      });

      emitter.emitReviewSubmitted(data);
    });

    it('should handle rating value of 5', (done) => {
      const data: ReviewSubmittedData = {
        reviewId: 52,
        hotelId: 7,
        rating: 5,
      };

      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        expect(event.delta.ratingAdjustment).toEqual({ rating: 5, count: 1 });
        done();
      });

      emitter.emitReviewSubmitted(data);
    });
  });

  describe('Error handling', () => {
    it('should catch and log errors without throwing in emitBookingCreated', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Sabotage the emit method to force an error
      const originalEmit = emitter.emit.bind(emitter);
      emitter.emit = () => {
        throw new Error('Forced error');
      };

      expect(() => {
        emitter.emitBookingCreated({
          bookingId: 1,
          source: 'DIRECT',
          amount: 100,
          status: 'CONFIRMED',
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to emit booking:created event:',
        expect.any(Error)
      );

      emitter.emit = originalEmit;
      consoleSpy.mockRestore();
    });

    it('should catch and log errors without throwing in emitBookingStatusChanged', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      emitter.emit = () => {
        throw new Error('Forced error');
      };

      expect(() => {
        emitter.emitBookingStatusChanged({
          bookingId: 1,
          previousStatus: 'PENDING',
          newStatus: 'CONFIRMED',
          revenueImpact: 100,
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to emit booking:statusChanged event:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should catch and log errors without throwing in emitPaymentReceived', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      emitter.emit = () => {
        throw new Error('Forced error');
      };

      expect(() => {
        emitter.emitPaymentReceived({
          paymentId: 1,
          bookingId: 1,
          amount: 100,
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to emit payment:received event:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should catch and log errors without throwing in emitReviewSubmitted', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      emitter.emit = () => {
        throw new Error('Forced error');
      };

      expect(() => {
        emitter.emitReviewSubmitted({
          reviewId: 1,
          hotelId: 1,
          rating: 5,
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to emit review:submitted event:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Event timestamp', () => {
    it('should produce valid ISO 8601 timestamps', (done) => {
      emitter.on('analyticsEvent', (event: AnalyticsEvent) => {
        const parsed = new Date(event.timestamp);
        expect(parsed.toISOString()).toBe(event.timestamp);
        expect(isNaN(parsed.getTime())).toBe(false);
        done();
      });

      emitter.emitBookingCreated({
        bookingId: 1,
        source: 'DIRECT',
        amount: 100,
        status: 'CONFIRMED',
      });
    });
  });
});
