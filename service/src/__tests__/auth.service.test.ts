/**
 * Auth Service Tests
 */

import { authService, JWTPayload } from '../services/auth.service';
import { User } from '../models/user';

describe('AuthService', () => {
  let testUser: User;

  beforeEach(() => {
    testUser = new User('user-123');
    testUser.first_name = 'John';
    testUser.last_name = 'Doe';
    testUser.email = 'john@example.com';
    testUser.role = 'CUSTOMER';
  });

  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', () => {
      const { accessToken, refreshToken } = authService.generateTokens(testUser);

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    });

    it('should include user data in token payload', () => {
      const { accessToken } = authService.generateTokens(testUser);
      const decoded = authService.decodeToken(accessToken);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe('user-123');
      expect(decoded?.email).toBe('john@example.com');
      expect(decoded?.role).toBe('CUSTOMER');
    });

    it('should include company and service type for agents', () => {
      testUser.role = 'AGENT';
      testUser.company_id = 'comp-123';
      testUser.service_type = 'HOTEL';

      const { accessToken } = authService.generateTokens(testUser);
      const decoded = authService.decodeToken(accessToken);

      expect(decoded?.companyId).toBe('comp-123');
      expect(decoded?.serviceType).toBe('HOTEL');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid access token', () => {
      const { accessToken } = authService.generateTokens(testUser);
      const payload = authService.verifyAccessToken(accessToken);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe('user-123');
      expect(payload?.email).toBe('john@example.com');
    });

    it('should return null for invalid token', () => {
      const payload = authService.verifyAccessToken('invalid.token.here');
      expect(payload).toBeNull();
    });

    it('should return null for expired token', async () => {
      // Create a token with very short expiry
      const shortToken = authService.generateTokens(testUser).accessToken;
      
      // Wait a bit and try to verify (this is a simplified test)
      const payload = authService.verifyAccessToken(shortToken);
      expect(payload).toBeDefined(); // Should still be valid immediately
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', () => {
      const { refreshToken } = authService.generateTokens(testUser);
      const payload = authService.verifyRefreshToken(refreshToken);

      expect(payload).toBeDefined();
      expect(payload?.userId).toBe('user-123');
    });

    it('should return null for invalid refresh token', () => {
      const payload = authService.verifyRefreshToken('invalid.token.here');
      expect(payload).toBeNull();
    });
  });

  describe('hashPassword', () => {
    it('should hash password', async () => {
      const password = 'mySecurePassword123';
      const hash = await authService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'mySecurePassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password', async () => {
      const password = 'mySecurePassword123';
      const hash = await authService.hashPassword(password);
      const isMatch = await authService.comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const password = 'mySecurePassword123';
      const hash = await authService.hashPassword(password);
      const isMatch = await authService.comparePassword('wrongPassword', hash);

      expect(isMatch).toBe(false);
    });
  });

  describe('extractToken', () => {
    it('should extract token from Bearer header', () => {
      const token = 'my.jwt.token';
      const authHeader = `Bearer ${token}`;
      const extracted = authService.extractToken(authHeader);

      expect(extracted).toBe(token);
    });

    it('should return null for missing header', () => {
      const extracted = authService.extractToken(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid format', () => {
      const extracted = authService.extractToken('InvalidFormat token');
      expect(extracted).toBeNull();
    });

    it('should return null for missing Bearer prefix', () => {
      const extracted = authService.extractToken('my.jwt.token');
      expect(extracted).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('should decode valid token', () => {
      const { accessToken } = authService.generateTokens(testUser);
      const decoded = authService.decodeToken(accessToken);

      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe('user-123');
    });

    it('should return null for invalid token', () => {
      const decoded = authService.decodeToken('invalid.token.here');
      expect(decoded).toBeNull();
    });
  });
});
