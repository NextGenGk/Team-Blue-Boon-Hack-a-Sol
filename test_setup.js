// Simple test script to verify the AI search setup
// Run with: node test_setup.js

const BASE_URL = 'http://localhost:3000';

async function testAPI(endpoint, description) {
  try {
    console.log(`\n🧪 Testing: ${description}`);
    console.log(`📡 Endpoint: ${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Failed!');
      console.log('📊 Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Healthcare PWA - AI Search Test Suite');
  console.log('==========================================');
  
  // Test 1: Health Check
  await testAPI('/api/health-check', 'System Health Check');
  
  // Test 2: Basic Search
  await testAPI('/api/test-search?query=doctor', 'Basic Search Test');
  
  // Test 3: AI Search - Headache
  await testAPI('/api/search?query=I have a headache&lang=en', 'AI Search - Headache (English)');
  
  // Test 4: AI Search - Chest Pain
  await testAPI('/api/search?query=I have chest pain&lang=en', 'AI Search - Chest Pain (English)');
  
  // Test 5: AI Search - Hindi
  await testAPI('/api/search?query=मुझे सिरदर्द है&lang=hi', 'AI Search - Headache (Hindi)');
  
  // Test 6: AI Search with Location
  await testAPI('/api/search?query=knee pain&lat=28.5672&lon=77.2100', 'AI Search with Location');
  
  // Test 7: Comprehensive AI Test
  await testAPI('/api/test-ai-search?query=stomach pain', 'Comprehensive AI Test');
  
  console.log('\n🎉 Test Suite Complete!');
  console.log('\n📋 Quick Test Commands:');
  console.log('curl "http://localhost:3000/api/search?query=I have a headache"');
  console.log('curl "http://localhost:3000/api/search?query=chest pain"');
  console.log('curl "http://localhost:3000/api/health-check"');
}

// Run the tests
runTests().catch(console.error);