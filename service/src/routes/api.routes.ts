import Router from 'koa-router';
import { Context } from 'koa';
import { optionalAuthMiddleware } from '../middleware/auth.middleware';
import { sessionMiddleware } from '../middleware/session';
import { requireFeature, logFeatureFlags } from '../middleware/feature-flag';
import { featureFlags } from '../utils/feature-flags';
import { authRoutes } from './auth.routes';
import { userRoutes } from './user.routes';
import { createHotelRoutes } from '../features/hotel/routes/hotel.routes';
import { createCreditsRoutes } from './credits.routes';
import { brokerRoutes } from './broker.routes';

export const createApiRouter = () => {
    const router = new Router({ prefix: '/api' });

    router.get('/health', logFeatureFlags, (ctx: Context) => {
        ctx.body = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            features: featureFlags.getStatus(),
        };
    });

    router.use(sessionMiddleware);
    router.use(optionalAuthMiddleware);

    if (featureFlags.isEnabled('auth')) {
        router.use(requireFeature('auth'));
        router.use(authRoutes.routes());
        router.use(authRoutes.allowedMethods());
    }

    if (featureFlags.isEnabled('users')) {
        router.use(requireFeature('users'));
        router.use(userRoutes.routes());
        router.use(userRoutes.allowedMethods());
    }

    if (featureFlags.isEnabled('hotels')) {
        const hotelRoutes = createHotelRoutes();
        router.use(hotelRoutes.routes());
        router.use(hotelRoutes.allowedMethods());
    }

    // Credits routes (always enabled)
    const creditsRoutes = createCreditsRoutes();
    router.use(creditsRoutes.routes());
    router.use(creditsRoutes.allowedMethods());

    // Broker routes (always enabled)
    router.use(brokerRoutes.routes());
    router.use(brokerRoutes.allowedMethods());

    return router;
};
