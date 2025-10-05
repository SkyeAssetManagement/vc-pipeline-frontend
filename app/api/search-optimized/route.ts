import { NextRequest, NextResponse } from 'next/server';
import { OptimizedWeaviateService } from '@/lib/weaviate-optimized';
import { ClaudeService } from '@/lib/claude';
import { withBraintrustTracing, logToBraintrust } from '@/lib/braintrust-simple';

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
  const body = await request.json();

  return withBraintrustTracing(
    'search-optimized-api',
    async () => {
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

    console.log('🔍 Processing optimized search query:', query);
    console.log('📊 Filters:', filters);
    console.log('🔧 Search type:', searchType);
    console.log('⚡ Using optimized collection:', useOptimizedCollection);

    // Enhance query with context
    const enhancedQuery = enhanceQueryWithContext(query);
    console.log('🔍 Enhanced query:', enhancedQuery);

    // Perform search based on type and collection
    let searchResults;
    const searchStartTime = Date.now();

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

    // Log Weaviate search metrics
    logToBraintrust('weaviate-search', {
      query: enhancedQuery,
      searchType,
      useOptimizedCollection,
      hasFilters: filters && Object.keys(filters).length > 0
    }, {
      resultsCount: Array.isArray(searchResults) ? searchResults.length : 0
    }, undefined, {
      duration_ms: Date.now() - searchStartTime,
      results_count: Array.isArray(searchResults) ? searchResults.length : 0
    });

    // Ensure searchResults is an array
    if (!Array.isArray(searchResults)) {
      console.warn('Search results is not an array:', searchResults);
      searchResults = [];
    }

    // Process and format results with SmartExtraction schema
    const processedResults = searchResults.map((result: any, index: number) => {
      // Parse extracted_fields JSON
      let extractedFields: Record<string, any> = {};
      try {
        extractedFields = result.extracted_fields ? JSON.parse(result.extracted_fields) : {};
      } catch (e) {
        console.warn('Failed to parse extracted_fields:', e);
      }

      // Extract financial data from extracted_fields
      const investmentAmount = extractedFields.investment_amount || extractedFields.investmentAmount || 0;
      const preMoneyValuation = extractedFields.pre_money_valuation || extractedFields.preMoneyValuation || 0;
      const postMoneyValuation = extractedFields.post_money_valuation || extractedFields.postMoneyValuation || 0;
      const fairValue = extractedFields.fair_value || extractedFields.fairValue || 0;
      const ownershipPercentage = extractedFields.ownership_percentage || extractedFields.ownershipPercentage || 0;

      return {
        id: result.chunk_id || `result-${index}`,
        type: 'document',
        title: result.document_type || extractedFields.document_type || 'Document',
        company: result.company_name || 'Unknown Company',
        snippet: result.content ? result.content.substring(0, 200) + '...' : 'No content available',
        content: result.content,
        filePath: result.file_path,

        // Enhanced metadata from SmartExtraction schema
        documentType: result.document_type,
        sectionType: result.section_type,
        roundInfo: result.round_info,
        chunkIndex: result.chunk_index,
        tokenCount: result.token_count,

        // Financial data from extracted_fields
        investmentAmount,
        preMoneyValuation,
        postMoneyValuation,
        fairValue,
        ownershipPercentage,

        // Additional extracted fields
        extractedFields,

        // Content analysis flags (derived from financial data)
        hasInvestmentAmount: investmentAmount > 0,
        hasValuation: preMoneyValuation > 0 || postMoneyValuation > 0,
        hasOwnership: ownershipPercentage > 0,
        hasFairValue: fairValue > 0,

        // Standard metadata
        score: result._additional?.score || 0,
        extractionConfidence: 1.0, // SmartExtraction doesn't have confidence score
        contentConfidence: 1.0,

        // Backwards compatibility fields
        extractedAmounts: investmentAmount > 0 ? [{ value: investmentAmount, currency: 'USD' }] : [],
        extractedDates: [],
        keyParties: extractedFields.key_parties || [],
        financialTerms: {
          investment_amount: investmentAmount,
          pre_money_valuation: preMoneyValuation,
          post_money_valuation: postMoneyValuation,
          ownership_percentage: ownershipPercentage
        }
      };
    });

    // Group results by company for better organization
    const groupedResults = processedResults.reduce((acc: any, result: any) => {
      const company = result.company;
      if (!acc[company]) {
        acc[company] = {
          company,
          documents: [],
          totalScore: 0,
          hasInvestmentAmount: false,
          hasValuation: false,
          hasOwnership: false,
          hasFairValue: false,
          averageConfidence: 0,
          totalInvestmentAmount: 0,
          totalValuation: 0,
          averageOwnership: 0,
          documentTypes: new Set(),
          roundInfos: new Set()
        };
      }
      acc[company].documents.push(result);
      acc[company].totalScore += result.score;
      acc[company].hasInvestmentAmount = acc[company].hasInvestmentAmount || result.hasInvestmentAmount;
      acc[company].hasValuation = acc[company].hasValuation || result.hasValuation;
      acc[company].hasOwnership = acc[company].hasOwnership || result.hasOwnership;
      acc[company].hasFairValue = acc[company].hasFairValue || result.hasFairValue;

      // Track document types and round info
      if (result.documentType) acc[company].documentTypes.add(result.documentType);
      if (result.roundInfo) acc[company].roundInfos.add(result.roundInfo);

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
        documentTypes: Array.from(group.documentTypes),
        roundInfos: Array.from(group.roundInfos),
        averageScore: group.totalScore / group.documents.length,
        averageConfidence: group.documents.reduce((sum: number, doc: any) => sum + doc.contentConfidence, 0) / group.documents.length
      }))
      .sort((a: any, b: any) => b.averageScore - a.averageScore);

    // Generate AI-synthesized answer using Claude
    const claudeStartTime = Date.now();
    const claudeResponse = await ClaudeService.generateAnswer(query, processedResults, companyGroups);
    const aiAnswer = claudeResponse.answer;

    // Log Claude generation metrics
    logToBraintrust('claude-generate-answer', {
      query,
      resultsCount: processedResults.length,
      companiesCount: companyGroups.length
    }, {
      answer: aiAnswer,
      confidence: claudeResponse.confidence,
      sources: claudeResponse.sources.length
    }, undefined, {
      duration_ms: Date.now() - claudeStartTime,
      answer_length: aiAnswer.length,
      confidence_score: claudeResponse.confidence === 'high' ? 1 : claudeResponse.confidence === 'medium' ? 0.5 : 0.25
    });

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
    },
    () => body
  );
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'Optimized Search API is running',
    endpoints: {
      POST: '/api/search-optimized - Perform enhanced search with structured data'
    },
    features: [
      'Voyage-3 embeddings',
      'Dynamic field extraction with extracted_fields JSON',
      'Enhanced document classification',
      'Content analysis flags',
      'Flexible filtering capabilities'
    ],
    example: {
      method: 'POST',
      body: {
        query: 'Show me Series A investment terms',
        filters: {
          company: 'Advanced Navigation',
          documentType: 'term_sheet',
          roundInfo: 'Series A'
        },
        searchType: 'hybrid',
        useOptimizedCollection: true
      }
    }
  });
}
