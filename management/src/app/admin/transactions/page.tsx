'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setList, setPagination, setFilters } from '@/store/slices/transactionsSlice';
import { transactionsService } from '@/services/transactionsService';
import DataTable from '@/components/DataTable/DataTable';
import { LoadingSpinner, ErrorMessage } from '@/components/Common';

export default function TransactionsPage() {
  const dispatch = useAppDispatch();
  const { list, isLoading, error, pagination, filters } = useAppSelector((state) => state.transactions);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, filters.type, filters.status]);

  const fetchTransactions = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await transactionsService.getTransactions(
        pagination.page,
        pagination.limit,
        filters.search || undefined,
        filters.type || undefined,
        filters.status || undefined,
        filters.dateRange.from && filters.dateRange.to ? {
          from: filters.dateRange.from,
          to: filters.dateRange.to,
        } : undefined,
        filters.amountRange.min && filters.amountRange.max ? {
          min: filters.amountRange.min,
          max: filters.amountRange.max,
        } : undefined,
        filters.currency || undefined
      );

      if (response.success) {
        dispatch(setList(response.data));
        dispatch(
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          })
        );
      } else {
        dispatch(setError('Failed to fetch transactions'));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    dispatch(setFilters({ search: value }));
  };

  const handleTypeFilter = (type: string | null) => {
    dispatch(setFilters({ type }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleStatusFilter = (status: string | null) => {
    dispatch(setFilters({ status }));
    dispatch(setPagination({ page: 1 }));
  };

  const columns = [
    { key: 'id', label: 'Transaction ID', sortable: true },
    { key: 'userName', label: 'User', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  if (isLoading && list.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Transactions Management</h1>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.type || ''}
              onChange={(e) => handleTypeFilter(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="PAYMENT">Payment</option>
              <option value="REFUND">Refund</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="CHARGEBACK">Chargeback</option>
            </select>
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusFilter(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="DISPUTED">Disputed</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={list}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => dispatch(setPagination({ page }))}
            onRowClick={(row) => {
              window.location.href = `/admin/transactions/${row.id}`;
            }}
          />
        </div>
      </div>
    </div>
  );
}
