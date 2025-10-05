import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

export const weaviateConfig = {
  scheme: process.env.NEXT_PUBLIC_WEAVIATE_SCHEME || 'https',
  host: process.env.NEXT_PUBLIC_WEAVIATE_HOST || '',
  apiKey: new ApiKey(process.env.WEAVIATE_API_KEY || ''),
  headers: {
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    'X-VoyageAI-Api-Key': process.env.VOYAGE_API_KEY || ''
  }
};

export const client: WeaviateClient = weaviate.client(weaviateConfig);

export const CLASSES = {
  COMPANY: 'Company',
  DOCUMENT: 'Document',
  INVESTMENT: 'Investment'
};