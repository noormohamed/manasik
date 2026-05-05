'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import KPICard from './KPICard';
import { formatGBP } from '@/utils/formatCurrency';
import type { RevenueMetrics } from '@/types/analytics';

interface RevenueSectionProps {
  data: RevenueMetrics;
}

const SOURCE_COLORS: Record<string, string> = {
  DIRECT: '#6366f1',    // indigo
  BROKER: '#f59e0b',    // amber
  STAFF_CREATED: '#10b981', // emerald
};

const DEFAULT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function RevenueSection({ data }: RevenueSectionProps) {
  if (!data) return null;

  const pieData = (data.bySource ?? []).map((s) => ({
    name: s.source,
    value: s.revenue,
  }));

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Revenue</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{formatGBP(data.total)}</p>
          {data.trend !== 0 && (
            <p className={`text-xs mt-1 ${data.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {data.trend > 0 ? '↑' : '↓'} {Math.abs(data.trend).toFixed(1)}% vs prev. period
            </p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Manasik Fee: {formatGBP(data.totalManasikFees || 0)}
          </p>
        </div>
        <KPICard
          label="Average Booking Value"
          value={data.average}
          isCurrency
        />
        <KPICard
          label="Broker Fees"
          value={data.brokerFees}
          isCurrency
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Revenue Line Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Daily Revenue
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.daily ?? []}>
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
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(val: number) => formatGBP(val)}
              />
              <Tooltip
                formatter={(val: number) => [formatGBP(val), 'Revenue']}
                labelFormatter={(label: string) =>
                  new Date(label).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                }
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Source Pie/Donut Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Revenue by Source
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      SOURCE_COLORS[entry.name] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => formatGBP(val)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top 10 Hotels by Revenue - Horizontal Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Top 10 Hotels by Revenue
        </h3>
        <ResponsiveContainer width="100%" height={Math.max(300, (data.byHotel ?? []).length * 40)}>
          <BarChart
            data={data.byHotel ?? []}
            layout="vertical"
            margin={{ left: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              tickFormatter={(val: number) => formatGBP(val)}
            />
            <YAxis
              type="category"
              dataKey="hotelName"
              tick={{ fontSize: 12 }}
              width={110}
            />
            <Tooltip formatter={(val: number) => [formatGBP(val), 'Revenue']} />
            <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
