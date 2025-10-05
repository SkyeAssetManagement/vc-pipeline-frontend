# VC Pipeline Frontend - Code Documentation

## Project Overview
AI-powered venture capital portfolio management platform featuring:
- DSPy-style self-improving RAG system
- Dynamic field extraction without predefined schemas
- Weaviate vector database with Voyage-3 embeddings
- Braintrust observability for intelligent document search

## Tech Stack
- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript
- **Database**: Weaviate Cloud (Hybrid Search)
- **AI Models**:
  - Claude Sonnet 4 (RAG synthesis)
  - Claude 3.5 Sonnet (field extraction)
- **Embeddings**: Voyage-3 (contextual chunking)
- **Optimization**: DSPy TypeScript implementation
- **Observability**: Braintrust
- **Deployment**: Vercel

## Architecture & Design

### Core Systems

#### 1. Dynamic RAG System (NEW)
**LLM-driven field extraction without schemas:**
- **Adaptive Extraction**: Claude determines relevant fields per document
- **Document Types**: Automatically classifies (pitch_deck, financial_report, etc.)
- **No Fixed Schema**: 122+ unique fields discovered dynamically
- **Collections**:
  - `DynamicCompanies`: 18 docs with dynamic fields
  - `DynamicCompaniesComplete`: Full ingestion with Voyage embeddings

#### 2. DSPy-Style Optimization
**Self-improving multi-stage pipeline:**
- **Intent Classification**: Categorizes queries
- **Query Enhancement**: Preserves entities while adding context
- **Document Retrieval**: Weaviate hybrid search
- **Document Reranking**: AI-powered relevance scoring
- **Answer Generation**: Claude synthesis with confidence

**Optimization Process:**
- Collects high-confidence queries as training examples
- Triggers after 50+ examples
- Performance metrics: Relevance (30%), Completeness (25%), Accuracy (25%), Source Quality (20%)

#### 3. Search System
**Three search endpoints:**
- `/api/search-optimized`: Standard Weaviate search
- `/api/search-dspy`: DSPy-enhanced with learning
- `/api/search`: Legacy endpoint

### Data Processing Pipeline

#### Document Ingestion (VC-Pipeline Backend)
1. **PDF Processing**: PyPDF2 extraction
2. **Dynamic Field Extraction**: Claude analyzes content
3. **Embedding Generation**: Voyage-3 contextual embeddings
4. **Weaviate Storage**: With extracted fields as JSON

**Processed Companies:**
- Advanced Navigation: 9+ documents
- Wonde: 9+ documents

### Weaviate Collections
- `VC_PE_Claude97_Production`: Fixed 97-field schema
- `DynamicCompanies`: Dynamic schema collection
- `DynamicCompaniesComplete`: Production with Voyage-3

## API Endpoints

### `/api/search-dspy` (POST)
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
```typescript
{
  query: string,
  searchType: 'hybrid',
  useOptimizedCollection: boolean
}
```

## Dynamic Field Extraction Examples

### Legal Documents
- `company_acn`, `warrant_details`, `amendment_date`

### Investment Memos
- `round_size: USD $60M`
- `pre_money_valuation: USD $250M`
- `use_of_funds: {sales: 40%, r&d: 40%}`

### Company Updates
- `employee_count: 200`
- `revenue_growth: 83% YoY`
- `key_customers: [Tesla, Lockheed Martin]`

## Environment Configuration

```env
# Weaviate
WEAVIATE_URL=[weaviate-cloud-url]
WEAVIATE_API_KEY=[api-key]

# AI Services
ANTHROPIC_API_KEY=[claude-api]
VOYAGE_API_KEY=[voyage-embeddings]
OPENAI_API_KEY=[openai-api]

# Monitoring
BRAINTRUST_API_KEY=[braintrust-key]
```

## Backend Scripts (vc-pipeline/)

### Dynamic RAG Scripts
- `dynamic_rag_wcs.py`: Main dynamic extraction system
- `ingest_all_dynamic.py`: Bulk PDF ingestion
- `complete_dynamic_ingestion.py`: Full pipeline with Voyage
- `verify_dynamic_collection.py`: Collection verification

### Key Features
- No predefined schema constraints
- Adaptive field extraction based on content
- DSPy optimization ready
- Voyage-3 contextual embeddings

## Performance Metrics

### Search Performance
- **Standard Search**: ~10 seconds
- **DSPy Initial**: ~30 seconds
- **DSPy Optimized**: ~15 seconds
- **Dynamic RAG**: ~12 seconds with Voyage

### Extraction Statistics
- **Documents Processed**: 18+
- **Unique Fields Discovered**: 122
- **Extraction Success Rate**: 95%
- **Average Fields per Doc**: 6-12

## Recent Updates (October 2024)

### Dynamic RAG Implementation
- Created schema-free extraction system
- Integrated Voyage-3 embeddings
- Processed Advanced Navigation & Wonde docs
- Achieved 122 unique field discovery

### DSPy Integration
- TypeScript-native optimization
- Multi-stage RAG pipeline
- Self-learning system
- Braintrust integration

## Development Workflow

```bash
# Frontend
cd vc-pipeline-frontend
npm run dev  # Port 3000/3001/3002

# Backend Processing
cd vc-pipeline
python ingest_all_dynamic.py  # Dynamic extraction
python verify_dynamic_collection.py  # Verify results
```

## Directory Structure

```
vc-pipeline-frontend/
├── app/
│   ├── api/
│   │   ├── search-dspy/
│   │   └── search-optimized/
│   └── page.tsx
├── lib/
│   ├── dspy/
│   ├── claude.ts
│   └── weaviate.ts
└── components/

vc-pipeline/
├── dynamic_rag_wcs.py
├── ingest_all_dynamic.py
├── complete_dynamic_ingestion.py
└── upswell_companies/
    ├── 1_advanced_navigation/
    └── 2_wonde/
```

## Key Achievements

1. **Dynamic Field Extraction**: No rigid schemas, adaptive to content
2. **Voyage-3 Integration**: Superior contextual understanding
3. **DSPy Optimization**: Self-improving RAG system
4. **Production Ready**: 18+ documents successfully processed

This documentation provides comprehensive technical context for the VC Pipeline with dynamic RAG capabilities.