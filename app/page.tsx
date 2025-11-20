'use client';

import { useEffect, useState } from 'react';
import { Shield, Lock, Home, Search, FileText, Key, FolderLock, Clipboard, Terminal, Settings, Activity } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const initialized = await (window as any).electronAPI.dbIsInitialized();
      setIsInitialized(initialized);
      
      if (initialized) {
        const unlocked = await (window as any).electronAPI.dbIsUnlocked();
        setIsUnlocked(unlocked);
      }
    }
    setLoading(false);
  };

  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    if ((window as any).electronAPI) {
      const result = await (window as any).electronAPI.dbInitialize(password);
      if (result.success) {
        setIsInitialized(true);
        setIsUnlocked(true);
        setPassword('');
        setConfirmPassword('');
      } else {
        alert('Initialization failed: ' + result.error);
      }
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((window as any).electronAPI) {
      const result = await (window as any).electronAPI.dbUnlock(password);
      if (result.success) {
        setIsUnlocked(true);
        setPassword('');
      } else {
        alert('Incorrect password');
      }
    }
  };

  const handleLock = async () => {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.dbLock();
      setIsUnlocked(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Shield className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse terminal-glow" />
          <p className="text-xl terminal-text font-mono animate-glow-pulse">
            <span className="animate-blink">█</span> INITIALIZING_MINDVAULT_OS...
          </p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="bg-black border border-green-500 p-8 shadow-2xl max-w-md w-full terminal-glow">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-green-400 mx-auto mb-4 animate-glow-pulse" />
            <h1 className="text-3xl font-bold mb-2 terminal-text font-mono">
              &gt; MINDVAULT_OS
            </h1>
            <p className="text-green-400 font-mono text-sm">Initialize master encryption key</p>
          </div>
          
          <form onSubmit={handleInitialize} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-green-400 font-mono">MASTER_PASSWORD:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-green-700 text-green-400 font-mono focus:outline-none focus:border-green-400 terminal-glow"
                placeholder="Enter master password"
                minLength={8}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-green-400 font-mono">CONFIRM_PASSWORD:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-green-700 text-green-400 font-mono focus:outline-none focus:border-green-400 terminal-glow"
                placeholder="Confirm master password"
                minLength={8}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-black border border-green-500 hover:bg-green-900/30 terminal-text font-medium transition-colors font-mono terminal-glow"
            >
              &gt;&gt; INITIALIZE_VAULT
            </button>
            
            <p className="text-xs text-green-700 text-center mt-4 font-mono border border-green-900 p-3">
              [!] AES-256-GCM ENCRYPTION ENABLED
              <br />
              <span className="text-yellow-400">[WARNING] PASSWORD_RECOVERY: IMPOSSIBLE</span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-6">
        <div className="bg-black border border-green-500 p-8 shadow-2xl max-w-md w-full terminal-glow">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-green-400 mx-auto mb-4 animate-glow-pulse" />
            <h1 className="text-3xl font-bold mb-2 terminal-text font-mono">
              &gt; MINDVAULT_OS
            </h1>
            <p className="text-green-400 font-mono text-sm">Enter decryption key to unlock vault</p>
          </div>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-green-400 font-mono">MASTER_PASSWORD:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-green-700 text-green-400 font-mono focus:outline-none focus:border-green-400 terminal-glow"
                placeholder="Enter master password"
                required
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-black border border-green-500 hover:bg-green-900/30 terminal-text font-medium transition-colors font-mono terminal-glow"
            >
              &gt;&gt; DECRYPT_AND_UNLOCK
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-green-500 terminal-glow">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-400 animate-glow-pulse" />
            <h1 className="text-2xl font-bold terminal-text font-mono">&gt; MINDVAULT_OS</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-400 flex items-center font-mono">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              [VAULT_UNLOCKED]
            </span>
            <button
              onClick={handleLock}
              className="px-4 py-2 bg-black border border-red-500 hover:bg-red-900/30 text-red-400 text-sm font-medium transition-colors flex items-center font-mono terminal-glow"
            >
              <Lock className="w-4 h-4 mr-2" />
              LOCK_SYSTEM
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 terminal-glow bg-black border border-green-500 p-6">
          <h2 className="text-3xl font-bold mb-2 terminal-text font-mono animate-glow-pulse">
            &gt;&gt; WELCOME_TO_YOUR_ENCRYPTED_VAULT
          </h2>
          <p className="text-green-400 font-mono text-sm">
            <span className="animate-blink">█</span> AES-256-GCM | LOCAL_ONLY | ZERO_CLOUD_SYNC
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-black border border-green-500 p-6 terminal-glow">
            <Activity className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="text-2xl font-bold terminal-text">0</h3>
            <p className="text-sm text-green-400 font-mono">ACTIVITIES_TODAY</p>
          </div>
          
          <div className="bg-black border border-green-500 p-6 terminal-glow">
            <Clipboard className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="text-2xl font-bold terminal-text">0</h3>
            <p className="text-sm text-green-400 font-mono">CLIPBOARD_ITEMS</p>
          </div>
          
          <div className="bg-black border border-green-500 p-6 terminal-glow">
            <Terminal className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="text-2xl font-bold terminal-text">0</h3>
            <p className="text-sm text-green-400 font-mono">TERMINAL_COMMANDS</p>
          </div>
          
          <div className="bg-black border border-green-500 p-6 terminal-glow">
            <Key className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="text-2xl font-bold terminal-text">0</h3>
            <p className="text-sm text-green-400 font-mono">SAVED_PASSWORDS</p>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard" className="bg-black border border-green-500 p-6 hover:border-green-300 transition-colors group terminal-glow">
            <Home className="w-12 h-12 text-green-400 mb-4 group-hover:animate-pulse transition-transform" />
            <h3 className="text-xl font-bold mb-2 terminal-text font-mono">&gt; DASHBOARD</h3>
            <p className="text-green-400 text-sm font-mono">Activity summary and timeline</p>
          </Link>

          <Link href="/search" className="bg-black border border-green-500 p-6 hover:border-green-300 transition-colors group terminal-glow">
            <Search className="w-12 h-12 text-green-400 mb-4 group-hover:animate-pulse transition-transform" />
            <h3 className="text-xl font-bold mb-2 terminal-text font-mono">&gt; UNIVERSAL_SEARCH</h3>
            <p className="text-green-400 text-sm font-mono">Search across all modules</p>
          </Link>

          <Link href="/passwords" className="bg-black border border-green-500 p-6 hover:border-green-300 transition-colors group terminal-glow">
            <Key className="w-12 h-12 text-green-400 mb-4 group-hover:animate-pulse transition-transform" />
            <h3 className="text-xl font-bold mb-2 terminal-text font-mono">&gt; PASSWORD_MANAGER</h3>
            <p className="text-green-400 text-sm font-mono">Secure password storage + AutoFill</p>
          </Link>

          <Link href="/notes" className="bg-black border border-green-500 p-6 hover:border-green-300 transition-colors group terminal-glow">
            <FileText className="w-12 h-12 text-green-400 mb-4 group-hover:animate-pulse transition-transform" />
            <h3 className="text-xl font-bold mb-2 terminal-text font-mono">&gt; NOTES_VAULT</h3>
            <p className="text-green-400 text-sm font-mono">Encrypted note storage</p>
          </Link>

          <Link href="/files" className="bg-black border border-green-500 p-6 hover:border-green-300 transition-colors group terminal-glow">
            <FolderLock className="w-12 h-12 text-green-400 mb-4 group-hover:animate-pulse transition-transform" />
            <h3 className="text-xl font-bold mb-2 terminal-text font-mono">&gt; FILE_VAULT</h3>
            <p className="text-green-400 text-sm font-mono">Secure file storage</p>
          </Link>

          <Link href="/clipboard" className="bg-black border border-green-500 p-6 hover:border-green-300 transition-colors group terminal-glow">
            <Clipboard className="w-12 h-12 text-green-400 mb-4 group-hover:animate-pulse transition-transform" />
            <h3 className="text-xl font-bold mb-2 terminal-text font-mono">&gt; CLIPBOARD_HISTORY</h3>
            <p className="text-green-400 text-sm font-mono">View and search clipboard</p>
          </Link>

          <Link href="/terminal" className="bg-black border border-green-500 p-6 hover:border-green-300 transition-colors group terminal-glow">
            <Terminal className="w-12 h-12 text-green-400 mb-4 group-hover:animate-pulse transition-transform" />
            <h3 className="text-xl font-bold mb-2 terminal-text font-mono">&gt; TERMINAL_LOGS</h3>
            <p className="text-green-400 text-sm font-mono">Command history and outputs</p>
          </Link>

          <Link href="/settings" className="bg-black border border-green-500 p-6 hover:border-green-300 transition-colors group terminal-glow">
            <Settings className="w-12 h-12 text-green-400 mb-4 group-hover:animate-pulse transition-transform" />
            <h3 className="text-xl font-bold mb-2 terminal-text font-mono">&gt; SETTINGS</h3>
            <p className="text-green-400 text-sm font-mono">Configure MindVault OS</p>
          </Link>
        </div>

        {/* Hotkeys Info */}
        <div className="mt-8 bg-black border border-green-500 p-6 terminal-glow">
          <h3 className="text-lg font-bold mb-4 terminal-text font-mono">&gt;&gt; GLOBAL_HOTKEYS</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2 font-mono">
              <kbd className="px-2 py-1 bg-black border border-green-700 text-green-400">Ctrl+Alt+A</kbd>
              <span className="text-green-400">Smart_AutoFill</span>
            </div>
            <div className="flex items-center space-x-2 font-mono">
              <kbd className="px-2 py-1 bg-black border border-green-700 text-green-400">Ctrl+Alt+S</kbd>
              <span className="text-green-400">Universal_Search</span>
            </div>
            <div className="flex items-center space-x-2 font-mono">
              <kbd className="px-2 py-1 bg-black border border-green-700 text-green-400">Ctrl+Alt+L</kbd>
              <span className="text-green-400">Lock_Vault</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-green-700 text-sm font-mono border border-green-900 inline-block px-4 py-2">
            [SYSTEM_MESSAGE] ALL_DATA_ENCRYPTED | NO_TELEMETRY | LOCAL_STORAGE_ONLY
          </p>
        </div>
      </div>
    </div>
  );
}
