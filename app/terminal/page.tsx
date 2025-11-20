'use client';

import { useState, useEffect } from 'react';
import { Terminal as TerminalIcon, Search, ChevronRight, Activity } from 'lucide-react';
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
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Matrix effect */}
        <div className="mb-8 terminal-glow p-6 bg-black border border-green-500 rounded">
          <Link href="/" className="terminal-text hover:text-green-300 text-sm mb-3 block flex items-center">
            <span className="mr-2">←</span> <span className="animate-glow-pulse">[RETURN_TO_MAIN_TERMINAL]</span>
          </Link>
          <h1 className="text-4xl font-bold mb-2 terminal-text animate-glow-pulse">
            <TerminalIcon className="inline-block w-10 h-10 mr-3" />
            &gt; TERMINAL_HISTORY.EXE
          </h1>
          <p className="text-green-400 font-mono text-sm">
            <span className="animate-blink">█</span> Displaying command execution logs and output streams...
          </p>
        </div>

        {/* Stats Bar */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black border border-green-500 p-4 terminal-glow">
            <div className="flex items-center justify-between">
              <span className="text-green-400 text-sm font-mono">TOTAL_COMMANDS</span>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold terminal-text mt-2">{history.length}</div>
          </div>
          <div className="bg-black border border-green-500 p-4 terminal-glow">
            <div className="flex items-center justify-between">
              <span className="text-green-400 text-sm font-mono">SEARCH_RESULTS</span>
              <Search className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold terminal-text mt-2">{filteredHistory.length}</div>
          </div>
          <div className="bg-black border border-green-500 p-4 terminal-glow">
            <div className="flex items-center justify-between">
              <span className="text-green-400 text-sm font-mono">STATUS</span>
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-xl font-bold terminal-text mt-2">ACTIVE</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-black border border-green-500 p-4 mb-6 terminal-glow">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="[SEARCH_QUERY] Enter keywords to filter command history..."
              className="w-full pl-12 pr-4 py-3 bg-black border border-green-700 text-green-400 font-mono placeholder-green-700 focus:outline-none focus:border-green-400 terminal-glow"
            />
          </div>
        </div>

        {/* History List */}
        <div className="bg-black border border-green-500 p-6 terminal-glow">
          <div className="mb-6 pb-4 border-b border-green-700">
            <h2 className="text-xl font-bold terminal-text font-mono">
              &gt;&gt; COMMAND_LOG: {filteredHistory.length} ENTR{filteredHistory.length !== 1 ? 'IES' : 'Y'}_FOUND
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <TerminalIcon className="w-16 h-16 text-green-400 mx-auto mb-4 animate-pulse" />
              <p className="text-green-400 font-mono animate-glow-pulse">
                <span className="animate-blink">█</span> LOADING_TERMINAL_HISTORY...
              </p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <TerminalIcon className="w-16 h-16 text-green-700 mx-auto mb-4" />
              <p className="text-green-400 font-mono">
                [!] NO_TERMINAL_HISTORY_FOUND
              </p>
              <p className="text-green-700 font-mono text-sm mt-2">
                Execute commands to populate this database
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-black border border-green-700 hover:border-green-400 transition-colors terminal-glow"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpand(item.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-wrap">
                        <ChevronRight
                          className={`w-4 h-4 text-green-400 transition-transform ${
                            expandedId === item.id ? 'rotate-90' : ''
                          }`}
                        />
                        <span className={`text-xs px-2 py-1 font-mono border ${
                          item.exitCode === 0
                            ? 'border-green-400 text-green-400 bg-green-400/10'
                            : 'border-red-500 text-red-500 bg-red-500/10'
                        }`}>
                          EXIT_CODE: {item.exitCode ?? '?'}
                        </span>
                        <span className="text-xs text-green-400 font-mono">
                          [{new Date(item.timestamp).toLocaleString()}]
                        </span>
                        <span className="text-xs text-green-700 font-mono border border-green-700 px-2 py-1">
                          {item.shell}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-green-400 select-none font-bold">root@mindvault:~$</span>
                      <code className="text-sm terminal-text font-mono">
                        {item.command}
                      </code>
                    </div>
                    {item.workingDirectory && (
                      <p className="text-xs text-green-700 mt-2 ml-4 font-mono">
                        PWD: {item.workingDirectory}
                      </p>
                    )}
                  </div>

                  {/* Expanded Output */}
                  {expandedId === item.id && item.output && (
                    <div className="px-4 pb-4">
                      <div className="border-t border-green-700 pt-3">
                        <p className="text-xs text-green-400 mb-2 font-mono">
                          &gt;&gt; COMMAND_OUTPUT:
                        </p>
                        <pre className="text-sm terminal-text font-mono bg-black border border-green-800 p-4 overflow-x-auto max-h-96 overflow-y-auto">
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

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-green-700 text-sm font-mono">
            [SYSTEM_MESSAGE] All data encrypted with AES-256-GCM | Local storage only
          </p>
        </div>
      </div>
    </div>
  );
}
