# PowerShell script to help create .env file with proper password encoding

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🔧 AyurSutra .env Setup Helper              ║" -ForegroundColor Cyan
Write-Host "║   Let's configure your environment variables  ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "ℹ️  Get your credentials from:" -ForegroundColor Yellow
Write-Host "   • Supabase: https://supabase.com/dashboard → Settings" -ForegroundColor Gray
Write-Host "   • Gemini: https://makersuite.google.com/app/apikey" -ForegroundColor Gray
Write-Host ""

# Function to URL-encode password
function Encode-Password {
    param([string]$password)
    
    $encoded = $password `
        -replace '@', '%40' `
        -replace '#', '%23' `
        -replace '%', '%25' `
        -replace '&', '%26' `
        -replace '\+', '%2B' `
        -replace '/', '%2F' `
        -replace '=', '%3D' `
        -replace '\?', '%3F' `
        -replace ':', '%3A'
    
    return $encoded
}

# Collect information
$supabaseUrl = Read-Host "📍 Enter your Supabase URL (e.g., https://xxxxx.supabase.co)"
$supabaseKey = Read-Host "🔑 Enter your Supabase Anon Key"
$dbHost = Read-Host "🗄️  Enter your database host (e.g., db.xxxxx.supabase.co)"
$dbPassword = Read-Host "🔐 Enter your database password" -AsSecureString
$geminiKey = Read-Host "🤖 Enter your Gemini API Key"

# Convert secure string to plain text for encoding
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# URL-encode the password
$encodedPassword = Encode-Password -password $plainPassword

# Build DATABASE_URL
$databaseUrl = "postgresql://postgres:$encodedPassword@$dbHost:5432/postgres"

# Create .env content
$envContent = @"
# Supabase Configuration
SUPABASE_URL=$supabaseUrl
SUPABASE_ANON_KEY=$supabaseKey
DATABASE_URL=$databaseUrl

# Gemini AI API Key
GEMINI_API_KEY=$geminiKey

# Server Configuration
PORT=3000
NODE_ENV=development
"@

# Write to .env file
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host ""
    Write-Host "✅ .env file created successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Your configuration:" -ForegroundColor Cyan
    Write-Host "   SUPABASE_URL: $supabaseUrl" -ForegroundColor Gray
    Write-Host "   DATABASE_URL: postgresql://postgres:***@$dbHost:5432/postgres" -ForegroundColor Gray
    Write-Host "   GEMINI_API_KEY: $($geminiKey.Substring(0, [Math]::Min(10, $geminiKey.Length)))..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧪 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Run: npm run check" -ForegroundColor White
    Write-Host "   2. If checks pass, run: npm run dev" -ForegroundColor White
    Write-Host "   3. Open: http://localhost:3000" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host "❌ Error creating .env file: $($_.Exception.Message)" -ForegroundColor Red
}

# Clear sensitive data
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
