'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setList, setPagination, setFilters } from '@/store/slices/reviewsSlice';
import { reviewsService } from '@/services/reviewsService';
import DataTable from '@/components/DataTable/DataTable';
import { LoadingSpinner, ErrorMessage } from '@/components/Common';

export default function ReviewsPage() {
  const dispatch = useAppDispatch();
  const { list, isLoading, error, pagination, filters } = useAppSelector((state) => state.reviews);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, filters.status, filters.rating, filters.serviceType]);

  const fetchReviews = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await reviewsService.getReviews({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search || undefined,
        status: filters.status || undefined,
        rating: filters.rating || undefined,
        dateRangeStart: filters.dateRange.from || undefined,
        dateRangeEnd: filters.dateRange.to || undefined,
        serviceType: filters.serviceType || undefined,
      });

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
        dispatch(setError('Failed to fetch reviews'));
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

  const handleStatusFilter = (status: string | null) => {
    dispatch(setFilters({ status }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleRatingFilter = (rating: number | null) => {
    dispatch(setFilters({ rating }));
    dispatch(setPagination({ page: 1 }));
  };

  const handleServiceTypeFilter = (serviceType: string | null) => {
    dispatch(setFilters({ serviceType }));
    dispatch(setPagination({ page: 1 }));
  };

  const columns = [
    { key: 'id', label: 'Review ID', sortable: true },
    { key: 'reviewerName', label: 'Reviewer', sortable: true },
    { key: 'serviceName', label: 'Service', sortable: true },
    { key: 'rating', label: 'Rating', sortable: true },
    { key: 'reviewDate', label: 'Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  if (isLoading && list.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reviews Management</h1>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchInput}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={filters.status || ''}
              onChange={(e) => handleStatusFilter(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="FLAGGED">Flagged</option>
            </select>
            <select
              value={filters.rating || ''}
              onChange={(e) => handleRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <select
              value={filters.serviceType || ''}
              onChange={(e) => handleServiceTypeFilter(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Services</option>
              <option value="HOTEL">Hotel</option>
              <option value="TAXI">Taxi</option>
              <option value="EXPERIENCE">Experience</option>
              <option value="CAR">Car</option>
              <option value="FOOD">Food</option>
            </select>
          </div>

          <DataTable
            columns={columns}
            data={list}
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => dispatch(setPagination({ page }))}
            onRowClick={(row) => {
              window.location.href = `/admin/reviews/${row.id}`;
            }}
          />
        </div>
      </div>
    </div>
  );
}
