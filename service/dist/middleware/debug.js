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
exports.debugHandler = debugHandler;
function debugHandler(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield next();
        ctx.body = ctx.body || {};
        const hostname = ctx.hostname || '';
        let env = 'localhost';
        let directory = 'localhost';
        if (hostname !== 'localhost') {
            const prMatch = hostname.match(/^pr-(\d+)\./i);
            env = prMatch ? `pr-${prMatch[1]}` : 'LIVE';
            directory = env === 'LIVE' ? 'LIVE' : process.cwd();
        }
        // @ts-ignore
        const res = ctx.body;
        ctx.body = {};
        // @ts-ignore
        ctx.body.data = res;
        // @ts-ignore
        ctx.body.debug = {
            env,
            directory
        };
    });
}
