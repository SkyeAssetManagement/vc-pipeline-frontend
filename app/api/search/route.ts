import { NextRequest, NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';
import { ClaudeService } from '@/lib/claude';
import { tracedOperation, calculateSearchRelevance, calculateCompleteness } from '@/lib/braintrust-enhanced';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, searchType = 'hybrid', userId, sessionId } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    console.log('🔍 Processing search query:', query);
    console.log('📊 Filters:', filters);
    console.log('🔧 Search type:', searchType);

    // Enhance query to include office investment entities for relevant searches
    const enhancedQuery = enhanceQueryWithInvestors(query);
    console.log('🔍 Enhanced query:', enhancedQuery);

    // Perform search using Weaviate
    let searchResults = await tracedOperation(
      `weaviate-${searchType}-search`,
      async () => {
        // Use Weaviate search based on search type
        if (searchType === 'semantic') {
          return await WeaviateService.semanticSearch(enhancedQuery, filters);
        } else {
          // hybrid or default
          return await WeaviateService.hybridSearch(enhancedQuery, 0.7);
        }
      },
      {
        input: enhancedQuery,
        userId,
        sessionId,
        searchType,
        filters,
        feature: 'document-search',
        companyName: filters?.company,
        documentType: filters?.documentType,
      },
      (results) => {
        const resultCount = Array.isArray(results) ? results.length : 0;
        return {
          // Score the search results - ensure all values are valid numbers
          resultCount: Math.min(resultCount / 20, 1), // Max score at 20 results
          hasResults: resultCount > 0 ? 1 : 0,
          searchQuality: resultCount > 10 ? 1 : Math.max(0, resultCount / 10),
        };
      }
    );

    // Ensure searchResults is an array
    if (!Array.isArray(searchResults)) {
      console.warn('Search results is not an array:', searchResults);
      searchResults = [];
    }

    // Process and format results from Weaviate SmartExtraction collection
    const processedResults = searchResults.map((result: any, index: number) => {
      // Parse extracted fields from JSON
      let extractedFields = {};
      try {
        extractedFields = result.extracted_fields ? JSON.parse(result.extracted_fields) : {};
      } catch (e) {
        console.warn('Failed to parse extracted_fields:', e);
      }

      return {
        id: result.chunk_id || `result-${index}`,
        type: 'document',
        title: extractedFields.document_type || result.file_path?.split('/').pop() || 'Document',
        company: result.company_name || 'Unknown Company',
        snippet: result.content ? result.content.substring(0, 200) + '...' : 'No content available',
        content: result.content,
        filePath: result.file_path,
        extractedFields: extractedFields, // Include all dynamically extracted metadata
        score: result._additional?.score || 0
      };
    });

    // Group results by company for better organization
    const groupedResults = processedResults.reduce((acc: any, result: any) => {
      const company = result.company;
      if (!acc[company]) {
        acc[company] = {
          company,
          documents: [],
          totalScore: 0
        };
      }
      acc[company].documents.push(result);
      acc[company].totalScore += result.score;
      return acc;
    }, {});

    // Convert to array and sort by relevance
    const companyGroups = Object.values(groupedResults)
      .map((group: any) => ({
        ...group,
        averageScore: group.totalScore / group.documents.length
      }))
      .sort((a: any, b: any) => b.averageScore - a.averageScore);

    // Generate AI-synthesized answer using Claude with tracing
    const claudeResponse = await tracedOperation(
      'claude-generate-answer',
      async () => await ClaudeService.generateAnswer(query, processedResults, companyGroups),
      {
        input: query,
        userId,
        sessionId,
        feature: 'ai-synthesis',
        resultsCount: processedResults.length,
        companyCount: companyGroups.length,
      },
      (result) => ({
        relevance: calculateSearchRelevance(query, processedResults, result.confidence) || 0,
        completeness: calculateCompleteness(result.answer || '', result.sources || []) || 0,
        confidenceScore: result.confidence === 'high' ? 1 : result.confidence === 'medium' ? 0.7 : 0.4,
        sourceQuality: Math.min((result.sources?.length || 0) / 5, 1),
      })
    );
    const aiAnswer = claudeResponse.answer;

    console.log('Search completed:', {
      resultsCount: processedResults.length,
      companyGroups: companyGroups.length,
      aiAnswerLength: aiAnswer.length,
      confidence: claudeResponse.confidence,
      sources: claudeResponse.sources.length
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
      filters: filters || {}
    });

  } catch (error) {
    console.error('Search API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
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
