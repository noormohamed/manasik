'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { bookingsService } from '@/services/bookingsService';
import DataTable, { Column } from '@/components/DataTable/DataTable';
import { LoadingSpinner, ErrorMessage } from '@/components/Common';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface BookingRow {
  id: string;
  bookingRef?: string;
  customerName: string;
  serviceType: string;
  serviceName: string;
  bookingDate: string;
  status: string;
  paymentStatus?: string;
  totalAmount: number;
  currency: string;
  bookingSource?: string;
  agentName?: string;
  hotelName?: string;
  hotelCity?: string;
  hotelCountry?: string;
  starRating?: number;
  checkInDate?: string;
  checkOutDate?: string;
  nights?: number;
  roomType?: string;
}

export default function BookingsPage() {
  const [confirmedBookings, setConfirmedBookings] = useState<BookingRow[]>([]);
  const [completedBookings, setCompletedBookings] = useState<BookingRow[]>([]);
  const [expiredBookings, setExpiredBookings] = useState<BookingRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const [confirmedPage, setConfirmedPage] = useState(1);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [completedPage, setCompletedPage] = useState(1);
  const [completedTotal, setCompletedTotal] = useState(0);
  const [expiredPage, setExpiredPage] = useState(1);
  const [expiredTotal, setExpiredTotal] = useState(0);
  const [showExpired, setShowExpired] = useState(false);
  const pageSize = 15;
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch all bookings for the chart (90 day window)
  const fetchChartData = useCallback(async () => {
    try {
      const res = await bookingsService.getBookings({ page: 1, limit: 200 });
      if (!res.success) return;

      const allBookings = res.data as BookingRow[];
      const now = new Date();
      const ninetyDaysAgo = new Date(now);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      // Find the earliest check-in date within the 90-day window
      const bookingDates = allBookings
        .map((b) => b.checkInDate ? new Date(b.checkInDate) : null)
        .filter((d): d is Date => d !== null && d >= ninetyDaysAgo && d <= now);

      // Determine chart start: earliest booking date or 30 days ago, whichever is earlier
      // Minimum 30 days, maximum 90 days
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      let chartStart: Date;
      if (bookingDates.length === 0) {
        chartStart = thirtyDaysAgo;
      } else {
        const earliestBooking = new Date(Math.min(...bookingDates.map((d) => d.getTime())));
        // Go back to at least 30 days, but no more than 90
        chartStart = earliestBooking < thirtyDaysAgo ? earliestBooking : thirtyDaysAgo;
        if (chartStart < ninetyDaysAgo) chartStart = ninetyDaysAgo;
      }

      // Build a map of date -> { confirmed, completed, expired }
      const dateMap: Record<string, { confirmed: number; completed: number; expired: number }> = {};

      // Pre-fill days from chartStart to now
      for (let d = new Date(chartStart); d <= now; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        dateMap[key] = { confirmed: 0, completed: 0, expired: 0 };
      }

      // Count bookings by their stay range — each booking counts for every day between check-in and check-out
      allBookings.forEach((b) => {
        if (!b.checkInDate || !b.checkOutDate) return;
        const checkIn = new Date(b.checkInDate);
        const checkOut = new Date(b.checkOutDate);
        
        for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
          const key = d.toISOString().split('T')[0];
          if (dateMap[key]) {
            if (b.status === 'CONFIRMED') dateMap[key].confirmed++;
            else if (b.status === 'COMPLETED') dateMap[key].completed++;
            else if (b.status === 'EXPIRED') dateMap[key].expired++;
          }
        }
      });

      // Convert to array sorted by date
      const data = Object.entries(dateMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, counts]) => ({
          date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          ...counts,
        }));

      setChartData(data);
    } catch (err) {
      // Chart is non-critical, don't block the page
    }
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const requests: Promise<any>[] = [
        bookingsService.getBookings({
          page: confirmedPage,
          limit: pageSize,
          status: 'CONFIRMED',
          search: searchInput || undefined,
        }),
        bookingsService.getBookings({
          page: completedPage,
          limit: pageSize,
          status: 'COMPLETED',
          search: searchInput || undefined,
        }),
      ];

      if (showExpired) {
        requests.push(
          bookingsService.getBookings({
            page: expiredPage,
            limit: pageSize,
            status: 'EXPIRED',
            search: searchInput || undefined,
          })
        );
      }

      const results = await Promise.all(requests);

      if (results[0].success) {
        setConfirmedBookings(results[0].data);
        setConfirmedTotal(results[0].pagination.total);
      }
      if (results[1].success) {
        setCompletedBookings(results[1].data);
        setCompletedTotal(results[1].pagination.total);
      }
      if (showExpired && results[2]?.success) {
        setExpiredBookings(results[2].data);
        setExpiredTotal(results[2].pagination.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [confirmedPage, completedPage, expiredPage, searchInput, showExpired]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const columns: Column<BookingRow>[] = [
    { 
      key: 'id', 
      label: 'Booking Ref', 
      sortable: true,
      render: (value, row) => (
        <span className="font-mono text-sm font-medium">{row.bookingRef || value}</span>
      ),
    },
    { key: 'customerName', label: 'Customer', sortable: true },
    {
      key: 'serviceName',
      label: 'Hotel',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium">{row.hotelName || value}</div>
          {row.hotelCity && (
            <div className="text-xs text-gray-500">{row.hotelCity}, {row.hotelCountry}</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
          CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
          COMPLETED: { label: 'Completed', className: 'bg-green-100 text-green-800' },
          EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-600' },
          PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
          CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
          REFUNDED: { label: 'Refunded', className: 'bg-purple-100 text-purple-800' },
        };
        const config = statusConfig[value] || { label: value, className: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: 'checkInDate',
      label: 'Check-in',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '—',
    },
    {
      key: 'checkOutDate',
      label: 'Check-out',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '—',
    },
    {
      key: 'nights',
      label: 'Nights',
      sortable: true,
      render: (value) => value || '—',
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
                : status === 'PARTIAL_REFUND'
                ? 'bg-purple-100 text-purple-800'
                : status === 'FULLY_REFUNDED'
                ? 'bg-purple-100 text-purple-800'
                : status === 'FAILED'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      render: (value, row) => `${row.currency} ${Number(value).toFixed(2)}`,
    },
    {
      key: 'bookingSource',
      label: 'Source',
      sortable: true,
      render: (value) => {
        const source = value || 'DIRECT';
        const sourceConfig: Record<string, { label: string; className: string }> = {
          BROKER: { label: 'Broker', className: 'bg-purple-100 text-purple-800' },
          AGENT: { label: 'Broker', className: 'bg-purple-100 text-purple-800' },
          STAFF_CREATED: { label: 'Staff', className: 'bg-blue-100 text-blue-800' },
          DIRECT: { label: 'Direct', className: 'bg-gray-100 text-gray-800' },
        };
        const config = sourceConfig[source] || sourceConfig.DIRECT;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
  ];

  if (isLoading && confirmedBookings.length === 0 && completedBookings.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-8 min-w-0 w-full overflow-hidden">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bookings Management</h1>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search by booking ID, customer, or hotel..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
            setConfirmedPage(1);
            setCompletedPage(1);
            setExpiredPage(1);
          }}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Bookings Chart - 90 Day Overview */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Active Bookings — Last {chartData.length} Days</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  interval={Math.max(1, Math.floor(chartData.length / 12))}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '13px', paddingTop: '8px' }}
                />
                <Line
                  type="monotone"
                  dataKey="confirmed"
                  name="Confirmed"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expired"
                  name="Expired"
                  stroke="#9ca3af"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Confirmed Bookings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
            Confirmed Bookings
            <span className="text-sm font-normal text-gray-500">({confirmedTotal})</span>
          </h2>
        </div>
        <div className="p-6 overflow-x-auto">
          <DataTable
            columns={columns}
            data={confirmedBookings}
            loading={isLoading}
            pagination={{
              page: confirmedPage,
              limit: pageSize,
              total: confirmedTotal,
              onPageChange: (page) => setConfirmedPage(page),
              onLimitChange: () => {},
            }}
            onRowClick={(row) => {
              window.location.href = `/admin/bookings/${row.id}`;
            }}
            searchable={false}
          />
        </div>
      </div>

      {/* Completed Bookings */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
            Completed Bookings
            <span className="text-sm font-normal text-gray-500">({completedTotal})</span>
          </h2>
        </div>
        <div className="p-6 overflow-x-auto">
          <DataTable
            columns={columns}
            data={completedBookings}
            loading={isLoading}
            pagination={{
              page: completedPage,
              limit: pageSize,
              total: completedTotal,
              onPageChange: (page) => setCompletedPage(page),
              onLimitChange: () => {},
            }}
            onRowClick={(row) => {
              window.location.href = `/admin/bookings/${row.id}`;
            }}
            searchable={false}
          />
        </div>
      </div>

      {/* Expired Bookings - Collapsible */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div
          className="px-6 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowExpired(!showExpired)}
        >
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-400 inline-block"></span>
            Expired Bookings
            <span className="text-sm font-normal text-gray-500">
              {showExpired ? `(${expiredTotal})` : '(click to show)'}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${showExpired ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Unpaid bookings past their check-in date
          </p>
        </div>
        {showExpired && (
          <div className="p-6 overflow-x-auto">
            <DataTable
              columns={columns}
              data={expiredBookings}
              loading={isLoading}
              pagination={{
                page: expiredPage,
                limit: pageSize,
                total: expiredTotal,
                onPageChange: (page) => setExpiredPage(page),
                onLimitChange: () => {},
              }}
              onRowClick={(row) => {
                window.location.href = `/admin/bookings/${row.id}`;
              }}
              searchable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}
