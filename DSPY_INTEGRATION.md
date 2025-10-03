# DSPy-Style Optimization for RAG Pipeline

## Overview
A TypeScript-native implementation inspired by DSPy (Declarative Self-improving Language Programs) has been integrated into the VeronaAI RAG pipeline to provide automatic optimization and adaptation of the retrieval and response generation process. This enables the system to continuously improve based on user interactions and adapt to model changes without requiring Python dependencies.

## Architecture

### Core Components

1. **DSPy Signatures** (`lib/dspy/signatures.ts`)
   - `QueryEnhancement`: Optimizes query expansion for better retrieval
   - `DocumentReranking`: Reorders retrieved documents by relevance
   - `AnswerGeneration`: Generates comprehensive answers with confidence levels
   - `QueryIntentClassification`: Classifies query intent and extracts entities

2. **Optimization Modules** (`lib/dspy/modules.ts`)
   - `OptimizedRAGPipeline`: Main pipeline combining all DSPy signatures
   - `AdaptiveQueryOptimizer`: Dynamically selects best optimization strategies

3. **Optimizer** (`lib/dspy/optimizer.ts`)
   - `DSPyOptimizer`: Handles training example collection and pipeline optimization
   - Supports multiple optimization strategies (BootstrapFewShot, MIPROv2, etc.)

4. **RAG Service** (`lib/dspy/rag-service.ts`)
   - `DSPyEnhancedRAGService`: Main service integrating DSPy with Weaviate
   - Handles automatic retraining triggers and performance monitoring

## How It Works

### 1. Query Processing Flow
```
User Query → Intent Classification → Query Enhancement → Weaviate Search →
Document Reranking → Answer Generation → Response
```

### 2. Optimization Process
- **Training Example Collection**: Successful queries with high confidence are automatically collected as training examples
- **Performance Monitoring**: Each query's performance is scored based on:
  - Result relevance (30% weight)
  - Answer completeness (25% weight)
  - Accuracy (25% weight)
  - Source quality (20% weight)

### 3. Automatic Retraining Triggers
- **Model Change**: Automatically reoptimizes when LLM model changes
- **Performance Drop**: Triggers when recent performance drops >15% from historical average
- **Scheduled**: Daily optimization (configurable)
- **Manual**: Can be triggered via API endpoint

## API Endpoints

### DSPy-Enhanced Search
```typescript
POST /api/search-dspy
{
  "query": "What are the Series A terms for Advanced Navigation?",
  "filters": {
    "company": "Advanced Navigation",
    "documentType": "term_sheet"
  },
  "userId": "user123",
  "sessionId": "session456"
}
```

### Get Pipeline Status
```typescript
GET /api/search-dspy
// Returns optimization status and metrics
```

### Trigger Manual Optimization
```typescript
PUT /api/search-dspy
{
  "action": "optimize"
}
```

### Handle Model Change
```typescript
PUT /api/search-dspy
{
  "action": "model-change",
  "newModel": "claude-3-opus"
}
```

## Configuration

Edit `lib/dspy/config.ts` to adjust:

```typescript
export const DSPY_CONFIG = {
  llm: 'claude-3-sonnet',              // LLM for DSPy operations
  retriever: 'weaviate-hybrid',        // Retrieval method
  optimizer: 'BootstrapFewShotWithRandomSearch',
  maxBootstrapExamples: 20,            // Max training examples
  validationSplitRatio: 0.2            // Train/validation split
};

export const OPTIMIZATION_TRIGGERS = {
  modelChange: true,                   // Optimize on model change
  performanceDrop: true,              // Optimize on performance drop
  scheduleInterval: 24 * 60 * 60 * 1000, // Daily optimization
  minExamplesForRetraining: 50,       // Min examples before optimization
  performanceDropThreshold: 0.15      // 15% drop triggers reoptimization
};
```

## Benefits

1. **Automatic Adaptation**: System learns from successful queries and improves over time
2. **Model Agnostic**: When switching LLMs (Claude to GPT-4, etc.), DSPy automatically reoptimizes
3. **Performance Monitoring**: Continuous tracking of search quality with automatic remediation
4. **Query Intelligence**: Better understanding of user intent and query enhancement
5. **Document Relevance**: Improved ranking of retrieved documents

## Usage in Frontend

To use the DSPy-optimized search in your frontend:

```typescript
const response = await fetch('/api/search-dspy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userQuery,
    filters: selectedFilters,
    userId: currentUser.id,
    sessionId: session.id
  })
});

const data = await response.json();
// data includes optimizationStatus showing pipeline performance
```

## Monitoring & Metrics

The system tracks:
- Query performance scores
- Training example collection rate
- Optimization frequency and success
- Model adaptation events

All metrics are logged through Braintrust for observability.

## Next Steps

1. **Install DSPy**: Run `npm install` to install the DSPy package
2. **Test Endpoint**: Try the `/api/search-dspy` endpoint
3. **Monitor Performance**: Check optimization status regularly
4. **Collect Examples**: System needs ~50 examples before first optimization
5. **Fine-tune**: Adjust weights and thresholds based on your needs

## Troubleshooting

- **No Optimization**: Ensure sufficient training examples (>50)
- **Poor Performance**: Check if model version matches configuration
- **Slow Queries**: Initial queries before optimization may be slower
- **Memory Issues**: Reduce `maxBootstrapExamples` if needed

## Technical Notes

- DSPy compiles optimized prompts and few-shot examples
- Optimization runs asynchronously to avoid blocking searches
- Training examples are stored in memory (consider persistence for production)
- Compatible with all Anthropic Claude models and OpenAI GPT models