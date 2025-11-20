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

  // Password Manager operations
  passwordsGetAll: (limit, offset) => ipcRenderer.invoke('passwords:getAll', limit, offset),
  passwordsAdd: (data) => ipcRenderer.invoke('passwords:add', data),
  passwordsUpdate: (id, data) => ipcRenderer.invoke('passwords:update', id, data),
  passwordsDelete: (id) => ipcRenderer.invoke('passwords:delete', id),
  passwordsSearch: (query, limit) => ipcRenderer.invoke('passwords:search', query, limit),
  passwordsGetByCategory: (category) => ipcRenderer.invoke('passwords:getByCategory', category),

  // Listen to events
  onShortcutAutofill: (callback) => ipcRenderer.on('shortcut:autofill', callback),
  onShortcutLock: (callback) => ipcRenderer.on('shortcut:lock', callback),
  onShortcutSearch: (callback) => ipcRenderer.on('shortcut:search', callback),
});
