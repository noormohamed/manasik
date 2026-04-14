// ---------- Utilities ----------
import {Money} from "./typing";

export function assertISODate(date: string): void {
    // basic guard: YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new Error(`Invalid date format (expected YYYY-MM-DD): ${date}`);
    }
}

export function assertISOMonth(month: string): void {
    // basic guard: YYYY-MM
    if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error(`Invalid month format (expected YYYY-MM): ${month}`);
    }
}

export function toUTCDate(date: string): Date {
    // Parse as UTC midnight to avoid timezone drift
    assertISODate(date);
    return new Date(`${date}T00:00:00.000Z`);
}

export function formatISODateUTC(d: Date): string {
    // d is expected to be UTC-normalized (midnight)
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const day = String(d.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function getISOMonthFromDate(date: string): string {
    assertISODate(date);
    return date.slice(0, 7); // "YYYY-MM"
}

export function roundMoney(amount: number): number {
    // Keep it simple: 2dp rounding. If you later switch to minor units, remove this.
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function ensureSameCurrency(a: Money, b: Money): void {
    if (a.currency !== b.currency) {
        throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
    }
}

export function addMoney(a: Money, b: Money): Money {
    ensureSameCurrency(a, b);
    return { currency: a.currency, amount: roundMoney(a.amount + b.amount) };
}

export function mulMoney(a: Money, multiplier: number): Money {
    return { currency: a.currency, amount: roundMoney(a.amount * multiplier) };
}
