/**
 * Hotel Search Service
 * Handles advanced search with sorting and Hajj/Umrah specific filters
 */

import { getPool } from '../../../database/connection';
import {
  loadWeights,
  computeScoring,
  parseScoringData,
  deriveFromHotelRow,
  ScoringWeights,
  ScoringBreakdown,
} from './scoring.service';

export type SortOption = 
  | 'recommended'
  | 'price_low_high'
  | 'price_high_low'
  | 'star_rating'
  | 'highest_reviewed'
  | 'manasik_score'
  | 'distance_to_haram';

export type ViewType = 'kaaba' | 'partial_haram' | 'city' | 'none';

export interface HotelSearchParams {
  // Location filters
  location?: string;
  city?: string;
  country?: string;
  
  // Date filters
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  
  // Basic filters
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  
  // Hajj/Umrah specific filters
  maxWalkingTimeToHaram?: number;
  viewTypes?: ViewType[];
  elderlyFriendly?: boolean;
  familyRooms?: boolean;
  bestForTags?: string[];
  
  // Advanced filters
  facilities?: string[];
  roomFacilities?: string[];
  
  // Sorting
  sortBy?: SortOption;
  
  // Pagination
  limit?: number;
  offset?: number;
}

export interface HotelSearchResult {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  averageRating: number;
  totalReviews: number;
  minPrice?: number;
  // Hajj/Umrah specific
  walkingTimeToHaram?: number;
  distanceToHaramMeters?: number;
  viewType?: ViewType;
  isElderlyFriendly: boolean;
  hasFamilyRooms: boolean;
  manasikScore?: number;
  scoringBreakdown?: ScoringBreakdown & { derived: boolean };
  nearestGateId?: string;
  bestForTags: string[];
  // Related data
  images: Array<{ id: string; url: string; displayOrder: number }>;
  rooms: Array<{ id: string; name: string; basePrice: number; currency: string; capacity: number }>;
}

export class HotelSearchService {
  private pool = getPool();

  /**
   * Search hotels with advanced filters and sorting
   */
  async search(params: HotelSearchParams): Promise<{ hotels: HotelSearchResult[]; total: number }> {
    const {
      location,
      city,
      country,
      checkIn,
      checkOut,
      guests = 1,
      minRating,
      maxPrice,
      minPrice,
      maxWalkingTimeToHaram,
      viewTypes,
      elderlyFriendly,
      familyRooms,
      bestForTags,
      facilities,
      roomFacilities,
      sortBy = 'recommended',
      limit = 20,
      offset = 0,
    } = params;

    // First, check which columns exist in the hotels table
    let hasWalkingTime = false;
    let hasViewType = false;
    let hasElderlyFriendly = false;
    let hasFamilyRooms = false;
    
    try {
      const [columns] = await this.pool.query<any>("SHOW COLUMNS FROM hotels");
      const columnNames = (columns as any[]).map((c: any) => c.Field);
      hasWalkingTime = columnNames.includes('walking_time_to_haram');
      hasViewType = columnNames.includes('view_type');
      hasElderlyFriendly = columnNames.includes('is_elderly_friendly');
      hasFamilyRooms = columnNames.includes('has_family_rooms');
    } catch (e) {
      // Continue with defaults
    }

    // Build the base query with only existing columns
    let selectQuery = `
      SELECT DISTINCT
        h.*,
        (SELECT MIN(rt.base_price) FROM room_types rt WHERE rt.hotel_id = h.id AND rt.status = 'ACTIVE') as min_price,
        (SELECT MAX(rt.base_price) FROM room_types rt WHERE rt.hotel_id = h.id AND rt.status = 'ACTIVE') as max_price
      FROM hotels h
      WHERE h.status = 'ACTIVE'
    `;

    let countQuery = `
      SELECT COUNT(DISTINCT h.id) as total
      FROM hotels h
      WHERE h.status = 'ACTIVE'
    `;

    const queryParams: any[] = [];
    const countParams: any[] = [];
    let whereClause = '';

    // Location filter
    if (location) {
      whereClause += ` AND (h.city LIKE ? OR h.country LIKE ? OR h.address LIKE ? OR h.name LIKE ?)`;
      const locationPattern = `%${location}%`;
      queryParams.push(locationPattern, locationPattern, locationPattern, locationPattern);
      countParams.push(locationPattern, locationPattern, locationPattern, locationPattern);
    }

    // City filter
    if (city) {
      whereClause += ` AND h.city = ?`;
      queryParams.push(city);
      countParams.push(city);
    }

    // Country filter
    if (country) {
      whereClause += ` AND h.country = ?`;
      queryParams.push(country);
      countParams.push(country);
    }

    // Star rating filter
    if (minRating) {
      whereClause += ` AND h.star_rating >= ?`;
      queryParams.push(minRating);
      countParams.push(minRating);
    }

    // Guest capacity filter
    if (guests) {
      whereClause += `
        AND EXISTS (
          SELECT 1 FROM room_types rt
          WHERE rt.hotel_id = h.id
            AND rt.status = 'ACTIVE'
            AND rt.capacity >= ?
        )
      `;
      queryParams.push(guests);
      countParams.push(guests);
    }

    // Price range filter
    if (maxPrice) {
      whereClause += `
        AND EXISTS (
          SELECT 1 FROM room_types rt
          WHERE rt.hotel_id = h.id
            AND rt.status = 'ACTIVE'
            AND rt.base_price <= ?
        )
      `;
      queryParams.push(maxPrice);
      countParams.push(maxPrice);
    }

    if (minPrice) {
      whereClause += `
        AND EXISTS (
          SELECT 1 FROM room_types rt
          WHERE rt.hotel_id = h.id
            AND rt.status = 'ACTIVE'
            AND rt.base_price >= ?
        )
      `;
      queryParams.push(minPrice);
      countParams.push(minPrice);
    }

    // Walking time to Haram filter (only if column exists)
    if (maxWalkingTimeToHaram && hasWalkingTime) {
      whereClause += ` AND h.walking_time_to_haram IS NOT NULL AND h.walking_time_to_haram <= ?`;
      queryParams.push(maxWalkingTimeToHaram);
      countParams.push(maxWalkingTimeToHaram);
    }

    // View type filter (only if column exists)
    if (viewTypes && viewTypes.length > 0 && hasViewType) {
      whereClause += ` AND h.view_type IN (${viewTypes.map(() => '?').join(',')})`;
      queryParams.push(...viewTypes);
      countParams.push(...viewTypes);
    }

    // Elderly friendly filter (only if column exists)
    if (elderlyFriendly === true && hasElderlyFriendly) {
      whereClause += ` AND h.is_elderly_friendly = TRUE`;
    }

    // Family rooms filter (only if column exists)
    if (familyRooms === true && hasFamilyRooms) {
      whereClause += ` AND h.has_family_rooms = TRUE`;
    }

    // Best for tags filter - handle both schema versions
    if (bestForTags && bestForTags.length > 0) {
      whereClause += `
        AND EXISTS (
          SELECT 1 FROM hotel_best_for_tags hbt
          WHERE hbt.hotel_id = h.id
            AND (hbt.tag IN (${bestForTags.map(() => '?').join(',')}) OR hbt.tag_name IN (${bestForTags.map(() => '?').join(',')}))
        )
      `;
      queryParams.push(...bestForTags, ...bestForTags);
      countParams.push(...bestForTags, ...bestForTags);
    }

    // Hotel facilities filter
    if (facilities && facilities.length > 0) {
      whereClause += `
        AND (
          SELECT COUNT(DISTINCT hf.facility_name)
          FROM hotel_facilities hf
          WHERE hf.hotel_id = h.id
            AND hf.facility_name IN (${facilities.map(() => '?').join(',')})
        ) = ?
      `;
      queryParams.push(...facilities, facilities.length);
      countParams.push(...facilities, facilities.length);
    }

    // Room facilities filter
    if (roomFacilities && roomFacilities.length > 0) {
      whereClause += `
        AND EXISTS (
          SELECT 1 FROM room_types rt
          WHERE rt.hotel_id = h.id
            AND rt.status = 'ACTIVE'
            AND (
              SELECT COUNT(DISTINCT rf.facility_name)
              FROM room_facilities rf
              WHERE rf.room_type_id = rt.id
                AND rf.facility_name IN (${roomFacilities.map(() => '?').join(',')})
            ) = ?
        )
      `;
      queryParams.push(...roomFacilities, roomFacilities.length);
      countParams.push(...roomFacilities, roomFacilities.length);
    }

    // Add where clause to queries
    selectQuery += whereClause;
    countQuery += whereClause;

    // Add sorting
    const orderClause = this.buildOrderClause(sortBy);
    selectQuery += ` ${orderClause}`;

    // Add pagination
    selectQuery += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    // Execute queries
    const [hotels] = await this.pool.query<any>(selectQuery, queryParams);
    const [countResult] = await this.pool.query<any>(countQuery, countParams);
    const total = countResult[0]?.total || 0;

    // Load weights once for scoring all hotels in this batch
    const weights = await loadWeights();

    // Fetch additional data for each hotel
    const hotelsWithDetails = await Promise.all(
      (hotels as any[]).map(async (row) => this.enrichHotelData(row, weights))
    );

    return { hotels: hotelsWithDetails, total };
  }

  /**
   * Build ORDER BY clause based on sort option
   * Note: Some columns may not exist in older schemas, so we use COALESCE with defaults
   */
  private buildOrderClause(sortBy: SortOption): string {
    switch (sortBy) {
      case 'price_low_high':
        return 'ORDER BY min_price ASC, h.average_rating DESC';
      case 'price_high_low':
        return 'ORDER BY min_price DESC, h.average_rating DESC';
      case 'star_rating':
        return 'ORDER BY h.star_rating DESC, h.average_rating DESC';
      case 'highest_reviewed':
        return 'ORDER BY h.total_reviews DESC, h.average_rating DESC';
      case 'manasik_score':
        return 'ORDER BY COALESCE(h.manasik_score, 0) DESC, h.average_rating DESC';
      case 'distance_to_haram':
        // Fall back to manasik_score if distance columns don't exist
        return 'ORDER BY COALESCE(h.manasik_score, 0) DESC, h.average_rating DESC';
      case 'recommended':
      default:
        // Recommended: combination of rating, reviews, and manasik score
        return `ORDER BY 
          (COALESCE(h.manasik_score, 0) * 0.4 + 
           COALESCE(h.average_rating, 0) * 0.4 + 
           LEAST(COALESCE(h.total_reviews, 0) / 100, 1) * 0.2) DESC,
          h.star_rating DESC`;
    }
  }

  /**
   * Enrich hotel data with images, rooms, tags and scoring breakdown
   */
  private async enrichHotelData(row: any, weights?: ScoringWeights): Promise<HotelSearchResult> {
    // Compute scoring breakdown
    const effectiveWeights = weights || await loadWeights();
    const averageRating = parseFloat(row.average_rating || 0);
    let scoringData = parseScoringData(row.scoring_data);
    let scoringDerived = false;
    if (!scoringData) {
      scoringData = deriveFromHotelRow(row).data;
      scoringDerived = true;
    }
    const scoringResult = computeScoring(scoringData, effectiveWeights, averageRating);
    const scoringBreakdown = { ...scoringResult, derived: scoringDerived };

    // Cache manasik_score if null
    if (row.manasik_score === null || row.manasik_score === undefined) {
      try {
        await this.pool.execute(
          'UPDATE hotels SET manasik_score = ? WHERE id = ?',
          [scoringResult.overall, row.id],
        );
        row.manasik_score = scoringResult.overall;
      } catch { /* non-fatal */ }
    }
    // Fetch images
    const [images] = await this.pool.query<any>(
      `SELECT id, image_url as url, display_order FROM hotel_images WHERE hotel_id = ? ORDER BY display_order LIMIT 5`,
      [row.id]
    );

    // Fetch rooms
    const [rooms] = await this.pool.query<any>(
      `SELECT id, name, base_price, currency, capacity FROM room_types WHERE hotel_id = ? AND status = 'ACTIVE' ORDER BY base_price ASC LIMIT 5`,
      [row.id]
    );

    // Fetch best for tags - handle both schema versions (tag or tag_name column)
    let tags: any[] = [];
    try {
      const [tagResults] = await this.pool.query<any>(
        `SELECT COALESCE(tag, tag_name) as tag FROM hotel_best_for_tags WHERE hotel_id = ?`,
        [row.id]
      );
      tags = tagResults as any[];
    } catch (e) {
      // If query fails, try alternative column name
      try {
        const [tagResults] = await this.pool.query<any>(
          `SELECT tag_name as tag FROM hotel_best_for_tags WHERE hotel_id = ?`,
          [row.id]
        );
        tags = tagResults as any[];
      } catch (e2) {
        // Table might not exist, continue without tags
        tags = [];
      }
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      address: row.address,
      city: row.city,
      state: row.state,
      country: row.country,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      starRating: row.star_rating,
      averageRating: parseFloat(row.average_rating || 0),
      totalReviews: row.total_reviews || 0,
      minPrice: row.min_price ? parseFloat(row.min_price) : undefined,
      // Hajj/Umrah specific - handle missing columns gracefully
      walkingTimeToHaram: row.walking_time_to_haram || undefined,
      distanceToHaramMeters: row.distance_to_haram_meters || undefined,
      viewType: row.view_type || undefined,
      isElderlyFriendly: row.is_elderly_friendly === 1 || row.is_elderly_friendly === true,
      hasFamilyRooms: row.has_family_rooms === 1 || row.has_family_rooms === true,
      manasikScore: scoringBreakdown.overall,
      scoringBreakdown,
      nearestGateId: row.nearest_gate_id || undefined,
      bestForTags: tags.map((t: any) => t.tag).filter(Boolean),
      // Related data
      images: (images as any[]).map((img: any) => ({
        id: img.id,
        url: img.url,
        displayOrder: img.display_order,
      })),
      rooms: (rooms as any[]).map((room: any) => ({
        id: room.id,
        name: room.name,
        basePrice: parseFloat(room.base_price),
        currency: room.currency,
        capacity: room.capacity,
      })),
    };
  }

  /**
   * Get available filter options for the current search context
   */
  async getFilterOptions(city?: string): Promise<{
    viewTypes: { value: ViewType; label: string; count: number }[];
    bestForTags: { value: string; label: string; count: number }[];
    priceRange: { min: number; max: number };
    walkingTimeRange: { min: number; max: number };
  }> {
    let whereClause = 'WHERE h.status = \'ACTIVE\'';
    const params: any[] = [];

    if (city) {
      whereClause += ' AND h.city = ?';
      params.push(city);
    }

    // Get view type counts
    const [viewTypeCounts] = await this.pool.query<any>(
      `SELECT h.view_type, COUNT(*) as count 
       FROM hotels h ${whereClause} AND h.view_type IS NOT NULL 
       GROUP BY h.view_type`,
      params
    );

    // Get best for tag counts
    const [tagCounts] = await this.pool.query<any>(
      `SELECT hbt.tag, COUNT(*) as count 
       FROM hotel_best_for_tags hbt 
       JOIN hotels h ON hbt.hotel_id = h.id 
       ${whereClause}
       GROUP BY hbt.tag`,
      params
    );

    // Get price range
    const [priceRange] = await this.pool.query<any>(
      `SELECT MIN(rt.base_price) as min_price, MAX(rt.base_price) as max_price
       FROM room_types rt
       JOIN hotels h ON rt.hotel_id = h.id
       ${whereClause} AND rt.status = 'ACTIVE'`,
      params
    );

    // Get walking time range
    const [walkingRange] = await this.pool.query<any>(
      `SELECT MIN(h.walking_time_to_haram) as min_time, MAX(h.walking_time_to_haram) as max_time
       FROM hotels h ${whereClause} AND h.walking_time_to_haram IS NOT NULL`,
      params
    );

    const viewTypeLabels: Record<ViewType, string> = {
      kaaba: 'Kaaba View',
      partial_haram: 'Partial Haram View',
      city: 'City View',
      none: 'No View',
    };

    const tagLabels: Record<string, string> = {
      families: 'Families',
      couples: 'Couples',
      solo_travelers: 'Solo Travelers',
      elderly: 'Elderly',
      groups: 'Groups',
      business: 'Business',
      budget: 'Budget',
      luxury: 'Luxury',
      first_time_pilgrims: 'First Time Pilgrims',
      repeat_pilgrims: 'Repeat Pilgrims',
      wheelchair_users: 'Wheelchair Users',
    };

    return {
      viewTypes: (viewTypeCounts as any[]).map((v: any) => ({
        value: v.view_type as ViewType,
        label: viewTypeLabels[v.view_type as ViewType] || v.view_type,
        count: v.count,
      })),
      bestForTags: (tagCounts as any[]).map((t: any) => ({
        value: t.tag,
        label: tagLabels[t.tag] || t.tag,
        count: t.count,
      })),
      priceRange: {
        min: priceRange[0]?.min_price ? parseFloat(priceRange[0].min_price) : 0,
        max: priceRange[0]?.max_price ? parseFloat(priceRange[0].max_price) : 1000,
      },
      walkingTimeRange: {
        min: walkingRange[0]?.min_time || 0,
        max: walkingRange[0]?.max_time || 60,
      },
    };
  }
}
