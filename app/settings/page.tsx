'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, Lock, Shield, Download, Upload } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    keystrokeMemory: true,
    clipboardHistory: true,
    terminalRecording: true,
    browserTracking: true,
    autoFillEnabled: true,
    humanTyping: true,
    autoBackup: false,
  });

  const toggleSetting = (key: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="terminal-text hover:text-green-300 text-sm mb-2 block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2 terminal-text animate-glow-pulse font-mono">Settings</h1>
          <p className="text-green-400">Configure MindVault OS</p>
        </div>

        {/* Security Section */}
        <div className="bg-black border border-green-500 terminal-glow p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 terminal-text" />
            <h2 className="text-xl font-bold terminal-text font-mono">Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black border border-green-700 ">
              <div>
                <h3 className="font-medium mb-1">Change Master Password</h3>
                <p className="text-sm text-green-400 font-mono">Update your master encryption password</p>
              </div>
              <button className="px-4 py-2 bg-black border border-green-500 hover:bg-green-900/30 terminal-text  text-sm font-medium transition-colors">
                Change
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black border border-green-700 ">
              <div>
                <h3 className="font-medium mb-1">Auto-Lock Timeout</h3>
                <p className="text-sm text-green-400 font-mono">Lock vault after inactivity</p>
              </div>
              <select className="px-4 py-2 bg-slate-600  text-sm">
                <option>5 minutes</option>
                <option>15 minutes</option>
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>Never</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modules Section */}
        <div className="bg-black border border-green-500 terminal-glow p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold terminal-text font-mono">Data Collection Modules</h2>
          </div>

          <div className="space-y-3">
            {[
              { key: 'keystrokeMemory', label: 'Keystroke Memory', desc: 'Record keystrokes (excludes password fields)' },
              { key: 'clipboardHistory', label: 'Clipboard History', desc: 'Track clipboard changes' },
              { key: 'terminalRecording', label: 'Terminal Recording', desc: 'Record terminal commands and outputs' },
              { key: 'browserTracking', label: 'Browser Tracking', desc: 'Log browser URL visits' },
            ].map((module) => (
              <div key={module.key} className="flex items-center justify-between p-4 bg-black border border-green-700 ">
                <div>
                  <h3 className="font-medium mb-1">{module.label}</h3>
                  <p className="text-sm text-green-400 font-mono">{module.desc}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings[module.key as keyof typeof settings] as boolean}
                    onChange={() => toggleSetting(module.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* AutoFill Section */}
        <div className="bg-black border border-green-500 terminal-glow p-6 mb-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lock className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-bold terminal-text font-mono">AutoFill Settings</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-black border border-green-700 ">
              <div>
                <h3 className="font-medium mb-1">Enable AutoFill</h3>
                <p className="text-sm text-green-400 font-mono">Allow automatic credential filling</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoFillEnabled}
                  onChange={() => toggleSetting('autoFillEnabled')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-black border border-green-700 ">
              <div>
                <h3 className="font-medium mb-1">Human-like Typing</h3>
                <p className="text-sm text-green-400 font-mono">Simulate human typing patterns</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.humanTyping}
                  onChange={() => toggleSetting('humanTyping')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Backup Section */}
        <div className="bg-black border border-green-500 terminal-glow p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Download className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold terminal-text font-mono">Backup & Export</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-black border border-green-700 ">
              <div>
                <h3 className="font-medium mb-1">Export Encrypted Backup</h3>
                <p className="text-sm text-green-400 font-mono">Download encrypted database backup</p>
              </div>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700  text-sm font-medium transition-colors flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black border border-green-700 ">
              <div>
                <h3 className="font-medium mb-1">Import Backup</h3>
                <p className="text-sm text-green-400 font-mono">Restore from encrypted backup</p>
              </div>
              <button className="px-4 py-2 bg-black border border-green-500 hover:bg-green-900/30 terminal-text  text-sm font-medium transition-colors flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-black border border-green-700 ">
              <div>
                <h3 className="font-medium mb-1">Automatic Backups</h3>
                <p className="text-sm text-green-400 font-mono">Create daily encrypted backups</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={() => toggleSetting('autoBackup')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-black border border-green-500 terminal-glow p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">About MindVault OS</h2>
          <div className="space-y-2 text-sm text-green-400 font-mono">
            <p>Version: 1.0.0</p>
            <p>Local API Port: 37405</p>
            <p>Encryption: AES-256-GCM with Argon2ID key derivation</p>
            <p>Database: SQLite (encrypted)</p>
            <p className="mt-4 pt-4 border-t border-green-500">
              <span className="text-green-400">✓</span> All data stored locally
              <br />
              <span className="text-green-400">✓</span> No remote logging
              <br />
              <span className="text-green-400">✓</span> End-to-end encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
