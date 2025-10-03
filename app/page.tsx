'use client';

import Link from 'next/link'
import { ArrowRight, Search, BarChart3, FileText, Sparkles } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { useState } from 'react'

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnswer, setSearchAnswer] = useState<string>('');
  const [searchConfidence, setSearchConfidence] = useState<'high' | 'medium' | 'low'>('low');
  const [searchSources, setSearchSources] = useState<string[]>([]);
  const [showAllResults, setShowAllResults] = useState(false);
  const [useDSPy, setUseDSPy] = useState(false);
  const [optimizationStatus, setOptimizationStatus] = useState<any>(null);

  const handleSearch = async (query: string, filters?: any) => {
    console.log('Search query:', query, 'Filters:', filters, 'Using DSPy:', useDSPy);
    setIsSearching(true);
    setSearchAnswer('');

    try {
      const endpoint = useDSPy ? '/api/search-dspy' : '/api/search-optimized';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
          searchType: 'hybrid',
          useOptimizedCollection: true,
          userId: 'demo-user',
          sessionId: 'demo-session'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results || []);
        setSearchAnswer(data.aiAnswer || data.answer || '');
        setSearchConfidence(data.confidence || 'low');
        setSearchSources(data.sources || []);
        setShowAllResults(false);

        // Store optimization status if using DSPy
        if (useDSPy && data.optimizationStatus) {
          setOptimizationStatus(data.optimizationStatus);
        }
      } else {
        console.error('Search failed:', data.error);
        setSearchResults([]);
        setSearchAnswer(`Search failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setSearchAnswer('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf9f5' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Link href="/" className="hover:scale-105 transition-transform duration-200">
              <img
                src="/VeronaCapitalLogo.png"
                alt="Verona Capital"
                className="h-20 mx-auto drop-shadow-lg"
              />
            </Link>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-8">
            Private Equity Platform
          </h2>
        </div>

        {/* DSPy Optimization Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDSPy}
                  onChange={(e) => setUseDSPy(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                  DSPy Optimization
                </span>
              </label>

              {useDSPy && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  <span>Self-improving AI</span>
                </div>
              )}
            </div>

            {/* DSPy Status */}
            {useDSPy && optimizationStatus && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-400">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Status:</span> {optimizationStatus.isOptimized ? '✅ Optimized' : '🔄 Learning'}
                  </div>
                  <div>
                    <span className="font-medium">Examples:</span> {optimizationStatus.trainingExamples}
                  </div>
                  <div>
                    <span className="font-medium">Model:</span> {optimizationStatus.currentModel}
                  </div>
                  {optimizationStatus.performanceScore && (
                    <div>
                      <span className="font-medium">Score:</span> {(optimizationStatus.performanceScore * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
                {!optimizationStatus.isOptimized && optimizationStatus.trainingExamples < 50 && (
                  <p className="mt-2 text-amber-600 dark:text-amber-400">
                    Need {50 - optimizationStatus.trainingExamples} more examples for optimization
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Natural Language Search */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} enableFilters={true} />
        </div>

        {/* Search Results */}
        {(searchResults.length > 0 || isSearching || searchAnswer) && (
          <div className="mb-12">
            {/* AI-Synthesized Answer */}
            {searchAnswer && !isSearching && (
              <div className="mb-6 rounded-xl shadow-lg p-6 border bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950" style={{ borderColor: '#e5e5e5' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        Claude Analysis
                        {useDSPy && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                            <Sparkles className="h-3 w-3" />
                            DSPy Enhanced
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          searchConfidence === 'high' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                            : searchConfidence === 'medium'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}>
                          {searchConfidence} confidence
                        </span>
                      </div>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {searchAnswer.split('\n').map((paragraph, index) => (
                        paragraph.trim() && (
                          <p key={index} className="text-gray-700 dark:text-gray-300 mb-3 last:mb-0 leading-relaxed">
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                    {searchSources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Sources:</p>
                        <div className="flex flex-wrap gap-1">
                          {searchSources.slice(0, 5).map((source, index) => (
                            <span key={index} className="px-2 py-1 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-200 text-xs rounded-md font-medium">
                              {source}
                            </span>
                          ))}
                          {searchSources.length > 5 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                              +{searchSources.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Document Sources */}
            <div className="rounded-xl shadow-lg p-6 border bg-white dark:bg-gray-800" style={{ borderColor: '#e5e5e5' }}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Search Results ({searchResults.length} {searchResults.length === 1 ? 'document' : 'documents'} found)
              </h3>
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Searching portfolio...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No results found. Try adjusting your search terms.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.slice(0, showAllResults ? searchResults.length : 5).map((result) => (
                    <div key={result.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 bg-gradient-to-r from-transparent to-transparent hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-950/20 dark:hover:to-indigo-950/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{result.title}</h4>
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                              {result.documentType || 'Document'}
                            </span>
                            {result.industry && (
                              <span className="px-2 py-1 bg-gradient-to-r from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                                {result.industry}
                              </span>
                            )}
                            {result.hasInvestmentAmount && (
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                                💰 Investment
                              </span>
                            )}
                            {result.hasValuation && (
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-xs rounded-full">
                                📊 Valuation
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Company:</strong> {result.company}
                          </p>

                          {/* Financial Data Display */}
                          {(result.investmentAmount > 0 || result.preMoneyValuation > 0 || result.ownershipPercentage > 0) && (
                            <div className="mb-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                {result.investmentAmount > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Investment:</span>
                                    <span className="ml-1 text-green-600 dark:text-green-400">
                                      ${result.investmentAmount.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {result.preMoneyValuation > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Pre-Money:</span>
                                    <span className="ml-1 text-blue-600 dark:text-blue-400">
                                      ${result.preMoneyValuation.toLocaleString()}
                                    </span>
                                  </div>
                                )}
                                {result.ownershipPercentage > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Ownership:</span>
                                    <span className="ml-1 text-purple-600 dark:text-purple-400">
                                      {result.ownershipPercentage.toFixed(2)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                              {(result.postMoneyValuation > 0 || result.fairValue > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mt-2">
                                  {result.postMoneyValuation > 0 && (
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Post-Money:</span>
                                      <span className="ml-1 text-indigo-600 dark:text-indigo-400">
                                        ${result.postMoneyValuation.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                  {result.fairValue > 0 && (
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Fair Value:</span>
                                      <span className="ml-1 text-orange-600 dark:text-orange-400">
                                        ${result.fairValue.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <p className="text-gray-600 dark:text-gray-400 mb-3">{result.snippet}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {result.extractionConfidence > 0 && (
                              <span>🎯 Confidence: {(result.extractionConfidence * 100).toFixed(1)}%</span>
                            )}
                            {result.score && (
                              <span>📈 Relevance: {(result.score * 100).toFixed(1)}%</span>
                            )}
                            {result.extractionTimestamp && (
                              <span>📅 {new Date(result.extractionTimestamp).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 5 && (
                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowAllResults(!showAllResults)}
                        className="inline-flex items-center justify-center px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md"
                      >
                        {showAllResults ? (
                          <>
                            Show less
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </>
                        ) : (
                          <>
                            Show {searchResults.length - 5} more {searchResults.length - 5 === 1 ? 'result' : 'results'}
                            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </>
                        )}
                      </button>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {showAllResults
                          ? `Showing all ${searchResults.length} results`
                          : `Showing 5 of ${searchResults.length} results`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4">
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
          >
            View Portfolio Overview
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/companies"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
          >
            Browse Companies
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
          >
            Full Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

      </div>
    </div>
  )
}