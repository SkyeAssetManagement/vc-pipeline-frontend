import { NextRequest, NextResponse } from 'next/server';
import { withBraintrustTracing } from '@/lib/braintrust-simple';

export async function GET() {
  return withBraintrustTracing(
    'test-braintrust-get',
    async () => {
      return NextResponse.json({
        success: true,
        message: 'Braintrust test successful',
        hasBraintrustKey: !!process.env.BRAINTRUST_API_KEY,
        timestamp: new Date().toISOString()
      });
    }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return withBraintrustTracing(
    'test-braintrust-post',
    async () => {
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));

      return NextResponse.json({
        success: true,
        echo: body,
        processed: true,
        timestamp: new Date().toISOString()
      });
    },
    () => body
  );
}