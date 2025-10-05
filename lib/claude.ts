import Anthropic from '@anthropic-ai/sdk';
import { wrapAnthropic } from '@/lib/braintrust';

// Wrap Anthropic client for Braintrust tracing
const anthropic = wrapAnthropic(new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
}));

export interface ClaudeResponse {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
}

export class ClaudeService {
  static async generateAnswer(
    query: string, 
    searchResults: any[], 
    companyGroups: any[]
  ): Promise<ClaudeResponse> {
    try {
      // Prepare context from search results
      const context = this.prepareContext(searchResults, companyGroups);
      
      // Create a focused prompt for Claude
      const prompt = this.createPrompt(query, context);

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1000,
        temperature: 0.1, // Low temperature for more consistent, factual responses
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const answer = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Extract sources from the response
      const sources = this.extractSources(searchResults);
      
      // Determine confidence based on answer quality and source availability
      const confidence = this.determineConfidence(answer, searchResults.length);

      return {
        answer: answer.trim(),
        confidence,
        sources
      };

    } catch (error) {
      console.error('Claude API error:', error);
      
      // Fallback to a simple response if Claude fails
      return {
        answer: `I found ${searchResults.length} relevant documents, but I'm having trouble processing them right now. Please try rephrasing your question or check the search results below for specific information.`,
        confidence: 'low',
        sources: this.extractSources(searchResults)
      };
    }
  }

  private static prepareContext(searchResults: any[], companyGroups: any[]): string {
    let context = "PORTFOLIO DOCUMENTS CONTEXT:\n\n";
    
    // Add company group summaries
    companyGroups.forEach((group, index) => {
      const companyName = group.company.replace(/^\d+\.\s*/, '');
      context += `Company ${index + 1}: ${companyName}\n`;
      context += `Documents: ${group.documents.length} found\n`;
      context += `Document Types: ${Array.from(new Set(group.documents.map((d: any) => d.documentType))).join(', ')}\n`;
      context += `Relevance Score: ${group.averageScore?.toFixed(2) || 'N/A'}\n\n`;
    });

    // Add detailed document content (truncated for token limits)
    context += "DETAILED DOCUMENT CONTENT:\n\n";
    searchResults.slice(0, 10).forEach((result, index) => {
      context += `Document ${index + 1}:\n`;
      context += `- Company: ${result.company}\n`;
      context += `- Type: ${result.documentType}\n`;
      context += `- Section: ${result.sectionType || 'N/A'}\n`;
      context += `- Content: ${result.content?.substring(0, 500)}...\n`;
      context += `- File: ${result.filePath?.split('/').pop() || 'N/A'}\n\n`;
    });

    return context;
  }

  private static createPrompt(query: string, context: string): string {
    return `You are an AI assistant for a venture capital firm's portfolio management system. You have access to portfolio documents and company information.

Your task is to answer questions about the VC portfolio based on the provided document context. Be direct, accurate, and professional in your responses.

IMPORTANT GUIDELINES:
1. Answer the user's question directly and specifically
2. Use actual data from the documents when available
3. If you find specific investment amounts, company details, or financial information, include them
4. Be conversational but professional
5. If information isn't available, say so clearly
6. Focus on being helpful for portfolio management decisions

USER QUESTION: "${query}"

${context}

Please provide a direct, helpful answer based on the portfolio documents. If you reference specific information, mention which company or document it came from.`;
  }

  private static extractSources(searchResults: any[]): string[] {
    const sources = new Set<string>();
    
    searchResults.forEach(result => {
      if (result.company) {
        sources.add(result.company.replace(/^\d+\.\s*/, ''));
      }
      if (result.documentType) {
        sources.add(result.documentType);
      }
    });

    return Array.from(sources);
  }

  private static determineConfidence(answer: string, resultCount: number): 'high' | 'medium' | 'low' {
    // High confidence if answer contains specific data and we have good results
    if (resultCount > 5 && (
      answer.includes('$') || 
      answer.includes('investment') || 
      answer.includes('company') ||
      answer.match(/\d+/)
    )) {
      return 'high';
    }
    
    // Medium confidence if we have some results but less specific data
    if (resultCount > 2) {
      return 'medium';
    }
    
    // Low confidence if few results or vague answer
    return 'low';
  }
}
