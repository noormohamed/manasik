/**
 * Admin Authentication Service - Super Admin JWT token management and MFA
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authenticator } from 'otplib';

export interface AdminJWTPayload {
  adminUserId: number;
  email: string;
  role: string;
  sessionId: number;
}

export interface AdminTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  status: string;
  mfa_enabled: boolean;
  mfa_secret?: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export class AdminAuthService {
  private accessTokenSecret = process.env.ADMIN_JWT_SECRET || 'admin_access_secret_key';
  private refreshTokenSecret = process.env.ADMIN_JWT_REFRESH_SECRET || 'admin_refresh_secret_key';
  private accessTokenExpiry: string | number = process.env.ADMIN_JWT_EXPIRY || '24h';
  private refreshTokenExpiry: string | number = process.env.ADMIN_JWT_REFRESH_EXPIRY || '7d';
  private tempTokenExpiry: string | number = '5m'; // Temp token for MFA verification

  /**
   * Generate access and refresh tokens for admin
   */
  generateTokens(adminUser: AdminUser, sessionId: number): AdminTokenPair {
    const payload: AdminJWTPayload = {
      adminUserId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      sessionId,
    };

    const accessToken = jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry as any,
    });

    const refreshToken = jwt.sign(payload, this.refreshTokenSecret, {
      expiresIn: this.refreshTokenExpiry as any,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Generate temporary token for MFA verification
   */
  generateTempToken(adminUser: AdminUser): string {
    const payload: AdminJWTPayload = {
      adminUserId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      sessionId: 0, // No session yet
    };

    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.tempTokenExpiry as any,
    });
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): AdminJWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret) as AdminJWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): AdminJWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret) as AdminJWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Hash password
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate MFA secret for TOTP
   */
  generateMFASecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Verify MFA code
   */
  verifyMFACode(secret: string, code: string): boolean {
    try {
      return authenticator.check(code, secret);
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate token hash for session storage
   */
  generateTokenHash(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Extract token from Authorization header
   */
  extractToken(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1];
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): AdminJWTPayload | null {
    try {
      const decoded = jwt.decode(token) as AdminJWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

export const adminAuthService = new AdminAuthService();
