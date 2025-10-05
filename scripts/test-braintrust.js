const fetch = require('node-fetch');

async function testBraintrustIntegration() {
  console.log('🧪 Testing Braintrust integration...\n');

  const testQueries = [
    'What are the investment terms for Advanced Navigation?',
    'Show me Series A funding rounds',
    'Find information about board seats and governance'
  ];

  for (const query of testQueries) {
    console.log(`📝 Testing query: "${query}"`);

    try {
      const response = await fetch('http://localhost:3004/api/search-optimized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          searchType: 'hybrid',
          useOptimizedCollection: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Success! Found ${data.totalResults} results`);
        console.log(`   Confidence: ${data.confidence}`);
        console.log(`   AI Answer Length: ${data.aiAnswer?.length || 0} chars\n`);
      } else {
        console.log(`❌ Error: ${response.status} ${response.statusText}\n`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎯 Test completed! Check your Braintrust dashboard for traces.');
  console.log('📊 Dashboard: https://www.braintrust.dev/app');
}

testBraintrustIntegration().catch(console.error);