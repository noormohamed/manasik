import {z} from "zod";

export const FreshsalesContactSchema = z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
}).passthrough(); // allows extra fields (matching `[key: string]: any`)

export const FreshsalesContactSearchSchema = z.object({
    email: z.string().email(),
}).passthrough(); // allows extra fields (matching `[key: string]: any`)

export const ContactLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
}).passthrough(); // allows extra fields (ma