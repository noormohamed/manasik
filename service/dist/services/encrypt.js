"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashSHA256 = hashSHA256;
exports.md5Hash = md5Hash;
const crypto_1 = __importDefault(require("crypto"));
function hashSHA256(input) {
    return crypto_1.default.createHash('sha256').update(input).digest('hex').substring(0, 15); // first 15 characters;
}
function md5Hash(input) {
    return crypto_1.default.createHash("md5").update(input).digest("hex");
}
