/**
 * Generate SQL for Missing Doctors
 * Saves SQL to a file instead of printing to console
 */

const fs = require('fs');
const path = require('path');

async function generateSQL() {
    console.log('🔍 Generating SQL for missing doctors...\n');

    // Read JSON file
    const jsonPath = path.join(__dirname, '..', '..', 'ayur-rag', 'data', 'docters.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const jsonDoctors = JSON.parse(jsonData);

    // Get Supabase doctors
    require('dotenv').config({ path: '.env.local' });
    const { createClient } = require('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: supabaseDoctors, error } = await supabase
        .from('doctors')
        .select('did');

    if (error) {
        console.log('❌ Error:', error.message);
        return;
    }

    // Find missing doctors
    const supabaseIds = new Set(supabaseDoctors.map(d => d.did));
    const missingDoctors = jsonDoctors.filter(d => !supabaseIds.has(d.did));

    console.log(`📊 Supabase: ${supabaseDoctors.length} doctors`);
    console.log(`📄 JSON: ${jsonDoctors.length} doctors`);
    console.log(`⚠️  Missing: ${missingDoctors.length} doctors\n`);

    // Generate SQL
    let sql = `-- =====================================================
-- Add Missing Doctors to Supabase
-- =====================================================
-- This SQL adds ${missingDoctors.length} doctors that are in JSON but not in Supabase
-- After running this, the webhook will auto-sync them to Pinecone
-- =====================================================

-- Step 1: Add users
INSERT INTO users (uid, email, phone, password_hash, role, name, is_verified, is_active) VALUES\n`;

    missingDoctors.forEach((d, i) => {
        const email = `doctor.${d.did.substring(0, 8)}@ayursutram.com`;
        const phone = `+9198765${43200 + i}`;
        const name = `Dr. ${d.specialization} Specialist`;
        const isLast = i === missingDoctors.length - 1;
        sql += `('${d.uid}', '${email}', '${phone}', '$2a$10$placeholder_hash', 'doctor', '${name}', TRUE, TRUE)${isLast ? '\nON CONFLICT (uid) DO NOTHING;\n\n' : ',\n'}`;
    });

    sql += `-- Step 2: Add doctors\nINSERT INTO doctors (did, uid, specialization, qualification, registration_number, years_of_experience, consultation_fee, bio, clinic_name, address_line1, address_line2, city, state, country, postal_code, languages, is_verified) VALUES\n`;

    missingDoctors.forEach((d, i) => {
        const isLast = i === missingDoctors.length - 1;
        const langs = `ARRAY[${d.languages.map(l => `'${l}'`).join(', ')}]`;
        const bio = d.bio.replace(/'/g, "''");
        const clinic = d.clinic_name.replace(/'/g, "''");
        sql += `('${d.did}', '${d.uid}', '${d.specialization}', '${d.qualification}', ${d.registration_number ? `'${d.registration_number}'` : 'NULL'}, ${d.years_of_experience}, ${d.consultation_fee}, '${bio}', '${clinic}', '${d.address_line1}', ${d.address_line2 ? `'${d.address_line2}'` : 'NULL'}, '${d.city}', '${d.state}', '${d.country}', '${d.postal_code}', ${langs}, ${d.is_verified})${isLast ? '\nON CONFLICT (did) DO NOTHING;\n' : ',\n'}`;
    });

    sql += `\n-- =====================================================\n-- After running this SQL:\n-- 1. Check count: SELECT COUNT(*) FROM doctors;\n-- 2. Should show 52 doctors\n-- 3. Webhook will auto-sync to Pinecone\n-- =====================================================\n`;

    // Save to file
    const sqlPath = path.join(__dirname, 'add-missing-doctors.sql');
    fs.writeFileSync(sqlPath, sql);

    console.log(`✅ SQL saved to: ${sqlPath}`);
    console.log(`\n📋 Missing doctors:`);
    missingDoctors.forEach((d, i) => {
        console.log(`   ${i + 1}. ${d.specialization} - ${d.clinic_name}`);
    });

    console.log(`\n💡 Next steps:`);
    console.log(`1. Open: ${sqlPath}`);
    console.log(`2. Copy the SQL`);
    console.log(`3. Go to Supabase Dashboard → SQL Editor`);
    console.log(`4. Paste and run`);
    console.log(`5. Verify: SELECT COUNT(*) FROM doctors;`);
}

generateSQL().catch(console.error);
