import { client, CLASSES } from '@/config/weaviate.config';
import { Company, VCDocumentChunk, Investment } from '@/types/company';
import { Investor } from '@/types/investor';

export class WeaviateService {
  // Semantic search across vectorized document chunks
  static async semanticSearch(query: string, filters?: any) {
    try {
      const result = await client.graphql
        .get()
        .withClassName('VCChunk')
        .withFields([
          'text', 
          'document_type', 
          'section_type', 
          'company_name', 
          'chunk_id',
          'document_id',
          'chunk_index',
          'text_length',
          'extraction_confidence',
          'has_financial_data',
          'has_legal_terms',
          'key_entities',
          'key_terms',
          '_additional { score }'
        ])
        .withNearText({ concepts: [query] })
        .withLimit(20)
        .do();

      return result.data.Get.VCChunk;
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  // Hybrid search combining keyword and vector similarity
  static async hybridSearch(query: string, alpha: number = 0.5) {
    try {
      const result = await client.graphql
        .get()
        .withClassName('VCChunk')
        .withFields([
          'text', 
          'document_type', 
          'section_type', 
          'company_name', 
          'chunk_id',
          'document_id',
          'chunk_index',
          'text_length',
          'extraction_confidence',
          'has_financial_data',
          'has_legal_terms',
          'key_entities',
          'key_terms',
          '_additional { score }'
        ])
        .withHybrid({ query, alpha })
        .withLimit(20)
        .do();

      return result.data.Get.VCChunk;
    } catch (error) {
      console.error('Hybrid search error:', error);
      throw error;
    }
  }

  // BM25 keyword search
  static async bm25Search(query: string) {
    try {
      const result = await client.graphql
        .get()
        .withClassName('VCDocumentChunk')
        .withFields([
          'content', 
          'document_type', 
          'section_type', 
          'company_name', 
          'chunk_id',
          'document_id',
          'chunk_index',
          'token_count',
          'confidence_score',
          '_additional { score }'
        ])
        .withBm25({ query })
        .withLimit(20)
        .do();

      return result.data.Get.VCDocumentChunk;
    } catch (error) {
      console.error('BM25 search error:', error);
      throw error;
    }
  }

  // Get all companies from structured collection
  static async getCompanies(filters?: any): Promise<Company[]> {
    try {
      const result = await client.graphql
        .get()
        .withClassName('Company')
        .withFields([
          'company_id',
          'name',
          'legal_name',
          'jurisdiction',
          'industry',
          'sector',
          'status',
          'description',
          'website',
          'headquarters'
        ])
        .withLimit(100)
        .do();

      return result.data.Get.Company;
    } catch (error) {
      console.error('Get companies error:', error);
      throw error;
    }
  }

  // Get single company with all related data
  static async getCompanyById(company_id: string): Promise<Company | null> {
    try {
      const result = await client.graphql
        .get()
        .withClassName('Company')
        .withWhere({
          path: ['company_id'],
          operator: 'Equal',
          valueString: company_id
        })
        .withFields([
          'company_id',
          'name',
          'legal_name',
          'incorporation_date',
          'jurisdiction',
          'industry',
          'sector',
          'status',
          'description',
          'website',
          'headquarters',
          'created_at',
          'updated_at'
        ])
        .do();

      return result.data.Get.Company[0] || null;
    } catch (error) {
      console.error('Get company by ID error:', error);
      throw error;
    }
  }

  // Get investments for a company
  static async getCompanyInvestments(company_id: string): Promise<Investment[]> {
    try {
      const result = await client.graphql
        .get()
        .withClassName('Investment')
        .withWhere({
          path: ['company_id'],
          operator: 'Equal',
          valueString: company_id
        })
        .withFields([
          'investment_id',
          'company_id',
          'investor_id',
          'round_type',
          'round_name',
          'round_sequence',
          'round_date',
          'investment_amount',
          'currency',
          'pre_money_valuation',
          'post_money_valuation',
          'status',
          'verified'
        ])
        .withLimit(50)
        .do();

      return result.data.Get.Investment || [];
    } catch (error) {
      console.error('Get company investments error:', error);
      throw error;
    }
  }

  // Get portfolio for an investor
  static async getInvestorPortfolio(investor_id: string): Promise<Investment[]> {
    try {
      const result = await client.graphql
        .get()
        .withClassName('Investment')
        .withWhere({
          path: ['investor_id'],
          operator: 'Equal',
          valueString: investor_id
        })
        .withFields([
          'investment_id',
          'company_id',
          'investor_id',
          'round_type',
          'round_name',
          'investment_amount',
          'currency',
          'round_date',
          'status'
        ])
        .withLimit(50)
        .do();

      return result.data.Get.Investment || [];
    } catch (error) {
      console.error('Get investor portfolio error:', error);
      throw error;
    }
  }

  // Get all investors from structured collection
  static async getInvestors(filters?: any): Promise<Investor[]> {
    try {
      const result = await client.graphql
        .get()
        .withClassName('Investor')
        .withFields([
          'investor_id',
          'name',
          'legal_name',
          'investor_type',
          'headquarters',
          'portfolio_companies',
          'active_investments'
        ])
        .withLimit(100)
        .do();

      return result.data.Get.Investor;
    } catch (error) {
      console.error('Get investors error:', error);
      throw error;
    }
  }

  // Get all investments from structured collection
  static async getInvestments(filters?: any): Promise<Investment[]> {
    try {
      const result = await client.graphql
        .get()
        .withClassName('Investment')
        .withFields([
          'investment_id',
          'company_id',
          'investor_id',
          'round_type',
          'round_name',
          'round_sequence',
          'round_date',
          'investment_amount',
          'currency',
          'liquidation_preference',
          'participating',
          'anti_dilution',
          'board_seats',
          'information_rights',
          'status',
          'supporting_document_ids',
          'data_confidence',
          'extraction_method',
          'verified',
          'created_at',
          'updated_at'
        ])
        .withLimit(100)
        .do();

      return result.data.Get.Investment;
    } catch (error) {
      console.error('Get investments error:', error);
      throw error;
    }
  }

  // Portfolio analytics methods
  static async getPortfolioOverview() {
    try {
      const [companies, investors, investments] = await Promise.all([
        this.getCompanies(),
        this.getInvestors(),
        this.getInvestments()
      ]);

      const totalInvestment = investments.reduce(
        (sum, inv) => sum + inv.investment_amount, 
        0
      );

      const activeInvestments = investments.filter(
        inv => inv.status === 'active'
      ).length;

      return {
        totalCompanies: companies.length,
        totalInvestors: investors.length,
        totalInvestments: investments.length,
        totalInvestmentAmount: totalInvestment,
        activeInvestments,
        averageInvestment: totalInvestment / investments.length
      };
    } catch (error) {
      console.error('Get portfolio overview error:', error);
      throw error;
    }
  }

  // Find investments by amount range
  static async findInvestmentsByAmount(minAmount: number, maxAmount?: number): Promise<Investment[]> {
    try {
      let whereCondition;
      
      if (maxAmount) {
        whereCondition = {
          operator: 'And',
          operands: [
            {
              path: ['investment_amount'],
              operator: 'GreaterThanEqual',
              valueNumber: minAmount
            },
            {
              path: ['investment_amount'],
              operator: 'LessThanEqual',
              valueNumber: maxAmount
            }
          ]
        };
      } else {
        whereCondition = {
          path: ['investment_amount'],
          operator: 'GreaterThanEqual',
          valueNumber: minAmount
        };
      }

      const result = await client.graphql
        .get()
        .withClassName('Investment')
        .withWhere(whereCondition)
        .withFields([
          'investment_id',
          'company_id',
          'investor_id',
          'round_name',
          'investment_amount',
          'currency',
          'round_date'
        ])
        .withLimit(50)
        .do();

      return result.data.Get.Investment || [];
    } catch (error) {
      console.error('Find investments by amount error:', error);
      throw error;
    }
  }
}