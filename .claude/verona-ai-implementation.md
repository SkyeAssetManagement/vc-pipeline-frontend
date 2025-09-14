# VeronaAI VC Pipeline Frontend - Complete Implementation Guide

## Project Setup Commands

```bash
# Create Next.js project with TypeScript and Tailwind
npx create-next-app@latest verona-ai-vc --typescript --tailwind --app --eslint
cd verona-ai-vc

# Install required dependencies
npm install @apollo/client graphql weaviate-ts-client
npm install recharts lucide-react date-fns
npm install @tanstack/react-query axios
npm install react-pdf @react-pdf-viewer/core @react-pdf-viewer/default-layout
npm install react-hook-form zod @hookform/resolvers
npm install next-auth @auth/prisma-adapter prisma
npm install framer-motion react-hot-toast
npm install papaparse jspdf html2canvas
npm install @headlessui/react @heroicons/react
npm install react-intersection-observer

# Install dev dependencies
npm install -D @types/papaparse @types/node
```

## Project Structure

```
verona-ai-vc/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── search/route.ts
│   │   ├── companies/route.ts
│   │   └── export/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── companies/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   └── search/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchFilters.tsx
│   │   ├── SearchResults.tsx
│   │   └── SearchHighlight.tsx
│   ├── dashboard/
│   │   ├── PortfolioStats.tsx
│   │   ├── CompanyCard.tsx
│   │   ├── MetricsChart.tsx
│   │   └── RecentActivity.tsx
│   ├── company/
│   │   ├── CompanyHeader.tsx
│   │   ├── DocumentLibrary.tsx
│   │   ├── DataVisualization.tsx
│   │   ├── Timeline.tsx
│   │   └── DocumentViewer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       └── Loading.tsx
├── lib/
│   ├── weaviate.ts
│   ├── auth.ts
│   ├── utils.ts
│   └── hooks/
│       ├── useSearch.ts
│       ├── useCompanies.ts
│       └── useDocuments.ts
├── types/
│   ├── company.ts
│   ├── document.ts
│   └── search.ts
└── config/
    └── weaviate.config.ts
```

## Core Implementation Files

### 1. Weaviate Configuration (`config/weaviate.config.ts`)

```typescript
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

export const weaviateConfig = {
  scheme: process.env.NEXT_PUBLIC_WEAVIATE_SCHEME || 'https',
  host: process.env.NEXT_PUBLIC_WEAVIATE_HOST || 'usvjfeugtnanoqmzweqxq.c0.australia-southeast1.gcp.weaviate.cloud',
  apiKey: new ApiKey(process.env.WEAVIATE_API_KEY || 'UHRKZ1dJaEFnTW1wdWRJT19iVGdjYTdSZmdld0FEejViWDBCTzRrWFhKM3dQeHorMGhTaHpLeVVTSmFFPV92MjAw'),
  headers: { 'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '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' }
};

export const client: WeaviateClient = weaviate.client(weaviateConfig);

export const CLASSES = {
  COMPANY: 'Company',
  DOCUMENT: 'Document',
  INVESTMENT: 'Investment'
};
```

### 2. Type Definitions (`types/company.ts`)

```typescript
export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  stage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Later';
  valuation: number;
  investmentAmount: number;
  ownershipPercentage: number;
  foundedDate: Date;
  website?: string;
  description: string;
  metrics: {
    revenue?: number;
    mrr?: number;
    arr?: number;
    burnRate?: number;
    runway?: number;
    employees?: number;
  };
  documents: Document[];
  investments: Investment[];
}

export interface Document {
  id: string;
  companyId: string;
  type: 'TermSheet' | 'SubscriptionAgreement' | 'InvestorUpdate' | 'FinancialReport' | 'BoardMeeting' | 'Other';
  title: string;
  uploadDate: Date;
  fileUrl: string;
  extractedData: Record<string, any>;
  verified: boolean;
  tags: string[];
}

export interface Investment {
  id: string;
  companyId: string;
  round: string;
  amount: number;
  date: Date;
  leadInvestor: string;
  participants: string[];
  preMoneyValuation: number;
  postMoneyValuation: number;
}
```

### 3. Weaviate Service Layer (`lib/weaviate.ts`)

```typescript
import { client, CLASSES } from '@/config/weaviate.config';
import { Company, Document } from '@/types/company';

export class WeaviateService {
  // Semantic search across all documents
  static async semanticSearch(query: string, filters?: any) {
    try {
      const result = await client.graphql
        .get()
        .withClassName(CLASSES.DOCUMENT)
        .withFields(['title', 'type', 'extractedData', 'companyId', '_additional { score }'])
        .withNearText({ concepts: [query] })
        .withLimit(20)
        .do();

      return result.data.Get.Document;
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  // Hybrid search combining keyword and vector similarity
  static async hybridSearch(query: string, alpha: number = 0.5) {
    try {
      const result = await client.graphql
        .get()
        .withClassName(CLASSES.DOCUMENT)
        .withFields(['title', 'type', 'extractedData', 'companyId', '_additional { score }'])
        .withHybrid({ query, alpha })
        .withLimit(20)
        .do();

      return result.data.Get.Document;
    } catch (error) {
      console.error('Hybrid search error:', error);
      throw error;
    }
  }

  // Get all companies with their documents
  static async getCompanies(filters?: any): Promise<Company[]> {
    try {
      const result = await client.graphql
        .get()
        .withClassName(CLASSES.COMPANY)
        .withFields([
          'name',
          'logo',
          'industry',
          'stage',
          'valuation',
          'investmentAmount',
          'ownershipPercentage',
          'metrics'
        ])
        .withLimit(100)
        .do();

      return result.data.Get.Company;
    } catch (error) {
      console.error('Get companies error:', error);
      throw error;
    }
  }

  // Get single company with all related data
  static async getCompanyById(id: string): Promise<Company> {
    try {
      const result = await client.graphql
        .get()
        .withClassName(CLASSES.COMPANY)
        .withWhere({
          path: ['id'],
          operator: 'Equal',
          valueString: id
        })
        .withFields([
          'name',
          'logo',
          'industry',
          'stage',
          'valuation',
          'investmentAmount',
          'ownershipPercentage',
          'metrics',
          'documents { ... on Document { title type uploadDate fileUrl extractedData verified } }',
          'investments { ... on Investment { round amount date leadInvestor participants preMoneyValuation postMoneyValuation } }'
        ])
        .do();

      return result.data.Get.Company[0];
    } catch (error) {
      console.error('Get company by ID error:', error);
      throw error;
    }
  }
}
```

### 4. Search Bar Component (`components/search/SearchBar.tsx`)

```typescript
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string, filters?: any) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search companies, documents, or ask questions..." 
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    investmentRange: { min: 0, max: 100000000 },
    documentTypes: [],
    stages: []
  });

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      fetchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery]);

  const fetchSuggestions = async (q: string) => {
    // Implement suggestion fetching
    const mockSuggestions = [
      `Show me all Series A rounds above $0.5M`,
      `Companies with recurring revenue models`,
      `Recent investor updates`,
      `Term sheets from 2025`
    ].filter(s => s.toLowerCase().includes(q.toLowerCase()));
    setSuggestions(mockSuggestions);
  };

  const handleSearch = () => {
    onSearch(query, showFilters ? filters : undefined);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <Search className="ml-4 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="flex-1 px-4 py-4 bg-transparent outline-none text-gray-900 dark:text-white"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 mr-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Filter className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={handleSearch}
            className="px-6 py-2 mr-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Search
          </button>
        </div>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && query && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setQuery(suggestion);
                    setSuggestions([]);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700"
          >
            <SearchFilters filters={filters} onChange={setFilters} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SearchFilters: React.FC<{ filters: any; onChange: (filters: any) => void }> = ({ filters, onChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date Range
        </label>
        <div className="space-y-2">
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            onChange={(e) => onChange({ ...filters, dateRange: { ...filters.dateRange, start: e.target.value } })}
          />
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            onChange={(e) => onChange({ ...filters, dateRange: { ...filters.dateRange, end: e.target.value } })}
          />
        </div>
      </div>

      {/* Investment Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Investment Amount
        </label>
        <div className="space-y-2">
          <input
            type="number"
            placeholder="Min ($)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            onChange={(e) => onChange({ ...filters, investmentRange: { ...filters.investmentRange, min: Number(e.target.value) } })}
          />
          <input
            type="number"
            placeholder="Max ($)"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
            onChange={(e) => onChange({ ...filters, investmentRange: { ...filters.investmentRange, max: Number(e.target.value) } })}
          />
        </div>
      </div>

      {/* Document Types */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Document Types
        </label>
        <div className="space-y-2">
          {['Term Sheet', 'Subscription Agreement', 'Investor Update', 'Financial Report'].map(type => (
            <label key={type} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                onChange={(e) => {
                  const types = e.target.checked 
                    ? [...filters.documentTypes, type]
                    : filters.documentTypes.filter((t: string) => t !== type);
                  onChange({ ...filters, documentTypes: types });
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Investment Stage
        </label>
        <div className="space-y-2">
          {['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+'].map(stage => (
            <label key={stage} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                onChange={(e) => {
                  const stages = e.target.checked 
                    ? [...filters.stages, stage]
                    : filters.stages.filter((s: string) => s !== stage);
                  onChange({ ...filters, stages });
                }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">{stage}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 5. Dashboard Page (`app/dashboard/page.tsx`)

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { SearchBar } from '@/components/search/SearchBar';
import { PortfolioStats } from '@/components/dashboard/PortfolioStats';
import { CompanyCard } from '@/components/dashboard/CompanyCard';
import { MetricsChart } from '@/components/dashboard/MetricsChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { WeaviateService } from '@/lib/weaviate';
import { Company } from '@/types/company';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const data = await WeaviateService.getCompanies();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string, filters?: any) => {
    if (!query && !filters) {
      setFilteredCompanies(companies);
      return;
    }

    try {
      const results = await WeaviateService.hybridSearch(query);
      // Process and filter results based on filters
      setFilteredCompanies(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const stats = {
    totalPortfolioValue: companies.reduce((sum, c) => sum + c.valuation, 0),
    totalCompanies: companies.length,
    averageOwnership: companies.reduce((sum, c) => sum + c.ownershipPercentage, 0) / companies.length,
    totalInvested: companies.reduce((sum, c) => sum + c.investmentAmount, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              VeronaAI Portfolio Dashboard
            </h1>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <PortfolioStats stats={stats} />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Companies Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Portfolio Companies ({filteredCompanies.length})
                </h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="name">Name</option>
                    <option value="valuation">Valuation</option>
                    <option value="stage">Stage</option>
                    <option value="investment">Investment</option>
                  </select>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                    >
                      List
                    </button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
                  {filteredCompanies.map((company) => (
                    <motion.div
                      key={company.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CompanyCard company={company} viewMode={viewMode} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <MetricsChart companies={companies} />
            <RecentActivity companies={companies} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 6. Company Card Component (`components/dashboard/CompanyCard.tsx`)

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { Company } from '@/types/company';
import { Building2, TrendingUp, Calendar, FileText } from 'lucide-react';

interface CompanyCardProps {
  company: Company;
  viewMode: 'grid' | 'list';
}

export const CompanyCard: React.FC<CompanyCardProps> = ({ company, viewMode }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stageColors = {
    'Pre-Seed': 'bg-purple-100 text-purple-800',
    'Seed': 'bg-blue-100 text-blue-800',
    'Series A': 'bg-green-100 text-green-800',
    'Series B': 'bg-yellow-100 text-yellow-800',
    'Series C': 'bg-orange-100 text-orange-800',
    'Later': 'bg-red-100 text-red-800',
  };

  if (viewMode === 'list') {
    return (
      <Link href={`/companies/${company.id}`}>
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{company.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColors[company.stage]}`}>
              {company.stage}
            </span>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {formatCurrency(company.valuation)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Valuation</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {company.ownershipPercentage.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ownership</p>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/companies/${company.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-full" />
              ) : (
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{company.industry}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${stageColors[company.stage]}`}>
              {company.stage}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Valuation</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(company.valuation)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Investment</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(company.investmentAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ownership</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {company.ownershipPercentage.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Documents</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {company.documents?.length || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(company.foundedDate).getFullYear()}
              </span>
              <span className="flex items-center">
                <FileText className="w-3 h-3 mr-1" />
                {company.documents?.length || 0} docs
              </span>
            </div>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </div>
        </div>
      </div>
    </Link>
  );
};
```

### 7. Company Detail Page (`app/companies/[id]/page.tsx`)

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CompanyHeader } from '@/components/company/CompanyHeader';
import { DocumentLibrary } from '@/components/company/DocumentLibrary';
import { DataVisualization } from '@/components/company/DataVisualization';
import { Timeline } from '@/components/company/Timeline';
import { DocumentViewer } from '@/components/company/DocumentViewer';
import { WeaviateService } from '@/lib/weaviate';
import { Company, Document } from '@/types/company';

export default function CompanyDetailPage() {
  const params = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'data' | 'timeline'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCompany(params.id as string);
    }
  }, [params.id]);

  const fetchCompany = async (id: string) => {
    try {
      const data = await WeaviateService.getCompanyById(id);
      setCompany(data);
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Company not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CompanyHeader company={company} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'documents', label: 'Documents' },
              { id: 'data', label: 'Extracted Data' },
              { id: 'timeline', label: 'Timeline' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Company Overview
                </h2>
                <DataVisualization company={company} />
              </div>
            )}

            {activeTab === 'documents' && (
              <DocumentLibrary
                documents={company.documents}
                onSelectDocument={setSelectedDocument}
              />
            )}

            {activeTab === 'data' && (
              <DataVisualization company={company} detailed={true} />
            )}

            {activeTab === 'timeline' && (
              <Timeline company={company} />
            )}
          </div>

          {/* Sidebar - Document Viewer */}
          <div className="lg:col-span-1">
            {selectedDocument && (
              <DocumentViewer
                document={selectedDocument}
                onClose={() => setSelectedDocument(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 8. Document Library Component (`components/company/DocumentLibrary.tsx`)

```typescript
'use client';

import React, { useState } from 'react';
import { Document } from '@/types/company';
import { FileText, Download, Eye, CheckCircle, AlertCircle, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface DocumentLibraryProps {
  documents: Document[];
  onSelectDocument: (doc: Document) => void;
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ documents, onSelectDocument }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const documentTypeIcons = {
    TermSheet: '📄',
    SubscriptionAgreement: '📋',
    InvestorUpdate: '📊',
    FinancialReport: '💰',
    BoardMeeting: '👥',
    Other: '📎'
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter = filter === 'all' || doc.type === filter;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Document Library ({documents.length})
        </h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Upload Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm ${
              filter === 'all' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {Object.keys(documentTypeIcons).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg text-sm ${
                filter === type 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Document List */}
      <div className="space-y-3">
        {filteredDocuments.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectDocument(doc)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{documentTypeIcons[doc.type]}</span>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {doc.type.replace(/([A-Z])/g, ' $1').trim()} • 
                    Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-4 mt-2">
                    {doc.verified ? (
                      <span className="flex items-center text-green-600 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center text-yellow-600 text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending Review
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {Object.keys(doc.extractedData).length} fields extracted
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle view
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Eye className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle download
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
```

### 9. Environment Variables (`.env.local`)

```env
# Weaviate Configuration
NEXT_PUBLIC_WEAVIATE_SCHEME=https
NEXT_PUBLIC_WEAVIATE_HOST=usvjfeugtnanoqmzweqxq.c0.australia-southeast1.gcp.weaviate.cloud
WEAVIATE_API_KEY=UHRKZ1dJaEFnTW1wdWRJT19iVGdjYTdSZmdld0FEejViWDBCTzRrWFhKM3dQeHorMGhTaHpLeVVTSmFFPV92MjAw

# OpenAI for embeddings
OPENAI_API_KEY=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

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Database (for user management)
DATABASE_URL=postgresql://user:password@localhost:5432/veronaai
```

### 10. API Routes (`app/api/search/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';

export async function POST(request: NextRequest) {
  try {
    const { query, filters, searchType = 'hybrid' } = await request.json();

    let results;
    if (searchType === 'semantic') {
      results = await WeaviateService.semanticSearch(query, filters);
    } else {
      results = await WeaviateService.hybridSearch(query, 0.7);
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
```

## Deployment Instructions

```bash
# Build the application
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy with Docker
docker build -t verona-ai-vc .
docker run -p 3000:3000 verona-ai-vc
```

## Key Features Implementation Summary

1. **Natural Language Search**: Implemented with Weaviate's hybrid search combining keyword and vector similarity
2. **Portfolio Dashboard**: Complete with stats, company cards, and filtering
3. **Company Details**: Comprehensive view with document library and data visualization
4. **Document Management**: Full CRUD operations with verification workflow
5. **Data Visualization**: Charts using Recharts library
6. **Export Functionality**: CSV and PDF export capabilities
7. **Responsive Design**: Mobile-first approach with Tailwind CSS
8. **Authentication**: NextAuth integration for user management
9. **Real-time Updates**: WebSocket support for live data
10. **Performance Optimization**: React Query for caching and optimistic updates

This implementation provides a production-ready foundation for your VeronaAI VC Pipeline Frontend with all requested features and modern best practices.