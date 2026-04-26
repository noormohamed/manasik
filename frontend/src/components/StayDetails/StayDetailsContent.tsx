"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import Sidebar from "./Sidebar";
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
  customPolicies?: Array<{ id: string; title: string; description: string; enabled: boolean }>;
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
  const { addItem } = useCart();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState<Array<{ roomId: string; quantity: number }>>([]);

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

  const toggleRoomSelection = (roomId: string, room: Hotel['rooms'][0]) => {
    const existingRoom = selectedRooms.find(r => r.roomId === roomId);
    
    if (existingRoom) {
      // Remove room if already selected
      setSelectedRooms(selectedRooms.filter(r => r.roomId !== roomId));
    } else {
      // Add room
      setSelectedRooms([...selectedRooms, { roomId, quantity: 1 }]);
    }
  };

  const updateRoomQuantity = (roomId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove room if quantity is 0
      setSelectedRooms(selectedRooms.filter(r => r.roomId !== roomId));
    } else {
      // Update quantity
      setSelectedRooms(selectedRooms.map(r => 
        r.roomId === roomId ? { ...r, quantity: newQuantity } : r
      ));
    }
  };

  const getTotalGuestCapacity = () => {
    if (!hotel) return 0;
    return selectedRooms.reduce((total, selected) => {
      const room = hotel.rooms.find(r => r.id === selected.roomId);
      return total + (room ? room.capacity * selected.quantity : 0);
    }, 0);
  };

  const handleCheckout = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    const totalGuests = adults + children;
    if (totalGuests < 1) {
      alert("Please select at least one guest");
      return;
    }

    if (selectedRooms.length === 0) {
      alert("Please select at least one room");
      return;
    }

    const nights = calculateNights();
    if (nights < 1) {
      alert("Check-out must be after check-in");
      return;
    }

    const totalCapacity = getTotalGuestCapacity();
    if (totalCapacity < totalGuests) {
      alert(`Selected rooms can accommodate ${totalCapacity} guests, but you need ${totalGuests}`);
      return;
    }

    // Add all selected rooms to cart
    selectedRooms.forEach(selected => {
      const room = hotel!.rooms.find(r => r.id === selected.roomId);
      if (room) {
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
          guestCount: totalGuests,
          basePrice: room.basePrice * nights * selected.quantity,
          quantity: selected.quantity,
          currency: room.currency,
          metadata: {
            hotelAddress: `${hotel!.city}, ${hotel!.country}`,
            roomCapacity: room.capacity,
            adults,
            children,
          },
        });
      }
    });

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
                {/* Hotel Description */}
                <div className="mb-4">
                  <p>{hotel.description}</p>
                </div>

                {/* Amenities */}
                {Object.keys(hotel.amenities).length > 0 && (
                  <>
                    <h3 className="mb-4">Amenities</h3>
                    <Amenities amenities={hotel.amenities} />
                  </>
                )}

                {/* Available Rooms */}
                <div className="stay-details-room-rates mb-4">
                  <h3 className="mb-4">Available Rooms</h3>
                  
                  {/* Date Selection */}
                  <div className="card mb-4">
                    <div className="card-body">
                      <h6 className="mb-3">Select Your Dates & Guests</h6>
                      <div className="row">
                        <div className="col-md-3">
                          <label className="form-label">Check-in</label>
                          <input
                            type="date"
                            className="form-control"
                            value={checkIn}
                            onChange={(e) => setCheckIn(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Check-out</label>
                          <input
                            type="date"
                            className="form-control"
                            value={checkOut}
                            onChange={(e) => setCheckOut(e.target.value)}
                            min={checkIn || new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Adults</label>
                          <input
                            type="number"
                            className="form-control"
                            value={adults}
                            onChange={(e) => setAdults(Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                            max="10"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Children (0-15)</label>
                          <input
                            type="number"
                            className="form-control"
                            value={children}
                            onChange={(e) => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                            min="0"
                            max="10"
                          />
                        </div>
                      </div>
                      {checkIn && checkOut && calculateNights() > 0 && (
                        <div className="mt-3">
                          <span className="badge bg-info">
                            {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
                          </span>
                          <span className="badge bg-secondary ms-2">
                            {adults + children} guest{adults + children !== 1 ? 's' : ''} ({adults} adult{adults !== 1 ? 's' : ''}, {children} child{children !== 1 ? 'ren' : ''})
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
                    <>
                      <div className="row">
                        {hotel.rooms.map((room) => {
                          const nights = calculateNights();
                          const totalPrice = Number(room.basePrice) * (nights || 1);
                          const isSelected = selectedRooms.some(r => r.roomId === room.id);
                          
                          return (
                            <div key={room.id} className="col-12 mb-4">
                              <div 
                                className="card"
                                style={{
                                  cursor: 'pointer',
                                  border: isSelected ? '3px solid #0d6efd' : '1px solid #dee2e6',
                                  transition: 'all 0.3s ease',
                                  backgroundColor: isSelected ? '#f0f7ff' : 'white',
                                }}
                                onClick={() => toggleRoomSelection(room.id, room)}
                              >
                                <div className="row g-0">
                                  <div className="col-md-4" style={{ position: 'relative' }}>
                                    {/* Checkbox indicator */}
                                    <div
                                      style={{
                                        position: 'absolute',
                                        top: '10px',
                                        left: '10px',
                                        width: '24px',
                                        height: '24px',
                                        border: '2px solid #0d6efd',
                                        borderRadius: '4px',
                                        backgroundColor: isSelected ? '#0d6efd' : 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        zIndex: 10,
                                      }}
                                    >
                                      {isSelected && (
                                        <i className="ri-check-line" style={{ color: 'white', fontSize: '16px' }}></i>
                                      )}
                                    </div>
                                    <Image
                                      src={room.images[0]?.url || "/images/popular/popular-7.jpg"}
                                      alt={room.name}
                                      width={300}
                                      height={200}
                                      style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: '8px 0 0 8px' }}
                                    />
                                  </div>
                                  <div className="col-md-8">
                                    <div className="card-body" style={{ position: 'relative', paddingBottom: '80px' }}>
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

                                      {/* Price and Total at bottom right */}
                                      <div
                                        style={{
                                          position: 'absolute',
                                          bottom: '16px',
                                          right: '16px',
                                          textAlign: 'right',
                                        }}
                                      >
                                        <div>
                                          <small className="text-muted d-block">
                                            ${room.basePrice} per night
                                            {calculateNights() > 0 && ` × ${calculateNights()} night${calculateNights() !== 1 ? 's' : ''}`}
                                          </small>
                                          <h4 className="text-primary mb-0">
                                            ${totalPrice.toFixed(2)} {room.currency}
                                          </h4>
                                        </div>
                                      </div>

                                      {/* Action buttons at bottom left */}
                                      <div className="d-flex gap-2" style={{ position: 'absolute', bottom: '16px', left: '16px' }}>
                                        {!isSelected ? (
                                          <button
                                            className="btn btn-outline-primary btn-sm"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleRoomSelection(room.id, room);
                                            }}
                                            disabled={room.availableRooms < 1}
                                          >
                                            <i className="ri-checkbox-line me-1"></i>
                                            Select Room
                                          </button>
                                        ) : (
                                          <div className="d-flex align-items-center gap-2">
                                            <button
                                              className="btn btn-sm btn-outline-secondary"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const selected = selectedRooms.find(r => r.roomId === room.id);
                                                if (selected && selected.quantity > 1) {
                                                  updateRoomQuantity(room.id, selected.quantity - 1);
                                                }
                                              }}
                                            >
                                              <i className="ri-subtract-line"></i>
                                            </button>
                                            <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: 'bold' }}>
                                              {selectedRooms.find(r => r.roomId === room.id)?.quantity || 1}
                                            </span>
                                            <button
                                              className="btn btn-sm btn-outline-secondary"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const selected = selectedRooms.find(r => r.roomId === room.id);
                                                if (selected && selected.quantity < room.availableRooms) {
                                                  updateRoomQuantity(room.id, selected.quantity + 1);
                                                }
                                              }}
                                              disabled={selectedRooms.find(r => r.roomId === room.id)?.quantity === room.availableRooms}
                                            >
                                              <i className="ri-add-line"></i>
                                            </button>
                                            <button
                                              className="btn btn-sm btn-outline-danger"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleRoomSelection(room.id, room);
                                              }}
                                            >
                                              <i className="ri-close-line"></i>
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Reviews */}
                <ReviewsList hotelId={hotel.id} />

                {/* Proximity to Haram Gates & Attractions */}
                <ProximityInfo hotelId={hotel.id} />

                {/* Things to Know */}
                {(hotel.checkInTime || hotel.checkOutTime || hotel.cancellationPolicy || (hotel.customPolicies && hotel.customPolicies.some(r => r.enabled))) && (
                  <div className="mb-4">
                    <h3 className="mb-4">Things to Know</h3>

                    {/* Check-in / Check-out */}
                    {(hotel.checkInTime || hotel.checkOutTime) && (
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="mb-3">
                            <i className="ri-time-line me-2 text-primary"></i>
                            Check-in &amp; Check-out
                          </h6>
                          <div className="row">
                            {hotel.checkInTime && (
                              <div className="col-6">
                                <p className="text-muted small mb-1">Check-in from</p>
                                <p className="fw-semibold mb-0">{hotel.checkInTime}</p>
                              </div>
                            )}
                            {hotel.checkOutTime && (
                              <div className="col-6">
                                <p className="text-muted small mb-1">Check-out before</p>
                                <p className="fw-semibold mb-0">{hotel.checkOutTime}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cancellation Policy */}
                    {hotel.cancellationPolicy && (
                      <div className="card mb-3">
                        <div className="card-body">
                          <h6 className="mb-2">
                            <i className="ri-refund-2-line me-2 text-primary"></i>
                            Cancellation Policy
                          </h6>
                          <p className="text-muted small mb-0">{hotel.cancellationPolicy}</p>
                        </div>
                      </div>
                    )}

                    {/* Hotel Rules */}
                    {hotel.customPolicies && hotel.customPolicies.some(r => r.enabled) && (
                      <div className="card">
                        <div className="card-body">
                          <h6 className="mb-3">
                            <i className="ri-file-list-3-line me-2 text-primary"></i>
                            Hotel Rules
                          </h6>
                          <div className="row">
                            {hotel.customPolicies
                              .filter(rule => rule.enabled)
                              .map((rule) => (
                                <div key={rule.id} className="col-md-6 mb-3">
                                  <div className="d-flex gap-3">
                                    <i
                                      className="ri-checkbox-circle-line text-success flex-shrink-0"
                                      style={{ fontSize: '20px', marginTop: '2px' }}
                                    ></i>
                                    <div>
                                      <p className="fw-semibold mb-1">{rule.title}</p>
                                      <p className="text-muted small mb-0">{rule.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                hotel={{
                  name: hotel.name,
                  starRating: hotel.starRating,
                  averageRating: hotel.averageRating,
                  totalReviews: hotel.totalReviews,
                  cancellationPolicy: hotel.cancellationPolicy,
                  rooms: hotel.rooms,
                }}
                checkIn={checkIn}
                checkOut={checkOut}
                adults={adults}
                children={children}
                nights={calculateNights()}
                selectedRooms={selectedRooms}
                onCheckout={handleCheckout}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StayDetailsContent;
