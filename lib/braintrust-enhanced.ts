import { initLogger, wrapOpenAI, wrapAnthropic } from 'braintrust';

let logger: any = null;

export function getBraintrustLogger() {
  if (!logger && process.env.BRAINTRUST_API_KEY) {
    try {
      logger = initLogger({
        projectName: 'VeronaAI',
        apiKey: process.env.BRAINTRUST_API_KEY,
        asyncFlush: true,
      });

      if (process.env.NODE_ENV === 'production') {
        console.log('[Braintrust] Logger initialized for production');
      }
    } catch (error) {
      console.error('[Braintrust] Failed to initialize logger:', error);
    }
  }
  return logger;
}

interface SpanMetadata {
  input?: any;
  userId?: string;
  sessionId?: string;
  feature?: string;
  searchType?: string;
  companyName?: string;
  documentType?: string;
  [key: string]: any;
}

interface SpanScores {
  relevance?: number;
  completeness?: number;
  accuracy?: number;
  responseTime?: number;
  tokenEfficiency?: number;
  [key: string]: number | undefined;
}

export async function tracedOperation<T>(
  operationName: string,
  callback: () => Promise<T>,
  metadata?: SpanMetadata,
  calculateScores?: (result: T) => SpanScores
): Promise<T> {
  const logger = getBraintrustLogger();

  if (!logger) {
    return callback();
  }

  const startTime = Date.now();
  const isProduction = process.env.NODE_ENV === 'production';
  const deploymentUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL;

  return logger.traced(
    async (span: any) => {
      // Log input and metadata
      span.log({
        input: metadata?.input,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development',
          deploymentUrl,
          isProduction,
          vercelEnv: process.env.VERCEL_ENV,
          vercelRegion: process.env.VERCEL_REGION,
        },
      });

      try {
        const result = await callback();
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Calculate automatic scores
        let scores: SpanScores = {
          responseTime: Math.min(1, 1000 / responseTime), // Score based on response time (1 second = 1.0)
        };

        // Add custom scores if provided
        if (calculateScores) {
          const customScores = calculateScores(result);
          scores = { ...scores, ...customScores };
        }

        span.log({
          output: result,
          scores,
          metrics: {
            success: 1,
            responseTimeMs: responseTime,
            timestamp: endTime,
          },
        });

        return result;
      } catch (error) {
        const endTime = Date.now();

        span.log({
          error: error instanceof Error ? error.message : String(error),
          errorStack: error instanceof Error ? error.stack : undefined,
          scores: {
            success: 0,
            errorOccurred: 1,
          },
          metrics: {
            success: 0,
            responseTimeMs: endTime - startTime,
            errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
          },
        });

        throw error;
      }
    },
    {
      name: operationName,
      event: {
        input: metadata?.input,
        metadata,
      },
    }
  );
}

// Helper function to calculate search relevance score
export function calculateSearchRelevance(
  query: string,
  results: any[],
  confidence?: number
): number {
  if (!results || results.length === 0) return 0;

  // Factors for relevance scoring
  const hasResults = results.length > 0 ? 0.3 : 0;
  const resultCount = Math.min(results.length / 10, 0.3); // Max 0.3 for 10+ results
  const confidenceScore = (confidence || 0) * 0.4; // Max 0.4 from confidence

  return hasResults + resultCount + confidenceScore;
}

// Helper function to calculate answer completeness
export function calculateCompleteness(
  answer: string,
  sources: any[]
): number {
  if (!answer) return 0;

  const answerLength = Math.min(answer.length / 500, 0.5); // Max 0.5 for 500+ chars
  const sourceCount = Math.min(sources.length / 5, 0.3); // Max 0.3 for 5+ sources
  const hasStructure = answer.includes('\n') ? 0.2 : 0; // 0.2 if formatted

  return answerLength + sourceCount + hasStructure;
}

// Helper to track API endpoint performance
export async function trackEndpointPerformance<T>(
  endpoint: string,
  request: any,
  handler: () => Promise<T>
): Promise<T> {
  return tracedOperation(
    `api-${endpoint}`,
    handler,
    {
      endpoint,
      method: request.method || 'POST',
      url: request.url,
      headers: request.headers ? Object.fromEntries(request.headers.entries()) : {},
    },
    (result: any) => {
      // Calculate scores based on the result
      const scores: SpanScores = {
        success: 1,
      };

      // Add specific scores for search endpoints
      if (endpoint.includes('search') && result) {
        scores.relevance = calculateSearchRelevance(
          request.body?.query,
          result.results,
          result.confidence
        );
        scores.completeness = calculateCompleteness(
          result.aiAnswer,
          result.sources || []
        );
        scores.resultCount = Math.min(result.totalResults / 20, 1);
      }

      return scores;
    }
  );
}

// Export wrapped AI clients
export { wrapOpenAI, wrapAnthropic };