#!/usr/bin/env node

const API_URL = process.env.API_URL || 'http://localhost:3002';

async function testEnhancedTracing() {
  console.log('🚀 Testing Enhanced Braintrust Tracing\n');
  console.log('='.repeat(40));

  const tests = [
    {
      name: 'Simple Test',
      endpoint: '/api/test-enhanced-tracing',
      body: {
        testType: 'simple',
        userId: 'demo-user',
        sessionId: 'demo-session-' + Date.now(),
      },
    },
    {
      name: 'Complex Test with Sub-operations',
      endpoint: '/api/test-enhanced-tracing',
      body: {
        testType: 'complex',
        userId: 'demo-user',
        sessionId: 'demo-session-' + Date.now(),
      },
    },
    {
      name: 'Search Test with Real Data',
      endpoint: '/api/search',
      body: {
        query: 'What are the key terms of Series A investments?',
        searchType: 'hybrid',
        userId: 'demo-user',
        sessionId: 'demo-session-' + Date.now(),
      },
    },
    {
      name: 'Error Test',
      endpoint: '/api/test-enhanced-tracing',
      body: {
        testType: 'error',
        userId: 'demo-user',
        sessionId: 'demo-session-' + Date.now(),
      },
    },
  ];

  for (const test of tests) {
    console.log(`\n📊 Running: ${test.name}`);
    console.log('-'.repeat(40));

    try {
      const response = await fetch(`${API_URL}${test.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.body),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Success!');
        if (data.result) {
          console.log('📈 Result:', JSON.stringify(data.result, null, 2).substring(0, 200) + '...');
        }
        if (data.aiAnswer) {
          console.log('🤖 AI Answer:', data.aiAnswer.substring(0, 100) + '...');
        }
        if (data.confidence) {
          console.log('🎯 Confidence:', data.confidence);
        }
      } else {
        console.log('❌ Error Response:', data.error || 'Unknown error');
      }

      if (data.tracing) {
        console.log('🔍 Tracing:', data.tracing.message);
      }
    } catch (error) {
      console.error('💥 Request failed:', error.message);
    }
  }

  console.log('\n' + '='.repeat(40));
  console.log('✨ Testing complete!');
  console.log('\n🔗 Check your Braintrust dashboard to see:');
  console.log('   - Custom scoring metrics (relevance, completeness, performance)');
  console.log('   - Detailed metadata (userId, sessionId, feature tags)');
  console.log('   - Descriptive span names for better traceability');
  console.log('   - Error tracking with stack traces');
  console.log('\n📊 Dashboard: https://www.braintrust.dev');
  console.log('   Project: VeronaAI');
}

// Run the test
testEnhancedTracing().catch(console.error);