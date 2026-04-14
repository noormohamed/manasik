import {
    BookingDraft, BookingQuote,
    DailyPriceOverride, DisplayNightlyPriceMode,
    Money,
    MonthlyDailyPrice, NightlyDisplayPrice,
    NightlyPriceLine,
    PerNightPricing,
    RatePlan
} from "./typing";
import {
    addMoney,
    assertISODate,
    assertISOMonth,
    ensureSameCurrency,
    formatISODateUTC,
    getISOMonthFromDate, roundMoney,
    toUTCDate
} from "./utils";

/**
 * Returns an array of ISO dates for each night stayed.
 * checkIn inclusive, checkOut exclusive.
 *
 * Example: 2026-04-01 -> 2026-04-04 returns:
 * ["2026-04-01", "2026-04-02", "2026-04-03"]
 */
export function enumerateNights(checkIn: string, checkOut: string): string[] {
    const start = toUTCDate(checkIn);
    const end = toUTCDate(checkOut);

    if (!(start < end)) {
        throw new Error(`checkOut must be after checkIn: ${checkIn} -> ${checkOut}`);
    }

    const nights: string[] = [];
    let cur = new Date(start.getTime());

    while (cur < end) {
        nights.push(formatISODateUTC(cur));
        cur.setUTCDate(cur.getUTCDate() + 1);
    }

    return nights;
}

/**
 * Builds fast lookup maps for overrides and month rules.
 */
export function buildPricingIndex(pricing: PerNightPricing): {
    overrideByDate: Map<string, DailyPriceOverride>;
    monthRuleByMonth: Map<string, MonthlyDailyPrice>;
} {
    const overrideByDate = new Map<string, DailyPriceOverride>();
    for (const o of pricing.dateOverrides ?? []) {
        assertISODate(o.date);
        overrideByDate.set(o.date, o);
    }

    const monthRuleByMonth = new Map<string, MonthlyDailyPrice>();
    for (const m of pricing.monthlyDailyPrices) {
        assertISOMonth(m.month);
        monthRuleByMonth.set(m.month, m);
    }

    return {overrideByDate, monthRuleByMonth};
}

/**
 * Resolves the nightly price for a specific date:
 * DATE_OVERRIDE > MONTH_RULE > DEFAULT
 */
export function resolveNightlyPrice(
    date: string,
    pricing: PerNightPricing,
    index?: ReturnType<typeof buildPricingIndex>
): NightlyPriceLine {
    assertISODate(date);

    const {overrideByDate, monthRuleByMonth} = index ?? buildPricingIndex(pricing);

    const override = overrideByDate.get(date);
    if (override) {
        if (override.isBlocked) {
            throw new Error(`Date is blocked and not bookable: ${date}${override.reason ? ` (${override.reason})` : ""}`);
        }
        return {
            date,
            price: override.dailyPrice,
            source: "DATE_OVERRIDE",
            reason: override.reason,
        };
    }

    const month = getISOMonthFromDate(date);
    const monthRule = monthRuleByMonth.get(month);
    if (monthRule) {
        return {date, price: monthRule.dailyPrice, source: "MONTH_RULE"};
    }

    return {date, price: pricing.defaultDailyPrice, source: "DEFAULT"};
}

/**
 * Quotes a booking: returns nightly breakdown + totals.
 *
 * Optional service charge:
 * - fixed: { type: "FIXED", amount: Money }
 * - percent: { type: "PERCENT", value: number } where 10 = 10%
 */
export type ServiceChargeRule =
    | { type: "NONE" }
    | { type: "FIXED"; amount: Money }
    | { type: "PERCENT"; value: number };

export function quoteBooking(
    draft: BookingDraft,
    ratePlan: RatePlan,
    serviceChargeRule: ServiceChargeRule = {type: "NONE"}
): BookingQuote {
    if (draft.ratePlanId !== ratePlan.id) {
        throw new Error(`Draft ratePlanId does not match RatePlan.id`);
    }
    if (draft.roomTypeId !== ratePlan.roomTypeId) {
        throw new Error(`Draft roomTypeId does not match RatePlan.roomTypeId`);
    }

    const pricing = ratePlan.pricing;

    // Enumerate nights
    const nights = enumerateNights(draft.checkIn, draft.checkOut);
    const index = buildPricingIndex(pricing);

    // Resolve nightly prices
    const nightlyBreakdown: NightlyPriceLine[] = nights.map((d) =>
        resolveNightlyPrice(d, pricing, index)
    );

    // Subtotal
    let subtotal: Money = {currency: pricing.currency, amount: 0};
    for (const line of nightlyBreakdown) {
        ensureSameCurrency(subtotal, line.price);
        subtotal = addMoney(subtotal, line.price);
    }

    // Service charge
    let serviceCharge: Money | undefined;
    if (serviceChargeRule.type === "FIXED") {
        ensureSameCurrency(subtotal, serviceChargeRule.amount);
        serviceCharge = serviceChargeRule.amount;
    } else if (serviceChargeRule.type === "PERCENT") {
        const pct = serviceChargeRule.value;
        if (!Number.isFinite(pct) || pct < 0) throw new Error(`Invalid percent: ${pct}`);
        serviceCharge = {
            currency: subtotal.currency,
            amount: roundMoney(subtotal.amount * (pct / 100)),
        };
    }

    const total = serviceCharge ? addMoney(subtotal, serviceCharge) : subtotal;

    return {
        draft,
        nights: nights.length,
        nightlyBreakdown,
        subtotal,
        serviceCharge,
        total,
    };
}

// ---------- Example usage ----------
/*
const quote = quoteBooking(
  {
    listingId: "L1",
    roomTypeId: "R1",
    ratePlanId: "RP1",
    checkIn: "2026-04-10",
    checkOut: "2026-04-13",
    guests: 2,
  },
  ratePlan,
  { type: "PERCENT", value: 7.5 }
);

console.log(quote.nightlyBreakdown);
console.log(quote.total);
*/

export function getDisplayNightlyPrice(
    quote: BookingQuote,
    mode: DisplayNightlyPriceMode = "AVERAGE"
): NightlyDisplayPrice {
    if (quote.nights <= 0) throw new Error("Quote has no nights");

    const prices = quote.nightlyBreakdown.map((l) => l.price.amount);
    const currency = quote.total.currency;

    let amount: number;

    if (mode === "LOWEST") {
        amount = Math.min(...prices);
    } else if (mode === "HIGHEST") {
        amount = Math.max(...prices);
    } else {
        // AVERAGE
        const sum = prices.reduce((a, b) => a + b, 0);
        amount = sum / quote.nights;
    }

    return {
        mode,
        pricePerNight: {currency, amount: roundMoney(amount)},
    };
}

export function quoteBookingWithDisplayNightlyPrice(
    draft: BookingDraft,
    ratePlan: RatePlan,
    displayMode: DisplayNightlyPriceMode = "AVERAGE",
    serviceChargeRule: ServiceChargeRule = {type: "NONE"}
): { quote: BookingQuote; display: NightlyDisplayPrice } {
    const quote = quoteBooking(draft, ratePlan, serviceChargeRule);
    const display = getDisplayNightlyPrice(quote, displayMode);
    return {quote, display};
}
