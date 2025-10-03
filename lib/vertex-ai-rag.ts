import { GoogleAuth } from 'google-auth-library';

interface VertexAISearchResult {
  content: string;
  document_type?: string;
  company_name?: string;
  score?: number;
  metadata?: Record<string, any>;
}

export class VertexAIRAGService {
  private projectId: string;
  private location: string;
  private ragCorpusId: string;
  private apiKey?: string;
  private auth?: GoogleAuth;

  constructor() {
    this.projectId = process.env.VERTEX_AI_PROJECT_ID || '';
    this.location = process.env.VERTEX_AI_LOCATION || 'europe-west4';
    this.ragCorpusId = process.env.VERTEX_AI_DATASTORE_ID || '';
    this.apiKey = process.env.VERTEX_AI_API_KEY;

    if (!this.projectId || !this.ragCorpusId) {
      console.warn('Vertex AI configuration incomplete. Please set VERTEX_AI_PROJECT_ID and VERTEX_AI_DATASTORE_ID');
    }

    // Initialize Google Auth for RAG Corpus API (which requires OAuth2)
    this.auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // RAG Corpus API requires OAuth2, not API keys
    const client = await this.auth!.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to get access token. Please ensure Google Cloud credentials are configured.');
    }

    return {
      'Authorization': `Bearer ${accessToken.token}`,
      'Content-Type': 'application/json',
    };
  }

  async search(query: string, filters?: any): Promise<VertexAISearchResult[]> {
    try {
      // Use Vertex AI RAG API endpoint for RAG Corpus
      const searchEndpoint = `https://${this.location}-aiplatform.googleapis.com/v1beta1/projects/${this.projectId}/locations/${this.location}/ragCorpora/${this.ragCorpusId}:query`;

      // RAG Corpus API uses different request format
      const requestBody = {
        text: query,
        similarityTopK: filters?.limit || 20,
        vectorDistanceThreshold: 0.3,
      };

      const headers = await this.getAuthHeaders();

      console.log('Querying RAG Corpus:', searchEndpoint);
      const response = await fetch(searchEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RAG Corpus query failed:', errorText);
        throw new Error(`Vertex AI RAG query failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      // Transform RAG Corpus response to match our expected format
      const results: VertexAISearchResult[] = [];

      // Process RAG contexts
      if (data.contexts) {
        for (const context of data.contexts) {
          const chunkContent = context.sourceUri?.ragFileChunks?.[0]?.content || context.text || '';
          const distance = context.distance || 0;

          results.push({
            content: chunkContent,
            document_type: 'Document',
            company_name: 'Unknown Company',
            score: 1.0 - distance, // Convert distance to similarity score
            metadata: {
              sourceUri: context.sourceUri,
              distance: distance,
            },
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Vertex AI RAG search error:', error);

      // Fallback: Return empty results if auth fails
      if (error instanceof Error && error.message.includes('credentials')) {
        console.warn('Authentication failed. Please configure Google Cloud credentials.');
        return [];
      }

      throw error;
    }
  }

  // Use Gemini API with API key for answer generation (this supports API keys)
  async answerQueryWithGemini(query: string, contexts: VertexAISearchResult[]): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error('API key required for Gemini generation');
      }

      // Use the generativeai endpoint which supports API keys
      const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;

      const contextText = contexts.slice(0, 5).map(c => c.content).join('\n\n');

      const requestBody = {
        contents: [{
          parts: [{
            text: `Based on the following context, provide a comprehensive answer to this question: ${query}

Context from documents:
${contextText}

Please provide a clear, detailed answer based on the information provided.`
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
          topP: 0.8,
        },
      };

      const response = await fetch(geminiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini generation failed:', errorText);
        throw new Error(`Gemini generation failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated';
    } catch (error) {
      console.error('Gemini generation error:', error);
      throw error;
    }
  }

  // Alternative: Simple search that returns formatted results
  async performSearch(query: string, filters?: any): Promise<VertexAISearchResult[]> {
    // Since RAG Corpus requires OAuth2, we'll need proper authentication
    // For now, let's create a mock response to test the integration

    console.log(`Attempting to search RAG Corpus for: "${query}"`);
    console.log('Filters:', filters);

    // Try to use the actual RAG Corpus if credentials are available
    try {
      return await this.search(query, filters);
    } catch (error) {
      console.warn('RAG Corpus search failed, returning mock data:', error);

      // Return mock data for testing the frontend integration
      return [
        {
          content: `Mock result for query "${query}". To enable real RAG Corpus search, you need to configure Google Cloud OAuth2 credentials (not just an API key). The RAG Corpus API requires authentication via a service account or user credentials.`,
          document_type: 'System Message',
          company_name: 'System',
          score: 1.0,
          metadata: {
            isMock: true,
            error: error instanceof Error ? error.message : 'Unknown error',
            helpText: 'Set up Google Cloud credentials using: gcloud auth application-default login',
          }
        }
      ];
    }
  }
}

// Export singleton instance
export const vertexAIService = new VertexAIRAGService();