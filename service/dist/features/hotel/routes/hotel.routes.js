"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createHotelRoutes = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const auth_middleware_1 = require("../../../middleware/auth.middleware");
const feature_flag_1 = require("../../../middleware/feature-flag");
const hotel_repository_1 = require("../repositories/hotel.repository");
const room_repository_1 = require("../repositories/room.repository");
const hotel_filter_service_1 = require("../services/hotel-filter.service");
const hotel_search_service_1 = require("../services/hotel-search.service");
const connection_1 = require("../../../database/connection");
const haramGatesService = __importStar(require("../../../services/haram-gates.service"));
const createHotelRoutes = () => {
    const router = new koa_router_1.default({ prefix: '/hotels' });
    /**
     * GET /api/hotels/search
     * Advanced hotel search with sorting and Hajj/Umrah specific filters
     * Query params:
     * - location: Search by city, country, or address
     * - city: Filter by specific city
     * - country: Filter by specific country
     * - checkIn: Check-in date (YYYY-MM-DD)
     * - checkOut: Check-out date (YYYY-MM-DD)
     * - guests: Number of guests
     * - minRating: Minimum star rating
     * - minPrice: Minimum price per night
     * - maxPrice: Maximum price per night
     * - maxWalkingTimeToHaram: Maximum walking time to Haram in minutes
     * - viewTypes: Comma-separated view types (kaaba, partial_haram, city, none)
     * - elderlyFriendly: Filter for elderly-friendly hotels (true/false)
     * - familyRooms: Filter for hotels with family rooms (true/false)
     * - bestForTags: Comma-separated "best for" tags
     * - facilities: Comma-separated list of facility names
     * - roomFacilities: Comma-separated list of room facility names
     * - sortBy: Sort option (recommended, price_low_high, price_high_low, star_rating, highest_reviewed, manasik_score, distance_to_haram)
     * - page: Page number (default: 1)
     * - limit: Results per page (default: 20)
     */
    router.get('/search', (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { location, city, country, checkIn, checkOut, guests, minRating, minPrice, maxPrice, maxWalkingTimeToHaram, viewTypes, elderlyFriendly, familyRooms, bestForTags, facilities, roomFacilities, sortBy, page = 1, limit = 20, } = ctx.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            const searchService = new hotel_search_service_1.HotelSearchService();
            // Parse comma-separated arrays
            const viewTypesArray = viewTypes
                ? viewTypes.split(',').map(v => v.trim())
                : undefined;
            const bestForTagsArray = bestForTags
                ? bestForTags.split(',').map(t => t.trim())
                : undefined;
            const facilitiesArray = facilities
                ? facilities.split(',').map(f => f.trim())
                : undefined;
            const roomFacilitiesArray = roomFacilities
                ? roomFacilities.split(',').map(f => f.trim())
                : undefined;
            const { hotels, total } = yield searchService.search({
                location: location,
                city: city,
                country: country,
                checkIn: checkIn,
                checkOut: checkOut,
                guests: guests ? parseInt(guests) : undefined,
                minRating: minRating ? parseFloat(minRating) : undefined,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                maxWalkingTimeToHaram: maxWalkingTimeToHaram ? parseInt(maxWalkingTimeToHaram) : undefined,
                viewTypes: viewTypesArray,
                elderlyFriendly: elderlyFriendly === 'true',
                familyRooms: familyRooms === 'true',
                bestForTags: bestForTagsArray,
                facilities: facilitiesArray,
                roomFacilities: roomFacilitiesArray,
                sortBy: sortBy || 'recommended',
                limit: limitNum,
                offset,
            });
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
                    guests: guests ? parseInt(guests) : null,
                    minRating: minRating ? parseFloat(minRating) : null,
                    minPrice: minPrice ? parseFloat(minPrice) : null,
                    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                    maxWalkingTimeToHaram: maxWalkingTimeToHaram ? parseInt(maxWalkingTimeToHaram) : null,
                    viewTypes: viewTypesArray,
                    elderlyFriendly: elderlyFriendly === 'true',
                    familyRooms: familyRooms === 'true',
                    bestForTags: bestForTagsArray,
                    facilities: facilitiesArray,
                    roomFacilities: roomFacilitiesArray,
                    sortBy: sortBy || 'recommended',
                },
            };
        }
        catch (error) {
            console.error('Error searching hotels:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to search hotels' };
        }
    }));
    /**
     * GET /api/hotels/filter-options
     * Get available filter options for the search UI
     */
    router.get('/filter-options', (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { city } = ctx.query;
            const searchService = new hotel_search_service_1.HotelSearchService();
            const options = yield searchService.getFilterOptions(city);
            ctx.body = Object.assign({ sortOptions: [
                    { value: 'recommended', label: 'Recommended' },
                    { value: 'price_low_high', label: 'Price: Low to High' },
                    { value: 'price_high_low', label: 'Price: High to Low' },
                    { value: 'star_rating', label: 'Star Rating' },
                    { value: 'highest_reviewed', label: 'Highest Reviewed' },
                    { value: 'manasik_score', label: 'Manasik Score' },
                    { value: 'distance_to_haram', label: 'Distance to Haram' },
                ] }, options);
        }
        catch (error) {
            console.error('Error fetching filter options:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to fetch filter options' };
        }
    }));
    /**
     * GET /api/hotels/listings
     * Get hotels managed by the logged-in user
     */
    router.get('/listings', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                ctx.status = 401;
                ctx.body = { error: 'Unauthorized' };
                return;
            }
            const { page = 1, limit = 20, includeRooms = 'false' } = ctx.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            const hotelRepository = new hotel_repository_1.HotelRepository();
            const hotels = yield hotelRepository.findByUserManaged(userId, limitNum, offset);
            const total = yield hotelRepository.countByUserManaged(userId);
            // Optionally include room types for each hotel
            if (includeRooms === 'true') {
                const roomRepository = new room_repository_1.RoomRepository();
                for (const hotel of hotels) {
                    hotel.rooms = yield roomRepository.findByHotelId(hotel.id);
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
        }
        catch (error) {
            console.error('Error fetching user listings:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to fetch listings' };
        }
    }));
    /**
     * POST /api/hotels
     * Create a new hotel
     * Only accessible by authenticated users
     */
    router.post('/', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
            const companyId = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.companyId;
            if (!userId) {
                ctx.status = 401;
                ctx.body = { error: 'Unauthorized' };
                return;
            }
            const { name, description, address, city, state, country, zipCode, latitude, longitude, starRating, totalRooms, checkInTime, checkOutTime, cancellationPolicy, facilities, landmarks, surroundings,
            // @ts-ignore
             } = ctx.request.body;
            // Validate required fields
            if (!name || !address || !city || !country) {
                ctx.status = 400;
                ctx.body = { error: 'Missing required fields: name, address, city, country' };
                return;
            }
            const hotelRepository = new hotel_repository_1.HotelRepository();
            const hotelId = require('uuid').v4();
            // Create hotel - using database column names
            const created = yield hotelRepository.createHotel({
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
            });
            if (!created) {
                ctx.status = 500;
                ctx.body = { error: 'Failed to create hotel' };
                return;
            }
            // Add facilities if provided
            const filterService = new hotel_filter_service_1.HotelFilterService();
            if (facilities && Array.isArray(facilities) && facilities.length > 0) {
                for (const facility of facilities) {
                    yield filterService.addHotelFacility(hotelId, facility);
                }
            }
            // Add landmarks if provided
            if (landmarks && Array.isArray(landmarks) && landmarks.length > 0) {
                for (const landmark of landmarks) {
                    yield filterService.addHotelLandmark(hotelId, landmark.landmarkName, landmark.distanceKm, landmark.landmarkType);
                }
            }
            // Add surroundings if provided
            if (surroundings && typeof surroundings === 'object') {
                yield filterService.updateHotelSurroundings(hotelId, surroundings);
            }
            // Fetch created hotel with facilities, landmarks, and surroundings
            const newHotel = yield hotelRepository.findById(hotelId);
            const hotelFacilities = yield filterService.getHotelFacilities(hotelId);
            const hotelLandmarks = yield filterService.getHotelLandmarks(hotelId);
            const hotelSurroundings = yield filterService.getHotelSurroundings(hotelId);
            ctx.status = 201;
            ctx.body = {
                message: 'Hotel created successfully',
                hotel: Object.assign(Object.assign({}, newHotel), { facilities: hotelFacilities, landmarks: hotelLandmarks, surroundings: hotelSurroundings }),
            };
        }
        catch (error) {
            console.error('Error creating hotel:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to create hotel' };
        }
    }));
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
    router.get('/', (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { location, city, country, checkIn, checkOut, guests, minRating, maxPrice, facilities, roomFacilities, proximityLandmark, proximityDistance, surroundings, airportMaxDistance, page = 1, limit = 20, } = ctx.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            const hotelRepository = new hotel_repository_1.HotelRepository();
            // Parse comma-separated filter arrays
            const facilitiesArray = facilities ? facilities.split(',').map(f => f.trim()) : undefined;
            const roomFacilitiesArray = roomFacilities ? roomFacilities.split(',').map(f => f.trim()) : undefined;
            const surroundingsArray = surroundings ? surroundings.split(',').map(s => s.trim()) : undefined;
            // Check if advanced filters are being used
            const hasAdvancedFilters = facilitiesArray || roomFacilitiesArray || proximityLandmark || surroundingsArray || airportMaxDistance;
            let hotels, total;
            if (hasAdvancedFilters) {
                // Use advanced filter search
                hotels = yield hotelRepository.searchWithFilters({
                    facilities: facilitiesArray,
                    roomFacilities: roomFacilitiesArray,
                    proximityLandmark: proximityLandmark,
                    proximityDistance: proximityDistance ? parseInt(proximityDistance) : undefined,
                    surroundings: surroundingsArray,
                    airportMaxDistance: airportMaxDistance ? parseInt(airportMaxDistance) : undefined,
                    limit: limitNum,
                    offset,
                });
                total = yield hotelRepository.countSearchWithFilters({
                    facilities: facilitiesArray,
                    roomFacilities: roomFacilitiesArray,
                    proximityLandmark: proximityLandmark,
                    proximityDistance: proximityDistance ? parseInt(proximityDistance) : undefined,
                    surroundings: surroundingsArray,
                    airportMaxDistance: airportMaxDistance ? parseInt(airportMaxDistance) : undefined,
                });
            }
            else {
                // Use basic search
                const filters = {
                    location: location,
                    city: city,
                    country: country,
                    checkIn: checkIn,
                    checkOut: checkOut,
                    guests: guests ? parseInt(guests) : undefined,
                    minRating: minRating ? parseFloat(minRating) : undefined,
                    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                    limit: limitNum,
                    offset,
                };
                hotels = yield hotelRepository.search(filters);
                total = yield hotelRepository.countSearch(filters);
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
                    guests: guests ? parseInt(guests) : null,
                    minRating: minRating ? parseFloat(minRating) : null,
                    maxPrice: maxPrice ? parseFloat(maxPrice) : null,
                    facilities: facilitiesArray,
                    roomFacilities: roomFacilitiesArray,
                    proximityLandmark,
                    proximityDistance: proximityDistance ? parseInt(proximityDistance) : null,
                    surroundings: surroundingsArray,
                    airportMaxDistance: airportMaxDistance ? parseInt(airportMaxDistance) : null,
                },
            };
        }
        catch (error) {
            console.error('Error searching hotels:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to search hotels' };
        }
    }));
    /**
     * GET /api/hotels/bookings
     * Get all bookings for hotels managed by the logged-in user
     */
    router.get('/bookings', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
            if (!userId) {
                ctx.status = 401;
                ctx.body = { error: 'Unauthorized' };
                return;
            }
            const { page = 1, limit = 50, status } = ctx.query;
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;
            const hotelRepository = new hotel_repository_1.HotelRepository();
            // Get all hotels managed by this user
            const managedHotels = yield hotelRepository.findByUserManaged(userId, 1000, 0);
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
            // Fetch bookings for these hotels with customer, agent, and hotel provider info
            // Note: metadata may use either 'hotelId' or 'hotel_id' depending on how booking was created
            const pool = (0, connection_1.getPool)();
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
          ag.email as agent_email,
          h.provider_name,
          h.provider_reference,
          h.provider_phone
        FROM bookings b
        LEFT JOIN users u ON b.customer_id = u.id
        LEFT JOIN agents ag ON b.agent_id = ag.id
        LEFT JOIN hotels h ON JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) = h.id 
          OR JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotel_id')) = h.id
        WHERE b.service_type = 'HOTEL'
          AND (
            JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotelId')) IN (${hotelIds.map(() => '?').join(',')})
            OR JSON_UNQUOTE(JSON_EXTRACT(b.metadata, '$.hotel_id')) IN (${hotelIds.map(() => '?').join(',')})
          )
      `;
            const params = [...hotelIds, ...hotelIds];
            if (status) {
                query += ' AND b.status = ?';
                params.push(status);
            }
            query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
            params.push(limitNum, offset);
            const [bookings] = yield pool.query(query, params);
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
            const countParams = [...hotelIds, ...hotelIds];
            if (status) {
                countQuery += ' AND b.status = ?';
                countParams.push(status);
            }
            const [countResult] = yield pool.query(countQuery, countParams);
            const total = countResult[0].total;
            // Parse metadata for each booking and fetch guest details
            const formattedBookings = yield Promise.all(bookings.map((booking) => __awaiter(void 0, void 0, void 0, function* () {
                const metadata = typeof booking.metadata === 'string'
                    ? JSON.parse(booking.metadata)
                    : booking.metadata;
                // Determine guest info - prefer metadata, fall back to customer record
                const guestName = metadata.guestName || metadata.guest_name ||
                    (booking.customer_first_name ? `${booking.customer_first_name} ${booking.customer_last_name}` : 'Guest');
                const guestEmail = metadata.guestEmail || metadata.guest_email || booking.customer_email || '';
                const guestPhone = metadata.guestPhone || metadata.guest_phone || '';
                // Fetch guests for this booking from guests table
                const [guestRows] = yield pool.query(`SELECT id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger 
           FROM guests WHERE booking_id = ? ORDER BY is_lead_passenger DESC`, [booking.id]);
                const guests = guestRows.map((g) => ({
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
                    guests,
                    customerId: booking.customer_id,
                    // Agent info (if booked via agent)
                    agentId: booking.agent_id,
                    agentName: booking.agent_name,
                    agentEmail: booking.agent_email,
                    // Provider info
                    providerName: booking.provider_name,
                    providerReference: booking.provider_reference,
                    providerPhone: booking.provider_phone,
                    // Hold info for broker bookings
                    holdExpiresAt: booking.hold_expires_at,
                    // Timestamps
                    createdAt: booking.created_at,
                    updatedAt: booking.updated_at,
                };
            })));
            ctx.body = {
                bookings: formattedBookings,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            };
        }
        catch (error) {
            console.error('Error fetching bookings:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to fetch bookings' };
        }
    }));
    /**
     * GET /api/hotels/:id
     * Get hotel details with rooms, images, amenities, and conversion-critical info
     */
    router.get('/:id', (0, feature_flag_1.requireFeature)('hotelDetails'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = ctx.params;
            const hotelRepository = new hotel_repository_1.HotelRepository();
            const roomRepository = new room_repository_1.RoomRepository();
            const pool = (0, connection_1.getPool)();
            // Get hotel basic info
            const [hotelRows] = yield pool.query('SELECT * FROM hotels WHERE id = ?', [id]);
            if (!hotelRows || hotelRows.length === 0) {
                ctx.status = 404;
                ctx.body = { error: 'Hotel not found' };
                return;
            }
            const hotelRow = hotelRows[0];
            // Get hotel images
            const [images] = yield pool.query('SELECT id, image_url as url, display_order FROM hotel_images WHERE hotel_id = ? ORDER BY display_order', [id]);
            // Get hotel amenities
            const [amenitiesRows] = yield pool.query('SELECT amenity_name, is_available FROM hotel_amenities WHERE hotel_id = ?', [id]);
            const amenities = amenitiesRows.reduce((acc, row) => {
                acc[row.amenity_name] = row.is_available === 1;
                return acc;
            }, {});
            // Get room types with images
            const rooms = yield roomRepository.findByHotelId(id);
            // Get "Best for" tags
            const [bestForTags] = yield pool.query('SELECT tag_name, tag_icon FROM hotel_best_for_tags WHERE hotel_id = ?', [id]);
            // Get closest Haram gate for quick display
            const [closestGate] = yield pool.query(`
        SELECT 
          hgd.distance_meters,
          hgd.walking_time_minutes,
          hg.gate_number,
          hg.name_english,
          hg.has_direct_kaaba_access
        FROM hotel_gate_distances hgd
        JOIN haram_gates hg ON hgd.gate_id = hg.id
        WHERE hgd.hotel_id = ?
        ORDER BY hgd.distance_meters ASC
        LIMIT 1
      `, [id]);
            // Get hotel facilities
            const [facilities] = yield pool.query('SELECT facility_name FROM hotel_facilities WHERE hotel_id = ?', [id]);
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
                    // New conversion-critical fields
                    manasikScore: hotelRow.manasik_score ? parseFloat(hotelRow.manasik_score) : null,
                    walkDescription: hotelRow.walk_description,
                    liftSituation: hotelRow.lift_situation,
                    distanceExplanation: hotelRow.distance_explanation,
                    videoUrl: hotelRow.video_url,
                    videoThumbnail: hotelRow.video_thumbnail,
                    // Best for tags
                    bestForTags: bestForTags.map((tag) => ({
                        name: tag.tag_name,
                        icon: tag.tag_icon,
                    })),
                    // Closest Haram gate (quick access)
                    closestHaramGate: closestGate.length > 0 ? {
                        distanceMeters: closestGate[0].distance_meters,
                        walkingTimeMinutes: closestGate[0].walking_time_minutes,
                        gateNumber: closestGate[0].gate_number,
                        gateName: closestGate[0].name_english,
                        hasDirectKaabaAccess: closestGate[0].has_direct_kaaba_access === 1,
                    } : null,
                    // Facilities list
                    facilities: facilities.map((f) => f.facility_name),
                    images: images.map((img) => ({
                        id: img.id,
                        url: img.url,
                        displayOrder: img.display_order,
                    })),
                    amenities,
                    rooms,
                },
            };
        }
        catch (error) {
            console.error('Error fetching hotel details:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to fetch hotel' };
        }
    }));
    /**
     * PUT /api/hotels/:id
     * Update hotel details
     * Only accessible by hotel managers
     */
    router.put('/:id', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { id } = ctx.params;
            const { name, description, address, city, state, country, zipCode, latitude, longitude, starRating, checkInTime, checkOutTime, cancellationPolicy, status } = ctx.request.body;
            if (!userId) {
                ctx.status = 401;
                ctx.body = { error: 'Unauthorized' };
                return;
            }
            const hotelRepository = new hotel_repository_1.HotelRepository();
            // Verify user manages this hotel
            const isManager = yield hotelRepository.isUserManagingHotel(userId, id);
            if (!isManager) {
                ctx.status = 403;
                ctx.body = { error: 'You do not have permission to manage this hotel' };
                return;
            }
            // Update hotel - using database column names
            const updateData = {};
            if (name !== undefined)
                updateData.name = name;
            if (description !== undefined)
                updateData.description = description;
            if (address !== undefined)
                updateData.address = address;
            if (city !== undefined)
                updateData.city = city;
            if (state !== undefined)
                updateData.state = state;
            if (country !== undefined)
                updateData.country = country;
            if (zipCode !== undefined)
                updateData.zip_code = zipCode;
            if (latitude !== undefined)
                updateData.latitude = latitude ? parseFloat(latitude) : null;
            if (longitude !== undefined)
                updateData.longitude = longitude ? parseFloat(longitude) : null;
            if (starRating !== undefined)
                updateData.star_rating = starRating;
            if (checkInTime !== undefined)
                updateData.check_in_time = checkInTime;
            if (checkOutTime !== undefined)
                updateData.check_out_time = checkOutTime;
            if (cancellationPolicy !== undefined)
                updateData.cancellation_policy = cancellationPolicy;
            if (status !== undefined)
                updateData.status = status;
            updateData.updated_at = new Date();
            const updated = yield hotelRepository.updateHotel(id, updateData);
            if (!updated) {
                ctx.status = 500;
                ctx.body = { error: 'Failed to update hotel' };
                return;
            }
            // Fetch updated hotel
            const updatedHotel = yield hotelRepository.findById(id);
            ctx.body = {
                message: 'Hotel updated successfully',
                hotel: updatedHotel,
            };
        }
        catch (error) {
            console.error('Error updating hotel:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to update hotel' };
        }
    }));
    /**
     * POST /api/hotels/bookings/:id/refund
     * Issue a refund for a booking (hotel manager only)
     * Only hotel managers can refund bookings for their hotels
     */
    router.post('/bookings/:id/refund', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
            const bookingId = ctx.params.id;
            // @ts-ignore
            const { amount, reason } = ctx.request.body;
            if (!userId) {
                ctx.status = 401;
                ctx.body = { error: 'Unauthorized' };
                return;
            }
            if (!amount || !reason) {
                ctx.status = 400;
                ctx.body = { error: 'Missing required fields: amount, reason' };
                return;
            }
            const pool = (0, connection_1.getPool)();
            const hotelRepository = new hotel_repository_1.HotelRepository();
            // Get the booking
            const [bookingRows] = yield pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
            if (!bookingRows || bookingRows.length === 0) {
                ctx.status = 404;
                ctx.body = { error: 'Booking not found' };
                return;
            }
            const booking = bookingRows[0];
            const metadata = typeof booking.metadata === 'string'
                ? JSON.parse(booking.metadata)
                : booking.metadata;
            const hotelId = metadata.hotelId || metadata.hotel_id;
            // Verify user manages this hotel
            const isManager = yield hotelRepository.isUserManagingHotel(userId, hotelId);
            if (!isManager) {
                ctx.status = 403;
                ctx.body = { error: 'You do not have permission to refund bookings for this hotel' };
                return;
            }
            // Update booking with refund info
            const refundAmount = parseFloat(amount);
            const currentRefund = booking.refund_amount ? parseFloat(booking.refund_amount) : 0;
            const totalRefund = currentRefund + refundAmount;
            // Determine if this is a full or partial refund
            const bookingTotal = parseFloat(booking.total);
            const isFullRefund = totalRefund >= bookingTotal;
            const [result] = yield pool.query(`UPDATE bookings 
         SET refund_amount = ?,
             refund_reason = ?,
             refunded_at = NOW(),
             status = ?,
             updated_at = NOW()
         WHERE id = ?`, [totalRefund, reason, isFullRefund ? 'REFUNDED' : booking.status, bookingId]);
            if (result.affectedRows === 0) {
                ctx.status = 500;
                ctx.body = { error: 'Failed to process refund' };
                return;
            }
            ctx.body = {
                success: true,
                message: 'Refund processed successfully',
                refund: {
                    bookingId,
                    amount: refundAmount,
                    totalRefund,
                    isFullRefund,
                    reason,
                    refundedAt: new Date().toISOString(),
                },
            };
        }
        catch (error) {
            console.error('Refund booking error:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to process refund' };
        }
    }));
    /**
     * GET /api/hotels/:id/rooms
     * Get available rooms for a hotel
     * Public endpoint - anyone can view rooms for search
     * Authenticated users who manage the hotel get additional details
     */
    router.get('/:id/rooms', (0, feature_flag_1.requireFeature)('roomAvailability'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const { id } = ctx.params;
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId; // Optional - may be undefined for public access
            const hotelRepository = new hotel_repository_1.HotelRepository();
            const roomRepository = new room_repository_1.RoomRepository();
            // Check if hotel exists
            const hotel = yield hotelRepository.findById(id);
            if (!hotel) {
                ctx.status = 404;
                ctx.body = { error: 'Hotel not found' };
                return;
            }
            // Check if user manages this hotel (for additional access)
            let isManager = false;
            if (userId) {
                isManager = yield hotelRepository.isUserManagingHotel(userId, id);
            }
            // Get room types
            const rooms = yield roomRepository.findByHotelId(id);
            ctx.body = {
                hotelId: id,
                hotelName: hotel.name,
                isManager, // Indicates if the current user manages this hotel
                rooms,
                total: rooms.length,
            };
        }
        catch (error) {
            console.error('Error fetching rooms:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to fetch rooms' };
        }
    }));
    /**
     * POST /api/hotels/:hotelId/rooms
     * Create a new room type
     * Only accessible by hotel managers
     */
    router.post('/:hotelId/rooms', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
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
            const hotelRepository = new hotel_repository_1.HotelRepository();
            const roomRepository = new room_repository_1.RoomRepository();
            // Verify user manages this hotel
            const isManager = yield hotelRepository.isUserManagingHotel(userId, hotelId);
            if (!isManager) {
                ctx.status = 403;
                ctx.body = { error: 'You do not have permission to manage this hotel' };
                return;
            }
            // Create room type
            const roomId = require('uuid').v4();
            const created = yield roomRepository.create({
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
            const filterService = new hotel_filter_service_1.HotelFilterService();
            if (facilities && Array.isArray(facilities) && facilities.length > 0) {
                for (const facility of facilities) {
                    yield filterService.addRoomFacility(roomId, facility);
                }
            }
            // Fetch created room with facilities
            const newRoom = yield roomRepository.findById(roomId);
            const roomFacilities = yield roomRepository.getRoomFacilities(roomId);
            ctx.status = 201;
            ctx.body = {
                message: 'Room type created successfully',
                room: Object.assign(Object.assign({}, newRoom), { facilities: roomFacilities }),
            };
        }
        catch (error) {
            console.error('Error creating room:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to create room type' };
        }
    }));
    /**
     * PUT /api/hotels/:hotelId/rooms/:roomId
     * Update room details
     * Only accessible by hotel managers
     */
    router.put('/:hotelId/rooms/:roomId', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { hotelId, roomId } = ctx.params;
            // @ts-ignore
            const { name, description, capacity, totalRooms, availableRooms, basePrice, status } = ctx.request.body;
            if (!userId) {
                ctx.status = 401;
                ctx.body = { error: 'Unauthorized' };
                return;
            }
            const hotelRepository = new hotel_repository_1.HotelRepository();
            const roomRepository = new room_repository_1.RoomRepository();
            // Verify user manages this hotel
            const isManager = yield hotelRepository.isUserManagingHotel(userId, hotelId);
            if (!isManager) {
                ctx.status = 403;
                ctx.body = { error: 'You do not have permission to manage this hotel' };
                return;
            }
            // Verify room belongs to this hotel
            const room = yield roomRepository.findById(roomId);
            if (!room || room.hotelId !== hotelId) {
                ctx.status = 404;
                ctx.body = { error: 'Room not found' };
                return;
            }
            // Update room
            const updated = yield roomRepository.update(roomId, {
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
            const updatedRoom = yield roomRepository.findById(roomId);
            ctx.body = {
                message: 'Room updated successfully',
                room: updatedRoom,
            };
        }
        catch (error) {
            console.error('Error updating room:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to update room' };
        }
    }));
    /**
     * POST /api/hotels/:id/bookings
     * Create a hotel booking with guest details
     * Request body:
     * - roomTypeId: Room type ID
     * - checkIn: Check-in date (YYYY-MM-DD)
     * - checkOut: Check-out date (YYYY-MM-DD)
     * - guestCount: Number of guests
     * - guestName: Lead passenger name (for backward compatibility)
     * - guestEmail: Lead passenger email (for backward compatibility)
     * - guestPhone: Lead passenger phone (optional)
     * - guestDetails: Array of guest objects with: firstName, lastName, email, phone, nationality, passportNumber, dateOfBirth, isLeadPassenger
     */
    router.post('/:id/bookings', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelBooking'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
            const userEmail = (_b = ctx.user) === null || _b === void 0 ? void 0 : _b.email;
            const { id: hotelId } = ctx.params;
            // @ts-ignore
            const { roomTypeId, checkIn, checkOut, guestCount, guestName, guestEmail, guestPhone, guestDetails } = ctx.request.body;
            // Validate required fields
            if (!roomTypeId || !checkIn || !checkOut || !guestCount || !guestName || !guestEmail) {
                ctx.status = 400;
                ctx.body = { error: 'Missing required fields: roomTypeId, checkIn, checkOut, guestCount, guestName, guestEmail' };
                return;
            }
            const hotelRepository = new hotel_repository_1.HotelRepository();
            const roomRepository = new room_repository_1.RoomRepository();
            const pool = (0, connection_1.getPool)();
            // Verify hotel exists
            const hotel = yield hotelRepository.findById(hotelId);
            if (!hotel) {
                ctx.status = 404;
                ctx.body = { error: 'Hotel not found' };
                return;
            }
            // Verify room type exists and belongs to hotel
            const room = yield roomRepository.findById(roomTypeId);
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
            // Access hotel address fields - hotel is raw DB row with snake_case
            const hotelAddress = hotel.address || '';
            const hotelCity = hotel.city || '';
            const hotelCountry = hotel.country || '';
            const metadata = {
                hotelId: hotelId,
                hotelName: hotel.name,
                hotelAddress: hotelAddress,
                hotelCity: hotelCity,
                hotelCountry: hotelCountry,
                hotelFullAddress: [hotelAddress, hotelCity, hotelCountry].filter(Boolean).join(', '),
                roomTypeId: roomTypeId,
                roomType: room.name,
                checkInDate: checkIn,
                checkOutDate: checkOut,
                nights,
                guestName: guestName,
                guestEmail: guestEmail,
                guestPhone: guestPhone || '',
                guests: guestCount,
                basePrice: room.basePrice,
            };
            // Get company_id from hotel (findById returns raw DB row with snake_case)
            const companyId = hotel.company_id || hotel.companyId || 'default-company';
            // Prepare guest details for storage
            const processedGuestDetails = guestDetails && Array.isArray(guestDetails)
                ? guestDetails.map((guest) => ({
                    firstName: guest.firstName || '',
                    lastName: guest.lastName || '',
                    email: guest.email || '',
                    phone: guest.phone || '',
                    nationality: guest.nationality || '',
                    passportNumber: guest.passportNumber || '',
                    dateOfBirth: guest.dateOfBirth || '',
                    isLeadPassenger: guest.isLeadPassenger || false,
                }))
                : [];
            const insertQuery = `
        INSERT INTO bookings (
          id, company_id, customer_id, service_type, booking_source, status, currency, subtotal, tax, total, payment_status, metadata, guest_details, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
            yield pool.execute(insertQuery, [
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
                JSON.stringify(processedGuestDetails),
            ]);
            // Store individual guests in guests table
            if (processedGuestDetails.length > 0) {
                for (const guest of processedGuestDetails) {
                    const guestId = require('uuid').v4();
                    const guestInsertQuery = `
            INSERT INTO guests (
              id, booking_id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
          `;
                    yield pool.execute(guestInsertQuery, [
                        guestId,
                        bookingId,
                        guest.firstName,
                        guest.lastName,
                        guest.email,
                        guest.phone,
                        guest.nationality,
                        guest.passportNumber,
                        guest.dateOfBirth || null,
                        guest.isLeadPassenger ? 1 : 0,
                    ]);
                }
            }
            // Fetch created booking
            const [bookingRows] = yield pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
            const bookingRow = bookingRows[0];
            // Fetch guests for response
            const [guestRows] = yield pool.query(`SELECT id, first_name, last_name, email, phone, nationality, passport_number, date_of_birth, is_lead_passenger 
         FROM guests WHERE booking_id = ? ORDER BY is_lead_passenger DESC`, [bookingId]);
            const guests = guestRows.map((g) => ({
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
                    guests,
                    createdAt: bookingRow.created_at,
                },
            };
        }
        catch (error) {
            console.error('Error creating booking:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to create booking' };
        }
    }));
    /**
     * POST /api/hotels/:id/facilities
     * Add a facility to a hotel
     * Only accessible by hotel managers
     */
    router.post('/:id/facilities', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
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
            const hotelRepository = new hotel_repository_1.HotelRepository();
            // Verify user manages this hotel
            const isManager = yield hotelRepository.isUserManagingHotel(userId, id);
            if (!isManager) {
                ctx.status = 403;
                ctx.body = { error: 'You do not have permission to manage this hotel' };
                return;
            }
            const filterService = new hotel_filter_service_1.HotelFilterService();
            const added = yield filterService.addHotelFacility(id, facilityName);
            if (!added) {
                ctx.status = 500;
                ctx.body = { error: 'Failed to add facility' };
                return;
            }
            const facilities = yield filterService.getHotelFacilities(id);
            ctx.status = 201;
            ctx.body = {
                message: 'Facility added successfully',
                facilities,
            };
        }
        catch (error) {
            console.error('Error adding facility:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to add facility' };
        }
    }));
    /**
     * POST /api/hotels/:hotelId/rooms/:roomId/facilities
     * Add a facility to a room
     * Only accessible by hotel managers
     */
    router.post('/:hotelId/rooms/:roomId/facilities', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
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
            const hotelRepository = new hotel_repository_1.HotelRepository();
            // Verify user manages this hotel
            const isManager = yield hotelRepository.isUserManagingHotel(userId, hotelId);
            if (!isManager) {
                ctx.status = 403;
                ctx.body = { error: 'You do not have permission to manage this hotel' };
                return;
            }
            const filterService = new hotel_filter_service_1.HotelFilterService();
            const added = yield filterService.addRoomFacility(roomId, facilityName);
            if (!added) {
                ctx.status = 500;
                ctx.body = { error: 'Failed to add room facility' };
                return;
            }
            const roomFacilities = yield filterService.getHotelRoomFacilities(hotelId);
            ctx.status = 201;
            ctx.body = {
                message: 'Room facility added successfully',
                roomFacilities,
            };
        }
        catch (error) {
            console.error('Error adding room facility:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to add room facility' };
        }
    }));
    /**
     * POST /api/hotels/:id/landmarks
     * Add a landmark to a hotel
     * Only accessible by hotel managers
     */
    router.post('/:id/landmarks', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
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
            const hotelRepository = new hotel_repository_1.HotelRepository();
            // Verify user manages this hotel
            const isManager = yield hotelRepository.isUserManagingHotel(userId, id);
            if (!isManager) {
                ctx.status = 403;
                ctx.body = { error: 'You do not have permission to manage this hotel' };
                return;
            }
            const filterService = new hotel_filter_service_1.HotelFilterService();
            const added = yield filterService.addHotelLandmark(id, landmarkName, distanceKm, landmarkType);
            if (!added) {
                ctx.status = 500;
                ctx.body = { error: 'Failed to add landmark' };
                return;
            }
            const landmarks = yield filterService.getHotelLandmarks(id);
            ctx.status = 201;
            ctx.body = {
                message: 'Landmark added successfully',
                landmarks,
            };
        }
        catch (error) {
            console.error('Error adding landmark:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to add landmark' };
        }
    }));
    /**
     * PUT /api/hotels/:id/surroundings
     * Update hotel surroundings
     * Only accessible by hotel managers
     */
    router.put('/:id/surroundings', auth_middleware_1.authMiddleware, (0, feature_flag_1.requireFeature)('hotelListing'), (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.userId;
            const { id } = ctx.params;
            // @ts-ignore
            const { restaurantsNearby, cafesNearby, topAttractions, naturalBeauty, publicTransport, closestAirportKm } = ctx.request.body;
            if (!userId) {
                ctx.status = 401;
                ctx.body = { error: 'Unauthorized' };
                return;
            }
            const hotelRepository = new hotel_repository_1.HotelRepository();
            // Verify user manages this hotel
            const isManager = yield hotelRepository.isUserManagingHotel(userId, id);
            if (!isManager) {
                ctx.status = 403;
                ctx.body = { error: 'You do not have permission to manage this hotel' };
                return;
            }
            const filterService = new hotel_filter_service_1.HotelFilterService();
            const updated = yield filterService.updateHotelSurroundings(id, {
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
            const surroundings = yield filterService.getHotelSurroundings(id);
            ctx.body = {
                message: 'Surroundings updated successfully',
                surroundings,
            };
        }
        catch (error) {
            console.error('Error updating surroundings:', error);
            ctx.status = 500;
            ctx.body = { error: 'Failed to update surroundings' };
        }
    }));
    /**
     * GET /api/hotels/:id/proximity
     * Get nearby Haram gates and attractions with distances
     * Shows recommended gate based on closest distance
     */
    router.get('/:id/proximity', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { id } = ctx.params;
            const proximityInfo = yield haramGatesService.getHotelProximityInfo(id);
            ctx.body = proximityInfo;
        }
        catch (error) {
            console.error('Error fetching hotel proximity:', error);
            if (error.message === 'Hotel not found') {
                ctx.status = 404;
                ctx.body = { error: 'Hotel not found' };
            }
            else {
                ctx.status = 500;
                ctx.body = { error: 'Failed to fetch proximity information' };
            }
        }
    }));
    return router;
};
exports.createHotelRoutes = createHotelRoutes;
