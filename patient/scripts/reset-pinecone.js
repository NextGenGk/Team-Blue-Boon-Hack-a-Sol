/**
 * Clear Pinecone and Re-sync from Supabase
 * 
 * This script:
 * 1. Deletes ALL vectors from Pinecone
 * 2. Re-syncs only the 38 doctors from Supabase
 * 
 * Usage: node scripts/reset-pinecone.js
 */

require('dotenv').config({ path: '../ayur-rag/.env' });

async function resetPinecone() {
    console.log('🗑️  Resetting Pinecone Database...\n');

    const { Pinecone } = require('@pinecone-database/pinecone');

    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX_NAME;

    if (!apiKey || !indexName) {
        console.log('❌ Pinecone credentials not found');
        console.log('Make sure PINECONE_API_KEY and PINECONE_INDEX_NAME are set in ayur-rag/.env');
        return;
    }

    try {
        const pinecone = new Pinecone({ apiKey });
        const index = pinecone.Index(indexName);

        // Get current stats
        console.log('📊 Checking current Pinecone status...');
        const statsBefore = await index.describeIndexStats();
        console.log(`   Current vectors: ${statsBefore.totalRecordCount || 0}\n`);

        if (statsBefore.totalRecordCount === 0) {
            console.log('✅ Pinecone is already empty!\n');
        } else {
            // Delete all vectors
            console.log('🗑️  Deleting all vectors from Pinecone...');
            await index.namespace('').deleteAll();
            console.log('✅ All vectors deleted!\n');

            // Wait a bit for deletion to complete
            console.log('⏳ Waiting for deletion to complete...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Verify deletion
        const statsAfter = await index.describeIndexStats();
        console.log(`📊 Vectors after deletion: ${statsAfter.totalRecordCount || 0}\n`);

        console.log('✅ Pinecone reset complete!');
        console.log('\n💡 Next step: Run the sync script to add the 38 Supabase doctors');
        console.log('   cd patient');
        console.log('   node scripts/sync-supabase-to-rag.js');

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

resetPinecone();
