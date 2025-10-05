# Project TODOs

## SmartExtraction Collection

### Completed ✓
- [x] Create SmartExtraction collection with Voyage-3 vectorizer
- [x] Build dynamic metadata extraction pipeline with Claude Sonnet 4.5
- [x] Ingest 72 documents (Advanced Navigation, Wonde, SecureStack)
- [x] Switch search endpoints to SmartExtraction collection
- [x] Generate 1,241 chunks with Voyage-3 embeddings
- [x] Implement schema-free field extraction (100+ unique fields)

### Next Steps
- [ ] Ingest remaining portfolio companies (7 more companies)
- [ ] Add incremental ingestion for new documents
- [ ] Monitor Voyage API usage and costs
- [ ] Create admin dashboard for collection stats

## Search & Retrieval

### Frontend Enhancements
- [ ] Display extracted fields in search results UI
- [ ] Add field-based filtering (e.g., filter by document_type, round_type)
- [ ] Show metadata badges for each result
- [ ] Create field exploration view

### Search Quality
- [ ] Validate search precision/recall metrics
- [ ] Compare hybrid vs semantic search performance
- [ ] Implement query expansion for better recall
- [ ] Add relevance feedback mechanism

## Document Ingestion

### New Document Types
- [ ] Add support for Word documents (.docx)
- [ ] Implement OCR for scanned PDFs
- [ ] Handle Excel spreadsheets for financial data
- [ ] Process email chains (.eml, .msg)

### Pipeline Improvements
- [ ] Add retry logic for failed extractions
- [ ] Implement parallel processing for faster ingestion
- [ ] Create validation step to verify metadata quality
- [ ] Add deduplication logic for duplicate files

## Monitoring & Observability

### Metrics Tracking
- [ ] Create dashboard for extraction field statistics
- [ ] Monitor embedding generation latency
- [ ] Track Claude API costs per document
- [ ] Set up alerts for extraction failures

### Quality Metrics
- [ ] Measure field extraction accuracy
- [ ] Track metadata completeness per document type
- [ ] Monitor search quality scores over time
- [ ] Analyze user query patterns

## Frontend Development

### Search Interface
- [ ] Improve result card design to show metadata
- [ ] Add faceted search by extracted fields
- [ ] Create document preview modal
- [ ] Implement search history

### Company Pages
- [ ] Build company detail pages with all documents
- [ ] Show investment timeline visualization
- [ ] Display aggregated metrics from documents
- [ ] Create document gallery view

### Admin Tools
- [ ] Build collection management interface
- [ ] Add document re-ingestion tool
- [ ] Create metadata editing interface
- [ ] Implement batch operations UI

## Data Quality

### Validation
- [ ] Create test suite for various document types
- [ ] Validate extraction consistency across similar docs
- [ ] Test edge cases (empty docs, corrupted PDFs, non-English)
- [ ] Benchmark extraction quality vs manual labeling

### Improvements
- [ ] Fine-tune extraction prompts per document type
- [ ] Add confidence scores for extracted fields
- [ ] Implement human-in-the-loop validation
- [ ] Create feedback mechanism for incorrect extractions

## Infrastructure

### Performance
- [ ] Optimize chunking strategy for better retrieval
- [ ] Implement caching for frequently accessed documents
- [ ] Add CDN for static assets
- [ ] Optimize Weaviate query performance

### Scaling
- [ ] Plan for 1000+ document ingestion
- [ ] Implement queue system for async processing
- [ ] Add rate limiting for API endpoints
- [ ] Set up database backups

## Future Enhancements

### Advanced Features
- [ ] Multi-document relationship extraction (e.g., link term sheet to cap table)
- [ ] Temporal tracking (track company metrics over time)
- [ ] Cross-company benchmarking
- [ ] Automated insight generation from trends

### AI Improvements
- [ ] Implement active learning for field discovery
- [ ] Add entity linking across documents
- [ ] Create summary generation for long documents
- [ ] Build question-answering system

### Integrations
- [ ] Connect to CRM systems
- [ ] Integrate with data rooms
- [ ] Add Slack notifications for new documents
- [ ] Build API for third-party access

## Documentation

### Technical
- [ ] Create API documentation with examples
- [ ] Write ingestion troubleshooting guide
- [ ] Document extraction prompt engineering
- [ ] Add deployment guide

### User Guides
- [ ] Create search best practices guide
- [ ] Write document preparation guidelines
- [ ] Build video tutorials for key features
- [ ] Document supported file formats

This TODO list reflects the current state after SmartExtraction launch and outlines the path forward for enhanced features and production readiness.
