import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Loader2, FileText, Folder } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SearchResult } from '../types';
import { FileViewer } from './FileViewer';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'files' | 'folders'>('all');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const { searchContent, setCurrentFolder } = useStore();

  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const searchResults = await searchContent(searchQuery, selectedCategory);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      }
      setIsSearching(false);
    },
    [selectedCategory]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => performSearch(query), 150);
    return () => clearTimeout(timeoutId);
  }, [query, selectedCategory]);

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => 
      part.toLowerCase() === searchTerm.toLowerCase() ? 
        <mark key={i} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-900 dark:text-indigo-100 px-0.5 rounded">{part}</mark> : 
        part
    );
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'folder') {
      setCurrentFolder(result.id);
    } else {
      setSelectedFile(result.id);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files and folders..."
            className="w-full px-4 py-3.5 pl-12 pr-10 rounded-xl border-2 border-surface-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 bg-white/80 backdrop-blur-sm dark:bg-surface-800/80 dark:border-surface-700 dark:text-white transition-all duration-200"
            autoComplete="off"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-500" />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {(['all', 'files', 'folders'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedCategory === category
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 scale-105'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {isSearching ? (
        <div className="flex items-center justify-center py-12">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-5 h-5 text-brand-600" />
            </div>
          </div>
        </div>
      ) : query.trim().length > 0 ? (
        results.length > 0 ? (
          <div className="space-y-3 animate-fade-in">
            {results.map((result) => (
              <button
                key={result.id}
                onClick={() => handleResultClick(result)}
                className="w-full text-left bg-white dark:bg-surface-800 p-6 rounded-xl hover:shadow-xl transition-all duration-300 border border-surface-200 dark:border-surface-700 group hover:scale-[1.02] hover:border-brand-200 dark:hover:border-brand-500"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${
                    result.type === 'folder' 
                      ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400'
                      : 'bg-accent-emerald/10 text-accent-emerald dark:bg-accent-emerald/20'
                  } transition-colors group-hover:bg-opacity-80`}>
                    {result.type === 'folder' ? (
                      <Folder className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
                      {highlightText(result.title, query)}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      {result.path}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-block p-4 rounded-full bg-surface-100 dark:bg-surface-800 mb-4">
              <Search className="w-8 h-8 text-surface-400" />
            </div>
            <p className="text-lg font-medium text-surface-600 dark:text-surface-300">
              No results found for "{query}"
            </p>
            <p className="text-surface-500 dark:text-surface-400 mt-1">
              Try adjusting your search terms or filters
            </p>
          </div>
        )
      ) : null}

      {selectedFile && (
        <FileViewer
          fileId={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
};