import { NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';
import { OptimizedWeaviateService } from '@/lib/weaviate-optimized';

export async function GET() {
  try {
    console.log('🔗 Testing Weaviate SmartExtraction connection...');

    // Test SmartExtraction collection with sample searches
    const [investmentSearch, companySearch, stats] = await Promise.all([
      WeaviateService.hybridSearch('investment amount subscription agreement', 0.7),
      WeaviateService.semanticSearch('company portfolio venture capital'),
      OptimizedWeaviateService.getDocumentStats()
    ]);

    return NextResponse.json({
      success: true,
      message: 'SmartExtraction collection connection successful!',
      stats,
      sampleSearchResults: {
        investmentSearch: investmentSearch.slice(0, 3),
        companySearch: companySearch.slice(0, 3)
      },
      collectionInfo: {
        name: 'SmartExtraction',
        vectorizer: 'Voyage-3',
        totalChunks: stats.totalChunks,
        uniqueCompanies: stats.companies.length,
        documentTypes: stats.documentTypes
      }
    });

  } catch (error) {
    console.error('Connection test failed:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}