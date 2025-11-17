'use client';

import { useState } from 'react';
import { Key, Search, Plus, Eye, EyeOff, Copy, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function PasswordsPage() {
  const [passwords] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-2 block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Password Manager</h1>
              <p className="text-slate-400">Securely store and manage your passwords</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Password
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search passwords..."
                className="w-full pl-12 pr-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <select className="px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option>All Categories</option>
              <option>Work</option>
              <option>Personal</option>
              <option>Finance</option>
              <option>Social</option>
            </select>
          </div>
        </div>

        {/* Password List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-6">
            {passwords.length} Password{passwords.length !== 1 ? 's' : ''}
          </h2>

          {passwords.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No passwords saved yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Your First Password
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {passwords.map((password) => (
                <div
                  key={password.id}
                  className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-lg">{password.name}</h3>
                        {password.category && (
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                            {password.category}
                          </span>
                        )}
                      </div>
                      {password.url && (
                        <a
                          href={password.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          {password.url}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-600 rounded transition-colors text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Username</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-slate-800 px-3 py-1 rounded flex-1">
                          {password.username}
                        </code>
                        <button
                          onClick={() => copyToClipboard(password.username)}
                          className="p-2 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">Password</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-slate-800 px-3 py-1 rounded flex-1 font-mono">
                          {showPassword[password.id] ? password.password : '••••••••'}
                        </code>
                        <button
                          onClick={() => togglePasswordVisibility(password.id)}
                          className="p-2 hover:bg-slate-600 rounded transition-colors"
                        >
                          {showPassword[password.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(password.password)}
                          className="p-2 hover:bg-slate-600 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {password.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <p className="text-sm text-slate-400">{password.notes}</p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                    {password.autoFill && <span className="text-green-400">✓ AutoFill</span>}
                    {password.autoSubmit && <span className="text-blue-400">✓ AutoSubmit</span>}
                    {password.autoType && <span className="text-purple-400">✓ AutoType</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Password Modal (simplified) */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-700">
              <h2 className="text-2xl font-bold mb-4">Add Password</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="e.g., GitHub"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Username/Email</label>
                  <input
                    type="text"
                    placeholder="username@example.com"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
