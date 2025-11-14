// Simple test script to check if your endpoints are working
// Run with: node test_endpoints.js

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    console.log(`📡 URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name} - SUCCESS (${response.status})`);
      console.log(`📊 Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ ${name} - FAILED (${response.status})`);
      console.log(`📊 Response:`, JSON.stringify(data, null, 2));
    }
    
    return { success: response.status === expectedStatus, data };
  } catch (error) {
    console.log(`💥 ${name} - ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting API Endpoint Tests...');
  console.log('📍 Base URL:', BASE_URL);
  
  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/api/health-check`
    },
    {
      name: 'Database Debug',
      url: `${BASE_URL}/api/debug-db`
    },
    {
      name: 'Basic Search - Heart',
      url: `${BASE_URL}/api/search?query=heart&lang=en`
    },
    {
      name: 'AI Search - Chest Pain',
      url: `${BASE_URL}/api/search?query=I have chest pain and breathing problems&lang=en&lat=28.5672&lon=77.2100`
    },
    {
      name: 'Hindi Search - Headache',
      url: `${BASE_URL}/api/search?query=सिरदर्द&lang=hi`
    },
    {
      name: 'Nurse Search',
      url: `${BASE_URL}/api/search?query=home care nurse&lang=en`
    },
    {
      name: 'Test Search Function',
      url: `${BASE_URL}/api/test-search?symptoms=chest pain,heart attack&lat=28.5672&lon=77.2100`
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.url);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📈 Test Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your API is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/health-check`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running at http://localhost:3000');
    console.log('💡 Please start your Next.js app with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running!');
  await runTests();
}

main().catch(console.error);