'use client';

export interface SectionSkeletonProps {
  /** Number of KPI cards to show in the skeleton (default: 3) */
  kpiCount?: number;
  /** Whether to show a chart placeholder (default: true) */
  showChart?: boolean;
}

export default function SectionSkeleton({
  kpiCount = 3,
  showChart = true,
}: SectionSkeletonProps) {
  return (
    <div className="animate-pulse space-y-4">
      {/* Section title skeleton */}
      <div className="h-6 bg-gray-200 rounded w-48" />

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: kpiCount }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>

      {/* Chart placeholder skeleton */}
      {showChart && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          <div className="h-64 bg-gray-100 rounded" />
        </div>
      )}
    </div>
  );
}
