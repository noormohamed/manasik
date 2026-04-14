"use client";

import { useState } from "react";

export interface AdvancedFilterParams {
  facilities?: string[];
  roomFacilities?: string[];
  proximityLandmark?: string;
  proximityDistance?: number;
  surroundings?: string[];
  airportMaxDistance?: number;
}

interface AdvancedFiltersProps {
  filters: AdvancedFilterParams;
  onFilterChange: (filters: AdvancedFilterParams) => void;
}

const HOTEL_FACILITIES = [
  "WiFi",
  "Parking",
  "Gym",
  "Swimming Pool",
  "Restaurant",
  "Bar",
  "Spa",
  "Conference Rooms",
  "Pet Friendly",
  "Wheelchair Accessible",
];

const ROOM_FACILITIES = [
  "Air Conditioning",
  "Television",
  "Minibar",
  "Safe",
  "Balcony",
  "Bathtub",
  "Shower",
  "Work Desk",
  "Hairdryer",
  "Iron & Board",
];

const SURROUNDINGS = [
  { value: "restaurants", label: "Restaurants & Cafes" },
  { value: "cafes", label: "Cafes" },
  { value: "attractions", label: "Top Attractions" },
  { value: "nature", label: "Natural Beauty" },
  { value: "transport", label: "Public Transport" },
];

const AdvancedFilters = ({ filters, onFilterChange }: AdvancedFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState({
    facilities: false,
    roomFacilities: false,
    proximity: false,
    surroundings: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFacilityToggle = (facility: string) => {
    const current = filters.facilities || [];
    const updated = current.includes(facility)
      ? current.filter(f => f !== facility)
      : [...current, facility];
    onFilterChange({ ...filters, facilities: updated.length > 0 ? updated : undefined });
  };

  const handleRoomFacilityToggle = (facility: string) => {
    const current = filters.roomFacilities || [];
    const updated = current.includes(facility)
      ? current.filter(f => f !== facility)
      : [...current, facility];
    onFilterChange({ ...filters, roomFacilities: updated.length > 0 ? updated : undefined });
  };

  const handleSurroundingToggle = (surrounding: string) => {
    const current = filters.surroundings || [];
    const updated = current.includes(surrounding)
      ? current.filter(s => s !== surrounding)
      : [...current, surrounding];
    onFilterChange({ ...filters, surroundings: updated.length > 0 ? updated : undefined });
  };

  const handleProximityChange = (landmark: string, distance: number) => {
    onFilterChange({
      ...filters,
      proximityLandmark: landmark || undefined,
      proximityDistance: distance || undefined,
    });
  };

  const handleAirportDistanceChange = (distance: number) => {
    onFilterChange({
      ...filters,
      airportMaxDistance: distance || undefined,
    });
  };

  return (
    <div className="advanced-filters">
      <style jsx>{`
        .advanced-filters h5 {
          font-size: 14px;
          font-weight: 700;
        }
        
        .advanced-filters .form-check-label {
          font-size: 14px;
        }
        
        .advanced-filters .form-label {
          font-size: 13px;
          font-weight: 600;
        }
        
        .advanced-filters .form-control,
        .advanced-filters .form-select {
          font-size: 14px;
          padding: 8px 10px;
        }
        
        .advanced-filters .badge {
          font-size: 12px;
          padding: 4px 8px;
        }
      `}</style>
      
      {/* Hotel Facilities */}
      <div className="filter-section mb-4">
        <div 
          className="filter-header d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => toggleSection('facilities')}
        >
          <h5 className="mb-0">Hotel Facilities</h5>
          <span className="badge bg-secondary">{filters.facilities?.length || 0}</span>
        </div>
        {expandedSections.facilities && (
          <div className="filter-content mt-3">
            <div className="row">
              {HOTEL_FACILITIES.map(facility => (
                <div key={facility} className="col-12 mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`facility-${facility}`}
                      checked={filters.facilities?.includes(facility) || false}
                      onChange={() => handleFacilityToggle(facility)}
                    />
                    <label className="form-check-label" htmlFor={`facility-${facility}`}>
                      {facility}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Room Facilities */}
      <div className="filter-section mb-4">
        <div 
          className="filter-header d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => toggleSection('roomFacilities')}
        >
          <h5 className="mb-0">Room Facilities</h5>
          <span className="badge bg-secondary">{filters.roomFacilities?.length || 0}</span>
        </div>
        {expandedSections.roomFacilities && (
          <div className="filter-content mt-3">
            <div className="row">
              {ROOM_FACILITIES.map(facility => (
                <div key={facility} className="col-12 mb-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`room-facility-${facility}`}
                      checked={filters.roomFacilities?.includes(facility) || false}
                      onChange={() => handleRoomFacilityToggle(facility)}
                    />
                    <label className="form-check-label" htmlFor={`room-facility-${facility}`}>
                      {facility}
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Proximity to Landmarks */}
      <div className="filter-section mb-4">
        <div 
          className="filter-header d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => toggleSection('proximity')}
        >
          <h5 className="mb-0">Proximity to Landmarks</h5>
          {filters.proximityLandmark && <span className="badge bg-info">Active</span>}
        </div>
        {expandedSections.proximity && (
          <div className="filter-content mt-3">
            <div className="mb-3">
              <label className="form-label">Landmark</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Airport, Train Station"
                value={filters.proximityLandmark || ''}
                onChange={(e) => handleProximityChange(e.target.value, filters.proximityDistance || 0)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Max Distance (km)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Distance in km"
                value={filters.proximityDistance || ''}
                onChange={(e) => handleProximityChange(filters.proximityLandmark || '', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Hotel Surroundings */}
      <div className="filter-section mb-4">
        <div 
          className="filter-header d-flex justify-content-between align-items-center cursor-pointer"
          onClick={() => toggleSection('surroundings')}
        >
          <h5 className="mb-0">Hotel Surroundings</h5>
          <span className="badge bg-secondary">{filters.surroundings?.length || 0}</span>
        </div>
        {expandedSections.surroundings && (
          <div className="filter-content mt-3">
            <div className="mb-3">
              <h6>Nearby Attractions & Services</h6>
              {SURROUNDINGS.map(surrounding => (
                <div key={surrounding.value} className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`surrounding-${surrounding.value}`}
                    checked={filters.surroundings?.includes(surrounding.value) || false}
                    onChange={() => handleSurroundingToggle(surrounding.value)}
                  />
                  <label className="form-check-label" htmlFor={`surrounding-${surrounding.value}`}>
                    {surrounding.label}
                  </label>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="form-label">Max Distance to Airport (km)</label>
              <input
                type="number"
                className="form-control"
                placeholder="Distance in km"
                value={filters.airportMaxDistance || ''}
                onChange={(e) => handleAirportDistanceChange(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .advanced-filters {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }

        .filter-section {
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 15px;
        }

        .filter-section:last-child {
          border-bottom: none;
        }

        .filter-header {
          cursor: pointer;
          user-select: none;
        }

        .filter-header h5 {
          font-weight: 600;
          color: #333;
        }

        .filter-header:hover h5 {
          color: #ff621f;
        }

        .form-check-input {
          cursor: pointer;
        }

        .form-check-label {
          cursor: pointer;
          margin-left: 8px;
        }
      `}</style>
    </div>
  );
};

export default AdvancedFilters;
