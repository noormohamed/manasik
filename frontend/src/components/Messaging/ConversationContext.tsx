"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import "./ConversationContext.css";

interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfRooms: number;
  totalPrice: number;
  status: string;
  guestName: string;
  guestEmail: string;
}

interface Hotel {
  id: string;
  name: string;
  location: string;
  city: string;
  country: string;
  description: string;
  averageRating: number;
  totalReviews: number;
  image?: string;
}

interface ConversationContextProps {
  bookingId?: string;
  hotelId: string;
}

const ConversationContext: React.FC<ConversationContextProps> = ({
  bookingId,
  hotelId,
}) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContextData();
  }, [bookingId, hotelId]);

  const fetchContextData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch booking if bookingId is provided
      if (bookingId) {
        try {
          const bookingResponse = (await apiClient.get(
            `/users/me/bookings?bookingId=${bookingId}`
          )) as { data?: Booking[] };
          if (bookingResponse.data && bookingResponse.data.length > 0) {
            setBooking(bookingResponse.data[0]);
          }
        } catch (err) {
          console.error("Error fetching booking:", err);
        }
      }

      // Fetch hotel details
      try {
        const hotelResponse = (await apiClient.get(
          `/hotels/${hotelId}`
        )) as { data?: Hotel };
        if (hotelResponse.data) {
          setHotel(hotelResponse.data);
        }
      } catch (err) {
        console.error("Error fetching hotel:", err);
      }
    } catch (err: any) {
      console.error("Error fetching context data:", err);
      setError(err.error || "Failed to load context");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (loading) {
    return (
      <div className="conversation-context">
        <div className="context-loading">
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-context">
      {error && (
        <div className="alert alert-warning alert-sm" role="alert">
          {error}
        </div>
      )}

      {/* Booking Context */}
      {booking && (
        <div className="context-section booking-context">
          <h5 className="context-title">
            <i className="ri-calendar-check-line"></i>
            Booking Details
          </h5>
          <div className="context-content">
            <div className="context-item">
              <label>Guest</label>
              <p>{booking.guestName}</p>
            </div>
            <div className="context-item">
              <label>Room Type</label>
              <p>{booking.roomType}</p>
            </div>
            <div className="context-item">
              <label>Check-in</label>
              <p>{formatDate(booking.checkInDate)}</p>
            </div>
            <div className="context-item">
              <label>Check-out</label>
              <p>{formatDate(booking.checkOutDate)}</p>
            </div>
            <div className="context-item">
              <label>Guests</label>
              <p>{booking.numberOfGuests}</p>
            </div>
            <div className="context-item">
              <label>Rooms</label>
              <p>{booking.numberOfRooms}</p>
            </div>
            <div className="context-item">
              <label>Total Price</label>
              <p className="price">{formatPrice(booking.totalPrice)}</p>
            </div>
            <div className="context-item">
              <label>Status</label>
              <p>
                <span className={`badge badge-${booking.status.toLowerCase()}`}>
                  {booking.status}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Hotel Context */}
      {hotel && (
        <div className="context-section hotel-context">
          <h5 className="context-title">
            <i className="ri-building-line"></i>
            Hotel Details
          </h5>
          <div className="context-content">
            <div className="context-item">
              <label>Hotel Name</label>
              <p>{hotel.name}</p>
            </div>
            <div className="context-item">
              <label>Location</label>
              <p>
                {hotel.city}, {hotel.country}
              </p>
            </div>
            {hotel.averageRating > 0 && (
              <div className="context-item">
                <label>Rating</label>
                <p>
                  <span className="rating">
                    <i className="ri-star-fill"></i>
                    {hotel.averageRating.toFixed(1)}
                  </span>
                  <span className="reviews">({hotel.totalReviews} reviews)</span>
                </p>
              </div>
            )}
            {hotel.description && (
              <div className="context-item">
                <label>Description</label>
                <p className="description">{hotel.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!booking && !hotel && (
        <div className="context-empty">
          <i className="ri-information-line"></i>
          <p>No context available</p>
        </div>
      )}
    </div>
  );
};

export default ConversationContext;
