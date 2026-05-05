'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import KPICard from './KPICard';
import type { BookingMetrics } from '@/types/analytics';

interface BookingsSectionProps {
  data: BookingMetrics;
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: '#10b981',  // green
  COMPLETED: '#6366f1',  // indigo
  EXPIRED: '#ef4444',    // red
  CANCELLED: '#f59e0b',  // amber
  PENDING: '#8b5cf6',    // violet
};

const SOURCE_COLORS: Record<string, string> = {
  DIRECT: '#6366f1',
  BROKER: '#f59e0b',
  STAFF_CREATED: '#10b981',
};

const DEFAULT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function BookingsSection({ data }: BookingsSectionProps) {
  if (!data) return null;

  const statusPieData = Object.entries(data.byStatus ?? {}).map(([status, count]) => ({
    name: status,
    value: count,
  }));

  const sourceBarData = Object.entries(data.bySource ?? {}).map(([source, count]) => ({
    name: source,
    count,
  }));

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Bookings</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total Bookings" value={data.total} />
        <KPICard
          label="Conversion Rate"
          value={data.conversionRate}
          suffix="%"
        />
        <KPICard
          label="Avg Stay Duration"
          value={data.averageStayDuration}
          suffix=" nights"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Booking Volume - Stacked Area Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Daily Booking Volume
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.dailyVolume ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(val: string) =>
                  new Date(val).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })
                }
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                }
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="confirmed"
                stackId="1"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
                name="Confirmed"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.6}
                name="Completed"
              />
              <Area
                type="monotone"
                dataKey="expired"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.6}
                name="Expired"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Booking Status Breakdown - Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Booking Status Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {statusPieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      STATUS_COLORS[entry.name] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings by Source - Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Bookings by Source
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sourceBarData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" name="Bookings" radius={[4, 4, 0, 0]}>
              {sourceBarData.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={
                    SOURCE_COLORS[entry.name] ||
                    DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
