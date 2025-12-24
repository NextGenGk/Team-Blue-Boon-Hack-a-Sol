#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AyurSutra Deployment Script');
console.log('================================');

// Check if .env.local exists
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please create .env.local with your environment variables.');
  process.exit(1);
}

// Check required environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

const envContent = fs.readFileSync(envPath, 'utf8');
const missingVars = requiredEnvVars.filter(varName => 
  !envContent.includes(varName)
);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  process.exit(1);
}

console.log('✅ Environment variables check passed');

// Run build
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed');
  process.exit(1);
}

// Run type check
console.log('🔍 Running type check...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  console.log('✅ Type check passed');
} catch (error) {
  console.error('❌ Type check failed');
  process.exit(1);
}

console.log('');
console.log('🎉 Deployment preparation completed!');
console.log('');
console.log('Next steps:');
console.log('1. Deploy to your hosting platform (Vercel, Netlify, etc.)');
console.log('2. Set up environment variables in your hosting platform');
console.log('3. Run the database schema in your production Supabase instance');
console.log('4. Test the application thoroughly');
console.log('');
console.log('For Vercel deployment:');
console.log('  vercel --prod');
console.log('');
console.log('For manual deployment:');
console.log('  npm start (after setting NODE_ENV=production)');