"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import Information from "./Information";
import Amenities from "./Amenities";
import ReviewsList from "./ReviewsList";
import Location from "./Location";
import ProximityInfo from "./ProximityInfo";

interface Hotel {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  starRating: number;
  averageRating: number;
  totalReviews: number;
  totalRooms: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  status: string;
  images: Array<{ id: string; url: string; displayOrder: number }>;
  amenities: Record<string, boolean>;
  rooms: Array<{
    id: string;
    name: string;
    description: string;
    capacity: number;
    totalRooms: number;
    availableRooms: number;
    basePrice: number;
    currency: string;
    status: string;
    images: Array<{ id: string; url: string; displayOrder: number }>;
  }>;
}

interface StayDetailsContentProps {
  hotelId: string;
}

const StayDetailsContent: React.FC<StayDetailsContentProps> = ({ hotelId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = (await apiClient.get(`/hotels/${hotelId}`)) as { hotel?: Hotel };
      setHotel(response.hotel || null);
    } catch (err: any) {
      console.error("Error fetching hotel details:", err);
      setError(err.error || "Failed to fetch hotel details");
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const handleAddToCart = (room: Hotel['rooms'][0]) => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (!guests || guests < 1) {
      alert("Please select number of guests");
      return;
    }

    const nights = calculateNights();
    if (nights < 1) {
      alert("Check-out must be after check-in");
      return;
    }

    if (room.capacity < guests) {
      alert(`This room can accommodate up to ${room.capacity} guests`);
      return;
    }

    if (room.availableRooms < 1) {
      alert("This room is not available");
      return;
    }

    addItem({
      type: 'HOTEL',
      serviceId: hotel!.id,
      serviceName: hotel!.name,
      serviceImage: hotel!.images[0]?.url,
      roomTypeId: room.id,
      roomName: room.name,
      checkIn,
      checkOut,
      nights,
      guestCount: guests,
      basePrice: room.basePrice * nights,
      quantity: 1,
      currency: room.currency,
      metadata: {
        hotelAddress: `${hotel!.city}, ${hotel!.country}`,
        roomCapacity: room.capacity,
      },
    });

    alert("Added to cart! Continue shopping or go to checkout.");
  };

  const handleBookNow = (room: Hotel['rooms'][0]) => {
    handleAddToCart(room);
    router.push('/checkout');
  };

  if (loading) {
    return (
      <div className="stay-details-area ptb-175">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading hotel details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="stay-details-area ptb-175">
        <div className="container">
          <div className="alert alert-danger" role="alert">
            <i className="ri-error-warning-line me-2"></i>
            {error || "Hotel not found"}
          </div>
        </div>
      </div>
    );
  }

  const mainImage = hotel.images[0]?.url || "/images/stay-details.jpg";

  return (
    <>
      <div className="stay-details-area ptb-175">
        <div className="container">
          {/* Hotel Information - Above Images */}
          <div className="stay-details-information mb-4">
            <h2>{hotel.name}</h2>
            <div className="d-flex align-items-center mb-3">
              <div className="me-3">
                {Array.from({ length: 5 }, (_, i) => (
                  <i
                    key={i}
                    className={i < hotel.starRating ? "ri-star-fill" : "ri-star-line"}
                    style={{ color: '#ffc107' }}
                  ></i>
                ))}
              </div>
              <span className="text-muted">
                {Number(hotel.averageRating || 0).toFixed(1)} ({hotel.totalReviews} reviews)
              </span>
            </div>
            <div className="d-flex align-items-center mb-3">
              <i className="ri-map-pin-line me-2"></i>
              <span>{hotel.address}, {hotel.city}, {hotel.country}</span>
            </div>
            <p className="mb-4">{hotel.description}</p>
          </div>

          {/* Hotel Images */}
          <div className="stay-details-img mb-4">
            <Image 
              src={mainImage} 
              alt={hotel.name}
              width={1200}
              height={600}
              style={{ objectFit: 'cover', width: '100%', height: '500px', borderRadius: '8px' }}
            />
          </div>

          {/* Additional Images Gallery */}
          {hotel.images.length > 1 && (
            <div className="row mb-4">
              {hotel.images.slice(1, 5).map((image) => (
                <div key={image.id} className="col-md-3 mb-3">
                  <Image
                    src={image.url}
                    alt={hotel.name}
                    width={300}
                    height={200}
                    style={{ objectFit: 'cover', width: '100%', height: '200px', borderRadius: '8px' }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="row">
            <div className="col-lg-8">
              <div className="stay-details-content">
                {/* Check-in/Check-out Info */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h6><i className="ri-login-box-line me-2"></i>Check-in</h6>
                        <p className="mb-0">{hotel.checkInTime}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body">
                        <h6><i className="ri-logout-box-line me-2"></i>Check-out</h6>
                        <p className="mb-0">{hotel.checkOutTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div className="card mb-4">
                  <div className="card-body">
                    <h6><i className="ri-information-line me-2"></i>Cancellation Policy</h6>
                    <p className="mb-0">{hotel.cancellationPolicy}</p>
                  </div>
                </div>

                {/* Amenities */}
                {Object.keys(hotel.amenities).length > 0 && (
                  <Amenities amenities={hotel.amenities} />
                )}

                {/* Available Rooms */}
                <div className="stay-details-room-rates mb-4">
                  <h3 className="mb-4">Available Rooms</h3>
                  
                  {/* Date Selection */}
                  <div className="card mb-4">
                    <div className="card-body">
                      <h6 className="mb-3">Select Your Dates</h6>
                      <div className="row">
                        <div className="col-md-4">
                          <label className="form-label">Check-in</label>
                          <input
                            type="date"
                            className="form-control"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Check-out</label>
                          <input
                            type="date"
                            className="form-control"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label">Guests</label>
                          <input
                            type="number"
                            className="form-control"
                            value={guests}
                            onChange={(e) => setGuests(parseInt(e.target.value))}
                            min="1"
                            max="10"
                          />
                        </div>
                      </div>
                      {checkIn && checkOut && calculateNights() > 0 && (
                        <div className="mt-3">
                          <span className="badge bg-info">
                            {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Room List */}
                  {hotel.rooms.length === 0 ? (
                    <div className="alert alert-info">
                      <i className="ri-information-line me-2"></i>
                      No rooms available at this hotel.
                    </div>
                  ) : (
                    <div className="row">
                      {hotel.rooms.map((room) => {
                        const nights = calculateNights();
                        const totalPrice = Number(room.basePrice) * (nights || 1);
                        
                        return (
                          <div key={room.id} className="col-12 mb-4">
                            <div className="card">
                              <div className="row g-0">
                                <div className="col-md-4">
                                  <Image
                                    src={room.images[0]?.url || "/images/popular/popular-7.jpg"}
                                    alt={room.name}
                                    width={300}
                                    height={200}
                                    style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '8px 0 0 8px' }}
                                  />
                                </div>
                                <div className="col-md-8">
                                  <div className="card-body">
                                    <h5 className="card-title">{room.name}</h5>
                                    <p className="card-text text-muted">{room.description}</p>
                                    
                                    <div className="d-flex gap-3 mb-3">
                                      <span>
                                        <i className="ri-user-line me-1"></i>
                                        Up to {room.capacity} guests
                                      </span>
                                      <span>
                                        <i className="ri-door-line me-1"></i>
                                        {room.availableRooms} available
                                      </span>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                        <h4 className="text-primary mb-0">
                                          ${totalPrice.toFixed(2)} {room.currency}
                                        </h4>
                                        <small className="text-muted">
                                          ${room.basePrice} per night
                                          {nights > 0 && ` × ${nights} night${nights !== 1 ? 's' : ''}`}
                                        </small>
                                      </div>
                                      <div className="d-flex gap-2">
                                        <button
                                          className="btn btn-outline-primary"
                                          onClick={() => handleAddToCart(room)}
                                          disabled={room.availableRooms < 1}
                                        >
                                          <i className="ri-shopping-cart-line me-1"></i>
                                          Add to Cart
                                        </button>
                                        <button
                                          className="btn btn-primary"
                                          onClick={() => handleBookNow(room)}
                                          disabled={room.availableRooms < 1}
                                        >
                                          Book Now
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Reviews */}
                <ReviewsList hotelId={hotel.id} />

                {/* Proximity to Haram Gates & Attractions */}
                <ProximityInfo hotelId={hotel.id} />

                {/* Location */}
                <Location 
                  latitude={hotel.latitude} 
                  longitude={hotel.longitude}
                  address={`${hotel.address}, ${hotel.city}, ${hotel.country}`}
                />
              </div>
            </div>

            <div className="col-lg-4">
              {/* Sidebar with booking summary */}
              <Sidebar 
                hotel={hotel}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                nights={calculateNights()}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StayDetailsContent;
