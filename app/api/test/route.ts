import { NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';

export async function GET() {
  try {
    console.log('🔗 Testing Weaviate connection...');
    
    // Test portfolio overview
    const overview = await WeaviateService.getPortfolioOverview();
    
    // Get sample data
    const [companies, investors, investments] = await Promise.all([
      WeaviateService.getCompanies(),
      WeaviateService.getInvestors(), 
      WeaviateService.getInvestments()
    ]);

    return NextResponse.json({
      success: true,
      message: 'Connection successful!',
      overview,
      sampleData: {
        companies: companies.slice(0, 3),
        investors: investors.slice(0, 3),
        investments: investments.slice(0, 5)
      },
      stats: {
        totalCompanies: companies.length,
        totalInvestors: investors.length,
        totalInvestments: investments.length
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