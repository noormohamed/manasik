// middleware/error.ts
import { Context, Next } from 'koa';

export async function adminOnly(ctx: Context, next: Next) {

    if(ctx.token.level !== Number(1)) {
        ctx.throw(401, 'Permission Denied');
    }

    await next();
}