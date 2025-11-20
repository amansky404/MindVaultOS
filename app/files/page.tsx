'use client';

import { useState } from 'react';
import { FolderLock, Search, Plus, Download, Trash2, File } from 'lucide-react';
import Link from 'next/link';

export default function FilesPage() {
  const [files] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
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
              <h1 className="text-4xl font-bold mb-2 terminal-text animate-glow-pulse font-mono">File Vault</h1>
              <p className="text-green-400">Secure encrypted file storage</p>
            </div>
            <button className="px-6 py-3 bg-black border border-green-500 hover:bg-green-900/30 terminal-text  font-medium transition-colors flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Upload File
            </button>
          </div>
        </div>

        {/* Search and Storage Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="md:col-span-2 bg-black border border-green-500 terminal-glow p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files..."
                className="w-full pl-12 pr-4 py-2 bg-black border border-green-700  focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="bg-black border border-green-500 terminal-glow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400 font-mono">Storage Used</p>
                <p className="text-2xl font-bold">0 MB</p>
              </div>
              <FolderLock className="w-10 h-10 terminal-text" />
            </div>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-black border border-green-500 terminal-glow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              {files.length} File{files.length !== 1 ? 's' : ''}
            </h2>
            <select className="px-4 py-2 bg-black border border-green-700  text-sm">
              <option>All Types</option>
              <option>Documents</option>
              <option>Images</option>
              <option>Archives</option>
            </select>
          </div>

          {files.length === 0 ? (
            <div className="text-center py-12">
              <FolderLock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-green-400 mb-4">No files stored yet</p>
              <button className="px-6 py-3 bg-black border border-green-500 hover:bg-green-900/30 terminal-text  font-medium transition-colors inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Upload Your First File
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 bg-black border border-green-700  hover:bg-black border border-green-700 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 bg-blue-500/20 rounded flex items-center justify-center">
                      <File className="w-5 h-5 terminal-text" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{file.filename}</h3>
                      <div className="flex items-center space-x-3 text-xs text-green-400 mt-1">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>•</span>
                        <span>{file.mimeType}</span>
                        <span>•</span>
                        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-slate-600 rounded transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-slate-600 rounded transition-colors text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/10 border border-blue-500/30  p-4 mt-6">
          <div className="flex items-start space-x-3">
            <FolderLock className="w-6 h-6 terminal-text flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold terminal-text mb-2">Encrypted File Storage</h3>
              <p className="text-sm terminal-text">
                Files are encrypted using AES-256-GCM before storage. File metadata and contents
                are protected with your master password. Files are stored in an encrypted vault
                directory that only MindVault OS can access.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
