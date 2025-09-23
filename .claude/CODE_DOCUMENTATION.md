# VeronaAI VC Pipeline Frontend - Code Documentation

## Project Overview
AI-powered venture capital portfolio management platform built with Next.js 14, integrated with Weaviate vector database and Claude Sonnet 4 for intelligent document search and analysis.

## Architecture & Tech Stack

### Core Technologies
- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: Weaviate (Vector Database)
- **AI**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Search**: Hybrid BM25 + Semantic Search

### Data Sources
- **Primary Collection**: `VC_PE_Claude97_Production` - Real financial documents with Claude-extracted data
- **Schema**: Investment amounts, valuations, ownership percentages, confidence scores
- **Document Types**: Pitch decks, term sheets, shareholder agreements, financial reports

## Directory Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── search-optimized/     # Enhanced search with financial filters
│   │   ├── search/               # Legacy search endpoint
│   │   └── weaviate-schema/      # Schema inspection
│   ├── companies/                # Company pages
│   ├── dashboard/                # Analytics dashboard
│   └── page.tsx                  # Home page with search
├── components/                   # React components
│   └── search/
│       └── SearchBar.tsx         # Enhanced search with advanced filters
├── lib/                          # Core libraries
│   ├── claude.ts                 # Claude Sonnet 4 service
│   ├── weaviate-optimized.ts     # Optimized Weaviate client
│   └── portfolio-utils.ts        # Financial calculations
└── config/
    └── weaviate.config.ts        # Weaviate connection
```

## Key Features & Components

### 1. Enhanced Search System (`/api/search-optimized`)
**Purpose**: AI-powered search with financial data filtering and Claude analysis

**Key Features**:
- Hybrid search (BM25 + semantic)
- Financial filters (investment amounts, valuations, ownership ranges)
- Claude Sonnet 4 answer generation
- Real-time confidence scoring

**Data Flow**:
```
User Query → Weaviate Search → Claude Processing → Enhanced Results + AI Answer
```

### 2. Search Interface (`components/search/SearchBar.tsx`)
**Advanced Filtering Options**:
- Company name, industry, document type
- Investment amount ranges ($0 - $100M+)
- Valuation ranges ($0 - $1B+)
- Ownership percentage (0-100%)
- Confidence threshold (0-100%)
- Boolean flags (has investment, has valuation)

### 3. Financial Data Display
**Enhanced Result Cards**:
- Investment amounts with currency formatting
- Pre/post-money valuations
- Ownership percentages
- Fair value calculations
- Confidence scores with visual indicators
- Industry and document type tags

### 4. Claude Integration (`lib/claude.ts`)
**AI Answer Generation**:
- Model: `claude-sonnet-4-20250514`
- Temperature: 0.1 (factual responses)
- Max tokens: 1000
- Context preparation from search results
- Confidence assessment (high/medium/low)

### 5. Weaviate Integration (`lib/weaviate-optimized.ts`)
**Search Methods**:
- `semanticSearch()` - Vector similarity search
- `hybridSearch()` - BM25 + semantic combination
- `searchWithFilters()` - Advanced filtering with financial criteria
- `searchByInvestmentRange()` - Investment amount filtering
- `searchByValuationRange()` - Valuation filtering

## Data Schema (VC_PE_Claude97_Production)

### Core Fields
```typescript
{
  content: string                    // Document text content
  company_name: string               // Company identifier
  industry: string                   // Business sector
  document_type: string              // Document classification

  // Financial Data
  investment_amount: number          // Investment amount in USD
  pre_money_valuation: number        // Pre-money valuation
  post_money_valuation: number       // Post-money valuation
  fair_value: number                 // Current fair value
  ownership_percentage: number       // Ownership stake (0-100)

  // Metadata
  extraction_confidence: number      // Claude extraction confidence (0-1)
  extraction_timestamp: date         // When data was extracted
  chunk_id: string                   // Unique document chunk ID
}
```

## API Endpoints

### `/api/search-optimized` (POST)
**Enhanced search with financial filtering**
```typescript
Request: {
  query: string
  filters: {
    company?: string
    industry?: string
    documentType?: string
    minInvestmentAmount?: number
    maxInvestmentAmount?: number
    minValuation?: number
    maxValuation?: number
    minOwnership?: number
    maxOwnership?: number
    minConfidence?: number
    hasInvestmentAmount?: boolean
    hasValuation?: boolean
  }
  searchType: 'hybrid' | 'semantic' | 'bm25'
  useOptimizedCollection: boolean
}

Response: {
  success: boolean
  results: SearchResult[]
  companyGroups: CompanyGroup[]
  aiAnswer: string
  metadata: SearchMetadata
}
```

### `/api/weaviate-schema` (GET)
**Schema inspection and validation**

## Security & Data Integrity

### No Fake Data Policy
- ✅ All financial data comes from real documents
- ✅ Zero/null values when no data exists
- ✅ No placeholder financial amounts
- ✅ Calculations only use verified data

### API Keys & Environment
```env
ANTHROPIC_API_KEY=sk-ant-api03-...     # Claude Sonnet 4
WEAVIATE_API_KEY=...                   # Weaviate cloud instance
OPENAI_API_KEY=...                     # For embeddings (if needed)
```

## Performance Optimizations

### Search Performance
- Weaviate hybrid search for optimal relevance
- Chunked document processing
- Confidence-based result filtering
- Efficient GraphQL queries

### Build Optimizations
- TypeScript strict mode
- Next.js production build optimized
- Static page generation where possible
- Proper error boundaries

## Development Workflow

### Local Development
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # ESLint checking
npm run typecheck    # TypeScript validation
```

### Key Development Commands
```bash
curl -X POST http://localhost:3003/api/search-optimized \
  -H "Content-Type: application/json" \
  -d '{"query":"Advanced Navigation","searchType":"hybrid"}'
```

## Error Handling

### Search Fallbacks
- Claude API failures → Basic search results
- Weaviate timeouts → Cached results
- Invalid filters → Default search
- No results → Helpful suggestions

### Logging Strategy
- Console logging in development
- Error tracking for production
- Search analytics for optimization

## Future Enhancements

### Planned Features
- Real-time document ingestion
- Advanced analytics dashboard
- Multi-language support
- Enhanced AI insights
- Portfolio performance tracking

### Technical Debt
- Migrate legacy search endpoint
- Implement proper caching layer
- Add comprehensive test coverage
- Enhance error monitoring

## Code Standards

### TypeScript Usage
- Strict mode enabled
- Proper type definitions
- Interface-based contracts
- Generic type safety

### Component Architecture
- Functional components with hooks
- Props interface definitions
- Error boundary implementation
- Accessibility compliance

### Data Flow
- Unidirectional data flow
- State management with React hooks
- API layer separation
- Error state handling

This documentation provides a comprehensive understanding of the VeronaAI VC Pipeline frontend architecture, enabling efficient development and maintenance.