"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api";
import Link from "next/link";
import Navbar from "@/components/Layout/Navbar";
import Footer from "@/components/Layout/Footer";
import ManagementPageLayout from "@/components/ManagementPageLayout/ManagementPageLayout";

interface CreditSummary {
  totalCredits: number;
  pendingCredits: number;
  availableCredits: number;
  pendingBookings: number;
  completedBookings: number;
  totalGBP: number;
  pendingGBP: number;
  availableGBP: number;
  exchangeRate: number;
  recentTransactions: CreditTransaction[];
}

interface CreditTransaction {
  id: string;
  bookingId: string;
  credits: number;
  originalAmount: number;
  originalCurrency: string;
  status: string;
  checkInDate?: string;
  checkOutDate?: string;
  hotelName?: string;
  createdAt: string;
}

export default function PaymentsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [displayCurrency, setDisplayCurrency] = useState<'credits' | 'gbp' | 'usd'>('gbp');
  const [summary, setSummary] = useState<CreditSummary>({
    totalCredits: 0,
    pendingCredits: 0,
    availableCredits: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalGBP: 0,
    pendingGBP: 0,
    availableGBP: 0,
    exchangeRate: 0.79,
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);

  const userName = user ? `${user.firstName} ${user.lastName}` : 'User';

  useEffect(() => {
    if (isAuthenticated) {
      fetchCreditSummary();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const fetchCreditSummary = async () => {
    setLoading(true);
    try {
      let exchangeRate = 0.79;
      try {
        const ratesResponse = await apiClient.get('/credits/exchange-rates') as { data?: any[] };
        const usdToGbp = ratesResponse.data?.find((r: any) => r.fromCurrency === 'USD' && r.toCurrency === 'GBP');
        if (usdToGbp) {
          exchangeRate = usdToGbp.rate;
        }
      } catch (e) {
        console.log('Using default exchange rate');
      }

      let pendingCredits = 0;
      let availableCredits = 0;
      let pendingBookings = 0;
      let completedBookings = 0;
      const transactions: CreditTransaction[] = [];
      const today = new Date();

      try {
        const earningsResponse = await apiClient.get('/users/me/earnings') as { 
          earnings?: any[], 
          summary?: { 
            totalCredits: number, 
            pendingCredits: number, 
            availableCredits: number,
            pendingBookings: number,
            completedBookings: number 
          } 
        };
        
        if (earningsResponse.earnings && earningsResponse.earnings.length > 0) {
          pendingCredits = earningsResponse.summary?.pendingCredits || 0;
          availableCredits = earningsResponse.summary?.availableCredits || 0;
          pendingBookings = earningsResponse.summary?.pendingBookings || 0;
          completedBookings = earningsResponse.summary?.completedBookings || 0;
          
          earningsResponse.earnings.forEach((earning: any) => {
            transactions.push({
              id: earning.id,
              bookingId: earning.bookingId,
              credits: earning.credits,
              originalAmount: earning.originalAmount,
              originalCurrency: earning.originalCurrency,
              status: earning.status,
              checkInDate: earning.checkInDate,
              checkOutDate: earning.checkOutDate,
              hotelName: earning.hotelName,
              createdAt: earning.createdAt,
            });
          });
        }
      } catch (e) {
        console.log('No host earnings or error fetching');
      }

      if (transactions.length === 0) {
        const response = await apiClient.get('/users/me/bookings') as { bookings?: any[] };
        const bookings = response.bookings || [];

        bookings.forEach((booking: any) => {
          const amount = parseFloat(booking.total) || 0;
          const currency = booking.currency || 'USD';
          
          let gbpAmount = amount;
          if (currency === 'USD') {
            gbpAmount = amount * exchangeRate;
          } else if (currency === 'EUR') {
            gbpAmount = amount * 0.86;
          } else if (currency === 'SAR') {
            gbpAmount = amount * 0.21;
          }
          
          const credits = Math.round(gbpAmount * 100);
          
          let checkOutDate: Date | null = null;
          if (booking.metadata?.checkOutDate) {
            checkOutDate = new Date(booking.metadata.checkOutDate);
          } else if (booking.checkOutDate) {
            checkOutDate = new Date(booking.checkOutDate);
          }

          const isCheckedOut = checkOutDate && checkOutDate < today;
          const isConfirmed = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
          const isCancelled = booking.status === 'CANCELLED' || booking.status === 'REFUNDED';

          if (!isCancelled) {
            if (isCheckedOut && isConfirmed) {
              availableCredits += credits;
              completedBookings++;
            } else if (!isCancelled) {
              pendingCredits += credits;
              pendingBookings++;
            }
          }

          transactions.push({
            id: booking.id,
            bookingId: booking.id,
            credits,
            originalAmount: amount,
            originalCurrency: currency,
            status: isCancelled ? 'CANCELLED' : (isCheckedOut && isConfirmed ? 'AVAILABLE' : 'PENDING'),
            checkInDate: booking.metadata?.checkInDate || booking.checkInDate,
            checkOutDate: booking.metadata?.checkOutDate || booking.checkOutDate,
            hotelName: booking.hotelName || booking.serviceName,
            createdAt: booking.createdAt,
          });
        });
      }

      const totalCredits = pendingCredits + availableCredits;

      setSummary({
        totalCredits,
        pendingCredits,
        availableCredits,
        pendingBookings,
        completedBookings,
        totalGBP: totalCredits / 100,
        pendingGBP: pendingCredits / 100,
        availableGBP: availableCredits / 100,
        exchangeRate,
        recentTransactions: transactions.slice(0, 10),
      });
    } catch (err: any) {
      console.error('Error fetching credit summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCredits = (credits: number) => {
    return credits.toLocaleString();
  };

  const formatGBP = (amount: number) => {
    return amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatUSD = (gbpAmount: number) => {
    const usdAmount = gbpAmount / summary.exchangeRate;
    return usdAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatAmount = (credits: number) => {
    if (displayCurrency === 'credits') {
      return `${formatCredits(credits)} cr`;
    } else if (displayCurrency === 'gbp') {
      return `£${formatGBP(credits / 100)}`;
    } else {
      return `${formatUSD(credits / 100)}`;
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <div className="container pt-5 pb-5" style={{ minHeight: '60vh' }}>
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="container pt-5 pb-5" style={{ minHeight: '60vh' }}>
          <div className="alert alert-warning">
            <i className="ri-lock-line me-2"></i>
            Please <Link href="/auth">log in</Link> to view your credits.
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <ManagementPageLayout>
        <style jsx>{`
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            flex-wrap: wrap;
            gap: 20px;
          }

          .page-title {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 8px;
          }

          .page-subtitle {
            color: #666;
            font-size: 15px;
          }

          .currency-switcher {
            display: flex;
            background: #f0f0f0;
            border-radius: 8px;
            padding: 4px;
          }

          .currency-btn {
            padding: 8px 16px;
            border: none;
            background: transparent;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            color: #666;
            cursor: pointer;
            transition: all 0.2s;
          }

          .currency-btn:hover {
            color: #1a1a1a;
          }

          .currency-btn.active {
            background: #fff;
            color: #1a1a1a;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }

          .summary-bar {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            margin-bottom: 30px;
          }

          .summary-item {
            background: #fff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 16px 24px;
            flex: 1;
            min-width: 180px;
          }

          .summary-label {
            color: #666;
            font-size: 13px;
            margin-bottom: 4px;
          }

          .summary-value {
            font-size: 24px;
            font-weight: 700;
            color: #1a1a1a;
          }

          .summary-value.pending {
            color: #856404;
          }

          .summary-value.available {
            color: #28a745;
          }

          .summary-sub {
            font-size: 13px;
            color: #888;
            margin-top: 2px;
          }

          .credit-section {
            background: #fff;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 15px;
            border: 1px solid #e9ecef;
          }

          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e9ecef;
          }

          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
          }

          .section-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          .badge-pending {
            background: #fff3cd;
            color: #856404;
          }

          .badge-available {
            background: #d4edda;
            color: #155724;
          }

          .credit-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
          }

          .credit-info {
            display: flex;
            flex-direction: column;
          }

          .credit-type {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          }

          .credit-bookings {
            font-size: 12px;
            color: #888;
          }

          .credit-amount {
            text-align: right;
          }

          .credit-number {
            font-size: 28px;
            font-weight: 700;
            color: #1a1a1a;
          }

          .credit-number.pending {
            color: #856404;
          }

          .credit-number.available {
            color: #28a745;
          }

          .transaction-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #f0f0f0;
          }

          .transaction-item:last-child {
            border-bottom: none;
          }

          .transaction-info {
            flex: 1;
          }

          .transaction-hotel {
            font-weight: 500;
            color: #1a1a1a;
            font-size: 14px;
          }

          .transaction-date {
            font-size: 12px;
            color: #888;
            margin-top: 2px;
          }

          .transaction-status {
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            margin-right: 15px;
          }

          .status-pending {
            background: #fff3cd;
            color: #856404;
          }

          .status-available {
            background: #d4edda;
            color: #155724;
          }

          .status-cancelled {
            background: #f8d7da;
            color: #721c24;
          }

          .transaction-credits {
            font-weight: 600;
            color: #1a1a1a;
            min-width: 100px;
            text-align: right;
          }

          .view-all-link {
            color: #1a365d;
            font-size: 13px;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-top: 15px;
          }

          .view-all-link:hover {
            text-decoration: underline;
          }
        `}</style>

        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{ width: '100%', maxWidth: '1640px', padding: '0 24px' }}>
          <div className="page-header">
            <div>
              <h1 className="page-title">{userName}&apos;s Payments</h1>
              <p className="page-subtitle">View and manage your earnings and credits.</p>
            </div>
            <div className="currency-switcher">
              <button 
                className={`currency-btn ${displayCurrency === 'gbp' ? 'active' : ''}`}
                onClick={() => setDisplayCurrency('gbp')}
              >
                £ GBP
              </button>
              <button 
                className={`currency-btn ${displayCurrency === 'usd' ? 'active' : ''}`}
                onClick={() => setDisplayCurrency('usd')}
              >
                $ USD
              </button>
              <button 
                className={`currency-btn ${displayCurrency === 'credits' ? 'active' : ''}`}
                onClick={() => setDisplayCurrency('credits')}
              >
                Credits
              </button>
            </div>
          </div>

          <div className="summary-bar">
            <div className="summary-item">
              <div className="summary-label">Total Balance</div>
              <div className="summary-value">{formatAmount(summary.totalCredits)}</div>
              <div className="summary-sub">{formatCredits(summary.totalCredits)} credits</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Pending</div>
              <div className="summary-value pending">{formatAmount(summary.pendingCredits)}</div>
              <div className="summary-sub">{summary.pendingBookings} booking{summary.pendingBookings !== 1 ? 's' : ''}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Available</div>
              <div className="summary-value available">{formatAmount(summary.availableCredits)}</div>
              <div className="summary-sub">{summary.completedBookings} booking{summary.completedBookings !== 1 ? 's' : ''}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className="credit-section">
                <div className="section-header">
                  <span className="section-title">⏳ Pending Credits</span>
                  <span className="section-badge badge-pending">{summary.pendingBookings} booking{summary.pendingBookings !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="credit-row">
                  <div className="credit-info">
                    <div className="credit-type">Awaiting check-out</div>
                    <div className="credit-bookings">Guests haven&apos;t checked out yet</div>
                  </div>
                  <div className="credit-amount">
                    <div className="credit-number pending">{formatAmount(summary.pendingCredits)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="credit-section">
                <div className="section-header">
                  <span className="section-title">✅ Available Funds</span>
                  <span className="section-badge badge-available">{summary.completedBookings} booking{summary.completedBookings !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="credit-row">
                  <div className="credit-info">
                    <div className="credit-type">Ready for withdrawal</div>
                    <div className="credit-bookings">Guests have checked out</div>
                  </div>
                  <div className="credit-amount">
                    <div className="credit-number available">{formatAmount(summary.availableCredits)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {summary.recentTransactions.length > 0 && (
            <div className="credit-section">
              <div className="section-header">
                <span className="section-title">Recent Bookings</span>
              </div>
              
              {summary.recentTransactions.map((tx) => (
                <div key={tx.id} className="transaction-item">
                  <div className="transaction-info">
                    <div className="transaction-hotel">{tx.hotelName || 'Booking'}</div>
                    <div className="transaction-date">
                      {tx.checkInDate && tx.checkOutDate 
                        ? `${new Date(tx.checkInDate).toLocaleDateString()} - ${new Date(tx.checkOutDate).toLocaleDateString()}`
                        : new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`transaction-status ${
                    tx.status === 'AVAILABLE' ? 'status-available' : 
                    tx.status === 'CANCELLED' ? 'status-cancelled' : 'status-pending'
                  }`}>
                    {tx.status}
                  </span>
                  <div className="transaction-credits">
                    {formatAmount(tx.credits)}
                  </div>
                </div>
              ))}

              <Link href="/dashboard/bookings" className="view-all-link">
                View All Bookings <i className="ri-arrow-right-line"></i>
              </Link>
            </div>
          )}
          </div>
        </div>
      </ManagementPageLayout>
      <Footer />
    </>
  );
}
