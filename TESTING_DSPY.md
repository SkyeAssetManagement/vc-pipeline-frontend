# Testing DSPy-Enhanced RAG System

## Quick Test Guide

### 1. Access the Frontend
Open your browser and go to: **http://localhost:3002**

### 2. Enable DSPy Optimization
Look for the **"DSPy Optimization"** toggle switch above the search bar and turn it ON. You'll see:
- Purple toggle switch when enabled
- "Self-improving AI" indicator with sparkles icon
- Status panel showing:
  - **Status**: 🔄 Learning (not yet optimized)
  - **Examples**: 0 (starts empty)
  - **Model**: claude-3-sonnet
  - **Message**: "Need 50 more examples for optimization"

### 3. Test Queries to Try

Run these queries to test the DSPy-enhanced search:

#### Basic Queries:
1. **"Show me portfolio companies"**
   - Tests entity extraction and query enhancement
   - Should return list of portfolio companies

2. **"What is Advanced Navigation's valuation?"**
   - Tests specific company information retrieval
   - Should show valuation details

3. **"Which investors participated in the Series B round?"**
   - Tests investment round queries
   - Should identify investors

#### Complex Queries:
4. **"Compare the investment terms between our portfolio companies"**
   - Tests comparison capabilities
   - Should analyze multiple companies

5. **"Show me companies with valuations over $100M"**
   - Tests filtering and numerical queries
   - Should filter by valuation

### 4. Compare Performance

#### A/B Testing:
1. Run the same query with DSPy OFF (regular search)
2. Toggle DSPy ON and run the same query
3. Compare:
   - **Response time** (DSPy is slower initially ~30s vs ~10s)
   - **Answer quality** (DSPy provides more structured responses)
   - **Confidence levels** (shown in the answer panel)

### 5. What to Look For

#### When DSPy is ON:
- **"DSPy Enhanced"** badge appears next to "Claude Analysis"
- **Optimization Status** updates after each query
- **Training Examples** counter increases with high-confidence queries
- **More detailed answers** with better query understanding

#### Key Features:
1. **Query Intent Classification**: DSPy identifies if your query is factual, analytical, comparison, or exploratory
2. **Enhanced Query**: Automatically adds relevant terms and synonyms
3. **Document Reranking**: Better ordering of search results by relevance
4. **Self-Learning**: System improves with each successful query

### 6. Building Training Examples

To help the system optimize:
1. Run queries that return high-confidence answers
2. Use clear, specific questions
3. After ~50 good examples, the system will trigger its first optimization
4. Status will change from "🔄 Learning" to "✅ Optimized"

### 7. Manual Optimization Trigger

If you want to trigger optimization manually (requires 50+ examples):
```bash
curl -X PUT "http://localhost:3002/api/search-dspy" \
  -H "Content-Type: application/json" \
  -d '{"action": "optimize"}'
```

### 8. Check Pipeline Status

To see current optimization status:
```bash
curl -X GET "http://localhost:3002/api/search-dspy"
```

Returns:
```json
{
  "status": {
    "isOptimized": false,
    "trainingExamples": 0,
    "currentModel": "claude-3-sonnet",
    "performanceScore": null
  }
}
```

## Expected Behavior

### Initial State (0-49 examples):
- Slower responses (20-30 seconds)
- Multiple LLM calls for optimization
- "Learning" status
- Collecting training data

### After Optimization (50+ examples):
- Faster responses (10-15 seconds)
- Better query understanding
- Higher confidence scores
- "Optimized" status

### Continuous Improvement:
- System retrains automatically when:
  - Performance drops >15%
  - Model changes
  - Every 24 hours (scheduled)
  - Manual trigger

## Troubleshooting

| Issue | Solution |
|-------|----------|
| DSPy queries timeout | Normal initially - takes ~30s for complex optimization |
| No optimization after 50 examples | Check if examples have high confidence |
| Toggle doesn't appear | Refresh the page (Ctrl+F5) |
| Status not updating | Check browser console for errors |

## Benefits of DSPy Mode

1. **Better Query Understanding**: Classifies intent and enhances queries
2. **Improved Relevance**: Reranks documents based on query context
3. **Self-Improving**: Learns from successful queries
4. **Model Agnostic**: Automatically adapts when switching LLMs
5. **Performance Monitoring**: Tracks and maintains quality

## Next Steps

1. Run 50+ queries to trigger first optimization
2. Compare results with/without DSPy
3. Monitor performance improvements over time
4. Check optimization history in the status panel