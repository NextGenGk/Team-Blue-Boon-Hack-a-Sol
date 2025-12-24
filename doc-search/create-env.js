import fs from 'fs';

console.log('\n🔧 Updating .env file with Supabase credentials...\n');

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rsnysvtjmelnojkubdqu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbnlzdnRqbWVsbm9qa3ViZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjQwNDQsImV4cCI6MjA4MTQ0MDA0NH0.5Fl0bX46yIpN2zR82_BcrOMJkJAvW5UobORJ93TxqyQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbnlzdnRqbWVsbm9qa3ViZHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg2NDA0NCwiZXhwIjoyMDgxNDQwMDQ0fQ.WR1yCGjb9SvhAzAFwrMt8vcdjS6ojtWjbbokkSQPDfk

# Database Configuration
# Get your password from Supabase Dashboard → Settings → Database
# IMPORTANT: URL-encode special characters in password (@ → %40, # → %23, etc.)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.rsnysvtjmelnojkubdqu.supabase.co:5432/postgres

# Gemini AI API Key
# Get from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

# Server Configuration
PORT=3000
NODE_ENV=development
`;

try {
    fs.writeFileSync('.env', envContent);
    console.log('✅ .env file created successfully!\n');
    console.log('📋 Configuration:');
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL: Set');
    console.log('   ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: Set');
    console.log('   ✅ SUPABASE_SERVICE_ROLE_KEY: Set');
    console.log('   ⚠️  DATABASE_URL: Needs password');
    console.log('   ⚠️  GEMINI_API_KEY: Needs your key\n');

    console.log('🔐 Next steps:');
    console.log('   1. Get your database password from Supabase Dashboard');
    console.log('   2. Get your Gemini API key from https://makersuite.google.com/app/apikey');
    console.log('   3. Edit .env file and replace:');
    console.log('      - YOUR_PASSWORD_HERE with your database password (URL-encoded)');
    console.log('      - YOUR_GEMINI_API_KEY_HERE with your Gemini API key\n');

    console.log('⚠️  Remember to URL-encode special characters in password:');
    console.log('   @ → %40, # → %23, % → %25, & → %26\n');

    console.log('🧪 After updating, test with: npm run check\n');

} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
}
