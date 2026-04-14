"use strict";
/**
 * Error Handler Middleware
 * Catches all errors and formats them consistently
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
exports.errorHandlerMiddleware = errorHandlerMiddleware;
exports.notFoundHandler = notFoundHandler;
const error_handler_service_1 = require("../services/error-handler.service");
/**
 * Global error handler middleware
 * Should be applied first in the middleware chain
 */
function errorHandlerMiddleware(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield next();
        }
        catch (err) {
            error_handler_service_1.ErrorHandlerService.handleError(ctx, err);
        }
    });
}
/**
 * 404 Not Found handler
 * Should be applied last in the middleware chain
 */
function notFoundHandler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.status = 404;
        ctx.body = {
            error: 'Not Found',
            code: 'NOT_FOUND',
            path: ctx.path,
        };
    });
}
