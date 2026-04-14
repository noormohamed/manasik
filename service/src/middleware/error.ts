// middleware/error.ts
import { Context, Next } from 'koa';
import {getClientIp} from "./token";

export async function errorHandler(ctx: Context, next: Next) {
    try {
        await next();
    } catch (err: any) {
        const erro = await err;

        const body = {
            error: true,
            info: erro.info || 'Unknown',
            message: erro.message || 'Internal Server Error',
            statusCode: ctx.status
        };

        const ip = getClientIp(ctx);
        ctx.status = erro.statusCode || 500;
        ctx.body = body;
    }
}