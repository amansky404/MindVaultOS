'use client';

import { useState } from 'react';
import { Search, Filter, Database } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'ALL', count: 0 },
    { id: 'clipboard', name: 'CLIPBOARD', count: 0 },
    { id: 'terminal', name: 'TERMINAL', count: 0 },
    { id: 'browser', name: 'BROWSER', count: 0 },
    { id: 'passwords', name: 'PASSWORDS', count: 0 },
    { id: 'notes', name: 'NOTES', count: 0 },
  ];

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    
    // Simulate search via Electron IPC
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const response = await (window as any).electronAPI.searchUniversal(query, 50);
      if (response.success) {
        const allResults = [
          ...response.data.clipboard.map((item: any) => ({ ...item, type: 'clipboard' })),
          ...response.data.terminal.map((item: any) => ({ ...item, type: 'terminal' })),
          ...response.data.browser.map((item: any) => ({ ...item, type: 'browser' })),
        ];
        setResults(allResults);
      }
    }
    
    setLoading(false);
  };

  const filteredResults = selectedCategory === 'all' 
    ? results 
    : results.filter(r => r.type === selectedCategory);

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 terminal-glow p-6 bg-black border border-green-500">
          <Link href="/" className="terminal-text hover:text-green-300 text-sm mb-3 block flex items-center font-mono">
            <span className="mr-2">←</span> <span className="animate-glow-pulse">[RETURN_TO_MAIN_TERMINAL]</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2 terminal-text animate-glow-pulse font-mono">
            <Search className="inline-block w-10 h-10 mr-3" />
            &gt; UNIVERSAL_SEARCH.EXE
          </h1>
          <p className="text-green-400 font-mono text-sm">
            <span className="animate-blink">█</span> Query encrypted database across all modules...
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-black border border-green-500 p-6 mb-6 terminal-glow">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="[SEARCH_QUERY] Enter keywords to scan vault..."
                className="w-full pl-12 pr-4 py-3 bg-black border border-green-700 text-green-400 font-mono text-lg placeholder-green-700 focus:outline-none focus:border-green-400 terminal-glow"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-8 py-3 bg-black border border-green-500 hover:bg-green-900/30 disabled:border-green-900 disabled:text-green-900 terminal-text font-medium transition-colors font-mono"
            >
              {loading ? 'SCANNING...' : 'EXECUTE_SEARCH'}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-black border border-green-500 p-4 mb-6 terminal-glow">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="w-5 h-5 text-green-400 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap font-mono border ${
                  selectedCategory === category.id
                    ? 'bg-green-900/30 terminal-text border-green-400'
                    : 'bg-black text-green-400 border-green-700 hover:border-green-400'
                }`}
              >
                {category.name}
                {category.count > 0 && (
                  <span className="ml-2 text-xs opacity-75">({category.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="bg-black border border-green-500 p-6 terminal-glow">
          <h2 className="text-xl font-bold mb-4 terminal-text font-mono">
            {filteredResults.length > 0
              ? `&gt;&gt; ${filteredResults.length} RESULT${filteredResults.length !== 1 ? 'S' : ''}_FOUND`
              : query ? '&gt;&gt; NO_RESULTS_FOUND' : '&gt;&gt; AWAITING_SEARCH_QUERY'}
          </h2>

          {loading && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
              <p className="text-green-400 font-mono animate-glow-pulse">
                <span className="animate-blink">█</span> SCANNING_DATABASE...
              </p>
            </div>
          )}

          <div className="space-y-3">
            {filteredResults.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-black border border-green-700 hover:border-green-400 transition-colors terminal-glow"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 text-xs font-medium font-mono border ${
                    result.type === 'clipboard' ? 'border-green-400 text-green-400 bg-green-400/10' :
                    result.type === 'terminal' ? 'border-green-400 text-green-400 bg-green-400/10' :
                    'border-green-400 text-green-400 bg-green-400/10'
                  }`}>
                    [{result.type.toUpperCase()}]
                  </span>
                  <span className="text-xs text-green-400 font-mono">
                    [{new Date(result.timestamp).toLocaleString()}]
                  </span>
                </div>
                <p className="text-sm terminal-text line-clamp-2 font-mono">
                  {result.content || result.command || result.url || result.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-green-700 text-sm font-mono">
            [SYSTEM_MESSAGE] Search powered by encrypted local database
          </p>
        </div>
      </div>
    </div>
  );
}
