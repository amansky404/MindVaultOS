const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

// Import modules (will be converted to require in production)
let db = null;
let apiServer = null;
let keystrokeMemory = null;
let clipboardHistory = null;
let terminalHistory = null;
let browserHistory = null;

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    backgroundColor: '#0f172a',
    titleBarStyle: 'hidden',
    frame: true,
  });

  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../.next/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initializeApp() {
  try {
    // Dynamic imports for TypeScript modules
    const { EncryptedDatabase } = require('../lib/db/encrypted-db');
    const { LocalAPIServer } = require('../lib/api/local-server');
    const { KeystrokeMemory } = require('../lib/modules/keystroke-memory');
    const { ClipboardHistory } = require('../lib/modules/clipboard-history');
    const { TerminalHistory } = require('../lib/modules/terminal-history');
    const { BrowserHistory } = require('../lib/modules/browser-history');

    // Initialize encrypted database
    db = new EncryptedDatabase();

    // Initialize modules
    keystrokeMemory = new KeystrokeMemory(db);
    clipboardHistory = new ClipboardHistory(db);
    terminalHistory = new TerminalHistory(db);
    browserHistory = new BrowserHistory(db);

    // Initialize API server
    apiServer = new LocalAPIServer(db);
    await apiServer.start();

    console.log('[MindVault] Application initialized');
  } catch (error) {
    console.error('[MindVault] Initialization error:', error);
  }
}

function setupIPC() {
  // Database operations
  ipcMain.handle('db:isInitialized', async () => {
    try {
      const config = db.getDB().prepare('SELECT id FROM master_config WHERE id = 1').get();
      return !!config;
    } catch (error) {
      return false;
    }
  });

  ipcMain.handle('db:initialize', async (event, password) => {
    try {
      await db.initializeMasterPassword(password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:unlock', async (event, password) => {
    try {
      const unlocked = await db.unlock(password);
      if (unlocked) {
        // Start modules
        keystrokeMemory.start();
        clipboardHistory.start();
        terminalHistory.start();
        browserHistory.start();
      }
      return { success: unlocked };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:lock', async () => {
    try {
      keystrokeMemory.stop();
      clipboardHistory.stop();
      terminalHistory.stop();
      browserHistory.stop();
      db.lock();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('db:isUnlocked', async () => {
    return db.isUnlocked();
  });

  // API server info
  ipcMain.handle('api:getPort', async () => {
    return apiServer ? apiServer.getPort() : null;
  });

  // Module operations
  ipcMain.handle('clipboard:getHistory', async (event, limit, offset) => {
    try {
      return { success: true, data: clipboardHistory.getHistory(limit, offset) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('terminal:getHistory', async (event, limit, offset) => {
    try {
      return { success: true, data: terminalHistory.getHistory(limit, offset) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('browser:getHistory', async (event, limit, offset) => {
    try {
      return { success: true, data: browserHistory.getHistory(limit, offset) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Universal search
  ipcMain.handle('search:universal', async (event, query, limit) => {
    try {
      const results = {
        clipboard: clipboardHistory.search(query, limit || 10),
        terminal: terminalHistory.search(query, limit || 10),
        browser: browserHistory.search(query, limit || 10),
      };
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Password Manager operations
  ipcMain.handle('passwords:getAll', async (event, limit, offset) => {
    try {
      const { PasswordManager } = require('../lib/modules/password-manager');
      const passwordManager = new PasswordManager(db);
      return { success: true, data: passwordManager.getAllPasswords(limit, offset) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('passwords:add', async (event, data) => {
    try {
      const { PasswordManager } = require('../lib/modules/password-manager');
      const passwordManager = new PasswordManager(db);
      const password = passwordManager.addPassword(data);
      return { success: true, data: password };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('passwords:update', async (event, id, data) => {
    try {
      const { PasswordManager } = require('../lib/modules/password-manager');
      const passwordManager = new PasswordManager(db);
      const password = passwordManager.updatePassword(id, data);
      return { success: true, data: password };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('passwords:delete', async (event, id) => {
    try {
      const { PasswordManager } = require('../lib/modules/password-manager');
      const passwordManager = new PasswordManager(db);
      const deleted = passwordManager.deletePassword(id);
      return { success: true, data: deleted };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('passwords:search', async (event, query, limit) => {
    try {
      const { PasswordManager } = require('../lib/modules/password-manager');
      const passwordManager = new PasswordManager(db);
      return { success: true, data: passwordManager.searchPasswords(query, limit || 50) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('passwords:getByCategory', async (event, category) => {
    try {
      const { PasswordManager } = require('../lib/modules/password-manager');
      const passwordManager = new PasswordManager(db);
      return { success: true, data: passwordManager.getPasswordsByCategory(category) };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });
}

function setupGlobalShortcuts() {
  // Ctrl+Alt+A - Smart AutoFill
  globalShortcut.register('CommandOrControl+Alt+A', () => {
    console.log('[MindVault] Smart AutoFill triggered');
    mainWindow?.webContents.send('shortcut:autofill');
  });

  // Ctrl+Alt+L - Lock database
  globalShortcut.register('CommandOrControl+Alt+L', () => {
    console.log('[MindVault] Lock triggered');
    mainWindow?.webContents.send('shortcut:lock');
  });

  // Ctrl+Alt+S - Universal search
  globalShortcut.register('CommandOrControl+Alt+S', () => {
    console.log('[MindVault] Search triggered');
    mainWindow?.webContents.send('shortcut:search');
  });
}

app.whenReady().then(async () => {
  await initializeApp();
  createWindow();
  setupIPC();
  setupGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  
  if (apiServer) {
    apiServer.stop();
  }
  
  if (db) {
    db.close();
  }
});
