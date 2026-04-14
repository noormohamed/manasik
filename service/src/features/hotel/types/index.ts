/**
 * Hotel feature types
 */

export type HotelStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type RoomTypeStatus = 'ACTIVE' | 'INACTIVE';

export interface HotelAmenities {
  [key: string]: boolean;
}

export interface RoomAmenities {
  [key: string]: boolean;
}

export interface HotelLocation {
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Tax rates by territory (country/state)
 * Format: "COUNTRY" or "COUNTRY-STATE"
 * Examples: "US", "US-NY", "US-CA", "GB", "FR", "AU"
 */
export interface TaxRate {
  territory: string;  // e.g., "US-NY", "US-CA", "GB", "FR"
  rate: number;       // e.g., 0.08 for 8%
  description?: string;
}

export const DEFAULT_TAX_RATES: TaxRate[] = [
  { territory: 'US-NY', rate: 0.08, description: 'New York' },
  { territory: 'US-CA', rate: 0.0725, description: 'California' },
  { territory: 'US-TX', rate: 0.0625, description: 'Texas' },
  { territory: 'US-FL', rate: 0.06, description: 'Florida' },
  { territory: 'US', rate: 0.07, description: 'USA (default)' },
  { territory: 'GB', rate: 0.20, description: 'United Kingdom' },
  { territory: 'FR', rate: 0.20, description: 'France' },
  { territory: 'DE', rate: 0.19, description: 'Germany' },
  { territory: 'AU', rate: 0.10, description: 'Australia' },
  { territory: 'CA', rate: 0.05, description: 'Canada (GST)' },
  { territory: 'JP', rate: 0.10, description: 'Japan' },
  { territory: 'SG', rate: 0.07, description: 'Singapore' },
];

export interface HotelBookingMetadata {
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomTypeName: string;
  roomCount: number;           // Number of rooms selected
  roomOccupancy: number;       // Capacity per room (e.g., 2 for double room)
  checkInDate: string;         // YYYY-MM-DD
  checkOutDate: string;        // YYYY-MM-DD
  guestCount: number;          // Total number of guests
  pricePerNight: number;       // Price per room per night
  territory: string;           // Territory for tax calculation (e.g., "US-NY", "GB")
  taxRate: number;             // Tax rate applied (e.g., 0.08 for 8%)
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  specialRequests?: string;
}

export interface HotelReviewCriteria {
  cleanliness: number;
  comfort: number;
  service: number;
  amenities: number;
  valueForMoney: number;
  location: number;
  [key: string]: number;  // Index signature for compatibility with ReviewCriteria
}

