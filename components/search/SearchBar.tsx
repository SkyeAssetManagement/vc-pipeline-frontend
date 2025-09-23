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
  "What are Advanced Navigation's Series B investment terms?",
  "Show me Loopit's subscription agreement details",
  "What is the liquidation preference structure?",
  "Find board composition requirements",
  "What are the anti-dilution provisions?",
  "Show me all term sheets with liquidation preferences"
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
    company: '',
    documentType: '',
    industry: '',
    dateRange: { start: '' as string | null, end: '' as string | null },
    investmentRange: { min: 0, max: 100000000 },
    valuationRange: { min: 0, max: 1000000000 },
    ownershipRange: { min: 0, max: 100 },
    minConfidence: 0,
    hasInvestmentAmount: false,
    hasValuation: false
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
        <div className="flex items-center rounded-lg shadow-sm border transition-all" style={{ backgroundColor: '#ffffff', borderColor: '#d4d4d8' }}>
          <div className="flex items-center justify-center pl-6 pr-4">
            <Search className="h-5 w-5" style={{ color: '#71717a' }} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 px-2 py-4 bg-transparent outline-none text-lg" style={{ color: '#18181b' }}
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
            className="px-6 py-2.5 mr-2 rounded-lg font-medium transition-all disabled:cursor-not-allowed border" style={{ backgroundColor: '#18181b', color: '#fafafa', borderColor: '#18181b' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
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
                className="px-3 py-1.5 rounded-md text-sm transition-all border" style={{ backgroundColor: '#fafafa', color: '#52525b', borderColor: '#e4e4e7', fontFamily: 'inherit' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; e.currentTarget.style.borderColor = '#d4d4d8'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fafafa'; e.currentTarget.style.borderColor = '#e4e4e7'; }}
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
            <div className="space-y-6">
              {/* First Row - Basic Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Company
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Advanced Navigation"
                    value={searchFilters.company}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => setSearchFilters({ ...searchFilters, company: e.target.value })}
                  />
                </div>

                {/* Document Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Document Type
                  </label>
                  <select
                    value={searchFilters.documentType}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => setSearchFilters({ ...searchFilters, documentType: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="subscription_agreement">Subscription Agreement</option>
                    <option value="shareholders_agreement">Shareholders Agreement</option>
                    <option value="term_sheet">Term Sheet</option>
                    <option value="investor_update">Investor Update</option>
                    <option value="financial_report">Financial Report</option>
                    <option value="board_minutes">Board Minutes</option>
                    <option value="due_diligence">Due Diligence</option>
                  </select>
                </div>

                {/* Industry Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Industry
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Technology, Healthcare"
                    value={searchFilters.industry}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onChange={(e) => setSearchFilters({ ...searchFilters, industry: e.target.value })}
                  />
                </div>

                {/* Confidence Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Min Confidence
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={searchFilters.minConfidence}
                    className="w-full"
                    onChange={(e) => setSearchFilters({ ...searchFilters, minConfidence: parseFloat(e.target.value) })}
                  />
                  <span className="text-xs text-gray-500">{(searchFilters.minConfidence * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Second Row - Financial Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Valuation Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Valuation ($)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Minimum"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onChange={(e) => setSearchFilters({ ...searchFilters, valuationRange: { ...searchFilters.valuationRange, min: Number(e.target.value) } })}
                    />
                    <input
                      type="number"
                      placeholder="Maximum"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onChange={(e) => setSearchFilters({ ...searchFilters, valuationRange: { ...searchFilters.valuationRange, max: Number(e.target.value) } })}
                    />
                  </div>
                </div>

                {/* Ownership Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Ownership (%)
                  </label>
                  <div className="space-y-3">
                    <input
                      type="number"
                      placeholder="Minimum"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onChange={(e) => setSearchFilters({ ...searchFilters, ownershipRange: { ...searchFilters.ownershipRange, min: Number(e.target.value) } })}
                    />
                    <input
                      type="number"
                      placeholder="Maximum"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      onChange={(e) => setSearchFilters({ ...searchFilters, ownershipRange: { ...searchFilters.ownershipRange, max: Number(e.target.value) } })}
                    />
                  </div>
                </div>
              </div>

              {/* Third Row - Boolean Filters */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchFilters.hasInvestmentAmount}
                    onChange={(e) => setSearchFilters({ ...searchFilters, hasInvestmentAmount: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Has Investment Amount</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={searchFilters.hasValuation}
                    onChange={(e) => setSearchFilters({ ...searchFilters, hasValuation: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Has Valuation Data</span>
                </label>

                <div className="flex items-center">
                  <button
                    onClick={() => setSearchFilters({
                      company: '',
                      documentType: '',
                      industry: '',
                      dateRange: { start: null, end: null },
                      investmentRange: { min: 0, max: 100000000 },
                      valuationRange: { min: 0, max: 1000000000 },
                      ownershipRange: { min: 0, max: 100 },
                      minConfidence: 0,
                      hasInvestmentAmount: false,
                      hasValuation: false
                    })}
                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};