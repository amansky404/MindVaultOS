import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

/**
 * AES-256-GCM Encryption/Decryption
 * Provides authenticated encryption with associated data (AEAD)
 */
export class AESEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly AUTH_TAG_LENGTH = 16; // 128 bits
  
  /**
   * Encrypt data using AES-256-GCM
   * Returns: {iv, authTag, encrypted} as base64 strings
   */
  static encrypt(plaintext: string | Buffer, key: Buffer): {
    iv: string;
    authTag: string;
    encrypted: string;
  } {
    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, key, iv);
    
    const plaintextBuffer = typeof plaintext === 'string' 
      ? Buffer.from(plaintext, 'utf-8') 
      : plaintext;
    
    const encrypted = Buffer.concat([
      cipher.update(plaintextBuffer),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      encrypted: encrypted.toString('base64'),
    };
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static decrypt(encryptedData: {
    iv: string;
    authTag: string;
    encrypted: string;
  }, key: Buffer): Buffer {
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');
    const encrypted = Buffer.from(encryptedData.encrypted, 'base64');
    
    const decipher = createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);
    
    return decrypted;
  }

  /**
   * Encrypt and return as single base64 string with format: iv:authTag:encrypted
   */
  static encryptToString(plaintext: string | Buffer, key: Buffer): string {
    const result = this.encrypt(plaintext, key);
    return `${result.iv}:${result.authTag}:${result.encrypted}`;
  }

  /**
   * Decrypt from single base64 string format
   */
  static decryptFromString(encryptedString: string, key: Buffer): Buffer {
    const [iv, authTag, encrypted] = encryptedString.split(':');
    return this.decrypt({ iv, authTag, encrypted }, key);
  }
}
