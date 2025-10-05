# Braintrust Easy Wins Implementation Guide

## ✅ What We've Accomplished

### 1. **Enhanced Tracing Library** (`lib/braintrust-enhanced.ts`)
- **Custom Scoring Metrics**: Automatically calculates relevance, completeness, accuracy, and performance scores
- **Rich Metadata**: Captures userId, sessionId, feature tags, company names, document types
- **Descriptive Span Names**: Clear operation names like `weaviate-hybrid-search`, `claude-generate-answer`
- **Error Tracking**: Full error messages and stack traces for debugging

### 2. **Updated Search API** (`app/api/search/route.ts`)
- Integrated enhanced tracing for search operations
- Tracks Weaviate searches with detailed metadata
- Monitors Claude AI response generation with custom scores
- Measures search relevance and answer completeness

### 3. **Test Endpoints** (`app/api/test-enhanced-tracing/route.ts`)
- Simple, complex, and error test scenarios
- Demonstrates nested operations and sub-spans
- Shows custom scoring in action

## 🚀 How to Use the Enhanced Features

### Quick Test Commands

```bash
# Test the enhanced tracing
node scripts/test-enhanced-tracing.js

# Or test individual endpoints
curl -X POST http://localhost:3002/api/test-enhanced-tracing \
  -H "Content-Type: application/json" \
  -d '{"testType": "simple", "userId": "test-user"}'
```

### In Your Code

```typescript
import { tracedOperation } from '@/lib/braintrust-enhanced';

// Wrap any async operation
const result = await tracedOperation(
  'my-operation-name',
  async () => {
    // Your code here
    return await someAsyncFunction();
  },
  {
    // Metadata
    userId: 'user-123',
    sessionId: 'session-456',
    feature: 'my-feature',
    customField: 'any-value'
  },
  (result) => ({
    // Custom scoring function
    relevance: calculateRelevance(result),
    completeness: result.items?.length / 10,
    quality: result.score
  })
);
```

## 📊 What You'll See in Braintrust Dashboard

### Traces Now Include:

1. **Custom Scores**
   - `relevance`: How relevant the search results are (0-1)
   - `completeness`: How complete the answer is (0-1)
   - `confidence`: AI confidence in the response (0-1)
   - `responseTime`: Performance score based on latency
   - `tokenEfficiency`: How efficiently tokens were used

2. **Rich Metadata**
   - User and session tracking
   - Feature flags and A/B test variants
   - Company and document context
   - Environment and timestamp info

3. **Better Organization**
   - Clear span names describe what's happening
   - Nested operations show the full flow
   - Error tracking with stack traces

## 🎯 Next Steps to Level Up Further

### 1. **Add User Feedback Scores**
```typescript
// After user rates the response
await tracedOperation(
  'user-feedback',
  async () => ({ rating, feedback }),
  { userId, responseId },
  () => ({ userSatisfaction: rating / 5 })
);
```

### 2. **Create Evaluation Datasets**
- Export your best-performing searches
- Use them as test cases for new models
- Run automated evaluations on deployments

### 3. **Set Up Alerts**
- Alert when confidence drops below 0.7
- Monitor when response times exceed 2 seconds
- Track error rates by feature

### 4. **A/B Testing**
```typescript
// Track different model versions
metadata: {
  modelVersion: 'gpt-4' | 'claude-3',
  experimentGroup: 'control' | 'variant'
}
```

## 🔍 Viewing Your Traces

1. Go to [braintrust.dev](https://www.braintrust.dev)
2. Navigate to your "VeronaAI" project
3. Click on "Logs" to see real-time traces
4. Use filters to find specific operations:
   - Filter by `feature: "document-search"`
   - Filter by `userId` for user-specific debugging
   - Sort by scores to find poor-performing queries

## 📈 Metrics to Monitor

- **Average Relevance Score**: Should stay above 0.7
- **Response Time**: P95 should be under 3 seconds
- **Error Rate**: Should be below 1%
- **Token Usage**: Monitor for cost optimization

## 🛠 Troubleshooting

If you see permission errors in the logs:
1. Check your `BRAINTRUST_API_KEY` in `.env.local`
2. Ensure the project "VeronaAI" exists in your Braintrust account
3. Verify your API key has write permissions

## 💡 Pro Tips

1. **Use meaningful span names**: Instead of "operation-1", use "fetch-company-documents"
2. **Add context early**: Include metadata at the start of operations
3. **Score what matters**: Focus on metrics that impact user experience
4. **Review weekly**: Check dashboard for trends and anomalies

## 📚 Resources

- [Braintrust Documentation](https://www.braintrust.dev/docs)
- [API Reference](https://www.braintrust.dev/docs/reference/api)
- [Best Practices Guide](https://www.braintrust.dev/docs/guides/best-practices)

---

Your Braintrust integration is now enhanced with custom scoring, rich metadata, and better traceability. Start exploring your dashboard to gain insights into your AI's performance!