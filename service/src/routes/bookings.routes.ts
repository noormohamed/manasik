import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware } from '../middleware/auth.middleware';
import { getPool } from '../database/connection';

export const bookingsRoutes = new Router({ prefix: '/bookings' });

/**
 * GET /api/bookings/:bookingId/confirmation
 * Get booking confirmation - accessible by customer, hotel manager, or broker
 * ACL: customer, hotel manager, or broker can access
 */
bookingsRoutes.get('/:bookingId/confirmation', authMiddleware, async (ctx: Context) => {
  try {
    const userId = (ctx.state as any).userId;
    const { bookingId } = ctx.params;
    const pool = getPool();

    // Fetch the booking with hotel details
    const [bookings] = await pool.query<any>(
      `SELECT 
        b.id,
        b.service_type as serviceType,
        b.status,
        b.currency,
        b.subtotal,
        b.tax,
        b.total,
        b.refund_amount as refundAmount,
        b.refund_reason as refundReason,
        b.refunded_at as refundedAt,
        b.payment_status as paymentStatus,
        b.metadata,
        b.created_at as createdAt,
        b.updated_at as updatedAt,
        b.customer_id as customerId,
        b.agent_id as agentId,
        b.hotel_id as hotelId,
        h.name as hotelName,
        h.address as hotelAddress,
        h.city as hotelCity,
        h.country as hotelCountry,
        h.agent_id as hotelAgentId,
        h.check_in_time as checkInTime,
        h.check_out_time as checkOutTime,
        h.star_rating as starRating
      FROM bookings b
      LEFT JOIN hotels h ON b.hotel_id = h.id
      WHERE b.id = ?`,
      [bookingId]
    );

    if (!bookings || bookings.length === 0) {
      ctx.status = 404;
      ctx.body = { error: 'Booking not found' };
      return;
    }

    const booking = bookings[0];

    // Check authorization: customer, hotel manager, or broker
    const isCustomer = booking.customerId === userId;
    const isHotelManager = booking.hotelId && booking.hotelAgentId === userId;
    const isBroker = booking.agentId === userId;

    if (!isCustomer && !isHotelManager && !isBroker) {
      ctx.status = 403;
      ctx.body = { error: 'Not authorized to view this booking' };
      return;
    }

    // Build full address from hotel table data
    const hotelFullAddress = [booking.hotelAddress, booking.hotelCity, booking.hotelCountry]
      .filter(Boolean)
      .join(', ') || null;

    const metadata = typeof booking.metadata === 'string' 
      ? JSON.parse(booking.metadata) 
      : booking.metadata || {};

    // Get gate information for this hotel
    let closestGate = null;
    let kaabaGate = null;
    
    // Use hotelId from booking table or metadata (for customer bookings)
    const hotelIdForGates = booking.hotelId || metadata.hotelId;
    console.log('[DEBUG] hotelIdForGates:', hotelIdForGates);
    
    if (hotelIdForGates) {
      console.log('[DEBUG] Fetching gates for hotel:', hotelIdForGates);
      try {
        // Get closest gate (smallest distance)
        const [closestGates] = await pool.query<any>(
          `SELECT hg.name_english, hg.gate_number, hgd.distance_meters, hgd.walking_time_minutes, hg.has_direct_kaaba_access
           FROM hotel_gate_distances hgd
           JOIN haram_gates hg ON hgd.gate_id = hg.id
           WHERE hgd.hotel_id = ?
           ORDER BY hgd.distance_meters ASC
           LIMIT 1`,
          [hotelIdForGates]
        );
        
        console.log('[DEBUG] closestGates result:', closestGates?.length);
        
        if (closestGates && closestGates.length > 0) {
          closestGate = {
            name: closestGates[0].name_english,
            gateNumber: closestGates[0].gate_number,
            distance: closestGates[0].distance_meters,
            walkingTime: closestGates[0].walking_time_minutes,
            hasDirectKaabaAccess: closestGates[0].has_direct_kaaba_access === 1,
          };
        }
        
        // Get Kaaba-facing gate (Gate 1 - King Abdul Aziz Gate is the main Kaaba-facing gate)
        const [kaabaGates] = await pool.query<any>(
          `SELECT hg.name_english, hg.gate_number, hgd.distance_meters, hgd.walking_time_minutes, hg.has_direct_kaaba_access
           FROM hotel_gate_distances hgd
           JOIN haram_gates hg ON hgd.gate_id = hg.id
           WHERE hgd.hotel_id = ? AND hg.gate_number = 1
           LIMIT 1`,
          [hotelIdForGates]
        );
        
        console.log('[DEBUG] kaabaGates result:', kaabaGates?.length);
        
        if (kaabaGates && kaabaGates.length > 0) {
          kaabaGate = {
            name: kaabaGates[0].name_english,
            gateNumber: kaabaGates[0].gate_number,
            distance: kaabaGates[0].distance_meters,
            walkingTime: kaabaGates[0].walking_time_minutes,
            hasDirectKaabaAccess: kaabaGates[0].has_direct_kaaba_access === 1,
          };
        }
      } catch (err: any) {
        console.error('[DEBUG] Error fetching gate information:', err.message);
        // Continue without gate info if query fails
      }
    } else {
      console.log('[DEBUG] No hotelIdForGates found');
    }

    // Fetch guests for this booking from guests table
    let guests: any[] = [];
    try {
      const [guestRows] = await pool.query<any>(
        `SELECT id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger 
         FROM guests WHERE booking_id = ? ORDER BY is_lead_passenger DESC`,
        [booking.id]
      );

      guests = (guestRows as any[]).map((g: any) => ({
        id: g.id,
        firstName: g.first_name,
        lastName: g.last_name,
        email: g.email,
        phone: g.phone,
        nationality: g.nationality,
        passportNumber: g.passport_number,
        dateOfBirth: g.date_of_birth,
        isLeadPassenger: g.is_lead_passenger === 1,
      }));
    } catch (err) {
      // Guests table might not exist yet, that's okay
      guests = [];
    }

    ctx.body = {
      booking: {
        id: booking.id,
        serviceType: booking.serviceType,
        status: booking.status,
        currency: booking.currency,
        subtotal: parseFloat(booking.subtotal),
        tax: parseFloat(booking.tax),
        total: parseFloat(booking.total),
        refundAmount: booking.refundAmount ? parseFloat(booking.refundAmount) : null,
        refundReason: booking.refundReason || null,
        refundedAt: booking.refundedAt || null,
        paymentStatus: booking.paymentStatus,
        hotelId: booking.hotelId || metadata.hotelId,
        hotelName: booking.hotelName || metadata.hotelName,
        hotelAddress: booking.hotelAddress || metadata.hotelAddress,
        hotelCity: booking.hotelCity || metadata.hotelCity,
        hotelCountry: booking.hotelCountry || metadata.hotelCountry,
        hotelFullAddress: hotelFullAddress || metadata.hotelFullAddress,
        checkInTime: booking.checkInTime || '14:00',
        checkOutTime: booking.checkOutTime || '11:00',
        starRating: booking.starRating,
        closestGate,
        kaabaGate,
        roomType: metadata.roomType,
        checkInDate: metadata.checkInDate,
        checkOutDate: metadata.checkOutDate,
        nights: metadata.nights,
        guests: metadata.guests,
        guestDetails: guests,
        metadata,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    };
  } catch (error) {
    console.error('Error fetching booking confirmation:', error);
    ctx.status = 500;
    ctx.body = { error: 'Failed to fetch booking confirmation' };
  }
});
