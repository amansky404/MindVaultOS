import { EncryptedDatabase } from '../db/encrypted-db';

/**
 * Browser History Module
 * Logs browser URL visits
 */
export class BrowserHistory {
  private db: EncryptedDatabase;
  private isTracking: boolean = false;

  constructor(db: EncryptedDatabase) {
    this.db = db;
  }

  /**
   * Start tracking browser
   */
  start(): void {
    this.isTracking = true;
    console.log('[BrowserHistory] Tracking started');
  }

  /**
   * Stop tracking browser
   */
  stop(): void {
    this.isTracking = false;
    console.log('[BrowserHistory] Tracking stopped');
  }

  /**
   * Record browser URL visit
   */
  recordVisit(url: string, title?: string, browser?: string): void {
    if (!this.isTracking || !this.db.isUnlocked()) {
      return;
    }

    try {
      const now = Date.now();
      
      // Check if URL exists
      const existing = this.db.getDB().prepare(`
        SELECT id, visit_count FROM browser_history 
        WHERE url = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).get(url) as { id: number; visit_count: number } | undefined;

      if (existing) {
        // Update visit count
        this.db.getDB().prepare(`
          UPDATE browser_history 
          SET visit_count = visit_count + 1, timestamp = ?
          WHERE id = ?
        `).run(now, existing.id);
      } else {
        // Insert new record
        this.db.getDB().prepare(`
          INSERT INTO browser_history (timestamp, url, title, browser, visit_count, created_at)
          VALUES (?, ?, ?, ?, 1, ?)
        `).run(now, url, title || '', browser || 'unknown', now);
      }

    } catch (error) {
      console.error('[BrowserHistory] Error recording visit:', error);
    }
  }

  /**
   * Get browser history
   */
  getHistory(limit: number = 100, offset: number = 0): Array<{
    id: number;
    timestamp: number;
    url: string;
    title: string;
    browser: string;
    visitCount: number;
    createdAt: number;
  }> {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT id, timestamp, url, title, browser, visit_count, created_at
      FROM browser_history
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as Array<{
      id: number;
      timestamp: number;
      url: string;
      title: string;
      browser: string;
      visit_count: number;
      created_at: number;
    }>;

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      url: row.url,
      title: row.title,
      browser: row.browser,
      visitCount: row.visit_count,
      createdAt: row.created_at,
    }));
  }

  /**
   * Search browser history
   */
  search(query: string, limit: number = 50): Array<{
    id: number;
    timestamp: number;
    url: string;
    title: string;
    browser: string;
    visitCount: number;
    createdAt: number;
  }> {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const lowerQuery = query.toLowerCase();
    const rows = this.db.getDB().prepare(`
      SELECT id, timestamp, url, title, browser, visit_count, created_at
      FROM browser_history
      WHERE LOWER(url) LIKE ? OR LOWER(title) LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(`%${lowerQuery}%`, `%${lowerQuery}%`, limit) as Array<{
      id: number;
      timestamp: number;
      url: string;
      title: string;
      browser: string;
      visit_count: number;
      created_at: number;
    }>;

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      url: row.url,
      title: row.title,
      browser: row.browser,
      visitCount: row.visit_count,
      createdAt: row.created_at,
    }));
  }

  /**
   * Delete browser entry
   */
  delete(id: number): void {
    this.db.getDB().prepare('DELETE FROM browser_history WHERE id = ?').run(id);
  }

  /**
   * Clear all browser history
   */
  clearAll(): void {
    this.db.getDB().prepare('DELETE FROM browser_history').run();
  }
}
