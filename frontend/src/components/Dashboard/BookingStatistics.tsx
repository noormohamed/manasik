'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface BookingStatisticsData {
  bookingsLast3Months: number;
  highestValuedBooking: {
    totalCost: number;
    currency: string;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  } | null;
  longestBooking: {
    durationDays: number;
    guestName: string;
    checkInDate: string;
    checkOutDate: string;
  } | null;
}

interface BookingStatisticsProps {
  hotelId: string;
}

const BookingStatistics: React.FC<BookingStatisticsProps> = ({ hotelId }) => {
  const [statistics, setStatistics] = useState<BookingStatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, [hotelId]);

  const fetchStatistics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<BookingStatisticsData>(
        `/hotels/${hotelId}/booking-statistics`
      );
      setStatistics(response);
    } catch (err: any) {
      console.error('Error fetching booking statistics:', err);
      setError(err.error || 'Failed to load booking statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border spinner-border-sm" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-warning" role="alert">
        <i className="ri-alert-line me-2"></i>
        {error}
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="alert alert-info" role="alert">
        <i className="ri-information-line me-2"></i>
        No booking data available
      </div>
    );
  }

  return (
    <div className="row g-3">
      {/* Bookings in Last 3 Months */}
      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body">
            <h6 className="card-title text-muted mb-3">
              <i className="ri-calendar-line me-2"></i>
              Bookings (Last 3 Months)
            </h6>
            <div className="display-6 fw-bold text-primary">
              {statistics.bookingsLast3Months}
            </div>
            <small className="text-muted">confirmed or completed</small>
          </div>
        </div>
      </div>

      {/* Highest Valued Booking */}
      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body">
            <h6 className="card-title text-muted mb-3">
              <i className="ri-money-dollar-circle-line me-2"></i>
              Highest Valued Booking
            </h6>
            {statistics.highestValuedBooking ? (
              <>
                <div className="display-6 fw-bold text-success">
                  {statistics.highestValuedBooking.currency}{' '}
                  {statistics.highestValuedBooking.totalCost.toFixed(2)}
                </div>
                <small className="text-muted d-block mt-2">
                  {statistics.highestValuedBooking.guestName}
                </small>
                <small className="text-muted d-block">
                  {new Date(statistics.highestValuedBooking.checkInDate).toLocaleDateString()} -{' '}
                  {new Date(statistics.highestValuedBooking.checkOutDate).toLocaleDateString()}
                </small>
              </>
            ) : (
              <div className="text-muted">No bookings yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Longest Booking */}
      <div className="col-md-4">
        <div className="card h-100">
          <div className="card-body">
            <h6 className="card-title text-muted mb-3">
              <i className="ri-time-line me-2"></i>
              Longest Booking
            </h6>
            {statistics.longestBooking ? (
              <>
                <div className="display-6 fw-bold text-info">
                  {statistics.longestBooking.durationDays} days
                </div>
                <small className="text-muted d-block mt-2">
                  {statistics.longestBooking.guestName}
                </small>
                <small className="text-muted d-block">
                  {new Date(statistics.longestBooking.checkInDate).toLocaleDateString()} -{' '}
                  {new Date(statistics.longestBooking.checkOutDate).toLocaleDateString()}
                </small>
              </>
            ) : (
              <div className="text-muted">No bookings yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingStatistics;
