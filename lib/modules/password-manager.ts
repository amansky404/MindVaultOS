import { EncryptedDatabase } from '../db/encrypted-db';
import { v4 as uuidv4 } from 'uuid';

export interface Password {
  id: string;
  timestamp: number;
  name: string;
  username: string;
  password: string;
  notes?: string;
  url?: string;
  category?: string;
  tags?: string[];
  autoFill: boolean;
  autoSubmit: boolean;
  autoType: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * Password Manager Module
 * Secure encrypted password storage
 */
export class PasswordManager {
  private db: EncryptedDatabase;

  constructor(db: EncryptedDatabase) {
    this.db = db;
  }

  /**
   * Add a new password
   */
  addPassword(data: {
    name: string;
    username: string;
    password: string;
    notes?: string;
    url?: string;
    category?: string;
    tags?: string[];
    autoFill?: boolean;
    autoSubmit?: boolean;
    autoType?: boolean;
  }): Password {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const id = uuidv4();
    const now = Date.now();
    
    const encryptedUsername = this.db.encrypt(data.username);
    const encryptedPassword = this.db.encrypt(data.password);
    const encryptedNotes = data.notes ? this.db.encrypt(data.notes) : null;

    this.db.getDB().prepare(`
      INSERT INTO passwords (
        id, timestamp, name, encrypted_username, encrypted_password, 
        encrypted_notes, url, category, tags, auto_fill, auto_submit, 
        auto_type, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      now,
      data.name,
      encryptedUsername,
      encryptedPassword,
      encryptedNotes,
      data.url || null,
      data.category || null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.autoFill ?? true,
      data.autoSubmit ?? false,
      data.autoType ?? false,
      now,
      now
    );

    return {
      id,
      timestamp: now,
      name: data.name,
      username: data.username,
      password: data.password,
      notes: data.notes,
      url: data.url,
      category: data.category,
      tags: data.tags,
      autoFill: data.autoFill ?? true,
      autoSubmit: data.autoSubmit ?? false,
      autoType: data.autoType ?? false,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get password by ID
   */
  getPassword(id: string): Password | null {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const row = this.db.getDB().prepare(`
      SELECT * FROM passwords WHERE id = ?
    `).get(id) as any;

    if (!row) return null;

    return this.decryptPasswordRow(row);
  }

  /**
   * Get all passwords
   */
  getAllPasswords(limit: number = 100, offset: number = 0): Password[] {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT * FROM passwords
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as any[];

    return rows.map(row => this.decryptPasswordRow(row));
  }

  /**
   * Update password
   */
  updatePassword(id: string, data: Partial<{
    name: string;
    username: string;
    password: string;
    notes: string;
    url: string;
    category: string;
    tags: string[];
    autoFill: boolean;
    autoSubmit: boolean;
    autoType: boolean;
  }>): Password | null {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const existing = this.getPassword(id);
    if (!existing) return null;

    const now = Date.now();
    const updates: any = { updated_at: now };

    if (data.name !== undefined) updates.name = data.name;
    if (data.username !== undefined) updates.encrypted_username = this.db.encrypt(data.username);
    if (data.password !== undefined) updates.encrypted_password = this.db.encrypt(data.password);
    if (data.notes !== undefined) updates.encrypted_notes = this.db.encrypt(data.notes);
    if (data.url !== undefined) updates.url = data.url;
    if (data.category !== undefined) updates.category = data.category;
    if (data.tags !== undefined) updates.tags = JSON.stringify(data.tags);
    if (data.autoFill !== undefined) updates.auto_fill = data.autoFill;
    if (data.autoSubmit !== undefined) updates.auto_submit = data.autoSubmit;
    if (data.autoType !== undefined) updates.auto_type = data.autoType;

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    this.db.getDB().prepare(`
      UPDATE passwords SET ${setClause} WHERE id = ?
    `).run(...values);

    return this.getPassword(id);
  }

  /**
   * Delete password
   */
  deletePassword(id: string): boolean {
    const result = this.db.getDB().prepare('DELETE FROM passwords WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Search passwords
   */
  searchPasswords(query: string, limit: number = 50): Password[] {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const lowerQuery = query.toLowerCase();
    const rows = this.db.getDB().prepare(`
      SELECT * FROM passwords
      WHERE LOWER(name) LIKE ? OR LOWER(url) LIKE ? OR LOWER(category) LIKE ?
      ORDER BY updated_at DESC
      LIMIT ?
    `).all(`%${lowerQuery}%`, `%${lowerQuery}%`, `%${lowerQuery}%`, limit) as any[];

    return rows.map(row => this.decryptPasswordRow(row));
  }

  /**
   * Get passwords by category
   */
  getPasswordsByCategory(category: string): Password[] {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT * FROM passwords WHERE category = ?
      ORDER BY updated_at DESC
    `).all(category) as any[];

    return rows.map(row => this.decryptPasswordRow(row));
  }

  /**
   * Get passwords by URL
   */
  getPasswordsByUrl(url: string): Password[] {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT * FROM passwords WHERE url LIKE ?
      ORDER BY updated_at DESC
    `).all(`%${url}%`) as any[];

    return rows.map(row => this.decryptPasswordRow(row));
  }

  /**
   * Decrypt password row
   */
  private decryptPasswordRow(row: any): Password {
    return {
      id: row.id,
      timestamp: row.timestamp,
      name: row.name,
      username: this.db.decrypt(row.encrypted_username),
      password: this.db.decrypt(row.encrypted_password),
      notes: row.encrypted_notes ? this.db.decrypt(row.encrypted_notes) : undefined,
      url: row.url,
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      autoFill: Boolean(row.auto_fill),
      autoSubmit: Boolean(row.auto_submit),
      autoType: Boolean(row.auto_type),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
