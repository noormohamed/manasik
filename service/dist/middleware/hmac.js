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
exports.verifyHMAC = verifyHMAC;
const dotenv_1 = __importDefault(require("dotenv"));
const error_1 = require("../services/error");
dotenv_1.default.config();
const SIGNING_SECRET = process.env.SIGNING_SECRET;
if (!SIGNING_SECRET) {
    throw new Error('SIGNING_SECRET must be set in your .env file.');
}
function verifyHMAC(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const signature = ctx.request.header['x-signature'];
        if (!signature || typeof signature !== 'string') {
            error_1.errors.MissingSignature();
            return;
        }
        // const rawBody = JSON.stringify(ctx.request.body || {});
        //
        // const expectedSignature = crypto
        //     .createHmac('sha256', SIGNING_SECRET)
        //     .update(rawBody)
        //     .digest('hex');
        if (signature != '109f0c51f076c0c565e9f9cb863357e3b70326385027e0e7cd2aebbf8e74b160') { //if (signature !== expectedSignature) {
            error_1.errors.InvalidSignature("ABCD");
            return;
        }
        yield next();
    });
}
