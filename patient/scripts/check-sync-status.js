/**
 * Check Sync Status Between Supabase and Pinecone
 * 
 * This script compares:
 * 1. Doctors in Supabase database
 * 2. Doctors in docters.json (local backup)
 * 3. Vectors in Pinecone
 */

require('dotenv').config({ path: '.env.local' });

async function checkSupabaseDoctors() {
    const { createClient } = require('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('⚠️  Supabase credentials not found in .env.local');
        return null;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('doctors')
        .select('did, specialization, clinic_name, is_verified')
        .eq('is_verified', true);

    if (error) {
        console.log('❌ Error fetching from Supabase:', error.message);
        return null;
    }

    return data;
}

async function checkLocalJSON() {
    const fs = require('fs');
    const path = require('path');

    const jsonPath = path.join(__dirname, '..', '..', 'ayur-rag', 'data', 'docters.json');

    try {
        const data = fs.readFileSync(jsonPath, 'utf-8');
        const doctors = JSON.parse(data);
        return doctors;
    } catch (error) {
        console.log('❌ Error reading docters.json:', error.message);
        return null;
    }
}

async function checkPinecone() {
    const { Pinecone } = require('@pinecone-database/pinecone');

    // Load ayur-rag env
    require('dotenv').config({ path: '../ayur-rag/.env' });

    const apiKey = process.env.PINECONE_API_KEY;
    const indexName = process.env.PINECONE_INDEX_NAME;

    if (!apiKey || !indexName) {
        console.log('⚠️  Pinecone credentials not found');
        return null;
    }

    try {
        const pinecone = new Pinecone({ apiKey });
        const index = pinecone.Index(indexName);

        // Get index stats
        const stats = await index.describeIndexStats();

        return {
            totalVectors: stats.totalRecordCount || 0,
            dimension: stats.dimension,
            indexName: indexName
        };
    } catch (error) {
        console.log('❌ Error connecting to Pinecone:', error.message);
        return null;
    }
}

async function main() {
    console.log('🔍 Checking Sync Status...\n');
    console.log('='.repeat(60));

    // Check Supabase
    console.log('\n📊 1. SUPABASE DATABASE (doctors table)');
    console.log('-'.repeat(60));
    const supabaseDoctors = await checkSupabaseDoctors();

    if (supabaseDoctors) {
        console.log(`✅ Found ${supabaseDoctors.length} verified doctors`);
        console.log('\nSample doctors:');
        supabaseDoctors.slice(0, 3).forEach(d => {
            console.log(`   - ${d.specialization} at ${d.clinic_name}`);
        });
    } else {
        console.log('❌ Could not fetch Supabase doctors');
    }

    // Check Local JSON
    console.log('\n📄 2. LOCAL JSON (docters.json)');
    console.log('-'.repeat(60));
    const localDoctors = await checkLocalJSON();

    if (localDoctors) {
        console.log(`✅ Found ${localDoctors.length} doctors in JSON`);
        console.log('\nSample doctors:');
        localDoctors.slice(0, 3).forEach(d => {
            console.log(`   - ${d.specialization} at ${d.clinic_name}`);
        });
    } else {
        console.log('❌ Could not read docters.json');
    }

    // Check Pinecone
    console.log('\n🔮 3. PINECONE VECTOR DATABASE');
    console.log('-'.repeat(60));
    const pineconeStats = await checkPinecone();

    if (pineconeStats) {
        console.log(`✅ Index: ${pineconeStats.indexName}`);
        console.log(`✅ Total vectors: ${pineconeStats.totalVectors}`);
        console.log(`✅ Dimension: ${pineconeStats.dimension}`);
    } else {
        console.log('❌ Could not connect to Pinecone');
    }

    // Compare
    console.log('\n📊 SYNC STATUS COMPARISON');
    console.log('='.repeat(60));

    if (supabaseDoctors && localDoctors && pineconeStats) {
        const supabaseCount = supabaseDoctors.length;
        const jsonCount = localDoctors.length;
        const pineconeCount = pineconeStats.totalVectors;

        console.log(`\n📈 Doctor Counts:`);
        console.log(`   Supabase:  ${supabaseCount} doctors`);
        console.log(`   JSON:      ${jsonCount} doctors`);
        console.log(`   Pinecone:  ${pineconeCount} vectors`);

        console.log('\n🔍 Analysis:');

        if (supabaseCount === jsonCount && jsonCount === pineconeCount) {
            console.log('   ✅ PERFECT SYNC! All sources have the same count.');
        } else {
            console.log('   ⚠️  SYNC MISMATCH DETECTED!');

            if (supabaseCount !== jsonCount) {
                const diff = Math.abs(supabaseCount - jsonCount);
                console.log(`   ⚠️  Supabase vs JSON: ${diff} doctor(s) difference`);
                if (supabaseCount > jsonCount) {
                    console.log(`      → ${diff} doctor(s) in Supabase not in JSON`);
                } else {
                    console.log(`      → ${diff} doctor(s) in JSON not in Supabase`);
                }
            }

            if (supabaseCount !== pineconeCount) {
                const diff = Math.abs(supabaseCount - pineconeCount);
                console.log(`   ⚠️  Supabase vs Pinecone: ${diff} vector(s) difference`);
                if (supabaseCount > pineconeCount) {
                    console.log(`      → ${diff} doctor(s) in Supabase not in Pinecone`);
                    console.log(`      → ACTION: Run sync script to add missing doctors`);
                } else {
                    console.log(`      → ${diff} extra vector(s) in Pinecone`);
                    console.log(`      → ACTION: May include test data or deleted doctors`);
                }
            }
        }

        // Check for specific missing doctors
        if (supabaseDoctors && localDoctors) {
            const supabaseIds = new Set(supabaseDoctors.map(d => d.did));
            const jsonIds = new Set(localDoctors.map(d => d.did));

            const inSupabaseNotJson = supabaseDoctors.filter(d => !jsonIds.has(d.did));
            const inJsonNotSupabase = localDoctors.filter(d => !supabaseIds.has(d.did));

            if (inSupabaseNotJson.length > 0) {
                console.log(`\n   📋 Doctors in Supabase but NOT in JSON (${inSupabaseNotJson.length}):`);
                inSupabaseNotJson.slice(0, 5).forEach(d => {
                    console.log(`      - ${d.specialization} at ${d.clinic_name}`);
                });
                if (inSupabaseNotJson.length > 5) {
                    console.log(`      ... and ${inSupabaseNotJson.length - 5} more`);
                }
            }

            if (inJsonNotSupabase.length > 0) {
                console.log(`\n   📋 Doctors in JSON but NOT in Supabase (${inJsonNotSupabase.length}):`);
                inJsonNotSupabase.slice(0, 5).forEach(d => {
                    console.log(`      - ${d.specialization} at ${d.clinic_name}`);
                });
                if (inJsonNotSupabase.length > 5) {
                    console.log(`      ... and ${inJsonNotSupabase.length - 5} more`);
                }
            }
        }

        console.log('\n💡 RECOMMENDATIONS:');
        console.log('-'.repeat(60));

        if (supabaseCount === jsonCount && jsonCount === pineconeCount) {
            console.log('✅ Everything is in sync! No action needed.');
        } else {
            if (supabaseCount > pineconeCount || supabaseCount > jsonCount) {
                console.log('🔧 Run sync to update Pinecone and JSON:');
                console.log('   cd patient');
                console.log('   node scripts/sync-doctors-to-rag.js');
            }

            if (pineconeCount > supabaseCount) {
                console.log('🧹 Pinecone has extra vectors (possibly test data)');
                console.log('   This is usually fine, but you can clean up if needed');
            }
        }
    }

    console.log('\n' + '='.repeat(60));
}

main().catch(console.error);
