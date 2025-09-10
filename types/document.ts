export interface DocumentMetadata {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  uploadedBy: string;
  version: number;
}

export interface ExtractedData {
  [key: string]: any;
  company?: string;
  valuation?: number;
  investmentAmount?: number;
  equity?: number;
  date?: string;
  investors?: string[];
  terms?: Record<string, any>;
}

export interface DocumentProcessingStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
}

export interface DocumentSearch {
  query: string;
  filters?: {
    type?: string[];
    companyId?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    verified?: boolean;
  };
  limit?: number;
  offset?: number;
}