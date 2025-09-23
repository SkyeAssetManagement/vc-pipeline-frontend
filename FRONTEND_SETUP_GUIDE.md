# Frontend Setup Guide - Optimized Voyage Collection Integration

This guide will help you integrate the optimized Weaviate collection with enhanced search capabilities and structured data display.

## Prerequisites ✅
All required dependencies are already installed:
- `weaviate-ts-client` (2.2.0) - Weaviate TypeScript client
- `@anthropic-ai/sdk` (0.63.0) - Claude SDK
- `next` (14.0.0) - Next.js framework
- All other necessary packages

## Step-by-Step Execution

### Step 1: Update Environment Variables
**Command:**
```bash
echo NEXT_PUBLIC_OPTIMIZED_COLLECTION_NAME=VC_PE_Voyage_Optimized_v2 >> .env.local
```

**What this does:**
- Adds the new collection name to environment variables
- Enables frontend to connect to optimized collection

**Expected Output:**
```
NEXT_PUBLIC_OPTIMIZED_COLLECTION_NAME=VC_PE_Voyage_Optimized_v2
```

### Step 2: Test Optimized Search API
**Command:**
```bash
npm run dev
```

**Then in another terminal:**
```bash
curl -X GET http://localhost:3000/api/search-optimized
```

**What this does:**
- Starts the development server
- Tests the new optimized search endpoint
- Verifies API is working

**Expected Output:**
```json
{
  "message": "Optimized Search API is running",
  "endpoints": {
    "POST": "/api/search-optimized - Perform enhanced search with structured data"
  },
  "features": [
    "Voyage Context-3 embeddings",
    "Strategic structured data extraction",
    "Enhanced document classification",
    "Content analysis flags",
    "Advanced filtering capabilities"
  ]
}
```

### Step 3: Test Search with Sample Query
**Command:**
```bash
curl -X POST http://localhost:3000/api/search-optimized \
  -H "Content-Type: application/json" \
  -d '{
    "query": "investment amount valuation",
    "filters": {
      "hasInvestmentAmount": true,
      "minConfidence": 0.7
    },
    "searchType": "hybrid",
    "useOptimizedCollection": true
  }'
```

**What this does:**
- Tests the optimized search with filters
- Verifies structured data extraction
- Checks response format

**Expected Output:**
```json
{
  "success": true,
  "query": "investment amount valuation",
  "results": [...],
  "companyGroups": [...],
  "aiAnswer": "...",
  "metadata": {
    "hasStructuredData": true,
    "averageConfidence": 0.847,
    "companiesWithInvestmentAmount": 8
  }
}
```

### Step 4: Update Main Search Component
**File:** `app/search/page.tsx` (or wherever your main search is)

**Add this import:**
```typescript
import { OptimizedWeaviateService } from '@/lib/weaviate-optimized';
```

**Update search function:**
```typescript
const handleSearch = async (query: string, filters?: any) => {
  try {
    const response = await fetch('/api/search-optimized', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        filters,
        searchType: 'hybrid',
        useOptimizedCollection: true
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      setResults(data.results);
      setCompanyGroups(data.companyGroups);
      setAiAnswer(data.aiAnswer);
      setMetadata(data.metadata);
    }
  } catch (error) {
    console.error('Search error:', error);
  }
};
```

### Step 5: Add Enhanced Result Display
**Add this component for displaying enhanced metadata:**

```typescript
const EnhancedResultCard = ({ result }: { result: any }) => (
  <div className="border rounded-lg p-4 mb-4">
    <div className="flex justify-between items-start mb-2">
      <h3 className="font-semibold">{result.title}</h3>
      <div className="flex gap-2">
        {result.hasInvestmentAmount && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
            💰 Investment Amount
          </span>
        )}
        {result.hasValuation && (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
            📊 Valuation
          </span>
        )}
        {result.hasGovernanceTerms && (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
            🏛️ Governance
          </span>
        )}
        {result.hasLegalTerms && (
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
            ⚖️ Legal
          </span>
        )}
      </div>
    </div>
    
    <p className="text-gray-600 mb-2">{result.snippet}</p>
    
    <div className="text-sm text-gray-500 mb-2">
      <span className="font-medium">Company:</span> {result.company} | 
      <span className="font-medium"> Type:</span> {result.documentType} | 
      <span className="font-medium"> Section:</span> {result.sectionType} | 
      <span className="font-medium"> Confidence:</span> {(result.contentConfidence * 100).toFixed(1)}%
    </div>
    
    {result.extractedAmounts?.length > 0 && (
      <div className="mb-2">
        <span className="font-medium text-sm">Amounts:</span>
        {result.extractedAmounts.map((amount: any, idx: number) => (
          <span key={idx} className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
            ${amount.value?.toLocaleString()}
          </span>
        ))}
      </div>
    )}
    
    {result.keyParties?.length > 0 && (
      <div className="mb-2">
        <span className="font-medium text-sm">Parties:</span>
        {result.keyParties.map((party: string, idx: number) => (
          <span key={idx} className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">
            {party}
          </span>
        ))}
      </div>
    )}
  </div>
);
```

### Step 6: Add Advanced Filtering UI
**Add this filtering component:**

```typescript
const AdvancedFilters = ({ filters, setFilters }: { filters: any, setFilters: any }) => (
  <div className="bg-gray-50 p-4 rounded-lg mb-6">
    <h3 className="font-semibold mb-4">Advanced Filters</h3>
    
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Document Type</label>
        <select 
          value={filters.documentType || ''} 
          onChange={(e) => setFilters({...filters, documentType: e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="">All Types</option>
          <option value="subscription_agreement">Subscription Agreement</option>
          <option value="term_sheet">Term Sheet</option>
          <option value="shareholders_agreement">Shareholders Agreement</option>
          <option value="financial_report">Financial Report</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Section Type</label>
        <select 
          value={filters.sectionType || ''} 
          onChange={(e) => setFilters({...filters, sectionType: e.target.value})}
          className="w-full p-2 border rounded"
        >
          <option value="">All Sections</option>
          <option value="investment_terms">Investment Terms</option>
          <option value="governance">Governance</option>
          <option value="financial_data">Financial Data</option>
          <option value="legal_terms">Legal Terms</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Min Confidence</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1" 
          value={filters.minConfidence || 0}
          onChange={(e) => setFilters({...filters, minConfidence: parseFloat(e.target.value)})}
          className="w-full"
        />
        <span className="text-xs text-gray-500">{(filters.minConfidence || 0).toFixed(1)}</span>
      </div>
      
      <div className="space-y-2">
        <label className="flex items-center">
          <input 
            type="checkbox" 
            checked={filters.hasInvestmentAmount || false}
            onChange={(e) => setFilters({...filters, hasInvestmentAmount: e.target.checked})}
            className="mr-2"
          />
          Has Investment Amount
        </label>
        <label className="flex items-center">
          <input 
            type="checkbox" 
            checked={filters.hasValuation || false}
            onChange={(e) => setFilters({...filters, hasValuation: e.target.checked})}
            className="mr-2"
          />
          Has Valuation
        </label>
        <label className="flex items-center">
          <input 
            type="checkbox" 
            checked={filters.hasGovernanceTerms || false}
            onChange={(e) => setFilters({...filters, hasGovernanceTerms: e.target.checked})}
            className="mr-2"
          />
          Has Governance Terms
        </label>
      </div>
    </div>
  </div>
);
```

### Step 7: Test Complete Integration
**Command:**
```bash
# Test various search scenarios
curl -X POST http://localhost:3000/api/search-optimized \
  -H "Content-Type: application/json" \
  -d '{"query": "Series A investment terms", "filters": {"hasInvestmentAmount": true}}'

curl -X POST http://localhost:3000/api/search-optimized \
  -H "Content-Type: application/json" \
  -d '{"query": "board governance", "filters": {"hasGovernanceTerms": true, "minConfidence": 0.8}}'

curl -X POST http://localhost:3000/api/search-optimized \
  -H "Content-Type: application/json" \
  -d '{"query": "liquidation preference", "filters": {"sectionType": "investment_terms"}}'
```

### Step 8: Production Build Test
**Command:**
```bash
npm run build
npm start
```

**What this does:**
- Builds the production version
- Tests that all optimizations work in production
- Verifies performance improvements

## Troubleshooting

### If API calls fail:
1. Check that backend collection exists
2. Verify environment variables
3. Check browser console for errors

### If search results are empty:
1. Ensure backend ingestion completed successfully
2. Check Weaviate connection
3. Verify collection name matches

### If filters don't work:
1. Check filter parameter names match schema
2. Verify data types (boolean vs string)
3. Test with simpler filters first

## Expected Improvements

After completing all steps, you should see:

✅ **Enhanced Search Results** - Better relevance with Voyage Context-3
✅ **Structured Data Display** - Investment amounts, parties, confidence scores
✅ **Advanced Filtering** - Filter by content type, confidence, structured data
✅ **Better Performance** - Faster searches with more accurate results
✅ **Rich Metadata** - Document classification, section types, content flags

## Next Steps

1. Test all search scenarios
2. Customize the UI to match your design
3. Add more advanced filtering options
4. Monitor performance and user feedback
5. Consider adding analytics for search patterns

The optimized collection provides a much richer search experience with structured data that enables powerful filtering and better user insights!
