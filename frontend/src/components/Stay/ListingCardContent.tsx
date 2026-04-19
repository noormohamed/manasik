"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import ResultsHeader from "./ResultsHeader";
import HajjUmrahFilters, { HajjUmrahFilterParams, ViewType } from "./HajjUmrahFilters";
import HotelCard, { HotelCardData } from "./HotelCard";
import HotelMapView from "./HotelMapView";
import AdvancedFilters, { AdvancedFilterParams } from "./AdvancedFilters";
import { SortOption } from "./SortDropdown";

interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  starRating: number;
  averageRating: number;
  totalReviews: number;
  minPrice?: number;
  walkingTimeToHaram?: number;
  distanceToHaramMeters?: number;
  viewType?: ViewType;
  isElderlyFriendly?: boolean;
  hasFamilyRooms?: boolean;
  manasikScore?: number;
  bestForTags?: string[];
  images: Array<{ id?: string; url: string }>;
  rooms?: Array<{
    id: string;
    name: string;
    basePrice: number;
    currency: string;
    capacity?: number;
  }>;
}

export interface FilterParams {
  location?: string;
  city?: string;
  country?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
  // Hajj/Umrah filters
  maxWalkingTimeToHaram?: number;
  viewTypes?: ViewType[];
  elderlyFriendly?: boolean;
  familyRooms?: boolean;
  bestForTags?: string[];
  // Advanced filters
  facilities?: string[];
  roomFacilities?: string[];
  proximityLandmark?: string;
  proximityDistance?: number;
  surroundings?: string[];
  airportMaxDistance?: number;
  // Sorting
  sortBy?: SortOption;
}

const ListingCardContent = () => {
  const searchParams = useSearchParams();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState<FilterParams>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedHotelId, setSelectedHotelId] = useState<string | undefined>();

  // Initialize filters from URL params
  useEffect(() => {
    const initialFilters: FilterParams = {};
    
    const location = searchParams.get('location');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const minRating = searchParams.get('minRating');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const maxWalkingTimeToHaram = searchParams.get('maxWalkingTimeToHaram');
    const viewTypes = searchParams.get('viewTypes');
    const elderlyFriendly = searchParams.get('elderlyFriendly');
    const familyRooms = searchParams.get('familyRooms');
    const bestForTags = searchParams.get('bestForTags');
    const facilities = searchParams.get('facilities');
    const roomFacilities = searchParams.get('roomFacilities');
    const sortBy = searchParams.get('sortBy');

    if (location) initialFilters.location = location;
    if (city) initialFilters.city = city;
    if (country) initialFilters.country = country;
    if (checkIn) initialFilters.checkIn = checkIn;
    if (checkOut) initialFilters.checkOut = checkOut;
    if (guests) initialFilters.guests = parseInt(guests);
    if (minRating) initialFilters.minRating = parseFloat(minRating);
    if (minPrice) initialFilters.minPrice = parseFloat(minPrice);
    if (maxPrice) initialFilters.maxPrice = parseFloat(maxPrice);
    if (maxWalkingTimeToHaram) initialFilters.maxWalkingTimeToHaram = parseInt(maxWalkingTimeToHaram);
    if (viewTypes) initialFilters.viewTypes = viewTypes.split(',') as ViewType[];
    if (elderlyFriendly === 'true') initialFilters.elderlyFriendly = true;
    if (familyRooms === 'true') initialFilters.familyRooms = true;
    if (bestForTags) initialFilters.bestForTags = bestForTags.split(',');
    if (facilities) initialFilters.facilities = facilities.split(',');
    if (roomFacilities) initialFilters.roomFacilities = roomFacilities.split(',');
    if (sortBy) initialFilters.sortBy = sortBy as SortOption;

    setFilters(initialFilters);
    setIsInitialized(true);
  }, [searchParams]);

  // Fetch hotels when filters or page changes
  useEffect(() => {
    if (!isInitialized) return;
    fetchHotels();
  }, [currentPage, filters, isInitialized]);

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params: any = {
        page: currentPage,
        limit: 12,
      };

      // Add all filters to params
      if (filters.location) params.location = filters.location;
      if (filters.city) params.city = filters.city;
      if (filters.country) params.country = filters.country;
      if (filters.checkIn) params.checkIn = filters.checkIn;
      if (filters.checkOut) params.checkOut = filters.checkOut;
      if (filters.guests) params.guests = filters.guests;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.maxWalkingTimeToHaram) params.maxWalkingTimeToHaram = filters.maxWalkingTimeToHaram;
      if (filters.viewTypes?.length) params.viewTypes = filters.viewTypes.join(',');
      if (filters.elderlyFriendly) params.elderlyFriendly = 'true';
      if (filters.familyRooms) params.familyRooms = 'true';
      if (filters.bestForTags?.length) params.bestForTags = filters.bestForTags.join(',');
      if (filters.facilities?.length) params.facilities = filters.facilities.join(',');
      if (filters.roomFacilities?.length) params.roomFacilities = filters.roomFacilities.join(',');
      if (filters.sortBy) params.sortBy = filters.sortBy;

      // Try the new search endpoint first, fall back to the old one
      let response: any;
      try {
        response = await apiClient.get('/hotels/search', { params });
      } catch {
        // Fall back to old endpoint
        response = await apiClient.get('/hotels', { params });
      }
      
      setHotels(response.hotels || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalResults(response.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching hotels:', err);
      setError(err.error || 'Failed to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((newFilters: Partial<FilterParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleHajjUmrahFilterChange = useCallback((hajjFilters: HajjUmrahFilterParams) => {
    handleFilterChange(hajjFilters);
  }, [handleFilterChange]);

  const handleAdvancedFilterChange = useCallback((advancedFilters: AdvancedFilterParams) => {
    handleFilterChange(advancedFilters);
  }, [handleFilterChange]);

  const handleSortChange = useCallback((sortBy: SortOption) => {
    handleFilterChange({ sortBy });
  }, [handleFilterChange]);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.minRating) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.maxWalkingTimeToHaram) count++;
    if (filters.viewTypes?.length) count += filters.viewTypes.length;
    if (filters.elderlyFriendly) count++;
    if (filters.familyRooms) count++;
    if (filters.bestForTags?.length) count += filters.bestForTags.length;
    if (filters.facilities?.length) count += filters.facilities.length;
    if (filters.roomFacilities?.length) count += filters.roomFacilities.length;
    return count;
  };

  const calculateNights = () => {
    if (!filters.checkIn || !filters.checkOut) return undefined;
    const checkIn = new Date(filters.checkIn);
    const checkOut = new Date(filters.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : undefined;
  };

  const nights = calculateNights();

  // Convert hotels to HotelCardData format
  const hotelCards: HotelCardData[] = hotels.map(hotel => ({
    id: hotel.id,
    name: hotel.name,
    description: hotel.description,
    city: hotel.city,
    country: hotel.country,
    latitude: hotel.latitude,
    longitude: hotel.longitude,
    starRating: hotel.starRating,
    averageRating: hotel.averageRating,
    totalReviews: hotel.totalReviews,
    minPrice: hotel.minPrice || (hotel.rooms?.[0]?.basePrice),
    walkingTimeToHaram: hotel.walkingTimeToHaram,
    distanceToHaramMeters: hotel.distanceToHaramMeters,
    viewType: hotel.viewType,
    isElderlyFriendly: hotel.isElderlyFriendly || false,
    hasFamilyRooms: hotel.hasFamilyRooms || false,
    manasikScore: hotel.manasikScore,
    bestForTags: hotel.bestForTags || [],
    images: hotel.images?.map(img => ({ id: img.id || '', url: img.url })) || [],
    rooms: hotel.rooms?.map(room => ({
      id: room.id,
      name: room.name,
      basePrice: room.basePrice,
      currency: room.currency,
      capacity: room.capacity || 2,
    })) || [],
  }));

  return (
    <>
      <style jsx>{`
        .listing-content-wrapper {
          padding: 20px 0 60px;
        }

        .content-layout {
          display: grid;
          grid-template-columns: ${showFilters ? '280px 1fr' : '1fr'};
          gap: 30px;
          transition: all 0.3s ease;
        }

        .filters-sidebar {
          position: sticky;
          top: 20px;
          height: fit-content;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
        }

        .filters-sidebar::-webkit-scrollbar {
          width: 6px;
        }

        .filters-sidebar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .filters-sidebar::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 3px;
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f0f0f0;
        }

        .filters-header h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          color: #111;
        }

        .clear-filters-btn {
          font-size: 13px;
          color: #ff621f;
          background: none;
          border: none;
          cursor: pointer;
          font-weight: 500;
        }

        .clear-filters-btn:hover {
          text-decoration: underline;
        }

        .main-content {
          min-width: 0;
        }

        .hotels-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .map-view-container {
          height: calc(100vh - 200px);
          min-height: 600px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f0f0f0;
          border-top-color: #ff621f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-text {
          margin-top: 16px;
          font-size: 16px;
          color: #666;
        }

        .error-container {
          padding: 24px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          text-align: center;
        }

        .no-results {
          padding: 60px 20px;
          text-align: center;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .no-results h3 {
          font-size: 20px;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px 0;
        }

        .no-results p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #f0f0f0;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 40px;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #e0e0e0;
          background: white;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          border-color: #ff621f;
          color: #ff621f;
        }

        .pagination-btn.active {
          background: #ff621f;
          border-color: #ff621f;
          color: white;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .filter-section-divider {
          margin: 20px 0;
          border: none;
          border-top: 1px solid #f0f0f0;
        }

        .advanced-filters-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }

        .advanced-filters-toggle i {
          transition: transform 0.2s ease;
        }

        .advanced-filters-toggle.expanded i {
          transform: rotate(180deg);
        }

        @media (max-width: 1024px) {
          .content-layout {
            grid-template-columns: 1fr;
          }

          .filters-sidebar {
            position: relative;
            top: 0;
            max-height: none;
            display: ${showFilters ? 'block' : 'none'};
          }
        }

        @media (max-width: 768px) {
          .hotels-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="listing-content-wrapper">
        <div className="container">
          <ResultsHeader
            totalResults={totalResults}
            location={filters.city || filters.location}
            sortBy={filters.sortBy || 'recommended'}
            onSortChange={handleSortChange}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onToggleFilters={() => setShowFilters(!showFilters)}
            activeFilterCount={getActiveFilterCount()}
          />

          <div className="content-layout">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="filters-sidebar">
                <div className="filters-header">
                  <h3>Filters</h3>
                  {getActiveFilterCount() > 0 && (
                    <button className="clear-filters-btn" onClick={handleClearFilters} type="button">
                      Clear All
                    </button>
                  )}
                </div>

                {/* Hajj/Umrah Specific Filters */}
                <HajjUmrahFilters
                  filters={{
                    maxWalkingTimeToHaram: filters.maxWalkingTimeToHaram,
                    viewTypes: filters.viewTypes,
                    elderlyFriendly: filters.elderlyFriendly,
                    familyRooms: filters.familyRooms,
                    bestForTags: filters.bestForTags,
                    minPrice: filters.minPrice,
                    maxPrice: filters.maxPrice,
                  }}
                  onFilterChange={handleHajjUmrahFilterChange}
                />

                <hr className="filter-section-divider" />

                {/* Advanced Filters */}
                <AdvancedFilters
                  filters={{
                    facilities: filters.facilities,
                    roomFacilities: filters.roomFacilities,
                    proximityLandmark: filters.proximityLandmark,
                    proximityDistance: filters.proximityDistance,
                    surroundings: filters.surroundings,
                    airportMaxDistance: filters.airportMaxDistance,
                  }}
                  onFilterChange={handleAdvancedFilterChange}
                />
              </div>
            )}

            {/* Main Content */}
            <div className="main-content">
              {/* Loading State */}
              {loading && (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Finding the best stays for you...</p>
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="error-container">
                  <p>{error}</p>
                </div>
              )}

              {/* Results */}
              {!loading && !error && (
                <>
                  {viewMode === 'list' ? (
                    <>
                      {hotels.length === 0 ? (
                        <div className="no-results">
                          <h3>No hotels found</h3>
                          <p>Try adjusting your filters or search criteria</p>
                        </div>
                      ) : (
                        <div className="hotels-grid">
                          {hotelCards.map((hotel) => (
                            <HotelCard key={hotel.id} hotel={hotel} nights={nights} />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="map-view-container">
                      <HotelMapView
                        hotels={hotelCards}
                        selectedHotelId={selectedHotelId}
                        onHotelSelect={setSelectedHotelId}
                      />
                    </div>
                  )}

                  {/* Pagination */}
                  {viewMode === 'list' && hotels.length > 0 && totalPages > 1 && (
                    <div className="pagination">
                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        type="button"
                      >
                        <i className="ri-arrow-left-s-line"></i>
                      </button>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                            onClick={() => setCurrentPage(pageNum)}
                            type="button"
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        className="pagination-btn"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        type="button"
                      >
                        <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingCardContent;
