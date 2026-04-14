'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setDetail } from '@/store/slices/usersSlice';
import { usersService } from '@/services/usersService';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);
  const dispatch = useAppDispatch();
  const { detail, isLoading, error } = useAppSelector((state) => state.users);

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Load user detail on mount
  useEffect(() => {
    loadUserDetail();
  }, [userId]);

  const loadUserDetail = async () => {
    dispatch(setLoading(true));

    try {
      const response = await usersService.getUserDetail(userId);

      if (response.success) {
        dispatch(setDetail(response.data));
      } else {
        dispatch(setError(response.error || 'Failed to load user'));
      }
    } catch (err) {
      dispatch(setError('An error occurred while loading user'));
      console.error('Load user detail error:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSuspend = async () => {
    if (!suspendReason.trim()) {
      setActionError('Please provide a reason for suspension');
      return;
    }

    setActionLoading(true);
    setActionError('');

    try {
      const response = await usersService.suspendUser(userId, suspendReason);

      if (response.success) {
        dispatch(setDetail(response.data));
        setShowSuspendModal(false);
        setSuspendReason('');
      } else {
        setActionError(response.error || 'Failed to suspend user');
      }
    } catch (err) {
      setActionError('An error occurred while suspending user');
      console.error('Suspend user error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    setActionLoading(true);
    setActionError('');

    try {
      const response = await usersService.reactivateUser(userId);

      if (response.success) {
        dispatch(setDetail(response.data));
        setShowReactivateModal(false);
      } else {
        setActionError(response.error || 'Failed to reactivate user');
      }
    } catch (err) {
      setActionError('An error occurred while reactivating user');
      console.error('Reactivate user error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setActionLoading(true);
    setActionError('');

    try {
      const response = await usersService.resetPassword(userId);

      if (response.success) {
        setActionError('');
        alert('Password reset email sent successfully');
      } else {
        setActionError(response.error || 'Failed to reset password');
      }
    } catch (err) {
      setActionError('An error occurred while resetting password');
      console.error('Reset password error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error || 'User not found'}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-indigo-600 hover:text-indigo-700 mb-2"
          >
            ← Back to Users
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{detail.name}</h1>
          <p className="mt-2 text-gray-600">{detail.email}</p>
        </div>

        {/* Status Badge */}
        <div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              detail.status === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : detail.status === 'SUSPENDED'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {detail.status}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{actionError}</p>
        </div>
      )}

      {/* User Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Email</label>
              <p className="text-gray-900">{detail.email}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Full Name</label>
              <p className="text-gray-900">{detail.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="text-gray-900">{detail.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Address</label>
              <p className="text-gray-900">{detail.address || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Role</label>
              <p className="text-gray-900">{detail.role}</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">Registered At</label>
              <p className="text-gray-900">{new Date(detail.registered_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Last Login</label>
              <p className="text-gray-900">
                {detail.last_login_at ? new Date(detail.last_login_at).toLocaleDateString() : 'Never'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Total Bookings</label>
              <p className="text-gray-900">{detail.bookings?.total || 0}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Total Spent</label>
              <p className="text-gray-900">${Number(detail.transactions?.totalSpent || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {detail.status === 'ACTIVE' ? (
            <button
              onClick={() => setShowSuspendModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Suspend User
            </button>
          ) : (
            <button
              onClick={() => setShowReactivateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Reactivate User
            </button>
          )}

          <button
            onClick={handleResetPassword}
            disabled={actionLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Reset Password
          </button>
        </div>
      </div>

      {/* Bookings */}
      {detail.bookings && detail.bookings.recent && detail.bookings.recent.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {detail.bookings.recent.map((booking: any) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{booking.booking_reference}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{booking.service_type}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">${Number(booking.total_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{new Date(booking.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspend User</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to suspend this user? Please provide a reason.</p>

            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Reason for suspension..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              rows={4}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Suspending...' : 'Suspend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactivate Modal */}
      {showReactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reactivate User</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to reactivate this user?</p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReactivateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReactivate}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Reactivating...' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
