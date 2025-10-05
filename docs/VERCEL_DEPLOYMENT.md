# Vercel Deployment Guide for Enhanced Braintrust Integration

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
You need to add these environment variables in your Vercel dashboard:

```bash
# Required for Braintrust
BRAINTRUST_API_KEY=your_braintrust_api_key

# Required for Weaviate
WEAVIATE_URL=your_weaviate_url
WEAVIATE_API_KEY=your_weaviate_api_key

# Required for Claude/Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# Optional but recommended
NODE_ENV=production
```

### 2. Add Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to "Settings" → "Environment Variables"
4. Add each variable with the appropriate values
5. Ensure they're available for "Production", "Preview", and "Development"

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option 2: Deploy via Git Push

```bash
# Commit your changes
git add .
git commit -m "Add enhanced Braintrust integration with custom scoring"

# Push to your main branch
git push origin main
```

## ✅ What's Included in This Deployment

### Enhanced Features
- **Custom Scoring Metrics**: Relevance, completeness, confidence scores
- **Production Metadata**: Deployment URLs, regions, environment info
- **Error Tracking**: Full error details with stack traces
- **Performance Monitoring**: Response time tracking and optimization

### API Endpoints
All endpoints now have enhanced tracing:
- `/api/search` - Main search with AI synthesis
- `/api/search-optimized` - Optimized search endpoint
- `/api/search-vercel-ai` - Vercel AI SDK integration
- `/api/test-enhanced-tracing` - Test endpoint for verification

### Configuration
- **Function Timeouts**: Extended to 30 seconds for search endpoints
- **Async Logging**: Non-blocking trace collection
- **Production Optimizations**: Automatic environment detection

## 🔍 Verifying Your Deployment

### 1. Check Deployment Status
After deployment, verify everything is working:

```bash
# Test the enhanced tracing endpoint
curl -X POST https://your-app.vercel.app/api/test-enhanced-tracing \
  -H "Content-Type: application/json" \
  -d '{"testType": "simple", "userId": "vercel-test"}'
```

### 2. Check Braintrust Dashboard
1. Go to [Braintrust Dashboard](https://www.braintrust.dev)
2. Navigate to your "VeronaAI" project
3. Look for traces with:
   - `environment: "production"`
   - `vercelEnv: "production"`
   - Your deployment URL in metadata

### 3. Monitor Production Metrics
Look for these key indicators:
- **Response Times**: Should be under 3 seconds for search
- **Error Rates**: Should be below 1%
- **Scoring Metrics**: Relevance > 0.7, Completeness > 0.6

## 📊 Production-Specific Features

### Automatic Environment Detection
The system automatically detects and logs:
- Vercel deployment URL
- Vercel region (us-east-1, etc.)
- Environment type (production, preview, development)
- Deployment metadata

### Enhanced Error Handling
Production errors include:
- Full stack traces (sanitized for security)
- Request context
- User and session information
- Recovery suggestions

### Performance Optimizations
- Async flush for non-blocking logging
- Batch processing for multiple traces
- Automatic retry on network failures
- Graceful degradation if Braintrust is unavailable

## 🛠 Troubleshooting

### Issue: Traces Not Appearing
1. Check environment variables in Vercel dashboard
2. Verify BRAINTRUST_API_KEY is set correctly
3. Check Vercel function logs for errors

### Issue: Slow Response Times
1. Check function timeout settings (should be 30s for search)
2. Monitor Vercel function logs for bottlenecks
3. Review Braintrust traces for slow operations

### Issue: Permission Errors
1. Ensure your Braintrust API key has write permissions
2. Verify the "VeronaAI" project exists in Braintrust
3. Check if the API key is for the correct organization

## 📈 Monitoring Best Practices

### Set Up Alerts
In Braintrust, configure alerts for:
- Response time > 3 seconds
- Error rate > 1%
- Relevance score < 0.5
- Failed traces

### Regular Reviews
Weekly check these metrics:
- Average response times by endpoint
- Error patterns and frequencies
- User satisfaction scores
- Token usage and costs

### A/B Testing
Use metadata to track experiments:
```typescript
metadata: {
  experiment: "enhanced-search-v2",
  variant: "treatment",
  deploymentId: process.env.VERCEL_DEPLOYMENT_ID
}
```

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Braintrust Dashboard](https://www.braintrust.dev)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Functions](https://vercel.com/docs/concepts/functions)

## 📝 Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test search endpoint with real queries
- [ ] Check Braintrust dashboard for traces
- [ ] Monitor first 24 hours for errors
- [ ] Set up alerts in Braintrust
- [ ] Document any custom configurations

Your enhanced Braintrust integration is now ready for production on Vercel!