"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cryptography = void 0;
const crypto_1 = __importDefault(require("crypto"));
class Cryptography {
    static md5(input) {
        return crypto_1.default.createHash("md5").update(input).digest("hex");
    }
    // AES-GCM requires a 12-byte IV (initialization vector)
    static generateIV() {
        return crypto_1.default.randomBytes(12);
    }
    /**
     * Encrypt a plaintext string
     * @param text - The string you want to encrypt
     * @returns A base64 string containing IV + ciphertext + authTag
     */
    static encrypt(text) {
        const iv = this.generateIV();
        const cipher = crypto_1.default.createCipheriv("aes-256-gcm", this.SECRET_KEY, iv);
        const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
        const authTag = cipher.getAuthTag();
        // Combine IV + encrypted text + authTag
        return Buffer.concat([iv, authTag, encrypted]).toString("base64");
    }
    /**
     * Decrypt an encrypted string
     * @param data - The base64 string from `encrypt()`
     * @returns The original plaintext
     */
    static decrypt(data) {
        const buffer = Buffer.from(data, "base64");
        const iv = buffer.subarray(0, 12);
        const authTag = buffer.subarray(12, 28);
        const encryptedText = buffer.subarray(28);
        const decipher = crypto_1.default.createDecipheriv("aes-256-gcm", this.SECRET_KEY, iv);
        decipher.setAuthTag(authTag);
        const decrypted = Buffer.concat([
            decipher.update(encryptedText),
            decipher.final(),
        ]);
        return decrypted.toString("utf8");
    }
}
exports.Cryptography = Cryptography;
// Must be 32 bytes (256 bits) for AES-256
Cryptography.SECRET_KEY = crypto_1.default
    .createHash("sha256")
    .update("your-very-strong-secret-key-here")
    .digest();
