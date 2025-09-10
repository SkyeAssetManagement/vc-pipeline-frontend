export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  searchType?: 'semantic' | 'keyword' | 'hybrid';
  limit?: number;
  offset?: number;
}

export interface SearchFilters {
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  investmentRange?: {
    min: number;
    max: number;
  };
  documentTypes?: string[];
  stages?: string[];
  industries?: string[];
  companies?: string[];
  verified?: boolean;
}

export interface SearchResult {
  id: string;
  type: 'company' | 'document' | 'investment';
  title: string;
  snippet: string;
  score: number;
  metadata: Record<string, any>;
  highlights?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  facets?: Record<string, any>;
  suggestions?: string[];
  executionTime: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'filter' | 'entity';
  category?: string;
}