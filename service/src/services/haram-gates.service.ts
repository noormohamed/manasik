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
  distanceMeters?: number;
  walkingTimeMinutes?: number;
  isRecommended?: boolean;
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
    description: row.description
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
      isRecommended: false
    };
  });

  // Sort by distance
  gatesWithDistances.sort((a, b) => a.distanceMeters! - b.distanceMeters!);

  // Mark the closest gate as recommended
  if (gatesWithDistances.length > 0) {
    gatesWithDistances[0].isRecommended = true;
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
  const hotelLat = parseFloat(hotel.latitude);
  const hotelLon = parseFloat(hotel.longitude);

  const gates = await getGatesWithDistances(hotelLat, hotelLon);
  const attractions = await getAttractionsWithDistances(hotelLat, hotelLon);

  return {
    gates,
    attractions,
    recommendedGate: gates.find(g => g.isRecommended) || null
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
