'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { hotelsService, TransactionStats } from '@/services/hotelsService';

function PercentBadge({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <span className="text-xs text-gray-400">No change</span>;
  if (previous === 0) return <span className="text-xs text-green-600 font-medium">↑ 100%</span>;
  const pct = ((current - previous) / previous) * 100;
  const isUp = pct >= 0;
  return (
    <span className={`text-xs font-medium ${isUp ? 'text-green-600' : 'text-red-600'}`}>
      {isUp ? '↑' : '↓'} {Math.abs(pct).toFixed(1)}% vs prev 30d
    </span>
  );
}

export default function HotelTransactionChart() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [prevStats, setPrevStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadStats();
  }, [period, days]);

  const loadStats = async () => {
    setLoading(true);
    setError('');

    try {
      const [currentRes, prevRes] = await Promise.all([
        hotelsService.getTransactionStats({ period, days: 30 }),
        hotelsService.getTransactionStats({ period, days: 60 }),
      ]);

      if (currentRes.success) {
        setStats(currentRes.data);
      }
      if (prevRes.success) {
        // The 60-day response includes both periods. We subtract the 30-day to get the previous 30.
        const prev60 = prevRes.data.summary;
        const cur30 = currentRes.data?.summary;
        if (cur30) {
          setPrevStats({
            ...prevRes.data,
            summary: {
              totalRevenue: prev60.totalRevenue - cur30.totalRevenue,
              totalBookings: prev60.totalBookings - cur30.totalBookings,
              averageBookingValue: prev60.totalBookings - cur30.totalBookings > 0
                ? (prev60.totalRevenue - cur30.totalRevenue) / (prev60.totalBookings - cur30.totalBookings)
                : 0,
              confirmedBookings: prev60.confirmedBookings - cur30.confirmedBookings,
              pendingBookings: prev60.pendingBookings - cur30.pendingBookings,
              cancelledBookings: prev60.cancelledBookings - cur30.cancelledBookings,
            },
          } as TransactionStats);
        }
      }
    } catch (err) {
      setError('An error occurred while loading statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    if (period === 'monthly') {
      const [year, month] = dateStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
    }
    if (period === 'weekly') {
      return `Week ${dateStr.split('-')[1]}`;
    }
    return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={loadStats} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Retry</button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const prev = prevStats?.summary || { totalRevenue: 0, totalBookings: 0, averageBookingValue: 0, confirmedBookings: 0, pendingBookings: 0, cancelledBookings: 0 };

  return (
    <div className="space-y-6">
      {/* Summary Cards - Last 30 days with % change vs previous 30 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-400 mb-1">Last 30 days</p>
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.summary.totalRevenue)}</p>
          <PercentBadge current={stats.summary.totalRevenue} previous={prev.totalRevenue} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-400 mb-1">Last 30 days</p>
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-2xl font-bold text-blue-600">{stats.summary.totalBookings}</p>
          <PercentBadge current={stats.summary.totalBookings} previous={prev.totalBookings} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-400 mb-1">Last 30 days</p>
          <p className="text-sm text-gray-500">Avg Booking Value</p>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.summary.averageBookingValue)}</p>
          <PercentBadge current={stats.summary.averageBookingValue} previous={prev.averageBookingValue} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-400 mb-1">Last 30 days</p>
          <p className="text-sm text-gray-500">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{stats.summary.confirmedBookings}</p>
          <PercentBadge current={stats.summary.confirmedBookings} previous={prev.confirmedBookings} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-400 mb-1">Last 30 days</p>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.summary.pendingBookings}</p>
          <PercentBadge current={stats.summary.pendingBookings} previous={prev.pendingBookings} />
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-xs text-gray-400 mb-1">Last 30 days</p>
          <p className="text-sm text-gray-500">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.summary.cancelledBookings}</p>
          <PercentBadge current={stats.summary.cancelledBookings} previous={prev.cancelledBookings} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Over Time</h3>
            <div className="flex gap-2">
              <select value={period} onChange={(e) => setPeriod(e.target.value as any)} className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
            </div>
          </div>
          {stats.revenueByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.revenueByDate}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <Tooltip formatter={(value: number, name: string) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Bookings']} labelFormatter={formatDate} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">No transaction data available</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Hotels by Revenue</h3>
          {stats.revenueByHotel.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.revenueByHotel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" tickFormatter={(v) => `${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                <YAxis type="category" dataKey="hotelName" tick={{ fontSize: 11 }} stroke="#9ca3af" width={120} tickFormatter={(v) => v.length > 15 ? `${v.substring(0, 15)}...` : v} />
                <Tooltip formatter={(value: number, name: string) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Bookings']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Legend />
                <Bar dataKey="revenue" fill="#6366f1" name="Revenue" radius={[0, 4, 4, 0]} />
                <Bar dataKey="bookings" fill="#10b981" name="Bookings" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">No hotel revenue data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
