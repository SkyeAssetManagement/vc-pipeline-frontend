'use client';

import Link from 'next/link'
import { ArrowRight, Search, BarChart3, FileText } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchAnswer, setSearchAnswer] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [portfolioStats, setPortfolioStats] = useState<any>(null);
  const [showAllResults, setShowAllResults] = useState(false);

  useEffect(() => {
    const fetchPortfolioStats = async () => {
      try {
        const response = await fetch('/api/test');
        const data = await response.json();
        if (data.success) {
          setPortfolioStats(data.overview);
        }
      } catch (error) {
        console.error('Failed to load portfolio stats:', error);
      }
    };
    
    fetchPortfolioStats();
  }, []);

  const handleSearch = async (query: string, filters?: any) => {
    console.log('🔍 Search query:', query, 'Filters:', filters);
    setIsSearching(true);
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          searchType: 'hybrid',
          filters
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Search results:', data);

      if (data.success) {
        setSearchResults(data.results || []);
        setSearchAnswer(data.answer || '');
      } else {
        console.error('Search error:', data.error);
        setSearchResults([]);
        setSearchAnswer('');
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
            <img 
              src="/VeronaCapitalLogo.png" 
              alt="Verona Capital" 
              className="h-16 mx-auto"
            />
          </Link>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
            VC Pipeline Management Platform
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            Harness the power of AI to manage your venture capital portfolio with semantic search, 
            intelligent document processing, and comprehensive analytics.
          </p>
        </div>

        {/* Natural Language Search */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} enableFilters={true} />
        </div>

        {/* Search Results */}
        {(searchResults.length > 0 || searchAnswer || isSearching) && (
          <div className="mb-12">
            {/* AI-Synthesized Answer */}
            {searchAnswer && !isSearching && (
              <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg p-6 border border-blue-200 dark:border-gray-600">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">AI</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Analysis
                    </h3>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {searchAnswer.split('\n').map((paragraph, index) => (
                        paragraph.trim() && (
                          <p key={index} className="text-gray-700 dark:text-gray-300 mb-3 last:mb-0 leading-relaxed">
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Sources */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {searchAnswer ? 'Supporting Documents' : 'Search Results'}
              </h3>
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Analyzing portfolio documents...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {(showAllResults ? searchResults : searchResults.slice(0, 1)).map((result) => (
                    <div key={result.id} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{result.title}</h4>
                            <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              {result.type}
                            </span>
                            <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                              {result.company}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm leading-relaxed">
                            {result.content?.substring(0, 300)}
                            {result.content?.length > 300 ? '...' : ''}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                            {result.metadata?.has_financial_data && (
                              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded">
                                💰 Financial Data
                              </span>
                            )}
                            {result.metadata?.has_legal_terms && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
                                ⚖️ Legal Terms
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 1 && (
                    <div className="text-center pt-4">
                      <button
                        onClick={() => setShowAllResults(!showAllResults)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        {showAllResults ? (
                          <>
                            Show Less
                            <ArrowRight className="w-4 h-4 ml-1 rotate-90" />
                          </>
                        ) : (
                          <>
                            Show All {searchResults.length} Sources
                            <ArrowRight className="w-4 h-4 ml-1 -rotate-90" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio Overview Dashboard */}
        <div className="mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Portfolio Overview
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time portfolio analytics and performance metrics
              </p>
            </div>
            <div className="relative h-96 md:h-[500px] lg:h-[600px] bg-gray-50 dark:bg-gray-700 rounded-b-xl overflow-hidden">
              {/* Embedded Google Looker Studio Dashboard */}
              <iframe
                src="https://lookerstudio.google.com/embed/reporting/61dc78c9-5fdf-4f96-b80c-c8208f2edd7d/page/g23HF"
                width="100%"
                height="100%"
                style={{ border: 'none' }}
                title="Portfolio Overview Dashboard"
                className="rounded-b-xl"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              ></iframe>
              
              {/* Fallback overlay in case iframe doesn't load */}
              <div className="absolute top-4 right-4">
                <a 
                  href="https://lookerstudio.google.com/reporting/61dc78c9-5fdf-4f96-b80c-c8208f2edd7d" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors shadow-lg border border-gray-200 dark:border-gray-600"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Open Full View
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mb-16">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
          >
            Access Full Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Semantic Search
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Find information across your portfolio using natural language queries. 
              Search through documents, metrics, and company data intelligently.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Portfolio Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive dashboard with real-time insights into your portfolio performance, 
              valuations, and key metrics across all investments.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Document Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Automated document processing and data extraction from term sheets, 
              investor updates, and financial reports with AI-powered insights.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p>Powered by Weaviate Vector Database and OpenAI</p>
        </div>
      </div>
    </div>
  )
}