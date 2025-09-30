# VC Pipeline Frontend - Code Documentation

## Project Overview
AI-powered venture capital portfolio management platform with advanced Weaviate vector database integration for intelligent document search, portfolio analysis, and comprehensive Braintrust observability with custom scoring metrics for AI operations monitoring and evaluation.

## Tech Stack
- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Crimson Text font
- **Database**: Weaviate Vector Database
- **AI**: Claude 3.5 Sonnet via Anthropic SDK
- **AI Observability**: Braintrust for tracing and evaluation
- **Search**: Hybrid BM25 + Semantic Search
- **Deployment**: Vercel with SSO protection
- **Analytics**: Google Looker Studio (embedded)

## Architecture & Design

### Core Components

#### 1. Search System (`/api/search-optimized`)
- **Hybrid Search**: Combines keyword (BM25) and semantic vector search
- **Query Enhancement**: Automatic expansion with relevant financial terms
- **Result Processing**: Deduplication, confidence scoring, financial extraction
- **AI Synthesis**: Claude generates contextual answers with source citations

#### 2. Enhanced Braintrust Integration
- **Automatic Tracing**: All AI operations logged to VeronaAI project with rich metadata
- **Custom Scoring Metrics**: Relevance, completeness, accuracy, response time, token efficiency
- **Advanced Features**: Nested operations, error tracking with stack traces, user/session tracking
- **Integration Methods**:
  - Enhanced tracing (`lib/braintrust-enhanced.ts`) with custom scoring
  - Simple logging (`lib/braintrust-simple.ts`) for basic operations
  - Direct SDK (`lib/braintrust.ts`) for core functionality
  - Vercel AI SDK wrapper (`lib/claude-vercel-ai.ts`) for streaming
- **Test Framework**: Comprehensive test endpoints for validation and debugging

#### 3. Optimized Weaviate Service (`lib/weaviate-optimized.ts`)
- **Primary Collection**: `VC_PE_Claude97_Optimized_Production` (enhanced schema)
- **Legacy Collection**: `VC_PE_Claude97_Production` (fallback compatibility)
- **Search Modes**: Semantic (BM25), hybrid, filtered search with financial criteria
- **Enhanced Schema**: Structured financial data extraction with Claude analysis
- **Field Filtering**: Company, document type, industry, investment amounts, valuations, ownership
- **Confidence Scoring**: Extraction confidence with quality thresholds
- **Statistics & Analytics**: Comprehensive document and financial metrics

### Enhanced Data Flow
1. User submits natural language query via `/api/search-optimized`
2. Query enhanced with VC/PE financial context and keywords
3. Weaviate performs intelligent search (hybrid/semantic/filtered) on optimized collection
4. Results processed with structured financial data extraction
5. Company grouping and financial aggregation
6. Claude synthesizes contextual answer with source citations
7. All operations traced to Braintrust with custom scoring metrics
8. Response returned with confidence levels, metadata, and performance scores

## API Endpoints

### `/api/search-optimized` (POST)
Primary enhanced search endpoint with advanced Braintrust tracing and scoring.
```typescript
{
  query: string
  filters?: {
    company?: string
    documentType?: string
    industry?: string
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
  searchType?: 'semantic' | 'hybrid' | 'filtered'
  useOptimizedCollection?: boolean
}
```

### `/api/search-vercel-ai` (POST)
Alternative using Vercel AI SDK with automatic Braintrust wrapping.

### `/api/extract-companies` (GET)
Returns enriched company data with calculated financials.

### Test Endpoints (Development)
- `/api/test-braintrust-direct`: Direct Braintrust API testing
- `/api/debug-braintrust`: Connection diagnostics
- `/api/test-enhanced-tracing`: Enhanced tracing with custom scoring metrics
  - Supports simple, complex, and error test scenarios
  - Demonstrates nested operations and sub-spans
  - Shows custom scoring calculations in action

## Data Schema

### Enhanced Search Result Structure
```typescript
interface SearchResult {
  id: string
  company: string
  industry: string
  documentType: string
  content: string
  claudeExtraction: string

  // Financial Data (from optimized schema)
  investmentAmount: number
  preMoneyValuation: number
  postMoneyValuation: number
  fairValue: number
  ownershipPercentage: number

  // Content Analysis Flags
  hasInvestmentAmount: boolean
  hasValuation: boolean
  hasOwnership: boolean
  hasFairValue: boolean

  // Quality Metrics
  extractionConfidence: number
  score: number
  chunkId: string
}
```

### Enhanced AI Response Format
```typescript
interface AIResponse {
  success: boolean
  query: string
  enhancedQuery: string
  results: SearchResult[]
  companyGroups: CompanyGroup[]
  aiAnswer: string
  confidence: 'high' | 'medium' | 'low'
  sources: Source[]
  totalResults: number
  searchType: string
  filters: FilterCriteria
  useOptimizedCollection: boolean
  metadata: {
    hasStructuredData: boolean
    averageConfidence: number
    companiesWithInvestmentAmount: number
    companiesWithValuation: number
    companiesWithOwnership: number
    averageInvestmentAmount: number
    averageValuation: number
  }
}
```

## Environment Configuration

### Required Variables
```env
# Weaviate
NEXT_PUBLIC_WEAVIATE_SCHEME=https
NEXT_PUBLIC_WEAVIATE_HOST=[your-host]
WEAVIATE_API_KEY=[your-key]

# AI Services
ANTHROPIC_API_KEY=[claude-api]
OPENAI_API_KEY=[embeddings-optional]

# Observability
BRAINTRUST_API_KEY=[braintrust-key]

# Collections
NEXT_PUBLIC_OPTIMIZED_COLLECTION_NAME=VC_PE_Claude97_Optimized_Production
NEXT_PUBLIC_LEGACY_COLLECTION_NAME=VC_PE_Claude97_Production
```

## UI/UX Design System

### Color Palette
- Background: `#fbf9f5` (warm off-white)
- Primary: `#18181b` (near black)
- Secondary: `#71717a` (gray)
- Borders: `#e4e4e7` (light gray)
- Accent: `#3b82f6` (blue hover)

### Component Patterns
- Minimalist buttons with hover states
- Expandable results (5 → all)
- Confidence indicators (high/medium/low)
- Loading skeletons for async operations
- Empty states with helpful messages

## Deployment & Operations

### Vercel Configuration
- **SSO Protection**: Enabled for API and frontend
- **Environment Variables**: Configured in dashboard
- **Auto-deploy**: On push to `clean-portfolio-companies` branch
- **Build Optimization**: Cached dependencies, parallel builds

### Enhanced Monitoring & Observability
- **Braintrust Dashboard**: https://www.braintrust.dev/app
- **Project**: VeronaAI (ID: `33b48cef-bb63-4500-995b-b4633530045f`)
- **Enhanced Traces Include**:
  - Custom scoring metrics (relevance, completeness, accuracy, performance)
  - Rich metadata (userId, sessionId, feature tags, environment)
  - Nested operations with clear span names
  - Error tracking with full stack traces
  - Financial data context and extraction confidence
  - Real-time performance monitoring and alerting

### Development Commands
```bash
npm run dev          # Local development
npm run build        # Production build
npm run lint         # ESLint checks
npm run typecheck    # TypeScript validation
```

## Performance Optimizations
- Intelligent result limiting with company grouping
- Advanced deduplication by chunk ID and content similarity
- Optimized Claude temperature (0.1) for consistent responses
- Enhanced Weaviate connection pooling
- Query context enhancement for better semantic matching
- Structured financial data aggregation
- Streaming responses with Braintrust tracing
- Custom scoring calculations for performance monitoring

## Security Considerations
- Vercel SSO for authentication
- Environment variables secured
- No hardcoded credentials
- HTTPS enforced
- API rate limiting via Vercel

## Recent Major Enhancements

### Enhanced Braintrust Integration (Latest)
- **Custom Scoring Metrics**: Automatic calculation of relevance, completeness, accuracy, and performance scores
- **Rich Metadata Tracking**: User sessions, feature flags, financial context, environment details
- **Advanced Error Handling**: Full stack trace capture with meaningful error categorization
- **Nested Operation Support**: Sub-operations and complex workflow tracing
- **Test Framework**: Comprehensive test endpoints for validation and debugging

### Optimized Weaviate Collection
- **New Schema**: `VC_PE_Claude97_Optimized_Production` with enhanced financial data structure
- **Structured Data Extraction**: Investment amounts, valuations, ownership percentages with confidence scoring
- **Advanced Filtering**: Multi-criteria filtering by financial thresholds and content analysis flags
- **Industry Classification**: Enhanced company and document categorization
- **Statistics API**: Comprehensive analytics and document metrics

### Search API Architecture
- **Query Enhancement**: Automatic expansion with VC/PE financial terminology
- **Company Grouping**: Intelligent aggregation of results by company with financial summaries
- **Multi-Modal Search**: Semantic, hybrid, and filtered search with automatic fallback
- **Performance Monitoring**: Real-time tracking of search quality and response times

### Infrastructure & DevOps
- Resolved all TypeScript compilation errors
- Enhanced deployment pipeline with proper environment variable management
- Vercel AI SDK integration with Braintrust wrapper
- Production-ready error handling and logging

This documentation provides comprehensive technical context for maintaining and extending the VC Pipeline Frontend application with its advanced AI observability, enhanced search capabilities, and production-ready monitoring infrastructure. The system now features sophisticated financial data analysis, custom scoring metrics, and comprehensive tracing for optimal performance and reliability.