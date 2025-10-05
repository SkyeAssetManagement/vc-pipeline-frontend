import { client, CLASSES } from '@/config/weaviate.config';
import { Company, Document } from '@/types/company';

export class OptimizedWeaviateService {
  private static readonly COLLECTION_NAME = process.env.NEXT_PUBLIC_OPTIMIZED_COLLECTION_NAME || 'SmartExtraction';

  // Enhanced semantic search with SmartExtraction schema
  static async semanticSearch(query: string, filters?: any) {
    try {
      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields(`
          content
          company_name
          document_type
          file_path
          chunk_id
          chunk_index
          section_type
          round_info
          extracted_fields
          token_count
          _additional { score }
        `)
        .withNearText({ concepts: [query] })
        .withLimit(20)
        .do();

      return result.data.Get[this.COLLECTION_NAME];
    } catch (error) {
      console.error('Optimized semantic search error:', error);
      throw error;
    }
  }

  // Enhanced hybrid search with SmartExtraction schema
  static async hybridSearch(query: string, alpha: number = 0.7) {
    try {
      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields(`
          content
          company_name
          document_type
          file_path
          chunk_id
          chunk_index
          section_type
          round_info
          extracted_fields
          token_count
          _additional { score }
        `)
        .withHybrid({ query, alpha })
        .withLimit(20)
        .do();

      return result.data.Get[this.COLLECTION_NAME];
    } catch (error) {
      console.error('Optimized hybrid search error:', error);
      throw error;
    }
  }

  // Search with structured data filters for SmartExtraction
  static async searchWithFilters(query: string, filters: {
    company?: string;
    documentType?: string;
    sectionType?: string;
    roundInfo?: string;
  }) {
    try {
      // Build where clause for SmartExtraction fields
      const operands: any[] = [];

      if (filters.company) {
        operands.push({
          path: ['company_name'],
          operator: 'Equal' as const,
          valueString: filters.company
        });
      }

      if (filters.documentType) {
        operands.push({
          path: ['document_type'],
          operator: 'Equal' as const,
          valueString: filters.documentType
        });
      }

      if (filters.sectionType) {
        operands.push({
          path: ['section_type'],
          operator: 'Equal' as const,
          valueString: filters.sectionType
        });
      }

      if (filters.roundInfo) {
        operands.push({
          path: ['round_info'],
          operator: 'Like' as const,
          valueString: `*${filters.roundInfo}*`
        });
      }

      let queryBuilder = client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields(`
          content
          company_name
          document_type
          file_path
          chunk_id
          chunk_index
          section_type
          round_info
          extracted_fields
          token_count
          _additional { score }
        `)
        .withHybrid({ query, alpha: 0.7 })
        .withLimit(20);

      // Only add where clause if we have filters
      if (operands.length > 0) {
        const whereClause = operands.length === 1
          ? operands[0]
          : { operator: 'And' as const, operands };

        queryBuilder = queryBuilder.withWhere(whereClause);
      }

      const result = await queryBuilder.do();
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

  // Get document statistics for SmartExtraction
  static async getDocumentStats() {
    try {
      const result = await client.graphql
        .get()
        .withClassName(this.COLLECTION_NAME)
        .withFields('company_name document_type section_type round_info extracted_fields token_count')
        .withLimit(1000)
        .do();

      const chunks = result.data.Get[this.COLLECTION_NAME];

      // Calculate statistics
      const stats = {
        totalChunks: chunks.length,
        companies: Array.from(new Set(chunks.map((c: any) => c.company_name).filter(Boolean))),
        documentTypes: Array.from(new Set(chunks.map((c: any) => c.document_type).filter(Boolean))),
        sectionTypes: Array.from(new Set(chunks.map((c: any) => c.section_type).filter(Boolean))),
        roundInfos: Array.from(new Set(chunks.map((c: any) => c.round_info).filter(Boolean))),
        chunksWithExtractedFields: chunks.filter((c: any) => c.extracted_fields).length,
        averageTokenCount: chunks.reduce((sum: number, c: any) => sum + (c.token_count || 0), 0) / chunks.length,
      };

      return stats;
    } catch (error) {
      console.error('Get document stats error:', error);
      throw error;
    }
  }
}