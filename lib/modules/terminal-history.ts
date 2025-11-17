import { EncryptedDatabase } from '../db/encrypted-db';

/**
 * Terminal History Module
 * Records terminal commands and outputs
 */
export class TerminalHistory {
  private db: EncryptedDatabase;
  private isRecording: boolean = false;

  constructor(db: EncryptedDatabase) {
    this.db = db;
  }

  /**
   * Start recording terminal
   */
  start(): void {
    this.isRecording = true;
    console.log('[TerminalHistory] Recording started');
  }

  /**
   * Stop recording terminal
   */
  stop(): void {
    this.isRecording = false;
    console.log('[TerminalHistory] Recording stopped');
  }

  /**
   * Record terminal command and output
   */
  recordCommand(
    command: string,
    output?: string,
    exitCode?: number,
    workingDirectory?: string,
    shell?: string
  ): void {
    if (!this.isRecording || !this.db.isUnlocked()) {
      return;
    }

    try {
      const encryptedCommand = this.db.encrypt(command);
      const encryptedOutput = output ? this.db.encrypt(output) : null;
      const now = Date.now();

      this.db.getDB().prepare(`
        INSERT INTO terminal_history (
          timestamp, encrypted_command, encrypted_output, 
          exit_code, working_directory, shell, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        now,
        encryptedCommand,
        encryptedOutput,
        exitCode ?? null,
        workingDirectory || null,
        shell || 'unknown',
        now
      );

    } catch (error) {
      console.error('[TerminalHistory] Error recording command:', error);
    }
  }

  /**
   * Get terminal history
   */
  getHistory(limit: number = 100, offset: number = 0): Array<{
    id: number;
    timestamp: number;
    command: string;
    output?: string;
    exitCode?: number;
    workingDirectory?: string;
    shell: string;
    createdAt: number;
  }> {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT id, timestamp, encrypted_command, encrypted_output, 
             exit_code, working_directory, shell, created_at
      FROM terminal_history
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset) as Array<{
      id: number;
      timestamp: number;
      encrypted_command: string;
      encrypted_output: string | null;
      exit_code: number | null;
      working_directory: string | null;
      shell: string;
      created_at: number;
    }>;

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      command: this.db.decrypt(row.encrypted_command),
      output: row.encrypted_output ? this.db.decrypt(row.encrypted_output) : undefined,
      exitCode: row.exit_code ?? undefined,
      workingDirectory: row.working_directory ?? undefined,
      shell: row.shell,
      createdAt: row.created_at,
    }));
  }

  /**
   * Search terminal history
   */
  search(query: string, limit: number = 50): Array<{
    id: number;
    timestamp: number;
    command: string;
    output?: string;
    exitCode?: number;
    workingDirectory?: string;
    shell: string;
    createdAt: number;
  }> {
    if (!this.db.isUnlocked()) {
      throw new Error('Database is locked');
    }

    const rows = this.db.getDB().prepare(`
      SELECT id, timestamp, encrypted_command, encrypted_output, 
             exit_code, working_directory, shell, created_at
      FROM terminal_history
      ORDER BY timestamp DESC
      LIMIT ?
    `).all(limit * 5) as Array<{
      id: number;
      timestamp: number;
      encrypted_command: string;
      encrypted_output: string | null;
      exit_code: number | null;
      working_directory: string | null;
      shell: string;
      created_at: number;
    }>;

    // Decrypt and filter
    return rows
      .map(row => ({
        id: row.id,
        timestamp: row.timestamp,
        command: this.db.decrypt(row.encrypted_command),
        output: row.encrypted_output ? this.db.decrypt(row.encrypted_output) : undefined,
        exitCode: row.exit_code ?? undefined,
        workingDirectory: row.working_directory ?? undefined,
        shell: row.shell,
        createdAt: row.created_at,
      }))
      .filter(item => 
        item.command.toLowerCase().includes(query.toLowerCase()) ||
        (item.output && item.output.toLowerCase().includes(query.toLowerCase()))
      )
      .slice(0, limit);
  }

  /**
   * Delete terminal entry
   */
  delete(id: number): void {
    this.db.getDB().prepare('DELETE FROM terminal_history WHERE id = ?').run(id);
  }

  /**
   * Clear all terminal history
   */
  clearAll(): void {
    this.db.getDB().prepare('DELETE FROM terminal_history').run();
  }
}
