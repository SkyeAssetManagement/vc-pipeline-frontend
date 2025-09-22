import { NextRequest, NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';
import { ClaudeService } from '@/lib/claude';

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
    const { query, filters, searchType = 'hybrid' } = body;

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

    // Perform search based on type
    let searchResults;
    if (searchType === 'semantic') {
      searchResults = await WeaviateService.semanticSearch(enhancedQuery, filters);
    } else {
      searchResults = await WeaviateService.hybridSearch(enhancedQuery, filters);
    }

    // Ensure searchResults is an array
    if (!Array.isArray(searchResults)) {
      console.warn('Search results is not an array:', searchResults);
      searchResults = [];
    }

    // Process and format results
    const processedResults = searchResults.map((result: any, index: number) => ({
      id: result.chunk_id || `result-${index}`,
      type: 'document',
      title: result.document_type || 'Document',
      company: result.company_name || 'Unknown Company',
      snippet: result.content ? result.content.substring(0, 200) + '...' : 'No content available',
      content: result.content,
      documentType: result.document_type,
      sectionType: result.section_type,
      filePath: result.file_path,
      roundInfo: result.round_info,
      score: result._additional?.score || 0,
      chunkIndex: result.chunk_index,
      tokenCount: result.token_count,
      createdAt: result.created_at
    }));

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

    // Generate AI-synthesized answer using Claude
    const claudeResponse = await ClaudeService.generateAnswer(query, processedResults, companyGroups);
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
