'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import KPICard from './KPICard';
import { formatGBP } from '@/utils/formatCurrency';
import type { UserMetrics } from '@/types/analytics';

interface UsersAgentsSectionProps {
  data: UserMetrics;
}

export default function UsersAgentsSection({ data }: UsersAgentsSectionProps) {
  if (!data) return null;

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Users & Agents</h2>

      {/* KPI Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard label="Total Users" value={data.totalCount} />
      </div>

      {/* Top 10 Agents by Revenue - Horizontal Bar Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Top 10 Agents by Revenue
        </h3>
        {(data.topAgents ?? []).length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            No agent data available
          </p>
        ) : (
          <ResponsiveContainer
            width="100%"
            height={Math.max(300, (data.topAgents ?? []).length * 40)}
          >
            <BarChart
              data={data.topAgents ?? []}
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
                dataKey="agentName"
                tick={{ fontSize: 12 }}
                width={110}
              />
              <Tooltip
                formatter={(val: number) => [formatGBP(val), 'Revenue']}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#6366f1"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
