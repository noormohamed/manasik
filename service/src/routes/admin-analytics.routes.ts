/**
 * Admin Analytics Routes - Analytics dashboard API endpoint
 */

import Router from 'koa-router';
import { Database } from '../database/connection';
import { adminAuthService } from '../services/admin-auth.service';
import { AnalyticsService } from '../services/admin-analytics.service';

export function createAnalyticsRouter(db: Database): Router {
  const router = new Router({ prefix: '/api/admin' });
  const analyticsService = new AnalyticsService(db);

  /**
   * GET /api/admin/analytics
   * Get aggregated analytics dashboard data
   */
  router.get('/analytics', async (ctx: any) => {
    try {
      // Authenticate using existing pattern from admin.routes.ts
      const authHeader = ctx.get('authorization');
      const token = adminAuthService.extractToken(authHeader);

      if (!token) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          error: 'No token provided',
        };
        return;
      }

      const payload = adminAuthService.verifyAccessToken(token);

      if (!payload) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          error: 'Invalid or expired token',
        };
        return;
      }

      // Parse and validate range query parameter
      const rawRange = Number(ctx.query.range);
      const range = ([7, 30, 90].includes(rawRange) ? rawRange : 30) as 7 | 30 | 90;

      const data = await analyticsService.getAnalytics({ range });

      ctx.body = data;
    } catch (error) {
      console.error('Analytics endpoint error:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        error: 'Failed to load analytics data',
      };
    }
  });

  return router;
}
