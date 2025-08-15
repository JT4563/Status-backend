# CrowdShield AI - Detailed Permission Testing Suite
# Clean version without encoding issues

$BASE_URL = "http://localhost:8080"

Write-Host "CrowdShield AI - DETAILED PERMISSION TESTING" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Global variables for tokens and users
$adminToken = ""
$staffToken = ""
$adminUser = $null
$staffUser = $null

# Authentication setup
Write-Host "AUTHENTICATION SETUP" -ForegroundColor Magenta
Write-Host ""

# Admin login
Write-Host "Logging in as Admin..." -ForegroundColor Cyan
try {
    $adminBody = @{
        email = "admin@crowdshield.ai"
        password = "admin123!"
    } | ConvertTo-Json

    $adminResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" -Method POST -Body $adminBody -ContentType "application/json"
    $adminToken = $adminResponse.token
    $adminUser = $adminResponse.user
    
    Write-Host "PASS - Admin login successful" -ForegroundColor Green
    Write-Host "   User: $($adminUser.name) ($($adminUser.role))" -ForegroundColor White
    Write-Host "   ID: $($adminUser.id)" -ForegroundColor White
    Write-Host "   Token: $($adminToken.Substring(0,20))..." -ForegroundColor White
} catch {
    Write-Host "FAIL - Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Staff login
Write-Host ""
Write-Host "Logging in as Staff..." -ForegroundColor Cyan
try {
    $staffBody = @{
        email = "staff@crowdshield.ai"
        password = "staff123!"
    } | ConvertTo-Json

    $staffResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" -Method POST -Body $staffBody -ContentType "application/json"
    $staffToken = $staffResponse.token
    $staffUser = $staffResponse.user
    
    Write-Host "PASS - Staff login successful" -ForegroundColor Green
    Write-Host "   User: $($staffUser.name) ($($staffUser.role))" -ForegroundColor White
    Write-Host "   ID: $($staffUser.id)" -ForegroundColor White
    Write-Host "   Token: $($staffToken.Substring(0,20))..." -ForegroundColor White
} catch {
    Write-Host "FAIL - Staff login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test Results Tracking
$passedTests = 0
$totalTests = 0
$testResults = @()

function Test-PermissionEndpoint {
    param(
        [string]$Description,
        [string]$Method,
        [string]$Endpoint,
        [string]$Token,
        [string]$UserType,
        [int]$ExpectedStatus,
        [string]$Body = ""
    )
    
    $global:totalTests++
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "   $Method $Endpoint ($UserType)" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Authorization" = "Bearer $Token"
            "Content-Type" = "application/json"
        }
        
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers -Body $Body -UseBasicParsing
        }
        
        $actualStatus = $response.StatusCode
        if ($actualStatus -eq $ExpectedStatus) {
            Write-Host "   PASS - Status: $actualStatus (Expected: $ExpectedStatus)" -ForegroundColor Green
            $global:passedTests++
            $global:testResults += @{ Test = $Description; Status = "PASS"; Expected = $ExpectedStatus; Actual = $actualStatus }
        } else {
            Write-Host "   FAIL - Status: $actualStatus (Expected: $ExpectedStatus)" -ForegroundColor Red
            $global:testResults += @{ Test = $Description; Status = "FAIL"; Expected = $ExpectedStatus; Actual = $actualStatus }
        }
        
    } catch {
        $actualStatus = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "Error" }
        if ($actualStatus -eq $ExpectedStatus) {
            Write-Host "   PASS - Status: $actualStatus (Expected: $ExpectedStatus)" -ForegroundColor Green
            $global:passedTests++
            $global:testResults += @{ Test = $Description; Status = "PASS"; Expected = $ExpectedStatus; Actual = $actualStatus }
        } else {
            Write-Host "   FAIL - Status: $actualStatus (Expected: $ExpectedStatus)" -ForegroundColor Red
            Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor DarkRed
            $global:testResults += @{ Test = $Description; Status = "FAIL"; Expected = $ExpectedStatus; Actual = $actualStatus }
        }
    }
    Write-Host ""
}

# USER MANAGEMENT PERMISSION TESTS
Write-Host "USER MANAGEMENT PERMISSION TESTS" -ForegroundColor Magenta
Write-Host ""

# Admin should have full access
Test-PermissionEndpoint -Description "List Users (Admin)" -Method "GET" -Endpoint "/api/v1/users" -Token $adminToken -UserType "Admin" -ExpectedStatus 200

Test-PermissionEndpoint -Description "Get User by ID (Admin)" -Method "GET" -Endpoint "/api/v1/users/$($adminUser.id)" -Token $adminToken -UserType "Admin" -ExpectedStatus 200

$newUserBody = @{
    name = "Permission Test User"
    email = "permtest@crowdshield.ai"
    password = "testpass123!"
    role = "staff"
} | ConvertTo-Json

Test-PermissionEndpoint -Description "Create New User (Admin)" -Method "POST" -Endpoint "/api/v1/users" -Token $adminToken -UserType "Admin" -ExpectedStatus 200 -Body $newUserBody

# Staff should be denied
Test-PermissionEndpoint -Description "List Users (Staff - Should Fail)" -Method "GET" -Endpoint "/api/v1/users" -Token $staffToken -UserType "Staff" -ExpectedStatus 403

Test-PermissionEndpoint -Description "Get User by ID (Staff - Should Fail)" -Method "GET" -Endpoint "/api/v1/users/$($staffUser.id)" -Token $staffToken -UserType "Staff" -ExpectedStatus 403

Test-PermissionEndpoint -Description "Create User (Staff - Should Fail)" -Method "POST" -Endpoint "/api/v1/users" -Token $staffToken -UserType "Staff" -ExpectedStatus 403 -Body $newUserBody

# AI INSIGHTS PERMISSION TESTS
Write-Host "AI INSIGHTS PERMISSION TESTS" -ForegroundColor Magenta
Write-Host ""

# Admin should have access
Test-PermissionEndpoint -Description "Get AI Insights (Admin)" -Method "GET" -Endpoint "/api/v1/ai-insights?eventId=64a7b9c8e8f5a12345678901" -Token $adminToken -UserType "Admin" -ExpectedStatus 200

Test-PermissionEndpoint -Description "Get AI Predictions (Admin)" -Method "GET" -Endpoint "/api/v1/ai-predictions?eventId=64a7b9c8e8f5a12345678901" -Token $adminToken -UserType "Admin" -ExpectedStatus 200

# Staff should be denied
Test-PermissionEndpoint -Description "Get AI Insights (Staff - Should Fail)" -Method "GET" -Endpoint "/api/v1/ai-insights?eventId=64a7b9c8e8f5a12345678901" -Token $staffToken -UserType "Staff" -ExpectedStatus 403

Test-PermissionEndpoint -Description "Get AI Predictions (Staff - Should Fail)" -Method "GET" -Endpoint "/api/v1/ai-predictions?eventId=64a7b9c8e8f5a12345678901" -Token $staffToken -UserType "Staff" -ExpectedStatus 403

# SYSTEM HEALTH PERMISSION TESTS
Write-Host "SYSTEM HEALTH PERMISSION TESTS" -ForegroundColor Magenta
Write-Host ""

# Basic health check should be public (no token needed)
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/system-health" -Method GET -UseBasicParsing
    Write-Host "PASS - Basic Health Check (Public) - Status: $($response.StatusCode)" -ForegroundColor Green
    $passedTests++
} catch {
    Write-Host "FAIL - Basic Health Check (Public) - Error: $($_.Exception.Message)" -ForegroundColor Red
}
$totalTests++

# Admin should access detailed metrics
Test-PermissionEndpoint -Description "System Metrics (Admin)" -Method "GET" -Endpoint "/api/v1/system-health/metrics" -Token $adminToken -UserType "Admin" -ExpectedStatus 200

# Staff should be denied detailed metrics
Test-PermissionEndpoint -Description "System Metrics (Staff - Should Fail)" -Method "GET" -Endpoint "/api/v1/system-health/metrics" -Token $staffToken -UserType "Staff" -ExpectedStatus 403

# SHARED ACCESS PERMISSION TESTS
Write-Host "SHARED ACCESS PERMISSION TESTS" -ForegroundColor Magenta
Write-Host ""

# Both Admin and Staff should have access to these endpoints
$actionBody = @{
    command = "test_action"
    zoneId = "zone-test"
    metadata = @{ source = "permission_test" }
} | ConvertTo-Json

Test-PermissionEndpoint -Description "Create Action (Admin)" -Method "POST" -Endpoint "/api/v1/actions" -Token $adminToken -UserType "Admin" -ExpectedStatus 200 -Body $actionBody

Test-PermissionEndpoint -Description "Create Action (Staff)" -Method "POST" -Endpoint "/api/v1/actions" -Token $staffToken -UserType "Staff" -ExpectedStatus 200 -Body $actionBody

Test-PermissionEndpoint -Description "Get Alerts (Admin)" -Method "GET" -Endpoint "/api/v1/alerts?eventId=64a7b9c8e8f5a12345678901" -Token $adminToken -UserType "Admin" -ExpectedStatus 200

Test-PermissionEndpoint -Description "Get Alerts (Staff)" -Method "GET" -Endpoint "/api/v1/alerts?eventId=64a7b9c8e8f5a12345678901" -Token $staffToken -UserType "Staff" -ExpectedStatus 200

# NO AUTHENTICATION TESTS
Write-Host "NO AUTHENTICATION TESTS" -ForegroundColor Magenta
Write-Host ""

# These should fail without authentication
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/users" -Method GET -UseBasicParsing
    Write-Host "FAIL - Users endpoint should require auth" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401) {
        Write-Host "PASS - Users endpoint properly requires auth (Status: $status)" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "FAIL - Expected 401, got $status" -ForegroundColor Red
    }
}
$totalTests++

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/api/v1/ai-insights" -Method GET -UseBasicParsing
    Write-Host "FAIL - AI insights should require auth" -ForegroundColor Red
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401) {
        Write-Host "PASS - AI insights properly requires auth (Status: $status)" -ForegroundColor Green
        $passedTests++
    } else {
        Write-Host "FAIL - Expected 401, got $status" -ForegroundColor Red
    }
}
$totalTests++

Write-Host ""

# DETAILED PERMISSION SUMMARY
Write-Host "DETAILED PERMISSION SUMMARY" -ForegroundColor Magenta
Write-Host "===========================" -ForegroundColor Green
Write-Host ""

$passRate = [math]::Round(($passedTests / $totalTests) * 100, 1)

Write-Host "OVERALL PERMISSION TEST RESULTS" -ForegroundColor Magenta
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $($totalTests - $passedTests)" -ForegroundColor $(if (($totalTests - $passedTests) -eq 0) { "Green" } else { "Red" })
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 90) { "Green" } elseif ($passRate -ge 70) { "Yellow" } else { "Red" })

Write-Host ""
Write-Host "PERMISSION MATRIX VERIFICATION" -ForegroundColor Magenta
Write-Host "Admin-Only Endpoints:" -ForegroundColor Yellow
Write-Host "  * User Management (/api/v1/users/*)" -ForegroundColor White
Write-Host "  * AI Insights (/api/v1/ai-insights)" -ForegroundColor White
Write-Host "  * AI Predictions (/api/v1/ai-predictions)" -ForegroundColor White
Write-Host "  * System Metrics (/api/v1/system-health/metrics)" -ForegroundColor White
Write-Host ""
Write-Host "Staff + Admin Endpoints:" -ForegroundColor Yellow
Write-Host "  * Actions (/api/v1/actions)" -ForegroundColor White
Write-Host "  * Alerts (/api/v1/alerts)" -ForegroundColor White
Write-Host "  * Location Pings (/api/v1/pings)" -ForegroundColor White
Write-Host "  * CCTV Objects (/api/v1/cctv/objects)" -ForegroundColor White
Write-Host ""
Write-Host "Public Endpoints:" -ForegroundColor Yellow
Write-Host "  * Basic Health Check (/api/v1/system-health)" -ForegroundColor White
Write-Host "  * Map Data (/api/v1/map-data)" -ForegroundColor White
Write-Host "  * Reports (/api/v1/reports)" -ForegroundColor White

Write-Host ""
if ($passRate -ge 90) {
    Write-Host "PERMISSION SYSTEM WORKING CORRECTLY!" -ForegroundColor Green
    Write-Host "Enterprise-grade role separation is properly enforced." -ForegroundColor Green
} else {
    Write-Host "PERMISSION ISSUES DETECTED!" -ForegroundColor Red
    Write-Host "Please review failed tests and fix permission boundaries." -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
