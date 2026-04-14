"use strict";
/**
 * Admin Authentication Service - Super Admin JWT token management and MFA
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthService = exports.AdminAuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const otplib_1 = require("otplib");
class AdminAuthService {
    constructor() {
        this.accessTokenSecret = process.env.ADMIN_JWT_SECRET || 'admin_access_secret_key';
        this.refreshTokenSecret = process.env.ADMIN_JWT_REFRESH_SECRET || 'admin_refresh_secret_key';
        this.accessTokenExpiry = process.env.ADMIN_JWT_EXPIRY || '24h';
        this.refreshTokenExpiry = process.env.ADMIN_JWT_REFRESH_EXPIRY || '7d';
        this.tempTokenExpiry = '5m'; // Temp token for MFA verification
    }
    /**
     * Generate access and refresh tokens for admin
     */
    generateTokens(adminUser, sessionId) {
        const payload = {
            adminUserId: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            sessionId,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry,
        });
        const refreshToken = jsonwebtoken_1.default.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry,
        });
        return { accessToken, refreshToken };
    }
    /**
     * Generate temporary token for MFA verification
     */
    generateTempToken(adminUser) {
        const payload = {
            adminUserId: adminUser.id,
            email: adminUser.email,
            role: adminUser.role,
            sessionId: 0, // No session yet
        };
        return jsonwebtoken_1.default.sign(payload, this.accessTokenSecret, {
            expiresIn: this.tempTokenExpiry,
        });
    }
    /**
     * Verify access token
     */
    verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.accessTokenSecret);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Verify refresh token
     */
    verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.refreshTokenSecret);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Hash password
     */
    hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const salt = yield bcryptjs_1.default.genSalt(10);
            return bcryptjs_1.default.hash(password, salt);
        });
    }
    /**
     * Compare password with hash
     */
    comparePassword(password, hash) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcryptjs_1.default.compare(password, hash);
        });
    }
    /**
     * Generate MFA secret for TOTP
     */
    generateMFASecret() {
        return otplib_1.authenticator.generateSecret();
    }
    /**
     * Verify MFA code
     */
    verifyMFACode(secret, code) {
        try {
            return otplib_1.authenticator.check(code, secret);
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Generate token hash for session storage
     */
    generateTokenHash(token) {
        return crypto_1.default.createHash('sha256').update(token).digest('hex');
    }
    /**
     * Extract token from Authorization header
     */
    extractToken(authHeader) {
        if (!authHeader)
            return null;
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }
        return parts[1];
    }
    /**
     * Decode token without verification (for debugging)
     */
    decodeToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.decode(token);
            return decoded;
        }
        catch (error) {
            return null;
        }
    }
}
exports.AdminAuthService = AdminAuthService;
exports.adminAuthService = new AdminAuthService();
