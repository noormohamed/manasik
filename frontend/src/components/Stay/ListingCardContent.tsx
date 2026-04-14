"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { apiClient } from "@/lib/api";
import FilterSidebar from "./FilterSidebar";

interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  country: string;
  starRating: number;
  averageRating: number;
  totalReviews: number;
  images: Array<{ url: string }>;
  rooms?: Array<{
    id: string;
    name: string;
    basePrice: number;
    currency: string;
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
  maxPrice?: number;
  facilities?: string[];
  roomFacilities?: string[];
  proximityLandmark?: string;
  proximityDistance?: number;
  surroundings?: string[];
  airportMaxDistance?: number;
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

  // Initialize filters from URL params ONCE
  useEffect(() => {
    const initialFilters: FilterParams = {};
    
    const location = searchParams.get('location');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const minRating = searchParams.get('minRating');
    const maxPrice = searchParams.get('maxPrice');
    const facilities = searchParams.get('facilities');
    const roomFacilities = searchParams.get('roomFacilities');
    const proximityLandmark = searchParams.get('proximityLandmark');
    const proximityDistance = searchParams.get('proximityDistance');
    const surroundings = searchParams.get('surroundings');
    const airportMaxDistance = searchParams.get('airportMaxDistance');

    if (location) initialFilters.location = location;
    if (city) initialFilters.city = city;
    if (country) initialFilters.country = country;
    if (checkIn) initialFilters.checkIn = checkIn;
    if (checkOut) initialFilters.checkOut = checkOut;
    if (guests) initialFilters.guests = parseInt(guests);
    if (minRating) initialFilters.minRating = parseFloat(minRating);
    if (maxPrice) initialFilters.maxPrice = parseFloat(maxPrice);
    if (facilities) initialFilters.facilities = facilities.split(',');
    if (roomFacilities) initialFilters.roomFacilities = roomFacilities.split(',');
    if (proximityLandmark) initialFilters.proximityLandmark = proximityLandmark;
    if (proximityDistance) initialFilters.proximityDistance = parseFloat(proximityDistance);
    if (surroundings) initialFilters.surroundings = surroundings.split(',');
    if (airportMaxDistance) initialFilters.airportMaxDistance = parseFloat(airportMaxDistance);

    console.log('[ListingCardContent] URL params changed, setting filters:', initialFilters);
    setFilters(initialFilters);
    setIsInitialized(true);
  }, [searchParams]);

  // Fetch hotels when filters or page changes, but only after initialization
  useEffect(() => {
    if (!isInitialized) {
      console.log('[ListingCardContent] Skipping fetch - not initialized yet');
      return;
    }
    console.log('[ListingCardContent] Filters or page changed, fetching hotels. Page:', currentPage, 'Filters:', filters);
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

      // Add filters to params
      if (filters.location) params.location = filters.location;
      if (filters.city) params.city = filters.city;
      if (filters.country) params.country = filters.country;
      if (filters.checkIn) params.checkIn = filters.checkIn;
      if (filters.checkOut) params.checkOut = filters.checkOut;
      if (filters.guests) params.guests = filters.guests;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.facilities?.length) params.facilities = filters.facilities.join(',');
      if (filters.roomFacilities?.length) params.roomFacilities = filters.roomFacilities.join(',');
      if (filters.proximityLandmark) params.proximityLandmark = filters.proximityLandmark;
      if (filters.proximityDistance) params.proximityDistance = filters.proximityDistance;
      if (filters.surroundings?.length) params.surroundings = filters.surroundings.join(',');
      if (filters.airportMaxDistance) params.airportMaxDistance = filters.airportMaxDistance;

      console.log('Fetching hotels with params:', params);
      const response = (await apiClient.get('/hotels', { params })) as {
        hotels?: Hotel[];
        pagination?: { totalPages: number; total: number };
      };
      console.log('API Response:', response);
      
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

  const handleFilterChange = (newFilters: FilterParams) => {
    console.log('[ListingCardContent] handleFilterChange called with:', newFilters);
    console.log('[ListingCardContent] Current filters:', filters);
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <li key={index}>
        <i className={index < rating ? "ri-star-fill" : "ri-star-line"}></i>
      </li>
    ));
  };

  const getMinPrice = (hotel: Hotel) => {
    if (!hotel.rooms || hotel.rooms.length === 0) return null;
    const minPrice = Math.min(...hotel.rooms.map(r => Number(r.basePrice)));
    const currency = hotel.rooms[0].currency;
    return { price: minPrice, currency };
  };

  const calculateNights = () => {
    if (!filters.checkIn || !filters.checkOut) return null;
    const checkIn = new Date(filters.checkIn);
    const checkOut = new Date(filters.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : null;
  };

  const getPriceDisplay = (hotel: Hotel) => {
    const priceInfo = getMinPrice(hotel);
    if (!priceInfo) return null;

    const nights = calculateNights();
    if (nights) {
      const totalPrice = Math.round(Number(priceInfo.price) * nights * 100) / 100;
      return {
        amount: Number(totalPrice).toFixed(2),
        perNight: Number(priceInfo.price).toFixed(2),
        label: `${nights} night${nights !== 1 ? 's' : ''}`,
        isTotal: true
      };
    }

    return {
      amount: Number(priceInfo.price).toFixed(2),
      perNight: null,
      label: 'per night',
      isTotal: false
    };
  };

  return (
    <>
      <style jsx>{`
        .filters-and-hotels-wrapper {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 50px;
          align-items: start;
          margin-top: 30px;
        }

        @media (max-width: 1200px) {
          .filters-and-hotels-wrapper {
            grid-template-columns: 240px 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 1024px) {
          .filters-and-hotels-wrapper {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .filters-and-hotels-wrapper {
            gap: 30px;
          }
        }

        .hotels-grid-wrapper {
          width: 100%;
        }

        .hotels-grid-wrapper .row {
          row-gap: 40px;
          margin-left: -12px;
          margin-right: -12px;
        }

        .hotels-grid-wrapper .col-xl-4,
        .hotels-grid-wrapper .col-md-6 {
          padding-left: 12px;
          padding-right: 12px;
        }

        .loading-container {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-container .spinner-border {
          width: 3rem;
          height: 3rem;
        }

        .loading-container p {
          margin-top: 12px;
          font-size: 16px;
          color: #666;
        }

        .error-alert {
          margin-bottom: 30px;
          padding: 16px 20px;
          border-left: 4px solid #dc3545;
        }

        .pagination-area {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .pagination-area button {
          min-width: 40px;
          height: 40px;
          padding: 0 8px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          font-weight: 500;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pagination-area button:hover:not(:disabled) {
          border-color: #ff621f;
          color: #ff621f;
        }

        .pagination-area button.current {
          background: #ff621f;
          color: white;
          border-color: #ff621f;
        }

        .pagination-area button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      
      <div className="most-popular-area mt-35">
        <div className="container">
          <div className="filters-and-hotels-wrapper">
            {/* Filter Sidebar - Always Visible */}
            <FilterSidebar
              filters={filters}
              totalResults={totalResults}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />

            {/* Hotels Grid Section */}
            <div className="hotels-grid-wrapper">
              {/* Loading State */}
              {loading && (
                <div className="loading-container">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3">Loading hotels...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="alert alert-danger error-alert" role="alert">
                  <i className="ri-error-warning-line me-2"></i>
                  {error}
                </div>
              )}

              {/* Hotels Grid */}
              {!loading && !error && (
                <div className="row">
                  {hotels.length === 0 ? (
                    <div className="col-12">
                      <div className="alert alert-info text-center" role="alert">
                        <i className="ri-information-line me-2"></i>
                        No hotels found. Try adjusting your search criteria.
                      </div>
                    </div>
                  ) : (
                    hotels.map((hotel) => {
                      const priceDisplay = getPriceDisplay(hotel);
                      const imageUrl = hotel.images && hotel.images.length > 0 
                        ? hotel.images[0].url 
                        : '/images/popular/popular-7.jpg';

                      return (
                        <div key={hotel.id} className="col-xl-4 col-md-6">
                          <div className="most-popular-single-item">
                            <div className="most-popular-single-img position-relative">
                              <Link href={`/stay-details/${hotel.id}`}>
                                <Image 
                                  src={imageUrl} 
                                  alt={hotel.name}
                                  width={400}
                                  height={300}
                                  style={{ objectFit: 'cover', width: '100%', height: '250px' }}
                                />
                              </Link>
                              <div className="most-popular-single-heart-discount d-flex justify-content-between align-items-center">
                                <button type="button" className="heart">
                                  <i className="flaticon-heart"></i>
                                </button>
                              </div>
                            </div>

                            <div className="most-popular-single-content">
                              <h3>
                                <Link href={`/stay-details/${hotel.id}`}>{hotel.name}</Link>
                              </h3>

                              <div className="d-flex align-items-center most-popular-single-location">
                                <i className="flaticon-location"></i>
                                <span>{hotel.city}, {hotel.country}</span>
                              </div>

                              <ul className="ps-0 pe-0 list-unstyled d-flex align-items-center most-popular-single-star">
                                {renderStars(hotel.starRating)}
                                <li>
                                  <span>({hotel.totalReviews > 0 ? `${hotel.totalReviews}` : '0'} Rating{hotel.totalReviews !== 1 ? 's' : ''})</span>
                                </li>
                              </ul>

                              <div className="d-flex align-items-center justify-content-between most-popular-single-price" style={{ fontSize: '13px' }}>
                                {priceDisplay ? (
                                  <>
                                    <p style={{ margin: 0 }}>
                                      <span className="title" style={{ fontSize: '14px' }}>from ${priceDisplay.amount}</span>
                                      <span style={{ fontWeight: 'normal', fontSize: '13px' }}> / night</span>
                                    </p>
                                  </>
                                ) : (
                                  <p style={{ margin: 0 }}>
                                    <span className="title" style={{ fontSize: '14px' }}>Contact for pricing</span>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              
              {/* Pagination */}
              {hotels.length > 0 && totalPages > 1 && (
                <div className="row">
                  <div className="col-lg-12">
                    <div className="pagination-area text-start">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="next page-numbers"
                      style={{ border: 'none', background: 'transparent', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_3719_2626)">
                          <path
                            d="M3.60973 7.0177L10.4279 0.199699C10.6941 -0.0665738 11.1259 -0.0665739 11.3921 0.199744C11.6584 0.466017 11.6584 0.897699 11.3921 1.16397L5.05605 7.49988L11.3921 13.8361C11.6584 14.1024 11.6584 14.5341 11.3921 14.8003C11.259 14.9335 11.0845 15 10.91 15C10.7355 15 10.561 14.9335 10.4279 14.8003L3.60973 7.98192C3.48182 7.85406 3.41 7.68065 3.41 7.49983C3.41 7.31902 3.48182 7.14556 3.60973 7.0177Z"
                            fill="#111827"
                          />
                        </g>
                      </svg>
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`page-numbers ${currentPage === pageNum ? 'current' : ''}`}
                          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="next page-numbers"
                      style={{ border: 'none', background: 'transparent', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                      >
                        <g clipPath="url(#clip0_3719_2622)">
                          <path
                            d="M11.3903 7.0177L4.57209 0.199699C4.30587 -0.0665738 3.87414 -0.0665739 3.60787 0.199744C3.34164 0.466017 3.34164 0.897699 3.60791 1.16397L9.94395 7.49988L3.60787 13.8361C3.34164 14.1024 3.34164 14.5341 3.60791 14.8003C3.741 14.9335 3.9155 15 4.09 15C4.2645 15 4.439 14.9335 4.57214 14.8003L11.3903 7.98192C11.5182 7.85406 11.59 7.68065 11.59 7.49983C11.59 7.31901 11.5182 7.14556 11.3903 7.0177Z"
                            fill="#111827"
                          />
                        </g>
                      </svg>
                    </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingCardContent;
