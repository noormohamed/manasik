'use client';

import { useState, useEffect, useMemo } from 'react';
import { hotelsService, Hotel } from '@/services/hotelsService';
import { DataTable, Column } from '@/components/DataTable';
import HotelDetailModal from '@/components/Hotels/HotelDetailModal';
import HotelTransactionChart from '@/components/Hotels/HotelTransactionChart';

export default function HotelsPage() {
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 100, total: 0 });
  const [filters, setFilters] = useState({ search: '', city: '', country: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [cities, setCities] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [revenueRange, setRevenueRange] = useState<[number, number]>([0, 100000]);
  const [maxRevenue, setMaxRevenue] = useState(100000);
  const [hideZeroRevenue, setHideZeroRevenue] = useState(false);

  // Modal state
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'overview' | 'rooms' | 'bookings' | 'reviews' | 'transactions' | 'amenities'>('overview');

  // Pagination for each list
  const [enabledPage, setEnabledPage] = useState(1);
  const [disabledPage, setDisabledPage] = useState(1);
  const pageSize = 15;

  // Split hotels into enabled and disabled, filtered by revenue
  const filteredHotels = useMemo(() => {
    return allHotels.filter((h) => {
      const rev = Number(h.totalRevenue || 0);
      if (hideZeroRevenue && rev === 0) return false;
      return rev >= revenueRange[0] && rev <= revenueRange[1];
    });
  }, [allHotels, revenueRange, hideZeroRevenue]);

  const enabledHotels = useMemo(() => filteredHotels.filter((h) => h.status === 'ACTIVE'), [filteredHotels]);
  const disabledHotels = useMemo(() => filteredHotels.filter((h) => h.status !== 'ACTIVE'), [filteredHotels]);

  const enabledPaged = useMemo(() => enabledHotels.slice((enabledPage - 1) * pageSize, enabledPage * pageSize), [enabledHotels, enabledPage]);
  const disabledPaged = useMemo(() => disabledHotels.slice((disabledPage - 1) * pageSize, disabledPage * pageSize), [disabledHotels, disabledPage]);

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
            <svg key={i} className={`w-4 h-4 ${i < value ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
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
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'ACTIVE' ? 'bg-green-100 text-green-800' :
          value === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>{value}</span>
      ),
    },
    { key: 'totalRooms', label: 'Rooms', sortable: true, width: '80px' },
    { key: 'totalBookings', label: 'Bookings', sortable: true, width: '100px' },
    {
      key: 'totalRevenue',
      label: 'Revenue',
      sortable: true,
      width: '120px',
      render: (value, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleRevenueClick(row); }}
          className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
        >
          £{Number(value).toFixed(2)}
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
    { key: 'companyName', label: 'Company', sortable: true },
  ];

  useEffect(() => { loadHotels(); }, [filters]);
  useEffect(() => { loadFilterOptions(); }, []);

  const loadHotels = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await hotelsService.getHotels({
        page: 1, limit: 500,
        search: filters.search || undefined,
        city: filters.city || undefined,
        country: filters.country || undefined,
      });
      if (response.success) {
        setAllHotels(response.data);
        setPagination({ page: 1, limit: 500, total: response.pagination.total });
        const max = Math.max(...response.data.map((h: Hotel) => Number(h.totalRevenue || 0)), 0);
        const roundedMax = Math.ceil(max / 1000) * 1000 || 100000;
        setMaxRevenue(roundedMax);
        setRevenueRange([0, roundedMax]);
      } else {
        setError(response.error || 'Failed to load hotels');
      }
    } catch (err) {
      setError('An error occurred while loading hotels');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFilterOptions = async () => {
    try {
      const [citiesRes, countriesRes] = await Promise.all([hotelsService.getCities(), hotelsService.getCountries()]);
      if (citiesRes.success) setCities(citiesRes.data);
      if (countriesRes.success) setCountries(countriesRes.data);
    } catch (err) { console.error(err); }
  };

  const handleRowClick = (hotel: Hotel) => { setModalInitialTab('overview'); setSelectedHotelId(hotel.id); setIsModalOpen(true); };
  const handleRevenueClick = (hotel: Hotel) => { setModalInitialTab('transactions'); setSelectedHotelId(hotel.id); setIsModalOpen(true); };
  const handleModalClose = () => { setIsModalOpen(false); setSelectedHotelId(null); };
  const handleStatusChange = () => { loadHotels(); };

  return (
    <div className="space-y-6 min-w-0 overflow-hidden">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Hotels Management</h1>
        <p className="mt-2 text-gray-600">View and manage all hotels on the platform</p>
      </div>

      <HotelTransactionChart />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Hotel name or company..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Cities</option>
              {cities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <select value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Countries</option>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revenue: £{revenueRange[0].toLocaleString()} — £{revenueRange[1].toLocaleString()}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={maxRevenue}
                step={Math.max(100, Math.floor(maxRevenue / 100))}
                value={revenueRange[0]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRevenueRange([Math.min(val, revenueRange[1]), revenueRange[1]]);
                }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <input
                type="range"
                min={0}
                max={maxRevenue}
                step={Math.max(100, Math.floor(maxRevenue / 100))}
                value={revenueRange[1]}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRevenueRange([revenueRange[0], Math.max(val, revenueRange[0])]);
                }}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideZeroRevenue}
                onChange={(e) => setHideZeroRevenue(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-600">Hide £0 revenue hotels</span>
            </label>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Enabled Hotels */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            Active Hotels
            <span className="text-sm font-normal text-gray-500">({enabledHotels.length})</span>
          </h2>
        </div>
        <div className="p-4 overflow-x-auto">
          <DataTable
            columns={columns}
            data={enabledPaged}
            loading={isLoading}
            pagination={{
              page: enabledPage,
              limit: pageSize,
              total: enabledHotels.length,
              onPageChange: (p) => setEnabledPage(p),
              onLimitChange: () => {},
            }}
            onRowClick={handleRowClick}
            searchable={false}
            filterable={false}
          />
        </div>
      </div>

      {/* Disabled Hotels */}
      {disabledHotels.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span>
              Inactive / Suspended Hotels
              <span className="text-sm font-normal text-gray-500">({disabledHotels.length})</span>
            </h2>
          </div>
          <div className="p-4 overflow-x-auto">
            <DataTable
              columns={columns}
              data={disabledPaged}
              loading={isLoading}
              pagination={{
                page: disabledPage,
                limit: pageSize,
                total: disabledHotels.length,
                onPageChange: (p) => setDisabledPage(p),
                onLimitChange: () => {},
              }}
              onRowClick={handleRowClick}
              searchable={false}
            filterable={false}
            />
          </div>
        </div>
      )}

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
