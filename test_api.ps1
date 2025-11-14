# HealthPWA API Tests - PowerShell

Write-Host "=== HealthPWA API Tests ===" -ForegroundColor Green

Write-Host "`n1. AI Search - Headache" -ForegroundColor Yellow
$response1 = Invoke-RestMethod -Uri "http://localhost:3000/api/search/caregivers?query=I%20have%20a%20headache&lat=28.5672&lng=77.2100&radius=30" -Method GET
$response1 | ConvertTo-Json -Depth 10

Write-Host "`n2. AI Search - Chest Pain" -ForegroundColor Yellow
$response2 = Invoke-RestMethod -Uri "http://localhost:3000/api/search/caregivers?query=chest%20pain%20emergency&lat=28.5672&lng=77.2100&radius=50" -Method GET
$response2 | ConvertTo-Json -Depth 10

Write-Host "`n3. Traditional Search - Symptoms" -ForegroundColor Yellow
$response3 = Invoke-RestMethod -Uri "http://localhost:3000/api/search/caregivers?symptoms=headache&type=doctor&lat=28.5672&lng=77.2100&radius=30" -Method GET
$response3 | ConvertTo-Json -Depth 10

Write-Host "`n4. Search Without Location" -ForegroundColor Yellow
$response4 = Invoke-RestMethod -Uri "http://localhost:3000/api/search/caregivers?query=diabetes%20checkup" -Method GET
$response4 | ConvertTo-Json -Depth 10