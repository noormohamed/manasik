/**
 * Unit tests for Wasabi S3 Service
 */

import * as wasabiService from '../services/wasabi-s3.service';

describe('WasabiS3Service', () => {
  describe('validateImageFile', () => {
    it('should accept valid JPEG files', () => {
      const file = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/jpeg',
        size: 1024 * 100, // 100KB
        originalname: 'test.jpg',
      };

      const result = wasabiService.validateImageFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid PNG files', () => {
      const file = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/png',
        size: 1024 * 100,
        originalname: 'test.png',
      };

      const result = wasabiService.validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should accept valid WebP files', () => {
      const file = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'image/webp',
        size: 1024 * 100,
        originalname: 'test.webp',
      };

      const result = wasabiService.validateImageFile(file);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid MIME types', () => {
      const file = {
        buffer: Buffer.from('fake image data'),
        mimetype: 'text/plain',
        size: 1024 * 100,
        originalname: 'test.txt',
      };

      const result = wasabiService.validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid file type');
    });

    it('should reject files exceeding size limit', () => {
      const file = {
        buffer: Buffer.from('x'.repeat(11 * 1024 * 1024)), // 11MB
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024,
        originalname: 'large.jpg',
      };

      const result = wasabiService.validateImageFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should accept files at the size limit', () => {
      const file = {
        buffer: Buffer.from('x'.repeat(10 * 1024 * 1024)), // 10MB
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024,
        originalname: 'large.jpg',
      };

      const result = wasabiService.validateImageFile(file);
      expect(result.valid).toBe(true);
    });
  });

  describe('generateImageFilename', () => {
    it('should generate deterministic filenames', () => {
      const hotelIdMd5 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const imageNumber = 1;

      const filename1 = wasabiService.generateImageFilename(hotelIdMd5, imageNumber);
      const filename2 = wasabiService.generateImageFilename(hotelIdMd5, imageNumber);

      expect(filename1).toBe(filename2);
      expect(filename1).toMatch(/^[a-f0-9]{32}\.jpg$/);
    });

    it('should generate different filenames for different image numbers', () => {
      const hotelIdMd5 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

      const filename1 = wasabiService.generateImageFilename(hotelIdMd5, 1);
      const filename2 = wasabiService.generateImageFilename(hotelIdMd5, 2);

      expect(filename1).not.toBe(filename2);
    });

    it('should generate different filenames for different hotel IDs', () => {
      const hotelIdMd5_1 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const hotelIdMd5_2 = 'z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4';

      const filename1 = wasabiService.generateImageFilename(hotelIdMd5_1, 1);
      const filename2 = wasabiService.generateImageFilename(hotelIdMd5_2, 1);

      expect(filename1).not.toBe(filename2);
    });

    it('should always end with .jpg extension', () => {
      const hotelIdMd5 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

      for (let i = 1; i <= 10; i++) {
        const filename = wasabiService.generateImageFilename(hotelIdMd5, i);
        expect(filename).toEndWith('.jpg');
      }
    });

    it('should generate exactly 32 hex characters before extension', () => {
      const hotelIdMd5 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const filename = wasabiService.generateImageFilename(hotelIdMd5, 1);

      const hashPart = filename.replace('.jpg', '');
      expect(hashPart).toMatch(/^[a-f0-9]{32}$/);
    });
  });

  describe('generateS3Key', () => {
    it('should generate correct S3 key format', () => {
      const hotelIdMd5 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const filename = 'abc123def456.jpg';

      const key = wasabiService.generateS3Key(hotelIdMd5, filename);

      expect(key).toBe(`mk-images/${hotelIdMd5}/${filename}`);
    });

    it('should include bucket name in key', () => {
      const hotelIdMd5 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const filename = 'test.jpg';

      const key = wasabiService.generateS3Key(hotelIdMd5, filename);

      expect(key).toContain('mk-images');
    });

    it('should include hotel ID MD5 in key', () => {
      const hotelIdMd5 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const filename = 'test.jpg';

      const key = wasabiService.generateS3Key(hotelIdMd5, filename);

      expect(key).toContain(hotelIdMd5);
    });

    it('should include filename in key', () => {
      const hotelIdMd5 = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
      const filename = 'test.jpg';

      const key = wasabiService.generateS3Key(hotelIdMd5, filename);

      expect(key).toContain(filename);
    });
  });

  describe('generateCdnUrl', () => {
    it('should generate valid CDN URL', () => {
      const s3Key = 'mk-images/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/abc123.jpg';

      const cdnUrl = wasabiService.generateCdnUrl(s3Key);

      expect(cdnUrl).toBe(`https://mk-images.wasabisys.com/${s3Key}`);
    });

    it('should start with HTTPS', () => {
      const s3Key = 'mk-images/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/abc123.jpg';

      const cdnUrl = wasabiService.generateCdnUrl(s3Key);

      expect(cdnUrl).toMatch(/^https:\/\//);
    });

    it('should include Wasabi domain', () => {
      const s3Key = 'mk-images/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/abc123.jpg';

      const cdnUrl = wasabiService.generateCdnUrl(s3Key);

      expect(cdnUrl).toContain('mk-images.wasabisys.com');
    });

    it('should include S3 key in URL', () => {
      const s3Key = 'mk-images/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/abc123.jpg';

      const cdnUrl = wasabiService.generateCdnUrl(s3Key);

      expect(cdnUrl).toContain(s3Key);
    });
  });
});
