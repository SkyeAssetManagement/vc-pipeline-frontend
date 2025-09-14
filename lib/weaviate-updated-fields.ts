// Updated field mappings for VC_PE_Voyage_Binary_Production collection
// Based on actual schema inspection performed on 2025-09-14

export const VC_PE_VOYAGE_BINARY_PRODUCTION_FIELDS = {
  // Core content fields
  content: 'content',                    // Main text content (was 'text')
  document_type: 'document_type',        // Document type
  section_type: 'section_type',          // Section type 
  company_name: 'company_name',          // Company name
  
  // Identifiers
  chunk_id: 'chunk_id',                  // Chunk identifier
  document_id: 'document_id',            // Document identifier (UUID type)
  chunk_index: 'chunk_index',            // Chunk index (number)
  
  // Metrics available
  token_count: 'token_count',            // Token count (was text_length equivalent)
  retrieval_score: 'retrieval_score',    // Retrieval score
  
  // Metadata available
  file_path: 'file_path',                // File path
  created_at: 'created_at',              // Creation date
  embedding_model: 'embedding_model',    // Embedding model used
  embedding_dimension: 'embedding_dimension', // Embedding dimension
  embedding_quantization: 'embedding_quantization', // Embedding quantization
  context_window_size: 'context_window_size', // Context window size
  round_info: 'round_info',              // Round information (new field!)
};

// Fields that exist in VCChunk but NOT in VC_PE_Voyage_Binary_Production
export const MISSING_FIELDS_IN_NEW_COLLECTION = [
  'text_length',              // Use token_count instead
  'extraction_confidence',    // Use retrieval_score instead  
  'has_financial_data',       // Not available
  'has_legal_terms',         // Not available
  'key_entities',            // Not available
  'key_terms',               // Not available
  'page_numbers',            // Not available
];

// Alternative collections that have the missing fields
export const ALTERNATIVE_COLLECTIONS = {
  VCChunk: {
    fields: ['text', 'text_length', 'extraction_confidence', 'has_financial_data', 'has_legal_terms', 'key_entities', 'key_terms'],
    objectCount: 86,
    hasVectorization: true
  },
  VCDocumentChunk: {
    fields: ['content', 'confidence_score'], // Similar to extraction_confidence
    objectCount: 1001,
    hasVectorization: false
  }
};

// Suggested query fields for VC_PE_Voyage_Binary_Production
export const RECOMMENDED_QUERY_FIELDS = [
  'content',              // Main text content
  'document_type', 
  'section_type', 
  'company_name', 
  'chunk_id',
  'document_id',
  'chunk_index',
  'token_count',          // Instead of text_length
  'retrieval_score',      // Instead of extraction_confidence
  'file_path',
  'round_info',           // New useful field
  '_additional { score }' // Vector similarity score
];