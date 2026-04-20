/**
 * Messaging Security Service - Sanitizes messages to remove sensitive data
 */

export interface SanitizationResult {
  sanitized: string;
  hasSensitiveData: boolean;
  detectedPatterns: string[];
}

export class MessagingSecurityService {
  /**
   * Patterns to detect and mask sensitive information
   */
  private readonly patterns = {
    // Bank account numbers (various formats)
    bankAccount: /\b\d{8,17}\b/g,
    
    // Credit/Debit card numbers (16 digits with optional spaces/dashes)
    cardNumber: /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,
    
    // CVV/CVC codes (3-4 digits)
    cvv: /\b(?:CVV|CVC|CV2)\s*:?\s*\d{3,4}\b/gi,
    
    // Routing numbers (9 digits)
    routingNumber: /\b\d{9}\b/g,
    
    // IBAN (International Bank Account Number)
    iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{1,30}\b/g,
    
    // Social Security Numbers (XXX-XX-XXXX format)
    ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
    
    // Phone numbers (various formats)
    phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    
    // Email addresses
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    
    // Passport numbers
    passport: /\b(?:passport|passport\s*#|passport\s*no\.?)\s*:?\s*([A-Z0-9]{6,9})\b/gi,
    
    // Driver's license
    driverLicense: /\b(?:driver'?s?\s*license|dl|lic)\s*:?\s*([A-Z0-9]{5,8})\b/gi,
  };

  /**
   * Sanitize message content to remove sensitive data
   */
  sanitizeMessage(content: string): SanitizationResult {
    if (!content || typeof content !== 'string') {
      return {
        sanitized: content || '',
        hasSensitiveData: false,
        detectedPatterns: [],
      };
    }

    let sanitized = content;
    const detectedPatterns: string[] = [];

    // Check for card numbers and mask them (keep last 4 digits)
    if (this.patterns.cardNumber.test(sanitized)) {
      detectedPatterns.push('card_number');
      sanitized = sanitized.replace(this.patterns.cardNumber, (match) => {
        const digits = match.replace(/\D/g, '');
        if (digits.length >= 4) {
          return `****-****-****-${digits.slice(-4)}`;
        }
        return '****-****-****-****';
      });
    }

    // Check for CVV/CVC codes
    if (this.patterns.cvv.test(sanitized)) {
      detectedPatterns.push('cvv_cvc');
      sanitized = sanitized.replace(this.patterns.cvv, '[CVV REDACTED]');
    }

    // Check for bank account numbers
    if (this.patterns.bankAccount.test(sanitized)) {
      detectedPatterns.push('bank_account');
      sanitized = sanitized.replace(this.patterns.bankAccount, '[ACCOUNT REDACTED]');
    }

    // Check for routing numbers
    if (this.patterns.routingNumber.test(sanitized)) {
      detectedPatterns.push('routing_number');
      sanitized = sanitized.replace(this.patterns.routingNumber, '[ROUTING REDACTED]');
    }

    // Check for IBAN
    if (this.patterns.iban.test(sanitized)) {
      detectedPatterns.push('iban');
      sanitized = sanitized.replace(this.patterns.iban, '[IBAN REDACTED]');
    }

    // Check for SSN
    if (this.patterns.ssn.test(sanitized)) {
      detectedPatterns.push('ssn');
      sanitized = sanitized.replace(this.patterns.ssn, '[SSN REDACTED]');
    }

    // Check for passport numbers
    if (this.patterns.passport.test(sanitized)) {
      detectedPatterns.push('passport');
      sanitized = sanitized.replace(this.patterns.passport, '[PASSPORT REDACTED]');
    }

    // Check for driver's license
    if (this.patterns.driverLicense.test(sanitized)) {
      detectedPatterns.push('driver_license');
      sanitized = sanitized.replace(this.patterns.driverLicense, '[LICENSE REDACTED]');
    }

    return {
      sanitized,
      hasSensitiveData: detectedPatterns.length > 0,
      detectedPatterns,
    };
  }

  /**
   * Check if message contains sensitive data without sanitizing
   */
  hasSensitiveData(content: string): boolean {
    if (!content || typeof content !== 'string') {
      return false;
    }

    return (
      this.patterns.cardNumber.test(content) ||
      this.patterns.cvv.test(content) ||
      this.patterns.bankAccount.test(content) ||
      this.patterns.routingNumber.test(content) ||
      this.patterns.iban.test(content) ||
      this.patterns.ssn.test(content) ||
      this.patterns.passport.test(content) ||
      this.patterns.driverLicense.test(content)
    );
  }

  /**
   * Get detected sensitive data types
   */
  getSensitiveDataTypes(content: string): string[] {
    if (!content || typeof content !== 'string') {
      return [];
    }

    const types: string[] = [];

    if (this.patterns.cardNumber.test(content)) types.push('card_number');
    if (this.patterns.cvv.test(content)) types.push('cvv_cvc');
    if (this.patterns.bankAccount.test(content)) types.push('bank_account');
    if (this.patterns.routingNumber.test(content)) types.push('routing_number');
    if (this.patterns.iban.test(content)) types.push('iban');
    if (this.patterns.ssn.test(content)) types.push('ssn');
    if (this.patterns.passport.test(content)) types.push('passport');
    if (this.patterns.driverLicense.test(content)) types.push('driver_license');

    return types;
  }
}

export const messagingSecurityService = new MessagingSecurityService();
