'use client';

import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Company } from '@/types/company';
import { companiesData, formatCurrency, calculatePerformance } from '@/lib/companies-data';

interface EnrichedCompany extends Company {
  totalInvestment: number;
  fairValue: number;
  initialInvestmentYear?: number;
  stage?: string;
}

export default function CompaniesListPage() {
  const [companies, setCompanies] = useState<EnrichedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompaniesData();
  }, []);

  const fetchCompaniesData = async () => {
    try {
      setLoading(true);

      // Fetch extracted companies from documents and structured data
      const [extractedResponse, structuredResponse] = await Promise.all([
        fetch('/api/extract-companies'),
        fetch('/api/test') // This includes Loopit structured data
      ]);

      if (!extractedResponse.ok) {
        throw new Error('Failed to fetch extracted companies');
      }

      const extractedData = await extractedResponse.json();
      const structuredData = await structuredResponse.json();

      if (!extractedData.success) {
        throw new Error(extractedData.error || 'Failed to load extracted companies');
      }

      // Convert extracted companies to EnrichedCompany format
      const enrichedCompanies: EnrichedCompany[] = extractedData.companies.map((company: any) => {
        return {
          company_id: company.company_id,
          name: company.name,
          legal_name: company.name,
          jurisdiction: 'Australia', // Default for portfolio
          industry: company.industry,
          sector: company.industry,
          status: company.status,
          description: company.description,
          website: '',
          headquarters: 'Australia',
          created_at: '',
          updated_at: '',
          totalInvestment: company.totalInvestment,
          fairValue: company.fairValue,
          initialInvestmentYear: company.investmentYear,
          stage: company.stage
        };
      });

      // Add structured Loopit data if available and not already included
      if (structuredData.success && structuredData.sampleData?.companies?.length > 0) {
        const structuredCompany = structuredData.sampleData.companies[0];
        const structuredInvestments = structuredData.sampleData.investments || [];

        // Check if Loopit is already in extracted data
        const existingLoopit = enrichedCompanies.find(c =>
          c.name.toLowerCase().includes('loopit') || c.company_id.includes('loopit')
        );

        if (existingLoopit) {
          // Update existing Loopit with structured data
          const totalStructuredInvestment = structuredInvestments.reduce(
            (sum: number, inv: any) => sum + (inv.investment_amount || 0), 0
          );
          existingLoopit.totalInvestment = Math.max(existingLoopit.totalInvestment, totalStructuredInvestment);
          existingLoopit.fairValue = existingLoopit.totalInvestment * 2.5; // Estimate fair value
          existingLoopit.description = structuredCompany.description || existingLoopit.description;
          existingLoopit.website = structuredCompany.website || existingLoopit.website;
          existingLoopit.initialInvestmentYear = 2022; // From structured data
        }
      }

      setCompanies(enrichedCompanies);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load companies');

      // Fallback to mock data
      const mockEnrichedData: EnrichedCompany[] = companiesData.map(mock => ({
        company_id: mock.id,
        name: mock.company_name,
        legal_name: mock.company_name,
        jurisdiction: 'Australia',
        industry: mock.industry,
        sector: mock.industry,
        status: mock.status,
        description: mock.description,
        website: mock.website || '',
        headquarters: 'Unknown',
        created_at: '',
        updated_at: '',
        totalInvestment: mock.investment_amount,
        fairValue: mock.fair_value,
        initialInvestmentYear: mock.initial_investment_year,
        stage: mock.stage
      }));
      setCompanies(mockEnrichedData);
    } finally {
      setLoading(false);
    }
  };

  const totalInvestment = companies.reduce((sum, c) => sum + c.totalInvestment, 0);
  const totalFairValue = companies.reduce((sum, c) => sum + c.fairValue, 0);
  const totalPerformance = calculatePerformance(totalInvestment, totalFairValue);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf9f5' }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/VeronaCapitalLogo.png"
                alt="Verona Capital"
                className="h-8"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Portfolio Companies
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore detailed information about each company in our venture capital portfolio
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Investment</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalInvestment)}
            </p>
          </div>
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Fair Value</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalFairValue)}
            </p>
          </div>
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Portfolio Return</h3>
            <div className="flex items-center gap-2">
              {totalPerformance.status === 'positive' ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : totalPerformance.status === 'negative' ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <Minus className="w-5 h-5 text-gray-500" />
              )}
              <p className={`text-2xl font-bold ${
                totalPerformance.status === 'positive'
                  ? 'text-green-600 dark:text-green-400'
                  : totalPerformance.status === 'negative'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {totalPerformance.percentage.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading portfolio companies...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-red-500">⚠️</div>
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200">Error Loading Data</h3>
                <p className="text-red-700 dark:text-red-300 text-sm mt-1">{error}</p>
                <p className="text-red-600 dark:text-red-400 text-xs mt-2">Showing fallback data below.</p>
              </div>
            </div>
          </div>
        )}

        {/* Companies Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies
              .sort((a, b) => b.fairValue - a.fairValue)
              .map(company => {
              const performance = calculatePerformance(company.totalInvestment, company.fairValue);

              return (
                <Link
                  key={company.company_id}
                  href={`/companies/${company.company_id}`}
                  className="rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 group" style={{ backgroundColor: '#ffffff' }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {company.name}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {company.industry}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Investment Year</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {company.initialInvestmentYear || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Investment</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(company.totalInvestment)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Fair Value</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(company.fairValue)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ROI</span>
                      <div className="flex items-center gap-2">
                        {performance.status === 'positive' ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : performance.status === 'negative' ? (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        ) : (
                          <Minus className="w-4 h-4 text-gray-500" />
                        )}
                        <span className={`font-bold ${
                          performance.status === 'positive'
                            ? 'text-green-600 dark:text-green-400'
                            : performance.status === 'negative'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {performance.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                      {company.stage || 'Unknown'}
                    </span>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      company.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : company.status === 'exited'
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}