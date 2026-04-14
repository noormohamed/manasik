"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientIp = getClientIp;
exports.verifyToken = verifyToken;
const dotenv_1 = __importDefault(require("dotenv"));
// import {errors} from "../services/error";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const SIGNING_SECRET = process.env.SIGNING_SECRET;
if (!SIGNING_SECRET) {
    throw new Error('SIGNING_SECRET must be set in your .env file.');
}
// In-memory cache: token -> { payload, expiresAt }
const tokenCache = new Map();
function getClientIp(ctx) {
    const headers = ctx.request.headers;
    // 1) Cloudflare-specific header
    const cfConnectingIp = headers["cf-connecting-ip"];
    if (typeof cfConnectingIp === "string" && cfConnectingIp.length > 0) {
        return cfConnectingIp;
    }
    // 2) Common reverse proxy headers (if you’re ever behind Nginx too)
    const xRealIp = headers["x-real-ip"];
    if (typeof xRealIp === "string" && xRealIp.length > 0) {
        return xRealIp;
    }
    const xForwardedFor = headers["x-forwarded-for"];
    if (typeof xForwardedFor === "string" && xForwardedFor.length > 0) {
        // First IP in the list is the original client
        return xForwardedFor.split(",")[0].trim();
    }
    // 3) Fallback – direct connection / no proxy
    return ctx.request.ip;
}
function verifyToken(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = ctx.request.header['x-signature'];
        try {
            if (!token) {
                ctx.throw(401, 'Missing x-signature header');
                return;
            }
            const now = Date.now();
            const cached = tokenCache.get(token);
            if (cached && cached.expiresAt > now) {
                ctx.token = cached.payload;
            }
            else {
                // Verify token if not cached
                const decoded = jsonwebtoken_1.default.verify(token, SIGNING_SECRET);
                // Validate IP
                const reqIp = getClientIp(ctx);
                // Validate IP
                if (decoded.ip !== reqIp) {
                    ctx.throw(403, 'Token IP mismatch');
                    return;
                }
                let expiresAt = now; // + 0 * 60 * 1000;
                if (decoded.accountId === "") {
                    expiresAt = now;
                }
                // Cache decoded payload for 5 mins
                tokenCache.set(token, {
                    payload: decoded,
                    expiresAt: expiresAt, // 5 minutes
                });
                ctx.token = decoded;
            }
        }
        catch (e) {
            console.error('Token verification error:', e);
            return;
        }
        yield next();
    });
}
