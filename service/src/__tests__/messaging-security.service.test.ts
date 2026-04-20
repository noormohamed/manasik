/**
 * Messaging Security Service Tests
 */

import { MessagingSecurityService } from '../services/messaging/security.service';

describe('MessagingSecurityService', () => {
  let service: MessagingSecurityService;

  beforeEach(() => {
    service = new MessagingSecurityService();
  });

  describe('sanitizeMessage', () => {
    it('should sanitize credit card numbers', () => {
      const content = 'My card is 4532-1234-5678-9010';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.detectedPatterns).toContain('card_number');
      expect(result.sanitized).toContain('****-****-****-9010');
      expect(result.sanitized).not.toContain('4532');
    });

    it('should sanitize CVV codes', () => {
      const content = 'CVV: 123 is my security code';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.detectedPatterns).toContain('cvv_cvc');
      expect(result.sanitized).toContain('[CVV REDACTED]');
    });

    it('should sanitize bank account numbers', () => {
      const content = 'My account number is 123456789012345';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.detectedPatterns).toContain('bank_account');
      expect(result.sanitized).toContain('[ACCOUNT REDACTED]');
    });

    it('should sanitize SSN', () => {
      const content = 'My SSN is 123-45-6789';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.detectedPatterns).toContain('ssn');
      expect(result.sanitized).toContain('[SSN REDACTED]');
    });

    it('should sanitize IBAN', () => {
      const content = 'My IBAN is DE89370400440532013000';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.detectedPatterns).toContain('iban');
      expect(result.sanitized).toContain('[IBAN REDACTED]');
    });

    it('should handle multiple sensitive data types', () => {
      const content = 'Card: 4532-1234-5678-9010, CVV: 123, SSN: 123-45-6789';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.detectedPatterns.length).toBeGreaterThan(1);
      expect(result.sanitized).toContain('[CVV REDACTED]');
      expect(result.sanitized).toContain('[SSN REDACTED]');
    });

    it('should not sanitize normal messages', () => {
      const content = 'Hello, I would like to book a room for 3 nights';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(false);
      expect(result.detectedPatterns.length).toBe(0);
      expect(result.sanitized).toBe(content);
    });

    it('should handle empty content', () => {
      const result = service.sanitizeMessage('');

      expect(result.hasSensitiveData).toBe(false);
      expect(result.detectedPatterns.length).toBe(0);
      expect(result.sanitized).toBe('');
    });

    it('should handle null content', () => {
      const result = service.sanitizeMessage(null as any);

      expect(result.hasSensitiveData).toBe(false);
      expect(result.detectedPatterns.length).toBe(0);
      expect(result.sanitized).toBe('');
    });
  });

  describe('hasSensitiveData', () => {
    it('should detect card numbers', () => {
      const content = 'Card: 4532-1234-5678-9010';
      expect(service.hasSensitiveData(content)).toBe(true);
    });

    it('should detect CVV codes', () => {
      const content = 'CVV: 123';
      expect(service.hasSensitiveData(content)).toBe(true);
    });

    it('should return false for normal content', () => {
      const content = 'Hello, I would like to book a room';
      expect(service.hasSensitiveData(content)).toBe(false);
    });

    it('should handle null content', () => {
      expect(service.hasSensitiveData(null as any)).toBe(false);
    });
  });

  describe('getSensitiveDataTypes', () => {
    it('should identify card number type', () => {
      const content = 'Card: 4532-1234-5678-9010';
      const types = service.getSensitiveDataTypes(content);

      expect(types).toContain('card_number');
    });

    it('should identify multiple types', () => {
      const content = 'Card: 4532-1234-5678-9010, CVV: 123, SSN: 123-45-6789';
      const types = service.getSensitiveDataTypes(content);

      expect(types).toContain('card_number');
      expect(types).toContain('cvv_cvc');
      expect(types).toContain('ssn');
    });

    it('should return empty array for normal content', () => {
      const content = 'Hello, I would like to book a room';
      const types = service.getSensitiveDataTypes(content);

      expect(types.length).toBe(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle card numbers with spaces', () => {
      const content = 'Card: 4532 1234 5678 9010';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.sanitized).toContain('9010');
    });

    it('should handle card numbers with dashes', () => {
      const content = 'Card: 4532-1234-5678-9010';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.sanitized).toContain('9010');
    });

    it('should preserve message structure', () => {
      const content = 'Hello, my card is 4532-1234-5678-9010. Please charge it.';
      const result = service.sanitizeMessage(content);

      expect(result.sanitized).toContain('Hello');
      expect(result.sanitized).toContain('Please charge it');
      expect(result.sanitized).toContain('****-****-****-9010');
    });

    it('should handle multiple card numbers', () => {
      const content = 'Card 1: 4532-1234-5678-9010, Card 2: 5425-2334-3010-9903';
      const result = service.sanitizeMessage(content);

      expect(result.hasSensitiveData).toBe(true);
      expect(result.sanitized).toContain('****-****-****-9010');
      expect(result.sanitized).toContain('****-****-****-9903');
    });
  });
});
