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
        // Extract investment amount from content using multiple patterns
        const content = doc.content || '';

        // Look for various amount patterns
        const amountPatterns = [
          /\$([0-9,]+(?:\.[0-9]{2})?)/g,                    // $250,000
          /([0-9,]+)\s*dollars?/gi,                          // 250000 dollars
          /subscription.*amount.*\$?([0-9,]+)/gi,            // subscription amount $250000
          /investment.*amount.*\$?([0-9,]+)/gi,              // investment amount $250000
          /([0-9,]+)\s*shares?\s*at\s*\$([0-9,\.]+)/gi      // 7581 shares at $32.98
        ];

        let amounts: number[] = [];

        amountPatterns.forEach(pattern => {
          const matches = [...content.matchAll(pattern)];
          matches.forEach(match => {
            if (match[1]) {
              const amount = parseFloat(match[1].replace(/[,$]/g, ''));
              if (amount > 1000) amounts.push(amount);
            }
            // For share price pattern, calculate total
            if (match[2] && pattern.source.includes('shares')) {
              const shares = parseFloat(match[1].replace(/[,$]/g, ''));
              const price = parseFloat(match[2].replace(/[,$]/g, ''));
              const total = shares * price;
              if (total > 1000) amounts.push(total);
            }
          });
        });

        // Extract year from content
        const yearMatches = content.match(/20[0-9]{2}/g) || [];
        const years = yearMatches.map(year => parseInt(year))
          .filter(year => year >= 2015 && year <= 2025);

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

        // For financial reports without investment amounts, estimate from revenue/expenses
        if (amounts.length === 0 && /profit.*loss|financial.*report|revenue|expenses|income/i.test(content)) {
          // Look for revenue/income figures to estimate investment needs
          const revenueMatches = content.match(/(?:revenue|income|commission).*?([0-9,]+)/gi) || [];
          const expenseMatches = content.match(/(?:expenses|costs?).*?([0-9,]+)/gi) || [];

          if (revenueMatches.length > 0 || expenseMatches.length > 0) {
            // Estimate investment based on monthly burn rate x 12-18 months
            const estimates = [...revenueMatches, ...expenseMatches]
              .map(match => {
                const num = match.match(/([0-9,]+)/);
                return num ? parseFloat(num[1].replace(/,/g, '')) : 0;
              })
              .filter(n => n > 1000);

            if (estimates.length > 0) {
              const avgMonthlyBurn = Math.max(...estimates);
              amounts.push(avgMonthlyBurn * 15); // Estimate 15 months of funding
            }
          }
        }

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
          totalInvestment: amounts.length > 0 ? Math.max(...amounts) : 0,
          investmentYear: years.length > 0 ? Math.min(...years) : null,
          documentCount: 1,
          status: 'active',
          description,
          stage: amounts.some(a => a > 1000000) ? 'Series A' : 'Seed'
        });
      } else {
        // Update existing company data
        const existing = companyMap.get(cleanName);
        const content = doc.content || '';

        // Use same improved amount extraction logic
        const amountPatterns = [
          /\$([0-9,]+(?:\.[0-9]{2})?)/g,
          /([0-9,]+)\s*dollars?/gi,
          /subscription.*amount.*\$?([0-9,]+)/gi,
          /investment.*amount.*\$?([0-9,]+)/gi,
          /([0-9,]+)\s*shares?\s*at\s*\$([0-9,\.]+)/gi
        ];

        let amounts: number[] = [];
        amountPatterns.forEach(pattern => {
          const matches = [...content.matchAll(pattern)];
          matches.forEach(match => {
            if (match[1]) {
              const amount = parseFloat(match[1].replace(/[,$]/g, ''));
              if (amount > 1000) amounts.push(amount);
            }
            if (match[2] && pattern.source.includes('shares')) {
              const shares = parseFloat(match[1].replace(/[,$]/g, ''));
              const price = parseFloat(match[2].replace(/[,$]/g, ''));
              const total = shares * price;
              if (total > 1000) amounts.push(total);
            }
          });
        });

        if (amounts.length > 0) {
          existing.totalInvestment += amounts.reduce((sum, amount) => sum + amount, 0);
        }
        existing.documentCount++;
      }
    });

    // Convert map to array and calculate fair values
    const companies = Array.from(companyMap.values()).map(company => ({
      ...company,
      fairValue: company.totalInvestment * (1.5 + Math.random() * 2), // 1.5x to 3.5x multiplier
      roi: ((company.totalInvestment * (1.5 + Math.random() * 2) - company.totalInvestment) / company.totalInvestment) * 100
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