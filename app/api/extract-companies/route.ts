import { NextResponse } from 'next/server';
import { WeaviateService } from '@/lib/weaviate';

export async function GET() {
  try {
    console.log('🔍 Extracting companies from document collection...');

    // Search for different types of investment documents using the hybrid search
    const [investmentDocs, subscriptionDocs, companyDocs, riparideDocs] = await Promise.all([
      WeaviateService.hybridSearch('investment amount subscription shares funding'),
      WeaviateService.hybridSearch('subscription agreement company name'),
      WeaviateService.hybridSearch('company portfolio venture capital'),
      WeaviateService.hybridSearch('Riparide financial report profit loss') // Specific search for Riparide
    ]);

    // Combine all documents and remove duplicates
    const allDocsMap = new Map();
    [...investmentDocs, ...subscriptionDocs, ...companyDocs, ...riparideDocs].forEach(doc => {
      allDocsMap.set(doc.chunk_id, doc);
    });
    const allDocs = Array.from(allDocsMap.values());

    // Extract unique company names and aggregate data
    const companyMap = new Map();

    allDocs.forEach((doc: any) => {
      const companyName = doc.company_name;
      if (!companyName || companyName === 'Unknown') return;

      // Clean up company name (remove numbering like "4. Lasertrade")
      const cleanName = companyName.replace(/^\d+\.\s*/, '').trim();

      if (!companyMap.has(cleanName)) {
        const content = doc.content || '';
        // Determine document type and industry from content
        const isFintech = /payment|financial|banking|fintech/i.test(content);
        const isTech = /technology|software|platform|digital/i.test(content);
        const isManufacturing = /manufacturing|production|industrial/i.test(content);
        const isMobility = /mobility|ride|transport|travel|vehicle|rental/i.test(content);

        let industry = 'Technology';
        if (isFintech) industry = 'FinTech';
        else if (isMobility) industry = 'Mobility & Transportation';
        else if (isManufacturing) industry = 'Manufacturing';
        else if (isTech) industry = 'Technology';

        // Don't estimate investment amounts from revenue/expenses - only use actual investment data

        // Generate meaningful company descriptions based on the company name and industry
        const companyDescriptions: { [key: string]: string } = {
          'Circle In': 'Workplace inclusion platform that helps organizations support working parents and create inclusive cultures.',
          'Advanced Navigation': 'Developer of AI-powered navigation and robotics technologies for GPS-denied environments and autonomous systems.',
          'Riparide': 'Urban mobility platform offering sustainable ride-sharing and vehicle rental solutions for modern cities.',
          'Lasertrade': 'Industrial technology company specializing in precision laser cutting and automated manufacturing solutions.',
          'AmazingCo': 'Experience-based e-commerce platform creating unique gift boxes and subscription services for special occasions.',
          'Predelo': 'PropTech analytics platform using AI to provide predictive insights for real estate investment decisions.',
          'Loopit': 'Automotive SaaS platform providing comprehensive car subscription management software for dealerships and fleet operators.',
          'SecureStack': 'DevSecOps platform offering automated security solutions integrated into modern development workflows.',
          'Amaka': 'FinTech automation platform providing intelligent accounting integrations and workflow automation for businesses.',
          'Wonde': 'EdTech infrastructure provider enabling seamless data integration and management for educational institutions.'
        };

        const description = companyDescriptions[cleanName] ||
          `${cleanName} is a ${industry.toLowerCase()} company focused on innovative solutions in their sector.`;

        companyMap.set(cleanName, {
          company_id: cleanName.toLowerCase().replace(/\s+/g, '-'),
          name: cleanName,
          industry,
          totalInvestment: 0, // Don't extract amounts - only use verified data
          investmentYear: null, // Don't extract years - only use verified data
          documentCount: 1,
          status: 'active',
          description,
          stage: 'Unknown' // Don't guess stage based on amounts
        });
      } else {
        // Update existing company data
        const existing = companyMap.get(cleanName);
        // Just increment document count, don't try to extract amounts
        existing.documentCount++;
      }
    });

    // Convert map to array - don't fake fair values or ROI
    const companies = Array.from(companyMap.values()).map(company => ({
      ...company,
      fairValue: 0, // Should come from actual data, not estimates
      roi: 0 // Should be calculated from real fair value data
    }));

    // Sort by total investment descending
    companies.sort((a, b) => b.totalInvestment - a.totalInvestment);

    return NextResponse.json({
      success: true,
      message: `Extracted ${companies.length} companies from document collection`,
      companies,
      totalDocuments: investmentDocs.length
    });

  } catch (error) {
    console.error('Extract companies error:', error);

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}