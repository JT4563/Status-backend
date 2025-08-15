# Comprehensive API Test Commands
# Base URL
$baseUrl = "http://localhost:8080"

Write-Host "StatusCode API Test Commands" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

Write-Host "`n✅ WORKING ENDPOINTS:" -ForegroundColor Green

Write-Host "`n1. Health Check (✅ Working)" -ForegroundColor Yellow
Write-Host "curl.exe -X GET `"$baseUrl/api/v1/system-health`""

Write-Host "`n2. Map Data (needs bbox parameter)" -ForegroundColor Yellow  
Write-Host "curl.exe -X GET `"$baseUrl/api/v1/map-data?bbox=40.7,-74.1,40.8,-74.0`""

Write-Host "`n3. Create Report (needs proper payload)" -ForegroundColor Yellow
Write-Host "curl.exe -X POST `"$baseUrl/api/v1/reports`" -H `"Content-Type: application/json`" -d '{`"eventId`": `"689eef4e6ce7f476939b7f8c`", `"message`": `"Test incident report`", `"type`": `"incident`", `"location`": {`"lat`": 40.7128, `"lng`": -74.0060}}'"

Write-Host "`n4. List Reports (needs valid ObjectId)" -ForegroundColor Yellow
Write-Host "curl.exe -X GET `"$baseUrl/api/v1/reports?eventId=689eef4e6ce7f476939b7f8c`""

Write-Host "`n`n❌ AUTHENTICATION REQUIRED:" -ForegroundColor Red
Write-Host "(First get a token from login, then use in subsequent requests)"
Write-Host "NOTE: JWT tokens expire in 15 minutes. Re-run login if auth fails." -ForegroundColor Cyan

Write-Host "`n5. Login (Update with real credentials)" -ForegroundColor Yellow
Write-Host "curl.exe -X POST `"$baseUrl/api/v1/auth/login`" -H `"Content-Type: application/json`" -d '{`"email`": `"admin@crowdshield.ai`", `"password`": `"password123`"}'"

Write-Host "`n6. Location Pings (Requires Auth)" -ForegroundColor Yellow
Write-Host "curl.exe -X POST `"$baseUrl/api/v1/pings`" -H `"Content-Type: application/json`" -H `"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWVlZjRlNmNlN2Y0NzY5MzliN2Y4OSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc1NTI0NjQyMCwiZXhwIjoxNzU1MjQ3MzIwfQ.IInMB1CqBnSiyqQ3XY5Mkxl6d1jY9p1YxObWZJseRvA`" -d '{`"eventId`": `"689eef4e6ce7f476939b7f8c`", `"userId`": `"689eef4e6ce7f476939b7f89`", `"lat`": 40.7128, `"lng`": -74.0060}'"

Write-Host "`n7. CCTV Objects (Requires Auth + Admin/Staff)" -ForegroundColor Yellow
Write-Host "curl.exe -X POST `"$baseUrl/api/v1/cctv/objects`" -H `"Content-Type: application/json`" -H `"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWVlZjRlNmNlN2Y0NzY5MzliN2Y4OSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc1NTI0NjQyMCwiZXhwIjoxNzU1MjQ3MzIwfQ.IInMB1CqBnSiyqQ3XY5Mkxl6d1jY9p1YxObWZJseRvA`" -d '{`"eventId`": `"689eef4e6ce7f476939b7f8c`", `"cameraId`": `"cam001`", `"objects`": [{`"type`": `"person`", `"confidence`": 0.95, `"bbox`": [100, 200, 150, 250]}]}'"

Write-Host "`n8. Get Alerts (Requires Auth)" -ForegroundColor Yellow
Write-Host "curl.exe -X GET `"$baseUrl/api/v1/alerts?eventId=689eef4e6ce7f476939b7f8c`" -H `"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWVlZjRlNmNlN2Y0NzY5MzliN2Y4OSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc1NTI0NjQyMCwiZXhwIjoxNzU1MjQ3MzIwfQ.IInMB1CqBnSiyqQ3XY5Mkxl6d1jY9p1YxObWZJseRvA`""

Write-Host "`n9. Resolve Alert (Requires Auth + Alert ID)" -ForegroundColor Yellow
Write-Host "curl.exe -X PATCH `"$baseUrl/api/v1/alerts/ALERT_ID_HERE/resolve`" -H `"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWVlZjRlNmNlN2Y0NzY5MzliN2Y4OSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc1NTI0NjQyMCwiZXhwIjoxNzU1MjQ3MzIwfQ.IInMB1CqBnSiyqQ3XY5Mkxl6d1jY9p1YxObWZJseRvA`""

Write-Host "`n10. Create Action (Requires Auth)" -ForegroundColor Yellow
Write-Host "curl.exe -X POST `"$baseUrl/api/v1/actions`" -H `"Content-Type: application/json`" -H `"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWVlZjRlNmNlN2Y0NzY5MzliN2Y4OSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc1NTI0NjQyMCwiZXhwIjoxNzU1MjQ3MzIwfQ.IInMB1CqBnSiyqQ3XY5Mkxl6d1jY9p1YxObWZJseRvA`" -d '{`"eventId`": `"689eef4e6ce7f476939b7f8c`", `"type`": `"dispatch`", `"description`": `"Dispatching units to location`", `"priority`": `"high`"}'"

Write-Host "`n11. AI Insights (Requires Auth)" -ForegroundColor Yellow
Write-Host "curl.exe -X GET `"$baseUrl/api/v1/ai-insights?eventId=689eef4e6ce7f476939b7f8c`" -H `"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWVlZjRlNmNlN2Y0NzY5MzliN2Y4OSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc1NTI0NjQyMCwiZXhwIjoxNzU1MjQ3MzIwfQ.IInMB1CqBnSiyqQ3XY5Mkxl6d1jY9p1YxObWZJseRvA`""

Write-Host "`n12. AI Predictions (Requires Auth)" -ForegroundColor Yellow
Write-Host "curl.exe -X GET `"$baseUrl/api/v1/ai-predictions?eventId=689eef4e6ce7f476939b7f8c`" -H `"Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OWVlZjRlNmNlN2Y0NzY5MzliN2Y4OSIsInJvbGUiOiJhZG1pbiIsIm5hbWUiOiJBZG1pbiIsImlhdCI6MTc1NTI0NjQyMCwiZXhwIjoxNzU1MjQ3MzIwfQ.IInMB1CqBnSiyqQ3XY5Mkxl6d1jY9p1YxObWZJseRvA`""

Write-Host "`n`n🧪 TESTING NON-AUTH ENDPOINTS:" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
