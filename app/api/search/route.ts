import { NextRequest, NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';
import { ClaudeService } from '@/lib/claude';
import { tracedOperation, calculateSearchRelevance, calculateCompleteness } from '@/lib/braintrust-enhanced';
import { DSPyEnhancedRAGService } from '@/lib/dspy/rag-service';

// Function to enhance queries with office investment entities
function enhanceQueryWithInvestors(query: string): string {
  const officeInvestors = ['Upswell Ventures', 'Arrochar Pty Ltd', 'Skye Alba Pty Ltd'];

  // Keywords that suggest the user is asking about investments, deals, or entities
  const investmentKeywords = [
    'investment', 'investor', 'funding', 'round', 'valuation', 'deal', 'term sheet',
    'subscription', 'agreement', 'participant', 'lead investor', 'venture', 'capital',
    'equity', 'shares', 'stakeholder', 'portfolio', 'raise', 'series', 'seed'
  ];

  // Check if query contains investment-related terms
  const isInvestmentQuery = investmentKeywords.some(keyword =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );

  // If it's an investment-related query, enhance with our office entities
  if (isInvestmentQuery) {
    const investorTerms = officeInvestors.join(' OR ');
    return `${query} OR ${investorTerms}`;
  }

  return query;
}

// Initialize DSPy RAG service instance
const dspyRAGService = new DSPyEnhancedRAGService();

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { query, filters, searchType = 'hybrid', userId, sessionId } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required',
        responseTimeMs: Date.now() - startTime
      }, { status: 400 });
    }

    console.log('🔍 Processing search query with DSPy:', query);
    console.log('📊 Filters:', filters);
    console.log('🔧 Search type:', searchType);

    // Use DSPy-enhanced RAG service for optimized search
    const result = await dspyRAGService.search(query, filters, userId, sessionId);

    const responseTimeMs = Date.now() - startTime;

    console.log('✅ DSPy search completed:', {
      resultsCount: result.totalResults,
      confidence: result.confidence,
      sources: result.sources?.length || 0,
      responseTimeMs
    });

    return NextResponse.json({
      success: true,
      query: result.query,
      enhancedQuery: result.enhancedQuery,
      intent: result.intent,
      entities: result.entities,
      results: result.results,
      aiAnswer: result.answer,
      confidence: result.confidence,
      sources: result.sources,
      totalResults: result.totalResults,
      searchType,
      filters: filters || {},
      responseTimeMs,
      modelVersion: 'claude-sonnet-4-5-20250929',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
      responseTimeMs: Date.now() - startTime
    }, { status: 500 });
  }
}

// Claude integration handles all AI responses now

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Search API is running',
    endpoints: {
      POST: '/api/search - Perform search with query and filters'
    },
    example: {
      method: 'POST',
      body: {
        query: 'Show me Series A investment terms',
        filters: {
          company: 'Advanced Navigation',
          documentType: 'term_sheet'
        },
        searchType: 'hybrid'
      }
    }
  });
}
