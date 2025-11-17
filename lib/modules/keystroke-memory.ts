import { EncryptedDatabase } from '../db/encrypted-db';

/**
 * Keystroke Memory Module
 * Records keystrokes while excluding password fields for security
 */
export class KeystrokeMemory {
  private db: EncryptedDatabase;
  private isRecording: boolean = false;
  private buffer: string = '';
  private currentApp: string = '';
  private currentWindow: string = '';
  private lastSaveTime: number = Date.now();
  private readonly SAVE_INTERVAL = 5000; // Save every 5 seconds
  private readonly PASSWORD_FIELD_PATTERNS = [
    'password',
    'passwd',
    'pwd',
    'pin',
    'secret',
    'passphrase',
    'credentials',
  ];

  constructor(db: EncryptedDatabase) {
    this.db = db;
  }

  /**
   * Start recording keystrokes
   */
  start(): void {
    this.isRecording = true;
    console.log('[KeystrokeMemory] Recording started');
  }

  /**
   * Stop recording keystrokes
   */
  stop(): void {
    this.isRecording = false;
    this.saveBuffer();
    console.log('[KeystrokeMemory] Recording stopped');
  }

  /**
   * Check if current context is a password field
   */
  private isPasswordField(context: string): boolean {
    const lowerContext = context.toLowerCase();
    return this.PASSWORD_FIELD_PATTERNS.some(pattern => lowerContext.includes(pattern));
  }

  /**
   * Record a keystroke
   */
  recordKeystroke(char: string, context: string, app: string, windowTitle: string): void {
    if (!this.isRecording || !this.db.isUnlocked()) {
      return;
    }

    // Skip if in password field
    if (this.isPasswordField(context) || this.isPasswordField(windowTitle)) {
      console.log('[KeystrokeMemory] Skipping password field');
      return;
    }

    // If app/window changed, save current buffer
    if (app !== this.currentApp || windowTitle !== this.currentWindow) {
      this.saveBuffer();
      this.currentApp = app;
      this.currentWindow = windowTitle;
    }

    this.buffer += char;

    // Auto-save periodically
    if (Date.now() - this.lastSaveTime > this.SAVE_INTERVAL) {
      this.saveBuffer();
    }
  }

  /**
   * Save current buffer to database
   */
  private saveBuffer(): void {
    if (!this.buffer || !this.db.isUnlocked()) {
      return;
    }

    try {
      const encryptedText = this.db.encrypt(this.buffer);
      const now = Date.now();

      this.db.getDB().prepare(`
        INSERT INTO keystrokes (timestamp, application, window_title, encrypted_text, context, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(now, this.currentApp, this.currentWindow, encryptedText, '', now);

      this.buffer = '';
      this.lastSaveTime = now;
    } catch (error) {
      console.error('[KeystrokeMemory] Error saving buffer:', error);
    }
  }

  /**
   * Get keystroke history
   */
  getHistory(limit: number = 100, offset: number = 0): Array<{
    id: number;
    timestamp: number;
    application: string;
    windowTitle: string;
    text: string;
    createdAt: number;
  }> {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT id, timestamp, application, window_title, encrypted_text, created_at
      FROM keystrokes
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as Array<{
      id: number;
      timestamp: number;
      application: string;
      window_title: string;
      encrypted_text: string;
      created_at: number;
    }>;

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      application: row.application,
      windowTitle: row.window_title,
      text: this.db.decrypt(row.encrypted_text),
      createdAt: row.created_at,
    }));
  }

  /**
   * Search keystroke history
   */
  search(query: string, limit: number = 50): Array<{
    id: number;
    timestamp: number;
    application: string;
    windowTitle: string;
    text: string;
    createdAt: number;
  }> {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT id, timestamp, application, window_title, encrypted_text, created_at
      FROM keystrokes
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(limit * 5) as Array<{
      id: number;
      timestamp: number;
      application: string;
      window_title: string;
      encrypted_text: string;
      created_at: number;
    }>;

    // Decrypt and filter
    return rows
      .map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        application: row.application,
        windowTitle: row.window_title,
        text: this.db.decrypt(row.encrypted_text),
        createdAt: row.created_at,
      }))
      .filter(item => item.text.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }
}
