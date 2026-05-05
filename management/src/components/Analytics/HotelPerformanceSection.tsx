'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import KPICard from './KPICard';
import type { HotelMetrics } from '@/types/analytics';

interface HotelPerformanceSectionProps {
  data: HotelMetrics;
}

export default function HotelPerformanceSection({
  data,
}: HotelPerformanceSectionProps) {
  if (!data) return null;

  const top10 = (data.performance ?? []).slice(0, 10);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Hotel Performance
      </h2>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Hotels with Zero Bookings"
          value={data.zeroBookingCount}
        />
      </div>

      {/* Top 10 Hotels Bar Chart with Rating Overlay */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Top 10 Hotels by Booking Count
        </h3>
        <ResponsiveContainer
          width="100%"
          height={Math.max(300, top10.length * 50)}
        >
          <BarChart
            data={top10}
            layout="vertical"
            margin={{ left: 120 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              xAxisId="bookings"
              tick={{ fontSize: 12 }}
              orientation="bottom"
            />
            <XAxis
              type="number"
              xAxisId="rating"
              orientation="top"
              domain={[0, 5]}
              tick={{ fontSize: 12 }}
              tickFormatter={(val: number) => `${val}★`}
              hide
            />
            <YAxis
              type="category"
              dataKey="hotelName"
              tick={{ fontSize: 12 }}
              width={110}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === 'Avg Rating') return [`${value.toFixed(1)}★`, name];
                return [value, name];
              }}
            />
            <Legend />
            <Bar
              xAxisId="bookings"
              dataKey="totalBookings"
              name="Bookings"
              fill="#6366f1"
              radius={[0, 4, 4, 0]}
            />
            <Bar
              xAxisId="rating"
              dataKey="averageRating"
              name="Avg Rating"
              fill="#f59e0b"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
