# Vertex AI RAG Integration Setup

## Overview
The frontend has been configured to use Google Vertex AI RAG instead of Weaviate for document search and retrieval.

## Configuration Steps

1. **Update Environment Variables**
   Add the following to your `.env.local` file:
   ```
   # Google Vertex AI Configuration
   VERTEX_AI_PROJECT_ID=your-gcp-project-id
   VERTEX_AI_LOCATION=global  # or your specific region like 'us-central1'
   VERTEX_AI_DATASTORE_ID=your-datastore-id
   VERTEX_AI_API_KEY=your-vertex-ai-api-key
   ```

2. **Get Your Vertex AI Credentials**
   - **Project ID**: Your Google Cloud Project ID
   - **Location**: The region where your Vertex AI Search data store is deployed (usually 'global')
   - **Data Store ID**: The ID of your Vertex AI Search data store
   - **API Key**: Create an API key in Google Cloud Console with Vertex AI permissions

## API Key Setup (Recommended for Frontend)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Click "Create Credentials" > "API Key"
4. Restrict the API key to:
   - Application restrictions: HTTP referrers (for production)
   - API restrictions: Discovery Engine API / Vertex AI API
5. Copy the API key to your `.env.local` file

## Alternative: Service Account Authentication

If you prefer using service account authentication instead of an API key:

1. Remove the `VERTEX_AI_API_KEY` from `.env.local`
2. Set up Application Default Credentials:
   ```bash
   gcloud auth application-default login
   ```
   Or provide a service account key file:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/service-account-key.json"
   ```

## Features

The Vertex AI integration provides:

1. **Standard Search**: Query your documents with natural language
2. **Answer API**: Get AI-generated answers with citations
3. **Filtering**: Filter by company name and document type
4. **Metadata Support**: Preserves and returns document metadata

## API Endpoints

The search API remains at `/api/search` but now uses Vertex AI:

```typescript
// Example request
POST /api/search
{
  "query": "Show me Series A investment terms",
  "filters": {
    "company": "Advanced Navigation",
    "documentType": "term_sheet"
  },
  "searchType": "hybrid"  // This parameter is preserved for compatibility
}
```

## Troubleshooting

1. **Authentication Errors**
   - Verify your API key has the correct permissions
   - Check that the project ID and data store ID are correct
   - Ensure the Discovery Engine API is enabled in your GCP project

2. **No Results**
   - Verify your data store has been indexed
   - Check that the document schema matches expected fields (content, company_name, document_type)
   - Review the Vertex AI Search console for indexing status

3. **CORS Issues**
   - If using API key, ensure your domain is whitelisted
   - For development, you may need to use a proxy or service account

## Migration Notes

- The frontend search API remains compatible with existing UI components
- Search results are transformed to match the expected format
- The AI synthesis using Claude remains unchanged
- Braintrust tracing has been updated to track Vertex AI operations