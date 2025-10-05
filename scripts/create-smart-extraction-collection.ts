#!/usr/bin/env ts-node
/**
 * Create SmartExtraction collection in Weaviate with Voyage-3 embeddings
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

import { client } from '../config/weaviate.config';

async function createSmartExtractionCollection() {
  try {
    console.log('🚀 Creating SmartExtraction collection with Voyage-3...\n');

    // Check if collection already exists
    const existingSchema = await client.schema.getter().do();
    const collectionExists = existingSchema.classes?.some(
      (cls: any) => cls.class === 'SmartExtraction'
    );

    if (collectionExists) {
      console.log('⚠️  SmartExtraction collection already exists. Deleting...');
      await client.schema.classDeleter().withClassName('SmartExtraction').do();
      console.log('✅ Deleted existing collection\n');
    }

    // Create new collection with Voyage-3 vectorizer
    const classObj = {
      class: 'SmartExtraction',
      description: 'Smart document extraction with Voyage-3 embeddings and dynamic field discovery',
      vectorizer: 'text2vec-voyageai',
      moduleConfig: {
        'text2vec-voyageai': {
          model: 'voyage-3',
          baseURL: 'https://api.voyageai.com/v1',
          truncate: true
        }
      },
      properties: [
        {
          name: 'content',
          dataType: ['text'],
          description: 'Document content/chunk text',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'company_name',
          dataType: ['text'],
          description: 'Name of the company',
          tokenization: 'field',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: false,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'document_type',
          dataType: ['text'],
          description: 'Type of document (pitch_deck, term_sheet, financial_report, etc.)',
          tokenization: 'field',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'file_path',
          dataType: ['text'],
          description: 'Original file path',
          tokenization: 'field',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'chunk_id',
          dataType: ['text'],
          description: 'Unique chunk identifier',
          tokenization: 'field',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'chunk_index',
          dataType: ['int'],
          description: 'Index of chunk in document',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'section_type',
          dataType: ['text'],
          description: 'Section type within document',
          tokenization: 'field',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'round_info',
          dataType: ['text'],
          description: 'Investment round information',
          tokenization: 'field',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'extracted_fields',
          dataType: ['text'],
          description: 'Dynamically extracted fields as JSON',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'token_count',
          dataType: ['int'],
          description: 'Number of tokens in chunk',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        },
        {
          name: 'created_at',
          dataType: ['date'],
          description: 'Timestamp of ingestion',
          moduleConfig: {
            'text2vec-voyageai': {
              skip: true,
              vectorizePropertyName: false
            }
          }
        }
      ]
    };

    await client.schema.classCreator().withClass(classObj).do();

    console.log('✅ SmartExtraction collection created successfully!\n');
    console.log('📋 Collection Details:');
    console.log('   - Name: SmartExtraction');
    console.log('   - Vectorizer: text2vec-voyageai (Voyage-3)');
    console.log('   - Properties: 11 fields');
    console.log('   - Ready for document ingestion\n');

    // Verify creation
    const newSchema = await client.schema.getter().do();
    const createdClass = newSchema.classes?.find(
      (cls: any) => cls.class === 'SmartExtraction'
    );

    if (createdClass) {
      console.log('✅ Verification successful!');
      console.log(`   Properties: ${createdClass.properties?.length || 0}`);
      console.log(`   Vectorizer: ${createdClass.vectorizer}\n`);
    }

  } catch (error) {
    console.error('❌ Error creating SmartExtraction collection:', error);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  createSmartExtractionCollection()
    .then(() => {
      console.log('🎉 Collection setup complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

export { createSmartExtractionCollection };
