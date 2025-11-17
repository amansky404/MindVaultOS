'use client';

import { useState, useEffect } from 'react';
import { Clipboard, Search, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ClipboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const response = await (window as any).electronAPI.clipboardGetHistory(100, 0);
      if (response.success) {
        setHistory(response.data);
      }
    }
    setLoading(false);
  };

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    // Show toast notification
    alert('Copied to clipboard!');
  };

  const filteredHistory = searchQuery
    ? history.filter(item => 
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-2 block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Clipboard History</h1>
          <p className="text-slate-400">View and restore your clipboard history</p>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clipboard history..."
              className="w-full pl-12 pr-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* History List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {filteredHistory.length} Item{filteredHistory.length !== 1 ? 's' : ''}
            </h2>
            <button className="text-sm text-red-400 hover:text-red-300 flex items-center">
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Clipboard className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-400">Loading clipboard history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clipboard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No clipboard history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                          {item.contentType}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500">
                          from {item.sourceApplication}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-3 font-mono">
                        {item.content}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.content)}
                      className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
