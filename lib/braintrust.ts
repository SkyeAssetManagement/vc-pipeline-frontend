import { initLogger, wrapOpenAI, wrapAnthropic } from 'braintrust';

let logger: any = null;

export function getBraintrustLogger() {
  if (!logger && process.env.BRAINTRUST_API_KEY) {
    logger = initLogger({
      projectName: 'VeronaAI',
      apiKey: process.env.BRAINTRUST_API_KEY,
    });
  }
  return logger;
}

export async function startSpan<T>(
  name: string,
  callback: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const logger = getBraintrustLogger();

  if (!logger) {
    // If no logger, just run the callback
    return callback();
  }

  // Use the logger directly with traced
  return logger.traced(
    async (span: any) => {
      if (metadata) {
        span.log({
          input: metadata.input,
          metadata: metadata,
        });
      }

      try {
        const result = await callback();
        span.log({
          output: result,
          metrics: {
            success: 1,
          },
        });
        return result;
      } catch (error) {
        span.log({
          error: error instanceof Error ? error.message : String(error),
          metrics: {
            success: 0,
          },
        });
        throw error;
      }
    },
    {
      name,
      event: {
        input: metadata?.input,
        metadata,
      },
    }
  );
}

export { wrapOpenAI, wrapAnthropic };