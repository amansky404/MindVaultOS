import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { EncryptedDatabase } from '../db/encrypted-db';
import { PasswordManager } from '../modules/password-manager';

/**
 * Local API Server for AutoFill
 * Only accessible from 127.0.0.1 (localhost)
 * Provides secure credential access for browser extensions and desktop apps
 */
export class LocalAPIServer {
  private app: Express;
  private db: EncryptedDatabase;
  private passwordManager: PasswordManager;
  private port: number = 37405; // Random high port
  private server: any;

  constructor(db: EncryptedDatabase) {
    this.db = db;
    this.passwordManager = new PasswordManager(db);
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Only allow localhost connections
    this.app.use((req, res, next) => {
      const clientIP = req.ip || req.socket.remoteAddress;
      if (clientIP !== '127.0.0.1' && clientIP !== '::1' && clientIP !== '::ffff:127.0.0.1') {
        return res.status(403).json({ error: 'Access denied. Local only.' });
      }
      next();
    });

    // CORS - only localhost origins
    this.app.use(cors({
      origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }));

    this.app.use(express.json());
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Health check
    this.app.get('/api/health', (req: Request, res: Response) => {
      res.json({ status: 'ok', locked: !this.db.isUnlocked() });
    });

    // Check if database is unlocked
    this.app.get('/api/status', (req: Request, res: Response) => {
      res.json({ unlocked: this.db.isUnlocked() });
    });

    // Get credentials for a domain/application
    this.app.post('/api/credentials/search', (req: Request, res: Response) => {
      try {
        if (!this.db.isUnlocked()) {
          return res.status(403).json({ error: 'Database is locked' });
        }

        const { domain, application } = req.body;
        
        if (!domain && !application) {
          return res.status(400).json({ error: 'Domain or application required' });
        }

        // Search by URL or name
        const query = domain || application;
        const credentials = this.passwordManager.searchPasswords(query, 10);

        // Return only what's needed for AutoFill
        const results = credentials.map(cred => ({
          id: cred.id,
          name: cred.name,
          username: cred.username,
          password: cred.password,
          url: cred.url,
          autoFill: cred.autoFill,
          autoSubmit: cred.autoSubmit,
          autoType: cred.autoType,
        }));

        res.json({ credentials: results });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get specific credential by ID
    this.app.get('/api/credentials/:id', (req: Request, res: Response) => {
      try {
        if (!this.db.isUnlocked()) {
          return res.status(403).json({ error: 'Database is locked' });
        }

        const credential = this.passwordManager.getPassword(req.params.id);
        
        if (!credential) {
          return res.status(404).json({ error: 'Credential not found' });
        }

        res.json({
          id: credential.id,
          name: credential.name,
          username: credential.username,
          password: credential.password,
          url: credential.url,
          autoFill: credential.autoFill,
          autoSubmit: credential.autoSubmit,
          autoType: credential.autoType,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Get AutoFill rules for domain/application
    this.app.post('/api/autofill/rules', (req: Request, res: Response) => {
      try {
        if (!this.db.isUnlocked()) {
          return res.status(403).json({ error: 'Database is locked' });
        }

        const { domain, application } = req.body;
        
        const query = domain 
          ? 'SELECT * FROM autofill_rules WHERE domain LIKE ? LIMIT 10'
          : 'SELECT * FROM autofill_rules WHERE application LIKE ? LIMIT 10';
        
        const param = `%${domain || application}%`;
        const rules = this.db.getDB().prepare(query).all(param);

        res.json({ rules });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });

    // Terminal credential request
    this.app.post('/api/credentials/terminal', (req: Request, res: Response) => {
      try {
        if (!this.db.isUnlocked()) {
          return res.status(403).json({ error: 'Database is locked' });
        }

        const { command, context } = req.body;
        
        // Detect credential type from command
        let searchQuery = '';
        if (command.includes('ssh')) {
          searchQuery = 'ssh';
        } else if (command.includes('sudo')) {
          searchQuery = 'sudo';
        } else if (command.includes('git')) {
          searchQuery = 'git';
        } else if (command.includes('mysql') || command.includes('psql')) {
          searchQuery = 'database';
        }

        if (!searchQuery) {
          return res.json({ credentials: [] });
        }

        const credentials = this.passwordManager.searchPasswords(searchQuery, 5);

        const results = credentials.map(cred => ({
          id: cred.id,
          name: cred.name,
          username: cred.username,
          password: cred.password,
        }));

        res.json({ credentials: results });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  /**
   * Start the API server
   */
  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.port, '127.0.0.1', () => {
          console.log(`[LocalAPI] Server running on http://127.0.0.1:${this.port}`);
          console.log(`[LocalAPI] Access restricted to localhost only`);
          resolve();
        });

        this.server.on('error', (error: any) => {
          if (error.code === 'EADDRINUSE') {
            console.log(`[LocalAPI] Port ${this.port} in use, trying ${this.port + 1}`);
            this.port++;
            this.start().then(resolve).catch(reject);
          } else {
            reject(error);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop the API server
   */
  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('[LocalAPI] Server stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get server port
   */
  getPort(): number {
    return this.port;
  }
}
