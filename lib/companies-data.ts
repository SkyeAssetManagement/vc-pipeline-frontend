export interface Company {
  id: string;
  company_name: string;
  initial_investment_year: number;
  investment_amount: number;
  fair_value: number;
  industry: string;
  stage: string;
  description: string;
  website?: string;
  roi?: number;
  status: 'active' | 'exited' | 'written-off';
}

export const companiesData: Company[] = [
  {
    id: 'advanced-navigation',
    company_name: 'Advanced Navigation',
    initial_investment_year: 2020,
    investment_amount: 2500000,
    fair_value: 4800000,
    industry: 'Deep Tech / Navigation',
    stage: 'Series B',
    description: 'Developer of AI-powered navigation and robotics technologies for GPS-denied environments and autonomous systems.',
    website: 'https://advancednavigation.com',
    roi: 92,
    status: 'active'
  },
  {
    id: 'wonde',
    company_name: 'Wonde',
    initial_investment_year: 2019,
    investment_amount: 1800000,
    fair_value: 3200000,
    industry: 'EdTech / Data Infrastructure',
    stage: 'Series A',
    description: 'EdTech infrastructure provider enabling seamless data integration and management for educational institutions.',
    website: 'https://wonde.com',
    roi: 77.8,
    status: 'active'
  },
  {
    id: 'securestack',
    company_name: 'SecureStack',
    initial_investment_year: 2021,
    investment_amount: 1500000,
    fair_value: 2100000,
    industry: 'Cybersecurity / DevSecOps',
    stage: 'Seed',
    description: 'DevSecOps platform offering automated security solutions integrated into modern development workflows.',
    website: 'https://securestack.com',
    roi: 40,
    status: 'active'
  },
  {
    id: 'lasertrade',
    company_name: 'Lasertrade',
    initial_investment_year: 2020,
    investment_amount: 2000000,
    fair_value: 3500000,
    industry: 'Industrial Tech',
    stage: 'Series A',
    description: 'Industrial technology company specializing in precision laser cutting and automated manufacturing solutions.',
    website: 'https://lasertrade.com',
    roi: 75,
    status: 'active'
  },
  {
    id: 'circle-in',
    company_name: 'Circle In',
    initial_investment_year: 2018,
    investment_amount: 1200000,
    fair_value: 2800000,
    industry: 'HR Tech / Workplace',
    stage: 'Series A',
    description: 'Workplace inclusion platform that helps organizations support working parents and create inclusive cultures.',
    website: 'https://circlein.com',
    roi: 133.3,
    status: 'active'
  },
  {
    id: 'riparide',
    company_name: 'Riparide',
    initial_investment_year: 2022,
    investment_amount: 800000,
    fair_value: 950000,
    industry: 'Mobility / Transportation',
    stage: 'Pre-Seed',
    description: 'Urban mobility platform offering sustainable ride-sharing and vehicle rental solutions for modern cities.',
    website: 'https://riparide.com',
    roi: 18.75,
    status: 'active'
  },
  {
    id: 'amazingco',
    company_name: 'AmazingCo',
    initial_investment_year: 2019,
    investment_amount: 2200000,
    fair_value: 4100000,
    industry: 'E-commerce / Experience',
    stage: 'Series B',
    description: 'Experience-based e-commerce platform creating unique gift boxes and subscription services for special occasions.',
    website: 'https://amazingco.com',
    roi: 86.4,
    status: 'active'
  },
  {
    id: 'amaka',
    company_name: 'Amaka',
    initial_investment_year: 2021,
    investment_amount: 1000000,
    fair_value: 1600000,
    industry: 'FinTech / Accounting',
    stage: 'Seed',
    description: 'FinTech automation platform providing intelligent accounting integrations and workflow automation for businesses.',
    website: 'https://amaka.com',
    roi: 60,
    status: 'active'
  },
  {
    id: 'loopit',
    company_name: 'Loopit',
    initial_investment_year: 2020,
    investment_amount: 1700000,
    fair_value: 2900000,
    industry: 'Automotive / SaaS',
    stage: 'Series A',
    description: 'Automotive SaaS platform providing comprehensive car subscription management software for dealerships and fleet operators.',
    website: 'https://loopit.co',
    roi: 70.6,
    status: 'active'
  },
  {
    id: 'predelo',
    company_name: 'Predelo',
    initial_investment_year: 2022,
    investment_amount: 900000,
    fair_value: 1100000,
    industry: 'PropTech / Analytics',
    stage: 'Pre-Seed',
    description: 'PropTech analytics platform using AI to provide predictive insights for real estate investment decisions.',
    website: 'https://predelo.com',
    roi: 22.2,
    status: 'active'
  }
];

export const getCompanyById = (id: string): Company | undefined => {
  return companiesData.find(company => company.id === id);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculatePerformance = (investment: number, fairValue: number): {
  absolute: number;
  percentage: number;
  status: 'positive' | 'negative' | 'neutral';
} => {
  const absolute = fairValue - investment;
  const percentage = ((fairValue - investment) / investment) * 100;
  const status = absolute > 0 ? 'positive' : absolute < 0 ? 'negative' : 'neutral';

  return { absolute, percentage, status };
};