import { MasterKeyDerivation } from '../../lib/crypto/key-derivation';

describe('MasterKeyDerivation', () => {
  describe('generateSalt', () => {
    it('should generate a salt of correct length', () => {
      const salt = MasterKeyDerivation.generateSalt();
      expect(salt).toBeInstanceOf(Buffer);
      expect(salt.length).toBe(32);
    });

    it('should generate unique salts', () => {
      const salt1 = MasterKeyDerivation.generateSalt();
      const salt2 = MasterKeyDerivation.generateSalt();
      expect(salt1.equals(salt2)).toBe(false);
    });
  });

  describe('deriveKey', () => {
    it('should derive a key from password and salt', () => {
      const password = 'SecurePassword123!';
      const salt = MasterKeyDerivation.generateSalt();
      
      const key = MasterKeyDerivation.deriveKey(password, salt);
      
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32); // 256 bits
    }, 30000); // Increase timeout for Argon2

    it('should produce consistent keys for same password and salt', () => {
      const password = 'SecurePassword123!';
      const salt = MasterKeyDerivation.generateSalt();
      
      const key1 = MasterKeyDerivation.deriveKey(password, salt);
      const key2 = MasterKeyDerivation.deriveKey(password, salt);
      
      expect(key1.equals(key2)).toBe(true);
    }, 30000); // Increase timeout for Argon2

    it('should produce different keys for different passwords', () => {
      const salt = MasterKeyDerivation.generateSalt();
      
      const key1 = MasterKeyDerivation.deriveKey('password1', salt);
      const key2 = MasterKeyDerivation.deriveKey('password2', salt);
      
      expect(key1.equals(key2)).toBe(false);
    }, 30000); // Increase timeout for Argon2
  });

  describe('verifyPassword', () => {
    it('should verify correct password', () => {
      const password = 'SecurePassword123!';
      const salt = MasterKeyDerivation.generateSalt();
      const key = MasterKeyDerivation.deriveKey(password, salt);
      
      const isValid = MasterKeyDerivation.verifyPassword(password, salt, key);
      
      expect(isValid).toBe(true);
    }, 30000); // Increase timeout for Argon2

    it('should reject incorrect password', () => {
      const password = 'SecurePassword123!';
      const salt = MasterKeyDerivation.generateSalt();
      const key = MasterKeyDerivation.deriveKey(password, salt);
      
      const isValid = MasterKeyDerivation.verifyPassword('WrongPassword', salt, key);
      
      expect(isValid).toBe(false);
    }, 30000); // Increase timeout for Argon2
  });
});
