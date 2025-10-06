# VeronaAI RAG Pipeline Architecture

## Overview
End-to-end retrieval-augmented generation system for querying venture capital portfolio documents, hosted on Vercel.

## Architecture Flow

### 📥 Document Ingestion Pipeline
```
Raw Documents (PDFs, Word, etc.)
    ↓
Contextual Chunking (preserves document structure & relationships)
    ↓
Voyage AI Embeddings (voyage-large-3)
    - Optimized for financial/business documents
    - Superior contextual understanding for retrieval tasks
    ↓
Weaviate Cloud Storage
    - Collections: VC_PE_Claude97_Optimized_Production
    - Stores: vectors + metadata (company_name, document_type, section_type)
```

### 🔍 Query Pipeline
```
User Query (Frontend - Next.js on Vercel)
    ↓
API Route (/api/search-optimized)
    ↓
Query Enhancement (Claude expands with relevant terms)
    Example: "portfolio companies" → "portfolio companies private equity investment terms governance"
    ↓
Query Embedding (Voyage AI voyage-large-3)
    ↓
Hybrid Search in Weaviate
    ├── Vector Search (semantic similarity via cosine distance)
    └── BM25 Search (keyword matching)
    ↓
Result Merging & Scoring (top 20 chunks)
    ↓
Document Grouping (by company_name, with deduplication)
    ↓
Context Assembly (formatted chunks with metadata)
    ↓
Answer Generation (Claude with structured prompts)
    - Confidence scoring (high/medium/low)
    - Source attribution
    - Company summaries
    ↓
Streaming Response (via Vercel AI SDK)
```

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Hosting** | Vercel | Frontend hosting, serverless API routes |
| **Frontend** | Next.js 14.2, TypeScript, Tailwind | React-based UI |
| **API** | Next.js API Routes | Serverless backend |
| **Embeddings** | Voyage AI (voyage-large-3) | Document & query vectorization |
| **Vector DB** | Weaviate Cloud | Hybrid search (vector + keyword) |
| **LLM** | Anthropic Claude Sonnet 4.5 | Query expansion & answer generation |
| **Monitoring** | Braintrust | Logging, tracing, quality metrics |

## Key Design Decisions

### Why Voyage AI?
- **Contextual embeddings**: Understands relationships between document chunks
- **Retrieval-optimized**: Specifically trained for search (not general-purpose)
- **Domain expertise**: Superior performance on financial/business documents
- **Late-interaction**: Better query-document matching

### Why Hybrid Search?
- **Vector search**: Captures semantic meaning and conceptual similarity
- **BM25 search**: Ensures exact term matches (company names, technical terms)
- **Best of both**: Balances semantic understanding with precision

### Performance Optimizations
- **Optimized collection**: Pre-processed for faster retrieval
- **Query caching**: 15-minute cache for repeated queries
- **Streaming responses**: Immediate user feedback via Vercel AI SDK
- **Parallel search**: Vector and BM25 run simultaneously

## Metrics & Monitoring
All operations tracked via Braintrust:
- Query latency
- Result relevance scores
- Answer confidence levels
- Source quality metrics
- End-to-end pipeline performance