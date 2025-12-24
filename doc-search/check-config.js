import fs from 'fs';
import path from 'path';

console.log('\n🔍 Checking Next.js Environment Variables...\n');

// Read .env file
const envPath = path.join(process.cwd(), '.env');

if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found!');
    console.log('📝 Create one by copying .env.example:');
    console.log('   cp .env.example .env\n');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envLines = envContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));

const envVars = {};
envLines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
    }
});

console.log('📋 Environment Variables Found:\n');

// Required variables for Next.js
const requiredVars = {
    'DATABASE_URL': {
        required: true,
        description: 'PostgreSQL connection string',
        example: 'postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres'
    },
    'GEMINI_API_KEY': {
        required: true,
        description: 'Google Gemini AI API key',
        example: 'AIzaSy...'
    },
    'NEXT_PUBLIC_SUPABASE_URL': {
        required: false,
        description: 'Supabase project URL (optional)',
        example: 'https://xxxxx.supabase.co'
    },
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': {
        required: false,
        description: 'Supabase anon key (optional)',
        example: 'eyJhbGci...'
    }
};

let hasErrors = false;
const warnings = [];

Object.entries(requiredVars).forEach(([varName, config]) => {
    const value = envVars[varName];
    const isSet = value && value.length > 0;
    const isPlaceholder = value && (
        value.includes('your_') ||
        value.includes('YOUR_') ||
        value.includes('xxxxx') ||
        value === 'your-project-id'
    );

    if (config.required) {
        if (!isSet) {
            console.log(`❌ ${varName}: MISSING`);
            console.log(`   ${config.description}`);
            console.log(`   Example: ${config.example}\n`);
            hasErrors = true;
        } else if (isPlaceholder) {
            console.log(`⚠️  ${varName}: PLACEHOLDER VALUE`);
            console.log(`   Replace with actual value`);
            console.log(`   Example: ${config.example}\n`);
            hasErrors = true;
        } else {
            console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
        }
    } else {
        if (isSet && !isPlaceholder) {
            console.log(`✅ ${varName}: Set (${value.substring(0, 20)}...)`);
        } else {
            console.log(`ℹ️  ${varName}: Not set (optional)`);
        }
    }
});

// Special validation for DATABASE_URL
if (envVars.DATABASE_URL) {
    console.log('\n🔍 Validating DATABASE_URL...\n');

    const dbUrl = envVars.DATABASE_URL;

    if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
        console.log('❌ DATABASE_URL must start with postgresql:// or postgres://');
        hasErrors = true;
    } else {
        const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@(.+)/);
        if (match) {
            const [, username, password, rest] = match;

            console.log(`   Username: ${username}`);
            console.log(`   Password: ${password.length > 0 ? '***' + password.slice(-3) : 'EMPTY!'}`);
            console.log(`   Host: ${rest.split('/')[0]}`);

            if (password.length === 0) {
                console.log('\n❌ Password is EMPTY in DATABASE_URL!');
                hasErrors = true;
            }

            // Check for unencoded special characters
            const needsEncoding = [];
            if (password.includes('@') && !password.includes('%40')) needsEncoding.push('@');
            if (password.includes('#') && !password.includes('%23')) needsEncoding.push('#');
            if (password.includes('&') && !password.includes('%26')) needsEncoding.push('&');

            if (needsEncoding.length > 0) {
                console.log(`\n⚠️  Password contains unencoded characters: ${needsEncoding.join(', ')}`);
                console.log('   These need URL encoding:');
                needsEncoding.forEach(char => {
                    const encoded = { '@': '%40', '#': '%23', '&': '%26' }[char];
                    console.log(`   ${char} → ${encoded}`);
                });
                warnings.push('URL-encode special characters in password');
            }
        } else {
            console.log('❌ Invalid DATABASE_URL format');
            console.log('   Expected: postgresql://username:password@host:port/database');
            hasErrors = true;
        }
    }
}

console.log('\n' + '='.repeat(50) + '\n');

if (hasErrors) {
    console.log('❌ Configuration has errors! Please fix them.\n');
    console.log('📚 See these files for help:');
    console.log('   - ADD_THIS_TO_ENV.md');
    console.log('   - QUICK_FIX.md');
    console.log('   - NEXTJS_MIGRATION.md\n');
    process.exit(1);
} else if (warnings.length > 0) {
    console.log('⚠️  Configuration has warnings:\n');
    warnings.forEach(w => console.log(`   - ${w}`));
    console.log('\n✅ But you can proceed. Just be aware of the warnings.\n');
} else {
    console.log('✅ All environment variables are correctly configured!\n');
    console.log('🚀 You can now run: npm run dev\n');
}
