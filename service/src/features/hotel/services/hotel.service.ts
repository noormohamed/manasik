/**
 * Hotel service - business logic for hotel operations
 */

import { Hotel } from '../models';
import { HotelHandler } from '../handlers';
import { RoomTypeHandler } from '../handlers';
import { HotelBookingHandler } from '../handlers';
import { HotelReviewHandler } from '../handlers';

export class HotelService {
  private hotelHandler: HotelHandler;
  private roomTypeHandler: RoomTypeHandler;
  private bookingHandler: HotelBookingHandler;
  private reviewHandler: HotelReviewHandler;

  constructor() {
    this.hotelHandler = new HotelHandler();
    this.roomTypeHandler = new RoomTypeHandler();
    this.bookingHandler = new HotelBookingHandler();
    this.reviewHandler = new HotelReviewHandler();
  }

  /**
   * Get hotel with all related data
   */
  async getHotelWithDetails(hotelId: string): Promise<any> {
    const hotel = await this.hotelHandler.getHotel(hotelId);
    if (!hotel) return null;

    const roomTypes = await this.roomTypeHandler.listRoomTypes(hotelId);
    const reviews = await this.reviewHandler.getHotelReviews(hotelId, { status: 'APPROVED' });
    const avgRating = await this.reviewHandler.getHotelAverageRating(hotelId);

    return {
      hotel: hotel.toJSON?.() || hotel,
      roomTypes: roomTypes.roomTypes,
      reviews: reviews.reviews,
      averageRating: avgRating,
      totalReviews: reviews.total,
    };
  }

  /**
   * Search hotels by criteria
   */
  async searchHotels(criteria: {
    city?: string;
    checkInDate?: string;
    checkOutDate?: string;
    guestCount?: number;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    // TODO: Implement search logic with availability checking
    return [];
  }

  /**
   * Get hotel statistics
   */
  async getHotelStats(hotelId: string): Promise<any> {
    const hotel = await this.hotelHandler.getHotel(hotelId);
    if (!hotel) throw new Error('Hotel not found');

    const bookings = await this.bookingHandler.listBookings({ hotelId });
    const reviews = await this.reviewHandler.getHotelReviews(hotelId);

    return {
      totalBookings: bookings.total,
      totalReviews: reviews.total,
      averageRating: await this.reviewHandler.getHotelAverageRating(hotelId),
      totalRooms: hotel.getTotalRooms?.() || 0,
      // TODO: Add more statistics
    };
  }

  /**
   * Get available rooms for date range
   */
  async getAvailableRooms(
    hotelId: string,
    checkInDate: string,
    checkOutDate: string,
    guestCount?: number
  ): Promise<any[]> {
    const roomTypes = await this.roomTypeHandler.listRoomTypes(hotelId);
    const available = [];

    for (const roomType of roomTypes.roomTypes) {
      const isAvailable = await this.bookingHandler.checkAvailability(
        roomType.getId?.() || '',
        checkInDate,
        checkOutDate,
        1
      );

      if (isAvailable && (!guestCount || roomType.getCapacity?.() >= guestCount)) {
        available.push(roomType);
      }
    }

    return available;
  }
}
