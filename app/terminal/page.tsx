'use client';

import { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function TerminalPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const response = await (window as any).electronAPI.terminalGetHistory(100, 0);
      if (response.success) {
        setHistory(response.data);
      }
    }
    setLoading(false);
  };

  const filteredHistory = searchQuery
    ? history.filter(item => 
        item.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.output && item.output.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : history;

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-2 block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Terminal History</h1>
          <p className="text-slate-400">View your command history and outputs</p>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands and outputs..."
              className="w-full pl-12 pr-4 py-2 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* History List */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-6">
            {filteredHistory.length} Command{filteredHistory.length !== 1 ? 's' : ''}
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <TerminalIcon className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-400">Loading terminal history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <TerminalIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No terminal history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <ChevronRight
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            expandedId === item.id ? 'rotate-90' : ''
                          }`}
                        />
                        <span className={`text-xs px-2 py-1 rounded ${
                          item.exitCode === 0
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          Exit {item.exitCode ?? '?'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.shell}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-green-400 select-none">$</span>
                      <code className="text-sm text-slate-300 font-mono">
                        {item.command}
                      </code>
                    </div>
                    {item.workingDirectory && (
                      <p className="text-xs text-slate-500 mt-1 ml-4">
                        in {item.workingDirectory}
                      </p>
                    )}
                  </div>

                  {/* Expanded Output */}
                  {expandedId === item.id && item.output && (
                    <div className="px-4 pb-4">
                      <div className="border-t border-slate-600 pt-3">
                        <p className="text-xs text-slate-400 mb-2">Output:</p>
                        <pre className="text-sm text-slate-300 font-mono bg-slate-900 p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                          {item.output}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
