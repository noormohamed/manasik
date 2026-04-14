"use strict";
// pricing.spec.ts
// Jest unit tests for your pricing/quote functions.
//
// Assumes your functions are exported from "./pricing" (adjust import path)
// and types are in "./typing".
//
// Run: npm test (or jest)
Object.defineProperty(exports, "__esModule", { value: true });
const handler_1 = require("./handler"); // <-- change to your actual module name/file
describe("pricing engine", () => {
    const GBP = "GBP";
    const makeRatePlan = (pricing) => ({
        id: "RP1",
        listingId: "L1",
        name: "Standard Rate",
        roomTypeId: "RT1",
        pricing,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
    });
    const makeDraft = (overrides) => (Object.assign({ listingId: "L1", roomTypeId: "RT1", ratePlanId: "RP1", checkIn: "2026-04-10", checkOut: "2026-04-13", guests: 2 }, overrides));
    const basePricing = {
        currency: GBP,
        defaultDailyPrice: { currency: GBP, amount: 150 },
        monthlyDailyPrices: [
            { id: "M1", ratePlanId: "RP1", month: "2026-04", dailyPrice: { currency: GBP, amount: 199 } },
            { id: "M2", ratePlanId: "RP1", month: "2026-07", dailyPrice: { currency: GBP, amount: 299 } },
        ],
        dateOverrides: [
            // override one specific day in April
            { id: "O1", ratePlanId: "RP1", date: "2026-04-11", dailyPrice: { currency: GBP, amount: 250 }, reason: "Event" },
        ],
    };
    describe("enumerateNights", () => {
        it("returns each night between check-in (inclusive) and check-out (exclusive)", () => {
            expect((0, handler_1.enumerateNights)("2026-04-01", "2026-04-04")).toEqual([
                "2026-04-01",
                "2026-04-02",
                "2026-04-03",
            ]);
        });
        it("throws if checkOut is not after checkIn", () => {
            expect(() => (0, handler_1.enumerateNights)("2026-04-01", "2026-04-01")).toThrow(/checkOut must be after checkIn/i);
            expect(() => (0, handler_1.enumerateNights)("2026-04-02", "2026-04-01")).toThrow(/checkOut must be after checkIn/i);
        });
    });
    describe("buildPricingIndex", () => {
        it("indexes month rules and date overrides", () => {
            var _a, _b, _c;
            const idx = (0, handler_1.buildPricingIndex)(basePricing);
            expect((_a = idx.monthRuleByMonth.get("2026-04")) === null || _a === void 0 ? void 0 : _a.dailyPrice.amount).toBe(199);
            expect((_b = idx.monthRuleByMonth.get("2026-07")) === null || _b === void 0 ? void 0 : _b.dailyPrice.amount).toBe(299);
            expect((_c = idx.overrideByDate.get("2026-04-11")) === null || _c === void 0 ? void 0 : _c.dailyPrice.amount).toBe(250);
        });
        it("works when dateOverrides is undefined", () => {
            var _a;
            const pricing = Object.assign(Object.assign({}, basePricing), { dateOverrides: undefined });
            const idx = (0, handler_1.buildPricingIndex)(pricing);
            expect(idx.overrideByDate.size).toBe(0);
            expect((_a = idx.monthRuleByMonth.get("2026-04")) === null || _a === void 0 ? void 0 : _a.dailyPrice.amount).toBe(199);
        });
    });
    describe("resolveNightlyPrice", () => {
        it("uses DATE_OVERRIDE when present (wins over month rule)", () => {
            const idx = (0, handler_1.buildPricingIndex)(basePricing);
            const line = (0, handler_1.resolveNightlyPrice)("2026-04-11", basePricing, idx);
            expect(line.source).toBe("DATE_OVERRIDE");
            expect(line.price.amount).toBe(250);
            expect(line.reason).toBe("Event");
        });
        it("uses MONTH_RULE when no override exists", () => {
            const idx = (0, handler_1.buildPricingIndex)(basePricing);
            const line = (0, handler_1.resolveNightlyPrice)("2026-04-10", basePricing, idx);
            expect(line.source).toBe("MONTH_RULE");
            expect(line.price.amount).toBe(199);
        });
        it("falls back to DEFAULT when no month rule exists", () => {
            const idx = (0, handler_1.buildPricingIndex)(basePricing);
            const line = (0, handler_1.resolveNightlyPrice)("2026-05-01", basePricing, idx);
            expect(line.source).toBe("DEFAULT");
            expect(line.price.amount).toBe(150);
        });
        it("throws if date is blocked", () => {
            var _a;
            const pricing = Object.assign(Object.assign({}, basePricing), { dateOverrides: [
                    ...((_a = basePricing.dateOverrides) !== null && _a !== void 0 ? _a : []),
                    { id: "O_BLOCK", ratePlanId: "RP1", date: "2026-04-12", dailyPrice: { currency: GBP, amount: 0 }, isBlocked: true, reason: "Maintenance" },
                ] });
            const idx = (0, handler_1.buildPricingIndex)(pricing);
            expect(() => (0, handler_1.resolveNightlyPrice)("2026-04-12", pricing, idx)).toThrow(/blocked/i);
        });
    });
    describe("quoteBooking", () => {
        it("computes nightly breakdown and subtotal using overrides + month pricing", () => {
            const ratePlan = makeRatePlan(basePricing);
            const draft = makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-13" }); // 10,11,12
            const quote = (0, handler_1.quoteBooking)(draft, ratePlan);
            expect(quote.nights).toBe(3);
            expect(quote.nightlyBreakdown.map(l => ({ date: l.date, amt: l.price.amount, src: l.source }))).toEqual([
                { date: "2026-04-10", amt: 199, src: "MONTH_RULE" },
                { date: "2026-04-11", amt: 250, src: "DATE_OVERRIDE" },
                { date: "2026-04-12", amt: 199, src: "MONTH_RULE" },
            ]);
            // subtotal = 199 + 250 + 199 = 648
            expect(quote.subtotal.currency).toBe(GBP);
            expect(quote.subtotal.amount).toBe(648);
            expect(quote.total.amount).toBe(648);
        });
        it("adds FIXED service charge", () => {
            var _a;
            const ratePlan = makeRatePlan(basePricing);
            const draft = makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-13" });
            const quote = (0, handler_1.quoteBooking)(draft, ratePlan, { type: "FIXED", amount: { currency: GBP, amount: 10 } });
            expect(quote.subtotal.amount).toBe(648);
            expect((_a = quote.serviceCharge) === null || _a === void 0 ? void 0 : _a.amount).toBe(10);
            expect(quote.total.amount).toBe(658);
        });
        it("adds PERCENT service charge (rounded)", () => {
            var _a;
            const ratePlan = makeRatePlan(basePricing);
            const draft = makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-13" });
            // 7.5% of 648 = 48.6
            const quote = (0, handler_1.quoteBooking)(draft, ratePlan, { type: "PERCENT", value: 7.5 });
            expect(quote.subtotal.amount).toBe(648);
            expect((_a = quote.serviceCharge) === null || _a === void 0 ? void 0 : _a.amount).toBe(48.6);
            expect(quote.total.amount).toBe(696.6);
        });
        it("throws on negative percent service charge", () => {
            const ratePlan = makeRatePlan(basePricing);
            const draft = makeDraft();
            expect(() => (0, handler_1.quoteBooking)(draft, ratePlan, { type: "PERCENT", value: -1 })).toThrow(/invalid percent/i);
        });
        it("throws if draft.ratePlanId doesn't match ratePlan.id", () => {
            const ratePlan = makeRatePlan(basePricing);
            const draft = makeDraft({ ratePlanId: "RP_DIFFERENT" });
            expect(() => (0, handler_1.quoteBooking)(draft, ratePlan)).toThrow(/ratePlanId does not match/i);
        });
        it("throws if draft.roomTypeId doesn't match ratePlan.roomTypeId", () => {
            const ratePlan = makeRatePlan(basePricing);
            const draft = makeDraft({ roomTypeId: "RT_DIFFERENT" });
            expect(() => (0, handler_1.quoteBooking)(draft, ratePlan)).toThrow(/roomTypeId does not match/i);
        });
        it("throws if currencies mismatch inside pricing lines", () => {
            const badPricing = Object.assign(Object.assign({}, basePricing), { 
                // month rule currency differs
                monthlyDailyPrices: [
                    { id: "M_BAD", ratePlanId: "RP1", month: "2026-04", dailyPrice: { currency: "EUR", amount: 199 } },
                ], dateOverrides: undefined });
            const ratePlan = makeRatePlan(badPricing);
            const draft = makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-11" });
            expect(() => (0, handler_1.quoteBooking)(draft, ratePlan)).toThrow(/currency mismatch/i);
        });
        it("throws if any night is blocked (via override)", () => {
            var _a;
            const pricing = Object.assign(Object.assign({}, basePricing), { dateOverrides: [
                    ...((_a = basePricing.dateOverrides) !== null && _a !== void 0 ? _a : []),
                    { id: "O_BLOCK", ratePlanId: "RP1", date: "2026-04-12", dailyPrice: { currency: GBP, amount: 0 }, isBlocked: true },
                ] });
            const ratePlan = makeRatePlan(pricing);
            const draft = makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-13" });
            expect(() => (0, handler_1.quoteBooking)(draft, ratePlan)).toThrow(/blocked/i);
        });
    });
    describe("getDisplayNightlyPrice", () => {
        it("returns AVERAGE per night (rounded)", () => {
            const ratePlan = makeRatePlan(basePricing);
            const draft = makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-13" }); // 199,250,199 => avg 216
            const quote = (0, handler_1.quoteBooking)(draft, ratePlan);
            const display = (0, handler_1.getDisplayNightlyPrice)(quote, "AVERAGE");
            expect(display.mode).toBe("AVERAGE");
            expect(display.pricePerNight.currency).toBe(GBP);
            expect(display.pricePerNight.amount).toBe(216); // (648 / 3)
        });
        it("returns LOWEST per night", () => {
            const ratePlan = makeRatePlan(basePricing);
            const quote = (0, handler_1.quoteBooking)(makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-13" }), ratePlan);
            const display = (0, handler_1.getDisplayNightlyPrice)(quote, "LOWEST");
            expect(display.pricePerNight.amount).toBe(199);
        });
        it("returns HIGHEST per night", () => {
            const ratePlan = makeRatePlan(basePricing);
            const quote = (0, handler_1.quoteBooking)(makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-13" }), ratePlan);
            const display = (0, handler_1.getDisplayNightlyPrice)(quote, "HIGHEST");
            expect(display.pricePerNight.amount).toBe(250);
        });
        it("throws if quote has no nights", () => {
            const quoteLike = {
                draft: makeDraft(),
                nights: 0,
                nightlyBreakdown: [],
                subtotal: { currency: GBP, amount: 0 },
                total: { currency: GBP, amount: 0 },
            };
            expect(() => (0, handler_1.getDisplayNightlyPrice)(quoteLike, "AVERAGE")).toThrow(/no nights/i);
        });
    });
    describe("quoteBookingWithDisplayNightlyPrice", () => {
        it("returns both quote and display price", () => {
            var _a;
            const ratePlan = makeRatePlan(basePricing);
            const draft = makeDraft({ checkIn: "2026-04-10", checkOut: "2026-04-13" });
            const { quote, display } = (0, handler_1.quoteBookingWithDisplayNightlyPrice)(draft, ratePlan, "AVERAGE", { type: "PERCENT", value: 10 });
            // Subtotal is 648, service 64.8, total 712.8
            expect(quote.subtotal.amount).toBe(648);
            expect((_a = quote.serviceCharge) === null || _a === void 0 ? void 0 : _a.amount).toBe(64.8);
            expect(quote.total.amount).toBe(712.8);
            // Display price per night should still be based on nightly breakdown (avg 216)
            expect(display.pricePerNight.amount).toBe(216);
        });
    });
});
