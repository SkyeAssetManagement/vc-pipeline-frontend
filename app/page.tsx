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
    <div className="min-h-screen" style={{ backgroundColor: '#fbf9f5' }}>
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
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-8">
            VC Pipeline Management Platform
          </h2>
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
              <div className="mb-6 rounded-xl shadow-sm p-6 border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
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
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
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
          <div className="rounded-xl shadow-sm border overflow-hidden" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Portfolio Overview
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time portfolio analytics and performance metrics
              </p>
            </div>
            <div className="relative h-[600px] md:h-[700px] lg:h-[800px] xl:h-[900px] rounded-b-xl overflow-hidden" style={{ backgroundColor: '#f8f8f8' }}>
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

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            href="/companies"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-lg transition-all border" style={{ backgroundColor: '#18181b', color: '#fafafa', borderColor: '#18181b' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#27272a'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#18181b'}
          >
            View Portfolio Companies
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium rounded-lg transition-all border" style={{ backgroundColor: '#ffffff', color: '#18181b', borderColor: '#d4d4d8' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f4f4f5'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
          >
            Access Full Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

      </div>
    </div>
  )
}