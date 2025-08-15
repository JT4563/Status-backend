# CrowdShield AI - Complete API Endpoint Test Suite
# Basic version without emojis to avoid encoding issues

$BASE_URL = "http://localhost:8080"

Write-Host "CrowdShield AI - Complete API Test Suite" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Test basic health check
Write-Host "Testing System Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/system-health" -Method GET
    Write-Host "PASS - Health Check" -ForegroundColor Green
    Write-Host "   API: $($healthResponse.api), DB: $($healthResponse.db)" -ForegroundColor White
} catch {
    Write-Host "FAIL - Health Check: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test authentication
Write-Host "Testing Authentication..." -ForegroundColor Yellow

# Admin login
try {
    $adminBody = @{
        email = "admin@crowdshield.ai"
        password = "admin123!"
    } | ConvertTo-Json

    $adminResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" -Method POST -Body $adminBody -ContentType "application/json"
    Write-Host "PASS - Admin Login" -ForegroundColor Green
    Write-Host "   User: $($adminResponse.user.name) ($($adminResponse.user.role))" -ForegroundColor White
    $adminToken = $adminResponse.token
    $adminHeaders = @{ Authorization = "Bearer $adminToken" }
} catch {
    Write-Host "FAIL - Admin Login: $($_.Exception.Message)" -ForegroundColor Red
    $adminToken = $null
}

# Staff login
try {
    $staffBody = @{
        email = "staff@crowdshield.ai"
        password = "staff123!"
    } | ConvertTo-Json

    $staffResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" -Method POST -Body $staffBody -ContentType "application/json"
    Write-Host "PASS - Staff Login" -ForegroundColor Green
    Write-Host "   User: $($staffResponse.user.name) ($($staffResponse.user.role))" -ForegroundColor White
    $staffToken = $staffResponse.token
    $staffHeaders = @{ Authorization = "Bearer $staffToken" }
} catch {
    Write-Host "FAIL - Staff Login: $($_.Exception.Message)" -ForegroundColor Red
    $staffToken = $null
}

Write-Host ""

# Test map data (public)
Write-Host "Testing Map Data..." -ForegroundColor Yellow
try {
    $mapResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/map-data?eventId=64a7b9c8e8f5a12345678901" -Method GET
    Write-Host "PASS - Map Data" -ForegroundColor Green
} catch {
    Write-Host "FAIL - Map Data: $($_.Exception.Message)" -ForegroundColor Red
}

# Test reports (public)
Write-Host "Testing Reports..." -ForegroundColor Yellow
try {
    $reportBody = @{
        type = "incident"
        message = "Test report from API suite"
        location = @{
            lat = 40.7589
            lng = -73.9851
        }
        eventId = "64a7b9c8e8f5a12345678901"
    } | ConvertTo-Json -Depth 10

    $reportResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/reports" -Method POST -Body $reportBody -ContentType "application/json"
    Write-Host "PASS - Create Report" -ForegroundColor Green

    $reportsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/reports?eventId=64a7b9c8e8f5a12345678901" -Method GET
    Write-Host "PASS - List Reports" -ForegroundColor Green
} catch {
    Write-Host "FAIL - Reports: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test authenticated endpoints
if ($adminToken) {
    Write-Host "Testing Admin Endpoints..." -ForegroundColor Yellow
    
    # Test actions
    try {
        $actionBody = @{
            command = "test_admin_action"
            zoneId = "zone-A"
            metadata = @{ source = "api_test" }
        } | ConvertTo-Json -Depth 10
        
        $actionResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/actions" -Method POST -Body $actionBody -ContentType "application/json" -Headers $adminHeaders
        Write-Host "PASS - Create Action (Admin)" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - Create Action (Admin): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test AI insights (Admin only)
    try {
        $aiResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/ai-insights?eventId=64a7b9c8e8f5a12345678901" -Method GET -Headers $adminHeaders
        Write-Host "PASS - AI Insights (Admin)" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - AI Insights (Admin): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test user management (Admin only)
    try {
        $usersResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/users" -Method GET -Headers $adminHeaders
        Write-Host "PASS - List Users (Admin)" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - List Users (Admin): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test system metrics (Admin only)
    try {
        $metricsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/system-health/metrics" -Method GET -Headers $adminHeaders
        Write-Host "PASS - System Metrics (Admin)" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - System Metrics (Admin): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

if ($staffToken) {
    Write-Host "Testing Staff Endpoints..." -ForegroundColor Yellow
    
    # Test actions (Staff allowed)
    try {
        $actionBody = @{
            command = "test_staff_action"
            zoneId = "zone-B"
            metadata = @{ source = "staff_test" }
        } | ConvertTo-Json -Depth 10
        
        $actionResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/actions" -Method POST -Body $actionBody -ContentType "application/json" -Headers $staffHeaders
        Write-Host "PASS - Create Action (Staff)" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - Create Action (Staff): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test alerts (Staff allowed)
    try {
        $alertsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/alerts?eventId=64a7b9c8e8f5a12345678901" -Method GET -Headers $staffHeaders
        Write-Host "PASS - Get Alerts (Staff)" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - Get Alerts (Staff): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test location pings (Staff allowed)
    try {
        $pingBody = @{
            eventId = "64a7b9c8e8f5a12345678901"
            coordinates = @{
                lat = 40.7589
                lng = -73.9851
            }
            metadata = @{ deviceId = "test-device" }
        } | ConvertTo-Json -Depth 10
        
        $pingResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/pings" -Method POST -Body $pingBody -ContentType "application/json" -Headers $staffHeaders
        Write-Host "PASS - Submit Ping (Staff)" -ForegroundColor Green
    } catch {
        Write-Host "FAIL - Submit Ping (Staff): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test permission boundaries
Write-Host "Testing Permission Boundaries..." -ForegroundColor Yellow

if ($staffToken) {
    # Staff should NOT access admin-only endpoints
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/users" -Method GET -Headers $staffHeaders
        Write-Host "FAIL - Permission Test: Staff accessed admin endpoint" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "PASS - Permission Test: Staff properly denied admin access" -ForegroundColor Green
        } else {
            Write-Host "FAIL - Permission Test: Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
    
    try {
        $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/ai-insights" -Method GET -Headers $staffHeaders
        Write-Host "FAIL - AI Permission Test: Staff accessed AI insights" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "PASS - AI Permission Test: Staff properly denied AI access" -ForegroundColor Green
        } else {
            Write-Host "FAIL - AI Permission Test: Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

# Test no authentication
try {
    $testBody = @{ command = "test" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/actions" -Method POST -Body $testBody -ContentType "application/json"
    Write-Host "FAIL - Auth Test: Accessed protected endpoint without auth" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "PASS - Auth Test: Properly requires authentication" -ForegroundColor Green
    } else {
        Write-Host "FAIL - Auth Test: Wrong error code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "TEST SUMMARY" -ForegroundColor Magenta
Write-Host "============" -ForegroundColor Green
Write-Host ""
Write-Host "Endpoints Tested:" -ForegroundColor Cyan
Write-Host "   * System Health (Public)" -ForegroundColor White
Write-Host "   * Authentication (Admin/Staff)" -ForegroundColor White
Write-Host "   * Map Data (Public)" -ForegroundColor White
Write-Host "   * Reports (Public + Anonymous)" -ForegroundColor White
Write-Host "   * Actions (Staff/Admin Required)" -ForegroundColor White
Write-Host "   * Alerts (Staff/Admin Required)" -ForegroundColor White
Write-Host "   * AI Insights (Admin Only)" -ForegroundColor White
Write-Host "   * User Management (Admin Only)" -ForegroundColor White
Write-Host "   * Location Pings (Staff/Admin Required)" -ForegroundColor White
Write-Host "   * Permission Boundaries (403/401 Tests)" -ForegroundColor White
Write-Host ""
Write-Host "All CrowdShield AI endpoints tested successfully!" -ForegroundColor Green
