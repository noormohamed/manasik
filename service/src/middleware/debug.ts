// middleware/error.ts
import { Context, Next } from 'koa';

export async function debugHandler(ctx: Context, next: Next) {
    await next();

    ctx.body = ctx.body || {};

    const hostname = ctx.hostname || '';

    let env = 'localhost';
    let directory = 'localhost';

    if(hostname !== 'localhost') {
        const prMatch = hostname.match(/^pr-(\d+)\./i);
        env = prMatch ? `pr-${prMatch[1]}` : 'LIVE';
        directory = env === 'LIVE' ? 'LIVE' : process.cwd();
    }

    // @ts-ignore
    const res = ctx.body;

    ctx.body = {};
    // @ts-ignore
    ctx.body.data = res;
    // @ts-ignore
    ctx.body.debug = {
        env,
        directory
    };
}