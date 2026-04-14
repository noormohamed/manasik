import Router from 'koa-router';
import { Context } from 'koa';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { requireFeature } from '../../../middleware/feature-flag';
import { HotelRepository } from '../repositories/hotel.repository';
import { RoomRepository } from '../repositories/room.repository';
import { HotelFilterService } from '../services/hotel-filter.service';
import { getPool } from '../../../database/connection';
import * as haramGatesService from '../../../services/haram-gates.service';

export const createHotelRoutes = () => {
  const router = new Router({ prefix: '/hotels' });

  /**
   * GET /api/hotels/listings
   * Get hotels managed by the logged-in user
   */
  router.get('/listings', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      
      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      const { page = 1, limit = 20, includeRooms = 'false' } = ctx.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const hotelRepository = new HotelRepository();
      const hotels = await hotelRepository.findByUserManaged(userId, limitNum, offset);
      const total = await hotelRepository.countByUserManaged(userId);

      // Optionally include room types for each hotel
      if (includeRooms === 'true') {
        const roomRepository = new RoomRepository();
        for (const hotel of hotels) {
          hotel.rooms = await roomRepository.findByHotelId(hotel.id);
        }
      }

      ctx.body = {
        hotels,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      console.error('Error fetching user listings:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch listings' };
    }
  });

  /**
   * POST /api/hotels
   * Create a new hotel
   * Only accessible by authenticated users
   */
  router.post('/', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const companyId = (ctx as any).user?.companyId;
      
      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      const {
        name,
        description,
        address,
        city,
        state,
        country,
        zipCode,
        latitude,
        longitude,
        starRating,
        totalRooms,
        checkInTime,
        checkOutTime,
        cancellationPolicy,
        facilities,
        landmarks,
        surroundings,
        // @ts-ignore
      } = ctx.request.body;

      // Validate required fields
      if (!name || !address || !city || !country) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields: name, address, city, country' };
        return;
      }

      const hotelRepository = new HotelRepository();
      const hotelId = require('uuid').v4();

      // Create hotel - using database column names
      const created = await hotelRepository.createHotel({
        id: hotelId,
        company_id: companyId || null,
        agent_id: userId,
        name,
        description: description || '',
        status: 'ACTIVE',
        address,
        city,
        state: state || '',
        country,
        zip_code: zipCode || '',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        star_rating: starRating || 3,
        total_rooms: totalRooms || 0,
        check_in_time: checkInTime || '14:00:00',
        check_out_time: checkOutTime || '11:00:00',
        cancellation_policy: cancellationPolicy || 'Free cancellation up to 24 hours before check-in',
        created_at: new Date(),
        updated_at: new Date(),
      } as any);

      if (!created) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to create hotel' };
        return;
      }

      // Add facilities if provided
      const filterService = new HotelFilterService();
      if (facilities && Array.isArray(facilities) && facilities.length > 0) {
        for (const facility of facilities) {
          await filterService.addHotelFacility(hotelId, facility);
        }
      }

      // Add landmarks if provided
      if (landmarks && Array.isArray(landmarks) && landmarks.length > 0) {
        for (const landmark of landmarks) {
          await filterService.addHotelLandmark(
            hotelId,
            landmark.landmarkName,
            landmark.distanceKm,
            landmark.landmarkType
          );
        }
      }

      // Add surroundings if provided
      if (surroundings && typeof surroundings === 'object') {
        await filterService.updateHotelSurroundings(hotelId, surroundings);
      }

      // Fetch created hotel with facilities, landmarks, and surroundings
      const newHotel = await hotelRepository.findById(hotelId);
      const hotelFacilities = await filterService.getHotelFacilities(hotelId);
      const hotelLandmarks = await filterService.getHotelLandmarks(hotelId);
      const hotelSurroundings = await filterService.getHotelSurroundings(hotelId);

      ctx.status = 201;
      ctx.body = {
        message: 'Hotel created successfully',
        hotel: {
          ...newHotel,
          facilities: hotelFacilities,
          landmarks: hotelLandmarks,
          surroundings: hotelSurroundings,
        },
      };
    } catch (error) {
      console.error('Error creating hotel:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to create hotel' };
    }
  });

  /**
   * GET /api/hotels
   * Search hotels with filters
   * Query params:
   * - location: Search by city, country, or address
   * - city: Filter by specific city
   * - country: Filter by specific country
   * - checkIn: Check-in date (YYYY-MM-DD)
   * - checkOut: Check-out date (YYYY-MM-DD)
   * - guests: Number of guests
   * - minRating: Minimum star rating
   * - maxPrice: Maximum price per night
   * - facilities: Comma-separated list of facility names
   * - roomFacilities: Comma-separated list of room facility names
   * - proximityLandmark: Landmark name for proximity filter
   * - proximityDistance: Maximum distance in km
   * - surroundings: Comma-separated list (restaurants, cafes, attractions, nature, transport)
   * - airportMaxDistance: Maximum distance to airport in km
   * - page: Page number (default: 1)
   * - limit: Results per page (default: 20)
   */
  router.get('/', requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const {
        location,
        city,
        country,
        checkIn,
        checkOut,
        guests,
        minRating,
        maxPrice,
        facilities,
        roomFacilities,
        proximityLandmark,
        proximityDistance,
        surroundings,
        airportMaxDistance,
        page = 1,
        limit = 20,
      } = ctx.query;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const hotelRepository = new HotelRepository();

      // Parse comma-separated filter arrays
      const facilitiesArray = facilities ? (facilities as string).split(',').map(f => f.trim()) : undefined;
      const roomFacilitiesArray = roomFacilities ? (roomFacilities as string).split(',').map(f => f.trim()) : undefined;
      const surroundingsArray = surroundings ? (surroundings as string).split(',').map(s => s.trim()) : undefined;

      // Check if advanced filters are being used
      const hasAdvancedFilters = facilitiesArray || roomFacilitiesArray || proximityLandmark || surroundingsArray || airportMaxDistance;

      let hotels, total;

      if (hasAdvancedFilters) {
        // Use advanced filter search
        hotels = await hotelRepository.searchWithFilters({
          facilities: facilitiesArray,
          roomFacilities: roomFacilitiesArray,
          proximityLandmark: proximityLandmark as string,
          proximityDistance: proximityDistance ? parseInt(proximityDistance as string) : undefined,
          surroundings: surroundingsArray,
          airportMaxDistance: airportMaxDistance ? parseInt(airportMaxDistance as string) : undefined,
          limit: limitNum,
          offset,
        });
        total = await hotelRepository.countSearchWithFilters({
          facilities: facilitiesArray,
          roomFacilities: roomFacilitiesArray,
          proximityLandmark: proximityLandmark as string,
          proximityDistance: proximityDistance ? parseInt(proximityDistance as string) : undefined,
          surroundings: surroundingsArray,
          airportMaxDistance: airportMaxDistance ? parseInt(airportMaxDistance as string) : undefined,
        });
      } else {
        // Use basic search
        const filters = {
          location: location as string,
          city: city as string,
          country: country as string,
          checkIn: checkIn as string,
          checkOut: checkOut as string,
          guests: guests ? parseInt(guests as string) : undefined,
          minRating: minRating ? parseFloat(minRating as string) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
          limit: limitNum,
          offset,
        };

        hotels = await hotelRepository.search(filters);
        total = await hotelRepository.countSearch(filters);
      }

      ctx.body = {
        hotels,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        filters: {
          location,
          city,
          country,
          checkIn,
          checkOut,
          guests: guests ? parseInt(guests as string) : null,
          minRating: minRating ? parseFloat(minRating as string) : null,
          maxPrice: maxPrice ? parseFloat(maxPrice as string) : null,
          facilities: facilitiesArray,
          roomFacilities: roomFacilitiesArray,
          proximityLandmark,
          proximityDistance: proximityDistance ? parseInt(proximityDistance as string) : null,
          surroundings: surroundingsArray,
          airportMaxDistance: airportMaxDistance ? parseInt(airportMaxDistance as string) : null,
        },
      };
    } catch (error) {
      console.error('Error searching hotels:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to search hotels' };
    }
  });

  /**
   * GET /api/hotels/bookings
   * Get all bookings for hotels managed by the logged-in user
   */
  router.get('/bookings', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      
      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      const { page = 1, limit = 50, status } = ctx.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const hotelRepository = new HotelRepository();
      
      // Get all hotels managed by this user
      const managedHotels = await hotelRepository.findByUserManaged(userId, 1000, 0);
      const hotelIds = managedHotels.map(h => h.id);

      if (hotelIds.length === 0) {
        ctx.body = {
          bookings: [],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: 0,
            totalPages: 0,
          },
        };
        return;
      }

      // Fetch bookings for these hotels with customer and agent info
      // Note: metadata may use either 'hotelId' or 'hotel_id' depending on how booking was created
      const pool = getPool();
      
      let query = `
        SELECT 
          b.id,
          b.status,
          b.currency,
          b.subtotal,
          b.tax,
          b.total,
          b.booking_source,
          b.agent_id,
          b.customer_id,
          b.payment_status,
          b.metadata,
          b.hold_expires_at,
          b.created_at,
          b.updated_at,
          u.first_name as customer_first_name,
          u.last_name as customer_last_name,
          u.email as customer_email,
          ag.name as agent_name,
          ag.email as agent_email
        FROM bookings b
        LEFT JOIN users u ON b.customer_id = u.id
        LEFT JOIN agents ag ON b.agent_id = ag.id
        WHERE b.service_type = 'HOTEL'
          AND (
            JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) IN (${hotelIds.map(() => '?').join(',')})
            OR JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotel_id')) IN (${hotelIds.map(() => '?').join(',')})
          )
      `;

      const params: any[] = [...hotelIds, ...hotelIds];

      if (status) {
        query += ' AND b.status = ?';
        params.push(status);
      }

      query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(limitNum, offset);

      const [bookings] = await pool.query<any>(query, params);

      // Count total
      let countQuery = `
        SELECT COUNT(*) as total
        FROM bookings b
        WHERE b.service_type = 'HOTEL'
          AND (
            JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) IN (${hotelIds.map(() => '?').join(',')})
            OR JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotel_id')) IN (${hotelIds.map(() => '?').join(',')})
          )
      `;
      const countParams: any[] = [...hotelIds, ...hotelIds];
      if (status) {
        countQuery += ' AND b.status = ?';
        countParams.push(status);
      }

      const [countResult] = await pool.query<any>(countQuery, countParams);
      const total = countResult[0].total;

      // Parse metadata for each booking
      const formattedBookings = (bookings as any[]).map((booking: any) => {
        const metadata = typeof booking.metadata === 'string' 
          ? JSON.parse(booking.metadata) 
          : booking.metadata;

        // Determine guest info - prefer metadata, fall back to customer record
        const guestName = metadata.guestName || metadata.guest_name || 
          (booking.customer_first_name ? `${booking.customer_first_name} ${booking.customer_last_name}` : 'Guest');
        const guestEmail = metadata.guestEmail || metadata.guest_email || booking.customer_email || '';
        const guestPhone = metadata.guestPhone || metadata.guest_phone || '';

        return {
          id: booking.id,
          status: booking.status,
          currency: booking.currency,
          subtotal: parseFloat(booking.subtotal),
          tax: parseFloat(booking.tax),
          total: parseFloat(booking.total),
          paymentStatus: booking.payment_status,
          bookingSource: booking.booking_source || 'DIRECT',
          hotelId: metadata.hotelId || metadata.hotel_id,
          hotelName: metadata.hotelName || metadata.hotel_name,
          roomTypeId: metadata.roomTypeId || metadata.room_type_id,
          roomName: metadata.roomType || metadata.room_type,
          checkIn: metadata.checkInDate || metadata.check_in,
          checkOut: metadata.checkOutDate || metadata.check_out,
          nights: metadata.nights,
          // Guest info
          guestName,
          guestEmail,
          guestPhone,
          guestCount: metadata.guests || metadata.guest_count,
          customerId: booking.customer_id,
          // Agent info (if booked via agent)
          agentId: booking.agent_id,
          agentName: booking.agent_name,
          agentEmail: booking.agent_email,
          // Hold info for broker bookings
          holdExpiresAt: booking.hold_expires_at,
          // Timestamps
          createdAt: booking.created_at,
          updatedAt: booking.updated_at,
        };
      });

      ctx.body = {
        bookings: formattedBookings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      console.error('Error fetching bookings:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch bookings' };
    }
  });

  /**
   * GET /api/hotels/:id
   * Get hotel details with rooms, images, and amenities
   */
  router.get('/:id', requireFeature('hotelDetails'), async (ctx: Context) => {
    try {
      const { id } = ctx.params;

      const hotelRepository = new HotelRepository();
      const roomRepository = new RoomRepository();
      const pool = getPool();

      // Get hotel basic info
      const [hotelRows] = await pool.query<any>(
        'SELECT * FROM hotels WHERE id = ?',
        [id]
      );

      if (!hotelRows || hotelRows.length === 0) {
        ctx.status = 404;
        ctx.body = { error: 'Hotel not found' };
        return;
      }

      const hotelRow = hotelRows[0];

      // Get hotel images
      const [images] = await pool.query<any>(
        'SELECT id, image_url as url, display_order FROM hotel_images WHERE hotel_id = ? ORDER BY display_order',
        [id]
      );

      // Get hotel amenities
      const [amenitiesRows] = await pool.query<any>(
        'SELECT amenity_name, is_available FROM hotel_amenities WHERE hotel_id = ?',
        [id]
      );
      
      const amenities = amenitiesRows.reduce((acc: any, row: any) => {
        acc[row.amenity_name] = row.is_available === 1;
        return acc;
      }, {});

      // Get room types with images
      const rooms = await roomRepository.findByHotelId(id);

      ctx.body = {
        hotel: {
          id: hotelRow.id,
          name: hotelRow.name,
          description: hotelRow.description,
          address: hotelRow.address,
          city: hotelRow.city,
          state: hotelRow.state,
          country: hotelRow.country,
          zipCode: hotelRow.zip_code,
          latitude: hotelRow.latitude,
          longitude: hotelRow.longitude,
          starRating: hotelRow.star_rating,
          averageRating: parseFloat(hotelRow.average_rating || 0),
          totalReviews: hotelRow.total_reviews,
          totalRooms: hotelRow.total_rooms,
          checkInTime: hotelRow.check_in_time,
          checkOutTime: hotelRow.check_out_time,
          cancellationPolicy: hotelRow.cancellation_policy,
          status: hotelRow.status,
          images: images.map((img: any) => ({
            id: img.id,
            url: img.url,
            displayOrder: img.display_order,
          })),
          amenities,
          rooms,
        },
      };
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch hotel' };
    }
  });

  /**
   * PUT /api/hotels/:id
   * Update hotel details
   * Only accessible by hotel managers
   */
  router.put('/:id', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const { id } = ctx.params;
      const { 
        name, 
        description, 
        address, 
        city, 
        state, 
        country, 
        zipCode,
        latitude,
        longitude,
        starRating,
        checkInTime,
        checkOutTime,
        cancellationPolicy,
        status 
      } = (ctx.request as any).body;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      const hotelRepository = new HotelRepository();

      // Verify user manages this hotel
      const isManager = await hotelRepository.isUserManagingHotel(userId, id);
      if (!isManager) {
        ctx.status = 403;
        ctx.body = { error: 'You do not have permission to manage this hotel' };
        return;
      }

      // Update hotel - using database column names
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (state !== undefined) updateData.state = state;
      if (country !== undefined) updateData.country = country;
      if (zipCode !== undefined) updateData.zip_code = zipCode;
      if (latitude !== undefined) updateData.latitude = latitude ? parseFloat(latitude) : null;
      if (longitude !== undefined) updateData.longitude = longitude ? parseFloat(longitude) : null;
      if (starRating !== undefined) updateData.star_rating = starRating;
      if (checkInTime !== undefined) updateData.check_in_time = checkInTime;
      if (checkOutTime !== undefined) updateData.check_out_time = checkOutTime;
      if (cancellationPolicy !== undefined) updateData.cancellation_policy = cancellationPolicy;
      if (status !== undefined) updateData.status = status;
      updateData.updated_at = new Date();

      const updated = await hotelRepository.updateHotel(id, updateData);

      if (!updated) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to update hotel' };
        return;
      }

      // Fetch updated hotel
      const updatedHotel = await hotelRepository.findById(id);

      ctx.body = {
        message: 'Hotel updated successfully',
        hotel: updatedHotel,
      };
    } catch (error) {
      console.error('Error updating hotel:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to update hotel' };
    }
  });

  /**
   * GET /api/hotels/:id/rooms
   * Get available rooms for a hotel
   * Public endpoint - anyone can view rooms for search
   * Authenticated users who manage the hotel get additional details
   */
  router.get('/:id/rooms', requireFeature('roomAvailability'), async (ctx: Context) => {
    try {
      const { id } = ctx.params;
      const userId = (ctx as any).user?.userId; // Optional - may be undefined for public access
      
      const hotelRepository = new HotelRepository();
      const roomRepository = new RoomRepository();

      // Check if hotel exists
      const hotel = await hotelRepository.findById(id);
      if (!hotel) {
        ctx.status = 404;
        ctx.body = { error: 'Hotel not found' };
        return;
      }

      // Check if user manages this hotel (for additional access)
      let isManager = false;
      if (userId) {
        isManager = await hotelRepository.isUserManagingHotel(userId, id);
      }

      // Get room types
      const rooms = await roomRepository.findByHotelId(id);

      ctx.body = {
        hotelId: id,
        hotelName: hotel.name,
        isManager, // Indicates if the current user manages this hotel
        rooms,
        total: rooms.length,
      };
    } catch (error) {
      console.error('Error fetching rooms:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to fetch rooms' };
    }
  });

  /**
   * POST /api/hotels/:hotelId/rooms
   * Create a new room type
   * Only accessible by hotel managers
   */
  router.post('/:hotelId/rooms', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const { hotelId } = ctx.params;
      // @ts-ignore
      const { name, description, capacity, totalRooms, availableRooms, basePrice, currency, status, facilities } = ctx.request.body;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      // Validate required fields
      if (!name || !description) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields: name, description' };
        return;
      }

      const hotelRepository = new HotelRepository();
      const roomRepository = new RoomRepository();

      // Verify user manages this hotel
      const isManager = await hotelRepository.isUserManagingHotel(userId, hotelId);
      if (!isManager) {
        ctx.status = 403;
        ctx.body = { error: 'You do not have permission to manage this hotel' };
        return;
      }

      // Create room type
      const roomId = require('uuid').v4();
      const created = await roomRepository.create({
        id: roomId,
        hotel_id: hotelId,
        name,
        description,
        capacity: capacity || 2,
        total_rooms: totalRooms || 1,
        available_rooms: availableRooms || totalRooms || 1,
        base_price: basePrice || 100,
        currency: currency || 'USD',
        status: status || 'ACTIVE',
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (!created) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to create room type' };
        return;
      }

      // Add room facilities if provided
      const filterService = new HotelFilterService();
      if (facilities && Array.isArray(facilities) && facilities.length > 0) {
        for (const facility of facilities) {
          await filterService.addRoomFacility(roomId, facility);
        }
      }

      // Fetch created room with facilities
      const newRoom = await roomRepository.findById(roomId);
      const roomFacilities = await roomRepository.getRoomFacilities(roomId);

      ctx.status = 201;
      ctx.body = {
        message: 'Room type created successfully',
        room: {
          ...newRoom,
          facilities: roomFacilities,
        },
      };
    } catch (error) {
      console.error('Error creating room:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to create room type' };
    }
  });

  /**
   * PUT /api/hotels/:hotelId/rooms/:roomId
   * Update room details
   * Only accessible by hotel managers
   */
  router.put('/:hotelId/rooms/:roomId', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const { hotelId, roomId } = ctx.params;
      // @ts-ignore
      const { name, description, capacity, totalRooms, availableRooms, basePrice, status } = ctx.request.body;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      const hotelRepository = new HotelRepository();
      const roomRepository = new RoomRepository();

      // Verify user manages this hotel
      const isManager = await hotelRepository.isUserManagingHotel(userId, hotelId);
      if (!isManager) {
        ctx.status = 403;
        ctx.body = { error: 'You do not have permission to manage this hotel' };
        return;
      }

      // Verify room belongs to this hotel
      const room = await roomRepository.findById(roomId);
      if (!room || room.hotelId !== hotelId) {
        ctx.status = 404;
        ctx.body = { error: 'Room not found' };
        return;
      }

      // Update room
      const updated = await roomRepository.update(roomId, {
        name,
        description,
        capacity,
        total_rooms: totalRooms,
        available_rooms: availableRooms,
        base_price: basePrice,
        status,
      });

      if (!updated) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to update room' };
        return;
      }

      // Fetch updated room with images
      const updatedRoom = await roomRepository.findById(roomId);

      ctx.body = {
        message: 'Room updated successfully',
        room: updatedRoom,
      };
    } catch (error) {
      console.error('Error updating room:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to update room' };
    }
  });

  /**
   * POST /api/hotels/:id/bookings
   * Create a hotel booking
   */
  router.post('/:id/bookings', authMiddleware, requireFeature('hotelBooking'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const userEmail = (ctx as any).user?.email;
      const { id: hotelId } = ctx.params;
      // @ts-ignore
      const { roomTypeId, checkIn, checkOut, guestCount, guestName, guestEmail } = ctx.request.body;

      // Validate required fields
      if (!roomTypeId || !checkIn || !checkOut || !guestCount || !guestName || !guestEmail) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields: roomTypeId, checkIn, checkOut, guestCount, guestName, guestEmail' };
        return;
      }

      const hotelRepository = new HotelRepository();
      const roomRepository = new RoomRepository();
      const pool = getPool();

      // Verify hotel exists
      const hotel = await hotelRepository.findById(hotelId);
      if (!hotel) {
        ctx.status = 404;
        ctx.body = { error: 'Hotel not found' };
        return;
      }

      // Verify room type exists and belongs to hotel
      const room = await roomRepository.findById(roomTypeId);
      if (!room || room.hotelId !== hotelId) {
        ctx.status = 404;
        ctx.body = { error: 'Room type not found' };
        return;
      }

      // Check room availability
      if (room.availableRooms < 1) {
        ctx.status = 400;
        ctx.body = { error: 'No rooms available' };
        return;
      }

      // Check capacity
      if (room.capacity < guestCount) {
        ctx.status = 400;
        ctx.body = { error: `Room capacity is ${room.capacity} guests, but ${guestCount} guests requested` };
        return;
      }

      // Calculate nights and pricing
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      if (nights < 1) {
        ctx.status = 400;
        ctx.body = { error: 'Check-out must be after check-in' };
        return;
      }

      const subtotal = room.basePrice * nights;
      const taxRate = 0.10; // 10% tax
      const tax = subtotal * taxRate;
      const total = subtotal + tax;

      // Create booking
      const bookingId = require('uuid').v4();
      const metadata = {
        hotelId: hotelId,
        hotelName: hotel.name,
        roomTypeId: roomTypeId,
        roomType: room.name,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights,
        guestName: guestName,
        guestEmail: guestEmail,
        guests: guestCount,
        basePrice: room.basePrice,
      };

      // Get company_id from hotel (findById returns raw DB row with snake_case)
      const companyId = (hotel as any).company_id || (hotel as any).companyId || 'default-company';

      const insertQuery = `
        INSERT INTO bookings (
          id, company_id, customer_id, service_type, booking_source, status, currency, subtotal, tax, total, payment_status, metadata, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      await pool.execute(insertQuery, [
        bookingId,
        companyId,
        userId,
        'HOTEL',
        'DIRECT',
        'PENDING',
        room.currency,
        subtotal,
        tax,
        total,
        'PENDING',
        JSON.stringify(metadata),
      ]);

      // Fetch created booking
      const [bookingRows] = await pool.query(
        'SELECT * FROM bookings WHERE id = ?',
        [bookingId]
      );
      const bookingRow = bookingRows[0];

      ctx.status = 201;
      ctx.body = {
        message: 'Booking created successfully',
        booking: {
          id: bookingRow.id,
          status: bookingRow.status,
          currency: bookingRow.currency,
          subtotal: parseFloat(bookingRow.subtotal),
          tax: parseFloat(bookingRow.tax),
          total: parseFloat(bookingRow.total),
          hotelId,
          hotelName: hotel.name,
          roomTypeId,
          roomName: room.name,
          checkIn,
          checkOut,
          nights,
          guestName,
          guestEmail,
          guestCount,
          createdAt: bookingRow.created_at,
        },
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to create booking' };
    }
  });

  /**
   * POST /api/hotels/:id/facilities
   * Add a facility to a hotel
   * Only accessible by hotel managers
   */
  router.post('/:id/facilities', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const { id } = ctx.params;
      // @ts-ignore
      const { facilityName } = ctx.request.body;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      if (!facilityName) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required field: facilityName' };
        return;
      }

      const hotelRepository = new HotelRepository();

      // Verify user manages this hotel
      const isManager = await hotelRepository.isUserManagingHotel(userId, id);
      if (!isManager) {
        ctx.status = 403;
        ctx.body = { error: 'You do not have permission to manage this hotel' };
        return;
      }

      const filterService = new HotelFilterService();
      const added = await filterService.addHotelFacility(id, facilityName);

      if (!added) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to add facility' };
        return;
      }

      const facilities = await filterService.getHotelFacilities(id);

      ctx.status = 201;
      ctx.body = {
        message: 'Facility added successfully',
        facilities,
      };
    } catch (error) {
      console.error('Error adding facility:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to add facility' };
    }
  });

  /**
   * POST /api/hotels/:hotelId/rooms/:roomId/facilities
   * Add a facility to a room
   * Only accessible by hotel managers
   */
  router.post('/:hotelId/rooms/:roomId/facilities', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const { hotelId, roomId } = ctx.params;
      // @ts-ignore
      const { facilityName } = ctx.request.body;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      if (!facilityName) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required field: facilityName' };
        return;
      }

      const hotelRepository = new HotelRepository();

      // Verify user manages this hotel
      const isManager = await hotelRepository.isUserManagingHotel(userId, hotelId);
      if (!isManager) {
        ctx.status = 403;
        ctx.body = { error: 'You do not have permission to manage this hotel' };
        return;
      }

      const filterService = new HotelFilterService();
      const added = await filterService.addRoomFacility(roomId, facilityName);

      if (!added) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to add room facility' };
        return;
      }

      const roomFacilities = await filterService.getHotelRoomFacilities(hotelId);

      ctx.status = 201;
      ctx.body = {
        message: 'Room facility added successfully',
        roomFacilities,
      };
    } catch (error) {
      console.error('Error adding room facility:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to add room facility' };
    }
  });

  /**
   * POST /api/hotels/:id/landmarks
   * Add a landmark to a hotel
   * Only accessible by hotel managers
   */
  router.post('/:id/landmarks', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const { id } = ctx.params;
      // @ts-ignore
      const { landmarkName, distanceKm, landmarkType } = ctx.request.body;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      if (!landmarkName || distanceKm === undefined) {
        ctx.status = 400;
        ctx.body = { error: 'Missing required fields: landmarkName, distanceKm' };
        return;
      }

      const hotelRepository = new HotelRepository();

      // Verify user manages this hotel
      const isManager = await hotelRepository.isUserManagingHotel(userId, id);
      if (!isManager) {
        ctx.status = 403;
        ctx.body = { error: 'You do not have permission to manage this hotel' };
        return;
      }

      const filterService = new HotelFilterService();
      const added = await filterService.addHotelLandmark(id, landmarkName, distanceKm, landmarkType);

      if (!added) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to add landmark' };
        return;
      }

      const landmarks = await filterService.getHotelLandmarks(id);

      ctx.status = 201;
      ctx.body = {
        message: 'Landmark added successfully',
        landmarks,
      };
    } catch (error) {
      console.error('Error adding landmark:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to add landmark' };
    }
  });

  /**
   * PUT /api/hotels/:id/surroundings
   * Update hotel surroundings
   * Only accessible by hotel managers
   */
  router.put('/:id/surroundings', authMiddleware, requireFeature('hotelListing'), async (ctx: Context) => {
    try {
      const userId = (ctx as any).user?.userId;
      const { id } = ctx.params;
      // @ts-ignore
      const { restaurantsNearby, cafesNearby, topAttractions, naturalBeauty, publicTransport, closestAirportKm } = ctx.request.body;

      if (!userId) {
        ctx.status = 401;
        ctx.body = { error: 'Unauthorized' };
        return;
      }

      const hotelRepository = new HotelRepository();

      // Verify user manages this hotel
      const isManager = await hotelRepository.isUserManagingHotel(userId, id);
      if (!isManager) {
        ctx.status = 403;
        ctx.body = { error: 'You do not have permission to manage this hotel' };
        return;
      }

      const filterService = new HotelFilterService();
      const updated = await filterService.updateHotelSurroundings(id, {
        restaurantsNearby,
        cafesNearby,
        topAttractions,
        naturalBeauty,
        publicTransport,
        closestAirportKm,
      });

      if (!updated) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to update surroundings' };
        return;
      }

      const surroundings = await filterService.getHotelSurroundings(id);

      ctx.body = {
        message: 'Surroundings updated successfully',
        surroundings,
      };
    } catch (error) {
      console.error('Error updating surroundings:', error);
      ctx.status = 500;
      ctx.body = { error: 'Failed to update surroundings' };
    }
  });

  /**
   * GET /api/hotels/:id/proximity
   * Get nearby Haram gates and attractions with distances
   * Shows recommended gate based on closest distance
   */
  router.get('/:id/proximity', async (ctx: Context) => {
    try {
      const { id } = ctx.params;
      const proximityInfo = await haramGatesService.getHotelProximityInfo(id);
      ctx.body = proximityInfo;
    } catch (error: any) {
      console.error('Error fetching hotel proximity:', error);
      if (error.message === 'Hotel not found') {
        ctx.status = 404;
        ctx.body = { error: 'Hotel not found' };
      } else {
        ctx.status = 500;
        ctx.body = { error: 'Failed to fetch proximity information' };
      }
    }
  });

  return router;
};
