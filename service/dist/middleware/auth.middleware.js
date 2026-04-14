"use strict";
/**
 * Authentication Middleware - JWT verification
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
exports.requireRole = requireRole;
exports.requirePermission = requirePermission;
exports.requireCompanyAccess = requireCompanyAccess;
exports.requireUserAccess = requireUserAccess;
const auth_service_1 = require("../services/auth.service");
/**
 * Middleware to verify JWT token
 */
function authMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = ctx.headers.authorization;
            const token = auth_service_1.authService.extractToken(authHeader);
            if (!token) {
                ctx.status = 401;
                ctx.body = {
                    success: false,
                    error: 'Missing or invalid authorization header',
                };
                return;
            }
            const payload = auth_service_1.authService.verifyAccessToken(token);
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
            yield next();
        }
        catch (error) {
            console.error('[Auth Middleware] Error:', error);
            ctx.status = 500;
            ctx.body = {
                success: false,
                error: 'Authentication error',
            };
        }
    });
}
/**
 * Middleware to verify JWT token (optional)
 */
function optionalAuthMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = ctx.headers.authorization;
            const token = auth_service_1.authService.extractToken(authHeader);
            if (token) {
                const payload = auth_service_1.authService.verifyAccessToken(token);
                if (payload) {
                    ctx.user = payload;
                }
            }
            yield next();
        }
        catch (error) {
            // Continue without user
            yield next();
        }
    });
}
/**
 * Middleware to require specific role
 */
function requireRole(...roles) {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
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
        yield next();
    });
}
/**
 * Middleware to require specific permission
 */
function requirePermission(permission) {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        if (!ctx.user) {
            ctx.status = 401;
            ctx.body = {
                success: false,
                error: 'Authentication required',
            };
            return;
        }
        // Import here to avoid circular dependency
        const { permissionService } = yield Promise.resolve().then(() => __importStar(require('../services/permission.service')));
        if (!permissionService.hasPermission(ctx.user, permission)) {
            ctx.status = 403;
            ctx.body = {
                success: false,
                error: `Forbidden. Required permission: ${permission}`,
            };
            return;
        }
        yield next();
    });
}
/**
 * Middleware to require company access
 */
function requireCompanyAccess() {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!ctx.user) {
            ctx.status = 401;
            ctx.body = {
                success: false,
                error: 'Authentication required',
            };
            return;
        }
        const companyId = ctx.params.companyId || ((_b = (_a = ctx.request) === null || _a === void 0 ? void 0 : _a.body) === null || _b === void 0 ? void 0 : _b.companyId);
        if (!companyId) {
            ctx.status = 400;
            ctx.body = {
                success: false,
                error: 'Company ID required',
            };
            return;
        }
        const { permissionService } = yield Promise.resolve().then(() => __importStar(require('../services/permission.service')));
        if (!permissionService.canAccessCompanyResource(ctx.user, companyId)) {
            ctx.status = 403;
            ctx.body = {
                success: false,
                error: 'You do not have access to this company',
            };
            return;
        }
        yield next();
    });
}
/**
 * Middleware to require user access
 */
function requireUserAccess() {
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
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
        const { permissionService } = yield Promise.resolve().then(() => __importStar(require('../services/permission.service')));
        if (!permissionService.canAccessUserResource(ctx.user, userId)) {
            ctx.status = 403;
            ctx.body = {
                success: false,
                error: 'You do not have access to this user',
            };
            return;
        }
        yield next();
    });
}
