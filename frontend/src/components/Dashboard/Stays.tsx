"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api";

import placeImg1 from "/public/images/popular/popular-7.jpg";

interface Booking {
  id: string;
  hotelId: string;
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  total: number;
  refundAmount?: number;
  currency: string;
  status: string;
  guestCount: number;
  createdAt: string;
  hotelImage?: string;
  hotelCity?: string;
}

const Stays = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Use the user bookings endpoint (for customers)
      const response = (await apiClient.get('/users/me/bookings')) as { bookings?: Booking[] };
      
      // Map the response to our Booking interface
      const mappedBookings = (response.bookings || []).map((b: any) => ({
        id: b.id,
        hotelId: b.metadata?.hotelId || b.hotelId || '',
        hotelName: b.hotelName || b.metadata?.hotelName || 'Hotel',
        roomName: b.roomType || b.metadata?.roomType || 'Room',
        checkIn: b.checkInDate || b.metadata?.checkInDate || '',
        checkOut: b.checkOutDate || b.metadata?.checkOutDate || '',
        nights: b.nights || b.metadata?.nights || 1,
        total: b.total || 0,
        currency: b.currency || 'USD',
        status: b.status || 'PENDING',
        guestCount: b.guests || b.metadata?.guests || 1,
        createdAt: b.createdAt || '',
        hotelImage: b.metadata?.hotelImage,
        hotelCity: b.metadata?.hotelCity,
      }));
      
      setBookings(mappedBookings.slice(0, 6)); // Limit to 6 for dashboard
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-success';
      case 'PENDING':
        return 'bg-warning';
      case 'CANCELLED':
        return 'bg-danger';
      case 'COMPLETED':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <i className="ri-error-warning-line me-2"></i>
        {error}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="ri-calendar-line" style={{ fontSize: '48px', color: '#ccc' }}></i>
        <h5 className="mt-3">No bookings yet</h5>
        <p className="text-muted">Start exploring hotels and make your first booking!</p>
        <Link href="/stay" className="default-btn active mt-2">
          Browse Hotels
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="row justify-content-center">
        {bookings.map((booking) => (
          <div key={booking.id} className="col-xl-6 col-md-6">
            <div className="most-popular-single-item">
              <div className="most-popular-single-img position-relative">
                <Link href={`/dashboard/stay-details?hotelId=${booking.hotelId}`}>
                  <Image 
                    src={booking.hotelImage || placeImg1} 
                    alt={booking.hotelName}
                    width={400}
                    height={300}
                    style={{ objectFit: 'cover', width: '100%', height: '200px' }}
                  />
                </Link>
                <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                  <span className={`badge ${getStatusBadgeClass(booking.status)}`} style={{ padding: '8px 12px' }}>
                    {booking.status}
                  </span>
                </div>
              </div>

              <div className="most-popular-single-content">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <small className="text-muted">
                    Booked {formatDate(booking.createdAt)}
                  </small>
                  <small className="text-muted">
                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                  </small>
                </div>
                
                <h3>
                  <Link href={`/dashboard/stay-details?hotelId=${booking.hotelId}`}>
                    {booking.hotelName}
                  </Link>
                </h3>
                
                <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                  {booking.roomName}
                </p>

                <div className="d-flex align-items-center most-popular-single-location mb-2">
                  <i className="ri-calendar-check-line me-2"></i>
                  <span>{formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}</span>
                </div>

                <div className="d-flex align-items-center justify-content-between most-popular-single-price">
                  <p className="mb-0">
                    <span className="title">{formatCurrency(booking.total, booking.currency)}</span>
                  </p>
                  <p className="mb-0">
                    <i className="ri-group-line me-1"></i>
                    {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="col-xl-12 text-center">
          <Link href="/dashboard/bookings" className="default-btn active mt-2">
            View All Bookings
          </Link>
        </div>
      </div>
    </>
  );
};

export default Stays;
