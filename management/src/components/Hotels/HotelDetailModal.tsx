'use client';

import { useState, useEffect } from 'react';
import { hotelsService, HotelDetail, HotelReviewsResponse, HotelTransactionsResponse } from '@/services/hotelsService';

interface HotelDetailModalProps {
  hotelId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
  initialTab?: 'overview' | 'rooms' | 'bookings' | 'reviews' | 'transactions' | 'amenities';
}

export default function HotelDetailModal({ 
  hotelId, 
  isOpen, 
  onClose, 
  onStatusChange,
  initialTab = 'overview'
}: HotelDetailModalProps) {
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [reviews, setReviews] = useState<HotelReviewsResponse | null>(null);
  const [transactions, setTransactions] = useState<HotelTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings' | 'reviews' | 'transactions' | 'amenities'>(initialTab);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && hotelId) {
      setActiveTab(initialTab);
      loadHotelDetail();
    }
  }, [isOpen, hotelId, initialTab]);

  useEffect(() => {
    if (activeTab === 'reviews' && hotelId && !reviews) {
      loadReviews();
    }
    if (activeTab === 'transactions' && hotelId && !transactions) {
      loadTransactions();
    }
  }, [activeTab, hotelId]);

  const loadHotelDetail = async () => {
    if (!hotelId) return;
    setLoading(true);
    setError('');
    setReviews(null);
    setTransactions(null);
    
    try {
      const response = await hotelsService.getHotelDetail(hotelId);
      if (response.success) {
        setHotel(response.data);
      } else {
        setError('Failed to load hotel details');
      }
    } catch (err) {
      setError('An error occurred while loading hotel details');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!hotelId) return;
    setReviewsLoading(true);
    try {
      const response = await hotelsService.getHotelReviews(hotelId, { limit: 20 });
      if (response.success) {
        setReviews(response.data);
      }
    } catch (err) {
      console.error('Load reviews error:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!hotelId) return;
    setTransactionsLoading(true);
    try {
      const response = await hotelsService.getHotelTransactions(hotelId, { limit: 20 });
      if (response.success) {
        setTransactions(response.data);
      }
    } catch (err) {
      console.error('Load transactions error:', err);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!hotelId) return;
    setStatusUpdating(true);
    try {
      const response = await hotelsService.updateHotelStatus(hotelId, newStatus);
      if (response.success) {
        setHotel(response.data);
        onStatusChange?.();
      }
    } catch (err) {
      console.error('Update status error:', err);
    } finally {
      setStatusUpdating(false);
    }
  };

  if (!isOpen) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': case 'COMPLETED': case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE': case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED': case 'CANCELLED': case 'FAILED': case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number, size = 5) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg key={i} className={`w-${size} h-${size} ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const tabs = ['overview', 'rooms', 'bookings', 'reviews', 'transactions', 'amenities'] as const;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button onClick={loadHotelDetail} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retry</button>
              </div>
            </div>
          ) : hotel ? (
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="relative h-48 bg-gray-200">
                {hotel.images?.[0] ? (
                  <img src={hotel.images[0].url} alt={hotel.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 mb-1">
                    {renderStars(hotel.starRating)}
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(hotel.status)}`}>{hotel.status}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{hotel.name}</h2>
                  <p className="text-gray-200 text-sm">{hotel.city}, {hotel.country}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 overflow-x-auto">
                <nav className="flex -mb-px px-4">
                  {tabs.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-600">Total Rooms</p>
                        <p className="text-2xl font-bold text-blue-900">{hotel.totalRooms}</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <p className="text-sm text-green-600">Total Bookings</p>
                        <p className="text-2xl font-bold text-green-900">{hotel.bookingStats?.totalBookings || 0}</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <p className="text-sm text-purple-600">Total Revenue</p>
                        <p className="text-2xl font-bold text-purple-900">${(hotel.bookingStats?.totalRevenue || 0).toFixed(2)}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <p className="text-sm text-yellow-600">Avg Rating</p>
                        <p className="text-2xl font-bold text-yellow-900">{hotel.averageRating?.toFixed(1) || 'N/A'}</p>
                        <p className="text-xs text-yellow-600">({hotel.totalReviews} reviews)</p>
                      </div>
                    </div>
                    <div><h3 className="text-lg font-semibold mb-2">Description</h3><p className="text-gray-600">{hotel.description || 'No description'}</p></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Location</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-500">Address:</span> {hotel.address}</p>
                          <p><span className="text-gray-500">City:</span> {hotel.city}</p>
                          <p><span className="text-gray-500">Country:</span> {hotel.country}</p>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Policies</h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-gray-500">Check-in:</span> {hotel.checkInTime}</p>
                          <p><span className="text-gray-500">Check-out:</span> {hotel.checkOutTime}</p>
                          <p><span className="text-gray-500">Cancellation:</span> {hotel.cancellationPolicy}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Actions</h3>
                      <div className="flex gap-2">
                        {hotel.status !== 'ACTIVE' && <button onClick={() => handleStatusChange('ACTIVE')} disabled={statusUpdating} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">Activate</button>}
                        {hotel.status !== 'SUSPENDED' && <button onClick={() => handleStatusChange('SUSPENDED')} disabled={statusUpdating} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Suspend</button>}
                        {hotel.status !== 'INACTIVE' && <button onClick={() => handleStatusChange('INACTIVE')} disabled={statusUpdating} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50">Deactivate</button>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'rooms' && (
                  <div className="space-y-4">
                    {hotel.rooms?.length > 0 ? hotel.rooms.map((room) => (
                      <div key={room.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div><h4 className="font-semibold">{room.name}</h4><p className="text-gray-600 text-sm">{room.description}</p></div>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(room.status)}`}>{room.status}</span>
                        </div>
                        <div className="mt-3 grid grid-cols-4 gap-4 text-sm">
                          <div><p className="text-gray-500">Capacity</p><p className="font-medium">{room.capacity} guests</p></div>
                          <div><p className="text-gray-500">Total</p><p className="font-medium">{room.totalRooms}</p></div>
                          <div><p className="text-gray-500">Available</p><p className="font-medium">{room.availableRooms}</p></div>
                          <div><p className="text-gray-500">Price</p><p className="font-medium">${room.basePrice}/night</p></div>
                        </div>
                      </div>
                    )) : <p className="text-gray-500 text-center py-8">No rooms configured</p>}
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-600">Confirmed</p><p className="text-xl font-bold text-green-600">{hotel.bookingStats?.confirmedBookings || 0}</p></div>
                      <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-600">Pending</p><p className="text-xl font-bold text-yellow-600">{hotel.bookingStats?.pendingBookings || 0}</p></div>
                      <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-600">Cancelled</p><p className="text-xl font-bold text-red-600">{hotel.bookingStats?.cancelledBookings || 0}</p></div>
                      <div className="bg-gray-50 rounded-lg p-4"><p className="text-sm text-gray-600">Avg Value</p><p className="text-xl font-bold text-indigo-600">${(hotel.bookingStats?.averageBookingValue || 0).toFixed(2)}</p></div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Recent Bookings</h3>
                      {hotel.recentBookings?.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {hotel.recentBookings.map((b) => (
                              <tr key={b.id}>
                                <td className="px-4 py-3 text-sm">{b.guestName || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm">{b.checkIn || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm">{b.checkOut || 'N/A'}</td>
                                <td className="px-4 py-3 text-sm">${b.total?.toFixed(2)}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(b.status)}`}>{b.status}</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : <p className="text-gray-500 text-center py-8">No bookings yet</p>}
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {reviewsLoading ? (
                      <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : reviews ? (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-yellow-50 rounded-lg p-4">
                            <p className="text-sm text-yellow-600">Average Rating</p>
                            <p className="text-2xl font-bold text-yellow-900">{reviews.averageRating?.toFixed(1) || 'N/A'}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600">Total Reviews</p>
                            <p className="text-2xl font-bold text-blue-900">{reviews.total}</p>
                          </div>
                          {reviews.ratingDistribution?.slice(0, 2).map((d) => (
                            <div key={d.rating} className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-600">{d.rating} Stars</p>
                              <p className="text-2xl font-bold text-gray-900">{d.count}</p>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Reviews</h3>
                          {reviews.reviews?.length > 0 ? (
                            <div className="space-y-4">
                              {reviews.reviews.map((r) => (
                                <div key={r.id} className="border rounded-lg p-4">
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <p className="font-medium">{r.reviewerName}</p>
                                      <p className="text-sm text-gray-500">{r.reviewerEmail}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div className="flex">{renderStars(r.rating, 4)}</div>
                                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(r.status)}`}>{r.status}</span>
                                    </div>
                                  </div>
                                  <p className="text-gray-700">{r.comment || 'No comment'}</p>
                                  <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                                </div>
                              ))}
                            </div>
                          ) : <p className="text-gray-500 text-center py-8">No reviews yet</p>}
                        </div>
                      </>
                    ) : <p className="text-gray-500 text-center py-8">Failed to load reviews</p>}
                  </div>
                )}

                {activeTab === 'transactions' && (
                  <div className="space-y-6">
                    {transactionsLoading ? (
                      <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                    ) : transactions ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <p className="text-sm text-green-600">Total Amount</p>
                            <p className="text-2xl font-bold text-green-900">${transactions.totalAmount?.toFixed(2) || '0.00'}</p>
                          </div>
                          <div className="bg-blue-50 rounded-lg p-4">
                            <p className="text-sm text-blue-600">Total Transactions</p>
                            <p className="text-2xl font-bold text-blue-900">{transactions.total}</p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-3">Transactions</h3>
                          {transactions.transactions?.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guest</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {transactions.transactions.map((t) => (
                                  <tr key={t.id}>
                                    <td className="px-4 py-3 text-sm font-mono">{t.id.slice(0, 8)}...</td>
                                    <td className="px-4 py-3 text-sm">{t.guestName}</td>
                                    <td className="px-4 py-3 text-sm">{t.type}</td>
                                    <td className="px-4 py-3 text-sm font-medium">${t.amount?.toFixed(2)} {t.currency}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(t.status)}`}>{t.status}</span></td>
                                    <td className="px-4 py-3 text-sm">{new Date(t.createdAt).toLocaleDateString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : <p className="text-gray-500 text-center py-8">No transactions yet</p>}
                        </div>
                      </>
                    ) : <p className="text-gray-500 text-center py-8">Failed to load transactions</p>}
                  </div>
                )}

                {activeTab === 'amenities' && (
                  <div>
                    {hotel.amenities?.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {hotel.amenities.map((a, i) => (
                          <div key={i} className={`flex items-center gap-2 p-3 rounded-lg ${a.available ? 'bg-green-50' : 'bg-gray-50'}`}>
                            {a.available ? (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            )}
                            <span className={a.available ? 'text-green-800' : 'text-gray-500'}>{a.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-gray-500 text-center py-8">No amenities listed</p>}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
