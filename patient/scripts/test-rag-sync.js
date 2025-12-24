/**
 * Test Script for Doctor RAG Sync
 * 
 * This script tests the webhook endpoint by sending a sample doctor payload.
 * 
 * Usage:
 *   node scripts/test-rag-sync.js
 */

async function testSync() {
    const ragUrl = process.env.RAG_SYNC_URL || 'http://localhost:3000/api/sync-doctor';
    const webhookSecret = process.env.WEBHOOK_SECRET || 'test-secret';

    const testDoctor = {
        type: 'INSERT',
        table: 'doctors',
        record: {
            did: '350e8400-e29b-41d4-a716-446655440999',
            uid: '650e8400-e29b-41d4-a716-446655440999',
            specialization: 'Test Specialization',
            qualification: 'MBBS, MD (Test)',
            registration_number: 'TEST-99001',
            years_of_experience: 5,
            consultation_fee: '500.00',
            bio: 'This is a test doctor for verifying the RAG sync functionality.',
            clinic_name: 'Test Clinic',
            address_line1: '123 Test Street',
            address_line2: null,
            city: 'Indore',
            state: 'Madhya Pradesh',
            country: 'India',
            postal_code: '452001',
            languages: ['English', 'Hindi'],
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    };

    console.log('🧪 Testing Doctor RAG Sync\n');
    console.log(`📡 Endpoint: ${ragUrl}`);
    console.log(`🔑 Using secret: ${webhookSecret.substring(0, 10)}...`);
    console.log(`\n📦 Sending test doctor payload...\n`);

    try {
        const response = await fetch(ragUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${webhookSecret}`
            },
            body: JSON.stringify(testDoctor)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ SUCCESS!\n');
            console.log('Response:', JSON.stringify(result, null, 2));
            console.log('\n✨ The webhook is working correctly!');
            console.log('\nNext steps:');
            console.log('1. Check ayur-rag/data/docters.json for the test doctor');
            console.log('2. Verify in Pinecone dashboard that the vector was added');
            console.log('3. Test search: http://localhost:3000/api/search?query=test');
        } else {
            console.log('❌ FAILED!\n');
            console.log(`Status: ${response.status}`);
            console.log('Response:', JSON.stringify(result, null, 2));
            console.log('\nTroubleshooting:');
            console.log('- Check that ayur-rag server is running (npm run dev)');
            console.log('- Verify WEBHOOK_SECRET matches in both .env files');
            console.log('- Check ayur-rag server logs for errors');
        }
    } catch (error) {
        console.log('❌ ERROR!\n');
        console.log(error.message);
        console.log('\nTroubleshooting:');
        console.log('- Is the ayur-rag server running? (npm run dev)');
        console.log('- Is the URL correct?', ragUrl);
        console.log('- Check for network/firewall issues');
    }
}

// Load environment variables if available
try {
    require('dotenv').config({ path: '.env.local' });
} catch (e) {
    console.log('⚠️  No .env.local found, using defaults');
}

testSync();
