/**
 * Checkout Feature Types
 */

export interface BookingItem {
  id: string;
  serviceType: 'HOTEL' | 'TAXI' | 'EXPERIENCE' | 'FOOD' | 'CAR';
  serviceName: string;
  description: string;
  quantity: number;
  pricePerUnit: number;
  subtotal: number;
  tax: number;
  total: number;
  territory?: string;
  taxRate?: number;
  metadata: Record<string, any>;
}

export interface CheckoutSessionRecord {
  id: string;
  sessionId: string;
  customerId?: string;
  email?: string;
  bookingItems: string; // JSON stringified
  subtotal: number;
  totalTax: number;
  discountAmount: number;
  discountCode?: string;
  finalTotal: number;
  currency: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'EXPIRED';
  isGuest: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface GuestUser {
  userId: string; // Format: "guest-{uuid}"
  email?: string;
  createdAt: Date;
  convertedAt?: Date;
  isGuest: boolean;
}

export interface DiscountCode {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minPurchaseAmount?: number;
  maxDiscount?: number;
  applicableServices?: ('HOTEL' | 'TAXI' | 'EXPERIENCE' | 'FOOD' | 'CAR')[];
  expiresAt: Date;
  isActive: boolean;
}
