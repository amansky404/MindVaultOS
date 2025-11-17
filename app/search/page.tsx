'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', count: 0 },
    { id: 'clipboard', name: 'Clipboard', count: 0 },
    { id: 'terminal', name: 'Terminal', count: 0 },
    { id: 'browser', name: 'Browser', count: 0 },
    { id: 'passwords', name: 'Passwords', count: 0 },
    { id: 'notes', name: 'Notes', count: 0 },
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-2 block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Universal Search</h1>
          <p className="text-slate-400">Search across all your encrypted data</p>
        </div>

        {/* Search Bar */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search your vault..."
                className="w-full pl-12 pr-4 py-3 bg-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 mb-6">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="w-5 h-5 text-slate-400 flex-shrink-0" />
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
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
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-bold mb-4">
            {filteredResults.length > 0
              ? `${filteredResults.length} Result${filteredResults.length !== 1 ? 's' : ''}`
              : query ? 'No results found' : 'Enter a search query'}
          </h2>

          <div className="space-y-3">
            {filteredResults.map((result, index) => (
              <div
                key={index}
                className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.type === 'clipboard' ? 'bg-cyan-500/20 text-cyan-400' :
                    result.type === 'terminal' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {result.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(result.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-300 line-clamp-2">
                  {result.content || result.command || result.url || result.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
