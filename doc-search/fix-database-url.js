import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n🔧 Database URL Configuration Helper\n');
console.log('Your Supabase project: rsnysvtjmelnojkubdqu\n');

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

rl.question('🔐 Enter your Supabase database password: ', (password) => {
    if (!password || password.trim() === '') {
        console.log('\n❌ Password cannot be empty!');
        rl.close();
        process.exit(1);
    }

    const originalPassword = password.trim();
    const encodedPassword = urlEncode(originalPassword);

    const databaseUrl = `DATABASE_URL=postgresql://postgres:${encodedPassword}@db.rsnysvtjmelnojkubdqu.supabase.co:5432/postgres`;

    console.log('\n✅ Your DATABASE_URL has been generated!\n');

    if (originalPassword !== encodedPassword) {
        console.log('⚠️  Your password contained special characters and has been URL-encoded:\n');
        console.log(`   Original: ${originalPassword}`);
        console.log(`   Encoded:  ${encodedPassword}\n`);
    }

    console.log('📋 Add this line to your .env file:\n');
    console.log(databaseUrl);
    console.log('\n');

    // Read current .env
    let envContent = '';
    try {
        envContent = fs.readFileSync('.env', 'utf-8');
    } catch (error) {
        console.log('⚠️  .env file not found, creating new one...\n');
    }

    // Check if DATABASE_URL already exists
    if (envContent.includes('DATABASE_URL=')) {
        // Replace existing DATABASE_URL
        envContent = envContent.replace(/DATABASE_URL=.*/g, databaseUrl);
        console.log('✅ Updated existing DATABASE_URL in .env file\n');
    } else {
        // Add new DATABASE_URL
        envContent += `\n${databaseUrl}\n`;
        console.log('✅ Added DATABASE_URL to .env file\n');
    }

    // Write back to .env
    fs.writeFileSync('.env', envContent);

    console.log('🎉 Configuration complete!\n');
    console.log('Next steps:');
    console.log('   1. The dev server will auto-reload');
    console.log('   2. Try your search again!');
    console.log('   3. If it still fails, run: npm run check\n');

    rl.close();
});
