'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import KPICard from './KPICard';
import type { BookingMetrics } from '@/types/analytics';

interface OperationalSectionProps {
  data: BookingMetrics;
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PAID: '#10b981',      // green
  UNPAID: '#ef4444',    // red
  PENDING: '#f59e0b',   // amber
  FAILED: '#dc2626',    // red-600
  REFUNDED: '#8b5cf6',  // violet
};

const DEFAULT_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function OperationalSection({ data }: OperationalSectionProps) {
  if (!data) return null;

  const paymentPieData = Object.entries(data.byPaymentStatus ?? {}).map(
    ([status, count]) => ({
      name: status,
      value: count,
    })
  );

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Operational</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard
          label="Expired Booking Rate"
          value={data.expiredRate}
          suffix="%"
        />
        <KPICard
          label="Avg Lead Time"
          value={data.averageLeadTime}
          suffix=" days"
        />
      </div>

      {/* Payment Status Distribution - Pie Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Payment Status Distribution
        </h3>
        {paymentPieData.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No payment data available
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentPieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({
                  name,
                  percent,
                }: {
                  name: string;
                  percent: number;
                }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {paymentPieData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={
                      PAYMENT_STATUS_COLORS[entry.name] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
