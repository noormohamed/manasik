'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setList, setPagination, setFilters } from '@/store/slices/usersSlice';
import { usersService } from '@/services/usersService';
import { DataTable, Column } from '@/components/DataTable';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  registered_at: string;
  last_login_at?: string;
  booking_count: number;
  total_spent: number;
}

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { list, pagination, filters, isLoading, error } = useAppSelector((state) => state.users);

  const [localError, setLocalError] = useState('');

  const columns: Column<User>[] = [
    { key: 'id', label: 'ID', sortable: true, width: '80px' },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'role', label: 'Role', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            value === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : value === 'SUSPENDED'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value}
        </span>
      ),
    },
    { key: 'booking_count', label: 'Bookings', sortable: true, width: '100px' },
    {
      key: 'total_spent',
      label: 'Total Spent',
      sortable: true,
      render: (value) => `$${Number(value).toFixed(2)}`,
    },
  ];

  // Load users on mount and when filters change
  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit, filters]);

  const loadUsers = async () => {
    dispatch(setLoading(true));
    setLocalError('');

    try {
      const response = await usersService.getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        role: filters.role,
        status: filters.status,
      });

      if (response.success) {
        dispatch(setList(response.data));
        dispatch(
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
          })
        );
      } else {
        setLocalError(response.error || 'Failed to load users');
      }
    } catch (err) {
      setLocalError('An error occurred while loading users');
      console.error('Load users error:', err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (searchTerm: string) => {
    dispatch(setFilters({ ...filters, search: searchTerm }));
    dispatch(setPagination({ ...pagination, page: 1 }));
  };

  const handleRoleFilter = (role: string) => {
    dispatch(setFilters({ ...filters, role: role || undefined }));
    dispatch(setPagination({ ...pagination, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    dispatch(setFilters({ ...filters, status: status || undefined }));
    dispatch(setPagination({ ...pagination, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setPagination({ ...pagination, page }));
  };

  const handleLimitChange = (limit: number) => {
    dispatch(setPagination({ ...pagination, page: 1, limit }));
  };

  const handleRowClick = (user: User) => {
    // Navigate to user detail page
    window.location.href = `/admin/users/${user.id}`;
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Export as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
          <p className="mt-2 text-gray-600">Manage and monitor all platform users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Email or name..."
              value={filters.search || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters.role || ''}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="HOTEL_MANAGER">Hotel Manager</option>
              <option value="AGENT">Agent</option>
              <option value="COMPANY_ADMIN">Company Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {(localError || error) && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{localError || error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={list}
          loading={isLoading}
          error={error}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            onPageChange: handlePageChange,
            onLimitChange: handleLimitChange,
          }}
          onRowClick={handleRowClick}
          onExport={handleExport}
          searchable={false}
          filterable={true}
        />
      </div>
    </div>
  );
}
