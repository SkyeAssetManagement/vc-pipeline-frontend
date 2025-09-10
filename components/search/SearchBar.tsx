'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X, Sparkles } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string, filters?: any) => void;
  placeholder?: string;
  enableFilters?: boolean;
}

const EXAMPLE_QUERIES = [
  "Show me all Series A rounds above $2M in 2024",
  "Companies with recurring revenue models", 
  "Recent investor updates from fintech startups",
  "Term sheets with liquidation preferences",
  "SaaS companies with over 50 employees",
  "Board meeting minutes from Q4 2024"
];

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Ask anything about your portfolio... e.g., 'Show me Series A companies with ARR > $1M'",
  enableFilters = true
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    dateRange: { start: null, end: null },
    investmentRange: { min: 0, max: 100000000 },
    documentTypes: [],
    stages: []
  });

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery && debouncedQuery.length > 2) {
      fetchSuggestions(debouncedQuery);
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = useCallback(async (q: string) => {
    // Filter example queries based on input
    const matchingSuggestions = EXAMPLE_QUERIES.filter(suggestion =>
      suggestion.toLowerCase().includes(q.toLowerCase())
    );
    setSuggestions(matchingSuggestions.slice(0, 4));
  }, []);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setSuggestions([]);
    
    try {
      await onSearch(query, filtersVisible ? searchFilters : undefined);
    } finally {
      setIsSearching(false);
    }
  }, [query, searchFilters, onSearch, filtersVisible]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    setTimeout(handleSearch, 100);
  };

  const selectExampleQuery = (example: string) => {
    setQuery(example);
    setSuggestions([]);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Main Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 dark:focus-within:ring-blue-800 transition-all">
          <div className="flex items-center justify-center pl-6 pr-4">
            <Sparkles className="h-6 w-6 text-blue-500" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-2 py-5 bg-transparent outline-none text-gray-900 dark:text-white text-lg placeholder-gray-500"
            disabled={isSearching}
          />
          
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors mr-2"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          )}
          
          {enableFilters && (
            <button
              onClick={() => setFiltersVisible(!filtersVisible)}
              className={`p-3 mr-2 rounded-lg transition-colors ${
                filtersVisible 
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
              }`}
            >
              <Filter className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="px-8 py-3 mr-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {/* Auto-suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              <div className="p-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
                  Suggested queries
                </p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    <div className="flex items-center">
                      <Search className="h-4 w-4 text-gray-400 mr-3" />
                      {suggestion}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Example Queries */}
      {!query && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6"
        >
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3 text-center">
            Try these example queries:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.slice(0, 4).map((example, index) => (
              <button
                key={index}
                onClick={() => selectExampleQuery(example)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm transition-colors border border-gray-200 dark:border-gray-600"
              >
                {example}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters Panel */}
      <AnimatePresence>
        {filtersVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Date Range
                </label>
                <div className="space-y-3">
                  <input
                    type="date"
                    placeholder="Start date"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => setSearchFilters({ ...searchFilters, dateRange: { ...searchFilters.dateRange, start: e.target.value } })}
                  />
                  <input
                    type="date"
                    placeholder="End date"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => setSearchFilters({ ...searchFilters, dateRange: { ...searchFilters.dateRange, end: e.target.value } })}
                  />
                </div>
              </div>

              {/* Investment Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Investment Amount ($)
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    placeholder="Minimum"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => setSearchFilters({ ...searchFilters, investmentRange: { ...searchFilters.investmentRange, min: Number(e.target.value) } })}
                  />
                  <input
                    type="number"
                    placeholder="Maximum"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => setSearchFilters({ ...searchFilters, investmentRange: { ...searchFilters.investmentRange, max: Number(e.target.value) } })}
                  />
                </div>
              </div>

              {/* Document Types */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Document Types
                </label>
                <div className="space-y-2">
                  {['Term Sheet', 'Subscription Agreement', 'Investor Update', 'Financial Report', 'Board Meeting'].map(type => (
                    <label key={type} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          const types = e.target.checked 
                            ? [...searchFilters.documentTypes, type]
                            : searchFilters.documentTypes.filter((t: string) => t !== type);
                          setSearchFilters({ ...searchFilters, documentTypes: types });
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Investment Stages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Investment Stage
                </label>
                <div className="space-y-2">
                  {['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+'].map(stage => (
                    <label key={stage} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        onChange={(e) => {
                          const stages = e.target.checked 
                            ? [...searchFilters.stages, stage]
                            : searchFilters.stages.filter((s: string) => s !== stage);
                          setSearchFilters({ ...searchFilters, stages });
                        }}
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{stage}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};