'use client';

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import KPICard from './KPICard';
import type { ReviewMetrics } from '@/types/analytics';

interface RatingDistributionSectionProps {
  data: ReviewMetrics;
}

const RATING_COLORS: Record<number, string> = {
  1: '#ef4444', // red
  2: '#f59e0b', // amber
  3: '#eab308', // yellow
  4: '#22c55e', // green
  5: '#10b981', // emerald
};

export default function RatingDistributionSection({
  data,
}: RatingDistributionSectionProps) {
  if (!data) return null;

  const distribution = data.ratingDistribution ?? {};
  const chartData = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating}★`,
    count: distribution[rating] ?? 0,
    fill: RATING_COLORS[rating],
  }));

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Rating Distribution
      </h2>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Platform Average Rating"
          value={data.averageRating}
          suffix="★"
        />
      </div>

      {/* Rating Distribution Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Reviews by Rating
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(val: number) => [val, 'Reviews']}
            />
            <Bar dataKey="count" name="Reviews" radius={[4, 4, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.rating} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
