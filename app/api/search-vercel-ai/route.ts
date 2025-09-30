import { NextRequest, NextResponse } from 'next/server';
import { OptimizedWeaviateService } from '@/lib/weaviate-optimized';
import { ClaudeVercelService } from '@/lib/claude-vercel-ai';
import { initBraintrustForVercel, logCustomEvent } from '@/lib/braintrust-vercel';

// Initialize Braintrust on module load
initBraintrustForVercel();

// Enhanced query processing for optimized collection
function enhanceQueryWithContext(query: string): string {
  const vcKeywords = [
    'investment', 'investor', 'funding', 'round', 'valuation', 'deal', 'term sheet',
    'subscription', 'agreement', 'participant', 'lead investor', 'venture', 'capital',
    'equity', 'shares', 'stakeholder', 'portfolio', 'raise', 'series', 'seed'
  ];

  // Check if query contains VC-related terms
  const isVCQuery = vcKeywords.some(keyword =>
    query.toLowerCase().includes(keyword.toLowerCase())
  );

  if (isVCQuery) {
    // Add context for better semantic search
    return `${query} venture capital investment terms governance`;
  }

  return query;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const body = await request.json();

  try {
    const {
      query,
      filters,
      searchType = 'hybrid',
      useOptimizedCollection = true
    } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    console.log('🔍 Processing search with Vercel AI SDK:', query);

    // Enhance query with context
    const enhancedQuery = enhanceQueryWithContext(query);

    // Perform Weaviate search
    const searchStartTime = Date.now();
    let searchResults;

    if (useOptimizedCollection) {
      if (filters && Object.keys(filters).length > 0) {
        searchResults = await OptimizedWeaviateService.searchWithFilters(enhancedQuery, filters);
      } else if (searchType === 'semantic') {
        searchResults = await OptimizedWeaviateService.semanticSearch(enhancedQuery, filters);
      } else {
        searchResults = await OptimizedWeaviateService.hybridSearch(enhancedQuery, filters);
      }
    } else {
      const { WeaviateService } = await import('@/lib/weaviate');
      if (searchType === 'semantic') {
        searchResults = await WeaviateService.semanticSearch(enhancedQuery, filters);
      } else {
        searchResults = await WeaviateService.hybridSearch(enhancedQuery, filters);
      }
    }

    // Log Weaviate search event
    await logCustomEvent('weaviate-search', {
      query: enhancedQuery,
      searchType,
      useOptimizedCollection,
    }, {
      resultsCount: Array.isArray(searchResults) ? searchResults.length : 0,
    }, {
      duration_ms: Date.now() - searchStartTime,
      results_count: Array.isArray(searchResults) ? searchResults.length : 0,
    });

    // Ensure searchResults is an array
    if (!Array.isArray(searchResults)) {
      console.warn('Search results is not an array:', searchResults);
      searchResults = [];
    }

    // Process results (similar to original implementation)
    const processedResults = searchResults.map((result: any, index: number) => ({
      id: result.chunk_id || `result-${index}`,
      type: 'document',
      title: result.document_type || 'Document',
      company: result.company_name || 'Unknown Company',
      snippet: result.content ? result.content.substring(0, 200) + '...' : 'No content available',
      content: result.content,
      documentType: result.document_type,
      industry: result.industry,
      investmentAmount: result.investment_amount || 0,
      preMoneyValuation: result.pre_money_valuation || 0,
      postMoneyValuation: result.post_money_valuation || 0,
      ownershipPercentage: result.ownership_percentage || 0,
      score: result._additional?.score || 0,
      extractionConfidence: result.extraction_confidence || 0,
    }));

    // Group by company
    const groupedResults = processedResults.reduce((acc: any, result: any) => {
      const company = result.company;
      if (!acc[company]) {
        acc[company] = {
          company,
          industry: result.industry,
          documents: [],
          totalScore: 0,
        };
      }
      acc[company].documents.push(result);
      acc[company].totalScore += result.score;
      return acc;
    }, {});

    const companyGroups = Object.values(groupedResults)
      .map((group: any) => ({
        ...group,
        averageScore: group.totalScore / group.documents.length,
      }))
      .sort((a: any, b: any) => b.averageScore - a.averageScore);

    // Generate AI answer using Vercel AI SDK service
    const claudeStartTime = Date.now();
    const claudeResponse = await ClaudeVercelService.generateAnswer(
      query,
      processedResults,
      companyGroups
    );

    // Log Claude generation event (wrapAISDKModel already logs internally)
    await logCustomEvent('claude-answer-generated', {
      query,
      resultsCount: processedResults.length,
    }, {
      answer: claudeResponse.answer,
      confidence: claudeResponse.confidence,
    }, {
      duration_ms: Date.now() - claudeStartTime,
      answer_length: claudeResponse.answer.length,
    });

    const response = {
      success: true,
      query,
      enhancedQuery,
      results: processedResults,
      companyGroups,
      aiAnswer: claudeResponse.answer,
      confidence: claudeResponse.confidence,
      sources: claudeResponse.sources,
      totalResults: processedResults.length,
      searchType,
      filters: filters || {},
      useOptimizedCollection,
      metadata: {
        totalDuration: Date.now() - startTime,
        searchDuration: searchStartTime ? Date.now() - searchStartTime : 0,
        aiDuration: claudeStartTime ? Date.now() - claudeStartTime : 0,
      }
    };

    // Log complete request
    await logCustomEvent('search-api-complete', {
      query,
      searchType,
    }, {
      success: true,
      resultsCount: processedResults.length,
    }, {
      total_duration_ms: Date.now() - startTime,
      success: 1,
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Search API error:', error);

    // Log error
    await logCustomEvent('search-api-error', {
      query: body.query,
    }, {
      error: error instanceof Error ? error.message : String(error),
    }, {
      duration_ms: Date.now() - startTime,
      success: 0,
    });

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Search API with Vercel AI SDK and Braintrust',
    features: [
      'Vercel AI SDK for Claude integration',
      'Automatic Braintrust tracing via wrapAISDKModel',
      'Optimized for Vercel deployment',
      'Serverless-friendly logging'
    ],
    status: 'ready'
  });
}