import crypto from 'crypto';

export function hashSHA256(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex').substring(0, 15); // first 15 characters;
}

export function md5Hash(input: string): string {
    return crypto.createHash("md5").update(input).digest("hex");
}
