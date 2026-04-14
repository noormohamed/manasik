import { RoomTypeStatus, RoomAmenities } from '../types';

/**
 * RoomType represents a category of rooms in a hotel
 */
export class RoomType {
  id!: string;
  hotelId!: string;
  name!: string;
  description!: string;
  capacity: number = 1;
  totalRooms: number = 0;
  availableRooms: number = 0;
  basePrice!: number;
  currency: string = 'USD';
  amenities!: RoomAmenities;
  images: string[] = [];
  status!: RoomTypeStatus;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  getId(): string { return this.id; }
  getHotelId(): string { return this.hotelId; }
  getName(): string { return this.name; }
  getDescription(): string { return this.description; }
  getCapacity(): number { return this.capacity; }
  getTotalRooms(): number { return this.totalRooms; }
  getAvailableRooms(): number { return this.availableRooms; }
  getBasePrice(): number { return this.basePrice; }
  getCurrency(): string { return this.currency; }
  getAmenities(): RoomAmenities { return this.amenities; }
  getImages(): string[] { return this.images; }
  getStatus(): RoomTypeStatus { return this.status; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  setName(name: string): this {
    if (!name || name.trim().length === 0) throw new Error('Room type name cannot be empty');
    this.name = name;
    return this.touch();
  }

  setDescription(description: string): this {
    this.description = description;
    return this.touch();
  }

  setCapacity(capacity: number): this {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Capacity must be >= 1');
    this.capacity = capacity;
    return this.touch();
  }

  setTotalRooms(total: number): this {
    if (!Number.isInteger(total) || total < 0) throw new Error('Total rooms must be >= 0');
    this.totalRooms = total;
    this.availableRooms = Math.min(this.availableRooms, total);
    return this.touch();
  }

  setAvailableRooms(available: number): this {
    if (!Number.isInteger(available) || available < 0 || available > this.totalRooms) {
      throw new Error('Available rooms must be between 0 and total rooms');
    }
    this.availableRooms = available;
    return this.touch();
  }

  setBasePrice(price: number): this {
    if (!Number.isFinite(price) || price < 0) throw new Error('Base price must be >= 0');
    this.basePrice = price;
    return this.touch();
  }

  setAmenities(amenities: RoomAmenities): this {
    this.amenities = amenities;
    return this.touch();
  }

  addImage(imageUrl: string): this {
    this.images.push(imageUrl);
    return this.touch();
  }

  removeImage(imageUrl: string): this {
    this.images = this.images.filter(img => img !== imageUrl);
    return this.touch();
  }

  setStatus(status: RoomTypeStatus): this {
    this.status = status;
    return this.touch();
  }

  reserveRooms(count: number): boolean {
    if (count > this.availableRooms) return false;
    this.availableRooms -= count;
    this.touch();
    return true;
  }

  releaseRooms(count: number): this {
    this.availableRooms = Math.min(this.availableRooms + count, this.totalRooms);
    return this.touch();
  }

  private touch(): this {
    this.updatedAt = new Date();
    return this;
  }

  static create(params: {
    id: string;
    hotelId: string;
    name: string;
    description: string;
    capacity: number;
    totalRooms: number;
    basePrice: number;
    currency?: string;
    amenities?: RoomAmenities;
  }): RoomType {
    const roomType = new RoomType();
    roomType.id = params.id;
    roomType.hotelId = params.hotelId;
    roomType.name = params.name;
    roomType.description = params.description;
    roomType.capacity = params.capacity;
    roomType.totalRooms = params.totalRooms;
    roomType.availableRooms = params.totalRooms;
    roomType.basePrice = params.basePrice;
    roomType.currency = params.currency ?? 'USD';
    roomType.amenities = params.amenities ?? {};
    roomType.status = 'ACTIVE';
    roomType.createdAt = new Date();
    roomType.updatedAt = new Date();
    return roomType;
  }
}
