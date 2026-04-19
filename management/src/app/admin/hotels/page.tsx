'use client';

import { useState, useEffect } from 'react';
import { hotelsService, Hotel } from '@/services/hotelsService';
import { DataTable, Column } from '@/components/DataTable';
import HotelDetailModal from '@/components/Hotels/HotelDetailModal';
import HotelTransactionChart from '@/components/Hotels/HotelTransactionChart';

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: '',
    country: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  
  // Modal state
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'rooms' | 'bookings' | 'reviews' | 'transactions' | 'amenities'>('overview');

  const columns: Column<Hotel>[] = [
    { 
      key: 'name', 
      label: 'Hotel Name', 
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{row.city}, {row.country}</p>
          </div>
        </div>
      ),
    },
    { 
      key: 'starRating', 
      label: 'Stars', 
      sortable: true, 
      width: '100px',
      render: (value) => (
        <div className="flex items-center">
          {Array.from({ length: 5 }, (_, i) => (
            <svg
              key={i}
              className={`w-4 h-4 ${i < value ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : value === 'SUSPENDED'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    { 
      key: 'totalRooms', 
      label: 'Rooms', 
      sortable: true, 
      width: '80px',
    },
    { 
      key: 'totalBookings', 
      label: 'Bookings', 
      sortable: true, 
      width: '100px',
    },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      sortable: true,
      width: '120px',
      render: (value, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRevenueClick(row);
          }}
          className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
        >
          ${Number(value).toFixed(2)}
        </button>
      ),
    },
    {
      key: 'averageRating',
      label: 'Rating',
      sortable: true,
      width: '100px',
      render: (value, row) => (
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span>{Number(value).toFixed(1)}</span>
          <span className="text-gray-400 text-xs">({row.totalReviews})</span>
        </div>
      ),
    },
    { 
      key: 'companyName', 
      label: 'Company', 
      sortable: true,
    },
  ];

  // Load hotels on mount and when filters change
  useEffect(() => {
    loadHotels();
  }, [pagination.page, pagination.limit, filters]);

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadHotels = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await hotelsService.getHotels({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        city: filters.city || undefined,
        country: filters.country || undefined,
      });

      if (response.success) {
        setHotels(response.data);
        setPagination({
          page: response.pagination.page,
          limit: response.pagination.limit,
          total: response.pagination.total,
        });
      } else {
        setError(response.error || 'Failed to load hotels');
      }
    } catch (err) {
      setError('An error occurred while loading hotels');
      console.error('Load hotels error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [citiesResponse, countriesResponse] = await Promise.all([
        hotelsService.getCities(),
        hotelsService.getCountries(),
      ]);

      if (citiesResponse.success) {
        setCities(citiesResponse.data);
      }
      if (countriesResponse.success) {
        setCountries(countriesResponse.data);
      }
    } catch (err) {
      console.error('Load filter options error:', err);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters({ ...filters, search: searchTerm });
    setPagination({ ...pagination, page: 1 });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({ ...filters, status: status || '' });
    setPagination({ ...pagination, page: 1 });
  };

  const handleCityFilter = (city: string) => {
    setFilters({ ...filters, city: city || '' });
    setPagination({ ...pagination, page: 1 });
  };

  const handleCountryFilter = (country: string) => {
    setFilters({ ...filters, country: country || '' });
    setPagination({ ...pagination, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handleLimitChange = (limit: number) => {
    setPagination({ ...pagination, page: 1, limit });
  };

  const handleRowClick = (hotel: Hotel) => {
    setModalInitialTab('overview');
    setSelectedHotelId(hotel.id);
    setIsModalOpen(true);
  };

  const handleRevenueClick = (hotel: Hotel) => {
    setModalInitialTab('transactions');
    setSelectedHotelId(hotel.id);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedHotelId(null);
  };

  const handleStatusChange = () => {
    // Reload hotels when status is changed in modal
    loadHotels();
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    console.log(`Export as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hotels Management</h1>
          <p className="mt-2 text-gray-600">View and manage all hotels on the platform</p>
        </div>
      </div>

      {/* Transaction Charts */}
      <HotelTransactionChart />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Hotel name or company..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select
              value={filters.city}
              onChange={(e) => handleCityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select
              value={filters.country}
              onChange={(e) => handleCountryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={hotels}
          loading={isLoading}
          error={error}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }}
          onRowClick={handleRowClick}
          onExport={handleExport}
          searchable={false}
          filterable={true}
        />
      </div>

      {/* Hotel Detail Modal */}
      <HotelDetailModal
        hotelId={selectedHotelId}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onStatusChange={handleStatusChange}
        initialTab={modalInitialTab}
      />
    </div>
  );
}
