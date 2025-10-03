// TypeScript native implementation of DSPy-like signatures

export interface QueryEnhancement {
  query: string;
  context?: string;
  enhancedQuery: string;
}

export interface QueryEnhancementSignature {
  docstring: string;
  inputs: ['query', 'context?'];
  outputs: ['enhancedQuery'];
}

export interface DocumentReranking {
  query: string;
  documents: any[];
  rerankedDocuments: any[];
}

export interface DocumentRerankingSignature {
  docstring: string;
  inputs: ['query', 'documents'];
  outputs: ['rerankedDocuments'];
}

export interface AnswerGeneration {
  query: string;
  context: string;
  requireSources?: boolean;
  answer: string;
  sources: any[];
  confidence: 'high' | 'medium' | 'low';
}

export interface AnswerGenerationSignature {
  docstring: string;
  inputs: ['query', 'context', 'requireSources?'];
  outputs: ['answer', 'sources', 'confidence'];
}

export interface QueryIntentClassification {
  query: string;
  intentType: 'factual' | 'analytical' | 'comparison' | 'exploratory';
  documentTypes: string[];
  entities: string[];
}

export interface QueryIntentSignature {
  docstring: string;
  inputs: ['query'];
  outputs: ['intentType', 'documentTypes', 'entities'];
}