import { getPool } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

interface HaramGate {
  id: string;
  gateNumber: number;
  nameEnglish: string;
  nameArabic: string;
  latitude: number;
  longitude: number;
  description: string;
  hasDirectKaabaAccess: boolean;
  floorLevel: 'ground' | 'first' | 'roof';
  distanceMeters?: number;
  walkingTimeMinutes?: number;
  isRecommended?: boolean;
  isClosestDirectAccess?: boolean;
}

interface NearbyAttraction {
  id: string;
  nameEnglish: string;
  nameArabic: string;
  category: string;
  latitude: number;
  longitude: number;
  description: string;
  distanceMeters?: number;
  walkingTimeMinutes?: number;
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// Estimate walking time (average walking speed ~5 km/h = 83m/min)
function estimateWalkingTime(distanceMeters: number): number {
  return Math.ceil(distanceMeters / 83);
}

export async function getAllGates(): Promise<HaramGate[]> {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM haram_gates WHERE is_active = TRUE ORDER BY gate_number'
  );
  return (rows as any[]).map(row => ({
    id: row.id,
    gateNumber: row.gate_number,
    nameEnglish: row.name_english,
    nameArabic: row.name_arabic,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    description: row.description,
    hasDirectKaabaAccess: row.has_direct_kaaba_access === 1 || row.has_direct_kaaba_access === true,
    floorLevel: row.floor_level || 'ground'
  }));
}

export async function getAllAttractions(): Promise<NearbyAttraction[]> {
  const pool = getPool();
  const [rows] = await pool.query(
    'SELECT * FROM nearby_attractions WHERE is_active = TRUE ORDER BY category, name_english'
  );
  return (rows as any[]).map(row => ({
    id: row.id,
    nameEnglish: row.name_english,
    nameArabic: row.name_arabic,
    category: row.category,
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    description: row.description
  }));
}

export async function getGatesWithDistances(hotelLat: number, hotelLon: number): Promise<HaramGate[]> {
  const gates = await getAllGates();
  
  const gatesWithDistances = gates.map(gate => {
    const distance = calculateDistance(hotelLat, hotelLon, gate.latitude, gate.longitude);
    return {
      ...gate,
      distanceMeters: distance,
      walkingTimeMinutes: estimateWalkingTime(distance),
      isRecommended: false,
      isClosestDirectAccess: false
    };
  });

  // Sort by distance
  gatesWithDistances.sort((a, b) => a.distanceMeters! - b.distanceMeters!);

  // Mark the closest gate as recommended
  if (gatesWithDistances.length > 0) {
    gatesWithDistances[0].isRecommended = true;
  }

  // Find and mark the closest gate with direct Kaaba access
  const closestDirectAccess = gatesWithDistances.find(g => g.hasDirectKaabaAccess);
  if (closestDirectAccess) {
    closestDirectAccess.isClosestDirectAccess = true;
  }

  return gatesWithDistances;
}

export async function getAttractionsWithDistances(hotelLat: number, hotelLon: number): Promise<NearbyAttraction[]> {
  const attractions = await getAllAttractions();
  
  const attractionsWithDistances = attractions.map(attraction => {
    const distance = calculateDistance(hotelLat, hotelLon, attraction.latitude, attraction.longitude);
    return {
      ...attraction,
      distanceMeters: distance,
      walkingTimeMinutes: estimateWalkingTime(distance)
    };
  });

  // Sort by distance
  attractionsWithDistances.sort((a, b) => a.distanceMeters! - b.distanceMeters!);

  return attractionsWithDistances;
}

export async function getHotelProximityInfo(hotelId: string): Promise<{
  gates: HaramGate[];
  attractions: NearbyAttraction[];
  recommendedGate: HaramGate | null;
  closestDirectAccessGate: HaramGate | null;
}> {
  const pool = getPool();
  // Get hotel coordinates
  const [hotelRows] = await pool.query(
    'SELECT latitude, longitude FROM hotels WHERE id = ?',
    [hotelId]
  );

  if ((hotelRows as any[]).length === 0) {
    throw new Error('Hotel not found');
  }

  const hotel = (hotelRows as any[])[0];
  const hotelLat = hotel.latitude ? parseFloat(hotel.latitude) : null;
  const hotelLon = hotel.longitude ? parseFloat(hotel.longitude) : null;

  // Try to use cached distances from hotel_gate_distances table first
  const [cachedGates] = await pool.query(
    `SELECT hgd.distance_meters, hgd.walking_time_minutes, hgd.is_recommended,
            hg.id, hg.gate_number, hg.name_english, hg.name_arabic, hg.latitude, hg.longitude,
            hg.description, hg.has_direct_kaaba_access, hg.floor_level
     FROM hotel_gate_distances hgd
     JOIN haram_gates hg ON hgd.gate_id = hg.id
     WHERE hgd.hotel_id = ?
     ORDER BY hgd.distance_meters ASC`,
    [hotelId]
  );

  const [cachedAttractions] = await pool.query(
    `SELECT had.distance_meters, had.walking_time_minutes,
            na.id, na.name_english, na.name_arabic, na.category, na.latitude, na.longitude, na.description
     FROM hotel_attraction_distances had
     JOIN nearby_attractions na ON had.attraction_id = na.id
     WHERE had.hotel_id = ?
     ORDER BY had.distance_meters ASC`,
    [hotelId]
  );

  let gates: HaramGate[];
  let attractions: NearbyAttraction[];

  if ((cachedGates as any[]).length > 0) {
    // Use cached data
    gates = (cachedGates as any[]).map((row: any, index: number) => ({
      id: row.id,
      gateNumber: row.gate_number,
      nameEnglish: row.name_english,
      nameArabic: row.name_arabic,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      description: row.description,
      hasDirectKaabaAccess: row.has_direct_kaaba_access === 1 || row.has_direct_kaaba_access === true,
      floorLevel: row.floor_level || 'ground',
      distanceMeters: row.distance_meters,
      walkingTimeMinutes: row.walking_time_minutes,
      isRecommended: index === 0,
      isClosestDirectAccess: false,
    }));

    // Mark closest direct access gate
    const closestDirect = gates.find(g => g.hasDirectKaabaAccess);
    if (closestDirect) closestDirect.isClosestDirectAccess = true;
  } else if (hotelLat && hotelLon && !isNaN(hotelLat) && !isNaN(hotelLon)) {
    // Calculate from coordinates
    gates = await getGatesWithDistances(hotelLat, hotelLon);
  } else {
    // No cached data and no coordinates — return gates without distances
    const allGates = await getAllGates();
    gates = allGates.map(g => ({ ...g, distanceMeters: undefined, walkingTimeMinutes: undefined, isRecommended: false, isClosestDirectAccess: false }));
  }

  if ((cachedAttractions as any[]).length > 0) {
    attractions = (cachedAttractions as any[]).map((row: any) => ({
      id: row.id,
      nameEnglish: row.name_english,
      nameArabic: row.name_arabic,
      category: row.category,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      description: row.description,
      distanceMeters: row.distance_meters,
      walkingTimeMinutes: row.walking_time_minutes,
    }));
  } else if (hotelLat && hotelLon && !isNaN(hotelLat) && !isNaN(hotelLon)) {
    attractions = await getAttractionsWithDistances(hotelLat, hotelLon);
  } else {
    const allAttractions = await getAllAttractions();
    attractions = allAttractions.map(a => ({ ...a, distanceMeters: undefined, walkingTimeMinutes: undefined }));
  }

  return {
    gates,
    attractions,
    recommendedGate: gates.find(g => g.isRecommended) || gates[0] || null,
    closestDirectAccessGate: gates.find(g => g.isClosestDirectAccess) || null
  };
}

// Cache distances for a hotel (for performance optimization)
export async function cacheHotelDistances(hotelId: string): Promise<void> {
  const pool = getPool();
  const { gates, attractions } = await getHotelProximityInfo(hotelId);

  // Cache gate distances
  for (const gate of gates) {
    await pool.query(
      `INSERT INTO hotel_gate_distances (id, hotel_id, gate_id, distance_meters, walking_time_minutes, is_recommended)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         distance_meters = VALUES(distance_meters),
         walking_time_minutes = VALUES(walking_time_minutes),
         is_recommended = VALUES(is_recommended)`,
      [uuidv4(), hotelId, gate.id, gate.distanceMeters, gate.walkingTimeMinutes, gate.isRecommended]
    );
  }

  // Cache attraction distances
  for (const attraction of attractions) {
    await pool.query(
      `INSERT INTO hotel_attraction_distances (id, hotel_id, attraction_id, distance_meters, walking_time_minutes)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         distance_meters = VALUES(distance_meters),
         walking_time_minutes = VALUES(walking_time_minutes)`,
      [uuidv4(), hotelId, attraction.id, attraction.distanceMeters, attraction.walkingTimeMinutes]
    );
  }
}
