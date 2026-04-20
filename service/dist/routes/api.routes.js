"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const session_1 = require("../middleware/session");
const feature_flag_1 = require("../middleware/feature-flag");
const feature_flags_1 = require("../utils/feature-flags");
const auth_routes_1 = require("./auth.routes");
const user_routes_1 = require("./user.routes");
const hotel_routes_1 = require("../features/hotel/routes/hotel.routes");
const credits_routes_1 = require("./credits.routes");
const broker_routes_1 = require("./broker.routes");
const messaging_routes_1 = require("./messaging.routes");
const createApiRouter = (db) => {
    console.log('[API Router] Creating API router with db:', !!db);
    const router = new koa_router_1.default({ prefix: '/api' });
    router.get('/health', feature_flag_1.logFeatureFlags, (ctx) => {
        ctx.body = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            features: feature_flags_1.featureFlags.getStatus(),
        };
    });
    router.use(session_1.sessionMiddleware);
    router.use(auth_middleware_1.optionalAuthMiddleware);
    if (feature_flags_1.featureFlags.isEnabled('auth')) {
        router.use((0, feature_flag_1.requireFeature)('auth'));
        router.use(auth_routes_1.authRoutes.routes());
        router.use(auth_routes_1.authRoutes.allowedMethods());
    }
    if (feature_flags_1.featureFlags.isEnabled('users')) {
        router.use((0, feature_flag_1.requireFeature)('users'));
        router.use(user_routes_1.userRoutes.routes());
        router.use(user_routes_1.userRoutes.allowedMethods());
    }
    if (feature_flags_1.featureFlags.isEnabled('hotels')) {
        const hotelRoutes = (0, hotel_routes_1.createHotelRoutes)();
        router.use(hotelRoutes.routes());
        router.use(hotelRoutes.allowedMethods());
    }
    // Credits routes (always enabled)
    const creditsRoutes = (0, credits_routes_1.createCreditsRoutes)();
    router.use(creditsRoutes.routes());
    router.use(creditsRoutes.allowedMethods());
    // Broker routes (always enabled)
    router.use(broker_routes_1.brokerRoutes.routes());
    router.use(broker_routes_1.brokerRoutes.allowedMethods());
    // Messaging routes (always enabled)
    console.log('[API Router] Initializing messaging routes');
    if (db) {
        console.log('[API Router] Database provided, calling initializeMessagingRoutes');
        (0, messaging_routes_1.initializeMessagingRoutes)(db);
    }
    else {
        console.log('[API Router] No database provided!');
    }
    const messagingRouter = (0, messaging_routes_1.createMessagingRouter)();
    console.log('[API Router] Messaging router created, mounting...');
    router.use(messagingRouter.routes());
    router.use(messagingRouter.allowedMethods());
    console.log('[API Router] Messaging router mounted');
    return router;
};
exports.createApiRouter = createApiRouter;
