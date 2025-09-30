// Simple Braintrust integration for Next.js API routes
// This avoids webpack module issues

export async function logToBraintrust(
  operation: string,
  input: any,
  output: any,
  error?: any,
  metrics?: Record<string, number>
) {
  if (!process.env.BRAINTRUST_API_KEY) {
    return;
  }

  try {
    const logData = {
      project_id: 'VeronaAI',
      input,
      output,
      error: error ? String(error) : undefined,
      metrics: metrics || { success: error ? 0 : 1 },
      metadata: {
        operation,
        timestamp: new Date().toISOString(),
      },
    };

    // Log to console for now (Braintrust will pick this up if configured)
    console.log('[Braintrust]', JSON.stringify(logData));

    // You can also send to Braintrust API directly if needed
    // await fetch('https://api.braintrust.dev/v1/logs', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.BRAINTRUST_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(logData),
    // });
  } catch (err) {
    console.error('[Braintrust] Logging error:', err);
  }
}

export function withBraintrustTracing<T>(
  operation: string,
  fn: () => Promise<T>,
  getInput?: () => any
): Promise<T> {
  const input = getInput ? getInput() : {};
  const startTime = Date.now();

  return fn()
    .then((result) => {
      const duration = Date.now() - startTime;
      logToBraintrust(operation, input, result, undefined, {
        success: 1,
        duration_ms: duration,
      });
      return result;
    })
    .catch((error) => {
      const duration = Date.now() - startTime;
      logToBraintrust(operation, input, undefined, error, {
        success: 0,
        duration_ms: duration,
      });
      throw error;
    });
}