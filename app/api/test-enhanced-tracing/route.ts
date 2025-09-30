import { NextRequest, NextResponse } from 'next/server';
import { tracedOperation } from '@/lib/braintrust-enhanced';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { testType = 'simple', userId = 'test-user', sessionId = 'test-session' } = body;

  try {

    const result = await tracedOperation(
      `test-enhanced-${testType}`,
      async () => {
        // Simulate different test scenarios
        if (testType === 'simple') {
          // Simple successful operation
          await new Promise(resolve => setTimeout(resolve, 100));
          return {
            message: 'Simple test completed',
            data: { value: Math.random() * 100 },
            timestamp: new Date().toISOString(),
          };
        } else if (testType === 'complex') {
          // Complex operation with multiple steps
          const steps: Array<{ step: number; value: number }> = [];

          for (let i = 1; i <= 3; i++) {
            await tracedOperation(
              `sub-operation-${i}`,
              async () => {
                await new Promise(resolve => setTimeout(resolve, 50 * i));
                const stepResult = { step: i, value: Math.random() * 50 };
                steps.push(stepResult);
                return stepResult;
              },
              {
                parentOperation: 'test-enhanced-complex',
                stepNumber: i,
                userId,
                sessionId,
              }
            );
          }

          return {
            message: 'Complex test with sub-operations completed',
            steps,
            totalValue: steps.reduce((sum, s) => sum + s.value, 0),
            timestamp: new Date().toISOString(),
          };
        } else if (testType === 'error') {
          // Simulate an error
          await new Promise(resolve => setTimeout(resolve, 50));
          throw new Error('Intentional test error for tracing demonstration');
        }

        return { message: 'Unknown test type', testType };
      },
      {
        input: { testType },
        userId,
        sessionId,
        feature: 'enhanced-tracing-test',
        environment: process.env.NODE_ENV || 'development',
      },
      (result) => {
        // Calculate custom scores based on the result
        if (testType === 'simple') {
          return {
            success: 1,
            dataQuality: result.data?.value > 50 ? 1 : 0.5,
            performance: 0.9,
          };
        } else if (testType === 'complex') {
          return {
            success: 1,
            completeness: result.steps?.length >= 3 ? 1 : result.steps?.length / 3,
            totalValue: Math.min(result.totalValue / 100, 1),
            complexity: 0.8,
          };
        }
        return { success: 1 };
      }
    );

    return NextResponse.json({
      success: true,
      result,
      tracing: {
        enabled: true,
        message: 'Check Braintrust dashboard for detailed trace information',
        projectName: 'VeronaAI',
      },
    });
  } catch (error) {
    console.error('Test enhanced tracing error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed',
      tracing: {
        enabled: true,
        message: 'Error has been traced to Braintrust',
      },
    }, { status: testType === 'error' ? 400 : 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Enhanced Tracing Test Endpoint',
    description: 'Use this endpoint to test the enhanced Braintrust tracing with custom scoring',
    usage: {
      method: 'POST',
      body: {
        testType: 'simple | complex | error',
        userId: 'optional-user-id',
        sessionId: 'optional-session-id',
      },
    },
    examples: [
      {
        description: 'Simple test with scoring',
        body: { testType: 'simple' },
      },
      {
        description: 'Complex test with sub-operations',
        body: { testType: 'complex' },
      },
      {
        description: 'Error test to see error tracking',
        body: { testType: 'error' },
      },
    ],
  });
}