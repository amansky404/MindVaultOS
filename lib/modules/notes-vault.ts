import { EncryptedDatabase } from '../db/encrypted-db';
import { v4 as uuidv4 } from 'uuid';

export interface Note {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

/**
 * Notes Vault Module
 * Encrypted note storage
 */
export class NotesVault {
  private db: EncryptedDatabase;

  constructor(db: EncryptedDatabase) {
    this.db = db;
  }

  /**
   * Add a new note
   */
  addNote(data: {
    title: string;
    content: string;
    category?: string;
    tags?: string[];
  }): Note {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const id = uuidv4();
    const now = Date.now();
    
    const encryptedContent = this.db.encrypt(data.content);

    this.db.getDB().prepare(`
      INSERT INTO notes (id, timestamp, title, encrypted_content, category, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      now,
      data.title,
      encryptedContent,
      data.category || null,
      data.tags ? JSON.stringify(data.tags) : null,
      now,
      now
    );

    return {
      id,
      timestamp: now,
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get note by ID
   */
  getNote(id: string): Note | null {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const row = this.db.getDB().prepare(`
      SELECT * FROM notes WHERE id = ?
    `).get(id) as any;

    if (!row) return null;

    return this.decryptNoteRow(row);
  }

  /**
   * Get all notes
   */
  getAllNotes(limit: number = 100, offset: number = 0): Note[] {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT * FROM notes
      ORDER BY updated_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as any[];

    return rows.map(row => this.decryptNoteRow(row));
  }

  /**
   * Update note
   */
  updateNote(id: string, data: Partial<{
    title: string;
    content: string;
    category: string;
    tags: string[];
  }>): Note | null {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const existing = this.getNote(id);
    if (!existing) return null;

    const now = Date.now();
    const updates: any = { updated_at: now };

    if (data.title !== undefined) updates.title = data.title;
    if (data.content !== undefined) updates.encrypted_content = this.db.encrypt(data.content);
    if (data.category !== undefined) updates.category = data.category;
    if (data.tags !== undefined) updates.tags = JSON.stringify(data.tags);

    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), id];

    this.db.getDB().prepare(`
      UPDATE notes SET ${setClause} WHERE id = ?
    `).run(...values);

    return this.getNote(id);
  }

  /**
   * Delete note
   */
  deleteNote(id: string): boolean {
    const result = this.db.getDB().prepare('DELETE FROM notes WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Search notes
   */
  searchNotes(query: string, limit: number = 50): Note[] {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const lowerQuery = query.toLowerCase();
    const rows = this.db.getDB().prepare(`
      SELECT * FROM notes
      WHERE LOWER(title) LIKE ? OR LOWER(category) LIKE ?
      ORDER BY updated_at DESC
      LIMIT ?
    `).all(`%${lowerQuery}%`, `%${lowerQuery}%`, limit * 3) as any[];

    // Decrypt and filter by content
    return rows
      .map(row => this.decryptNoteRow(row))
      .filter(note => 
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery) ||
        (note.category && note.category.toLowerCase().includes(lowerQuery))
      )
      .slice(0, limit);
  }

  /**
   * Get notes by category
   */
  getNotesByCategory(category: string): Note[] {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT * FROM notes WHERE category = ?
      ORDER BY updated_at DESC
    `).all(category) as any[];

    return rows.map(row => this.decryptNoteRow(row));
  }

  /**
   * Decrypt note row
   */
  private decryptNoteRow(row: any): Note {
    return {
      id: row.id,
      timestamp: row.timestamp,
      title: row.title,
      content: this.db.decrypt(row.encrypted_content),
      category: row.category,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
