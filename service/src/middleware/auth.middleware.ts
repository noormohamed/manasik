/**
 * Authentication Middleware - JWT verification
 */

import { Context, Next } from 'koa';
import { authService, JWTPayload } from '../services/auth.service';

export interface AuthContext extends Context {
  user?: JWTPayload;
}

/**
 * Middleware to verify JWT token
 */
export async function authMiddleware(ctx: AuthContext, next: Next) {
  try {
    const authHeader = ctx.headers.authorization;
    const token = authService.extractToken(authHeader);

    if (!token) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Missing or invalid authorization header',
      };
      return;
    }

    const payload = authService.verifyAccessToken(token);
    if (!payload) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Invalid or expired token',
      };
      return;
    }

    // Set both ctx.user and ctx.state for compatibility
    ctx.user = payload;
    ctx.state.user = payload;
    ctx.state.userId = payload.userId;
    
    await next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      error: 'Authentication error',
    };
  }
}

/**
 * Middleware to verify JWT token (optional)
 */
export async function optionalAuthMiddleware(ctx: AuthContext, next: Next) {
  try {
    const authHeader = ctx.headers.authorization;
    const token = authService.extractToken(authHeader);

    if (token) {
      const payload = authService.verifyAccessToken(token);
      if (payload) {
        ctx.user = payload;
      }
    }

    await next();
  } catch (error) {
    // Continue without user
    await next();
  }
}

/**
 * Middleware to require specific role
 */
export function requireRole(...roles: string[]) {
  return async (ctx: AuthContext, next: Next) => {
    if (!ctx.user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Authentication required',
      };
      return;
    }

    if (!roles.includes(ctx.user.role)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error: `Forbidden. Required roles: ${roles.join(', ')}`,
      };
      return;
    }

    await next();
  };
}

/**
 * Middleware to require specific permission
 */
export function requirePermission(permission: string) {
  return async (ctx: AuthContext, next: Next) => {
    if (!ctx.user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Authentication required',
      };
      return;
    }

    // Import here to avoid circular dependency
    const { permissionService } = await import('../services/permission.service');
    
    if (!permissionService.hasPermission(ctx.user, permission as any)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error: `Forbidden. Required permission: ${permission}`,
      };
      return;
    }

    await next();
  };
}

/**
 * Middleware to require company access
 */
export function requireCompanyAccess() {
  return async (ctx: AuthContext, next: Next) => {
    if (!ctx.user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Authentication required',
      };
      return;
    }

    const companyId = ctx.params.companyId || (ctx as any).request?.body?.companyId;
    if (!companyId) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'Company ID required',
      };
      return;
    }

    const { permissionService } = await import('../services/permission.service');
    
    if (!permissionService.canAccessCompanyResource(ctx.user, companyId)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error: 'You do not have access to this company',
      };
      return;
    }

    await next();
  };
}

/**
 * Middleware to require user access
 */
export function requireUserAccess() {
  return async (ctx: AuthContext, next: Next) => {
    if (!ctx.user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        error: 'Authentication required',
      };
      return;
    }

    const userId = ctx.params.userId;
    if (!userId) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        error: 'User ID required',
      };
      return;
    }

    const { permissionService } = await import('../services/permission.service');
    
    if (!permissionService.canAccessUserResource(ctx.user, userId)) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        error: 'You do not have access to this user',
      };
      return;
    }

    await next();
  };
}
