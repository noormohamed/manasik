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
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseWrapper = responseWrapper;
/**
 * Response wrapper middleware
 * Wraps all successful responses in a { data: ... } structure
 */
function responseWrapper(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield next();
        // Only wrap successful responses (2xx status codes)
        if (ctx.status >= 200 && ctx.status < 300 && ctx.body) {
            // If body is already wrapped in data, don't double-wrap
            if (typeof ctx.body === 'object' && 'data' in ctx.body) {
                return;
            }
            // Wrap the response
            ctx.body = {
                data: ctx.body,
            };
        }
    });
}
