/**
 * Delta merge utility for the Admin Analytics Dashboard.
 *
 * Applies an IncrementalDelta to an existing AnalyticsResponse, producing
 * a new immutable state object. Returns null if baseline data is missing,
 * signalling that a full refresh is needed.
 */

import type { AnalyticsResponse, IncrementalDelta } from '@/types/analytics';

/**
 * Immutably merge an incremental delta into the current analytics state.
 *
 * Updates revenue total, booking counts by status/source/payment,
 * and recalculates derived metrics (conversion rate, expired rate,
 * average rating).
 *
 * @param current - The current analytics state (baseline)
 * @param delta   - The incremental change to apply
 * @returns A new AnalyticsResponse with the delta applied, or null if
 *          baseline data is missing and a full refresh is needed
 */
export function mergeDelta(
  current: AnalyticsResponse | null | undefined,
  delta: IncrementalDelta | null | undefined,
): AnalyticsResponse | null {
  // If baseline data is missing, signal full refresh needed
  if (!current) {
    return null;
  }

  // If delta is missing or empty, return current state unchanged
  if (!delta) {
    return current;
  }

  // --- Revenue ---
  const revenueAdjustment = delta.revenueAdjustment ?? 0;
  const newRevenueTotal = current.revenue.total + revenueAdjustment;

  // --- Bookings by status ---
  const newByStatus = { ...current.bookings.byStatus };
  if (delta.statusCountAdjustments) {
    for (const [status, adjustment] of Object.entries(delta.statusCountAdjustments)) {
      newByStatus[status] = (newByStatus[status] ?? 0) + adjustment;
    }
  }

  // --- Bookings by source ---
  const newBySource = { ...current.bookings.bySource };
  if (delta.sourceCountAdjustments) {
    for (const [source, adjustment] of Object.entries(delta.sourceCountAdjustments)) {
      newBySource[source] = (newBySource[source] ?? 0) + adjustment;
    }
  }

  // --- Bookings by payment status ---
  const newByPaymentStatus = { ...current.bookings.byPaymentStatus };
  if (delta.paymentStatusAdjustments) {
    for (const [status, adjustment] of Object.entries(delta.paymentStatusAdjustments)) {
      newByPaymentStatus[status] = (newByPaymentStatus[status] ?? 0) + adjustment;
    }
  }

  // --- Total bookings ---
  const bookingCountAdjustment = delta.bookingCountAdjustment ?? 0;
  const newTotalBookings = current.bookings.total + bookingCountAdjustment;

  // --- Derived metrics: conversion rate ---
  const confirmedCount = newByStatus['CONFIRMED'] ?? 0;
  const completedCount = newByStatus['COMPLETED'] ?? 0;
  const activeCount = confirmedCount + completedCount;
  const newConversionRate =
    newTotalBookings > 0 ? (activeCount / newTotalBookings) * 100 : 0;

  // --- Derived metrics: expired rate ---
  const expiredCount = newByStatus['EXPIRED'] ?? 0;
  const newExpiredRate =
    newTotalBookings > 0 ? (expiredCount / newTotalBookings) * 100 : 0;

  // --- Derived metrics: average revenue ---
  const newRevenueAverage = activeCount > 0 ? newRevenueTotal / activeCount : 0;

  // --- Reviews: rating distribution and average ---
  let newRatingDistribution = current.reviews.ratingDistribution;
  let newAverageRating = current.reviews.averageRating;

  if (delta.ratingAdjustment) {
    newRatingDistribution = { ...current.reviews.ratingDistribution };
    const { rating, count } = delta.ratingAdjustment;
    newRatingDistribution[rating] = (newRatingDistribution[rating] ?? 0) + count;

    // Recalculate average rating from the full distribution
    let totalRatingSum = 0;
    let totalReviewCount = 0;
    for (const [ratingValue, ratingCount] of Object.entries(newRatingDistribution)) {
      totalRatingSum += Number(ratingValue) * ratingCount;
      totalReviewCount += ratingCount;
    }
    newAverageRating =
      totalReviewCount > 0
        ? Math.round((totalRatingSum / totalReviewCount) * 10) / 10
        : 0;
  }

  // --- Build new immutable state ---
  return {
    ...current,
    revenue: {
      ...current.revenue,
      total: newRevenueTotal,
      average: newRevenueAverage,
    },
    bookings: {
      ...current.bookings,
      total: newTotalBookings,
      conversionRate: newConversionRate,
      expiredRate: newExpiredRate,
      byStatus: newByStatus,
      bySource: newBySource,
      byPaymentStatus: newByPaymentStatus,
    },
    reviews: {
      ...current.reviews,
      ratingDistribution: newRatingDistribution,
      averageRating: newAverageRating,
    },
  };
}
