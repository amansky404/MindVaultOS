'use client';

import { useState, useEffect } from 'react';
import { Clipboard, Search, Trash2, Copy } from 'lucide-react';
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
    alert('[SYSTEM] Content copied to clipboard buffer');
  };

  const filteredHistory = searchQuery
    ? history.filter(item => 
        item.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 terminal-glow p-6 bg-black border border-green-500">
          <Link href="/" className="terminal-text hover:text-green-300 text-sm mb-3 block flex items-center font-mono">
            <span className="mr-2">←</span> <span className="animate-glow-pulse">[RETURN_TO_MAIN_TERMINAL]</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2 terminal-text animate-glow-pulse font-mono">
            <Clipboard className="inline-block w-10 h-10 mr-3" />
            &gt; CLIPBOARD_HISTORY.EXE
          </h1>
          <p className="text-green-400 font-mono text-sm">
            <span className="animate-blink">█</span> Displaying clipboard buffer history...
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-black border border-green-500 p-4 mb-6 terminal-glow">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="[SEARCH_QUERY] Enter keywords to filter clipboard history..."
              className="w-full pl-12 pr-4 py-3 bg-black border border-green-700 text-green-400 font-mono placeholder-green-700 focus:outline-none focus:border-green-400 terminal-glow"
            />
          </div>
        </div>

        {/* History List */}
        <div className="bg-black border border-green-500 p-6 terminal-glow">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-green-700">
            <h2 className="text-xl font-bold terminal-text font-mono">
              &gt;&gt; BUFFER_LOG: {filteredHistory.length} ENTR{filteredHistory.length !== 1 ? 'IES' : 'Y'}_FOUND
            </h2>
            <button className="text-sm text-red-400 hover:text-red-300 flex items-center font-mono border border-red-500 px-3 py-1 hover:bg-red-900/30 transition-colors">
              <Trash2 className="w-4 h-4 mr-1" />
              CLEAR_ALL
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Clipboard className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
              <p className="text-green-400 font-mono animate-glow-pulse">
                <span className="animate-blink">█</span> LOADING_CLIPBOARD_HISTORY...
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Clipboard className="w-16 h-16 text-green-700 mx-auto mb-4" />
              <p className="text-green-400 font-mono">[!] NO_CLIPBOARD_HISTORY_FOUND</p>
              <p className="text-green-700 font-mono text-sm mt-2">
                Copy content to populate this database
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-black border border-green-700 hover:border-green-400 transition-colors group terminal-glow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-3 flex-wrap">
                        <span className="text-xs px-2 py-1 bg-green-400/10 text-green-400 border border-green-400 font-mono">
                          {item.contentType}
                        </span>
                        <span className="text-xs text-green-400 font-mono">
                          [{new Date(item.timestamp).toLocaleString()}]
                        </span>
                        <span className="text-xs text-green-700 font-mono border border-green-700 px-2 py-1">
                          SRC: {item.sourceApplication}
                        </span>
                      </div>
                      <p className="text-sm terminal-text line-clamp-3 font-mono">
                        {item.content}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(item.content)}
                      className="ml-4 px-3 py-1 bg-black border border-green-500 hover:bg-green-900/30 terminal-text text-sm opacity-0 group-hover:opacity-100 transition-opacity font-mono flex items-center"
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      COPY
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-green-700 text-sm font-mono">
            [SYSTEM_MESSAGE] All clipboard data encrypted with AES-256-GCM
          </p>
        </div>
      </div>
    </div>
  );
}
