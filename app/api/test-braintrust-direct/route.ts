import { NextRequest, NextResponse } from 'next/server';
import { initLogger, flush } from 'braintrust';

export async function GET() {
  console.log('Testing Braintrust direct connection...');
  console.log('API Key exists:', !!process.env.BRAINTRUST_API_KEY);
  console.log('API Key prefix:', process.env.BRAINTRUST_API_KEY?.substring(0, 10) + '...');

  try {
    // Create a logger directly
    const logger = initLogger({
      projectName: 'VeronaAI',
      apiKey: process.env.BRAINTRUST_API_KEY!,
      asyncFlush: false,
    });

    console.log('Logger created successfully');

    // Log a simple test event
    await logger.log({
      input: {
        test: 'direct-api-test',
        timestamp: new Date().toISOString()
      },
      output: {
        message: 'Test successful',
        endpoint: 'test-braintrust-direct'
      },
      metrics: {
        test_value: 1,
        success: 1
      },
      metadata: {
        source: 'api-test',
        environment: process.env.NODE_ENV || 'development'
      }
    });

    console.log('Log sent to Braintrust');

    // Ensure logs are flushed
    await flush();
    console.log('Logs flushed');

    return NextResponse.json({
      success: true,
      message: 'Test log sent to Braintrust',
      timestamp: new Date().toISOString(),
      projectName: 'VeronaAI',
      hasApiKey: !!process.env.BRAINTRUST_API_KEY,
    });

  } catch (error) {
    console.error('Braintrust test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.BRAINTRUST_API_KEY,
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const logger = initLogger({
      projectName: 'VeronaAI',
      apiKey: process.env.BRAINTRUST_API_KEY!,
      asyncFlush: false,
    });

    // Log the request
    await logger.log({
      input: body,
      output: {
        processed: true,
        timestamp: new Date().toISOString()
      },
      metrics: {
        request_size: JSON.stringify(body).length,
        success: 1
      },
      metadata: {
        endpoint: 'test-braintrust-direct',
        method: 'POST'
      }
    });

    // Flush logs
    await flush();

    return NextResponse.json({
      success: true,
      message: 'Request logged to Braintrust',
      echo: body,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Braintrust POST error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}