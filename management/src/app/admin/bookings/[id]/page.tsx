'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks';
import { setLoading, setError, setDetail } from '@/store/slices/bookingsSlice';
import { bookingsService } from '@/services/bookingsService';
import { LoadingSpinner, ErrorMessage } from '@/components/Common';

// Helper to calculate time remaining for hold expiry
const getHoldTimeRemaining = (holdExpiresAt?: string) => {
  if (!holdExpiresAt) return null;
  const expiry = new Date(holdExpiresAt);
  const now = new Date();
  const diff = expiry.getTime() - now.getTime();
  if (diff <= 0) return { text: 'Expired', isExpired: true, minutes: 0, seconds: 0 };
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { text: `${minutes}m ${seconds}s`, isExpired: false, minutes, seconds };
};

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { detail, isLoading, error } = useAppSelector((state) => state.bookings);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [holdTimeRemaining, setHoldTimeRemaining] = useState<ReturnType<typeof getHoldTimeRemaining>>(null);

  const bookingId = params.id as string;

  // Update hold timer every second
  useEffect(() => {
    if (detail?.holdExpiresAt && detail?.status === 'PENDING' && detail?.paymentStatus !== 'PAID') {
      const updateTimer = () => {
        setHoldTimeRemaining(getHoldTimeRemaining(detail.holdExpiresAt));
      };
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [detail?.holdExpiresAt, detail?.status, detail?.paymentStatus]);

  const handlePrintConfirmation = () => {
    const printContent = document.getElementById('booking-confirmation');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Booking Confirmation - ${detail?.id}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 28px; font-weight: bold; color: #1a365d; }
                .confirmation-number { background: #f0f9ff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
                .confirmation-number h2 { margin: 0; color: #1a365d; font-size: 14px; }
                .confirmation-number p { margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #2563eb; }
                .section { margin-bottom: 25px; }
                .section-title { font-size: 16px; font-weight: bold; color: #1a365d; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 15px; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
                .row:last-child { border-bottom: none; }
                .label { color: #6b7280; }
                .value { font-weight: 500; }
                .total-row { background: #f9fafb; padding: 12px; border-radius: 6px; margin-top: 10px; }
                .total-row .label { font-weight: bold; color: #111827; }
                .total-row .value { font-size: 20px; color: #059669; font-weight: bold; }
                .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
                .status-confirmed { background: #d1fae5; color: #065f46; }
                .status-pending { background: #fef3c7; color: #92400e; }
                .status-cancelled { background: #fee2e2; color: #991b1b; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px; }
                .qr-placeholder { text-align: center; padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
                @media print { body { padding: 20px; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  useEffect(() => {
    fetchBookingDetail();
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const response = await bookingsService.getBookingDetail(bookingId);

      if (response.success) {
        dispatch(setDetail(response.data));
      } else {
        dispatch(setError('Failed to fetch booking details'));
      }
    } catch (err) {
      dispatch(setError(err instanceof Error ? err.message : 'An error occurred'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation');
      return;
    }

    try {
      setActionLoading(true);
      const response = await bookingsService.cancelBooking(bookingId, cancelReason);

      if (response.success) {
        dispatch(setDetail(response.data));
        setShowCancelModal(false);
        setCancelReason('');
        alert('Booking cancelled successfully');
      } else {
        alert('Failed to cancel booking');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefundBooking = async () => {
    if (!refundAmount.trim() || !refundReason.trim()) {
      alert('Please provide both amount and reason');
      return;
    }

    try {
      setActionLoading(true);
      const response = await bookingsService.refundBooking(
        bookingId,
        parseFloat(refundAmount),
        refundReason
      );

      if (response.success) {
        dispatch(setDetail(response.data));
        setShowRefundModal(false);
        setRefundAmount('');
        setRefundReason('');
        alert('Refund issued successfully');
      } else {
        alert('Failed to issue refund');
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

  const isPendingPayment = detail.status === 'PENDING' && detail.paymentStatus !== 'PAID';
  const isBrokerBooking = detail.bookingSource === 'AGENT';

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
          <h1 className="text-3xl font-bold">Booking Details</h1>
          <p className="text-gray-600">ID: {detail.id}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfirmationModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Confirmation
          </button>
          {detail.status !== 'CANCELLED' && detail.status !== 'REFUNDED' && (
            <>
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel Booking
              </button>
              <button
                onClick={() => setShowRefundModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Issue Refund
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pending Payment Alert with Timer */}
      {isPendingPayment && holdTimeRemaining && (
        <div className={`p-4 rounded-lg border-l-4 ${
          holdTimeRemaining.isExpired 
            ? 'bg-red-50 border-red-500' 
            : 'bg-orange-50 border-orange-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className={`w-6 h-6 ${holdTimeRemaining.isExpired ? 'text-red-600' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className={`font-semibold ${holdTimeRemaining.isExpired ? 'text-red-800' : 'text-orange-800'}`}>
                  {holdTimeRemaining.isExpired ? 'Payment Hold Expired' : 'Awaiting Customer Payment'}
                </p>
                <p className={`text-sm ${holdTimeRemaining.isExpired ? 'text-red-600' : 'text-orange-600'}`}>
                  {holdTimeRemaining.isExpired 
                    ? 'This booking hold has expired and may be released.' 
                    : 'Customer has been sent a payment link. Booking is being held.'}
                </p>
              </div>
            </div>
            {!holdTimeRemaining.isExpired && (
              <div className="text-right">
                <p className="text-sm text-orange-600">Hold expires in</p>
                <p className="text-2xl font-bold text-orange-800">{holdTimeRemaining.text}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Customer Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Name</p>
              <p className="font-semibold">{detail.customerName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Email</p>
              <p className="font-semibold">{detail.customerEmail}</p>
            </div>
          </div>
        </div>

        {/* Booking Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Booking Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Service Type</p>
              <p className="font-semibold">{detail.serviceType}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Service Name</p>
              <p className="font-semibold">{detail.serviceName}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Status</p>
              <p className={`font-semibold px-3 py-1 rounded-full w-fit ${
                detail.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                detail.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                detail.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {isPendingPayment ? 'Pending Payment' : detail.status}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Payment Status</p>
              <p className={`font-semibold px-3 py-1 rounded-full w-fit ${
                detail.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                detail.paymentStatus === 'REFUNDED' ? 'bg-purple-100 text-purple-800' :
                detail.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {detail.paymentStatus || 'PENDING'}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Booking Source</p>
              <p className={`font-semibold px-3 py-1 rounded-full w-fit ${
                detail.bookingSource === 'AGENT' ? 'bg-purple-100 text-purple-800' :
                detail.bookingSource === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                detail.bookingSource === 'API' ? 'bg-orange-100 text-orange-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {detail.bookingSource === 'AGENT' ? '🧑‍💼 Broker' :
                 detail.bookingSource === 'ADMIN' ? '👤 Admin' :
                 detail.bookingSource === 'API' ? '🔌 API' :
                 '🌐 Direct (Customer)'}
              </p>
            </div>
            {isBrokerBooking && detail.agentName && (
              <div>
                <p className="text-gray-600 text-sm">Booked By (Broker)</p>
                <p className="font-semibold">{detail.agentName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Pricing</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <p className="text-gray-600">Subtotal</p>
              <p className="font-semibold">{detail.currency} {Number(detail.subtotal || 0).toFixed(2)}</p>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-600">Tax</p>
              <p className="font-semibold">{detail.currency} {Number(detail.tax || 0).toFixed(2)}</p>
            </div>
            <div className="border-t pt-3 flex justify-between">
              <p className="font-bold">Total</p>
              <p className="font-bold text-lg">{detail.currency} {Number(detail.totalAmount || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Stay Details</h2>
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">Booked On</p>
              <p className="font-semibold">{new Date(detail.bookingDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            {detail.checkInDate && (
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Check-in</p>
                <p className="font-semibold text-green-700">{new Date(detail.checkInDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            )}
            {detail.checkOutDate && (
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Check-out</p>
                <p className="font-semibold text-red-700">{new Date(detail.checkOutDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            )}
            {(detail.nights || (detail.checkInDate && detail.checkOutDate)) && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-gray-600 text-sm">Duration</p>
                <p className="font-semibold text-blue-700">
                  {detail.nights || Math.ceil((new Date(detail.checkOutDate!).getTime() - new Date(detail.checkInDate!).getTime()) / (1000 * 60 * 60 * 24))} night(s)
                </p>
              </div>
            )}
            {detail.guests && (
              <div>
                <p className="text-gray-600 text-sm">Guests</p>
                <p className="font-semibold">{detail.guests} guest(s)</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Broker Notes (if applicable) */}
      {isBrokerBooking && (detail as any).brokerNotes && (
        <div className="bg-purple-50 rounded-lg shadow p-6 border border-purple-200">
          <h2 className="text-xl font-bold mb-4 text-purple-800">Broker Notes</h2>
          <p className="text-purple-700">{(detail as any).brokerNotes}</p>
        </div>
      )}


      {/* Booking Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Booking Confirmation</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintConfirmation}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Print
                </button>
                <button
                  onClick={() => setShowConfirmationModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
            
            <div id="booking-confirmation" className="p-6">
              {/* Header */}
              <div className="header text-center border-b-2 border-blue-900 pb-5 mb-6">
                <div className="logo text-3xl font-bold text-blue-900">Manasik</div>
                <p className="text-gray-500 mt-1">Your Spiritual Journey Partner</p>
              </div>

              {/* Confirmation Number */}
              <div className="confirmation-number bg-blue-50 p-4 rounded-lg text-center mb-6">
                <h2 className="text-sm text-blue-900 font-semibold">CONFIRMATION NUMBER</h2>
                <p className="text-2xl font-bold text-blue-600 mt-1">{detail.id}</p>
              </div>

              {/* Status Badge */}
              <div className="text-center mb-6">
                <span className={`status inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  detail.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                  detail.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  detail.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {isPendingPayment ? 'PENDING PAYMENT' : detail.status}
                </span>
              </div>

              {/* Guest Information */}
              <div className="section mb-6">
                <div className="section-title text-lg font-bold text-blue-900 border-b pb-2 mb-4">Guest Information</div>
                <div className="row flex justify-between py-2 border-b border-gray-100">
                  <span className="label text-gray-600">Name</span>
                  <span className="value font-medium">{detail.customerName}</span>
                </div>
                <div className="row flex justify-between py-2">
                  <span className="label text-gray-600">Email</span>
                  <span className="value font-medium">{detail.customerEmail}</span>
                </div>
              </div>

              {/* Accommodation Details */}
              <div className="section mb-6">
                <div className="section-title text-lg font-bold text-blue-900 border-b pb-2 mb-4">Accommodation Details</div>
                <div className="row flex justify-between py-2 border-b border-gray-100">
                  <span className="label text-gray-600">Property</span>
                  <span className="value font-medium">{detail.hotelName || detail.serviceName}</span>
                </div>
                {detail.roomType && (
                  <div className="row flex justify-between py-2 border-b border-gray-100">
                    <span className="label text-gray-600">Room Type</span>
                    <span className="value font-medium">{detail.roomType}</span>
                  </div>
                )}
                {detail.guests && (
                  <div className="row flex justify-between py-2">
                    <span className="label text-gray-600">Guests</span>
                    <span className="value font-medium">{detail.guests}</span>
                  </div>
                )}
              </div>

              {/* Stay Dates */}
              <div className="section mb-6">
                <div className="section-title text-lg font-bold text-blue-900 border-b pb-2 mb-4">Stay Dates</div>
                {detail.checkInDate && (
                  <div className="row flex justify-between py-2 border-b border-gray-100">
                    <span className="label text-gray-600">Check-in</span>
                    <span className="value font-medium">{new Date(detail.checkInDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {detail.checkOutDate && (
                  <div className="row flex justify-between py-2 border-b border-gray-100">
                    <span className="label text-gray-600">Check-out</span>
                    <span className="value font-medium">{new Date(detail.checkOutDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                )}
                {(detail.nights || (detail.checkInDate && detail.checkOutDate)) && (
                  <div className="row flex justify-between py-2">
                    <span className="label text-gray-600">Duration</span>
                    <span className="value font-medium">
                      {detail.nights || Math.ceil((new Date(detail.checkOutDate!).getTime() - new Date(detail.checkInDate!).getTime()) / (1000 * 60 * 60 * 24))} night(s)
                    </span>
                  </div>
                )}
              </div>

              {/* Payment Summary */}
              <div className="section mb-6">
                <div className="section-title text-lg font-bold text-blue-900 border-b pb-2 mb-4">Payment Summary</div>
                <div className="row flex justify-between py-2 border-b border-gray-100">
                  <span className="label text-gray-600">Subtotal</span>
                  <span className="value font-medium">{detail.currency} {Number(detail.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="row flex justify-between py-2 border-b border-gray-100">
                  <span className="label text-gray-600">Tax</span>
                  <span className="value font-medium">{detail.currency} {Number(detail.tax || 0).toFixed(2)}</span>
                </div>
                <div className="total-row bg-gray-50 p-3 rounded-lg mt-3 flex justify-between">
                  <span className="label font-bold text-gray-900">Total</span>
                  <span className="value text-xl font-bold text-green-600">{detail.currency} {Number(detail.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="footer mt-8 pt-5 border-t text-center text-gray-500 text-sm">
                <p>Thank you for choosing Manasik for your spiritual journey.</p>
                <p className="mt-2">For support, contact us at support@manasik.com</p>
                <p className="mt-4 text-xs">Booking confirmed on {new Date(detail.bookingDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Cancel Booking</h2>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Issue Refund</h2>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              placeholder="Refund amount..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <textarea
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter reason for refund..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefundBooking}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {actionLoading ? 'Processing...' : 'Issue Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
