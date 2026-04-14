"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertISODate = assertISODate;
exports.assertISOMonth = assertISOMonth;
exports.toUTCDate = toUTCDate;
exports.formatISODateUTC = formatISODateUTC;
exports.getISOMonthFromDate = getISOMonthFromDate;
exports.roundMoney = roundMoney;
exports.ensureSameCurrency = ensureSameCurrency;
exports.addMoney = addMoney;
exports.mulMoney = mulMoney;
function assertISODate(date) {
    // basic guard: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error(`Invalid date format (expected YYYY-MM-DD): ${date}`);
    }
}
function assertISOMonth(month) {
    // basic guard: YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error(`Invalid month format (expected YYYY-MM): ${month}`);
    }
}
function toUTCDate(date) {
    // Parse as UTC midnight to avoid timezone drift
    assertISODate(date);
    return new Date(`${date}T00:00:00.000Z`);
}
function formatISODateUTC(d) {
    // d is expected to be UTC-normalized (midnight)
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function getISOMonthFromDate(date) {
    assertISODate(date);
    return date.slice(0, 7); // "YYYY-MM"
}
function roundMoney(amount) {
    // Keep it simple: 2dp rounding. If you later switch to minor units, remove this.
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}
function ensureSameCurrency(a, b) {
    if (a.currency !== b.currency) {
        throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
    }
}
function addMoney(a, b) {
    ensureSameCurrency(a, b);
    return { currency: a.currency, amount: roundMoney(a.amount + b.amount) };
}
function mulMoney(a, multiplier) {
    return { currency: a.currency, amount: roundMoney(a.amount * multiplier) };
}
