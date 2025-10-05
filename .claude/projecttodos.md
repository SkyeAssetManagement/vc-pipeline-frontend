# Project TODOs

## Immediate Priorities

### Data Ingestion
- [ ] Ingest remaining 7 portfolio companies to SmartExtraction
- [ ] Monitor Voyage-3 API usage and costs during ingestion
- [ ] Validate metadata extraction quality across all companies
- [ ] Add document re-ingestion capability for updated files

### Production Monitoring
- [ ] Set up Braintrust dashboards for response time analysis
- [ ] Monitor DSPy optimization triggers in production
- [ ] Track model performance (Claude Sonnet 4.5 vs previous versions)
- [ ] Create alerts for search latency > 10 seconds

## Search & Retrieval

### Search Quality
- [ ] A/B test DSPy-enhanced vs direct search
- [ ] Validate semantic vs hybrid search performance by query type
- [ ] Implement query expansion for better recall
- [ ] Add user feedback mechanism (thumbs up/down on results)

### Frontend UI
- [ ] Display extracted_fields in search result cards
- [ ] Add faceted filtering by document_type, round_info
- [ ] Show metadata badges (Series A, $15M raised, etc.)
- [ ] Create field exploration view (all unique fields across results)
- [ ] Add document preview modal with highlighted matches

## DSPy Optimization

### Training & Evaluation
- [ ] Collect 50+ training examples for first optimization cycle
- [ ] Set up automated evaluation on validation set
- [ ] Track optimization improvements over time
- [ ] Create manual review process for low-confidence examples

### Pipeline Improvements
- [ ] Fine-tune reranking strategy (currently top 20 → 15)
- [ ] Experiment with query enhancement techniques
- [ ] Add few-shot examples for intent classification
- [ ] Implement confidence-based routing (high confidence = skip reranking)

## Infrastructure

### Performance
- [ ] Cache frequently accessed document chunks
- [ ] Implement CDN for static assets
- [ ] Optimize Weaviate query patterns
- [ ] Add request deduplication for identical queries

### Scaling
- [ ] Plan for 1000+ document collection
- [ ] Implement async job queue for ingestion
- [ ] Add rate limiting on API endpoints (100 req/min)
- [ ] Set up automated backups for Weaviate collection

## Data Quality

### Validation
- [ ] Create test suite for various document types
- [ ] Benchmark extraction quality against manual labeling (target: 90%+ accuracy)
- [ ] Test edge cases (scanned PDFs, non-English, redacted sections)
- [ ] Validate financial data extraction (amounts, percentages, dates)

### Metadata Improvements
- [ ] Add confidence scores to extracted_fields
- [ ] Implement human-in-the-loop validation for critical fields
- [ ] Create feedback loop for incorrect extractions
- [ ] Fine-tune extraction prompts per document type

## Feature Enhancements

### Advanced Search
- [ ] Multi-document relationship extraction (term sheet → cap table)
- [ ] Temporal tracking (company metrics over time)
- [ ] Cross-company benchmarking queries
- [ ] Saved searches and alerts

### Company Pages
- [ ] Build company detail pages with all documents
- [ ] Investment timeline visualization
- [ ] Aggregated metrics dashboard
- [ ] Document gallery view with filters

### Admin Tools
- [ ] Collection management interface
- [ ] Batch document operations
- [ ] Metadata editing interface
- [ ] Ingestion job monitoring dashboard

## Documentation

### Technical Docs
- [ ] Create API documentation with Swagger/OpenAPI
- [ ] Write ingestion troubleshooting guide
- [ ] Document DSPy optimization process
- [ ] Add deployment guide for new environments

### User Guides
- [ ] Search best practices guide
- [ ] Document preparation guidelines
- [ ] Video tutorials for key features
- [ ] FAQ for common issues

## Future Exploration

### AI Improvements
- [ ] Experiment with GPT-4 for metadata extraction comparison
- [ ] Test alternative embedding models (OpenAI, Cohere)
- [ ] Implement entity linking across documents
- [ ] Create automated insight generation from patterns

### Integrations
- [ ] Connect to CRM systems (Salesforce, HubSpot)
- [ ] Integrate with data rooms (Datasite, Intralinks)
- [ ] Add Slack notifications for document updates
- [ ] Build REST API for third-party access

### New Document Types
- [ ] Add support for Word documents (.docx)
- [ ] Implement OCR for scanned PDFs
- [ ] Process Excel spreadsheets (.xlsx)
- [ ] Handle email chains (.eml, .msg)

## Maintenance

### Code Quality
- [ ] Add unit tests for core services (target: 70% coverage)
- [ ] Set up E2E tests for critical user flows
- [ ] Implement TypeScript strict mode
- [ ] Add error boundary components

### DevOps
- [ ] Set up CI/CD pipeline for automated testing
- [ ] Create staging environment for testing
- [ ] Implement blue-green deployments
- [ ] Add performance regression testing

## Completed ✓

### October 2025 - SmartExtraction Launch
- [x] Created SmartExtraction collection with Voyage-3
- [x] Built dynamic metadata extraction pipeline
- [x] Ingested 72 documents across 3 companies (1,241 chunks)
- [x] Migrated all search endpoints to SmartExtraction
- [x] Updated to Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)
- [x] Fixed DSPy hybrid search alpha parameter (0.7)
- [x] Added response time tracking to all endpoints
- [x] Integrated Braintrust for production monitoring
- [x] Deployed to Vercel with environment variables
- [x] Implemented schema-free field extraction (100+ unique fields)
- [x] Created OptimizedWeaviateService for filtered searches
- [x] Built DSPyEnhancedRAGService with automatic optimization

This TODO list reflects the current production state and prioritizes immediate next steps for scaling, quality, and feature development.
