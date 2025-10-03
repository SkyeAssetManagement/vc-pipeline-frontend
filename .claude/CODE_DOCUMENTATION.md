# VC Pipeline Frontend - Code Documentation

## Project Overview
AI-powered venture capital portfolio management platform with DSPy-style self-improving RAG system, Weaviate vector database integration, and comprehensive Braintrust observability for intelligent document search and portfolio analysis.

## Tech Stack
- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Weaviate Vector Database (Hybrid Search)
- **AI**: Claude Sonnet 4 (claude-sonnet-4-20250514)
- **Optimization**: DSPy-style TypeScript implementation
- **Observability**: Braintrust for tracing and evaluation
- **Deployment**: Vercel

## Architecture & Design

### Core Systems

#### 1. DSPy-Style RAG Optimization (`/lib/dspy/`)
**Self-improving multi-stage pipeline:**
- **Intent Classification**: Categorizes queries (factual/analytical/comparison)
- **Query Enhancement**: Preserves entity names while adding context
- **Document Retrieval**: Weaviate hybrid search (BM25 + vector)
- **Document Reranking**: AI-powered relevance scoring (top 15)
- **Answer Generation**: Claude synthesis with confidence scoring

**Optimization Process:**
- Collects high-confidence queries as training examples
- Triggers optimization after 50+ examples
- Monitors performance with weighted metrics:
  - Relevance (30%), Completeness (25%)
  - Accuracy (25%), Source Quality (20%)
- Auto-retrains on: model changes, 15% performance drops, daily schedule

#### 2. Search System
**Three search endpoints:**
- `/api/search-optimized`: Standard Weaviate search
- `/api/search-dspy`: DSPy-enhanced with optimization
- `/api/search`: Legacy endpoint

**Features:**
- Query enhancement with VC/PE terminology
- Company grouping and deduplication
- Financial data extraction
- Confidence scoring

#### 3. Weaviate Integration
**Collections:**
- `VC_PE_Claude97_Production`: Primary document store
- `VC_PE_Claude97_Optimized_Production`: Performance-optimized

**Search Modes:**
- Semantic (vector similarity)
- BM25 (keyword matching)
- Hybrid (combined approach)

### Data Flow
1. User query → DSPy toggle check
2. If DSPy: Intent → Enhancement → Search → Rerank → Generate
3. If Standard: Enhancement → Search → Generate
4. Results → Braintrust logging → Response

## API Endpoints

### `/api/search-dspy` (POST)
DSPy-optimized search with learning capabilities.
```typescript
{
  query: string,
  filters?: object,
  userId: string,
  sessionId: string
}
// Returns: answer, sources, confidence, optimizationStatus
```

### `/api/search-optimized` (POST)
Standard optimized search.
```typescript
{
  query: string,
  filters?: object,
  searchType: 'hybrid',
  useOptimizedCollection: boolean
}
```

## DSPy Implementation Details

### Configuration (`lib/dspy/config.ts`)
```typescript
{
  llm: 'claude-sonnet-4-20250514',
  retriever: 'weaviate-hybrid',
  optimizer: 'BootstrapFewShotWithRandomSearch',
  maxBootstrapExamples: 20,
  validationSplitRatio: 0.2
}
```

### Optimization Triggers
- **Model Change**: Automatic reoptimization
- **Performance Drop**: >15% decline triggers retraining
- **Schedule**: Daily optimization
- **Manual**: Via API endpoint
- **Training Threshold**: 50 examples minimum

### Performance Metrics
- **Standard Search**: ~10 seconds
- **DSPy Initial**: ~30 seconds
- **DSPy Optimized**: ~15 seconds

## Frontend Components

### Main Interface (`app/page.tsx`)
- DSPy toggle with status display
- Search bar with suggestions
- Results with confidence indicators
- Optimization metrics panel

### DSPy Toggle Features
- Real-time status updates
- Training example counter
- Performance score display
- Model version indicator

## Environment Configuration

```env
# Weaviate
NEXT_PUBLIC_WEAVIATE_HOST=[weaviate-cloud-url]
WEAVIATE_API_KEY=[api-key]

# AI Services
ANTHROPIC_API_KEY=[claude-api]
VOYAGE_API_KEY=[embeddings]

# Monitoring
BRAINTRUST_API_KEY=[braintrust-key]
```

## Testing Guide

### DSPy Testing
1. Enable DSPy toggle at http://localhost:3002
2. Test queries:
   - "How much did Upswell invest in Riparide?"
   - "Show me portfolio companies"
   - "Compare investment terms"
3. Monitor optimization status
4. After 50 queries, optimization triggers

### A/B Comparison
- Run same query with DSPy ON/OFF
- Compare response times and quality
- Check confidence levels

## Recent Updates

### DSPy Integration (Oct 2024)
- Implemented TypeScript-native DSPy optimization
- Fixed query enhancement to preserve entity names
- Added multi-stage RAG pipeline
- Created self-learning system

### Model Updates
- Upgraded to Claude Sonnet 4
- Improved prompt engineering
- Enhanced confidence scoring

## Known Issues & Solutions

### DSPy Query Enhancement
**Issue**: Claude returning explanatory text instead of enhanced query
**Solution**: Simplified to preserve original query exactly

### Weaviate Schema Mismatch
**Issue**: Different collections have different field schemas
**Solution**: Use `VC_PE_Claude97_Production` as primary

## Development Workflow

```bash
# Install dependencies
npm install

# Run development server
npm run dev  # Starts on port 3000/3001/3002

# Build for production
npm run build

# Run linting
npm run lint
```

## Performance Optimizations
- Document reranking with 500-char preview
- Top 15 document selection
- Query preservation in enhancement
- Company result grouping
- Intelligent deduplication

## Monitoring & Observability
- **Braintrust**: All operations traced
- **Metrics**: Custom scoring for quality
- **Errors**: Full stack trace capture
- **Performance**: Response time tracking

## Security
- Vercel SSO authentication
- Environment variables secured
- No hardcoded credentials
- HTTPS enforced
- API rate limiting

## Directory Structure
```
vc-pipeline-frontend/
├── app/
│   ├── api/
│   │   ├── search/
│   │   ├── search-dspy/
│   │   └── search-optimized/
│   └── page.tsx
├── lib/
│   ├── dspy/
│   │   ├── config.ts
│   │   ├── modules-native.ts
│   │   ├── optimizer-native.ts
│   │   └── rag-service.ts
│   ├── claude.ts
│   ├── weaviate.ts
│   └── braintrust-enhanced.ts
└── components/
    └── search/
        └── SearchBar.tsx
```

This documentation provides comprehensive technical context for the VC Pipeline Frontend with DSPy-style self-improving RAG capabilities.