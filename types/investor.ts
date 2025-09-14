export interface Investor {
  investor_id: string;        // Unique identifier (e.g., "upswell_001")
  name: string;               // Investor name (e.g., "Upswell")
  legal_name: string;         // Legal entity name
  investor_type: string;      // Type ("vc", "angel", "strategic", etc.)
  fund_size_usd?: number;     // Fund size in USD
  founded_year?: number;      // Year founded
  website: string;            // Investor website
  headquarters: string;       // Headquarters location
  investment_stages: string[]; // Focus stages ["seed", "series_a"]
  sectors_focus: string[];    // Sector focus areas
  geographic_focus: string[]; // Geographic focus
  portfolio_companies: number; // Number of portfolio companies
  active_investments: number;  // Number of active investments
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
}

export type InvestorType = 'vc' | 'angel' | 'strategic' | 'family_office' | 'accelerator';
export type InvestmentStage = 'seed' | 'series_a' | 'series_b' | 'bridge' | 'convertible';