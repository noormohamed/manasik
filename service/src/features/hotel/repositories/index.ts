/**
 * Hotel feature repositories
 */

import { HotelRepository } from './hotel.repository';
import { RoomTypeRepository } from './room-type.repository';

export { HotelRepository } from './hotel.repository';
export { RoomTypeRepository } from './room-type.repository';

// Singleton instances
let hotelRepository: HotelRepository | null = null;
let roomTypeRepository: RoomTypeRepository | null = null;

export function getHotelRepository(): HotelRepository {
  if (!hotelRepository) {
    hotelRepository = new HotelRepository();
  }
  return hotelRepository;
}

export function getRoomTypeRepository(): RoomTypeRepository {
  if (!roomTypeRepository) {
    roomTypeRepository = new RoomTypeRepository();
  }
  return roomTypeRepository;
}
