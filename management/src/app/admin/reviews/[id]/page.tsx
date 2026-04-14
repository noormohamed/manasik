'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setDetail } from '@/store/slices/reviewsSlice';
import { reviewsService } from '@/services/reviewsService';
import { LoadingSpinner, ErrorMessage } from '@/components/Common';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { detail, isLoading, error } = useAppSelector((state) => state.reviews);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const reviewId = params.id as string;

  useEffect(() => {
    fetchReviewDetail();
  }, [reviewId]);

  const fetchReviewDetail = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await reviewsService.getReviewDetail(reviewId);

      if (response.success) {
        dispatch(setDetail(response.data));
      } else {
        dispatch(setError('Failed to fetch review details'));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleApproveReview = async () => {
    try {
      setActionLoading(true);
      const response = await reviewsService.approveReview(reviewId);

      if (response.success) {
        dispatch(setDetail(response.data));
        alert('Review approved successfully');
      } else {
        alert('Failed to approve review');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectReview = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const response = await reviewsService.rejectReview(reviewId, rejectReason);

      if (response.success) {
        dispatch(setDetail(response.data));
        setShowRejectModal(false);
        setRejectReason('');
        alert('Review rejected successfully');
      } else {
        alert('Failed to reject review');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlagReview = async () => {
    if (!flagReason.trim()) {
      alert('Please provide a reason for flagging');
      return;
    }

    try {
      setActionLoading(true);
      const response = await reviewsService.flagReview(reviewId, flagReason);

      if (response.success) {
        dispatch(setDetail(response.data));
        setShowFlagModal(false);
        setFlagReason('');
        alert('Review flagged successfully');
      } else {
        alert('Failed to flag review');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!deleteReason.trim()) {
      alert('Please provide a reason for deletion');
      return;
    }

    try {
      setActionLoading(true);
      const response = await reviewsService.deleteReview(reviewId, deleteReason);

      if (response.success) {
        alert('Review deleted successfully');
        router.push('/admin/reviews');
      } else {
        alert('Failed to delete review');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !detail) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back
        </button>
        {error && <ErrorMessage message={error} />}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Review Details</h1>
          <p className="text-gray-600">ID: {detail.id}</p>
        </div>
        <div className="flex gap-2">
          {detail.status === 'PENDING' && (
            <>
              <button
                onClick={handleApproveReview}
                disabled={actionLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={() => setShowFlagModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            Flag
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Reviewer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Reviewer Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-semibold">{detail.reviewerName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-semibold">{detail.reviewerEmail}</p>
            </div>
          </div>
        </div>

        {/* Review Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Review Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Service</p>
              <p className="font-semibold">{detail.serviceName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Rating</p>
              <p className="font-semibold text-lg">{'⭐'.repeat(detail.rating)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className={`font-semibold px-3 py-1 rounded-full w-fit ${
                detail.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                detail.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                detail.status === 'FLAGGED' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {detail.status}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Text */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Review Text</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{detail.text}</p>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Reject Review</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectReview}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Flag Review</h2>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Enter reason for flagging..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowFlagModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagReview}
                disabled={actionLoading}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Flag'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Delete Review</h2>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Enter reason for deletion..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
