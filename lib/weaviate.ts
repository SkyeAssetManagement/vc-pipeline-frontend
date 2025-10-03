import { client, CLASSES } from '@/config/weaviate.config';
import { Company, Document } from '@/types/company';

export class WeaviateService {
  // Semantic search across all documents
  static async semanticSearch(query: string, filters?: any) {
    try {
      const result = await client.graphql
        .get()
        .withClassName('VC_PE_Claude97_Production')
        .withFields('content document_type company_name _additional { score }')
        .withNearText({ concepts: [query] })
        .withLimit(20)
        .do();

      return result.data.Get.VC_PE_Claude97_Production;
    } catch (error) {
      console.error('Semantic search error:', error);
      throw error;
    }
  }

  // BM25 keyword search (since collection has no vectorizer, use this instead of hybrid)
  static async hybridSearch(query: string, alpha: number = 0.5) {
    try {
      const result = await client.graphql
        .get()
        .withClassName('VC_PE_Claude97_Production')
        .withFields('content document_type company_name _additional { score }')
        .withBm25({ query })
        .withLimit(20)
        .do();

      // Debug logging removed for cleaner output

      return result.data.Get.VC_PE_Claude97_Production;
    } catch (error) {
      console.error('BM25 search error:', error);
      throw error;
    }
  }

  // Get all companies with their documents
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
          operator: 'Equal',
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
}