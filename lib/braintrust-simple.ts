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

    // Log to console for debugging
    console.log('[Braintrust]', JSON.stringify(logData));

    // Send to Braintrust API directly using the project ID
    const projectId = '33b48cef-bb63-4500-995b-b4633530045f'; // VeronaAI project ID
    const response = await fetch(`https://api.braintrust.dev/v1/project_logs/${projectId}/insert`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.BRAINTRUST_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events: [{
          input,
          output,
          error: error ? String(error) : undefined,
          metrics: metrics || { success: error ? 0 : 1 },
          metadata: {
            operation,
            timestamp: new Date().toISOString(),
          },
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Braintrust] API error:', response.status, errorText);
    }
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