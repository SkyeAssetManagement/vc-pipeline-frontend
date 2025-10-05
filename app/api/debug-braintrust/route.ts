import { NextResponse } from 'next/server';

export async function GET() {
  // Check environment
  const apiKey = process.env.BRAINTRUST_API_KEY;
  const hasKey = !!apiKey;
  const keyPrefix = apiKey ? apiKey.substring(0, 10) + '...' : 'Not found';

  // Try to make a direct API call to Braintrust
  let apiTestResult = 'Not tested';
  let apiError = null;

  if (apiKey) {
    try {
      // Try to fetch projects from Braintrust API
      const response = await fetch('https://api.braintrust.dev/v1/project', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        apiTestResult = `Success! Found ${data.objects?.length || 0} projects`;

        // Check if VeronaAI project exists
        const veronaProject = data.objects?.find((p: any) => p.name === 'VeronaAI');
        if (veronaProject) {
          apiTestResult += ' (VeronaAI project found!)';
        } else {
          apiTestResult += ' (VeronaAI project NOT found - you may need to create it)';
        }
      } else {
        apiTestResult = `Failed with status: ${response.status}`;
        const errorText = await response.text();
        apiError = errorText.substring(0, 200);
      }
    } catch (error) {
      apiTestResult = 'Network error';
      apiError = error instanceof Error ? error.message : String(error);
    }
  }

  // Return diagnostic info
  return NextResponse.json({
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasApiKey: hasKey,
      apiKeyPrefix: keyPrefix,
    },
    apiConnection: {
      testResult: apiTestResult,
      error: apiError,
    },
    suggestions: [
      hasKey ? '✅ API key is configured' : '❌ API key is missing',
      apiTestResult.includes('Success') ? '✅ API connection works' : '❌ API connection failed',
      apiTestResult.includes('VeronaAI project found') ? '✅ VeronaAI project exists' : '⚠️ Create VeronaAI project in Braintrust dashboard',
    ],
    nextSteps: !apiTestResult.includes('VeronaAI project found') ?
      'Go to https://www.braintrust.dev/app and create a project named "VeronaAI"' :
      'Everything looks good! Logs should be appearing in Braintrust.',
  });
}