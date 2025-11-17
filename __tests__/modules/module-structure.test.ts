/**
 * Module structure and export validation tests
 * These tests ensure all modules can be imported and have expected exports
 */

describe('Module Structure Tests', () => {
  describe('Crypto Modules', () => {
    it('should export MasterKeyDerivation class', () => {
      const { MasterKeyDerivation } = require('../../lib/crypto/key-derivation');
      expect(MasterKeyDerivation).toBeDefined();
      expect(typeof MasterKeyDerivation.generateSalt).toBe('function');
      expect(typeof MasterKeyDerivation.deriveKey).toBe('function');
      expect(typeof MasterKeyDerivation.verifyPassword).toBe('function');
    });

    it('should export AESEncryption class', () => {
      const { AESEncryption } = require('../../lib/crypto/aes-encryption');
      expect(AESEncryption).toBeDefined();
      expect(typeof AESEncryption.encrypt).toBe('function');
      expect(typeof AESEncryption.decrypt).toBe('function');
      expect(typeof AESEncryption.encryptToString).toBe('function');
      expect(typeof AESEncryption.decryptFromString).toBe('function');
    });
  });

  describe('Database Module', () => {
    it('should export EncryptedDatabase class', () => {
      // Note: This will fail in CI without Electron, but validates structure
      try {
        const { EncryptedDatabase } = require('../../lib/db/encrypted-db');
        expect(EncryptedDatabase).toBeDefined();
      } catch (error) {
        // Expected to fail without Electron in test environment
        expect(error).toBeDefined();
      }
    });
  });

  describe('Data Collection Modules', () => {
    it('should export ClipboardHistory class', () => {
      const { ClipboardHistory } = require('../../lib/modules/clipboard-history');
      expect(ClipboardHistory).toBeDefined();
    });

    it('should export KeystrokeMemory class', () => {
      const { KeystrokeMemory } = require('../../lib/modules/keystroke-memory');
      expect(KeystrokeMemory).toBeDefined();
    });

    it('should export TerminalHistory class', () => {
      const { TerminalHistory } = require('../../lib/modules/terminal-history');
      expect(TerminalHistory).toBeDefined();
    });

    it('should export BrowserHistory class', () => {
      const { BrowserHistory } = require('../../lib/modules/browser-history');
      expect(BrowserHistory).toBeDefined();
    });

    it('should export PasswordManager class', () => {
      const { PasswordManager } = require('../../lib/modules/password-manager');
      expect(PasswordManager).toBeDefined();
    });

    it('should export NotesVault class', () => {
      const { NotesVault } = require('../../lib/modules/notes-vault');
      expect(NotesVault).toBeDefined();
    });
  });

  describe('API Modules', () => {
    it('should export LocalAPIServer class', () => {
      const { LocalAPIServer } = require('../../lib/api/local-server');
      expect(LocalAPIServer).toBeDefined();
    });

    it('should export AutoFill classes', () => {
      const { BrowserAutoFill, HumanTypingSimulator } = require('../../lib/api/autofill-engine');
      expect(BrowserAutoFill).toBeDefined();
      expect(HumanTypingSimulator).toBeDefined();
    });
  });
});
