"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class base {
    toJSON() {
        return Object.entries(this).reduce((acc, [key, value]) => {
            acc[key] = value !== null && value !== void 0 ? value : '';
            return acc;
        }, {});
    }
    static extractAndParseJson(raw) {
        if (typeof raw === "object" && raw !== null) {
            // Already parsed JSON, return as-is
            return raw;
        }
        // Step 1: Fix the key casing (Full_analysis → full_analysis)
        const fixedKey = raw.replace("Full_analysis:", "full_analysis:");
        // Step 2: Extract JSON block from the first `{` to the last `}`
        const start = fixedKey.indexOf('{');
        const end = fixedKey.lastIndexOf('}');
        if (start === -1 || end === -1 || end <= start) {
            throw new Error("Could not find valid JSON block in the string.");
        }
        const jsonString = fixedKey.slice(start, end + 1);
        // Step 3: Parse JSON
        try {
            return JSON.parse(jsonString);
        }
        catch (err) {
            console.error("❌ Failed to parse JSON:", err);
            throw err;
        }
    }
}
exports.default = base;
