/**
 * Manual Doctor Sync Script
 * 
 * This script fetches doctors from Supabase and syncs them to the RAG system.
 * Useful for:
 * - Initial bulk sync
 * - Re-syncing after data corruption
 * - Testing the sync functionality
 * 
 * Usage:
 *   node scripts/sync-doctors-to-rag.js
 *   node scripts/sync-doctors-to-rag.js --doctor-id=<did>  (sync single doctor)
 */

require('dotenv').config({ path: '.env.local' });

async function syncDoctorToRAG(doctor) {
    const ragUrl = process.env.RAG_SYNC_URL || 'http://localhost:3002/api/sync-doctor';
    const webhookSecret = process.env.WEBHOOK_SECRET || '';

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

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to sync');
        }

        return { success: true, result };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function fetchDoctorsFromSupabase(doctorId = null) {
    const { createClient } = require('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase credentials in .env.local');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
        .from('doctors')
        .select('*')
        .eq('is_verified', true);

    if (doctorId) {
        query = query.eq('did', doctorId);
    }

    const { data, error } = await query;

    if (error) {
        throw new Error(`Supabase error: ${error.message}`);
    }

    return data;
}

async function main() {
    console.log('🏥 Doctor to RAG Sync Script\n');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const doctorIdArg = args.find(arg => arg.startsWith('--doctor-id='));
    const doctorId = doctorIdArg ? doctorIdArg.split('=')[1] : null;

    try {
        // Fetch doctors from Supabase
        console.log(doctorId
            ? `📥 Fetching doctor ${doctorId} from Supabase...`
            : '📥 Fetching all verified doctors from Supabase...'
        );

        const doctors = await fetchDoctorsFromSupabase(doctorId);

        if (!doctors || doctors.length === 0) {
            console.log('❌ No doctors found');
            return;
        }

        console.log(`✅ Found ${doctors.length} doctor(s)\n`);

        // Sync each doctor to RAG
        let successCount = 0;
        let failCount = 0;

        for (const doctor of doctors) {
            process.stdout.write(`Syncing ${doctor.clinic_name || doctor.did}... `);

            const result = await syncDoctorToRAG(doctor);

            if (result.success) {
                console.log('✅');
                successCount++;
            } else {
                console.log(`❌ ${result.error}`);
                failCount++;
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`\n📊 Sync Complete:`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Failed: ${failCount}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

main();
