"use strict";
/**
 * Authentication Service - JWT token management
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
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthService {
    constructor() {
        this.accessTokenSecret = process.env.JWT_SECRET || 'access_secret_key';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh_secret_key';
        this.accessTokenExpiry = process.env.JWT_EXPIRY || '24h';
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    }
    /**
     * Generate access and refresh tokens
     */
    generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            companyId: user.company_id,
            serviceType: user.service_type,
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
exports.AuthService = AuthService;
exports.authService = new AuthService();
