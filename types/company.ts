export interface Company {
  company_id: string;         // Unique identifier (e.g., "loopit_001")
  name: string;               // Company name (e.g., "Loopit")
  legal_name: string;         // Legal entity name
  incorporation_date?: string; // ISO date of incorporation
  jurisdiction: string;       // Jurisdiction (e.g., "Australia")
  industry: string;           // Industry sector
  sector: string;             // Business sector
  status: string;             // Company status ("active", "acquired", etc.)
  description: string;        // Company description
  website: string;            // Company website
  headquarters: string;       // Company headquarters location
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
  // Legacy compatibility fields
  id?: string;                // Mapped from company_id
  logo?: string;              // Optional logo URL
  stage?: string;             // Derived from latest investment
  valuation?: number;         // Latest valuation
  investmentAmount?: number;  // Total raised
  ownershipPercentage?: number; // Calculated ownership
  foundedDate?: Date;         // Parsed from incorporation_date
  metrics?: {
    revenue?: number;
    mrr?: number;
    arr?: number;
    burnRate?: number;
    runway?: number;
    employees?: number;
  };
  documents?: VCDocumentChunk[]; // Legacy document chunks
  investments?: Investment[];     // Related investments
}

export interface VCDocumentChunk {
  chunk_id: string;
  document_id: string;
  company_name: string;
  content: string;
  section_type: string;
  document_type: string;
  chunk_index: number;
  token_count: number;
  confidence_score: number;
  created_at: string;
  metadata: string;
  embedding_model: string;
}

// Legacy Document interface for backward compatibility
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
  investment_id: string;      // Unique identifier
  company_id: string;         // Reference to Company
  investor_id: string;        // Reference to Investor
  round_type: string;         // "seed", "series_a", "bridge", etc.
  round_name: string;         // "Seed - May 2022"
  round_sequence: number;     // Round number (1, 2, 3...)
  round_date: string;         // ISO date of investment
  investment_amount: number;  // Amount in base currency units
  currency: string;           // Currency code ("AUD", "USD")
  pre_money_valuation?: number; // Pre-money valuation
  post_money_valuation?: number; // Post-money valuation
  liquidation_preference: number; // Liquidation preference (1.0, 2.0)
  participating: boolean;     // Participating preferred
  anti_dilution: string;      // Anti-dilution protection
  board_seats: number;        // Number of board seats
  information_rights: boolean; // Information rights granted
  status: string;             // "active", "exited", "written_off"
  supporting_document_ids: string[]; // Related document IDs
  data_confidence: number;    // Extraction confidence (0.0-1.0)
  extraction_method: string;  // "automated", "manual", "hybrid"
  verified: boolean;          // Human verified
  created_at: string;         // ISO timestamp
  updated_at: string;         // ISO timestamp
  // Legacy compatibility fields
  id?: string;                // Mapped from investment_id
  companyId?: string;         // Mapped from company_id
  round?: string;             // Mapped from round_name
  amount?: number;            // Mapped from investment_amount
  date?: Date;                // Parsed from round_date
  leadInvestor?: string;      // Derived from investor
  participants?: string[];    // Additional participants
  preMoneyValuation?: number; // Mapped from pre_money_valuation
  postMoneyValuation?: number; // Mapped from post_money_valuation
}