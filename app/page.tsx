'use client';

import Link from 'next/link'
import { ArrowRight, Search, BarChart3, FileText } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { UserMenu } from '@/components/auth/UserMenu'
import { useState } from 'react'

export default function HomePage() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchAnswer, setSearchAnswer] = useState<string>('');
  const [searchConfidence, setSearchConfidence] = useState<'high' | 'medium' | 'low'>('low');
  const [searchSources, setSearchSources] = useState<string[]>([]);

  const handleSearch = async (query: string, filters?: any) => {
    console.log('Search query:', query, 'Filters:', filters);
    setIsSearching(true);
    setSearchAnswer('');
    
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          filters,
          searchType: 'hybrid'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSearchResults(data.results || []);
        setSearchAnswer(data.aiAnswer || '');
        setSearchConfidence(data.confidence || 'low');
        setSearchSources(data.sources || []);
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
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1"></div>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/VeronaCapitalLogo.png"
                alt="Verona Capital"
                className="h-16 mx-auto"
              />
            </Link>
            <div className="flex-1 flex justify-end">
              <UserMenu />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-8">
            VC Pipeline Management Platform
          </h2>
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
              <div className="mb-6 rounded-xl shadow-sm p-6 border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">AI</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Claude Analysis
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
                            <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
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
            <div className="rounded-xl shadow-sm p-6 border" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Search Results ({searchResults.length} documents found)
              </h3>
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Searching portfolio...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No results found. Try adjusting your search terms.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div key={result.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{result.title}</h4>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              {result.documentType || 'Document'}
                            </span>
                            {result.sectionType && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                                {result.sectionType}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <strong>Company:</strong> {result.company}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">{result.snippet}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            {result.filePath && (
                              <span>📄 {result.filePath.split('/').pop()}</span>
                            )}
                            {result.tokenCount && (
                              <span>📊 {result.tokenCount} tokens</span>
                            )}
                            {result.score && (
                              <span>🎯 Score: {(result.score * 100).toFixed(1)}%</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
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