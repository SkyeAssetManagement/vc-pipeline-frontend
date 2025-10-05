# VC Pipeline Frontend - Code Documentation

## Project Overview
AI-powered venture capital portfolio management platform with semantic document search, dynamic metadata extraction, and DSPy-optimized RAG pipeline.

## Tech Stack
- **Framework**: Next.js 14.2.32 (App Router, TypeScript)
- **Vector Database**: Weaviate Cloud (SmartExtraction collection)
- **AI Models**:
  - Claude Sonnet 4.5 (claude-sonnet-4-5-20250929) - Answer synthesis & metadata extraction
  - Voyage-3 (1024-dim embeddings) - Semantic search
- **Optimization**: DSPy RAG pipeline with automatic reranking
- **Observability**: Braintrust (response time tracking, model versioning)
- **Deployment**: Vercel

## Core Architecture

### 1. SmartExtraction Collection (Active)
**Schema-free document storage with Voyage-3 embeddings**

**Fields:**
- `content`: Document text chunks (vectorized with Voyage-3)
- `company_name`: Company identifier (filterable)
- `document_type`: Extracted document category
- `file_path`: Original document location
- `chunk_id`: Unique chunk identifier (UUID)
- `chunk_index`: Sequential position in document
- `section_type`: Document section (intro, financials, terms, etc.)
- `round_info`: Investment round details (Series A, Seed, etc.)
- `extracted_fields`: **Dynamic JSON metadata** - schema-free!
- `token_count`: Chunk size in tokens
- `created_at`: ISO 8601 ingestion timestamp

**Configuration:**
- Vectorizer: `text2vec-voyageai`
- Model: `voyage-3`
- Vector dimension: 1024
- Truncation: Enabled
- Collection name: Configured via `NEXT_PUBLIC_OPTIMIZED_COLLECTION_NAME`

### 2. Search Endpoints

#### Primary: `/api/search` (DSPy-Enhanced)
**POST request with DSPy optimization**

```typescript
{
  query: string,
  filters?: { company?: string, documentType?: string },
  searchType?: 'semantic' | 'hybrid', // default: hybrid
  userId?: string,
  sessionId?: string
}

// Response:
{
  success: true,
  query: string,
  enhancedQuery: string,        // DSPy query enhancement
  intent: string,                // Query classification
  entities: string[],            // Extracted entities
  results: SearchResult[],       // Reranked by DSPy
  aiAnswer: string,              // Claude-synthesized answer
  confidence: 'high' | 'medium' | 'low',
  sources: string[],
  totalResults: number,
  responseTimeMs: number,        // Performance tracking
  modelVersion: string,          // claude-sonnet-4-5-20250929
  timestamp: string              // ISO 8601
}
```

**DSPy Pipeline Flow:**
1. **Intent Classification** - Categorize query type (factual/analytical/comparison)
2. **Entity Extraction** - Identify companies, investors, document types
3. **Query Enhancement** - Preserve original query for accuracy
4. **Hybrid Search** - Weaviate search (alpha=0.7)
5. **Document Reranking** - Claude reranks top 20 → top 15 most relevant
6. **Answer Generation** - Claude synthesizes comprehensive response
7. **Braintrust Tracking** - Log all metrics

#### Alternative: `/api/search-optimized`
**Direct Weaviate search without DSPy layer**

Supports same interface but skips DSPy reranking. Useful for:
- Faster searches (no reranking overhead)
- Direct result access
- Filtered searches by metadata

### 3. Weaviate Services

#### `lib/weaviate.ts` - Primary Service
```typescript
class WeaviateService {
  static async semanticSearch(query, filters)
  // Pure vector similarity (Voyage-3)

  static async hybridSearch(query, alpha = 0.7)
  // Combines vector + BM25 keyword
  // alpha: 0.0 = pure BM25, 1.0 = pure vector

  static async getCompanies(filters)
  // List all companies (legacy Company collection)
}
```

#### `lib/weaviate-optimized.ts` - Extended Service
```typescript
class OptimizedWeaviateService {
  static async searchWithFilters(query, filters)
  // Filtered hybrid search by:
  // - company_name
  // - document_type
  // - section_type
  // - round_info

  static async getDocumentStats()
  // Collection statistics:
  // - Total chunks
  // - Unique companies
  // - Document types
  // - Section types
}
```

### 4. DSPy RAG Pipeline

#### `lib/dspy/rag-service.ts` - Main Service
```typescript
class DSPyEnhancedRAGService {
  async search(query, filters, userId, sessionId)
  // Full DSPy-optimized pipeline

  async triggerOptimization()
  // Retrain pipeline with collected examples

  getPipelineStatus()
  // Check optimization state
}
```

**Automatic Optimization Triggers:**
- Performance drop > 15%
- Scheduled interval (24 hours)
- Model change detected
- Min 50 training examples collected

#### `lib/dspy/modules-native.ts` - Pipeline Modules
```typescript
class OptimizedRAGPipeline {
  async forward(query, filters)
  // Execute full pipeline:
  // 1. Intent classification
  // 2. Query enhancement
  // 3. Document retrieval
  // 4. Reranking
  // 5. Answer generation

  async addTrainingExample(task, input, output, score)
  // Collect examples for optimization
}
```

### 5. Claude Answer Synthesis

#### `lib/claude.ts` - Answer Generation
```typescript
class ClaudeService {
  static async generateAnswer(query, results, companyGroups)
  // Synthesizes comprehensive answer from search results

  // Process:
  // 1. Group results by company
  // 2. Format context for Claude (max 10 docs)
  // 3. Call Claude Sonnet 4.5 (temp=0.1 for factual)
  // 4. Extract sources from results
  // 5. Determine confidence based on result count + content

  // Returns: { answer, confidence, sources }
}
```

**Confidence Scoring:**
- **High**: 5+ results, contains specific data ($, numbers, companies)
- **Medium**: 2-5 results, general information
- **Low**: 0-2 results or vague answer

### 6. Document Ingestion Pipeline

#### `scripts/ingest-documents.js`
**Full PDF processing pipeline**

```javascript
async function processPDF(pdfPath, companyName) {
  // 1. Extract text from PDF
  const text = await extractTextFromPDF(pdfPath)

  // 2. Extract metadata with Claude Sonnet 4.5
  const metadata = await extractMetadata(text, fileName, companyName)
  // Returns: { document_type, round_info, custom_fields }

  // 3. Chunk text (1000 chars, 200 overlap)
  const chunks = chunkText(text, 1000, 200)

  // 4. Generate Voyage-3 embeddings
  const embeddings = await generateEmbeddings(chunks)

  // 5. Batch insert to Weaviate (100 chunks/batch)
  await batchInsertChunks(chunks, embeddings, metadata)
}
```

**Metadata Extraction:**
Claude analyzes first 2000 chars + filename to extract:
- Document type (pitch_deck, term_sheet, financial_report, etc.)
- Round information (Series A, Seed, etc.)
- Custom fields based on content type

**Example Extracted Metadata:**
```json
{
  "document_type": "term_sheet",
  "round_info": "Series A",
  "total_raise_amount": 15000000,
  "pre_money_valuation": 65000000,
  "investors": ["Arrochar Pty Ltd"],
  "share_class": "Preference A"
}
```

### 7. Braintrust Observability

#### `lib/braintrust-enhanced.ts`
**Comprehensive tracking with response time metrics**

```typescript
await tracedOperation(
  operationName: string,
  callback: async () => T,
  metadata?: {
    input, userId, sessionId, feature,
    searchType, companyName, documentType
  },
  calculateScores?: (result) => {
    relevance: number,
    completeness: number,
    responseTime: number
  }
)
```

**Tracked Metrics:**
- **Search Quality**: Result count, relevance, search type
- **AI Synthesis**: Answer length, confidence, source count
- **Performance**: Response time (ms), token efficiency
- **Context**: User ID, session ID, feature flags
- **Environment**: Deployment URL, Vercel region, NODE_ENV

**Score Functions:**
```typescript
calculateSearchRelevance(query, results, confidence)
// Factors: has results (0.3) + result count (0.3) + confidence (0.4)

calculateCompleteness(answer, sources)
// Factors: length (0.5) + sources (0.3) + structure (0.2)
```

### 8. Environment Configuration

**Required Variables:**
```env
# Weaviate
NEXT_PUBLIC_WEAVIATE_SCHEME=https
NEXT_PUBLIC_WEAVIATE_HOST=[instance].weaviate.cloud
WEAVIATE_API_KEY=[api-key]
NEXT_PUBLIC_OPTIMIZED_COLLECTION_NAME=SmartExtraction

# AI Services
ANTHROPIC_API_KEY=[claude-key]
VOYAGE_API_KEY=[voyage-key]
OPENAI_API_KEY=[openai-key]

# Observability
BRAINTRUST_API_KEY=[braintrust-key]
```

**Vercel Deployment:**
All environment variables must be set in Vercel dashboard:
- Project Settings → Environment Variables
- Set for **Production** environment
- Redeploy after adding variables

## Data Flow

### Query Execution (DSPy-Enhanced)
```
User Query
    ↓
/api/search endpoint
    ↓
DSPyEnhancedRAGService.search()
    ↓
├─ Intent Classification (Claude)
├─ Entity Extraction
├─ Query Enhancement
├─ Weaviate Hybrid Search (alpha=0.7)
├─ Document Reranking (Claude)
└─ Answer Synthesis (Claude Sonnet 4.5)
    ↓
Response + Braintrust Tracking
```

### Document Ingestion
```
PDF File
    ↓
extractTextFromPDF() → text
    ↓
extractMetadata() → Claude analysis → metadata JSON
    ↓
chunkText() → 1000-char chunks (200 overlap)
    ↓
generateEmbeddings() → Voyage-3 vectors (1024-dim)
    ↓
batchInsertChunks() → Weaviate SmartExtraction
```

## Key Design Principles

### 1. Schema-Free Architecture
- No predefined field constraints
- `extracted_fields` JSON adapts to content
- Each document can have unique metadata
- Claude determines relevant fields automatically

### 2. DSPy Optimization
- Automatic pipeline improvement over time
- Collects high-quality query examples
- Retrains on performance drops
- Adapts to new document types

### 3. Performance Tracking
- Every query logged with response time
- Model version tracked for A/B testing
- Confidence calibration for quality
- Braintrust integration for analysis

### 4. Hybrid Search Strategy
- Vector search (Voyage-3) for semantic meaning
- BM25 keyword search for exact matches
- Alpha=0.7 balances both (70% vector, 30% keyword)
- Best for VC/PE document retrieval

### 5. Production-Ready Error Handling
- Graceful fallbacks for Claude failures
- Skip corrupted/empty PDFs during ingestion
- Batch retries for Weaviate operations
- Comprehensive logging at all layers

## Performance Benchmarks

**Search Latency (October 2025):**
- DSPy-enhanced search: ~5-7 seconds
  - Intent classification: ~1s
  - Weaviate search: ~1s
  - Reranking: ~2s
  - Answer synthesis: ~2s
- Direct search (no DSPy): ~2-3 seconds

**Ingestion Performance:**
- Single PDF: ~5-10 seconds
- Metadata extraction: ~2-3s (Claude)
- Embedding generation: ~1-2s (Voyage-3)
- Weaviate insertion: ~1s (batched)

**Current Data Scale:**
- Documents: 72 PDFs
- Chunks: 1,241 embedded chunks
- Companies: 3 active
- Avg chunk size: ~850 characters
- Unique extracted field types: 100+

## Directory Structure

```
vc-pipeline-frontend/
├── app/api/
│   ├── search/route.ts              # DSPy-enhanced search (primary)
│   ├── search-optimized/route.ts    # Direct Weaviate search
│   ├── search-dspy/route.ts         # DSPy experimental endpoint
│   └── test/route.ts                # SmartExtraction health check
├── lib/
│   ├── weaviate.ts                  # Primary Weaviate service
│   ├── weaviate-optimized.ts        # Extended with filters
│   ├── claude.ts                    # Answer synthesis
│   ├── braintrust-enhanced.ts       # Observability tracking
│   └── dspy/
│       ├── rag-service.ts           # DSPy RAG service
│       ├── modules-native.ts        # Pipeline implementation
│       ├── optimizer-native.ts      # Training & optimization
│       └── config.ts                # DSPy configuration
├── scripts/
│   ├── create-smart-extraction-collection.ts  # Collection setup
│   ├── ingest-documents.js          # Main ingestion pipeline
│   └── test-single-doc.js           # Single document test
├── config/
│   └── weaviate.config.ts           # Weaviate client config
└── .env.local / .env.production     # Environment variables
```

## Recent Updates (October 2025)

### SmartExtraction Migration
- ✅ Created Voyage-3 collection with dynamic metadata
- ✅ Migrated all endpoints to SmartExtraction
- ✅ Updated Claude to Sonnet 4.5 (claude-sonnet-4-5-20250929)
- ✅ Fixed DSPy hybrid search alpha parameter
- ✅ Added response time tracking for evaluation
- ✅ Deployed to Vercel with environment variables

### Performance Improvements
- Response time metrics on all endpoints
- Model version tracking for A/B testing
- Braintrust integration for production monitoring
- Timestamp logging (ISO 8601)

## Development Workflow

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Create SmartExtraction collection
npx ts-node scripts/create-smart-extraction-collection.ts

# Ingest documents
node scripts/ingest-documents.js

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

This documentation provides complete technical context for understanding, maintaining, and extending the VC Pipeline platform.
