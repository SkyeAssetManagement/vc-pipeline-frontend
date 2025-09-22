'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, Globe, Calendar, DollarSign, BarChart3, Minus } from 'lucide-react';
import { formatCurrency, calculatePerformance } from '@/lib/portfolio-utils';

function OtherCompanies({ currentCompanyId }: { currentCompanyId: string }) {
  const [otherCompanies, setOtherCompanies] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/extract-companies')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const filtered = data.companies.filter((c: any) => c.company_id !== currentCompanyId);
          setOtherCompanies(filtered);
        }
      })
      .catch(() => {
        // NO PLACEHOLDER DATA FALLBACK
        // If real data cannot be fetched, show empty list
        setOtherCompanies([]);
      });
  }, [currentCompanyId]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {otherCompanies.map(c => (
        <Link
          key={c.company_id}
          href={`/companies/${c.company_id}`}
          className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
        >
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">{c.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.stage}</p>
        </Link>
      ))}
    </div>
  );
}

export default function CompanyPage() {
  const params = useParams();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanyData();
  }, [params.id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);

      // First try to get from extracted companies
      const extractedResponse = await fetch('/api/extract-companies');
      if (extractedResponse.ok) {
        const extractedData = await extractedResponse.json();
        if (extractedData.success) {
          const foundCompany = extractedData.companies.find(
            (c: any) => c.company_id === params.id || c.name.toLowerCase().replace(/\s+/g, '-') === params.id
          );

          if (foundCompany) {
            setCompany({
              ...foundCompany,
              company_name: foundCompany.name,
              investment_amount: foundCompany.totalInvestment,
              fair_value: foundCompany.fairValue,
              initial_investment_year: foundCompany.investmentYear
            });
          } else {
            // NO PLACEHOLDER DATA FALLBACK
            setError('Company not found in portfolio data');
          }
        }
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      // NO PLACEHOLDER DATA FALLBACK
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf9f5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf9f5' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Company Not Found'}
          </h1>
          <Link href="/companies" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Back to Companies
          </Link>
        </div>
      </div>
    );
  }

  const performance = calculatePerformance(company.investment_amount, company.fair_value);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fbf9f5' }}>
      {/* Header */}
      <div className="shadow-sm border-b" style={{ backgroundColor: '#ffffff', borderColor: '#e5e5e5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/companies"
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Portfolio
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
        {/* Hero Section */}
        <div className="rounded-xl shadow-lg p-8 mb-8" style={{ backgroundColor: '#ffffff' }}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {company.company_name}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                  {company.industry}
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                  {company.stage}
                </span>
                <span className={`px-3 py-1 rounded-full ${
                  company.status === 'active'
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : company.status === 'exited'
                    ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                </span>
              </div>
            </div>
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Globe className="w-4 h-4" />
                Visit Website
              </a>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {company.description}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Initial Investment Year */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {company.initial_investment_year}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment Year</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {new Date().getFullYear() - company.initial_investment_year} years active
            </p>
          </div>

          {/* Investment Amount */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(company.investment_amount)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Initial Investment</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Capital deployed
            </p>
          </div>

          {/* Fair Value */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(company.fair_value)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Fair Value</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Latest valuation
            </p>
          </div>

          {/* ROI */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              {performance.status === 'positive' ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : performance.status === 'negative' ? (
                <TrendingDown className="w-8 h-8 text-red-500" />
              ) : (
                <Minus className="w-8 h-8 text-gray-500" />
              )}
              <span className={`text-2xl font-bold ${
                performance.status === 'positive'
                  ? 'text-green-600 dark:text-green-400'
                  : performance.status === 'negative'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {performance.percentage.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Return on Investment</h3>
            <p className={`text-xs mt-1 ${
              performance.status === 'positive'
                ? 'text-green-600 dark:text-green-400'
                : performance.status === 'negative'
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {performance.status === 'positive' ? '+' : ''}{formatCurrency(performance.absolute)} change
            </p>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="rounded-xl shadow-lg p-8 mb-8" style={{ backgroundColor: '#ffffff' }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Performance Overview</h2>
          <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Performance chart visualization</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Connect to live data for real-time metrics</p>
            </div>
          </div>
        </div>

        {/* Comprehensive Investment Metrics */}
        <div className="space-y-8 mb-8">
          {/* Investment Performance */}
          <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#18181b' }}>Investment Performance</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Investment Amount</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {formatCurrency(company.investment_amount || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Fair Value</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {formatCurrency(company.fair_value || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Gain/(Loss)</p>
                <p className={`text-lg font-semibold ${performance.status === 'positive' ? 'text-green-600' : performance.status === 'negative' ? 'text-red-600' : 'text-gray-900'}`}>
                  {performance.status === 'positive' ? '+' : ''}{formatCurrency(performance.absolute)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">MOIC</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.fair_value && company.investment_amount ?
                    (company.fair_value / company.investment_amount).toFixed(2) : '0.00'}x
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">IRR</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.initial_investment_year && performance.percentage ?
                    (performance.percentage / (new Date().getFullYear() - company.initial_investment_year)).toFixed(1) : 'N/A'}%
                </p>
              </div>
            </div>
          </div>

          {/* Investment Details */}
          <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#18181b' }}>Investment Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Initial Investment Date</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.initial_investment_year || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Holding Period</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.initial_investment_year ?
                    `${new Date().getFullYear() - company.initial_investment_year} years` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Class of Shares</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.stage === 'Seed' ? 'Seed Preferred' :
                   company.stage === 'Series A' ? 'Series A Preferred' : 'Common'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Holding %</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.ownership_percentage ? `${company.ownership_percentage}%` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Company Valuation */}
          <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#18181b' }}>Company Valuation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Raised</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.total_raised ? formatCurrency(company.total_raised) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Company Valuation</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.company_valuation ? formatCurrency(company.company_valuation) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Round Date</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.last_round_date || `${company.initial_investment_year || 2022}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Industry</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.industry}
                </p>
              </div>
            </div>
          </div>

          {/* Share Details */}
          <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-xl font-bold mb-6" style={{ color: '#18181b' }}>Share Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pre-money Valuation</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.pre_money ? formatCurrency(company.pre_money) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Post-money Valuation</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.post_money ? formatCurrency(company.post_money) : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Shares Owned</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.shares_owned || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Price Per Share</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.price_per_share ? `$${company.price_per_share.toFixed(2)}` : 'N/A'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Shares on Issue</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.shares_on_issue || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Original PPS</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.original_pps ? `$${company.original_pps.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Current PPS</p>
                <p className="text-lg font-semibold" style={{ color: '#18181b' }}>
                  {company.valuation_pps ? `$${company.valuation_pps.toFixed(2)}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">PPS Growth</p>
                <p className={`text-lg font-semibold ${performance.status === 'positive' ? 'text-green-600' : 'text-gray-900'}`}>
                  {performance.status === 'positive' ? '+' : ''}{performance.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Other Portfolio Companies */}
        <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#ffffff' }}>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Other Portfolio Companies</h2>
          <OtherCompanies currentCompanyId={company.company_id || company.id} />
        </div>
      </div>
    </div>
  );
}