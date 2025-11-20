'use client';

import { useState, useEffect } from 'react';
import { Key, Search, Plus, Eye, EyeOff, Copy, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Password {
  id: string;
  name: string;
  username: string;
  password: string;
  notes?: string;
  url?: string;
  category?: string;
  tags?: string[];
  autoFill: boolean;
  autoSubmit: boolean;
  autoType: boolean;
  createdAt: number;
  updatedAt: number;
}

export default function PasswordsPage() {
  const [passwords, setPasswords] = useState<Password[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    url: '',
    category: '',
    notes: '',
    autoFill: true,
    autoSubmit: false,
    autoType: false,
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load passwords on mount
  useEffect(() => {
    loadPasswords();
  }, []);

  // Load all passwords
  const loadPasswords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const result = await (window as any).electronAPI.passwordsGetAll(100, 0);
        if (result.success) {
          setPasswords(result.data);
        } else {
          setError(result.error || 'Failed to load passwords');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load passwords');
      console.error('Error loading passwords:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter passwords based on search and category
  const filteredPasswords = passwords.filter(password => {
    const matchesSearch = searchQuery === '' || 
      password.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      password.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (password.url && password.url.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || 
      password.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username || !formData.password) {
      setError('Name, username, and password are required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const result = await (window as any).electronAPI.passwordsAdd({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          url: formData.url || undefined,
          category: formData.category || undefined,
          notes: formData.notes || undefined,
          autoFill: formData.autoFill,
          autoSubmit: formData.autoSubmit,
          autoType: formData.autoType,
        });

        if (result.success) {
          // Add the new password to the list
          setPasswords(prev => [result.data, ...prev]);
          
          // Reset form
          setFormData({
            name: '',
            username: '',
            password: '',
            url: '',
            category: '',
            notes: '',
            autoFill: true,
            autoSubmit: false,
            autoType: false,
          });
          
          // Close modal
          setShowAddModal(false);
          
          // Show success message
          alert('Password saved successfully!');
        } else {
          setError(result.error || 'Failed to save password');
        }
      } else {
        setError('Electron API not available');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save password');
      console.error('Error saving password:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password deletion
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this password?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        const result = await (window as any).electronAPI.passwordsDelete(id);
        
        if (result.success) {
          // Remove from list
          setPasswords(prev => prev.filter(p => p.id !== id));
          alert('Password deleted successfully!');
        } else {
          setError(result.error || 'Failed to delete password');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete password');
      console.error('Error deleting password:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="terminal-text hover:text-green-300 text-sm mb-2 block">
            ← Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 terminal-text animate-glow-pulse font-mono">Password Manager</h1>
              <p className="text-green-400">Securely store and manage your passwords</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-black border border-green-500 hover:bg-green-900/30 terminal-text  font-medium transition-colors flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Password
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-black border border-green-500 terminal-glow p-4 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search passwords..."
                className="w-full pl-12 pr-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <select 
              className="px-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Finance">Finance</option>
              <option value="Social">Social</option>
            </select>
          </div>
        </div>

        {/* Password List */}
        <div className="bg-black border border-green-500 terminal-glow p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-400 rounded">
              {error}
            </div>
          )}

          <h2 className="text-xl font-bold mb-6">
            {filteredPasswords.length} Password{filteredPasswords.length !== 1 ? 's' : ''}
          </h2>

          {isLoading && passwords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-green-400">Loading passwords...</p>
            </div>
          ) : filteredPasswords.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-green-400 mb-4">
                {searchQuery || selectedCategory !== 'all' ? 'No passwords match your filters' : 'No passwords saved yet'}
              </p>
              {!searchQuery && selectedCategory === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-6 py-3 bg-black border border-green-500 hover:bg-green-900/30 terminal-text  font-medium transition-colors inline-flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Password
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPasswords.map((password) => (
                <div
                  key={password.id}
                  className="p-4 bg-black border border-green-700  hover:bg-black border border-green-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-bold text-lg">{password.name}</h3>
                        {password.category && (
                          <span className="px-2 py-1 bg-blue-500/20 terminal-text rounded text-xs">
                            {password.category}
                          </span>
                        )}
                      </div>
                      {password.url && (
                        <a
                          href={password.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm terminal-text hover:text-green-300"
                        >
                          {password.url}
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(password.id)}
                        className="p-2 hover:bg-slate-600 rounded transition-colors text-red-400"
                        disabled={isLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-green-400 mb-1 block">Username</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-black border border-green-500 terminal-glow px-3 py-1 rounded flex-1">
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
                      <label className="text-xs text-green-400 mb-1 block">Password</label>
                      <div className="flex items-center space-x-2">
                        <code className="text-sm bg-black border border-green-500 terminal-glow px-3 py-1 rounded flex-1 font-mono">
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
                      <p className="text-sm text-green-400 font-mono">{password.notes}</p>
                    </div>
                  )}

                  <div className="mt-3 flex items-center space-x-4 text-xs text-slate-500">
                    {password.autoFill && <span className="text-green-400">✓ AutoFill</span>}
                    {password.autoSubmit && <span className="terminal-text">✓ AutoSubmit</span>}
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
            <div className="bg-black border border-green-500 terminal-glow  p-6 max-w-md w-full border border-green-500 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Add Password</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-400 rounded text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., GitHub"
                    className="w-full px-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Username/Email *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="username@example.com"
                    className="w-full px-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL (optional)</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category (optional)</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Finance">Finance</option>
                    <option value="Social">Social</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Notes (optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full px-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoFill"
                      checked={formData.autoFill}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enable AutoFill</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoSubmit"
                      checked={formData.autoSubmit}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enable Auto-Submit</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoType"
                      checked={formData.autoType}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Enable Auto-Type</span>
                  </label>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                      setFormData({
                        name: '',
                        username: '',
                        password: '',
                        url: '',
                        category: '',
                        notes: '',
                        autoFill: true,
                        autoSubmit: false,
                        autoType: false,
                      });
                    }}
                    className="flex-1 px-4 py-2 bg-black border border-green-700 hover:bg-slate-600  transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-black border border-green-500 hover:bg-green-900/30 terminal-text  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
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
