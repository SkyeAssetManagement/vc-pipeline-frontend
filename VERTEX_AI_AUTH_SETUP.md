# Vertex AI RAG Corpus Authentication Setup

## Important: Authentication Requirements

The Vertex AI RAG Corpus API requires OAuth2 authentication and **does not support API keys**. You need to set up proper Google Cloud credentials.

## Option 1: Service Account Key (Recommended for Production)

1. **Create a Service Account**:
   ```bash
   gcloud iam service-accounts create vertex-rag-service \
     --display-name="Vertex AI RAG Service Account" \
     --project=russtest4
   ```

2. **Grant Required Permissions**:
   ```bash
   gcloud projects add-iam-policy-binding russtest4 \
     --member="serviceAccount:vertex-rag-service@russtest4.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

3. **Create and Download Service Account Key**:
   ```bash
   gcloud iam service-accounts keys create vertex-rag-key.json \
     --iam-account=vertex-rag-service@russtest4.iam.gserviceaccount.com
   ```

4. **Set Environment Variable**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="path/to/vertex-rag-key.json"
   ```

   Or add to your `.env.local`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./vertex-rag-key.json
   ```

## Option 2: Use Existing Service Account

Since you mentioned having a service account `vertex-express@russtest4.iam.gserviceaccount.com`, you can:

1. **Download the key for this account**:
   ```bash
   gcloud iam service-accounts keys create vertex-express-key.json \
     --iam-account=vertex-express@russtest4.iam.gserviceaccount.com
   ```

2. **Set the credentials**:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./vertex-express-key.json"
   ```

## Option 3: Local Development with gcloud

For local development, you can use your personal Google Cloud credentials:

```bash
# Login to Google Cloud
gcloud auth login

# Set application default credentials
gcloud auth application-default login

# Set the project
gcloud config set project russtest4
```

## Current Status

The integration is set up but requires OAuth2 authentication to work. The API key you provided (`AIzaSyAQ...`) works with Gemini API for text generation but not with the RAG Corpus API.

## What's Working

1. ✅ Frontend integration code is ready
2. ✅ Service is configured with your project details
3. ✅ Fallback to mock data when auth fails
4. ❌ RAG Corpus queries (need OAuth2 auth)
5. ✅ Gemini API for answer generation (using API key)

## Next Steps

1. Set up one of the authentication methods above
2. Place the service account key file in your project directory
3. Update `.env.local` with `GOOGLE_APPLICATION_CREDENTIALS` path
4. Restart your development server
5. The RAG Corpus queries should then work properly

## Testing

Once authentication is set up, you can test with:

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me investment data",
    "searchType": "hybrid"
  }'
```