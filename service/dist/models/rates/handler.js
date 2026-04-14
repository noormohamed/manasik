"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enumerateNights = enumerateNights;
exports.buildPricingIndex = buildPricingIndex;
exports.resolveNightlyPrice = resolveNightlyPrice;
exports.quoteBooking = quoteBooking;
exports.getDisplayNightlyPrice = getDisplayNightlyPrice;
exports.quoteBookingWithDisplayNightlyPrice = quoteBookingWithDisplayNightlyPrice;
const utils_1 = require("./utils");
/**
 * Returns an array of ISO dates for each night stayed.
 * checkIn inclusive, checkOut exclusive.
 *
 * Example: 2026-04-01 -> 2026-04-04 returns:
 * ["2026-04-01", "2026-04-02", "2026-04-03"]
 */
function enumerateNights(checkIn, checkOut) {
    const start = (0, utils_1.toUTCDate)(checkIn);
    const end = (0, utils_1.toUTCDate)(checkOut);
    if (!(start < end)) {
        throw new Error(`checkOut must be after checkIn: ${checkIn} -> ${checkOut}`);
    }
    const nights = [];
    let cur = new Date(start.getTime());
    while (cur < end) {
        nights.push((0, utils_1.formatISODateUTC)(cur));
        cur.setUTCDate(cur.getUTCDate() + 1);
    }
    return nights;
}
/**
 * Builds fast lookup maps for overrides and month rules.
 */
function buildPricingIndex(pricing) {
    var _a;
    const overrideByDate = new Map();
    for (const o of (_a = pricing.dateOverrides) !== null && _a !== void 0 ? _a : []) {
        (0, utils_1.assertISODate)(o.date);
        overrideByDate.set(o.date, o);
    }
    const monthRuleByMonth = new Map();
    for (const m of pricing.monthlyDailyPrices) {
        (0, utils_1.assertISOMonth)(m.month);
        monthRuleByMonth.set(m.month, m);
    }
    return { overrideByDate, monthRuleByMonth };
}
/**
 * Resolves the nightly price for a specific date:
 * DATE_OVERRIDE > MONTH_RULE > DEFAULT
 */
function resolveNightlyPrice(date, pricing, index) {
    (0, utils_1.assertISODate)(date);
    const { overrideByDate, monthRuleByMonth } = index !== null && index !== void 0 ? index : buildPricingIndex(pricing);
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
    const month = (0, utils_1.getISOMonthFromDate)(date);
    const monthRule = monthRuleByMonth.get(month);
    if (monthRule) {
        return { date, price: monthRule.dailyPrice, source: "MONTH_RULE" };
    }
    return { date, price: pricing.defaultDailyPrice, source: "DEFAULT" };
}
function quoteBooking(draft, ratePlan, serviceChargeRule = { type: "NONE" }) {
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
    const nightlyBreakdown = nights.map((d) => resolveNightlyPrice(d, pricing, index));
    // Subtotal
    let subtotal = { currency: pricing.currency, amount: 0 };
    for (const line of nightlyBreakdown) {
        (0, utils_1.ensureSameCurrency)(subtotal, line.price);
        subtotal = (0, utils_1.addMoney)(subtotal, line.price);
    }
    // Service charge
    let serviceCharge;
    if (serviceChargeRule.type === "FIXED") {
        (0, utils_1.ensureSameCurrency)(subtotal, serviceChargeRule.amount);
        serviceCharge = serviceChargeRule.amount;
    }
    else if (serviceChargeRule.type === "PERCENT") {
        const pct = serviceChargeRule.value;
        if (!Number.isFinite(pct) || pct < 0)
            throw new Error(`Invalid percent: ${pct}`);
        serviceCharge = {
            currency: subtotal.currency,
            amount: (0, utils_1.roundMoney)(subtotal.amount * (pct / 100)),
        };
    }
    const total = serviceCharge ? (0, utils_1.addMoney)(subtotal, serviceCharge) : subtotal;
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
function getDisplayNightlyPrice(quote, mode = "AVERAGE") {
    if (quote.nights <= 0)
        throw new Error("Quote has no nights");
    const prices = quote.nightlyBreakdown.map((l) => l.price.amount);
    const currency = quote.total.currency;
    let amount;
    if (mode === "LOWEST") {
        amount = Math.min(...prices);
    }
    else if (mode === "HIGHEST") {
        amount = Math.max(...prices);
    }
    else {
        // AVERAGE
        const sum = prices.reduce((a, b) => a + b, 0);
        amount = sum / quote.nights;
    }
    return {
        mode,
        pricePerNight: { currency, amount: (0, utils_1.roundMoney)(amount) },
    };
}
function quoteBookingWithDisplayNightlyPrice(draft, ratePlan, displayMode = "AVERAGE", serviceChargeRule = { type: "NONE" }) {
    const quote = quoteBooking(draft, ratePlan, serviceChargeRule);
    const display = getDisplayNightlyPrice(quote, displayMode);
    return { quote, display };
}
