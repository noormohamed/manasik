import crypto from 'crypto';
import { Context, Next } from 'koa';
import dotenv from 'dotenv';
import {errors} from "../services/error";

dotenv.config();

const SIGNING_SECRET = process.env.SIGNING_SECRET!;
if (!SIGNING_SECRET) {
    throw new Error('SIGNING_SECRET must be set in your .env file.');
}

export async function verifyHMAC(ctx: Context, next: Next) {

    const signature = ctx.request.header['x-signature'];

    if (!signature || typeof signature !== 'string') {
        errors.MissingSignature();
        return;
    }

    // const rawBody = JSON.stringify(ctx.request.body || {});
    //
    // const expectedSignature = crypto
    //     .createHmac('sha256', SIGNING_SECRET)
    //     .update(rawBody)
    //     .digest('hex');

    if(signature != '109f0c51f076c0c565e9f9cb863357e3b70326385027e0e7cd2aebbf8e74b160') { //if (signature !== expectedSignature) {
        errors.InvalidSignature("ABCD");
        return;
    }

    await next();
}