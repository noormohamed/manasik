'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';
import AuthorSidebar from './AuthorSidebar';
import HotelRulesEditor from './HotelRulesEditor';
import { CustomPolicy } from '@/types/hotel-policies';

interface Room {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  capacity: number;
  totalRooms: number;
  availableRooms: number;
  basePrice: number;
  currency: string;
  status: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface Hotel {
  id: string;
  companyId: string;
  companyName: string;
  adminRole: string;
  agentId: string;
  name: string;
  description: string;
  status: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  starRating: number;
  totalRooms: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string | null;
  customPolicies: CustomPolicy[];
  averageRating: number;
  totalReviews: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardHotelDetailsContentProps {
  hotelId: string;
}

const DashboardHotelDetailsContent: React.FC<DashboardHotelDetailsContentProps> = ({ hotelId }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'bookings'>('overview');
  
  // Edit room modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Add room modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<Room>>({
    name: '',
    description: '',
    capacity: 2,
    totalRooms: 1,
    availableRooms: 1,
    basePrice: 100,
    currency: 'USD',
    status: 'ACTIVE',
  });

  // Edit hotel modal state
  const [showEditHotelModal, setShowEditHotelModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editingRules, setEditingRules] = useState<CustomPolicy[]>([]);

  useEffect(() => {
    fetchHotelDetails();
  }, [hotelId]);

  const fetchHotelDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch hotel from user's listings
      const listingsResponse = await apiClient.get<{
        hotels: Hotel[];
      }>('/hotels/listings?includeRooms=false');

      const foundHotel = listingsResponse.hotels.find(h => h.id === hotelId);
      
      if (!foundHotel) {
        setError('Hotel not found or you do not have permission to manage it');
        return;
      }

      setHotel(foundHotel);

      // Fetch rooms
      const roomsResponse = await apiClient.get<{
        rooms: Room[];
      }>(`/hotels/${hotelId}/rooms`);
      
      setRooms(roomsResponse.rooms || []);
    } catch (err: any) {
      console.error('Error fetching hotel details:', err);
      setError(err.error || 'Failed to load hotel details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom({ ...room });
    setSaveError(null);
    setSaveSuccess(false);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingRoom(null);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSaveRoom = async () => {
    if (!editingRoom) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // TODO: Implement API endpoint for updating room
      // For now, we'll simulate the update
      await apiClient.put(`/hotels/${hotelId}/rooms/${editingRoom.id}`, {
        name: editingRoom.name,
        description: editingRoom.description,
        capacity: editingRoom.capacity,
        totalRooms: editingRoom.totalRooms,
        availableRooms: editingRoom.availableRooms,
        basePrice: editingRoom.basePrice,
        status: editingRoom.status,
      });

      // Update local state
      setRooms(rooms.map(r => r.id === editingRoom.id ? editingRoom : r));
      setSaveSuccess(true);
      
      // Close modal after short delay
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating room:', err);
      setSaveError(err.error || 'Failed to update room');
    } finally {
      setSaving(false);
    }
  };

  const handleRoomFieldChange = (field: keyof Room, value: any) => {
    if (!editingRoom) return;
    setEditingRoom({
      ...editingRoom,
      [field]: value,
    });
  };

  const handleOpenAddModal = () => {
    setNewRoom({
      name: '',
      description: '',
      capacity: 2,
      totalRooms: 1,
      availableRooms: 1,
      basePrice: 100,
      currency: 'USD',
      status: 'ACTIVE',
    });
    setSaveError(null);
    setSaveSuccess(false);
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewRoom({
      name: '',
      description: '',
      capacity: 2,
      totalRooms: 1,
      availableRooms: 1,
      basePrice: 100,
      currency: 'USD',
      status: 'ACTIVE',
    });
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleNewRoomFieldChange = (field: string, value: any) => {
    setNewRoom({
      ...newRoom,
      [field]: value,
    });
  };

  const handleAddRoom = async () => {
    if (!newRoom.name || !newRoom.description) {
      setSaveError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await apiClient.post<{ room: Room }>(`/hotels/${hotelId}/rooms`, {
        name: newRoom.name,
        description: newRoom.description,
        capacity: newRoom.capacity,
        totalRooms: newRoom.totalRooms,
        availableRooms: newRoom.availableRooms,
        basePrice: newRoom.basePrice,
        currency: newRoom.currency || 'USD',
        status: newRoom.status || 'ACTIVE',
      });

      // Add new room to local state
      setRooms([...rooms, response.room]);
      setSaveSuccess(true);
      
      // Close modal after short delay
      setTimeout(() => {
        handleCloseAddModal();
      }, 1500);
    } catch (err: any) {
      console.error('Error adding room:', err);
      setSaveError(err.error || 'Failed to add room');
    } finally {
      setSaving(false);
    }
  };

  const handleEditHotel = () => {
    if (!hotel) return;
    setEditingHotel({ ...hotel });
    setEditingRules(hotel.customPolicies || []);
    setSaveError(null);
    setSaveSuccess(false);
    setShowEditHotelModal(true);
  };

  const handleCloseHotelModal = () => {
    setShowEditHotelModal(false);
    setEditingHotel(null);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleHotelFieldChange = (field: keyof Hotel, value: any) => {
    if (!editingHotel) return;
    setEditingHotel({
      ...editingHotel,
      [field]: value,
    });
  };

  const handleSaveHotel = async () => {
    if (!editingHotel) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      console.log('Saving hotel with customPolicies:', editingRules);
      
      const response = await apiClient.put<{ hotel: Hotel }>(`/hotels/${hotelId}`, {
        name: editingHotel.name,
        description: editingHotel.description,
        address: editingHotel.address,
        city: editingHotel.city,
        state: editingHotel.state,
        country: editingHotel.country,
        zipCode: editingHotel.zipCode,
        starRating: editingHotel.starRating,
        checkInTime: editingHotel.checkInTime,
        checkOutTime: editingHotel.checkOutTime,
        cancellationPolicy: editingHotel.cancellationPolicy,
        customPolicies: editingRules,
        status: editingHotel.status,
      });

      console.log('Hotel saved successfully. Response:', response);

      // Update local state with the response from server
      if (response && response.hotel) {
        setHotel(response.hotel);
      } else {
        // Fallback: update with local state
        setHotel({
          ...editingHotel,
          customPolicies: editingRules,
        });
      }
      
      setSaveSuccess(true);
      
      // Close modal after short delay
      setTimeout(() => {
        handleCloseHotelModal();
        // Refresh hotel details to ensure we have latest data
        fetchHotelDetails();
      }, 1500);
    } catch (err: any) {
      console.error('Error updating hotel:', err);
      setSaveError(err.error || 'Failed to update hotel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container pt-5 pb-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading hotel details...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="container pt-5 pb-5">
        <div className="alert alert-danger" role="alert">
          <i className="ri-error-warning-line me-2"></i>
          {error || 'Hotel not found'}
        </div>
        <Link href="/dashboard/listings" className="btn btn-primary">
          <i className="ri-arrow-left-line me-2"></i>
          Back to Listings
        </Link>
      </div>
    );
  }

  return (
    <div className="author-area pt-5 pb-5">
      <div className="container">
        <div className="row">
          <div className="col-xl-8 col-xxl-9">
            {/* Back Button */}
            <div className="mb-4">
              <Link href="/dashboard/listings" className="btn btn-outline-primary btn-sm">
                <i className="ri-arrow-left-line me-2"></i>
                Back to Listings
              </Link>
            </div>

            {/* Hotel Header */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h2 className="mb-2">{hotel.name}</h2>
                    <p className="text-muted mb-2">
                      <i className="ri-map-pin-line me-1"></i>
                      {hotel.address}, {hotel.city}, {hotel.country}
                    </p>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="badge bg-primary">{hotel.starRating} ⭐</span>
                      <span className={`badge ${hotel.status === 'ACTIVE' ? 'bg-success' : 'bg-warning'}`}>
                        {hotel.status}
                      </span>
                      <span className="badge bg-info">{hotel.adminRole}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn-primary"
                    onClick={handleEditHotel}
                  >
                    <i className="ri-edit-line me-2"></i>
                    Edit Hotel
                  </button>
                </div>

                {/* Hotel Images */}
                {hotel.images && hotel.images.length > 0 && (
                  <div className="row g-2 mb-3">
                    {hotel.images.slice(0, 4).map((image, index) => (
                      <div key={index} className="col-6 col-md-3">
                        <div style={{ position: 'relative', height: '150px' }}>
                          <Image
                            src={image}
                            alt={`${hotel.name} - Image ${index + 1}`}
                            fill
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="row g-3">
                  <div className="col-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h4 className="mb-1">{hotel.totalRooms}</h4>
                      <small className="text-muted">Total Rooms</small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h4 className="mb-1">{hotel.averageRating}</h4>
                      <small className="text-muted">Avg Rating</small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h4 className="mb-1">{hotel.totalReviews}</h4>
                      <small className="text-muted">Reviews</small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <h4 className="mb-1">{rooms.length}</h4>
                      <small className="text-muted">Room Types</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'rooms' ? 'active' : ''}`}
                  onClick={() => setActiveTab('rooms')}
                >
                  Rooms ({rooms.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bookings')}
                >
                  Bookings
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="card">
                <div className="card-body">
                  <h4 className="mb-3">Hotel Information</h4>
                  <p className="mb-4">{hotel.description}</p>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <strong>Check-in Time:</strong>
                      <p>{hotel.checkInTime}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Check-out Time:</strong>
                      <p>{hotel.checkOutTime}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Company:</strong>
                      <p>{hotel.companyName}</p>
                    </div>
                    <div className="col-md-6">
                      <strong>Zip Code:</strong>
                      <p>{hotel.zipCode}</p>
                    </div>
                    {hotel.cancellationPolicy && (
                      <div className="col-12">
                        <strong>Cancellation Policy:</strong>
                        <p>{hotel.cancellationPolicy}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'rooms' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h4>Room Types</h4>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenAddModal}
                  >
                    <i className="ri-add-line me-2"></i>
                    Add Room Type
                  </button>
                </div>

                {rooms.length === 0 ? (
                  <div className="alert alert-info">
                    <i className="ri-information-line me-2"></i>
                    No room types configured yet.
                  </div>
                ) : (
                  <div className="row g-3">
                    {rooms.map((room) => (
                      <div key={room.id} className="col-12">
                        <div className="card">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-3">
                                {room.images && room.images.length > 0 && (
                                  <div style={{ position: 'relative', height: '120px' }}>
                                    <Image
                                      src={room.images[0]}
                                      alt={room.name}
                                      fill
                                      style={{ objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="col-md-9">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h5 className="mb-1">{room.name}</h5>
                                    <p className="text-muted small mb-2">{room.description}</p>
                                  </div>
                                  <span className={`badge ${room.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'}`}>
                                    {room.status}
                                  </span>
                                </div>
                                <div className="row g-2">
                                  <div className="col-auto">
                                    <small className="text-muted">
                                      <i className="ri-user-line me-1"></i>
                                      Capacity: {room.capacity}
                                    </small>
                                  </div>
                                  <div className="col-auto">
                                    <small className="text-muted">
                                      <i className="ri-door-line me-1"></i>
                                      Total: {room.totalRooms}
                                    </small>
                                  </div>
                                  <div className="col-auto">
                                    <small className="text-muted">
                                      <i className="ri-checkbox-circle-line me-1"></i>
                                      Available: {room.availableRooms}
                                    </small>
                                  </div>
                                  <div className="col-auto">
                                    <strong className="text-primary">
                                      ${room.basePrice} / night
                                    </strong>
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <button 
                                    className="btn btn-sm btn-outline-primary me-2"
                                    onClick={() => handleEditRoom(room)}
                                  >
                                    <i className="ri-edit-line me-1"></i>
                                    Edit
                                  </button>
                                  <button className="btn btn-sm btn-outline-secondary">
                                    <i className="ri-image-line me-1"></i>
                                    Manage Images
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookings' && (
              <div className="card">
                <div className="card-body">
                  <h4 className="mb-3">Recent Bookings</h4>
                  <div className="alert alert-info">
                    <i className="ri-information-line me-2"></i>
                    Booking management coming soon.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-xl-4 col-xxl-3">
            <AuthorSidebar />
          </div>
        </div>
      </div>

      {/* Edit Room Modal */}
      {showEditModal && editingRoom && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseModal}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Room: {editingRoom.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                  disabled={saving}
                ></button>
              </div>
              <div className="modal-body">
                {saveError && (
                  <div className="alert alert-danger" role="alert">
                    <i className="ri-error-warning-line me-2"></i>
                    {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="alert alert-success" role="alert">
                    <i className="ri-check-line me-2"></i>
                    Room updated successfully!
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Room Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingRoom.name}
                      onChange={(e) => handleRoomFieldChange('name', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={editingRoom.description}
                      onChange={(e) => handleRoomFieldChange('description', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Capacity (Guests)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="10"
                      value={editingRoom.capacity}
                      onChange={(e) => handleRoomFieldChange('capacity', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Base Price (USD)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={editingRoom.basePrice}
                      onChange={(e) => handleRoomFieldChange('basePrice', parseFloat(e.target.value))}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Total Rooms</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={editingRoom.totalRooms}
                      onChange={(e) => handleRoomFieldChange('totalRooms', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Available Rooms</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max={editingRoom.totalRooms}
                      value={editingRoom.availableRooms}
                      onChange={(e) => handleRoomFieldChange('availableRooms', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editingRoom.status}
                      onChange={(e) => handleRoomFieldChange('status', e.target.value)}
                      disabled={saving}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveRoom}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {showAddModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseAddModal}
        >
          <div 
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Room Type</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseAddModal}
                  disabled={saving}
                ></button>
              </div>
              <div className="modal-body">
                {saveError && (
                  <div className="alert alert-danger" role="alert">
                    <i className="ri-error-warning-line me-2"></i>
                    {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="alert alert-success" role="alert">
                    <i className="ri-check-line me-2"></i>
                    Room type added successfully!
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Room Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Deluxe Suite"
                      value={newRoom.name}
                      onChange={(e) => handleNewRoomFieldChange('name', e.target.value)}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description *</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe the room features and amenities"
                      value={newRoom.description}
                      onChange={(e) => handleNewRoomFieldChange('description', e.target.value)}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Capacity (Guests)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      max="10"
                      value={newRoom.capacity}
                      onChange={(e) => handleNewRoomFieldChange('capacity', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Base Price (USD)</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      step="0.01"
                      value={newRoom.basePrice}
                      onChange={(e) => handleNewRoomFieldChange('basePrice', parseFloat(e.target.value))}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Total Rooms</label>
                    <input
                      type="number"
                      className="form-control"
                      min="1"
                      value={newRoom.totalRooms}
                      onChange={(e) => handleNewRoomFieldChange('totalRooms', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Available Rooms</label>
                    <input
                      type="number"
                      className="form-control"
                      min="0"
                      max={newRoom.totalRooms}
                      value={newRoom.availableRooms}
                      onChange={(e) => handleNewRoomFieldChange('availableRooms', parseInt(e.target.value))}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={newRoom.status}
                      onChange={(e) => handleNewRoomFieldChange('status', e.target.value)}
                      disabled={saving}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseAddModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleAddRoom}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <i className="ri-add-line me-2"></i>
                      Add Room Type
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {showEditHotelModal && editingHotel && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={handleCloseHotelModal}
        >
          <div 
            className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Hotel: {editingHotel.name}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseHotelModal}
                  disabled={saving}
                ></button>
              </div>
              <div className="modal-body">
                {saveError && (
                  <div className="alert alert-danger" role="alert">
                    <i className="ri-error-warning-line me-2"></i>
                    {saveError}
                  </div>
                )}
                {saveSuccess && (
                  <div className="alert alert-success" role="alert">
                    <i className="ri-check-line me-2"></i>
                    Hotel updated successfully!
                  </div>
                )}

                <div className="row g-3">
                  <div className="col-12">
                    <h6 className="border-bottom pb-2">Basic Information</h6>
                  </div>

                  <div className="col-md-8">
                    <label className="form-label">Hotel Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingHotel.name}
                      onChange={(e) => handleHotelFieldChange('name', e.target.value)}
                      disabled={saving}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Star Rating</label>
                    <select
                      className="form-select"
                      value={editingHotel.starRating}
                      onChange={(e) => handleHotelFieldChange('starRating', parseInt(e.target.value))}
                      disabled={saving}
                    >
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={editingHotel.description}
                      onChange={(e) => handleHotelFieldChange('description', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h6 className="border-bottom pb-2">Location</h6>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingHotel.address}
                      onChange={(e) => handleHotelFieldChange('address', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingHotel.city}
                      onChange={(e) => handleHotelFieldChange('city', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">State/Province</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingHotel.state || ''}
                      onChange={(e) => handleHotelFieldChange('state', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingHotel.country}
                      onChange={(e) => handleHotelFieldChange('country', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Zip/Postal Code</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingHotel.zipCode || ''}
                      onChange={(e) => handleHotelFieldChange('zipCode', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h6 className="border-bottom pb-2">Check-in/Check-out</h6>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Check-in Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editingHotel.checkInTime}
                      onChange={(e) => handleHotelFieldChange('checkInTime', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Check-out Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={editingHotel.checkOutTime}
                      onChange={(e) => handleHotelFieldChange('checkOutTime', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <HotelRulesEditor
                      rules={editingRules}
                      onRulesChange={setEditingRules}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-12 mt-4">
                    <h6 className="border-bottom pb-2">Additional Information</h6>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Cancellation Policy</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe your cancellation policy"
                      value={editingHotel.cancellationPolicy || ''}
                      onChange={(e) => handleHotelFieldChange('cancellationPolicy', e.target.value)}
                      disabled={saving}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={editingHotel.status}
                      onChange={(e) => handleHotelFieldChange('status', e.target.value)}
                      disabled={saving}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="MAINTENANCE">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseHotelModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSaveHotel}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="ri-save-line me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHotelDetailsContent;
