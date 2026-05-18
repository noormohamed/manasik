'use client';

import { formatGBP } from '@/utils/formatCurrency';

export interface KPICardProps {
  /** The label displayed below the metric value */
  label: string;
  /** The numeric value to display */
  value: number;
  /** If true, format the value as GBP currency */
  isCurrency?: boolean;
  /** Optional suffix appended to the value (e.g. '%', ' days', ' nights') */
  suffix?: string;
  /** Optional trend percentage. Positive = green ↑, negative = red ↓ */
  trend?: number;
  /** Number of decimal places for non-currency values (default: 1) */
  decimals?: number;
  /** Show a loading skeleton instead of the value */
  loading?: boolean;
  /** Optional subtitle text shown in light grey below the value */
  subtitle?: string;
}

export default function KPICard({
  label,
  value,
  isCurrency = false,
  suffix = '',
  trend,
  decimals = 1,
  loading = false,
  subtitle,
}: KPICardProps) {
  const formattedValue = isCurrency
    ? formatGBP(value)
    : `${Number.isInteger(value) ? value.toLocaleString('en-GB') : value.toFixed(decimals)}${suffix}`;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{formattedValue}</p>
      {trend !== undefined && (
        <div className="mt-2 flex items-center text-sm">
          {trend > 0 ? (
            <span className="text-green-600 flex items-center">
              <span className="mr-1">↑</span>
              {Math.abs(trend).toFixed(1)}%
            </span>
          ) : trend < 0 ? (
            <span className="text-red-600 flex items-center">
              <span className="mr-1">↓</span>
              {Math.abs(trend).toFixed(1)}%
            </span>
          ) : (
            <span className="text-gray-500">0.0%</span>
          )}
          <span className="ml-1 text-gray-400">vs prev. period</span>
        </div>
      )}
      {subtitle && (
        <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
      )}
    </div>
  );
}
