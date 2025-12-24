/**
 * Simple Sync Status Checker
 * Compares doctor counts across Supabase, JSON, and Pinecone
 */

const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🔍 Checking Sync Status...\n');

    // 1. Check local JSON
    console.log('1️⃣  LOCAL JSON (docters.json)');
    try {
        const jsonPath = path.join(__dirname, '..', '..', 'ayur-rag', 'data', 'docters.json');
        const data = fs.readFileSync(jsonPath, 'utf-8');
        const doctors = JSON.parse(data);
        console.log(`   ✅ Found ${doctors.length} doctors in JSON`);
        console.log(`   Sample: ${doctors[0]?.specialization} at ${doctors[0]?.clinic_name}\n`);
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
    }

    // 2. Check Supabase
    console.log('2️⃣  SUPABASE DATABASE');
    console.log('   ⚠️  Need to check manually:');
    console.log('   → Go to Supabase Dashboard');
    console.log('   → Run: SELECT COUNT(*) FROM doctors WHERE is_verified = true;\n');

    // 3. Check Pinecone
    console.log('3️⃣  PINECONE VECTOR DATABASE');
    console.log('   ⚠️  Need to check manually:');
    console.log('   → Go to https://app.pinecone.io');
    console.log('   → Select your index');
    console.log('   → Check "Total vectors" count\n');

    console.log('📊 COMPARISON:');
    console.log('─'.repeat(50));
    console.log('Compare the three counts above:');
    console.log('• If all match → ✅ Perfect sync!');
    console.log('• If different → ⚠️  Need to sync');
    console.log('\n💡 To sync missing doctors:');
    console.log('   cd patient');
    console.log('   node scripts/sync-doctors-to-rag.js');
}

main();
