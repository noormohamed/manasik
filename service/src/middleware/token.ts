import { Context, Next } from 'koa';
import dotenv from 'dotenv';
// import {errors} from "../services/error";
import jwt from 'jsonwebtoken';

dotenv.config();

const SIGNING_SECRET = process.env.SIGNING_SECRET!;
if (!SIGNING_SECRET) {
    throw new Error('SIGNING_SECRET must be set in your .env file.');
}

// In-memory cache: token -> { payload, expiresAt }
const tokenCache = new Map<string, { payload: any; expiresAt: number }>();

export function getClientIp(ctx: Context): string {
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

export async function verifyToken(ctx: Context, next: Next) {
    const token = ctx.request.header['x-signature'] as string;

    try {
        if (!token) {
            ctx.throw(401, 'Missing x-signature header');
            return;
        }

        const now = Date.now();
        const cached = tokenCache.get(token);

        if (cached && cached.expiresAt > now) {
            ctx.token = cached.payload;
        } else {
            // Verify token if not cached
            const decoded: any = jwt.verify(token, SIGNING_SECRET);

            // Validate IP
            const reqIp = getClientIp(ctx);

            // Validate IP
            if (decoded.ip !== reqIp) {
                ctx.throw(403, 'Token IP mismatch');
                return;
            }

            let expiresAt = now; // + 0 * 60 * 1000;
            if(decoded.accountId === "") {
                expiresAt = now;
            }

            // Cache decoded payload for 5 mins
            tokenCache.set(token, {
                payload: decoded,
                expiresAt: expiresAt, // 5 minutes
            });

            ctx.token = decoded;
        }
    } catch (e) {
        console.error('Token verification error:', e);
        return;
    }

    await next();
}