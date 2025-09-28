# Verona Capital Private Equity Platform - Code Documentation

## Project Overview
AI-powered private equity portfolio management platform built with Next.js 14, integrated with Weaviate vector database and Claude for intelligent document search and analysis. Features a minimalist design with no authentication requirements and streamlined portfolio exploration.

## Architecture & Tech Stack

### Core Technologies
- **Framework**: Next.js 14.2.32 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom Crimson Text font
- **Database**: Weaviate (Vector Database)
- **AI**: Claude API for answer synthesis
- **Search**: Hybrid BM25 + Semantic Search
- **Analytics**: Google Looker Studio (embedded dashboard)

### Data Sources
- **Primary Collection**: `VC_PE_Claude97_Production` - Real financial documents
- **Schema**: Investment amounts, valuations, ownership percentages, confidence scores
- **Document Types**: Term sheets, shareholder agreements, financial reports

## Directory Structure

```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── search-optimized/     # Enhanced search with financial filters
│   │   ├── extract-companies/    # Company data extraction
│   │   └── weaviate-schema/      # Schema inspection
│   ├── companies/                # Portfolio companies listing
│   │   └── [id]/                 # Individual company pages
│   ├── dashboard/                # Full analytics dashboard
│   ├── portfolio/                # Portfolio overview with embedded Looker
│   └── page.tsx                  # Home page with AI search
├── components/                   # React components
│   └── search/
│       └── SearchBar.tsx         # Search interface with filters
├── lib/                          # Core libraries
│   ├── claude.ts                 # Claude API integration
│   ├── weaviate-optimized.ts     # Weaviate client
│   └── portfolio-utils.ts        # Financial calculations
└── public/
    └── VeronaCapitalLogo.png     # Company logo
```

## Key Features & Components

### 1. AI-Powered Search (`/app/page.tsx`)
**Features**:
- Natural language queries with example suggestions
- Claude-synthesized answers with confidence levels
- Expandable results (show 5 initially, expand to show all)
- Real-time search with loading states
- Financial data display with formatting

**Example Queries**:
- "How much did Upswell invest in Riparide?"
- "Which companies are in our portfolio?"
- "When was the series B round completed for Advanced Navigation?"
- "Which company did we most recently invest in?"

### 2. Search Interface (`components/search/SearchBar.tsx`)
**Advanced Filtering**:
- Company name, industry, document type
- Investment ranges ($0 - $100M+)
- Valuation ranges ($0 - $1B+)
- Ownership percentage (0-100%)
- Confidence threshold filtering
- Boolean filters (has investment/valuation)

**UI Elements**:
- Minimalist placeholder: "Ask anything about your portfolio..."
- Collapsible filter panel
- Auto-suggestions from example queries
- Responsive design with mobile support

### 3. Portfolio Overview (`/app/portfolio/page.tsx`)
**Embedded Analytics**:
- Google Looker Studio dashboard integration
- Full-screen responsive iframe
- Real-time portfolio metrics
- External link for full dashboard access

### 4. Companies List (`/app/companies/page.tsx`)
**Portfolio Display**:
- Total investment, fair value, and return metrics
- Company cards with performance indicators
- Financial data extraction from documents
- Industry and stage categorization
- Performance calculation (positive/negative/neutral)

### 5. UI Design System

**Color Palette**:
- Background: #fbf9f5 (warm off-white)
- Primary text: #18181b (near black)
- Secondary text: #71717a (gray)
- Borders: #e4e4e7 (light gray)
- Hover accent: #3b82f6 (blue)

**Button Styles** (Minimalist - all same style):
```css
- Background: transparent → black on hover
- Border: 2px solid gray → blue on hover
- Padding: px-8 py-4 (consistent sizing)
- Font: text-lg font-semibold
- Effects: shadow-lg, hover:shadow-xl, transform on hover
```

**Typography**:
- Font: Crimson Text (Google Fonts)
- Headings: Gradient text effects
- Body: Standard weight with good readability

## API Endpoints

### `/api/search-optimized` (POST)
```typescript
Request: {
  query: string
  filters?: {
    company?: string
    industry?: string
    documentType?: string
    investmentRange?: { min: number, max: number }
    valuationRange?: { min: number, max: number }
    ownershipRange?: { min: number, max: number }
    minConfidence?: number
    hasInvestmentAmount?: boolean
    hasValuation?: boolean
  }
  searchType: 'hybrid' | 'semantic' | 'bm25'
  useOptimizedCollection: boolean
}

Response: {
  success: boolean
  results: SearchResult[]
  aiAnswer: string
  confidence: 'high' | 'medium' | 'low'
  sources: string[]
}
```

### `/api/extract-companies` (GET)
Returns enriched company data with calculated financials

## Data Schema

### Search Result Structure
```typescript
interface SearchResult {
  id: string
  title: string
  company: string
  snippet: string
  documentType: string
  industry?: string

  // Financial Fields
  investmentAmount: number
  preMoneyValuation: number
  postMoneyValuation: number
  fairValue: number
  ownershipPercentage: number

  // Metadata
  extractionConfidence: number
  extractionTimestamp: string
  score: number

  // Display Flags
  hasInvestmentAmount: boolean
  hasValuation: boolean
}
```

## Environment Configuration

```env
ANTHROPIC_API_KEY=sk-ant-api03-...     # Claude API
WEAVIATE_API_KEY=...                   # Weaviate cloud
OPENAI_API_KEY=...                     # Embeddings (optional)
```

## Development Commands

```bash
npm run dev          # Start development server (port 3001 if 3000 in use)
npm run build        # Production build
npm run lint         # ESLint checking
npm run typecheck    # TypeScript validation
```

## Recent Updates

### UI/UX Improvements
- Removed authentication system entirely
- Unified button styling (minimalist white/transparent)
- Simplified search placeholder text
- Added "Show more" functionality for search results
- Updated example queries to be more relevant
- Removed "venture capital" references for simplicity
- Centered logo without user menu

### Technical Changes
- Removed UserMenu component
- Deleted auth-related files and routes
- Simplified header layouts
- Enhanced search result expansion/collapse
- Updated button hover states for consistency

## Performance Considerations

- Weaviate hybrid search for optimal relevance
- Claude API with low temperature (0.1) for factual responses
- Result limiting (5 initial, expand on demand)
- Efficient GraphQL queries
- Static asset optimization

## Error Handling

- Graceful fallbacks for API failures
- User-friendly error messages
- Loading states for async operations
- Empty state handling for no results

This documentation provides a complete understanding of the Verona Capital platform's architecture, design, and functionality for efficient development and maintenance.