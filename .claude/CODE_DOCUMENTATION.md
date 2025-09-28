# VC Pipeline Frontend - Code Documentation

## Project Overview
AI-powered venture capital portfolio management platform built with Next.js 14, integrated with Weaviate vector database for intelligent document search and analysis. Features a minimalist design with streamlined portfolio exploration.

## Tech Stack
- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Crimson Text font
- **Database**: Weaviate Vector Database
- **AI**: Claude API for answer synthesis
- **Search**: Hybrid BM25 + Semantic Search
- **Deployment**: Vercel (with password protection)
- **Analytics**: Google Looker Studio (embedded)

## Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── search-optimized/     # Enhanced search with filters
│   │   ├── extract-companies/    # Company extraction
│   │   └── weaviate-schema/      # Schema inspection
│   ├── companies/                # Portfolio companies
│   │   └── [id]/                # Individual company pages
│   ├── dashboard/                # Analytics dashboard
│   ├── portfolio/                # Portfolio overview
│   └── page.tsx                  # Home with AI search
├── components/                   # React components
│   └── search/
│       └── SearchBar.tsx         # Search interface
├── lib/                          # Core libraries
│   ├── claude.ts                 # Claude integration
│   ├── weaviate-optimized.ts     # Weaviate client
│   └── portfolio-utils.ts        # Financial utils
└── public/
    └── VeronaCapitalLogo.png     # Logo
```

## Key Features

### 1. AI-Powered Search (`/`)
- Natural language queries with Claude synthesis
- Confidence scoring (high/medium/low)
- Expandable results (5 initial → show all)
- Example queries for guidance
- Real-time financial data extraction

### 2. Advanced Filtering
- Company name, industry, document type
- Investment ranges ($0 - $100M+)
- Valuation ranges ($0 - $1B+)
- Ownership percentage (0-100%)
- Confidence threshold filtering
- Boolean filters (has investment/valuation)

### 3. Portfolio Views
- **Companies List**: Investment metrics, fair values, returns
- **Portfolio Overview**: Embedded Looker Studio dashboard
- **Dashboard**: Full analytics view

### 4. Design System

**Colors**:
- Background: `#fbf9f5` (warm off-white)
- Primary text: `#18181b` (near black)
- Secondary: `#71717a` (gray)
- Borders: `#e4e4e7` (light gray)
- Accent: `#3b82f6` (blue hover)

**Components**:
- Minimalist buttons (transparent → black hover)
- Consistent padding: `px-8 py-4`
- Shadow effects on interaction
- Gradient text for headings

## API Endpoints

### `/api/search-optimized` (POST)
Handles hybrid search with financial filtering and AI synthesis.

### `/api/extract-companies` (GET)
Returns enriched company data with calculated financials.

### `/api/weaviate-schema` (GET)
Inspects available Weaviate collections.

## Data Schema

### Weaviate Collection
- **Primary**: `VC_PE_Claude97_Production`
- **Fields**: Investment amounts, valuations, ownership percentages
- **Documents**: Term sheets, shareholder agreements, financial reports

### Search Result Structure
```typescript
{
  id: string
  title: string
  company: string
  snippet: string
  documentType: string
  investmentAmount: number
  preMoneyValuation: number
  postMoneyValuation: number
  fairValue: number
  ownershipPercentage: number
  extractionConfidence: number
  score: number
}
```

## Environment Variables

```env
# Weaviate Configuration
NEXT_PUBLIC_WEAVIATE_SCHEME=https
NEXT_PUBLIC_WEAVIATE_HOST=[your-host]
WEAVIATE_API_KEY=[your-key]

# AI Services
OPENAI_API_KEY=[optional-embeddings]
ANTHROPIC_API_KEY=[claude-api]

# Collection
NEXT_PUBLIC_OPTIMIZED_COLLECTION_NAME=VC_PE_Claude97_Production

# Authentication (Vercel)
JWT_SECRET=[for-future-custom-auth]
```

## Deployment

### Vercel Deployment
- **Production URL**: https://vc-pipeline-frontend.vercel.app
- **Password Protection**: Enabled via Vercel dashboard
- **Auto-deploy**: On push to main branch
- **Environment**: Production variables configured

### Build Commands
```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript validation
vercel --prod        # Deploy to production
```

## Recent Changes
- Removed authentication system (using Vercel's built-in)
- Deployed to Vercel with environment variables
- Simplified UI with unified button styling
- Enhanced search with "Show more" functionality
- Cleaned build cache and fixed deployment issues
- Added `.env.production` for deployment config

## Performance & Error Handling
- Weaviate hybrid search for relevance
- Claude API with low temperature (0.1)
- Result limiting for performance
- Graceful API failure handling
- Loading states for async operations
- Empty state handling

## Security
- Password protection via Vercel
- Environment variables secured in Vercel dashboard
- No hardcoded secrets in codebase
- HTTPS enforced on production

This documentation provides a complete technical overview for maintaining and extending the VC Pipeline Frontend application.