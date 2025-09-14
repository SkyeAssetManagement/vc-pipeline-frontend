import { NextRequest, NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';

async function generateAnswer(query: string, results: any[], structuredData: any) {
  try {
    // Prepare context from search results
    const context = results.slice(0, 5).map((result, i) => 
      `Document ${i + 1} (${result.company} - ${result.type}):\n${result.content}\n`
    ).join('\n');

    // Add structured data context if available
    let structuredContext = '';
    if (structuredData.investments?.length > 0) {
      const totalRaised = structuredData.totalRaised || 0;
      const avgInvestment = structuredData.averageInvestment || 0;
      structuredContext = `\n\nPortfolio Summary:\n- Total Investment Amount: $${totalRaised.toLocaleString()}\n- Average Investment: $${avgInvestment.toLocaleString()}\n- Number of Investment Rounds: ${structuredData.investments.length}`;
    }

    const prompt = `You are a VC portfolio analyst. Based on the following documents and data, provide a comprehensive answer to the user's question.

User Question: "${query}"

Relevant Documents:
${context}
${structuredContext}

Instructions:
- Synthesize the information into a clear, conversational response
- Focus on specific numbers, companies, and investment details mentioned
- If discussing investments, include amounts, dates, and key terms
- Highlight the most relevant and important information
- Keep the response concise but informative (2-4 paragraphs max)
- Use a professional but accessible tone
- If the information is incomplete, acknowledge what's known vs unknown

Provide a direct answer to the user's question:`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || null;

  } catch (error) {
    console.error('Answer generation failed:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { query, searchType = 'hybrid', filters } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Searching for: "${query}" (type: ${searchType})`);

    // Check if it's an investment query - search both documents and structured data
    const isInvestmentQuery = query.toLowerCase().includes('investment') || 
                             query.toLowerCase().includes('amount') ||
                             query.toLowerCase().includes('funding') ||
                             query.toLowerCase().includes('round');

    let results;
    let structuredResults = {};

    // Always search document chunks for content
    if (searchType === 'semantic') {
      results = await WeaviateService.semanticSearch(query, filters);
    } else {
      results = await WeaviateService.hybridSearch(query, 0.7);
    }

    // For investment queries, also get structured investment data
    if (isInvestmentQuery) {
      try {
        const [investments, companies, investors] = await Promise.all([
          WeaviateService.getInvestments(),
          WeaviateService.getCompanies(), 
          WeaviateService.getInvestors()
        ]);

        structuredResults = {
          investments,
          companies,
          investors,
          totalRaised: investments.reduce((sum, inv) => sum + inv.investment_amount, 0),
          averageInvestment: investments.length ? investments.reduce((sum, inv) => sum + inv.investment_amount, 0) / investments.length : 0
        };
      } catch (err) {
        console.error('Failed to get structured data:', err);
      }
    }

    // Format results for the frontend
    const formattedResults = (results || []).map((chunk: any) => ({
      id: chunk.chunk_id || Math.random().toString(36),
      title: `${chunk.document_type || 'Document'} - ${chunk.section_type || 'Section'}`,
      type: chunk.document_type || 'Document',
      company: chunk.company_name || 'Unknown Company',
      content: chunk.text || chunk.content || 'No content available',
      confidence: chunk._additional?.score || chunk.extraction_confidence || 0,
      metadata: {
        section_type: chunk.section_type,
        document_type: chunk.document_type,
        chunk_index: chunk.chunk_index,
        text_length: chunk.text_length,
        has_financial_data: chunk.has_financial_data,
        has_legal_terms: chunk.has_legal_terms,
        key_entities: chunk.key_entities,
        key_terms: chunk.key_terms
      }
    }));

    // Generate AI-powered answer synthesis
    let synthesizedAnswer = null;
    if (formattedResults.length > 0) {
      synthesizedAnswer = await generateAnswer(query, formattedResults, structuredResults);
    }

    return NextResponse.json({
      success: true,
      answer: synthesizedAnswer,
      results: formattedResults,
      structuredData: structuredResults,
      query,
      searchType,
      resultCount: formattedResults.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Search failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter q is required' },
      { status: 400 }
    );
  }

  try {
    const results = await WeaviateService.hybridSearch(query);
    return NextResponse.json({
      success: true,
      results: results || [],
      query
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}