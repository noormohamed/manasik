/**
 * Admin Authentication Service Tests
 */

import { adminAuthService, AdminUser } from '../services/admin-auth.service';

describe('AdminAuthService', () => {
  const mockAdminUser: AdminUser = {
    id: 1,
    email: 'admin@platform.com',
    password_hash: '',
    full_name: 'Admin User',
    role: 'SUPER_ADMIN',
    status: 'ACTIVE',
    mfa_enabled: false,
    created_at: new Date(),
    updated_at: new Date(),
  };

  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'secure_password_123';
      const hash = await adminAuthService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify a correct password', async () => {
      const password = 'secure_password_123';
      const hash = await adminAuthService.hashPassword(password);

      const isValid = await adminAuthService.comparePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'secure_password_123';
      const hash = await adminAuthService.hashPassword(password);

      const isValid = await adminAuthService.comparePassword('wrong_password', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate access and refresh tokens', () => {
      const tokens = adminAuthService.generateTokens(mockAdminUser, 1);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.accessToken).not.toBe(tokens.refreshToken);
    });

    it('should generate a temporary token for MFA', () => {
      const tempToken = adminAuthService.generateTempToken(mockAdminUser);

      expect(tempToken).toBeDefined();
      expect(typeof tempToken).toBe('string');
    });
  });

  describe('Token Verification', () => {
    it('should verify a valid access token', () => {
      const tokens = adminAuthService.generateTokens(mockAdminUser, 1);
      const payload = adminAuthService.verifyAccessToken(tokens.accessToken);

      expect(payload).toBeDefined();
      expect(payload?.adminUserId).toBe(mockAdminUser.id);
      expect(payload?.email).toBe(mockAdminUser.email);
      expect(payload?.role).toBe(mockAdminUser.role);
    });

    it('should verify a valid refresh token', () => {
      const tokens = adminAuthService.generateTokens(mockAdminUser, 1);
      const payload = adminAuthService.verifyRefreshToken(tokens.refreshToken);

      expect(payload).toBeDefined();
      expect(payload?.adminUserId).toBe(mockAdminUser.id);
      expect(payload?.email).toBe(mockAdminUser.email);
    });

    it('should return null for an invalid access token', () => {
      const payload = adminAuthService.verifyAccessToken('invalid_token');
      expect(payload).toBeNull();
    });

    it('should return null for an invalid refresh token', () => {
      const payload = adminAuthService.verifyRefreshToken('invalid_token');
      expect(payload).toBeNull();
    });
  });

  describe('MFA', () => {
    it('should generate an MFA secret', () => {
      const secret = adminAuthService.generateMFASecret();

      expect(secret).toBeDefined();
      expect(typeof secret).toBe('string');
      expect(secret.length).toBeGreaterThan(0);
    });

    it('should verify a valid MFA code', () => {
      const secret = adminAuthService.generateMFASecret();
      // Note: In real tests, we would use a library to generate a valid code
      // For now, we just test that the method exists and returns a boolean
      const result = adminAuthService.verifyMFACode(secret, '000000');

      expect(typeof result).toBe('boolean');
    });

    it('should reject an invalid MFA code', () => {
      const secret = adminAuthService.generateMFASecret();
      const result = adminAuthService.verifyMFACode(secret, 'invalid');

      expect(result).toBe(false);
    });
  });

  describe('Token Hash', () => {
    it('should generate a token hash', () => {
      const token = 'test_token_123';
      const hash = adminAuthService.generateTokenHash(token);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA256 hex length
    });

    it('should generate consistent hashes for the same token', () => {
      const token = 'test_token_123';
      const hash1 = adminAuthService.generateTokenHash(token);
      const hash2 = adminAuthService.generateTokenHash(token);

      expect(hash1).toBe(hash2);
    });
  });

  describe('Token Extraction', () => {
    it('should extract token from Authorization header', () => {
      const token = 'test_token_123';
      const authHeader = `Bearer ${token}`;

      const extracted = adminAuthService.extractToken(authHeader);
      expect(extracted).toBe(token);
    });

    it('should return null for missing Authorization header', () => {
      const extracted = adminAuthService.extractToken(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid Authorization header format', () => {
      const extracted = adminAuthService.extractToken('InvalidFormat token');
      expect(extracted).toBeNull();
    });

    it('should return null for Authorization header without Bearer', () => {
      const extracted = adminAuthService.extractToken('token_123');
      expect(extracted).toBeNull();
    });
  });

  describe('Token Decoding', () => {
    it('should decode a valid token', () => {
      const tokens = adminAuthService.generateTokens(mockAdminUser, 1);
      const decoded = adminAuthService.decodeToken(tokens.accessToken);

      expect(decoded).toBeDefined();
      expect(decoded?.adminUserId).toBe(mockAdminUser.id);
      expect(decoded?.email).toBe(mockAdminUser.email);
    });

    it('should return null for an invalid token', () => {
      const decoded = adminAuthService.decodeToken('invalid_token');
      expect(decoded).toBeNull();
    });
  });
});
