const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  dbIsInitialized: () => ipcRenderer.invoke('db:isInitialized'),
  dbInitialize: (password) => ipcRenderer.invoke('db:initialize', password),
  dbUnlock: (password) => ipcRenderer.invoke('db:unlock', password),
  dbLock: () => ipcRenderer.invoke('db:lock'),
  dbIsUnlocked: () => ipcRenderer.invoke('db:isUnlocked'),

  // API server
  apiGetPort: () => ipcRenderer.invoke('api:getPort'),

  // Module operations
  clipboardGetHistory: (limit, offset) => ipcRenderer.invoke('clipboard:getHistory', limit, offset),
  terminalGetHistory: (limit, offset) => ipcRenderer.invoke('terminal:getHistory', limit, offset),
  browserGetHistory: (limit, offset) => ipcRenderer.invoke('browser:getHistory', limit, offset),

  // Search
  searchUniversal: (query, limit) => ipcRenderer.invoke('search:universal', query, limit),

  // Listen to events
  onShortcutAutofill: (callback) => ipcRenderer.on('shortcut:autofill', callback),
  onShortcutLock: (callback) => ipcRenderer.on('shortcut:lock', callback),
  onShortcutSearch: (callback) => ipcRenderer.on('shortcut:search', callback),
});
