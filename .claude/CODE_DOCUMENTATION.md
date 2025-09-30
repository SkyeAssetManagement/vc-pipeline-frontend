# VC Pipeline Frontend - Code Documentation

## Project Overview
AI-powered venture capital portfolio management platform with Weaviate vector database integration for intelligent document search, portfolio analysis, and Braintrust observability for AI operations monitoring.

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

#### 2. Braintrust Integration
- **Automatic Tracing**: All AI operations logged to VeronaAI project
- **Metrics Captured**: Query latency, token usage, search relevance
- **Three Integration Methods**:
  - Simple logging (`lib/braintrust-simple.ts`)
  - Direct SDK (`lib/braintrust.ts`)
  - Vercel AI SDK wrapper (`lib/claude-vercel-ai.ts`)

#### 3. Weaviate Service (`lib/weaviate-optimized.ts`)
- **Collection**: `VC_PE_Claude97_Production`
- **Search Modes**: Vector, keyword, hybrid
- **Field Filtering**: Company, document type, financial metrics
- **Confidence Scoring**: Based on extraction quality

### Data Flow
1. User submits natural language query
2. Query enhanced with financial context
3. Weaviate performs hybrid search
4. Results deduplicated and enriched
5. Claude synthesizes answer with sources
6. All operations traced to Braintrust
7. Response returned with confidence score

## API Endpoints

### `/api/search-optimized` (POST)
Primary search endpoint with Braintrust tracing.
```typescript
{
  query: string
  limit?: number
  filters?: {
    company?: string
    documentType?: string
    minInvestment?: number
    maxInvestment?: number
    // ... additional filters
  }
}
```

### `/api/search-vercel-ai` (POST)
Alternative using Vercel AI SDK with automatic Braintrust wrapping.

### `/api/extract-companies` (GET)
Returns enriched company data with calculated financials.

### Test Endpoints (Development)
- `/api/test-braintrust-direct`: Direct Braintrust API testing
- `/api/debug-braintrust`: Connection diagnostics

## Data Schema

### Search Result Structure
```typescript
interface SearchResult {
  id: string
  company: string
  documentType: string
  investmentAmount: number
  preMoneyValuation: number
  postMoneyValuation: number
  ownershipPercentage: number
  fairValue: number
  multipleOnInvestedCapital: number
  internalRateOfReturn: number
  extractionConfidence: number
  score: number
}
```

### AI Response Format
```typescript
interface AIResponse {
  answer: string
  confidence: 'high' | 'medium' | 'low'
  sources: number
  companiesCount: number
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

# Collection
NEXT_PUBLIC_OPTIMIZED_COLLECTION_NAME=VC_PE_Claude97_Production
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

### Monitoring
- **Braintrust Dashboard**: https://www.braintrust.dev/app
- **Project ID**: `33b48cef-bb63-4500-995b-b4633530045f`
- **Traces Include**: Search queries, AI responses, performance metrics

### Development Commands
```bash
npm run dev          # Local development
npm run build        # Production build
npm run lint         # ESLint checks
npm run typecheck    # TypeScript validation
```

## Performance Optimizations
- Result limiting (default 20, expandable)
- Deduplication by document ID
- Low temperature (0.1) for consistent AI responses
- Cached Weaviate connections
- Streaming responses where applicable

## Security Considerations
- Vercel SSO for authentication
- Environment variables secured
- No hardcoded credentials
- HTTPS enforced
- API rate limiting via Vercel

## Recent Enhancements
- Integrated Braintrust for AI observability
- Added Vercel AI SDK support
- Fixed TypeScript build errors
- Implemented proper project ID handling
- Enhanced error logging and diagnostics

This documentation provides complete technical context for maintaining and extending the VC Pipeline Frontend application with its AI observability layer.