"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactLoginSchema = exports.FreshsalesContactSearchSchema = exports.FreshsalesContactSchema = void 0;
const zod_1 = require("zod");
exports.FreshsalesContactSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1),
    last_name: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
}).passthrough(); // allows extra fields (matching `[key: string]: any`)
exports.FreshsalesContactSearchSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
}).passthrough(); // allows extra fields (matching `[key: string]: any`)
exports.ContactLoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
}).passthrough(); // allows extra fields (ma
