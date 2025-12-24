/**
 * Find Missing Doctors
 * Compares JSON with Supabase to find which doctors are missing
 */

const fs = require('fs');
const path = require('path');

async function findMissingDoctors() {
    console.log('🔍 Finding Missing Doctors...\n');

    // Read JSON file
    const jsonPath = path.join(__dirname, '..', '..', 'ayur-rag', 'data', 'docters.json');
    const jsonData = fs.readFileSync(jsonPath, 'utf-8');
    const jsonDoctors = JSON.parse(jsonData);

    console.log(`📄 JSON has ${jsonDoctors.length} doctors`);
    console.log(`📊 Supabase has 38 doctors`);
    console.log(`⚠️  Difference: ${jsonDoctors.length - 38} doctors missing from Supabase\n`);

    // Get Supabase doctors
    require('dotenv').config({ path: '.env.local' });
    const { createClient } = require('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.log('❌ Supabase credentials not found');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: supabaseDoctors, error } = await supabase
        .from('doctors')
        .select('did, specialization, clinic_name');

    if (error) {
        console.log('❌ Error fetching from Supabase:', error.message);
        return;
    }

    console.log(`✅ Fetched ${supabaseDoctors.length} doctors from Supabase\n`);

    // Find missing doctors
    const supabaseIds = new Set(supabaseDoctors.map(d => d.did));
    const missingDoctors = jsonDoctors.filter(d => !supabaseIds.has(d.did));

    console.log(`📋 MISSING DOCTORS (${missingDoctors.length}):`);
    console.log('='.repeat(60));

    missingDoctors.forEach((d, i) => {
        console.log(`${i + 1}. ${d.specialization} - ${d.clinic_name}`);
        console.log(`   DID: ${d.did}`);
    });

    // Generate SQL to add missing doctors
    console.log('\n\n📝 SQL TO ADD MISSING DOCTORS:');
    console.log('='.repeat(60));
    console.log('-- Copy and run this in Supabase SQL Editor\n');

    console.log('-- First, add users for these doctors');
    console.log('INSERT INTO users (uid, email, phone, password_hash, role, name, is_verified, is_active) VALUES');

    const userValues = missingDoctors.map((d, i) => {
        const email = `doctor.${d.did.substring(0, 8)}@ayursutram.com`;
        const phone = `+9198765${43200 + i}`;
        const name = `Dr. ${d.specialization} Specialist`;
        const isLast = i === missingDoctors.length - 1;
        return `('${d.uid}', '${email}', '${phone}', '$2a$10$placeholder_hash', 'doctor', '${name}', TRUE, TRUE)${isLast ? ';' : ','}`;
    }).join('\n');

    console.log(userValues);
    console.log('\n-- Then, add the doctors');
    console.log('INSERT INTO doctors (did, uid, specialization, qualification, registration_number, years_of_experience, consultation_fee, bio, clinic_name, address_line1, address_line2, city, state, country, postal_code, languages, is_verified) VALUES');

    const doctorValues = missingDoctors.map((d, i) => {
        const isLast = i === missingDoctors.length - 1;
        const langs = `ARRAY[${d.languages.map(l => `'${l}'`).join(', ')}]`;
        return `('${d.did}', '${d.uid}', '${d.specialization}', '${d.qualification}', ${d.registration_number ? `'${d.registration_number}'` : 'NULL'}, ${d.years_of_experience}, ${d.consultation_fee}, '${d.bio.replace(/'/g, "''")}', '${d.clinic_name.replace(/'/g, "''")}', '${d.address_line1}', ${d.address_line2 ? `'${d.address_line2}'` : 'NULL'}, '${d.city}', '${d.state}', '${d.country}', '${d.postal_code}', ${langs}, ${d.is_verified})${isLast ? ';' : ','}`;
    }).join('\n');

    console.log(doctorValues);

    console.log('\n\n💡 NEXT STEPS:');
    console.log('1. Copy the SQL above');
    console.log('2. Go to Supabase Dashboard → SQL Editor');
    console.log('3. Paste and run the SQL');
    console.log('4. The webhook will automatically sync to Pinecone!');
    console.log('5. Verify: SELECT COUNT(*) FROM doctors; (should be 52)');
}

findMissingDoctors().catch(console.error);
