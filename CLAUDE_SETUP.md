# Claude Integration Setup

## Environment Variables Required

Add these environment variables to your `.env.local` file:

```bash
# Anthropic Claude Configuration
ANTHROPIC_API_KEY=your-anthropic-api-key

# Existing variables (if not already set)
NEXT_PUBLIC_WEAVIATE_SCHEME=https
NEXT_PUBLIC_WEAVIATE_HOST=your-weaviate-instance.weaviate.network
WEAVIATE_API_KEY=your-weaviate-api-key
OPENAI_API_KEY=your-openai-api-key
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Getting Your Anthropic API Key

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## What's New with Claude Integration

### Enhanced AI Responses
- **Claude Sonnet 4** (`claude-sonnet-4-20250514`) powers all search responses
- **Intelligent understanding** of complex portfolio questions
- **Natural language responses** instead of document listings
- **Confidence scoring** (high/medium/low) for response quality
- **Source attribution** showing which companies/documents were used

### Example Improvements

**Before (Rule-based):**
> "Found 20 relevant documents across 4 companies for 'How much do we have in Riparide'. 1. **6. Riparide**: 14 documents found (corporate_document, shareholders_agreement)"

**After (Claude-powered):**
> "Based on the portfolio documents, we have invested $800,000 in Riparide. This was a Pre-Seed investment made in 2022. The company is currently in the active stage with 14 relevant documents including corporate documents and shareholder agreements."

### Features Added
- ✅ **Claude Sonnet 4** integration
- ✅ **Confidence scoring** for response quality
- ✅ **Source attribution** showing data sources
- ✅ **Intelligent context** understanding
- ✅ **Natural conversation** flow
- ✅ **Professional VC** tone and terminology

## Testing the Integration

1. Start the development server: `npm run dev`
2. Navigate to the search interface
3. Try queries like:
   - "How much did we invest in Advanced Navigation?"
   - "What are the terms for Riparide's investment?"
   - "Show me our portfolio performance"
   - "What companies are in Series A stage?"

The responses should now be much more natural and directly answer your questions!
