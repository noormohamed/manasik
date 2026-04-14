'use client';

import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        {user && (
          <p className="text-gray-600">
            Welcome, <span className="font-semibold text-gray-900">{user.fullName}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900">-</p>
          <p className="text-gray-600 text-xs mt-2">Will be implemented in Phase 3.2</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Bookings</h3>
          <p className="text-3xl font-bold text-gray-900">-</p>
          <p className="text-gray-600 text-xs mt-2">Will be implemented in Phase 3.2</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Reviews</h3>
          <p className="text-3xl font-bold text-gray-900">-</p>
          <p className="text-gray-600 text-xs mt-2">Will be implemented in Phase 3.2</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">-</p>
          <p className="text-gray-600 text-xs mt-2">Will be implemented in Phase 3.2</p>
        </div>
      </div>
    </div>
  );
}
