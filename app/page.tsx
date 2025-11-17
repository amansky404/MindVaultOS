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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <p className="text-xl text-slate-300">Loading MindVault OS...</p>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Welcome to MindVault OS</h1>
            <p className="text-slate-400">Set your master password to begin</p>
          </div>
          
          <form onSubmit={handleInitialize} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Master Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter master password"
                minLength={8}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Confirm master password"
                minLength={8}
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Initialize MindVault
            </button>
            
            <p className="text-xs text-slate-400 text-center mt-4">
              This password will encrypt all your data using AES-256-GCM.
              <br />
              <span className="text-yellow-400">Make sure to remember it - it cannot be recovered!</span>
            </p>
          </form>
        </div>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-md w-full border border-slate-700">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">MindVault OS</h1>
            <p className="text-slate-400">Enter your master password to unlock</p>
          </div>
          
          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Master Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter master password"
                required
                autoFocus
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold">MindVault OS</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-green-400 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Unlocked & Encrypted
            </span>
            <button
              onClick={handleLock}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to Your Personal Vault</h2>
          <p className="text-slate-400">All data is encrypted locally with AES-256-GCM. Nothing leaves your device.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <Activity className="w-8 h-8 text-blue-400 mb-2" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-slate-400">Activities Today</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <Clipboard className="w-8 h-8 text-green-400 mb-2" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-slate-400">Clipboard Items</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <Terminal className="w-8 h-8 text-purple-400 mb-2" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-slate-400">Terminal Commands</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <Key className="w-8 h-8 text-yellow-400 mb-2" />
            <h3 className="text-2xl font-bold">0</h3>
            <p className="text-sm text-slate-400">Saved Passwords</p>
          </div>
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/dashboard" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
            <Home className="w-12 h-12 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Dashboard</h3>
            <p className="text-slate-400">View your activity summary and timeline</p>
          </Link>

          <Link href="/search" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
            <Search className="w-12 h-12 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Universal Search</h3>
            <p className="text-slate-400">Search across all modules instantly</p>
          </Link>

          <Link href="/passwords" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
            <Key className="w-12 h-12 text-yellow-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Password Manager</h3>
            <p className="text-slate-400">Secure password storage with AutoFill</p>
          </Link>

          <Link href="/notes" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
            <FileText className="w-12 h-12 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Notes Vault</h3>
            <p className="text-slate-400">Encrypted note storage</p>
          </Link>

          <Link href="/files" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
            <FolderLock className="w-12 h-12 text-red-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">File Vault</h3>
            <p className="text-slate-400">Secure file storage</p>
          </Link>

          <Link href="/clipboard" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
            <Clipboard className="w-12 h-12 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Clipboard History</h3>
            <p className="text-slate-400">View and search clipboard history</p>
          </Link>

          <Link href="/terminal" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
            <Terminal className="w-12 h-12 text-orange-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Terminal Logs</h3>
            <p className="text-slate-400">Command history and outputs</p>
          </Link>

          <Link href="/settings" className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-colors group">
            <Settings className="w-12 h-12 text-slate-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <p className="text-slate-400">Configure MindVault OS</p>
          </Link>
        </div>

        {/* Hotkeys Info */}
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h3 className="text-lg font-bold mb-4">Global Hotkeys</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-slate-700 rounded">Ctrl+Alt+A</kbd>
              <span className="text-slate-400">Smart AutoFill</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-slate-700 rounded">Ctrl+Alt+S</kbd>
              <span className="text-slate-400">Universal Search</span>
            </div>
            <div className="flex items-center space-x-2">
              <kbd className="px-2 py-1 bg-slate-700 rounded">Ctrl+Alt+L</kbd>
              <span className="text-slate-400">Lock Vault</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
