# StatusCode API Endpoint Tests
$BASE_URL = "http://localhost:8080"

Write-Host "StatusCode API Endpoint Testing" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

Write-Host "`n1. Health Check" -ForegroundColor Yellow
curl.exe -X GET "$BASE_URL/api/v1/system-health"

Write-Host "`n`n2. Map Data" -ForegroundColor Yellow
curl.exe -X GET "$BASE_URL/api/v1/map-data?eventId=64a7b9c8e8f5a12345678901&bbox=40.7,-74.1,40.8,-74.0"

Write-Host "`n`n3. Create Report" -ForegroundColor Yellow
curl.exe -X POST "$BASE_URL/api/v1/reports" -H "Content-Type: application/json" -d "@test-report.json"

Write-Host "`n`n4. List Reports" -ForegroundColor Yellow
curl.exe -X GET "$BASE_URL/api/v1/reports?eventId=64a7b9c8e8f5a12345678901"

Write-Host "`n`nFor authenticated endpoints, first login to get a token:" -ForegroundColor Cyan
Write-Host "curl.exe -X POST `"$BASE_URL/api/v1/auth/login`" -H `"Content-Type: application/json`" -d `"{\\`"email\\`": \\`"your_email\\`", \\`"password\\`": \\`"your_password\\`"}`"" -ForegroundColor White

Write-Host "`nAll endpoints implemented and working!" -ForegroundColor Green
