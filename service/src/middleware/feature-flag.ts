/**
 * Feature Flag Middleware
 * Checks if an endpoint is enabled before allowing access
 */

import { Context, Next } from 'koa';
import { featureFlags, FeatureFlags } from '../utils/feature-flags';

/**
 * Create a middleware that checks if a feature is enabled
 */
export const requireFeature = (feature: keyof FeatureFlags) => {
  return async (ctx: Context, next: Next) => {
    if (!featureFlags.isEnabled(feature)) {
      ctx.status = 403;
      ctx.body = {
        error: 'Feature is disabled',
        feature,
      };
      return;
    }

    await next();
  };
};

/**
 * Middleware to log feature flag status on startup
 */
export const logFeatureFlags = async (ctx: Context, next: Next) => {
  if (ctx.path === '/api/health') {
    const flags = featureFlags.getStatus();
    console.log('📋 Feature Flags Status:');
    Object.entries(flags).forEach(([key, value]) => {
      const status = value ? '✅' : '❌';
      console.log(`  ${status} ${key}`);
    });
  }
  await next();
};
