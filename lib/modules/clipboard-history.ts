import { EncryptedDatabase } from '../db/encrypted-db';

/**
 * Clipboard History Module
 * Tracks clipboard changes and stores encrypted history
 */
export class ClipboardHistory {
  private db: EncryptedDatabase;
  private isTracking: boolean = false;
  private lastContent: string = '';

  constructor(db: EncryptedDatabase) {
    this.db = db;
  }

  /**
   * Start tracking clipboard
   */
  start(): void {
    this.isTracking = true;
    console.log('[ClipboardHistory] Tracking started');
  }

  /**
   * Stop tracking clipboard
   */
  stop(): void {
    this.isTracking = false;
    console.log('[ClipboardHistory] Tracking stopped');
  }

  /**
   * Record clipboard content
   */
  recordClipboard(content: string, contentType: string, sourceApp?: string): void {
    if (!this.isTracking || !this.db.isUnlocked()) {
      return;
    }

    // Skip if same as last content
    if (content === this.lastContent) {
      return;
    }

    this.lastContent = content;

    try {
      const encryptedContent = this.db.encrypt(content);
      const now = Date.now();

      this.db.getDB().prepare(`
        INSERT INTO clipboard_history (timestamp, encrypted_content, content_type, source_application, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(now, encryptedContent, contentType, sourceApp || 'unknown', now);

    } catch (error) {
      console.error('[ClipboardHistory] Error recording clipboard:', error);
    }
  }

  /**
   * Get clipboard history
   */
  getHistory(limit: number = 100, offset: number = 0): Array<{
    id: number;
    timestamp: number;
    content: string;
    contentType: string;
    sourceApplication: string;
    createdAt: number;
  }> {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT id, timestamp, encrypted_content, content_type, source_application, created_at
      FROM clipboard_history
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as Array<{
      id: number;
      timestamp: number;
      encrypted_content: string;
      content_type: string;
      source_application: string;
      created_at: number;
    }>;

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      content: this.db.decrypt(row.encrypted_content),
      contentType: row.content_type,
      sourceApplication: row.source_application,
      createdAt: row.created_at,
    }));
  }

  /**
   * Search clipboard history
   */
  search(query: string, limit: number = 50): Array<{
    id: number;
    timestamp: number;
    content: string;
    contentType: string;
    sourceApplication: string;
    createdAt: number;
  }> {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT id, timestamp, encrypted_content, content_type, source_application, created_at
      FROM clipboard_history
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(limit * 5) as Array<{
      id: number;
      timestamp: number;
      encrypted_content: string;
      content_type: string;
      source_application: string;
      created_at: number;
    }>;

    // Decrypt and filter
    return rows
      .map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        content: this.db.decrypt(row.encrypted_content),
        contentType: row.content_type,
        sourceApplication: row.source_application,
        createdAt: row.created_at,
      }))
      .filter(item => item.content.toLowerCase().includes(query.toLowerCase()))
      .slice(0, limit);
  }

  /**
   * Delete clipboard entry
   */
  delete(id: number): void {
    this.db.getDB().prepare('DELETE FROM clipboard_history WHERE id = ?').run(id);
  }

  /**
   * Clear all clipboard history
   */
  clearAll(): void {
    this.db.getDB().prepare('DELETE FROM clipboard_history').run();
  }
}
