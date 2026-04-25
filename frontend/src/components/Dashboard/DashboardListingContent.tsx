"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useHotel } from "@/features/hotel/useHotel";
import { apiClient } from "@/lib/api";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthorSidebar from "./AuthorSidebar";

const DashboardListingContent: React.FC = () => {
  const { user } = useAuth();
  const { hotels, loading, error, fetchListings } = useHotel();
  const currentRoute = usePathname();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    latitude: '',
    longitude: '',
    starRating: 3,
    totalRooms: 0,
    checkInTime: '14:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
  });

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  // Fetch listings on component mount
  useEffect(() => {
    fetchListings(true); // true = include rooms
  }, []);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'starRating' || name === 'totalRooms' ? parseInt(value) || 0 : value
    }));
  };

  // Preset coordinates for common cities (Makkah focus)
  const cityPresets: Record<string, { lat: string; lng: string }> = {
    'Makkah': { lat: '21.4225', lng: '39.8262' },
    'Mecca': { lat: '21.4225', lng: '39.8262' },
    'Medina': { lat: '24.5247', lng: '39.5692' },
    'Madinah': { lat: '24.5247', lng: '39.5692' },
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;
    setFormData(prev => ({ ...prev, city }));
    
    // Auto-fill coordinates if city matches a preset
    const preset = cityPresets[city];
    if (preset && !formData.latitude && !formData.longitude) {
      setFormData(prev => ({
        ...prev,
        city,
        latitude: preset.lat,
        longitude: preset.lng,
      }));
    }
  };

  const handleAddHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      await apiClient.post('/hotels', formData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        latitude: '',
        longitude: '',
        starRating: 3,
        totalRooms: 0,
        checkInTime: '14:00',
        checkOutTime: '11:00',
        cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
      });
      
      // Close modal
      setShowAddModal(false);
      
      // Refresh listings
      await fetchListings(true);
    } catch (err: any) {
      console.error('Error creating hotel:', err);
      setSaveError(err.error || 'Failed to create hotel');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="author-area" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '100%', maxWidth: '1640px', padding: '0 24px' }}>
          <div className="row">
            <div className="col-xl-8 col-xxl-9">
              <div className="author-content-wrap">
                <div className="box-title">
                  <h2>{userName}&apos;s Hotel Listings</h2>
                  <p>
                    You can use this page to manage your hotel listings.
                  </p>
                  <div className="d-flex gap-2 mt-3">
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddModal(true)}
                    >
                      <i className="ri-add-line me-2"></i>
                      Add New Hotel
                    </button>
                    <Link 
                      href="/dashboard/listings/bookings"
                      className="btn btn-info text-white"
                    >
                      <i className="ri-calendar-check-line me-2"></i>
                      Bookings
                    </Link>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => fetchListings(true)}
                    >
                      <i className="ri-refresh-line me-2"></i>
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Loading State */}
                {loading && (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Loading your listings...</p>
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="ri-error-warning-line me-2"></i>
                    {error}
                  </div>
                )}

                {/* Hotels List */}
                {!loading && !error && hotels.length === 0 && (
                  <div className="alert alert-info" role="alert">
                    <i className="ri-information-line me-2"></i>
                    You don&apos;t have any hotel listings yet.
                  </div>
                )}

                {!loading && !error && hotels.length > 0 && (
                  <div className="list-group">
                    {hotels.map((hotel) => (
                      <div 
                        key={hotel.id} 
                        className="list-group-item list-group-item-action mb-3 p-0 rounded"
                        style={{
                          borderLeft: hotel.status === 'ACTIVE' ? '6px solid #28a745' : '6px solid #ffc107',
                          border: '1px solid #dee2e6',
                          borderLeftWidth: '6px',
                          borderLeftColor: hotel.status === 'ACTIVE' ? '#28a745' : '#ffc107'
                        }}
                      >
                        <div className="p-3">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h5 className="mb-1">{hotel.name}</h5>
                              <p className="text-muted mb-2">
                                <i className="ri-map-pin-line me-1"></i>
                                {hotel.city}, {hotel.country}
                              </p>
                            </div>
                            <div className="text-end">
                              <span className="badge bg-primary">
                                {hotel.starRating} ⭐
                              </span>
                            </div>
                          </div>

                          <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                            {hotel.description?.substring(0, 150)}...
                          </p>

                          <div className="row mb-3">
                            <div className="col-md-6">
                              <small className="text-muted">
                                <i className="ri-door-line me-1"></i>
                                <strong>{hotel.totalRooms}</strong> Total Rooms
                              </small>
                            </div>
                            <div className="col-md-6">
                              <small className="text-muted">
                                <i className="ri-star-line me-1"></i>
                                <strong>{hotel.averageRating}</strong> ({hotel.totalReviews} reviews)
                              </small>
                            </div>
                          </div>

                          {/* Room Types */}
                          {hotel.rooms && hotel.rooms.length > 0 && (
                            <div className="mb-3">
                              <small className="text-muted d-block mb-2">
                                <strong>Room Types ({hotel.rooms.length}):</strong>
                              </small>
                              <div className="d-flex flex-wrap gap-2">
                                {hotel.rooms.slice(0, 4).map((room) => (
                                  <span key={room.id} className="badge bg-secondary" style={{ fontSize: '0.85rem' }}>
                                    {room.name} - ${room.basePrice}/{room.currency}
                                  </span>
                                ))}
                                {hotel.rooms.length > 4 && (
                                  <span className="badge bg-light text-dark" style={{ fontSize: '0.85rem' }}>
                                    +{hotel.rooms.length - 4} more
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="d-flex gap-2">
                            <Link
                              href={`/dashboard/listings/${hotel.id}`}
                              className="btn btn-sm btn-primary"
                            >
                              <i className="ri-edit-line me-1"></i>
                              Manage Hotel
                            </Link>
                            <Link
                              href={`/stay/${hotel.id}`}
                              className="btn btn-sm btn-outline-primary"
                              target="_blank"
                            >
                              <i className="ri-eye-line me-1"></i>
                              View Public Page
                            </Link>
                            <button className="btn btn-sm btn-outline-secondary">
                              <i className="ri-bar-chart-line me-1"></i>
                              Analytics
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="col-xl-4 col-xxl-3">
              <AuthorSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Add Hotel Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Hotel</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                ></button>
              </div>
              <form onSubmit={handleAddHotel}>
                <div className="modal-body">
                  {saveError && (
                    <div className="alert alert-danger" role="alert">
                      {saveError}
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="mb-4">
                    <h6 className="mb-3">Basic Information</h6>
                    <div className="row">
                      <div className="col-md-8 mb-3">
                        <label className="form-label">Hotel Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Star Rating *</label>
                        <select
                          className="form-select"
                          name="starRating"
                          value={formData.starRating}
                          onChange={handleInputChange}
                          required
                        >
                          <option value="1">1 Star</option>
                          <option value="2">2 Stars</option>
                          <option value="3">3 Stars</option>
                          <option value="4">4 Stars</option>
                          <option value="5">5 Stars</option>
                        </select>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          name="description"
                          rows={3}
                          value={formData.description}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="mb-4">
                    <h6 className="mb-3">Location</h6>
                    <div className="row">
                      <div className="col-12 mb-3">
                        <label className="form-label">Address *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">City *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="city"
                          value={formData.city}
                          onChange={handleCityChange}
                          required
                          placeholder="e.g., Makkah"
                        />
                        <small className="text-muted">Typing Makkah or Medina will auto-fill coordinates</small>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">State/Province</label>
                        <input
                          type="text"
                          className="form-control"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Country *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Zip/Postal Code</label>
                        <input
                          type="text"
                          className="form-control"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Coordinates - For Proximity Calculation */}
                  <div className="mb-4">
                    <h6 className="mb-3">
                      <i className="ri-map-pin-line me-2"></i>
                      GPS Coordinates
                      <small className="text-muted ms-2">(Required for Haram gate distances)</small>
                    </h6>
                    <div className="alert alert-info py-2" style={{ fontSize: '13px' }}>
                      <i className="ri-information-line me-2"></i>
                      Coordinates are used to calculate distances to Haram gates and nearby attractions. 
                      You can find coordinates from Google Maps by right-clicking on the hotel location.
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Latitude *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="latitude"
                          value={formData.latitude}
                          onChange={handleInputChange}
                          placeholder="e.g., 21.4225"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Longitude *</label>
                        <input
                          type="text"
                          className="form-control"
                          name="longitude"
                          value={formData.longitude}
                          onChange={handleInputChange}
                          placeholder="e.g., 39.8262"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hotel Details */}
                  <div className="mb-4">
                    <h6 className="mb-3">Hotel Details</h6>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Total Rooms</label>
                        <input
                          type="number"
                          className="form-control"
                          name="totalRooms"
                          value={formData.totalRooms}
                          onChange={handleInputChange}
                          min="0"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Check-in Time</label>
                        <input
                          type="time"
                          className="form-control"
                          name="checkInTime"
                          value={formData.checkInTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Check-out Time</label>
                        <input
                          type="time"
                          className="form-control"
                          name="checkOutTime"
                          value={formData.checkOutTime}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Cancellation Policy</label>
                        <textarea
                          className="form-control"
                          name="cancellationPolicy"
                          rows={2}
                          value={formData.cancellationPolicy}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAddModal(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="ri-save-line me-2"></i>
                        Create Hotel
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardListingContent;
