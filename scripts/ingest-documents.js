require('dotenv').config({ path: '.env.local' });
const weaviate = require('weaviate-ts-client').default;
const fs = require('fs');
const path = require('path');
const { VoyageAIClient } = require('voyageai');
const Anthropic = require('@anthropic-ai/sdk');
const pdf = require('pdf-parse');

// Initialize clients
const weaviateClient = weaviate.client({
  scheme: process.env.NEXT_PUBLIC_WEAVIATE_SCHEME || 'https',
  host: process.env.NEXT_PUBLIC_WEAVIATE_HOST || '',
  apiKey: new weaviate.ApiKey(process.env.WEAVIATE_API_KEY || ''),
  headers: {
    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
    'X-VoyageAI-Api-Key': process.env.VOYAGE_API_KEY || ''
  }
});

const voyageClient = new VoyageAIClient({ apiKey: process.env.VOYAGE_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Configuration
const COMPANIES = [
  {
    name: 'Advanced Navigation',
    path: 'C:\\RyanCode\\VeronaAI\\vc-pipeline\\upswell_companies\\1_advanced_navigation'
  },
  {
    name: 'Wonde',
    path: 'C:\\RyanCode\\VeronaAI\\vc-pipeline\\upswell_companies\\2_wonde'
  },
  {
    name: 'SecureStack',
    path: 'C:\\RyanCode\\VeronaAI\\vc-pipeline\\upswell_companies\\3_securestack'
  }
];

const CHUNK_SIZE = 1000; // characters per chunk
const CHUNK_OVERLAP = 200;

// Helper function to find all PDF files recursively
function findPDFs(dir) {
  const pdfs = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      pdfs.push(...findPDFs(fullPath));
    } else if (path.extname(fullPath).toLowerCase() === '.pdf') {
      pdfs.push(fullPath);
    }
  }

  return pdfs;
}

// Extract text from PDF
async function extractTextFromPDF(pdfPath) {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error(`  ❌ Error extracting text from ${pdfPath}:`, error.message);
    return null;
  }
}

// Use Claude to dynamically extract metadata from document
async function extractMetadata(content, fileName, companyName) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Analyze this document and extract key metadata. Return ONLY a JSON object with relevant fields you discover.

Document: ${fileName}
Company: ${companyName}

Content excerpt:
${content.substring(0, 3000)}

Extract fields like document_type, date, amount, round_type, valuation, investors, key_terms, etc. Only include fields that are present and relevant. Be specific and accurate.

Return ONLY the JSON object, no explanation:`
      }]
    });

    const responseText = message.content[0].text;
    // Try to parse JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (error) {
    console.error(`  ⚠️  Error extracting metadata:`, error.message);
    return {};
  }
}

// Chunk text with overlap
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end);
    chunks.push(chunk);
    start += chunkSize - overlap;
  }

  return chunks;
}

// Generate embeddings using Voyage-3
async function generateEmbeddings(texts) {
  try {
    const response = await voyageClient.embed({
      input: texts,
      model: 'voyage-3'
    });
    // Voyage AI returns embeddings in data array or directly in embeddings
    const embeddings = response.data || response.embeddings || response;
    if (!embeddings || !Array.isArray(embeddings)) {
      console.error('  ❌ Unexpected Voyage response:', response);
      throw new Error('Invalid response from Voyage API');
    }
    return embeddings;
  } catch (error) {
    console.error('  ❌ Error generating embeddings:', error.message);
    throw error;
  }
}

// Process a single PDF file
async function processPDF(pdfPath, companyName) {
  const fileName = path.basename(pdfPath);
  const relativePath = pdfPath.replace(/\\/g, '/');

  console.log(`  📄 Processing: ${fileName}`);

  // Extract text
  const text = await extractTextFromPDF(pdfPath);
  if (!text || text.trim().length === 0) {
    console.log(`  ⏭️  Skipping empty document`);
    return 0;
  }

  // Extract metadata dynamically using Claude
  console.log(`  🧠 Extracting metadata with Claude...`);
  const metadata = await extractMetadata(text, fileName, companyName);
  console.log(`  ✅ Extracted fields:`, Object.keys(metadata).join(', '));

  // Chunk the text
  const chunks = chunkText(text);
  console.log(`  ✂️  Created ${chunks.length} chunks`);

  // Generate embeddings for all chunks
  console.log(`  🚀 Generating Voyage-3 embeddings...`);
  const embeddings = await generateEmbeddings(chunks);

  // Prepare batch for Weaviate
  const batcher = weaviateClient.batch.objectsBatcher();

  for (let i = 0; i < chunks.length; i++) {
    const chunkId = `${companyName}_${fileName}_chunk_${i}`;

    // Extract the actual embedding vector (Voyage returns objects with 'embedding' property)
    const vectorData = embeddings[i].embedding || embeddings[i];

    batcher.withObject({
      class: 'SmartExtraction',
      properties: {
        content: chunks[i],
        company_name: companyName,
        file_path: relativePath,
        chunk_id: chunkId,
        chunk_index: i,
        token_count: Math.ceil(chunks[i].length / 4), // rough estimate
        extracted_fields: JSON.stringify(metadata),
        created_at: new Date().toISOString()
      },
      vector: vectorData
    });
  }

  // Insert into Weaviate
  console.log(`  💾 Inserting ${chunks.length} chunks into Weaviate...`);
  await batcher.do();

  console.log(`  ✅ Successfully processed ${fileName}\n`);
  return chunks.length;
}

// Process all documents for a company
async function processCompany(company) {
  console.log(`\n📁 Processing company: ${company.name}`);
  console.log(`   Path: ${company.path}\n`);

  const pdfs = findPDFs(company.path);
  console.log(`   Found ${pdfs.length} PDF files\n`);

  let totalChunks = 0;

  for (const pdfPath of pdfs) {
    const chunks = await processPDF(pdfPath, company.name);
    totalChunks += chunks;
  }

  console.log(`\n✅ Completed ${company.name}: ${pdfs.length} files, ${totalChunks} chunks\n`);
  return { files: pdfs.length, chunks: totalChunks };
}

// Main ingestion function
async function ingestAll() {
  console.log('🚀 Starting document ingestion with dynamic metadata extraction...\n');
  console.log('📊 Configuration:');
  console.log(`   - Collection: SmartExtraction`);
  console.log(`   - Embedding Model: Voyage-3`);
  console.log(`   - Metadata Extraction: Claude 3.5 Sonnet`);
  console.log(`   - Chunk Size: ${CHUNK_SIZE} characters`);
  console.log(`   - Chunk Overlap: ${CHUNK_OVERLAP} characters\n`);

  const stats = {
    totalFiles: 0,
    totalChunks: 0,
    companies: []
  };

  for (const company of COMPANIES) {
    try {
      const result = await processCompany(company);
      stats.totalFiles += result.files;
      stats.totalChunks += result.chunks;
      stats.companies.push({
        name: company.name,
        files: result.files,
        chunks: result.chunks
      });
    } catch (error) {
      console.error(`❌ Error processing ${company.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 INGESTION COMPLETE!\n');
  console.log('📊 Final Statistics:');
  console.log(`   Total Companies: ${COMPANIES.length}`);
  console.log(`   Total Files Processed: ${stats.totalFiles}`);
  console.log(`   Total Chunks Inserted: ${stats.totalChunks}\n`);

  stats.companies.forEach(c => {
    console.log(`   ${c.name}: ${c.files} files, ${c.chunks} chunks`);
  });
  console.log('\n' + '='.repeat(60) + '\n');
}

// Run ingestion
ingestAll()
  .then(() => {
    console.log('✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Ingestion failed:', error);
    process.exit(1);
  });
