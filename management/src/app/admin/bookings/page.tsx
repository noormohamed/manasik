'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setList, setPagination, setFilters } from '@/store/slices/bookingsSlice';
import { bookingsService } from '@/services/bookingsService';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import { LoadingSpinner, ErrorMessage } from '@/components/Common';

// Helper to calculate time remaining for hold expiry
const getHoldTimeRemaining = (holdExpiresAt?: string) => {
  if (!holdExpiresAt) return null;
  const expiry = new Date(holdExpiresAt);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return { text: 'Expired', isExpired: true };
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { text: `${minutes}m ${seconds}s`, isExpired: false };
};

interface BookingRow {
  id: string;
  customerName: string;
  serviceType: string;
  serviceName: string;
  bookingDate: string;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  currency: string;
  bookingSource?: string;
  holdExpiresAt?: string;
  agentName?: string;
}

export default function BookingsPage() {
  const dispatch = useAppDispatch();
  const { list, isLoading, error, pagination, filters } = useAppSelector((state) => state.bookings);
  const [searchInput, setSearchInput] = useState('');
  const [, setTick] = useState(0); // For timer updates

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, filters.status, filters.serviceType, filters.bookingSource]);

  // Timer for updating hold expiry countdowns
  useEffect(() => {
    const hasPendingPayment = list.some(
      (b: any) => b.status === 'PENDING' && b.paymentStatus !== 'PAID' && b.holdExpiresAt
    );
    
    if (hasPendingPayment) {
      const interval = setInterval(() => {
        setTick((t) => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [list]);

  const fetchBookings = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await bookingsService.getBookings({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        serviceType: filters.serviceType || undefined,
        bookingSource: filters.bookingSource || undefined,
        dateRangeStart: filters.dateRange.from || undefined,
        dateRangeEnd: filters.dateRange.to || undefined,
        amountRangeMin: filters.amountRange.min || undefined,
        amountRangeMax: filters.amountRange.max || undefined,
      });

      if (response.success) {
        dispatch(setList(response.data));
        dispatch(
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          })
        );
      } else {
        dispatch(setError('Failed to fetch bookings'));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    dispatch(setFilters({ search: value }));
  };

  const handleStatusFilter = (status: string | null) => {
    dispatch(setFilters({ status }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleServiceTypeFilter = (serviceType: string | null) => {
    dispatch(setFilters({ serviceType }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleBookingSourceFilter = (bookingSource: string | null) => {
    dispatch(setFilters({ bookingSource }));
    dispatch(setPagination({ page: 1 }));
  };

  // Count broker bookings pending payment
  const brokerPendingPayment = list.filter(
    (b: any) => b.bookingSource === 'AGENT' && b.status === 'PENDING' && b.paymentStatus !== 'PAID'
  ).length;

  const columns: Column<BookingRow>[] = [
    { key: 'id', label: 'Booking ID', sortable: true },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'serviceType', label: 'Service Type', sortable: true },
    { key: 'serviceName', label: 'Service Name', sortable: true },
    { 
      key: 'bookingDate', 
      label: 'Booking Date', 
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: 'Status', 
      sortable: true,
      render: (value, row) => {
        const isPendingPayment = row.status === 'PENDING' && row.paymentStatus !== 'PAID';
        const holdTime = isPendingPayment ? getHoldTimeRemaining(row.holdExpiresAt) : null;

        return (
          <div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                row.status === 'COMPLETED'
                  ? 'bg-green-100 text-green-800'
                  : row.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : row.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : row.status === 'COMPLETED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isPendingPayment ? 'Pending Payment' : row.status}
            </span>
            {holdTime && (
              <div
                className={`text-xs mt-1 flex items-center gap-1 ${
                  holdTime.isExpired ? 'text-red-600' : 'text-orange-600'
                }`}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {holdTime.isExpired ? 'Hold Expired' : `Hold: ${holdTime.text}`}
              </div>
            )}
          </div>
        );
      }
    },
    { 
      key: 'paymentStatus', 
      label: 'Payment', 
      sortable: true,
      render: (value) => {
        const status = value || 'PENDING';
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              status === 'PAID'
                ? 'bg-green-100 text-green-800'
                : status === 'REFUNDED'
                ? 'bg-purple-100 text-purple-800'
                : status === 'FAILED'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status}
          </span>
        );
      }
    },
    { 
      key: 'totalAmount', 
      label: 'Amount', 
      sortable: true,
      render: (value, row) => `${row.currency} ${Number(value).toFixed(2)}`
    },
    { 
      key: 'bookingSource', 
      label: 'Source', 
      sortable: true,
      render: (value, row) => {
        const source = value || 'DIRECT';
        const sourceConfig: Record<string, { label: string; icon: string; className: string }> = {
          AGENT: { label: 'Broker', icon: '🧑‍💼', className: 'bg-purple-100 text-purple-800' },
          ADMIN: { label: 'Admin', icon: '👤', className: 'bg-blue-100 text-blue-800' },
          API: { label: 'API', icon: '🔌', className: 'bg-orange-100 text-orange-800' },
          DIRECT: { label: 'Direct', icon: '🌐', className: 'bg-gray-100 text-gray-800' },
        };
        const config = sourceConfig[source] || sourceConfig.DIRECT;

        return (
          <div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
              {config.icon} {config.label}
            </span>
            {row.agentName && source === 'AGENT' && (
              <div className="text-xs text-gray-500 mt-1">{row.agentName}</div>
            )}
          </div>
        );
      }
    },
  ];

  if (isLoading && list.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
        {brokerPendingPayment > 0 && (
          <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{brokerPendingPayment} broker booking(s) awaiting payment</span>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusFilter(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <select
              value={filters.serviceType || ''}
              onChange={(e) => handleServiceTypeFilter(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Services</option>
              <option value="HOTEL">Hotel</option>
              <option value="TAXI">Taxi</option>
              <option value="EXPERIENCE">Experience</option>
              <option value="CAR">Car</option>
              <option value="FOOD">Food</option>
            </select>
            <select
              value={filters.bookingSource || ''}
              onChange={(e) => handleBookingSourceFilter(e.target.value || null)}
              className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                filters.bookingSource === 'AGENT'
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-300'
              }`}
            >
              <option value="">All Sources</option>
              <option value="DIRECT">🌐 Direct (Customer)</option>
              <option value="AGENT">🧑‍💼 Broker Bookings</option>
              <option value="ADMIN">👤 Admin</option>
              <option value="API">🔌 API</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={list as BookingRow[]}
            loading={isLoading}
            pagination={{
              page: pagination.page,
              limit: pagination.limit,
              total: pagination.total,
              onPageChange: (page) => dispatch(setPagination({ page })),
              onLimitChange: (limit) => dispatch(setPagination({ limit, page: 1 })),
            }}
            onRowClick={(row) => {
              window.location.href = `/admin/bookings/${row.id}`;
            }}
            searchable={false}
          />
        </div>
      </div>
    </div>
  );
}
