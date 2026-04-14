import crypto from "crypto";

export class Cryptography {
    // Must be 32 bytes (256 bits) for AES-256
    private static readonly SECRET_KEY = crypto
        .createHash("sha256")
        .update("your-very-strong-secret-key-here")
        .digest();

    public static md5(input: string): string {
        return crypto.createHash("md5").update(input).digest("hex");
    }

    // AES-GCM requires a 12-byte IV (initialization vector)
    private static generateIV(): Buffer {
        return crypto.randomBytes(12);
    }

    /**
     * Encrypt a plaintext string
     * @param text - The string you want to encrypt
     * @returns A base64 string containing IV + ciphertext + authTag
     */
    public static encrypt(text: string): string {
        const iv = this.generateIV();
        const cipher = crypto.createCipheriv("aes-256-gcm", this.SECRET_KEY, iv);

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
    public static decrypt(data: string): string {
        const buffer = Buffer.from(data, "base64");

        const iv = buffer.subarray(0, 12);
        const authTag = buffer.subarray(12, 28);
        const encryptedText = buffer.subarray(28);

        const decipher = crypto.createDecipheriv("aes-256-gcm", this.SECRET_KEY, iv);
        decipher.setAuthTag(authTag);

        const decrypted = Buffer.concat([
            decipher.update(encryptedText),
            decipher.final(),
        ]);

        return decrypted.toString("utf8");
    }
}
