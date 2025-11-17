import { AESEncryption } from '../../lib/crypto/aes-encryption';
import { randomBytes } from 'crypto';

describe('AESEncryption', () => {
  const testKey = randomBytes(32); // 256-bit key

  describe('encrypt', () => {
    it('should encrypt string data', () => {
      const plaintext = 'Hello, World!';
      const result = AESEncryption.encrypt(plaintext, testKey);
      
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result).toHaveProperty('encrypted');
      expect(typeof result.iv).toBe('string');
      expect(typeof result.authTag).toBe('string');
      expect(typeof result.encrypted).toBe('string');
    });

    it('should encrypt Buffer data', () => {
      const plaintext = Buffer.from('Hello, World!', 'utf-8');
      const result = AESEncryption.encrypt(plaintext, testKey);
      
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('authTag');
      expect(result).toHaveProperty('encrypted');
    });

    it('should produce unique IV for each encryption', () => {
      const plaintext = 'Hello, World!';
      const result1 = AESEncryption.encrypt(plaintext, testKey);
      const result2 = AESEncryption.encrypt(plaintext, testKey);
      
      expect(result1.iv).not.toBe(result2.iv);
      expect(result1.encrypted).not.toBe(result2.encrypted);
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted string data', () => {
      const plaintext = 'Hello, World!';
      const encrypted = AESEncryption.encrypt(plaintext, testKey);
      const decrypted = AESEncryption.decrypt(encrypted, testKey);
      
      expect(decrypted.toString('utf-8')).toBe(plaintext);
    });

    it('should decrypt encrypted Buffer data', () => {
      const plaintext = Buffer.from('Hello, World!', 'utf-8');
      const encrypted = AESEncryption.encrypt(plaintext, testKey);
      const decrypted = AESEncryption.decrypt(encrypted, testKey);
      
      expect(decrypted.equals(plaintext)).toBe(true);
    });

    it('should throw error with wrong key', () => {
      const plaintext = 'Hello, World!';
      const encrypted = AESEncryption.encrypt(plaintext, testKey);
      const wrongKey = randomBytes(32);
      
      expect(() => {
        AESEncryption.decrypt(encrypted, wrongKey);
      }).toThrow();
    });

    it('should throw error with tampered data', () => {
      const plaintext = 'Hello, World!';
      const encrypted = AESEncryption.encrypt(plaintext, testKey);
      
      // Tamper with encrypted data
      const tamperedEncrypted = Buffer.from(encrypted.encrypted, 'base64');
      tamperedEncrypted[0] ^= 1; // Flip a bit
      encrypted.encrypted = tamperedEncrypted.toString('base64');
      
      expect(() => {
        AESEncryption.decrypt(encrypted, testKey);
      }).toThrow();
    });
  });

  describe('encryptToString and decryptFromString', () => {
    it('should encrypt to single string', () => {
      const plaintext = 'Hello, World!';
      const encryptedString = AESEncryption.encryptToString(plaintext, testKey);
      
      expect(typeof encryptedString).toBe('string');
      expect(encryptedString.split(':').length).toBe(3);
    });

    it('should decrypt from single string', () => {
      const plaintext = 'Hello, World!';
      const encryptedString = AESEncryption.encryptToString(plaintext, testKey);
      const decrypted = AESEncryption.decryptFromString(encryptedString, testKey);
      
      expect(decrypted.toString('utf-8')).toBe(plaintext);
    });

    it('should handle special characters', () => {
      const plaintext = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~';
      const encryptedString = AESEncryption.encryptToString(plaintext, testKey);
      const decrypted = AESEncryption.decryptFromString(encryptedString, testKey);
      
      expect(decrypted.toString('utf-8')).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = '你好世界 🔐 مرحبا בעולם';
      const encryptedString = AESEncryption.encryptToString(plaintext, testKey);
      const decrypted = AESEncryption.decryptFromString(encryptedString, testKey);
      
      expect(decrypted.toString('utf-8')).toBe(plaintext);
    });

    it('should handle large data', () => {
      const plaintext = 'A'.repeat(10000); // 10KB of data
      const encryptedString = AESEncryption.encryptToString(plaintext, testKey);
      const decrypted = AESEncryption.decryptFromString(encryptedString, testKey);
      
      expect(decrypted.toString('utf-8')).toBe(plaintext);
    });
  });
});
