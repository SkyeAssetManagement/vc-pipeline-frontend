import { createAnthropic } from '@ai-sdk/anthropic';
import { wrapAISDKModel } from 'braintrust';
import { generateText, streamText } from 'ai';

// Initialize Anthropic with Braintrust wrapping
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Wrap the model with Braintrust for automatic tracing
export const getClaudeModel = (modelName: string = 'claude-3-5-sonnet-20241022') => {
  const model = anthropic(modelName);

  // Only wrap if Braintrust API key is available
  if (process.env.BRAINTRUST_API_KEY) {
    return wrapAISDKModel(model);
  }

  return model;
};

export interface ClaudeResponse {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  sources: string[];
}

export class ClaudeVercelService {
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

      // Use Vercel AI SDK with Braintrust-wrapped model
      const model = getClaudeModel();

      const { text } = await generateText({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful VC/PE document analysis assistant. Provide accurate, concise answers based on the provided context. If information is not available in the context, say so clearly.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1, // Low temperature for more consistent, factual responses
        maxRetries: 3,
      });

      // Extract sources from the response
      const sources = this.extractSources(searchResults);

      // Determine confidence based on answer quality and source availability
      const confidence = this.determineConfidence(text, searchResults.length);

      return {
        answer: text.trim(),
        confidence,
        sources
      };

    } catch (error) {
      console.error('Claude Vercel AI Service error:', error);

      // Fallback response
      return {
        answer: 'I encountered an error while processing your request. Please try again.',
        confidence: 'low',
        sources: []
      };
    }
  }

  // For streaming responses (useful for real-time UI updates)
  static async *generateAnswerStream(
    query: string,
    searchResults: any[],
    companyGroups: any[]
  ) {
    try {
      const context = this.prepareContext(searchResults, companyGroups);
      const prompt = this.createPrompt(query, context);
      const model = getClaudeModel();

      const { textStream } = await streamText({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful VC/PE document analysis assistant. Provide accurate, concise answers based on the provided context.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        maxRetries: 3,
      });

      for await (const chunk of textStream) {
        yield chunk;
      }
    } catch (error) {
      console.error('Claude Vercel AI Stream error:', error);
      yield 'Error processing request';
    }
  }

  private static prepareContext(searchResults: any[], companyGroups: any[]): string {
    // Group and format the most relevant results
    const topResults = searchResults.slice(0, 10);

    let context = 'Relevant Documents:\n\n';

    topResults.forEach((result, index) => {
      context += `Document ${index + 1}:\n`;
      context += `Company: ${result.company || 'Unknown'}\n`;
      context += `Type: ${result.documentType || 'Unknown'}\n`;
      context += `Content: ${result.content || result.snippet}\n`;

      if (result.investmentAmount) {
        context += `Investment Amount: $${result.investmentAmount}\n`;
      }
      if (result.preMoneyValuation) {
        context += `Pre-Money Valuation: $${result.preMoneyValuation}\n`;
      }
      if (result.ownershipPercentage) {
        context += `Ownership: ${result.ownershipPercentage}%\n`;
      }

      context += '\n---\n\n';
    });

    // Add company group summary
    if (companyGroups.length > 0) {
      context += '\nCompany Summary:\n';
      companyGroups.forEach(group => {
        context += `- ${group.company}: ${group.documents.length} documents`;
        if (group.totalInvestmentAmount) {
          context += `, Total Investment: $${group.totalInvestmentAmount}`;
        }
        context += '\n';
      });
    }

    return context;
  }

  private static createPrompt(query: string, context: string): string {
    return `Based on the following venture capital and private equity documents, please answer this query: "${query}"

${context}

Please provide a comprehensive answer based only on the information available in the documents above. If specific information is not available, mention what is missing. Format your response with clear sections if appropriate.`;
  }

  private static extractSources(searchResults: any[]): string[] {
    const sources = new Set<string>();

    searchResults.slice(0, 5).forEach(result => {
      if (result.company) {
        sources.add(result.company);
      }
    });

    return Array.from(sources);
  }

  private static determineConfidence(answer: string, resultCount: number): 'high' | 'medium' | 'low' {
    // Simple heuristic for confidence
    if (resultCount === 0 || answer.length < 50) {
      return 'low';
    }

    if (resultCount < 5 || answer.includes('not available') || answer.includes('no information')) {
      return 'medium';
    }

    return 'high';
  }
}