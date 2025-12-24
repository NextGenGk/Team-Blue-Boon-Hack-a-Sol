/**
 * Sync Supabase Doctors to RAG
 * 
 * This script:
 * 1. Fetches all verified doctors from Supabase
 * 2. Syncs them to Pinecone (via webhook)
 * 3. Updates the local JSON file
 * 
 * Usage: node scripts/sync-supabase-to-rag.js
 */

require('dotenv').config({ path: '.env.local' });

async function syncSupabaseToRAG() {
    console.log('🔄 Syncing Supabase Doctors to RAG...\n');

    // Fetch from Supabase
    const { createClient } = require('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Supabase credentials not found in .env.local');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📥 Fetching doctors from Supabase...');
    const { data: doctors, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: true });

    if (error) {
        console.log('❌ Error fetching from Supabase:', error.message);
        return;
    }

    console.log(`✅ Found ${doctors.length} verified doctors in Supabase\n`);

    // Sync each doctor to RAG
    const ragUrl = process.env.RAG_SYNC_URL || 'https://ayur-sutra-rag.vercel.app/api/sync-doctor';
    const webhookSecret = process.env.WEBHOOK_SECRET || '';

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    console.log('🔄 Syncing to RAG (Pinecone + JSON)...\n');

    for (const doctor of doctors) {
        process.stdout.write(`   Syncing ${doctor.specialization} - ${doctor.clinic_name}... `);

        try {
            const response = await fetch(ragUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${webhookSecret}`
                },
                body: JSON.stringify({
                    type: 'INSERT',
                    table: 'doctors',
                    record: doctor
                })
            });

            if (response.ok) {
                console.log('✅');
                successCount++;
            } else {
                const errorData = await response.json();
                console.log(`❌ ${response.status}`);
                failCount++;
                errors.push({ doctor: doctor.clinic_name, error: errorData });
            }
        } catch (error) {
            console.log(`❌ ${error.message}`);
            failCount++;
            errors.push({ doctor: doctor.clinic_name, error: error.message });
        }

        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SYNC COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully synced: ${successCount} doctors`);
    console.log(`❌ Failed: ${failCount} doctors`);

    if (errors.length > 0) {
        console.log('\n⚠️  Errors:');
        errors.forEach(e => {
            console.log(`   - ${e.doctor}: ${JSON.stringify(e.error)}`);
        });
    }

    console.log('\n💡 Next Steps:');
    console.log('1. Check ayur-rag/data/docters.json - should have 38 doctors');
    console.log('2. Verify Pinecone dashboard - should have 38 vectors');
    console.log('3. Test search: http://localhost:3000/api/search?query=cardiology');
    console.log('\n✨ Supabase is now the source of truth!');
}

syncSupabaseToRAG().catch(console.error);
