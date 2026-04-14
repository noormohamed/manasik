/**
 * Checkout Session Model
 * Represents a shopping cart session for both guests and authenticated users
 */

import { BookingItem } from '../types';

export class CheckoutSession {
  id: string;
  sessionId: string;
  customerId?: string;
  email?: string;
  bookingItems: BookingItem[];
  itemCount: number;
  subtotal: number;
  totalTax: number;
  discountAmount: number;
  discountCode?: string;
  finalTotal: number;
  currency: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';
  isGuest: boolean;
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;

  constructor(params: {
    id: string;
    sessionId: string;
    customerId?: string;
    email?: string;
    bookingItems?: BookingItem[];
    currency?: string;
    isGuest?: boolean;
  }) {
    this.id = params.id;
    this.sessionId = params.sessionId;
    this.customerId = params.customerId;
    this.email = params.email;
    this.bookingItems = params.bookingItems || [];
    this.itemCount = this.bookingItems.length;
    this.subtotal = this.bookingItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.totalTax = this.bookingItems.reduce((sum, item) => sum + item.tax, 0);
    this.discountAmount = 0;
    this.finalTotal = this.subtotal + this.totalTax;
    this.currency = params.currency || 'GBP';
    this.status = 'ACTIVE';
    this.isGuest = params.isGuest ?? true;
    this.createdAt = new Date();
    this.expiresAt = this.calculateExpiry();
    this.updatedAt = new Date();
  }

  /**
   * Add booking item to session
   */
  addItem(item: BookingItem): void {
    const existing = this.bookingItems.findIndex(b => b.id === item.id);
    if (existing >= 0) {
      this.updateItemQuantity(item.id, item.quantity);
    } else {
      this.bookingItems.push(item);
    }
    this.recalculateTotals();
  }

  /**
   * Remove booking item from session
   */
  removeItem(bookingId: string): void {
    this.bookingItems = this.bookingItems.filter(item => item.id !== bookingId);
    this.recalculateTotals();
  }

  /**
   * Update item quantity
   */
  updateItemQuantity(bookingId: string, newQuantity: number): void {
    const item = this.bookingItems.find(b => b.id === bookingId);
    if (!item) return;

    const quantityRatio = newQuantity / item.quantity;
    item.quantity = newQuantity;
    item.subtotal = item.pricePerUnit * newQuantity;
    item.tax = item.tax * quantityRatio;
    item.total = item.subtotal + item.tax;

    this.recalculateTotals();
  }

  /**
   * Apply discount code
   */
  applyDiscount(discountCode: string, discountAmount: number): void {
    this.discountCode = discountCode;
    this.discountAmount = discountAmount;
    this.recalculateTotals();
  }

  /**
   * Clear discount
   */
  clearDiscount(): void {
    this.discountCode = undefined;
    this.discountAmount = 0;
    this.recalculateTotals();
  }

  /**
   * Recalculate totals
   */
  private recalculateTotals(): void {
    this.itemCount = this.bookingItems.length;
    this.subtotal = this.bookingItems.reduce((sum, item) => sum + item.subtotal, 0);
    this.totalTax = this.bookingItems.reduce((sum, item) => sum + item.tax, 0);
    this.finalTotal = this.subtotal + this.totalTax - this.discountAmount;
    this.updatedAt = new Date();
  }

  /**
   * Calculate expiry time (30 minutes from now)
   */
  private calculateExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 30);
    return expiry;
  }

  /**
   * Check if session is expired
   */
  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Mark as completed
   */
  complete(): void {
    this.status = 'COMPLETED';
    this.updatedAt = new Date();
  }

  /**
   * Mark as abandoned
   */
  abandon(): void {
    this.status = 'ABANDONED';
    this.updatedAt = new Date();
  }
}
