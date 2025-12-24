import fs from 'fs';
import dotenv from 'dotenv';

// Read current .env
const envConfig = dotenv.parse(fs.readFileSync('.env'));

console.log('\n🔍 Current .env file analysis:\n');

// Check what we have
const has = {
    SUPABASE_URL: !!envConfig.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!envConfig.SUPABASE_ANON_KEY,
    DATABASE_URL: !!envConfig.DATABASE_URL,
    GEMINI_API_KEY: !!envConfig.GEMINI_API_KEY
};

Object.entries(has).forEach(([key, value]) => {
    console.log(`  ${value ? '✅' : '❌'} ${key}`);
});

// If DATABASE_URL is missing but we have SUPABASE_URL, we can construct it
if (!has.DATABASE_URL && has.SUPABASE_URL) {
    console.log('\n💡 DATABASE_URL is missing, but I can help you create it!\n');
    console.log('I need your Supabase database password.');
    console.log('You can find it in Supabase Dashboard → Settings → Database\n');

    // Extract project ID from SUPABASE_URL
    const projectMatch = envConfig.SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/);

    if (projectMatch) {
        const projectId = projectMatch[1];
        console.log(`📍 Your Supabase project ID: ${projectId}\n`);
        console.log('Your DATABASE_URL should be:');
        console.log(`postgresql://postgres:YOUR_PASSWORD@db.${projectId}.supabase.co:5432/postgres\n`);
        console.log('⚠️  Replace YOUR_PASSWORD with your actual database password');
        console.log('⚠️  If password has special characters (@, #, etc.), URL-encode them!\n');
        console.log('Example:');
        console.log('  Password: MyP@ss#123');
        console.log('  Encoded:  MyP%40ss%23123\n');
        console.log('Add this line to your .env file:');
        console.log(`DATABASE_URL=postgresql://postgres:YOUR_ENCODED_PASSWORD@db.${projectId}.supabase.co:5432/postgres\n`);
    }
} else if (has.DATABASE_URL) {
    console.log('\n✅ DATABASE_URL is set!');
} else {
    console.log('\n❌ Cannot construct DATABASE_URL - SUPABASE_URL is also missing!');
}

console.log('\n📝 To fix this, add the DATABASE_URL line to your .env file.\n');
