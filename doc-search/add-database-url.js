import fs from 'fs';
import path from 'path';

console.log('\n🔧 Adding DATABASE_URL to your .env file...\n');

const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('📝 Creating .env from .env.example...\n');
    fs.copyFileSync('.env.example', '.env');
}

// Read current .env
let envContent = fs.readFileSync(envPath, 'utf-8');

// Check if DATABASE_URL already exists
if (envContent.includes('DATABASE_URL=')) {
    console.log('✅ DATABASE_URL already exists in .env file');
    console.log('📝 Please edit it manually if needed\n');
    process.exit(0);
}

// Extract Supabase URL if it exists
const supabaseUrlMatch = envContent.match(/SUPABASE_URL=(.+)/);
const nextPublicUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);

let projectId = null;

if (supabaseUrlMatch || nextPublicUrlMatch) {
    const url = (supabaseUrlMatch || nextPublicUrlMatch)[1].trim();
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
        projectId = match[1];
    }
}

if (projectId) {
    console.log(`📍 Detected Supabase project: ${projectId}\n`);

    const databaseUrl = `DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.${projectId}.supabase.co:5432/postgres`;

    // Add DATABASE_URL after SUPABASE_ANON_KEY or at the end
    if (envContent.includes('SUPABASE_ANON_KEY=') || envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        envContent = envContent.replace(
            /(SUPABASE_ANON_KEY=.+)/,
            `$1\n${databaseUrl}`
        );
    } else {
        envContent += `\n${databaseUrl}\n`;
    }

    fs.writeFileSync(envPath, envContent);

    console.log('✅ Added DATABASE_URL to .env file!\n');
    console.log('⚠️  IMPORTANT: Replace YOUR_PASSWORD with your actual database password\n');
    console.log('📍 Your DATABASE_URL line:');
    console.log(`   ${databaseUrl}\n`);
    console.log('🔐 Get your password from:');
    console.log('   Supabase Dashboard → Settings → Database\n');
    console.log('⚠️  Remember to URL-encode special characters:');
    console.log('   @ → %40, # → %23, % → %25, & → %26\n');
    console.log('📝 Example:');
    console.log('   Password: MyP@ss#123');
    console.log('   Encoded:  MyP%40ss%23123\n');

} else {
    console.log('⚠️  Could not detect Supabase project ID\n');
    console.log('📝 Please add this line to your .env file:\n');
    console.log('DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_ID.supabase.co:5432/postgres\n');
    console.log('Replace:');
    console.log('  - YOUR_PASSWORD with your database password (URL-encoded)');
    console.log('  - YOUR_PROJECT_ID with your Supabase project ID\n');
}

console.log('🧪 After updating, test with: npm run check\n');
