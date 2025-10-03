import { NextRequest, NextResponse } from 'next/server';
import { DSPyEnhancedRAGService } from '@/lib/dspy/rag-service';

// Initialize DSPy-enhanced RAG service
const dspyRAG = new DSPyEnhancedRAGService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, userId, sessionId } = body;

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Search query is required'
      }, { status: 400 });
    }

    console.log('🤖 DSPy-Enhanced Search:', query);
    console.log('📊 Filters:', filters);

    // Use DSPy-optimized search
    const result = await dspyRAG.search(query, filters, userId, sessionId);

    return NextResponse.json({
      success: true,
      ...result,
      optimizationStatus: dspyRAG.getPipelineStatus()
    });

  } catch (error) {
    console.error('DSPy Search API error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}

// GET endpoint for pipeline status
export async function GET() {
  const status = dspyRAG.getPipelineStatus();

  return NextResponse.json({
    message: 'DSPy-Enhanced Search API',
    status,
    endpoints: {
      POST: '/api/search-dspy - Perform DSPy-optimized search',
      GET: '/api/search-dspy - Get pipeline status'
    }
  });
}

// PUT endpoint to trigger manual optimization
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'optimize') {
      console.log('📈 Manual optimization triggered');
      await dspyRAG.manualOptimize();

      return NextResponse.json({
        success: true,
        message: 'Optimization triggered successfully',
        status: dspyRAG.getPipelineStatus()
      });
    } else if (action === 'model-change') {
      const { newModel } = body;
      await dspyRAG.handleModelChange(newModel);

      return NextResponse.json({
        success: true,
        message: `Model changed to ${newModel}`,
        status: dspyRAG.getPipelineStatus()
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action'
    }, { status: 400 });

  } catch (error) {
    console.error('DSPy optimization error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Optimization failed'
    }, { status: 500 });
  }
}