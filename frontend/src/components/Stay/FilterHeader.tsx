"use client";

import { useState, useEffect } from "react";
import AdvancedFilters, { AdvancedFilterParams } from "./AdvancedFilters";

export interface FilterParams {
  location?: string;
  city?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minRating?: number;
  maxPrice?: number;
  facilities?: string[];
  roomFacilities?: string[];
  proximityLandmark?: string;
  proximityDistance?: number;
  surroundings?: string[];
  airportMaxDistance?: number;
}

interface FilterHeaderProps {
  filters: FilterParams;
  totalResults: number;
  onFilterChange: (filters: FilterParams) => void;
  onClearFilters: () => void;
}

const FilterHeader = ({ filters, totalResults, onFilterChange, onClearFilters }: FilterHeaderProps) => {
  const [localFilters, setLocalFilters] = useState<FilterParams>(filters);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('[FilterHeader] Filters prop changed:', filters);
    setLocalFilters(filters);
    setIsInitialized(true);
  }, [filters]);

  const handleFilterUpdate = (key: keyof FilterParams, value: any) => {
    const newFilters = { ...filters, ...localFilters, [key]: value || undefined };
    // Remove undefined values
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k as keyof FilterParams] === undefined) {
        delete newFilters[k as keyof FilterParams];
      }
    });
    console.log('[FilterHeader] Updating filter:', key, '=', value, 'New filters:', newFilters);
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAdvancedFilterChange = (advancedFilters: AdvancedFilterParams) => {
    const newFilters = { ...localFilters, ...advancedFilters };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilter = (key: keyof FilterParams) => {
    const newFilters = { ...filters, ...localFilters };
    delete newFilters[key];
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.keys(localFilters).filter(key => localFilters[key as keyof FilterParams]).length;
  };

  const getAdvancedFilterCount = () => {
    let count = 0;
    if (localFilters.facilities?.length) count += localFilters.facilities.length;
    if (localFilters.roomFacilities?.length) count += localFilters.roomFacilities.length;
    if (localFilters.proximityLandmark) count += 1;
    if (localFilters.surroundings?.length) count += localFilters.surroundings.length;
    if (localFilters.airportMaxDistance) count += 1;
    return count;
  };

  const formatDateRange = () => {
    if (localFilters.checkIn && localFilters.checkOut) {
      const checkIn = new Date(localFilters.checkIn);
      const checkOut = new Date(localFilters.checkOut);
      return `${checkIn.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${checkOut.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    }
    return null;
  };

  const getLocationDisplay = () => {
    if (localFilters.city && localFilters.country) {
      return `${localFilters.city}, ${localFilters.country}`;
    }
    if (localFilters.city) return localFilters.city;
    if (localFilters.country) return localFilters.country;
    if (localFilters.location) return localFilters.location;
    return "All Locations";
  };

  return (
    <>
      <div className="d-xl-flex justify-content-between align-items-center mb-70">
        <div className="section-title mb-0 left-title">
          <h2>Stays in {getLocationDisplay()}</h2>
          <p>
            {totalResults} stay{totalResults !== 1 ? 's' : ''}
            {formatDateRange() && ` · ${formatDateRange()}`}
            {localFilters.guests && ` · ${localFilters.guests} Guest${localFilters.guests !== 1 ? 's' : ''}`}
          </p>
        </div>

        <ul className="p-0 mb-0 mt-3 mt-xl-0 list-unstyled d-lg-flex align-items-center filter-drop">
          {/* Star Rating Filter */}
          <li className="ms-0">
            <select 
              className="form-select form-control"
              value={localFilters.minRating || ''}
              onChange={(e) => handleFilterUpdate('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
            >
              <option value="">Any Rating</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
            </select>
          </li>

          {/* Price Filter */}
          {localFilters.maxPrice ? (
            <li>
              <button 
                type="button" 
                className="opacity-btn"
                onClick={() => handleClearFilter('maxPrice')}
              >
                <span>Up to ${localFilters.maxPrice}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <g clipPath="url(#clip0_3719_2461)">
                    <path d="M8 0C6.41775 0 4.87104 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346629 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0ZM11.138 10.1953L10.1953 11.138L8 8.94267L5.80467 11.138L4.862 10.1953L7.05734 8L4.862 5.80467L5.80467 4.862L8 7.05733L10.1953 4.862L11.138 5.80467L8.94267 8L11.138 10.1953Z" fill="#FF621F"/>
                  </g>
                </svg>
              </button>
            </li>
          ) : (
            <li>
              <select 
                className="form-select form-control"
                value={localFilters.maxPrice || ''}
                onChange={(e) => handleFilterUpdate('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              >
                <option value="">Any Price</option>
                <option value="100">Up to $100</option>
                <option value="200">Up to $200</option>
                <option value="300">Up to $300</option>
                <option value="500">Up to $500</option>
                <option value="1000">Up to $1,000</option>
              </select>
            </li>
          )}

          {/* Guests Filter */}
          <li>
            <select 
              className="form-select form-control"
              value={localFilters.guests || ''}
              onChange={(e) => handleFilterUpdate('guests', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">Any Guests</option>
              <option value="1">1 Guest</option>
              <option value="2">2 Guests</option>
              <option value="3">3 Guests</option>
              <option value="4">4 Guests</option>
              <option value="5">5+ Guests</option>
            </select>
          </li>

          {/* Advanced Filters Toggle */}
          <li>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              More Filters {getAdvancedFilterCount() > 0 && <span className="badge bg-danger ms-2">{getAdvancedFilterCount()}</span>}
            </button>
          </li>

          {/* Clear All Link */}
          {getActiveFilterCount() > 0 && (
            <li>
              <span 
                onClick={onClearFilters}
                style={{ 
                  cursor: 'pointer', 
                  color: '#6B7280 !important',
                  textDecoration: 'underline',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Clear All
              </span>
            </li>
          )}
        </ul>
      </div>

      {/* Advanced Filters Section */}
      {showAdvancedFilters && (
        <div className="mb-4">
          <AdvancedFilters 
            filters={{
              facilities: localFilters.facilities,
              roomFacilities: localFilters.roomFacilities,
              proximityLandmark: localFilters.proximityLandmark,
              proximityDistance: localFilters.proximityDistance,
              surroundings: localFilters.surroundings,
              airportMaxDistance: localFilters.airportMaxDistance,
            }}
            onFilterChange={handleAdvancedFilterChange}
          />
        </div>
      )}
    </>
  );
};

export default FilterHeader;
