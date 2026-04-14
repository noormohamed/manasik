"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthorSidebar from "./AuthorSidebar";

interface Booking {
  id: string;
  status: string;
  currency: string;
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus?: string;
  bookingSource?: string;
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  guestCount: number;
  customerId?: string;
  agentId?: string;
  agentName?: string;
  agentEmail?: string;
  createdAt: string;
  updatedAt: string;
}

interface Hotel {
  id: string;
  name: string;
}

const DashboardBookingsContent: React.FC = () => {
  const { user } = useAuth();
  const currentRoute = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterHotel, setFilterHotel] = useState<string>('');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [searchGuest, setSearchGuest] = useState<string>('');
  const [calendarView, setCalendarView] = useState<'day' | 'month'>('day');
  const [calendarStartDate, setCalendarStartDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  // Fetch bookings when filters change
  useEffect(() => {
    fetchBookings();
  }, [filterStatus, filterHotel, filterDate, searchGuest]);

  // Extract unique hotels from bookings for the filter dropdown
  const getUniqueHotels = (): Hotel[] => {
    const hotelMap = new Map<string, Hotel>();
    bookings.forEach(booking => {
      if (booking.hotelId && !hotelMap.has(booking.hotelId)) {
        hotelMap.set(booking.hotelId, {
          id: booking.hotelId,
          name: booking.hotelName || 'Unknown Hotel',
        });
      }
    });
    return Array.from(hotelMap.values());
  };

  const hotels = getUniqueHotels();

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = { limit: 100 };
      if (filterStatus) {
        params.status = filterStatus;
      }

      // Use user bookings endpoint for customer's own bookings
      const response = (await apiClient.get('/users/me/bookings', { params })) as { bookings?: Booking[] };
      let fetchedBookings = response.bookings || [];
      
      // Map the response to match our Booking interface
      fetchedBookings = fetchedBookings.map((b: any) => ({
        id: b.id,
        status: b.status,
        currency: b.currency,
        subtotal: b.subtotal,
        tax: b.tax,
        total: b.total,
        paymentStatus: b.paymentStatus,
        bookingSource: b.bookingSource || 'DIRECT',
        hotelId: b.metadata?.hotelId || b.hotelId || '',
        hotelName: b.hotelName || b.metadata?.hotelName || 'Unknown Hotel',
        roomTypeId: b.metadata?.roomTypeId || b.roomTypeId || '',
        roomName: b.roomType || b.metadata?.roomType || 'Room',
        checkIn: b.checkInDate || b.metadata?.checkInDate || '',
        checkOut: b.checkOutDate || b.metadata?.checkOutDate || '',
        nights: b.nights || b.metadata?.nights || 1,
        guestName: b.metadata?.guestName || '',
        guestEmail: b.metadata?.guestEmail || '',
        guestPhone: b.metadata?.guestPhone || '',
        guestCount: b.guests || b.metadata?.guests || 1,
        customerId: b.customerId,
        agentId: b.agentId,
        agentName: b.agentName,
        agentEmail: b.agentEmail,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));
      
      // Filter by status on client side if needed
      if (filterStatus) {
        fetchedBookings = fetchedBookings.filter((b: Booking) => b.status === filterStatus);
      }
      
      // Filter by hotel on client side
      if (filterHotel) {
        fetchedBookings = fetchedBookings.filter((b: Booking) => b.hotelId === filterHotel);
      }
      
      // Filter by date on client side
      if (filterDate) {
        const filterDateStr = filterDate.toISOString().split('T')[0];
        fetchedBookings = fetchedBookings.filter((b: Booking) => {
          const checkIn = new Date(b.checkIn);
          const checkOut = new Date(b.checkOut);
          const selectedDate = new Date(filterDateStr);
          return selectedDate >= checkIn && selectedDate < checkOut;
        });
      }
      
      // Filter by guest name or email on client side
      if (searchGuest) {
        const searchLower = searchGuest.toLowerCase();
        fetchedBookings = fetchedBookings.filter((b: Booking) => 
          b.guestName.toLowerCase().includes(searchLower) || 
          b.guestEmail.toLowerCase().includes(searchLower)
        );
      }
      
      setBookings(fetchedBookings);
    } catch (err: any) {
      console.error('Error fetching bookings:', err);
      setError(err.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar dates
  const generateCalendarDates = () => {
    const dates = [];
    const start = new Date(calendarStartDate);
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const currentDate = new Date(dateStr);
      
      return currentDate >= checkIn && currentDate < checkOut;
    });
  };

  // Calculate current month revenue based on calendar view
  const getCurrentMonthRevenue = () => {
    const startDate = new Date(calendarStartDate);
    const endDate = new Date(calendarStartDate);
    endDate.setDate(endDate.getDate() + 30);
    
    return bookings
      .filter(booking => {
        const checkIn = new Date(booking.checkIn);
        return checkIn >= startDate && checkIn < endDate;
      })
      .reduce((sum, b) => sum + b.total, 0);
  };

  // Calculate average monthly revenue from all bookings
  const getAverageMonthlyRevenue = () => {
    if (bookings.length === 0) return 0;
    
    // Group bookings by month
    const monthlyRevenue: { [key: string]: number } = {};
    
    bookings.forEach(booking => {
      const checkInDate = new Date(booking.checkIn);
      const monthKey = `${checkInDate.getFullYear()}-${String(checkInDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0;
      }
      monthlyRevenue[monthKey] += booking.total;
    });
    
    const months = Object.keys(monthlyRevenue);
    if (months.length === 0) return 0;
    
    const totalRevenue = Object.values(monthlyRevenue).reduce((sum, rev) => sum + rev, 0);
    return totalRevenue / months.length;
  };

  // Navigate calendar
  const moveCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(calendarStartDate);
    const daysToMove = calendarView === 'day' ? 7 : 30;
    
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - daysToMove);
    } else {
      newDate.setDate(newDate.getDate() + daysToMove);
    }
    
    setCalendarStartDate(newDate);
  };

  const resetCalendar = () => {
    setCalendarStartDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    // Toggle date filter - if same date clicked, clear filter
    if (filterDate && filterDate.toDateString() === date.toDateString()) {
      setFilterDate(null);
    } else {
      setFilterDate(date);
    }
  };

  const clearAllFilters = () => {
    setFilterStatus('');
    setFilterHotel('');
    setFilterDate(null);
    setSearchGuest('');
  };

  const handleStatusClick = (status: string) => {
    // Toggle status filter - if same status clicked, clear filter
    if (filterStatus === status) {
      setFilterStatus('');
    } else {
      setFilterStatus(status);
    }
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
      case 'REFUNDED':
        return 'bg-secondary';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return '#28a745';
      case 'PENDING':
        return '#ffc107';
      case 'CANCELLED':
        return '#dc3545';
      case 'COMPLETED':
        return '#17a2b8';
      case 'REFUNDED':
        return '#6c757d';
      default:
        return '#6c757d';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  const getBookingSourceBadge = (source: string) => {
    switch (source) {
      case 'AGENT':
        return { class: 'bg-purple', label: 'Agent Booking', icon: 'ri-user-star-line' };
      case 'API':
        return { class: 'bg-info', label: 'API Booking', icon: 'ri-code-line' };
      case 'ADMIN':
        return { class: 'bg-dark', label: 'Admin Booking', icon: 'ri-admin-line' };
      default:
        return { class: 'bg-primary', label: 'Direct Booking', icon: 'ri-user-line' };
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return { class: 'bg-success', label: 'Paid' };
      case 'PENDING':
        return { class: 'bg-warning', label: 'Pending' };
      case 'REFUNDED':
        return { class: 'bg-info', label: 'Refunded' };
      case 'FAILED':
        return { class: 'bg-danger', label: 'Failed' };
      default:
        return { class: 'bg-secondary', label: status || 'Unknown' };
    }
  };

  return (
    <>
      <div className="container pt-5 pb-5">
        <div className="row">
          <div className="col-xl-8 col-xxl-9">
            <ul className="nav nav-tabs most-popular-tab">
              <li className="nav-item" role="presentation">
                <button>
                  <Link
                    href="/dashboard/bookings"
                    className={`dropdown-item ${
                      currentRoute === "/dashboard/bookings" ? "active" : ""
                    }`}
                  >Your Bookings</Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link
                    href="/dashboard/listings"
                    className={`dropdown-item ${
                      currentRoute === "/dashboard/listings" || currentRoute === "/dashboard/listings/bookings" ? "active" : ""
                    }`}
                  >Your Listings</Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link
                    href="/account/"
                    className={`dropdown-item ${
                      currentRoute === "/account/" ? "active" : ""
                    }`}
                  >Account</Link>
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button>
                  <Link
                    href="/payments/"
                    className={`dropdown-item ${
                      currentRoute === "/payments/" ? "active" : ""
                    }`}
                  >Payments</Link>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="author-area">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 col-xxl-9">
              <div className="author-content-wrap">
                <div className="box-title">
                  <h2>{userName}&apos;s {currentRoute === "/dashboard/listings/bookings" ? "Listing Bookings" : "Bookings"}</h2>
                  <p>
                    {currentRoute === "/dashboard/listings/bookings" 
                      ? "View and manage all bookings for your hotels."
                      : "View and manage your bookings."}
                  </p>
                  
                  {/* Filter Controls */}
                  <div className="d-flex gap-2 mt-3 mb-4 flex-wrap">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by guest name or email..."
                      style={{ maxWidth: '250px' }}
                      value={searchGuest}
                      onChange={(e) => setSearchGuest(e.target.value)}
                    />
                    <select 
                      className="form-select" 
                      style={{ maxWidth: '200px' }}
                      value={filterHotel}
                      onChange={(e) => setFilterHotel(e.target.value)}
                    >
                      <option value="">All Hotels</option>
                      {hotels.map(hotel => (
                        <option key={hotel.id} value={hotel.id}>{hotel.name}</option>
                      ))}
                    </select>
                    <select 
                      className="form-select" 
                      style={{ maxWidth: '200px' }}
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="REFUNDED">Refunded</option>
                    </select>
                    {(filterStatus || filterHotel || filterDate || searchGuest) && (
                      <button 
                        className="btn btn-outline-danger"
                        onClick={clearAllFilters}
                      >
                        <i className="ri-close-line me-2"></i>
                        Clear Filters
                      </button>
                    )}
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={fetchBookings}
                    >
                      <i className="ri-refresh-line me-2"></i>
                      Refresh
                    </button>
                  </div>

                  {/* Active Filters Display */}
                  {(filterDate || searchGuest) && (
                    <div className="mb-3">
                      {filterDate && (
                        <span className="badge bg-info me-2">
                          Date: {filterDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <i 
                            className="ri-close-line ms-1" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => setFilterDate(null)}
                          ></i>
                        </span>
                      )}
                      {searchGuest && (
                        <span className="badge bg-info me-2">
                          Guest: {searchGuest}
                          <i 
                            className="ri-close-line ms-1" 
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSearchGuest('')}
                          ></i>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Calendar View Toggle */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn btn-sm ${calendarView === 'day' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCalendarView('day')}
                      >
                        Day View
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${calendarView === 'month' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setCalendarView('month')}
                      >
                        Month View
                      </button>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => moveCalendar('prev')}>
                        <i className="ri-arrow-left-line"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={resetCalendar}>
                        Today
                      </button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => moveCalendar('next')}>
                        <i className="ri-arrow-right-line"></i>
                      </button>
                    </div>
                  </div>

                  {/* Horizontal Calendar */}
                  <div className="mb-4" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
                    <div className="d-flex gap-2" style={{ minWidth: 'max-content' }}>
                      {calendarDates.map((date, index) => {
                        const bookingsOnDate = getBookingsForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        const isSelected = filterDate && filterDate.toDateString() === date.toDateString();
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const dayNum = date.getDate();
                        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                        
                        return (
                          <div
                            key={index}
                            className="card text-center"
                            onClick={() => handleDateClick(date)}
                            style={{
                              minWidth: calendarView === 'day' ? '80px' : '60px',
                              backgroundColor: isSelected ? '#fff3cd' : (isToday ? '#e3f2fd' : 'white'),
                              border: isSelected ? '2px solid #ffc107' : (isToday ? '2px solid #2196f3' : '1px solid #dee2e6'),
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected && !isToday) {
                                e.currentTarget.style.backgroundColor = '#f8f9fa';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected && !isToday) {
                                e.currentTarget.style.backgroundColor = 'white';
                              }
                            }}
                          >
                            <div className="card-body p-2">
                              {calendarView === 'day' ? (
                                <>
                                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{dayName}</div>
                                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{dayNum}</div>
                                  <div style={{ fontSize: '0.7rem', color: '#666' }}>{monthName}</div>
                                </>
                              ) : (
                                <>
                                  <div style={{ fontSize: '0.7rem', color: '#666' }}>{monthName}</div>
                                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{dayNum}</div>
                                </>
                              )}
                              {bookingsOnDate.length > 0 && (
                                <div 
                                  className="badge bg-primary mt-1" 
                                  style={{ fontSize: '0.65rem' }}
                                >
                                  {bookingsOnDate.length}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading bookings...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="ri-error-warning-line me-2"></i>
                    {error}
                  </div>
                )}

                {/* Bookings List */}
                {!loading && !error && bookings.length === 0 && (
                  <div className="alert alert-info" role="alert">
                    <i className="ri-information-line me-2"></i>
                    No bookings found for your hotels.
                  </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                  <>
                    {/* Summary Stats */}
                    <div className="row mb-4">
                      <div className="col-md-3">
                        <div className="card text-center">
                          <div className="card-body">
                            <h3 className="mb-0">{bookings.length}</h3>
                            <small className="text-muted">Total Bookings</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div 
                          className="card text-center"
                          onClick={() => handleStatusClick('CONFIRMED')}
                          style={{ 
                            cursor: 'pointer',
                            border: filterStatus === 'CONFIRMED' ? '2px solid #28a745' : '1px solid #dee2e6',
                            backgroundColor: filterStatus === 'CONFIRMED' ? '#d4edda' : 'white',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (filterStatus !== 'CONFIRMED') {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (filterStatus !== 'CONFIRMED') {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div className="card-body">
                            <h3 className="mb-0 text-success">
                              {bookings.filter(b => b.status === 'CONFIRMED').length}
                            </h3>
                            <small className="text-muted">Confirmed</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div 
                          className="card text-center"
                          onClick={() => handleStatusClick('PENDING')}
                          style={{ 
                            cursor: 'pointer',
                            border: filterStatus === 'PENDING' ? '2px solid #ffc107' : '1px solid #dee2e6',
                            backgroundColor: filterStatus === 'PENDING' ? '#fff3cd' : 'white',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (filterStatus !== 'PENDING') {
                              e.currentTarget.style.backgroundColor = '#f8f9fa';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (filterStatus !== 'PENDING') {
                              e.currentTarget.style.backgroundColor = 'white';
                            }
                          }}
                        >
                          <div className="card-body">
                            <h3 className="mb-0 text-warning">
                              {bookings.filter(b => b.status === 'PENDING').length}
                            </h3>
                            <small className="text-muted">Pending</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="card text-center">
                          <div className="card-body">
                            <h3 className="mb-0 text-primary">
                              {formatCurrency(
                                getCurrentMonthRevenue(),
                                bookings[0]?.currency || 'USD'
                              )}
                            </h3>
                            <small className="text-muted d-block">Current Month</small>
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                              Avg: {formatCurrency(
                                getAverageMonthlyRevenue(),
                                bookings[0]?.currency || 'USD'
                              )}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bookings Table */}
                    <div className="list-group">
                      {bookings.map((booking) => (
                        <div 
                          key={booking.id} 
                          className="list-group-item mb-3 p-0 rounded"
                          style={{
                            border: '1px solid #dee2e6',
                            borderLeftWidth: '6px',
                            borderLeftColor: getStatusBorderColor(booking.status),
                          }}
                        >
                          <div className="p-3">
                            {/* Top row: Booked on date (left) and Status badge (right) */}
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                                Booked on {formatDate(booking.createdAt)}
                              </small>
                              <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>

                            {/* Hotel and Room name */}
                            <div className="mb-2">
                              <h5 className="mb-1">{booking.hotelName}</h5>
                              <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                {booking.roomName}
                              </p>
                            </div>

                            {/* Single row with guest info, dates, and price */}
                            <div className="d-flex justify-content-between align-items-end mb-3">
                              <div className="d-flex gap-4">
                                {/* Guest info */}
                                <div>
                                  <small className="text-muted d-block">
                                    <i className="ri-user-line me-1"></i>
                                    {booking.guestName}
                                  </small>
                                  <small className="text-muted d-block">
                                    <i className="ri-mail-line me-1"></i>
                                    {booking.guestEmail}
                                  </small>
                                  <small className="text-muted d-block">
                                    <i className="ri-group-line me-1"></i>
                                    {booking.guestCount} {booking.guestCount === 1 ? 'guest' : 'guests'}
                                  </small>
                                </div>
                                
                                {/* Date info */}
                                <div>
                                  <small className="text-muted d-block">
                                    <i className="ri-calendar-check-line me-1"></i>
                                    {formatDate(booking.checkIn)}
                                  </small>
                                  <small className="text-muted d-block">
                                    <i className="ri-calendar-line me-1"></i>
                                    {formatDate(booking.checkOut)}
                                  </small>
                                  <small className="text-muted d-block">
                                    <i className="ri-moon-line me-1"></i>
                                    {booking.nights} {booking.nights === 1 ? 'night' : 'nights'}
                                  </small>
                                </div>
                              </div>

                              {/* Price section */}
                              <div className="text-end">
                                <h5 className="mb-0 text-primary">
                                  {formatCurrency(booking.total, booking.currency)}
                                </h5>
                                <small className="text-muted d-block mb-2">
                                  (Subtotal: {formatCurrency(booking.subtotal, booking.currency)} + 
                                  Tax: {formatCurrency(booking.tax, booking.currency)})
                                </small>
                                {/* Visual scale for nights */}
                                <div className="d-flex align-items-center justify-content-end gap-1">
                                  {Array.from({ length: booking.nights }, (_, i) => (
                                    <div
                                      key={i}
                                      style={{
                                        width: '8px',
                                        height: '8px',
                                        borderRadius: '50%',
                                        backgroundColor: '#6c757d',
                                      }}
                                    ></div>
                                  ))}
                                  <small className="text-muted ms-1" style={{ fontSize: '0.7rem' }}>
                                    {booking.nights}n
                                  </small>
                                </div>
                              </div>
                            </div>

                            {/* Action buttons */}
                            <div className="d-flex gap-2">
                              <Link
                                href={`/dashboard/listings/${booking.hotelId}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="ri-hotel-line me-1"></i>
                                View Hotel
                              </Link>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => handleViewDetails(booking)}
                              >
                                <i className="ri-file-text-line me-1"></i>
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-xl-4 col-xxl-3">
              <AuthorSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseModal}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="ri-file-text-line me-2"></i>
                  Booking Details
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                {/* Booking ID and Status */}
                <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                  <div>
                    <small className="text-muted">Booking ID</small>
                    <h6 className="mb-0 font-monospace">{selectedBooking.id}</h6>
                  </div>
                  <div className="d-flex gap-2">
                    <span className={`badge ${getStatusBadgeClass(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                    <span className={`badge ${getPaymentStatusBadge(selectedBooking.paymentStatus || '').class}`}>
                      {getPaymentStatusBadge(selectedBooking.paymentStatus || '').label}
                    </span>
                  </div>
                </div>

                {/* Booking Source */}
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: selectedBooking.bookingSource === 'AGENT' ? '#f3e5f5' : '#e3f2fd' }}>
                  <div className="d-flex align-items-center gap-2">
                    <i className={`${getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').icon} fs-4`}></i>
                    <div>
                      <span className={`badge ${getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').class}`}>
                        {getBookingSourceBadge(selectedBooking.bookingSource || 'DIRECT').label}
                      </span>
                      {selectedBooking.bookingSource === 'AGENT' && selectedBooking.agentName && (
                        <div className="mt-1">
                          <small className="text-muted">Agent: </small>
                          <strong>{selectedBooking.agentName}</strong>
                          {selectedBooking.agentEmail && (
                            <small className="text-muted d-block">{selectedBooking.agentEmail}</small>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  {/* Guest Information */}
                  <div className="col-md-6 mb-4">
                    <h6 className="text-muted mb-3">
                      <i className="ri-user-line me-2"></i>
                      Guest Information
                    </h6>
                    <div className="card">
                      <div className="card-body">
                        <p className="mb-2">
                          <strong>{selectedBooking.guestName || 'N/A'}</strong>
                        </p>
                        {selectedBooking.guestEmail && (
                          <p className="mb-2 text-muted">
                            <i className="ri-mail-line me-2"></i>
                            {selectedBooking.guestEmail}
                          </p>
                        )}
                        {selectedBooking.guestPhone && (
                          <p className="mb-2 text-muted">
                            <i className="ri-phone-line me-2"></i>
                            {selectedBooking.guestPhone}
                          </p>
                        )}
                        <p className="mb-0 text-muted">
                          <i className="ri-group-line me-2"></i>
                          {selectedBooking.guestCount} {selectedBooking.guestCount === 1 ? 'guest' : 'guests'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stay Details */}
                  <div className="col-md-6 mb-4">
                    <h6 className="text-muted mb-3">
                      <i className="ri-calendar-line me-2"></i>
                      Stay Details
                    </h6>
                    <div className="card">
                      <div className="card-body">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Check-in</span>
                          <strong>{formatDate(selectedBooking.checkIn)}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-muted">Check-out</span>
                          <strong>{formatDate(selectedBooking.checkOut)}</strong>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-muted">Duration</span>
                          <strong>{selectedBooking.nights} {selectedBooking.nights === 1 ? 'night' : 'nights'}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accommodation */}
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <i className="ri-hotel-line me-2"></i>
                    Accommodation
                  </h6>
                  <div className="card">
                    <div className="card-body">
                      <h6 className="mb-1">{selectedBooking.hotelName}</h6>
                      <p className="text-muted mb-0">{selectedBooking.roomName}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-4">
                  <h6 className="text-muted mb-3">
                    <i className="ri-money-dollar-circle-line me-2"></i>
                    Payment Summary
                  </h6>
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Subtotal</span>
                        <span>{formatCurrency(selectedBooking.subtotal, selectedBooking.currency)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Tax</span>
                        <span>{formatCurrency(selectedBooking.tax, selectedBooking.currency)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <strong>Total</strong>
                        <strong className="text-primary fs-5">
                          {formatCurrency(selectedBooking.total, selectedBooking.currency)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="text-muted small">
                  <p className="mb-1">
                    <i className="ri-time-line me-2"></i>
                    Booked on: {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                  {selectedBooking.updatedAt !== selectedBooking.createdAt && (
                    <p className="mb-0">
                      <i className="ri-refresh-line me-2"></i>
                      Last updated: {new Date(selectedBooking.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                >
                  Close
                </button>
                <Link
                  href={`/dashboard/listings/${selectedBooking.hotelId}`}
                  className="btn btn-primary"
                >
                  <i className="ri-hotel-line me-2"></i>
                  View Hotel
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for purple badge */}
      <style jsx>{`
        :global(.bg-purple) {
          background-color: #9c27b0 !important;
        }
      `}</style>
    </>
  );
};

export default DashboardBookingsContent;
