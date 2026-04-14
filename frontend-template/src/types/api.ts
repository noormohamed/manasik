export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface ApiError {
  error: string;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: string;
  territory: string;
  rating: number;
  pricePerNight: number;
  images: string[];
  amenities: string[];
}

export interface HotelBooking {
  id: string;
  hotelId: string;
  userId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfRooms: number;
  numberOfGuests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface CheckoutItem {
  id: string;
  type: 'HOTEL' | 'TAXI' | 'EXPERIENCE' | 'FOOD' | 'CAR';
  bookingId: string;
  quantity: number;
  price: number;
}

export interface CheckoutSession {
  id: string;
  customerId: string;
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
}
