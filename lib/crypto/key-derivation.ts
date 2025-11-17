import { argon2id } from '@noble/hashes/argon2';
import { randomBytes } from 'crypto';

/**
 * Argon2ID Key Derivation for Master Password
 * Provides strong resistance against brute-force attacks
 */
export class MasterKeyDerivation {
  private static readonly SALT_LENGTH = 32;
  private static readonly KEY_LENGTH = 32;
  
  // Argon2id parameters (OWASP recommended)
  private static readonly MEMORY_COST = 65536; // 65536 KiB = 64 MiB (Argon2 memory cost)
  private static readonly TIME_COST = 3;
  private static readonly PARALLELISM = 4;

  /**
   * Generate a random salt for key derivation
   */
  static generateSalt(): Buffer {
    return randomBytes(this.SALT_LENGTH);
  }

  /**
   * Derive a master key from a password using Argon2ID
   */
  static deriveKey(password: string, salt: Buffer): Buffer {
    const passwordBuffer = Buffer.from(password, 'utf-8');
    
    const key = argon2id(passwordBuffer, salt, {
      t: this.TIME_COST,
      m: this.MEMORY_COST,
      p: this.PARALLELISM,
      dkLen: this.KEY_LENGTH,
    });

    return Buffer.from(key);
  }

  /**
   * Verify a password against a derived key
   */
  static verifyPassword(password: string, salt: Buffer, expectedKey: Buffer): boolean {
    const derivedKey = this.deriveKey(password, salt);
    return derivedKey.equals(expectedKey);
  }
}
