/**
 * Error Handler Middleware
 * Catches all errors and formats them consistently
 */

import { Context, Next } from 'koa';
import { AppError, ErrorHandlerService } from '../services/error-handler.service';

/**
 * Global error handler middleware
 * Should be applied first in the middleware chain
 */
export async function errorHandlerMiddleware(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err: any) {
    ErrorHandlerService.handleError(ctx, err);
  }
}

/**
 * 404 Not Found handler
 * Should be applied last in the middleware chain
 */
export async function notFoundHandler(ctx: Context) {
  ctx.status = 404;
  ctx.body = {
    error: 'Not Found',
    code: 'NOT_FOUND',
    path: ctx.path,
  };
}
