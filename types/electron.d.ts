/**
 * Type definitions for Electron API exposed to renderer process
 */

interface ElectronAPI {
  // Database operations
  dbIsInitialized: () => Promise<boolean>;
  dbInitialize: (password: string) => Promise<{ success: boolean; error?: string }>;
  dbUnlock: (password: string) => Promise<{ success: boolean; error?: string }>;
  dbLock: () => Promise<{ success: boolean; error?: string }>;
  dbIsUnlocked: () => Promise<boolean>;

  // API server
  apiGetPort: () => Promise<number | null>;

  // Module operations
  clipboardGetHistory: (limit?: number, offset?: number) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  terminalGetHistory: (limit?: number, offset?: number) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  browserGetHistory: (limit?: number, offset?: number) => Promise<{ success: boolean; data?: any[]; error?: string }>;

  // Search
  searchUniversal: (query: string, limit?: number) => Promise<{ success: boolean; data?: any; error?: string }>;

  // Password Manager operations
  passwordsGetAll: (limit?: number, offset?: number) => Promise<{ success: boolean; data?: Password[]; error?: string }>;
  passwordsAdd: (data: PasswordInput) => Promise<{ success: boolean; data?: Password; error?: string }>;
  passwordsUpdate: (id: string, data: Partial<PasswordInput>) => Promise<{ success: boolean; data?: Password; error?: string }>;
  passwordsDelete: (id: string) => Promise<{ success: boolean; data?: boolean; error?: string }>;
  passwordsSearch: (query: string, limit?: number) => Promise<{ success: boolean; data?: Password[]; error?: string }>;
  passwordsGetByCategory: (category: string) => Promise<{ success: boolean; data?: Password[]; error?: string }>;

  // Listen to events
  onShortcutAutofill: (callback: () => void) => void;
  onShortcutLock: (callback: () => void) => void;
  onShortcutSearch: (callback: () => void) => void;
}

interface PasswordInput {
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
}

interface Password extends PasswordInput {
  id: string;
  timestamp: number;
  autoFill: boolean;
  autoSubmit: boolean;
  autoType: boolean;
  createdAt: number;
  updatedAt: number;
}

interface Window {
  electronAPI: ElectronAPI;
}
