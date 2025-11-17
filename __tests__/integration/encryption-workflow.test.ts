import { MasterKeyDerivation } from '../../lib/crypto/key-derivation';
import { AESEncryption } from '../../lib/crypto/aes-encryption';

/**
 * Integration tests for the complete encryption workflow
 */
describe('Encryption Workflow Integration', () => {
  it('should complete full master password to encrypted data workflow', () => {
    // Step 1: User creates master password
    const masterPassword = 'MySecureMasterPassword123!@#';
    
    // Step 2: Generate salt for key derivation
    const salt = MasterKeyDerivation.generateSalt();
    expect(salt.length).toBe(32);
    
    // Step 3: Derive master key from password
    const masterKey = MasterKeyDerivation.deriveKey(masterPassword, salt);
    expect(masterKey.length).toBe(32);
    
    // Step 4: Encrypt sensitive data
    const sensitiveData = 'This is my secret password: SuperSecret123!';
    const encrypted = AESEncryption.encrypt(sensitiveData, masterKey);
    
    expect(encrypted.iv).toBeDefined();
    expect(encrypted.authTag).toBeDefined();
    expect(encrypted.encrypted).toBeDefined();
    expect(encrypted.encrypted).not.toBe(sensitiveData);
    
    // Step 5: Decrypt data back
    const decrypted = AESEncryption.decrypt(encrypted, masterKey);
    expect(decrypted.toString('utf-8')).toBe(sensitiveData);
    
    // Step 6: Verify password works for future unlocks
    const isValid = MasterKeyDerivation.verifyPassword(masterPassword, salt, masterKey);
    expect(isValid).toBe(true);
    
    // Step 7: Verify wrong password fails
    const isInvalid = MasterKeyDerivation.verifyPassword('WrongPassword', salt, masterKey);
    expect(isInvalid).toBe(false);
  }, 30000);

  it('should handle multiple data encryption with same master key', () => {
    const masterPassword = 'MySecureMasterPassword123!@#';
    const salt = MasterKeyDerivation.generateSalt();
    const masterKey = MasterKeyDerivation.deriveKey(masterPassword, salt);
    
    const data1 = 'Password for GitHub: ghp_token123';
    const data2 = 'API Key: sk-proj-abc123xyz';
    const data3 = 'Database URL: postgresql://user:pass@localhost:5432/db';
    
    const encrypted1 = AESEncryption.encryptToString(data1, masterKey);
    const encrypted2 = AESEncryption.encryptToString(data2, masterKey);
    const encrypted3 = AESEncryption.encryptToString(data3, masterKey);
    
    // All encrypted strings should be different even though using same key
    expect(encrypted1).not.toBe(encrypted2);
    expect(encrypted2).not.toBe(encrypted3);
    expect(encrypted1).not.toBe(encrypted3);
    
    // All should decrypt correctly
    expect(AESEncryption.decryptFromString(encrypted1, masterKey).toString('utf-8')).toBe(data1);
    expect(AESEncryption.decryptFromString(encrypted2, masterKey).toString('utf-8')).toBe(data2);
    expect(AESEncryption.decryptFromString(encrypted3, masterKey).toString('utf-8')).toBe(data3);
  }, 30000);

  it('should fail to decrypt with wrong master password', () => {
    const correctPassword = 'CorrectPassword123!';
    const wrongPassword = 'WrongPassword123!';
    const salt = MasterKeyDerivation.generateSalt();
    
    const correctKey = MasterKeyDerivation.deriveKey(correctPassword, salt);
    const wrongKey = MasterKeyDerivation.deriveKey(wrongPassword, salt);
    
    const sensitiveData = 'Secret information';
    const encrypted = AESEncryption.encrypt(sensitiveData, correctKey);
    
    // Should decrypt with correct key
    const decrypted = AESEncryption.decrypt(encrypted, correctKey);
    expect(decrypted.toString('utf-8')).toBe(sensitiveData);
    
    // Should fail with wrong key
    expect(() => {
      AESEncryption.decrypt(encrypted, wrongKey);
    }).toThrow();
  }, 30000);

  it('should preserve data integrity across encryption/decryption', () => {
    const password = 'TestPassword123!';
    const salt = MasterKeyDerivation.generateSalt();
    const key = MasterKeyDerivation.deriveKey(password, salt);
    
    const testCases = [
      'Simple text',
      'Text with special chars: !@#$%^&*()_+-=[]{}|;:\'",.<>?/`~',
      'Unicode: 你好世界 🔐 مرحبا בעולם Привет',
      'Numbers: 1234567890',
      'Long text: ' + 'A'.repeat(10000),
      'Empty string: ',
      'JSON: {"username":"admin","password":"secret123","api_key":"abc-123-xyz"}',
    ];
    
    testCases.forEach((testData) => {
      const encrypted = AESEncryption.encryptToString(testData, key);
      const decrypted = AESEncryption.decryptFromString(encrypted, key);
      expect(decrypted.toString('utf-8')).toBe(testData);
    });
  }, 30000);
});
