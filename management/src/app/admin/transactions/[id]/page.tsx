'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setDetail } from '@/store/slices/transactionsSlice';
import { transactionsService } from '@/services/transactionsService';
import { LoadingSpinner, ErrorMessage } from '@/components/Common';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { detail, isLoading, error } = useAppSelector((state) => state.transactions);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeAmount, setDisputeAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const transactionId = params.id as string;

  useEffect(() => {
    fetchTransactionDetail();
  }, [transactionId]);

  const fetchTransactionDetail = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await transactionsService.getTransactionDetail(transactionId);

      if (response.success) {
        dispatch(setDetail(response.data));
      } else {
        dispatch(setError('Failed to fetch transaction details'));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDisputeTransaction = async () => {
    if (!disputeReason.trim() || !disputeAmount.trim()) {
      alert('Please provide both reason and amount');
      return;
    }

    try {
      setActionLoading(true);
      const response = await transactionsService.disputeTransaction(
        transactionId,
        disputeReason,
        parseFloat(disputeAmount)
      );

      if (response.success) {
        dispatch(setDetail(response.transaction));
        setShowDisputeModal(false);
        setDisputeReason('');
        setDisputeAmount('');
        alert('Transaction marked as disputed successfully');
      } else {
        alert('Failed to dispute transaction');
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
          <h1 className="text-3xl font-bold">Transaction Details</h1>
          <p className="text-gray-600">ID: {detail.id}</p>
        </div>
        <div className="flex gap-2">
          {detail.status !== 'DISPUTED' && (
            <button
              onClick={() => setShowDisputeModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Mark as Disputed
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">User Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-semibold">{detail.userName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-semibold">{detail.userEmail}</p>
            </div>
          </div>
        </div>

        {/* Transaction Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Transaction Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Type</p>
              <p className="font-semibold">{detail.type}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className={`font-semibold px-3 py-1 rounded-full w-fit ${
                detail.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                detail.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                detail.status === 'DISPUTED' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {detail.status}
              </p>
            </div>
          </div>
        </div>

        {/* Amount Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Amount</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-gray-600">Amount</p>
              <p className="font-semibold text-lg">{detail.currency} {detail.amount.toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Currency</p>
              <p className="font-semibold">{detail.currency}</p>
            </div>
          </div>
        </div>

        {/* Date Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Date</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Transaction Date</p>
              <p className="font-semibold">{new Date(detail.date).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        {detail.paymentMethod && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Method</p>
                <p className="font-semibold">{detail.paymentMethod}</p>
              </div>
            </div>
          </div>
        )}

        {/* Dispute Information */}
        {detail.dispute && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Dispute Information</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-600 text-sm">Reason</p>
                <p className="font-semibold">{detail.dispute.reason}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Amount</p>
                <p className="font-semibold">{detail.currency} {detail.dispute.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Mark as Disputed</h2>
            <input
              type="number"
              value={disputeAmount}
              onChange={(e) => setDisputeAmount(e.target.value)}
              placeholder="Dispute amount..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="Enter reason for dispute..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDisputeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDisputeTransaction}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Mark as Disputed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
