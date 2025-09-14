import { NextRequest, NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (id) {
      // Get single company by ID
      const company = await WeaviateService.getCompanyById(id);
      if (!company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        company
      });
    } else {
      // Get all companies
      const companies = await WeaviateService.getCompanies();
      return NextResponse.json({
        success: true,
        companies: companies || [],
        count: companies?.length || 0
      });
    }
  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch companies',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();
    
    // Apply filters if provided
    const companies = await WeaviateService.getCompanies(filters);
    
    return NextResponse.json({
      success: true,
      companies: companies || [],
      count: companies?.length || 0,
      filters
    });
  } catch (error) {
    console.error('Companies API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}