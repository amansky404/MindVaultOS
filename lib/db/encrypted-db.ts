import Database from 'better-sqlite3';
import { AESEncryption } from '../crypto/aes-encryption';
import { MasterKeyDerivation } from '../crypto/key-derivation';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

/**
 * Encrypted Database Manager using SQLite with AES-256-GCM encryption
 * All sensitive data is encrypted at rest
 */
export class EncryptedDatabase {
  private db: Database.Database;
  private masterKey: Buffer | null = null;
  private dbPath: string;

  constructor(dbPath?: string) {
    // Use app data directory in production, local in dev
    const userDataPath = app?.getPath('userData') || path.join(__dirname, '../../data');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    this.dbPath = dbPath || path.join(userDataPath, 'mindvault.db');
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeSchema();
  }

  /**
   * Initialize database schema
   */
  private initializeSchema(): void {
    // Master key storage
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS master_config (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        salt TEXT NOT NULL,
        verification_hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);

    // Keystroke memory (excludes password fields)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS keystrokes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        application TEXT NOT NULL,
        window_title TEXT,
        encrypted_text TEXT NOT NULL,
        context TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_keystrokes_timestamp ON keystrokes(timestamp);
      CREATE INDEX IF NOT EXISTS idx_keystrokes_application ON keystrokes(application);
    `);

    // Clipboard history
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS clipboard_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        encrypted_content TEXT NOT NULL,
        content_type TEXT NOT NULL,
        source_application TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_clipboard_timestamp ON clipboard_history(timestamp);
    `);

    // Terminal commands and output
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS terminal_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        encrypted_command TEXT NOT NULL,
        encrypted_output TEXT,
        exit_code INTEGER,
        working_directory TEXT,
        shell TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_terminal_timestamp ON terminal_history(timestamp);
    `);

    // Browser URL logs
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS browser_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        url TEXT NOT NULL,
        title TEXT,
        browser TEXT,
        visit_count INTEGER DEFAULT 1,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_browser_timestamp ON browser_history(timestamp);
      CREATE INDEX IF NOT EXISTS idx_browser_url ON browser_history(url);
    `);

    // Password vault
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS passwords (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        name TEXT NOT NULL,
        encrypted_username TEXT NOT NULL,
        encrypted_password TEXT NOT NULL,
        encrypted_notes TEXT,
        url TEXT,
        category TEXT,
        tags TEXT,
        auto_fill INTEGER DEFAULT 1,
        auto_submit INTEGER DEFAULT 0,
        auto_type INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_passwords_category ON passwords(category);
      CREATE INDEX IF NOT EXISTS idx_passwords_url ON passwords(url);
    `);

    // Notes vault
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        title TEXT NOT NULL,
        encrypted_content TEXT NOT NULL,
        category TEXT,
        tags TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notes_category ON notes(category);
    `);

    // File vault metadata
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        filename TEXT NOT NULL,
        encrypted_path TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT,
        category TEXT,
        tags TEXT,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_files_category ON files(category);
    `);

    // AutoFill rules and configurations
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS autofill_rules (
        id TEXT PRIMARY KEY,
        domain TEXT NOT NULL,
        application TEXT,
        credential_id TEXT NOT NULL,
        field_mappings TEXT NOT NULL,
        auto_submit INTEGER DEFAULT 0,
        multi_step INTEGER DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (credential_id) REFERENCES passwords(id)
      );
      CREATE INDEX IF NOT EXISTS idx_autofill_domain ON autofill_rules(domain);
      CREATE INDEX IF NOT EXISTS idx_autofill_application ON autofill_rules(application);
    `);
  }

  /**
   * Initialize master password (first time setup)
   */
  async initializeMasterPassword(password: string): Promise<boolean> {
    const existing = this.db.prepare('SELECT id FROM master_config WHERE id = 1').get();
    if (existing) {
      throw new Error('Master password already initialized');
    }

    const salt = MasterKeyDerivation.generateSalt();
    const key = MasterKeyDerivation.deriveKey(password, salt);
    
    // Store salt and verification hash
    const verificationHash = AESEncryption.encryptToString('VERIFIED', key);
    
    this.db.prepare(`
      INSERT INTO master_config (id, salt, verification_hash, created_at)
      VALUES (1, ?, ?, ?)
    `).run(salt.toString('base64'), verificationHash, Date.now());

    this.masterKey = key;
    return true;
  }

  /**
   * Unlock database with master password
   */
  async unlock(password: string): Promise<boolean> {
    const config = this.db.prepare('SELECT salt, verification_hash FROM master_config WHERE id = 1').get() as {
      salt: string;
      verification_hash: string;
    } | undefined;

    if (!config) {
      throw new Error('Master password not initialized');
    }

    const salt = Buffer.from(config.salt, 'base64');
    const key = MasterKeyDerivation.deriveKey(password, salt);

    try {
      const decrypted = AESEncryption.decryptFromString(config.verification_hash, key);
      if (decrypted.toString('utf-8') === 'VERIFIED') {
        this.masterKey = key;
        return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  /**
   * Lock database
   */
  lock(): void {
    this.masterKey = null;
  }

  /**
   * Check if database is unlocked
   */
  isUnlocked(): boolean {
    return this.masterKey !== null;
  }

  /**
   * Get master key (throws if locked)
   */
  private getMasterKey(): Buffer {
    if (!this.masterKey) {
      throw new Error('Database is locked. Please unlock first.');
    }
    return this.masterKey;
  }

  /**
   * Encrypt data
   */
  encrypt(data: string | Buffer): string {
    return AESEncryption.encryptToString(data, this.getMasterKey());
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData: string): string {
    return AESEncryption.decryptFromString(encryptedData, this.getMasterKey()).toString('utf-8');
  }

  /**
   * Get database instance for custom queries
   */
  getDB(): Database.Database {
    return this.db;
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }
}
