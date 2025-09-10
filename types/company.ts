export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  stage: 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Later';
  valuation: number;
  investmentAmount: number;
  ownershipPercentage: number;
  foundedDate: Date;
  website?: string;
  description: string;
  metrics: {
    revenue?: number;
    mrr?: number;
    arr?: number;
    burnRate?: number;
    runway?: number;
    employees?: number;
  };
  documents: Document[];
  investments: Investment[];
}

export interface Document {
  id: string;
  companyId: string;
  type: 'TermSheet' | 'SubscriptionAgreement' | 'InvestorUpdate' | 'FinancialReport' | 'BoardMeeting' | 'Other';
  title: string;
  uploadDate: Date;
  fileUrl: string;
  extractedData: Record<string, any>;
  verified: boolean;
  tags: string[];
}

export interface Investment {
  id: string;
  companyId: string;
  round: string;
  amount: number;
  date: Date;
  leadInvestor: string;
  participants: string[];
  preMoneyValuation: number;
  postMoneyValuation: number;
}