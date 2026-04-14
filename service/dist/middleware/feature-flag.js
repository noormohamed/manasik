"use strict";
/**
 * Feature Flag Middleware
 * Checks if an endpoint is enabled before allowing access
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logFeatureFlags = exports.requireFeature = void 0;
const feature_flags_1 = require("../utils/feature-flags");
/**
 * Create a middleware that checks if a feature is enabled
 */
const requireFeature = (feature) => {
    return (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!feature_flags_1.featureFlags.isEnabled(feature)) {
            ctx.status = 403;
            ctx.body = {
                error: 'Feature is disabled',
                feature,
            };
            return;
        }
        yield next();
    });
};
exports.requireFeature = requireFeature;
/**
 * Middleware to log feature flag status on startup
 */
const logFeatureFlags = (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (ctx.path === '/api/health') {
        const flags = feature_flags_1.featureFlags.getStatus();
        console.log('📋 Feature Flags Status:');
        Object.entries(flags).forEach(([key, value]) => {
            const status = value ? '✅' : '❌';
            console.log(`  ${status} ${key}`);
        });
    }
    yield next();
});
exports.logFeatureFlags = logFeatureFlags;
