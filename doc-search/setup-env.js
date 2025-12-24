// Simple script to help you create a valid .env file
import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log(`
╔═══════════════════════════════════════════════╗
║   🔧 AyurSutra .env Setup Helper              ║
║   Let's configure your environment variables  ║
╚═══════════════════════════════════════════════╝
`);

const questions = [
    {
        key: 'SUPABASE_URL',
        prompt: '📍 Enter your Supabase URL (e.g., https://xxxxx.supabase.co): ',
        default: 'https://your-project.supabase.co'
    },
    {
        key: 'SUPABASE_ANON_KEY',
        prompt: '🔑 Enter your Supabase Anon Key: ',
        default: 'your_supabase_anon_key'
    },
    {
        key: 'DB_HOST',
        prompt: '🗄️  Enter your database host (e.g., db.xxxxx.supabase.co): ',
        default: 'db.your-project.supabase.co'
    },
    {
        key: 'DB_PASSWORD',
        prompt: '🔐 Enter your database password: ',
        default: '',
        sensitive: true
    },
    {
        key: 'GEMINI_API_KEY',
        prompt: '🤖 Enter your Gemini API Key: ',
        default: 'your_gemini_api_key'
    }
];

const answers = {};

function urlEncode(str) {
    return str
        .replace(/@/g, '%40')
        .replace(/#/g, '%23')
        .replace(/%/g, '%25')
        .replace(/&/g, '%26')
        .replace(/\+/g, '%2B')
        .replace(/\//g, '%2F')
        .replace(/=/g, '%3D')
        .replace(/\?/g, '%3F')
        .replace(/:/g, '%3A');
}

function askQuestion(index) {
    if (index >= questions.length) {
        createEnvFile();
        return;
    }

    const q = questions[index];
    rl.question(q.prompt, (answer) => {
        answers[q.key] = answer.trim() || q.default;
        askQuestion(index + 1);
    });
}

function createEnvFile() {
    console.log('\n📝 Creating .env file...\n');

    // URL-encode the password
    const encodedPassword = urlEncode(answers.DB_PASSWORD);

    // Build DATABASE_URL
    const databaseUrl = `postgresql://postgres:${encodedPassword}@${answers.DB_HOST}:5432/postgres`;

    const envContent = `# Supabase Configuration
SUPABASE_URL=${answers.SUPABASE_URL}
SUPABASE_ANON_KEY=${answers.SUPABASE_ANON_KEY}
DATABASE_URL=${databaseUrl}

# Gemini AI API Key
GEMINI_API_KEY=${answers.GEMINI_API_KEY}

# Server Configuration
PORT=3000
NODE_ENV=development
`;

    try {
        fs.writeFileSync('.env', envContent);
        console.log('✅ .env file created successfully!\n');
        console.log('📋 Your configuration:');
        console.log(`   SUPABASE_URL: ${answers.SUPABASE_URL}`);
        console.log(`   DATABASE_URL: postgresql://postgres:***@${answers.DB_HOST}:5432/postgres`);
        console.log(`   GEMINI_API_KEY: ${answers.GEMINI_API_KEY.substring(0, 10)}...`);
        console.log('\n🧪 Next steps:');
        console.log('   1. Run: npm run check');
        console.log('   2. If checks pass, run: npm run dev');
        console.log('   3. Open: http://localhost:3000\n');
    } catch (error) {
        console.error('❌ Error creating .env file:', error.message);
    }

    rl.close();
}

console.log('ℹ️  Get your credentials from:');
console.log('   • Supabase: https://supabase.com/dashboard → Settings → API & Database');
console.log('   • Gemini: https://makersuite.google.com/app/apikey\n');

askQuestion(0);
