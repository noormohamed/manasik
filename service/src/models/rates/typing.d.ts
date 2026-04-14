// ---------- Types (from our schema) ----------
export type UUID = string;
export type CurrencyCode = "GBP" | "USD" | "EUR" | string;

export interface Money {
    amount: number;
    currency: CurrencyCode;
}

export interface MonthlyDailyPrice {
    id: UUID;
    ratePlanId: UUID;
    month: string; // "YYYY-MM"
    dailyPrice: Money;
}

export interface DailyPriceOverride {
    id: UUID;
    ratePlanId: UUID;
    date: string; // "YYYY-MM-DD"
    dailyPrice: Money;
    reason?: string;
    isBlocked?: boolean;
}

export interface PerNightPricing {
    currency: CurrencyCode;
    defaultDailyPrice: Money;
    monthlyDailyPrices: MonthlyDailyPrice[];
    dateOverrides?: DailyPriceOverride[];
}

export interface RatePlan {
    id: UUID;
    listingId: UUID;
    name: string;
    roomTypeId: UUID;
    pricing: PerNightPricing;
    createdAt: string;
    updatedAt: string;
}

export interface BookingDraft {
    listingId: UUID;
    roomTypeId: UUID;
    ratePlanId: UUID;
    checkIn: string;  // "YYYY-MM-DD"
    checkOut: string; // "YYYY-MM-DD" (exclusive)
    guests: number;
}

export interface NightlyPriceLine {
    date: string;
    price: Money;
    source: "DATE_OVERRIDE" | "MONTH_RULE" | "DEFAULT";
    reason?: string;
}

export interface BookingQuote {
    draft: BookingDraft;
    nights: number;
    nightlyBreakdown: NightlyPriceLine[];
    subtotal: Money;
    serviceCharge?: Money;
    total: Money;
}

export type DisplayNightlyPriceMode = "AVERAGE" | "LOWEST" | "HIGHEST";

export interface NightlyDisplayPrice {
    mode: DisplayNightlyPriceMode;
    pricePerNight: Money;
}