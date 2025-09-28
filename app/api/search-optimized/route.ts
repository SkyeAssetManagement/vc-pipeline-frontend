import { NextRequest, NextResponse } from 'next/server';
import { OptimizedWeaviateService } from '@/lib/weaviate-optimized';
import { ClaudeService } from '@/lib/claude';

// Enhanced query processing for optimized collection
function enhanceQueryWithContext(query: string): string {
  const vcKeywords = [
    'investment', 'investor', 'funding', 'round', 'valuation', 'deal', 'term sheet',
    'subscription', 'agreement', 'participant', 'lead investor', 'venture', 'capital',
    'equity', 'shares', 'stakeholder', 'portfolio', 'raise', 'series', 'seed',
    'liquidation preference', 'anti-dilution', 'board seats', 'governance'
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
  try {
    const body = await request.json();
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

    console.log('🔍 Processing optimized search query:', query);
    console.log('📊 Filters:', filters);
    console.log('🔧 Search type:', searchType);
    console.log('⚡ Using optimized collection:', useOptimizedCollection);

    // Enhance query with context
    const enhancedQuery = enhanceQueryWithContext(query);
    console.log('🔍 Enhanced query:', enhancedQuery);

    // Perform search based on type and collection
    let searchResults;
    
    if (useOptimizedCollection) {
      if (filters && Object.keys(filters).length > 0) {
        // Use filtered search for optimized collection
        searchResults = await OptimizedWeaviateService.searchWithFilters(enhancedQuery, filters);
      } else if (searchType === 'semantic') {
        searchResults = await OptimizedWeaviateService.semanticSearch(enhancedQuery, filters);
      } else {
        searchResults = await OptimizedWeaviateService.hybridSearch(enhancedQuery, filters);
      }
    } else {
      // Fallback to original service
      const { WeaviateService } = await import('@/lib/weaviate');
      if (searchType === 'semantic') {
        searchResults = await WeaviateService.semanticSearch(enhancedQuery, filters);
      } else {
        searchResults = await WeaviateService.hybridSearch(enhancedQuery, filters);
      }
    }

    // Ensure searchResults is an array
    if (!Array.isArray(searchResults)) {
      console.warn('Search results is not an array:', searchResults);
      searchResults = [];
    }

    // Process and format results with VC_PE_Claude97_Production schema
    const processedResults = searchResults.map((result: any, index: number) => ({
      id: result.chunk_id || `result-${index}`,
      type: 'document',
      title: result.document_type || 'Document',
      company: result.company_name || 'Unknown Company',
      snippet: result.content ? result.content.substring(0, 200) + '...' : 'No content available',
      content: result.content,

      // Enhanced metadata from VC_PE_Claude97_Production schema
      documentType: result.document_type,
      industry: result.industry,
      claudeExtraction: result.claude_extraction,

      // Financial data
      investmentAmount: result.investment_amount || 0,
      preMoneyValuation: result.pre_money_valuation || 0,
      postMoneyValuation: result.post_money_valuation || 0,
      fairValue: result.fair_value || 0,
      valuationPricePerShare: 0, // Field removed from schema
      ownershipPercentage: result.ownership_percentage || 0,
      currentOwnershipPercentage: 0, // Field removed from schema
      multipleOnInvestedCapital: 0, // Field removed from schema
      internalRateOfReturn: 0, // Field removed from schema

      // Content analysis flags (derived from financial data)
      hasInvestmentAmount: (result.investment_amount && result.investment_amount > 0) || false,
      hasValuation: (result.pre_money_valuation && result.pre_money_valuation > 0) || false,
      hasOwnership: (result.ownership_percentage && result.ownership_percentage > 0) || false,
      hasFairValue: (result.fair_value && result.fair_value > 0) || false,

      // Standard metadata
      score: result._additional?.score || 0,
      extractionConfidence: result.extraction_confidence || 0,
      extractionTimestamp: null, // Field removed from schema
      contentConfidence: result.extraction_confidence || 0, // Map for backwards compatibility

      // Backwards compatibility fields
      extractedAmounts: result.investment_amount ? [{ value: result.investment_amount, currency: 'USD' }] : [],
      extractedDates: [], // Timestamp field removed from schema
      keyParties: [],
      financialTerms: {
        investment_amount: result.investment_amount,
        pre_money_valuation: result.pre_money_valuation,
        post_money_valuation: result.post_money_valuation,
        ownership_percentage: result.ownership_percentage
      }
    }));

    // Group results by company for better organization
    const groupedResults = processedResults.reduce((acc: any, result: any) => {
      const company = result.company;
      if (!acc[company]) {
        acc[company] = {
          company,
          industry: result.industry,
          documents: [],
          totalScore: 0,
          hasInvestmentAmount: false,
          hasValuation: false,
          hasOwnership: false,
          hasFairValue: false,
          averageConfidence: 0,
          totalInvestmentAmount: 0,
          totalValuation: 0,
          averageOwnership: 0
        };
      }
      acc[company].documents.push(result);
      acc[company].totalScore += result.score;
      acc[company].hasInvestmentAmount = acc[company].hasInvestmentAmount || result.hasInvestmentAmount;
      acc[company].hasValuation = acc[company].hasValuation || result.hasValuation;
      acc[company].hasOwnership = acc[company].hasOwnership || result.hasOwnership;
      acc[company].hasFairValue = acc[company].hasFairValue || result.hasFairValue;

      // Aggregate financial data
      if (result.investmentAmount > 0) {
        acc[company].totalInvestmentAmount += result.investmentAmount;
      }
      if (result.preMoneyValuation > 0) {
        acc[company].totalValuation += result.preMoneyValuation;
      }
      if (result.ownershipPercentage > 0) {
        acc[company].averageOwnership += result.ownershipPercentage;
      }

      return acc;
    }, {});

    // Convert to array and sort by relevance
    const companyGroups = Object.values(groupedResults)
      .map((group: any) => ({
        ...group,
        averageScore: group.totalScore / group.documents.length,
        averageConfidence: group.documents.reduce((sum: number, doc: any) => sum + doc.contentConfidence, 0) / group.documents.length
      }))
      .sort((a: any, b: any) => b.averageScore - a.averageScore);

    // Generate AI-synthesized answer using Claude
    const claudeResponse = await ClaudeService.generateAnswer(query, processedResults, companyGroups);
    const aiAnswer = claudeResponse.answer;

    console.log('Optimized search completed:', {
      resultsCount: processedResults.length,
      companyGroups: companyGroups.length,
      aiAnswerLength: aiAnswer.length,
      confidence: claudeResponse.confidence,
      sources: claudeResponse.sources.length,
      useOptimizedCollection
    });

    return NextResponse.json({
      success: true,
      query,
      enhancedQuery,
      results: processedResults,
      companyGroups,
      aiAnswer,
      confidence: claudeResponse.confidence,
      sources: claudeResponse.sources,
      totalResults: processedResults.length,
      searchType,
      filters: filters || {},
      useOptimizedCollection,
      metadata: {
        hasStructuredData: processedResults.some((r: any) => r.hasInvestmentAmount || r.hasValuation || r.hasOwnership),
        averageConfidence: processedResults.length > 0 ? processedResults.reduce((sum: number, r: any) => sum + r.extractionConfidence, 0) / processedResults.length : 0,
        companiesWithInvestmentAmount: companyGroups.filter((g: any) => g.hasInvestmentAmount).length,
        companiesWithValuation: companyGroups.filter((g: any) => g.hasValuation).length,
        companiesWithOwnership: companyGroups.filter((g: any) => g.hasOwnership).length,
        averageInvestmentAmount: processedResults.filter((r: any) => r.investmentAmount > 0).length > 0 ?
          processedResults.filter((r: any) => r.investmentAmount > 0).reduce((sum: number, r: any) => sum + r.investmentAmount, 0) /
          processedResults.filter((r: any) => r.investmentAmount > 0).length : 0,
        averageValuation: processedResults.filter((r: any) => r.preMoneyValuation > 0).length > 0 ?
          processedResults.filter((r: any) => r.preMoneyValuation > 0).reduce((sum: number, r: any) => sum + r.preMoneyValuation, 0) /
          processedResults.filter((r: any) => r.preMoneyValuation > 0).length : 0
      }
    });

  } catch (error) {
    console.error('Optimized search API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Optimized Search API is running',
    endpoints: {
      POST: '/api/search-optimized - Perform enhanced search with structured data'
    },
    features: [
      'Voyage Context-3 embeddings',
      'Strategic structured data extraction',
      'Enhanced document classification',
      'Content analysis flags',
      'Advanced filtering capabilities'
    ],
    example: {
      method: 'POST',
      body: {
        query: 'Show me Series A investment terms',
        filters: {
          company: 'Advanced Navigation',
          documentType: 'subscription_agreement',
          hasInvestmentAmount: true,
          minConfidence: 0.7
        },
        searchType: 'hybrid',
        useOptimizedCollection: true
      }
    }
  });
}
