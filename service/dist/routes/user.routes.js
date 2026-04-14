"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_repository_1 = require("../database/repositories/user.repository");
exports.userRoutes = new koa_router_1.default({ prefix: '/users' });
/**
 * GET /api/users/:id
 * Get user by ID
 */
exports.userRoutes.get('/:id', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = new user_repository_1.UserRepository();
        const { id } = ctx.params;
        const user = yield userRepository.findById(id);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }
        ctx.body = {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
            },
        };
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to fetch user' };
    }
}));
/**
 * PUT /api/users/:id
 * Update user (authenticated)
 */
exports.userRoutes.put('/:id', auth_middleware_1.authMiddleware, (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userRepository = new user_repository_1.UserRepository();
        const userId = ctx.state.userId;
        const { id } = ctx.params;
        // Users can only update their own profile
        if (userId !== id) {
            ctx.status = 403;
            ctx.body = { error: 'Forbidden' };
            return;
        }
        // @ts-ignore
        const body = ctx.request.body;
        const { firstName, lastName } = body;
        const user = yield userRepository.findById(id);
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'User not found' };
            return;
        }
        const updated = yield userRepository.update(id, {
            first_name: firstName || user.first_name,
            last_name: lastName || user.last_name,
            updated_at: new Date(),
        });
        if (!updated) {
            ctx.status = 500;
            ctx.body = { error: 'Failed to update user' };
            return;
        }
        ctx.body = {
            message: 'User updated successfully',
            user: {
                id: updated.id,
                email: updated.email,
                firstName: updated.first_name,
                lastName: updated.last_name,
            },
        };
    }
    catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Failed to update user' };
    }
}));
