require('dotenv').config({ path: '.env.local' });
const weaviate = require('weaviate-ts-client').default;
const fs = require('fs');
const { VoyageAIClient } = require('voyageai');
const Anthropic = require('@anthropic-ai/sdk');
const pdf = require('pdf-parse');

const client = weaviate.client({
  scheme: process.env.NEXT_PUBLIC_WEAVIATE_SCHEME || 'https',
  host: process.env.NEXT_PUBLIC_WEAVIATE_HOST || '',
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || ''),
  headers: {
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    'X-VoyageAI-Api-Key': process.env.VOYAGE_API_KEY || ''
  }
});

const voyage = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function test() {
  try {
    console.log('Testing Voyage-3 embedding...\n');

    // Test with simple text
    const testText = 'This is a test document about venture capital investment.';

    const response = await voyage.embed({
      input: [testText],
      model: 'voyage-3'
    });

    console.log('Voyage response structure:', JSON.stringify(response, null, 2).substring(0, 500));

    const embeddings = response.data || response.embeddings || response;
    console.log('\nEmbeddings type:', typeof embeddings);
    console.log('Is array:', Array.isArray(embeddings));
    if (Array.isArray(embeddings) && embeddings.length > 0) {
      console.log('First embedding type:', typeof embeddings[0]);
      console.log('First embedding structure:', Object.keys(embeddings[0] || {}));
      const vector = embeddings[0].embedding || embeddings[0];
      console.log('Vector is array:', Array.isArray(vector));
      if (Array.isArray(vector)) {
        console.log('Vector length:', vector.length);
        console.log('First 5 values:', vector.slice(0, 5));
      }
    }

    // Test inserting one object
    console.log('\n\nTesting Weaviate insert...');
    const vector = embeddings[0].embedding || embeddings[0];

    await client.data.creator()
      .withClassName('SmartExtraction')
      .withProperties({
        content: testText,
        company_name: 'Test Company',
        file_path: '/test/path.pdf',
        chunk_id: 'test_chunk_0',
        chunk_index: 0,
        token_count: 10,
        extracted_fields: JSON.stringify({ test: 'data' }),
        created_at: new Date().toISOString()
      })
      .withVector(vector)
      .do();

    console.log('✅ Successfully inserted test document!');

  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

test();
