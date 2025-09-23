import { client, CLASSES } from '@/config/weaviate.config';
import { Company, Document } from '@/types/company';

export class OptimizedWeaviateService {
  private static readonly COLLECTION_NAME = 'VC_PE_Claude97_Production';

  // Enhanced semantic search with VC_PE_Claude97_Production schema
  static async semanticSearch(query: string, filters?: any) {
    try {
      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields(`
          content
          company_name
          industry
          document_type
          investment_amount
          pre_money_valuation
          post_money_valuation
          fair_value
          valuation_price_per_share
          ownership_percentage
          current_ownership_percentage
          multiple_on_invested_capital
          internal_rate_of_return
          claude_extraction
          chunk_id
          extraction_confidence
          extraction_timestamp
          _additional { score }
        `)
        .withBm25({ query })
        .withLimit(20)
        .do();

      return result.data.Get[this.COLLECTION_NAME];
    } catch (error) {
      console.error('Optimized semantic search error:', error);
      throw error;
    }
  }

  // Enhanced BM25 search with VC_PE_Claude97_Production schema
  static async hybridSearch(query: string, alpha: number = 0.5) {
    try {
      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields(`
          content
          company_name
          industry
          document_type
          investment_amount
          pre_money_valuation
          post_money_valuation
          fair_value
          valuation_price_per_share
          ownership_percentage
          current_ownership_percentage
          multiple_on_invested_capital
          internal_rate_of_return
          claude_extraction
          chunk_id
          extraction_confidence
          extraction_timestamp
          _additional { score }
        `)
        .withBm25({ query })
        .withLimit(20)
        .do();

      return result.data.Get[this.COLLECTION_NAME];
    } catch (error) {
      console.error('Optimized BM25 search error:', error);
      throw error;
    }
  }

  // Search with structured data filters for VC_PE_Claude97_Production
  static async searchWithFilters(query: string, filters: {
    company?: string;
    documentType?: string;
    industry?: string;
    minInvestmentAmount?: number;
    maxInvestmentAmount?: number;
    minValuation?: number;
    maxValuation?: number;
    minOwnership?: number;
    maxOwnership?: number;
    minConfidence?: number;
    hasInvestmentAmount?: boolean;
    hasValuation?: boolean;
  }) {
    try {
      // Build where clause
      const whereClause: any = {};

      if (filters.company) {
        whereClause.operator = 'And' as const;
        whereClause.operands = [
          {
            path: ['company_name'],
            operator: 'Equal' as const,
            valueString: filters.company
          }
        ];
      }

      if (filters.documentType) {
        const operand = {
          path: ['document_type'],
          operator: 'Equal' as const,
          valueString: filters.documentType
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.industry) {
        const operand = {
          path: ['industry'],
          operator: 'Equal' as const,
          valueString: filters.industry
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.minInvestmentAmount !== undefined) {
        const operand = {
          path: ['investment_amount'],
          operator: 'GreaterThan' as const,
          valueNumber: filters.minInvestmentAmount
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.maxInvestmentAmount !== undefined) {
        const operand = {
          path: ['investment_amount'],
          operator: 'LessThan' as const,
          valueNumber: filters.maxInvestmentAmount
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.minValuation !== undefined) {
        const operand = {
          path: ['pre_money_valuation'],
          operator: 'GreaterThan' as const,
          valueNumber: filters.minValuation
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.maxValuation !== undefined) {
        const operand = {
          path: ['pre_money_valuation'],
          operator: 'LessThan' as const,
          valueNumber: filters.maxValuation
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.minOwnership !== undefined) {
        const operand = {
          path: ['ownership_percentage'],
          operator: 'GreaterThan' as const,
          valueNumber: filters.minOwnership
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.maxOwnership !== undefined) {
        const operand = {
          path: ['ownership_percentage'],
          operator: 'LessThan' as const,
          valueNumber: filters.maxOwnership
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.minConfidence !== undefined) {
        const operand = {
          path: ['extraction_confidence'],
          operator: 'GreaterThan' as const,
          valueNumber: filters.minConfidence
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      // For boolean filters, we check if the numeric fields exist (not null/zero)
      if (filters.hasInvestmentAmount) {
        const operand = {
          path: ['investment_amount'],
          operator: 'GreaterThan' as const,
          valueNumber: 0
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      if (filters.hasValuation) {
        const operand = {
          path: ['pre_money_valuation'],
          operator: 'GreaterThan' as const,
          valueNumber: 0
        };

        if (whereClause.operands) {
          whereClause.operands.push(operand);
        } else {
          whereClause.operator = 'And' as const;
          whereClause.operands = [operand];
        }
      }

      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields(`
          content
          company_name
          industry
          document_type
          investment_amount
          pre_money_valuation
          post_money_valuation
          fair_value
          valuation_price_per_share
          ownership_percentage
          current_ownership_percentage
          multiple_on_invested_capital
          internal_rate_of_return
          claude_extraction
          chunk_id
          extraction_confidence
          extraction_timestamp
          _additional { score }
        `)
        .withBm25({ query })
        .withWhere(whereClause)
        .withLimit(20)
        .do();

      return result.data.Get[this.COLLECTION_NAME];
    } catch (error) {
      console.error('Filtered search error:', error);
      throw error;
    }
  }

  // Get companies with enhanced metadata
  static async getCompanies(filters?: any): Promise<Company[]> {
    try {
      const result = await client.graphql
        .get()
        .withClassName(CLASSES.COMPANY)
        .withFields('name logo industry stage valuation investmentAmount ownershipPercentage metrics')
        .withLimit(100)
        .do();

      return result.data.Get.Company;
    } catch (error) {
      console.error('Get companies error:', error);
      throw error;
    }
  }

  // Get single company with all related data
  static async getCompanyById(id: string): Promise<Company> {
    try {
      const result = await client.graphql
        .get()
        .withClassName(CLASSES.COMPANY)
        .withWhere({
          path: ['id'],
          operator: 'Equal' as const,
          valueString: id
        })
        .withFields('name logo industry stage valuation investmentAmount ownershipPercentage metrics documents { ... on Document { title type uploadDate fileUrl extractedData verified } } investments { ... on Investment { round amount date leadInvestor participants preMoneyValuation postMoneyValuation } }')
        .do();

      return result.data.Get.Company[0];
    } catch (error) {
      console.error('Get company by ID error:', error);
      throw error;
    }
  }

  // Get document statistics for VC_PE_Claude97_Production
  static async getDocumentStats() {
    try {
      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields('company_name industry document_type investment_amount pre_money_valuation ownership_percentage extraction_confidence')
        .withLimit(1000)
        .do();

      const chunks = result.data.Get[this.COLLECTION_NAME];

      // Calculate statistics
      const stats = {
        totalChunks: chunks.length,
        companies: Array.from(new Set(chunks.map((c: any) => c.company_name))),
        industries: Array.from(new Set(chunks.map((c: any) => c.industry))),
        documentTypes: Array.from(new Set(chunks.map((c: any) => c.document_type))),
        chunksWithInvestmentAmount: chunks.filter((c: any) => c.investment_amount && c.investment_amount > 0).length,
        chunksWithValuation: chunks.filter((c: any) => c.pre_money_valuation && c.pre_money_valuation > 0).length,
        chunksWithOwnership: chunks.filter((c: any) => c.ownership_percentage && c.ownership_percentage > 0).length,
        averageConfidence: chunks.reduce((sum: number, c: any) => sum + (c.extraction_confidence || 0), 0) / chunks.length,
        averageInvestmentAmount: chunks
          .filter((c: any) => c.investment_amount && c.investment_amount > 0)
          .reduce((sum: number, c: any) => sum + c.investment_amount, 0) / chunks.filter((c: any) => c.investment_amount && c.investment_amount > 0).length,
        averageValuation: chunks
          .filter((c: any) => c.pre_money_valuation && c.pre_money_valuation > 0)
          .reduce((sum: number, c: any) => sum + c.pre_money_valuation, 0) / chunks.filter((c: any) => c.pre_money_valuation && c.pre_money_valuation > 0).length
      };

      return stats;
    } catch (error) {
      console.error('Get document stats error:', error);
      throw error;
    }
  }

  // Search for companies by investment amount range
  static async searchByInvestmentRange(minAmount: number, maxAmount: number) {
    try {
      const whereClause = {
        operator: 'And' as const,
        operands: [
          {
            path: ['investment_amount'],
            operator: 'GreaterThan' as const,
            valueNumber: minAmount
          },
          {
            path: ['investment_amount'],
            operator: 'LessThan' as const,
            valueNumber: maxAmount
          }
        ]
      };

      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields(`
          content
          company_name
          industry
          document_type
          investment_amount
          pre_money_valuation
          post_money_valuation
          ownership_percentage
          claude_extraction
          extraction_confidence
          _additional { score }
        `)
        .withWhere(whereClause)
        .withLimit(20)
        .do();

      return result.data.Get[this.COLLECTION_NAME];
    } catch (error) {
      console.error('Investment range search error:', error);
      throw error;
    }
  }

  // Search for companies by valuation range
  static async searchByValuationRange(minValuation: number, maxValuation: number) {
    try {
      const whereClause = {
        operator: 'And' as const,
        operands: [
          {
            path: ['pre_money_valuation'],
            operator: 'GreaterThan' as const,
            valueNumber: minValuation
          },
          {
            path: ['pre_money_valuation'],
            operator: 'LessThan' as const,
            valueNumber: maxValuation
          }
        ]
      };

      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields(`
          content
          company_name
          industry
          document_type
          investment_amount
          pre_money_valuation
          post_money_valuation
          ownership_percentage
          claude_extraction
          extraction_confidence
          _additional { score }
        `)
        .withWhere(whereClause)
        .withLimit(20)
        .do();

      return result.data.Get[this.COLLECTION_NAME];
    } catch (error) {
      console.error('Valuation range search error:', error);
      throw error;
    }
  }
}