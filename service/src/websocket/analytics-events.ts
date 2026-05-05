import { EventEmitter } from 'events';

// --- Interfaces ---

export interface BookingCreatedData {
  bookingId: number;
  source: 'DIRECT' | 'BROKER' | 'STAFF_CREATED';
  amount: number;
  status: string;
}

export interface BookingStatusChangedData {
  bookingId: number;
  previousStatus: string;
  newStatus: string;
  revenueImpact: number;
}

export interface PaymentReceivedData {
  paymentId: number;
  bookingId: number;
  amount: number;
}

export interface ReviewSubmittedData {
  reviewId: number;
  hotelId: number;
  rating: number;
}

export interface IncrementalDelta {
  bookingCountAdjustment?: number;
  revenueAdjustment?: number;
  statusCountAdjustments?: Record<string, number>;
  sourceCountAdjustments?: Record<string, number>;
  paymentStatusAdjustments?: Record<string, number>;
  ratingAdjustment?: { rating: number; count: number } | null;
}

export interface AnalyticsEvent {
  eventType: 'booking:created' | 'booking:statusChanged' | 'payment:received' | 'review:submitted';
  timestamp: string;
  data: BookingCreatedData | BookingStatusChangedData | PaymentReceivedData | ReviewSubmittedData;
  delta: IncrementalDelta;
}

// --- Active booking statuses used for revenue calculations ---

const ACTIVE_STATUSES = ['CONFIRMED', 'COMPLETED'];

// --- Singleton Event Emitter ---

export class AnalyticsEventEmitter extends EventEmitter {
  private static instance: AnalyticsEventEmitter;

  private constructor() {
    super();
  }

  static getInstance(): AnalyticsEventEmitter {
    if (!AnalyticsEventEmitter.instance) {
      AnalyticsEventEmitter.instance = new AnalyticsEventEmitter();
    }
    return AnalyticsEventEmitter.instance;
  }

  /**
   * Emit a booking:created event with computed deltas.
   * - bookingCountAdjustment is always +1 (a new booking was created)
   * - revenueAdjustment is the booking amount if the status is active, otherwise 0
   * - statusCountAdjustments increments the count for the booking's status
   * - sourceCountAdjustments increments the count for the booking's source
   */
  emitBookingCreated(data: BookingCreatedData): void {
    try {
      const isActive = ACTIVE_STATUSES.includes(data.status);

      const delta: IncrementalDelta = {
        bookingCountAdjustment: 1,
        revenueAdjustment: isActive ? data.amount : 0,
        statusCountAdjustments: { [data.status]: 1 },
        sourceCountAdjustments: { [data.source]: 1 },
        ratingAdjustment: null,
      };

      const event: AnalyticsEvent = {
        eventType: 'booking:created',
        timestamp: new Date().toISOString(),
        data,
        delta,
      };

      this.emit('analyticsEvent', event);
    } catch (error) {
      console.error('Failed to emit booking:created event:', error);
    }
  }

  /**
   * Emit a booking:statusChanged event with computed deltas.
   * - bookingCountAdjustment is 0 (no new booking, just a status change)
   * - revenueAdjustment reflects the revenue impact of the status transition
   * - statusCountAdjustments decrements the previous status and increments the new status
   */
  emitBookingStatusChanged(data: BookingStatusChangedData): void {
    try {
      const delta: IncrementalDelta = {
        bookingCountAdjustment: 0,
        revenueAdjustment: data.revenueImpact,
        statusCountAdjustments: {
          [data.previousStatus]: -1,
          [data.newStatus]: 1,
        },
        ratingAdjustment: null,
      };

      const event: AnalyticsEvent = {
        eventType: 'booking:statusChanged',
        timestamp: new Date().toISOString(),
        data,
        delta,
      };

      this.emit('analyticsEvent', event);
    } catch (error) {
      console.error('Failed to emit booking:statusChanged event:', error);
    }
  }

  /**
   * Emit a payment:received event with computed deltas.
   * - revenueAdjustment is 0 (payment doesn't change booking revenue totals directly)
   * - paymentStatusAdjustments increments the PAID count
   */
  emitPaymentReceived(data: PaymentReceivedData): void {
    try {
      const delta: IncrementalDelta = {
        revenueAdjustment: 0,
        paymentStatusAdjustments: { PAID: 1 },
        ratingAdjustment: null,
      };

      const event: AnalyticsEvent = {
        eventType: 'payment:received',
        timestamp: new Date().toISOString(),
        data,
        delta,
      };

      this.emit('analyticsEvent', event);
    } catch (error) {
      console.error('Failed to emit payment:received event:', error);
    }
  }

  /**
   * Emit a review:submitted event with computed deltas.
   * - ratingAdjustment records the new rating with a count of 1
   */
  emitReviewSubmitted(data: ReviewSubmittedData): void {
    try {
      const delta: IncrementalDelta = {
        ratingAdjustment: { rating: data.rating, count: 1 },
      };

      const event: AnalyticsEvent = {
        eventType: 'review:submitted',
        timestamp: new Date().toISOString(),
        data,
        delta,
      };

      this.emit('analyticsEvent', event);
    } catch (error) {
      console.error('Failed to emit review:submitted event:', error);
    }
  }
}
