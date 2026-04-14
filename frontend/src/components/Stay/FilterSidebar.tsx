"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import AdvancedFilters, { AdvancedFilterParams } from "./AdvancedFilters";

interface FilterParams {
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

interface FilterSidebarProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
  onClearFilters: () => void;
  totalResults: number;
}

const FilterSidebar = ({
  filters,
  onFilterChange,
  onClearFilters,
  totalResults,
}: FilterSidebarProps) => {
  const [localFilters, setLocalFilters] = useState<FilterParams>(filters);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Throttled filter change handler
  const handleFilterChangeThrottled = useCallback(
    (newFilters: FilterParams) => {
      setLocalFilters(newFilters);
      setIsThrottled(true);

      // Clear existing timer if any
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }

      // Set new throttle timer (500ms debounce)
      throttleTimerRef.current = setTimeout(() => {
        onFilterChange(newFilters);
        setIsThrottled(false);
      }, 500);
    },
    [onFilterChange]
  );

  const handleBasicFilterChange = (
    key: keyof FilterParams,
    value: any
  ) => {
    const newFilters = { ...localFilters, [key]: value || undefined };
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k as keyof FilterParams] === undefined) {
        delete newFilters[k as keyof FilterParams];
      }
    });
    handleFilterChangeThrottled(newFilters);
  };

  const handleAdvancedFilterChange = (advancedFilters: AdvancedFilterParams) => {
    const newFilters = { ...localFilters, ...advancedFilters };
    handleFilterChangeThrottled(newFilters);
  };

  const handleClearAll = () => {
    setLocalFilters({});
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }
    onClearFilters();
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.location) count++;
    if (localFilters.city) count++;
    if (localFilters.country) count++;
    if (localFilters.checkIn) count++;
    if (localFilters.checkOut) count++;
    if (localFilters.guests) count++;
    if (localFilters.minRating) count++;
    if (localFilters.maxPrice) count++;
    if (localFilters.facilities?.length) count += localFilters.facilities.length;
    if (localFilters.roomFacilities?.length) count += localFilters.roomFacilities.length;
    if (localFilters.proximityLandmark) count++;
    if (localFilters.surroundings?.length) count += localFilters.surroundings.length;
    if (localFilters.airportMaxDistance) count++;
    return count;
  };

  return (
    <div className="sidebar-filters">
      <style jsx>{`
        .sidebar-filters {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 12px;
          padding: 24px 20px;
          height: fit-content;
          position: sticky;
          top: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .sidebar-filters h4 {
          font-weight: 700;
          margin-bottom: 20px;
          font-size: 16px;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .filter-section {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid #f0f0f0;
        }

        .filter-section:last-of-type {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }

        .filter-section label {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          display: block;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.2px;
        }

        .filter-section input,
        .filter-section select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          font-size: 14px;
          background: white;
          color: #333;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .filter-section input::placeholder {
          color: #999;
        }

        .filter-section input:focus,
        .filter-section select:focus {
          outline: none;
          border-color: #ff621f;
          box-shadow: 0 0 0 4px rgba(255, 98, 31, 0.12);
          background: #fffbf7;
        }

        .filter-section input:hover:not(:focus),
        .filter-section select:hover:not(:focus) {
          border-color: #d0d0d0;
        }

        .filter-badge-count {
          background: #ff621f;
          color: white;
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 13px;
          font-weight: 700;
          min-width: 28px;
          text-align: center;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .clear-all-btn {
          width: 100%;
          padding: 12px 14px;
          background: white;
          border: 2px solid #ff621f;
          color: #ff621f;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 700;
          font-size: 13px;
          transition: all 0.3s ease;
          margin-top: 20px;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .clear-all-btn:hover {
          background: #ff621f;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 98, 31, 0.2);
        }

        .clear-all-btn:active {
          transform: translateY(0);
        }

        .results-count {
          font-size: 14px;
          color: #333;
          margin-bottom: 18px;
          padding: 12px 14px;
          background: #f8f9fa;
          border-radius: 6px;
          text-align: center;
          font-weight: 500;
          border: 1px solid #f0f0f0;
        }

        .results-count strong {
          color: #ff621f;
          font-size: 16px;
          font-weight: 700;
          display: block;
          margin-bottom: 2px;
        }

        .throttle-indicator {
          display: none;
          font-size: 13px;
          color: #ff9661;
          margin-top: 10px;
          text-align: center;
          font-weight: 500;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .throttle-indicator.active {
          display: block;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .date-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .date-inputs input {
          margin-bottom: 0;
        }

        @media (max-width: 1200px) {
          .sidebar-filters {
            padding: 24px 20px;
          }
        }

        @media (max-width: 1024px) {
          .sidebar-filters {
            position: relative;
            top: auto;
            margin-bottom: 30px;
          }
        }
      `}</style>

      <h4>
        Filters
        {getActiveFilterCount() > 0 && (
          <span className="filter-badge-count">{getActiveFilterCount()}</span>
        )}
      </h4>

      <div className="results-count">
        <strong>{totalResults}</strong> stays found
      </div>

      {/* Basic Filters */}
      <div className="filter-section">
        <label>Max Price (per night)</label>
        <input
          type="number"
          placeholder="Maximum price"
          value={localFilters.maxPrice || ""}
          onChange={(e) =>
            handleBasicFilterChange("maxPrice", e.target.value ? parseFloat(e.target.value) : undefined)
          }
        />
      </div>

      {/* Advanced Filters */}
      <div className="filter-section">
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

      {/* Throttle Indicator */}
      <div className={`throttle-indicator ${isThrottled ? "active" : ""}`}>
        Updating results...
      </div>

      {/* Clear All Button */}
      {getActiveFilterCount() > 0 && (
        <button className="clear-all-btn" onClick={handleClearAll}>
          Clear All Filters
        </button>
      )}
    </div>
  );
};

export default FilterSidebar;
