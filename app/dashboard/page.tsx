'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus, BarChart3, DollarSign, Building2, FileText, Users, Calendar } from 'lucide-react';
import { formatCurrency, calculatePerformance } from '@/lib/portfolio-utils';

interface DashboardMetrics {
  totalCompanies: number;
  totalInvestment: number;
  totalFairValue: number;
  averageROI: number;
  topPerformer: {
    name: string;
    roi: number;
  };
  recentInvestments: Array<{
    company: string;
    amount: number;
    date: string;
  }>;
  industryBreakdown: Array<{
    industry: string;
    count: number;
    percentage: number;
  }>;
  stageBreakdown: Array<{
    stage: string;
    count: number;
    percentage: number;
  }>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch companies data
      const response = await fetch('/api/extract-companies');
      const data = await response.json();

      if (data.success && data.companies) {
        const companies = data.companies;
        
        // Calculate metrics
        const totalInvestment = companies.reduce((sum: number, c: any) => sum + (c.totalInvestment || 0), 0);
        const totalFairValue = companies.reduce((sum: number, c: any) => sum + (c.fairValue || 0), 0);
        const totalPerformance = calculatePerformance(totalInvestment, totalFairValue);
        
        // Find top performer
        const topPerformer = companies.reduce((top: any, current: any) => {
          const currentROI = calculatePerformance(current.totalInvestment || 0, current.fairValue || 0);
          const topROI = calculatePerformance(top.totalInvestment || 0, top.fairValue || 0);
          return currentROI.percentage > topROI.percentage ? current : top;
        }, companies[0]);

        // Industry breakdown
        const industryMap = companies.reduce((acc: any, company: any) => {
          const industry = company.industry || 'Unknown';
          acc[industry] = (acc[industry] || 0) + 1;
          return acc;
        }, {});

        const industryBreakdown = Object.entries(industryMap).map(([industry, count]) => ({
          industry,
          count: count as number,
          percentage: ((count as number) / companies.length) * 100
        }));

        // Stage breakdown
        const stageMap = companies.reduce((acc: any, company: any) => {
          const stage = company.stage || 'Unknown';
          acc[stage] = (acc[stage] || 0) + 1;
          return acc;
        }, {});

        const stageBreakdown = Object.entries(stageMap).map(([stage, count]) => ({
          stage,
          count: count as number,
          percentage: ((count as number) / companies.length) * 100
        }));

        // Recent investments from actual data
        const recentInvestments = companies
          .filter((c: any) => c.investmentYear)
          .sort((a: any, b: any) => b.investmentYear - a.investmentYear)
          .slice(0, 5)
          .map((c: any) => ({
            company: c.name,
            amount: c.totalInvestment || 0,
            date: c.investmentDate || `${c.investmentYear}` // Use actual date or just year
          }));

        setMetrics({
          totalCompanies: companies.length,
          totalInvestment,
          totalFairValue,
          averageROI: totalPerformance.percentage,
          topPerformer: {
            name: topPerformer?.name || 'N/A',
            roi: calculatePerformance(topPerformer?.totalInvestment || 0, topPerformer?.fairValue || 0).percentage
          },
          recentInvestments,
          industryBreakdown,
          stageBreakdown
        });
      } else {
        throw new Error('Failed to fetch companies data');
      }
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf9f5' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fbf9f5' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Dashboard Error'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error || 'Unable to load dashboard data'}
          </p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

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
            Portfolio Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive overview of your venture capital portfolio performance
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Companies */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.totalCompanies}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Portfolio Companies</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Active investments
            </p>
          </div>

          {/* Total Investment */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(metrics.totalInvestment)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Investment</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Capital deployed
            </p>
          </div>

          {/* Total Fair Value */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(metrics.totalFairValue)}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fair Value</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Current valuation
            </p>
          </div>

          {/* Average ROI */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <div className="flex items-center justify-between mb-4">
              {metrics.averageROI > 0 ? (
                <TrendingUp className="w-8 h-8 text-green-500" />
              ) : metrics.averageROI < 0 ? (
                <TrendingDown className="w-8 h-8 text-red-500" />
              ) : (
                <Minus className="w-8 h-8 text-gray-500" />
              )}
              <span className={`text-2xl font-bold ${
                metrics.averageROI > 0
                  ? 'text-green-600 dark:text-green-400'
                  : metrics.averageROI < 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}>
                {metrics.averageROI.toFixed(1)}%
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average ROI</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Portfolio return
            </p>
          </div>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Performer */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Top Performer</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.topPerformer.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Best performing investment</p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  metrics.topPerformer.roi > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {metrics.topPerformer.roi.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">ROI</p>
              </div>
            </div>
          </div>

          {/* Recent Investments */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Investments</h3>
            <div className="space-y-3">
              {metrics.recentInvestments.slice(0, 3).map((investment, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{investment.company}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{investment.date}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(investment.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Industry Breakdown */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Industry Breakdown</h3>
            <div className="space-y-3">
              {metrics.industryBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ 
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                    }}></div>
                    <span className="text-gray-900 dark:text-white">{item.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.count}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stage Breakdown */}
          <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Stage Breakdown</h3>
            <div className="space-y-3">
              {metrics.stageBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ 
                      backgroundColor: `hsl(${index * 45 + 180}, 70%, 50%)` 
                    }}></div>
                    <span className="text-gray-900 dark:text-white">{item.stage}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.count}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl shadow-lg p-6" style={{ backgroundColor: '#ffffff' }}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/companies"
              className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Building2 className="w-6 h-6 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">View All Companies</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Browse portfolio companies</p>
              </div>
            </Link>
            <button className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Users className="w-6 h-6 text-purple-500" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Export Report</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generate portfolio report</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
