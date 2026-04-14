"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanAndParseJson = cleanAndParseJson;
function cleanAndParseJson(input) {
    try {
        let cleaned = input.replace(/```json/g, '').replace(/```/g, '').trim();
        if (!/^({|\[)/.test(cleaned) || !/(}|\])$/.test(cleaned)) {
            return cleaned;
        }
        return JSON.parse(cleaned);
    }
    catch (err) {
        console.error('Failed to parse JSON:', err);
        return null;
    }
}
