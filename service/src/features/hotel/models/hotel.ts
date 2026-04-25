import { HotelStatus, HotelAmenities, HotelLocation } from '../types';

/**
 * Hotel represents a hotel property
 * Belongs to a company and has multiple room types
 */
export class Hotel {
  id!: string;
  companyId!: string;
  agentId!: string;
  name!: string;
  description!: string;
  status!: HotelStatus;
  location!: HotelLocation;
  starRating: number = 0;
  totalRooms: number = 0;
  amenities!: HotelAmenities;
  images: string[] = [];
  checkInTime: string = '14:00';
  checkOutTime: string = '11:00';
  cancellationPolicy?: string;
  customPolicies?: any[];
  averageRating: number = 0;
  totalReviews: number = 0;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  getId(): string { return this.id; }
  getCompanyId(): string { return this.companyId; }
  getAgentId(): string { return this.agentId; }
  getName(): string { return this.name; }
  getDescription(): string { return this.description; }
  getStatus(): HotelStatus { return this.status; }
  getLocation(): HotelLocation { return this.location; }
  getStarRating(): number { return this.starRating; }
  getTotalRooms(): number { return this.totalRooms; }
  getAmenities(): HotelAmenities { return this.amenities; }
  getImages(): string[] { return this.images; }
  getCheckInTime(): string { return this.checkInTime; }
  getCheckOutTime(): string { return this.checkOutTime; }
  getCancellationPolicy(): string | undefined { return this.cancellationPolicy; }
  getAverageRating(): number { return this.averageRating; }
  getTotalReviews(): number { return this.totalReviews; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  setName(name: string): this {
    if (!name || name.trim().length === 0) throw new Error('Hotel name cannot be empty');
    this.name = name;
    return this.touch();
  }

  setDescription(description: string): this {
    this.description = description;
    return this.touch();
  }

  setStatus(status: HotelStatus): this {
    this.status = status;
    return this.touch();
  }

  setLocation(location: HotelLocation): this {
    this.location = location;
    return this.touch();
  }

  setStarRating(rating: number): this {
    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      throw new Error('Star rating must be between 0 and 5');
    }
    this.starRating = rating;
    return this.touch();
  }

  setTotalRooms(total: number): this {
    if (!Number.isInteger(total) || total < 0) throw new Error('Total rooms must be >= 0');
    this.totalRooms = total;
    return this.touch();
  }

  setAmenities(amenities: HotelAmenities): this {
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

  setCheckInTime(time: string): this {
    if (!/^\d{2}:\d{2}$/.test(time)) throw new Error('Invalid time format. Use HH:mm');
    this.checkInTime = time;
    return this.touch();
  }

  setCheckOutTime(time: string): this {
    if (!/^\d{2}:\d{2}$/.test(time)) throw new Error('Invalid time format. Use HH:mm');
    this.checkOutTime = time;
    return this.touch();
  }

  setCancellationPolicy(policy: string): this {
    this.cancellationPolicy = policy;
    return this.touch();
  }

  updateRating(newRating: number): this {
    this.totalReviews++;
    this.averageRating = (this.averageRating * (this.totalReviews - 1) + newRating) / this.totalReviews;
    return this.touch();
  }

  private touch(): this {
    this.updatedAt = new Date();
    return this;
  }

  toJSON(): any {
    return {
      id: this.id,
      companyId: this.companyId,
      agentId: this.agentId,
      name: this.name,
      description: this.description,
      status: this.status,
      location: this.location,
      starRating: this.starRating,
      totalRooms: this.totalRooms,
      amenities: this.amenities,
      images: this.images,
      checkInTime: this.checkInTime,
      checkOutTime: this.checkOutTime,
      cancellationPolicy: this.cancellationPolicy,
      averageRating: this.averageRating,
      totalReviews: this.totalReviews,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static create(params: {
    id: string;
    companyId: string;
    agentId: string;
    name: string;
    description: string;
    location: HotelLocation;
    amenities?: HotelAmenities;
  }): Hotel {
    const hotel = new Hotel();
    hotel.id = params.id;
    hotel.companyId = params.companyId;
    hotel.agentId = params.agentId;
    hotel.name = params.name;
    hotel.description = params.description;
    hotel.location = params.location;
    hotel.amenities = params.amenities ?? {};
    hotel.status = 'DRAFT';
    hotel.createdAt = new Date();
    hotel.updatedAt = new Date();
    return hotel;
  }
}
