import { initLogger, wrapAISDK, wrapAISDKModel } from 'braintrust';

// Initialize Braintrust logger for Vercel deployment
let logger: any = null;

export function initBraintrustForVercel() {
  if (!logger && process.env.BRAINTRUST_API_KEY) {
    logger = initLogger({
      projectName: 'VeronaAI',
      apiKey: process.env.BRAINTRUST_API_KEY,
      // Automatically flush logs in serverless environment
      asyncFlush: false, // Changed to false for immediate flushing
    });

    console.log('✅ Braintrust logger initialized for VeronaAI project');

    // Test log to verify connection
    logger.log({
      input: { test: 'initialization' },
      output: { status: 'logger_created' },
      metadata: { timestamp: new Date().toISOString() }
    });
  }
  return logger;
}

// Wrapper for Vercel AI SDK
export { wrapAISDK, wrapAISDKModel };

// Get the logger instance
export function getBraintrustLogger() {
  return logger || initBraintrustForVercel();
}

// Helper to log custom events
export async function logCustomEvent(
  eventName: string,
  input: any,
  output: any,
  metrics?: Record<string, number>
) {
  const logger = getBraintrustLogger();
  if (logger) {
    await logger.log({
      input,
      output,
      metrics: metrics || {},
      metadata: {
        event: eventName,
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Middleware for API routes
export function withBraintrustMiddleware(handler: Function) {
  return async (req: any, res: any) => {
    // Initialize Braintrust on each request
    initBraintrustForVercel();

    const startTime = Date.now();
    const method = req.method;
    const url = req.url;

    try {
      const result = await handler(req, res);

      // Log successful request
      await logCustomEvent('api-request', {
        method,
        url,
        body: req.body,
      }, {
        status: res.statusCode,
        duration: Date.now() - startTime,
      }, {
        duration_ms: Date.now() - startTime,
        success: 1,
      });

      return result;
    } catch (error) {
      // Log failed request
      await logCustomEvent('api-request-error', {
        method,
        url,
        body: req.body,
      }, {
        error: error instanceof Error ? error.message : String(error),
      }, {
        duration_ms: Date.now() - startTime,
        success: 0,
      });

      throw error;
    }
  };
}