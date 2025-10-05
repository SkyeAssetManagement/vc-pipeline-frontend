# VC Pipeline Frontend - Code Documentation

## Project Overview
AI-powered venture capital portfolio management platform with intelligent document search and dynamic metadata extraction.

## Tech Stack
- **Framework**: Next.js 14.2.32 (App Router, TypeScript)
- **Vector Database**: Weaviate Cloud
- **AI Models**: Claude Sonnet 4.5 (metadata extraction, answer synthesis)
- **Embeddings**: Voyage-3 (1024-dimensional contextual vectors)
- **Observability**: Braintrust (metrics tracking)
- **Deployment**: Vercel

## Core Architecture

### 1. SmartExtraction Collection (Active)
**Schema-free document ingestion with Voyage-3 embeddings:**

**Fields:**
- `content`: Document text chunks (vectorized)
- `company_name`: Company identifier
- `file_path`: Original document path
- `chunk_id`: Unique chunk identifier
- `chunk_index`: Position in document
- `extracted_fields`: **Dynamic JSON metadata** (no fixed schema)
- `created_at`: Ingestion timestamp

**Key Features:**
- Each document extracts unique metadata based on content
- No predefined field constraints
- Claude Sonnet 4.5 analyzes content and determines relevant fields
- Voyage-3 embeddings for semantic search

**Current Data:**
- **72 documents** ingested across 3 companies
- **1,241 chunks** with embeddings
- Companies: Advanced Navigation, Wonde, SecureStack

### 2. Search System

#### Primary Endpoint: `/api/search` (POST)
```typescript
{
  query: string,
  filters?: { company?: string, documentType?: string },
  searchType?: 'semantic' | 'hybrid',
  userId?: string,
  sessionId?: string
}

// Returns:
{
  success: true,
  results: [
    {
      id: string,
      company: string,
      content: string,
      extractedFields: object,  // Dynamic metadata!
      score: number
    }
  ],
  aiAnswer: string,            // Claude-synthesized answer
  confidence: 'high' | 'medium' | 'low',
  sources: string[]
}
```

**Search Methods:**
- **Semantic**: Vector similarity using Voyage-3 embeddings
- **Hybrid**: Combines vector + BM25 keyword search (default)

#### Search Service (`lib/weaviate.ts`)
```typescript
WeaviateService.semanticSearch(query, filters)
WeaviateService.hybridSearch(query, alpha = 0.7)
```

### 3. Document Ingestion Pipeline

#### Ingestion Script: `scripts/ingest-documents.js`

**Process Flow:**
1. **PDF Extraction**: Extract text using pdf-parse
2. **Chunking**: Split into 1000-char chunks with 200-char overlap
3. **Metadata Extraction**: Claude Sonnet 4.5 analyzes content
4. **Embedding Generation**: Voyage-3 creates semantic vectors
5. **Batch Insert**: Store in Weaviate SmartExtraction collection

**Key Functions:**
- `extractTextFromPDF(pdfPath)`: PDF to text extraction
- `extractMetadata(content, fileName, companyName)`: Claude dynamic field extraction
- `chunkText(text, chunkSize, overlap)`: Smart text chunking
- `generateEmbeddings(texts)`: Voyage-3 embedding generation
- `processPDF(pdfPath, companyName)`: Full pipeline per document

**Configuration:**
- Chunk size: 1000 characters
- Overlap: 200 characters
- Embedding model: voyage-3
- Metadata model: claude-sonnet-4-5-20250929

### 4. Dynamic Metadata Extraction

**How It Works:**
Claude analyzes document content and extracts relevant fields automatically.

**Examples by Document Type:**

**Pitch Deck:**
```json
{
  "document_type": "pitch_deck",
  "industry": "Robotics & Navigation",
  "founders": ["Xavier Orr", "Chris Shaw"],
  "total_employees": 200,
  "target_markets": ["Defense", "Mining", "Autonomous Vehicles"],
  "total_addressable_market_usd": 50000000000
}
```

**Term Sheet:**
```json
{
  "document_type": "term_sheet",
  "round_type": "Series A",
  "total_raise_amount": 15000000,
  "pre_money_valuation": 65000000,
  "share_price": 32.98,
  "investors": ["Arrochar Pty Ltd", "Main Sequence"],
  "share_class": "Preference A"
}
```

**Financial Statement:**
```json
{
  "document_type": "balance_sheet",
  "date": "2019-07-31",
  "total_assets": 2456789,
  "total_liabilities": 1234567,
  "net_assets": 1222222,
  "currency": "GBP"
}
```

**Employment Contract:**
```json
{
  "document_type": "employment_agreement",
  "employee_name": "John Smith",
  "job_title": "Senior Engineer",
  "employment_type": "Full-time",
  "ordinary_hours_per_week": 38,
  "work_location": "Sydney Office"
}
```

### 5. Weaviate Configuration

**Client Setup (`config/weaviate.config.ts`):**
```typescript
export const client = weaviate.client({
  scheme: 'https',
  host: process.env.NEXT_PUBLIC_WEAVIATE_HOST,
  apiKey: new ApiKey(process.env.WEAVIATE_API_KEY),
  headers: {
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY,
    'X-VoyageAI-Api-Key': process.env.VOYAGE_API_KEY
  }
});
```

**SmartExtraction Schema:**
- Vectorizer: `text2vec-voyageai`
- Model: `voyage-3`
- Vector dimension: 1024
- Truncation: Enabled

### 6. AI Answer Synthesis

**Process (`lib/claude.ts`):**
1. User submits query
2. Weaviate performs semantic/hybrid search
3. Top results grouped by company
4. Claude Sonnet 4.5 synthesizes comprehensive answer
5. Includes confidence score and source citations

**Claude Service:**
```typescript
ClaudeService.generateAnswer(query, results, companyGroups)
// Returns: { answer, confidence, sources }
```

### 7. Braintrust Observability

**Tracked Metrics (`lib/braintrust-enhanced.ts`):**
- Search quality scores
- Result count and relevance
- AI synthesis performance
- Confidence calibration
- Source quality metrics

**Usage:**
```typescript
await tracedOperation(
  'weaviate-hybrid-search',
  async () => await WeaviateService.hybridSearch(query),
  { input, userId, sessionId },
  (results) => ({ resultCount, hasResults, searchQuality })
);
```

## Environment Variables

```env
# Weaviate
NEXT_PUBLIC_WEAVIATE_SCHEME=https
NEXT_PUBLIC_WEAVIATE_HOST=[cloud-instance].weaviate.cloud
WEAVIATE_API_KEY=[api-key]

# AI Services
ANTHROPIC_API_KEY=[claude-api-key]
VOYAGE_API_KEY=[voyage-ai-key]
OPENAI_API_KEY=[openai-key]

# Monitoring
BRAINTRUST_API_KEY=[braintrust-key]

# Vertex AI (legacy - not currently used)
VERTEX_AI_PROJECT_ID=[project-id]
GOOGLE_APPLICATION_CREDENTIALS=[path-to-json]
```

## Key Scripts

### Collection Management
- `scripts/create-collection.js`: Create SmartExtraction collection
- `scripts/ingest-documents.js`: Full ingestion pipeline
- `scripts/test-single-doc.js`: Test embedding/insertion

### Running Ingestion
```bash
node scripts/ingest-documents.js
# Processes PDFs from:
# - C:\RyanCode\VeronaAI\vc-pipeline\upswell_companies\1_advanced_navigation
# - C:\RyanCode\VeronaAI\vc-pipeline\upswell_companies\2_wonde
# - C:\RyanCode\VeronaAI\vc-pipeline\upswell_companies\3_securestack
```

## Directory Structure

```
vc-pipeline-frontend/
├── app/
│   ├── api/
│   │   ├── search/route.ts          # Main search endpoint
│   │   ├── extract-companies/       # Company extraction
│   │   └── inspect-*/               # Schema inspection
│   ├── companies/                   # Company pages
│   └── page.tsx                     # Home page
├── lib/
│   ├── weaviate.ts                  # Weaviate service layer
│   ├── claude.ts                    # Claude answer synthesis
│   ├── braintrust-enhanced.ts       # Metrics tracking
│   └── dspy/                        # DSPy optimization (experimental)
├── components/
│   └── search/SearchBar.tsx
├── scripts/
│   ├── create-collection.js         # Setup SmartExtraction
│   ├── ingest-documents.js          # Main ingestion pipeline
│   └── test-single-doc.js
├── config/
│   └── weaviate.config.ts           # Weaviate client setup
└── .env.local                       # Environment configuration
```

## Data Flow

1. **User Query** → Frontend SearchBar
2. **API Request** → `/api/search`
3. **Query Enhancement** → Add investor context if relevant
4. **Vector Search** → Weaviate (semantic or hybrid)
5. **Result Processing** → Parse dynamic extracted_fields
6. **AI Synthesis** → Claude generates comprehensive answer
7. **Response** → Results + AI answer + confidence + sources
8. **Tracking** → Braintrust logs metrics

## Performance Metrics

### Current Stats (October 2025)
- **Documents**: 72 PDFs
- **Chunks**: 1,241 embedded chunks
- **Companies**: 3 (Advanced Navigation, Wonde, SecureStack)
- **Vector Dimension**: 1024 (Voyage-3)
- **Search Latency**: ~2-3 seconds (hybrid search + AI synthesis)

### Extraction Success
- **Unique Field Types**: 100+ different fields discovered
- **Avg Fields/Document**: 12-18 fields
- **Extraction Success Rate**: ~95%
- **Empty/Corrupted PDFs**: Gracefully skipped

## Legacy Collections (Not Currently Used)

- `VC_PE_Claude97_Production`: Fixed 97-field schema (superseded)
- `DynamicCompanies`: Earlier experimental collection
- API routes for these exist but are not active

## Recent Changes (October 2025)

### SmartExtraction Collection Launch
- ✅ Created Voyage-3 powered collection
- ✅ Ingested 72 documents across 3 companies
- ✅ Switched all search endpoints to SmartExtraction
- ✅ Dynamic metadata extraction with Claude Sonnet 4.5

### Key Improvements
- No fixed schema constraints
- Rich metadata automatically extracted
- Superior semantic search with Voyage-3
- Comprehensive AI answer synthesis

## Development Workflow

```bash
# Start frontend
npm run dev

# Create new collection
node scripts/create-collection.js

# Ingest documents
node scripts/ingest-documents.js

# Test search
# Navigate to http://localhost:3000
# Enter query, get results with dynamic metadata
```

## Design Principles

1. **Schema-Free**: No predefined fields, adapt to content
2. **AI-First**: Claude extracts what's relevant, not what's expected
3. **Semantic Search**: Voyage-3 understands context, not just keywords
4. **Comprehensive Answers**: Synthesize insights, don't just return chunks
5. **Observable**: Track everything with Braintrust
6. **Production-Ready**: Handle errors, skip bad PDFs, batch efficiently

This documentation provides complete technical context for understanding and extending the VC Pipeline platform.
