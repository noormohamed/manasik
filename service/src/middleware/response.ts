import { Context, Next } from 'koa';

/**
 * Response wrapper middleware
 * Wraps all successful responses in a { data: ... } structure
 */
export async function responseWrapper(ctx: Context, next: Next) {
  await next();

  // Only wrap successful responses (2xx status codes)
  if (ctx.status >= 200 && ctx.status < 300 && ctx.body) {
    // If body is already wrapped in data, don't double-wrap
    if (typeof ctx.body === 'object' && 'data' in ctx.body) {
      return;
    }

    // Wrap the response
    ctx.body = {
      data: ctx.body,
    };
  }
}
