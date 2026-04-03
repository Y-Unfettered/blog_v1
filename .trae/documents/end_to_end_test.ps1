# End-to-End Test Script - Simulating complete user operation flow

Write-Host "=== Blog Features End-to-End Test ===" -ForegroundColor Green

# 1. Login to admin management
Write-Host "`n1. Logging in to admin management..." -ForegroundColor Cyan
$loginBody = @{
    username = 'admin'
    password = 'replace_with_strong_password'
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://127.0.0.1:3031/api/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    $token = ($loginResponse.Content | ConvertFrom-Json).token
    Write-Host "   ✅ Login successful, token obtained" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# 2. Create test issue record
Write-Host "`n2. Creating test issue record..." -ForegroundColor Cyan
$newIssue = @{
    title = "End-to-End Test Issue"
    status = "resolved"
    priority = "medium"
    category = "Test Verification"
    phenomenon = "This is an end-to-end test issue for verifying complete functionality flow"
    solution = "1. Login to admin management`n2. Create issue record`n3. Verify data saving`n4. Check frontend display"
    conclusion = "End-to-end test verification passed, all functions working correctly"
    tags = "test,end-to-end,verification"
    createdAt = (Get-Date).ToISOString()
    updatedAt = (Get-Date).ToISOString()
} | ConvertTo-Json

try {
    $createIssueResponse = Invoke-WebRequest -Uri "http://127.0.0.1:3031/api/data/issues" -Method POST -Body $newIssue -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing
    $issueId = ($createIssueResponse.Content | ConvertFrom-Json).id
    Write-Host "   ✅ Issue created successfully, ID: $issueId" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Issue creation failed: $_" -ForegroundColor Red
    exit 1
}

# 3. Create test tool share
Write-Host "`n3. Creating test tool share..." -ForegroundColor Cyan
$newTool = @{
    name = "End-to-End Test Tool"
    type = "Custom Tool"
    category = "Efficiency Tool"
    icon = "zap"
    url = "https://test-tool.example.com"
    description = "This is an end-to-end test tool for verifying complete functionality flow"
    tags = "test,end-to-end,tool verification"
    createdAt = (Get-Date).ToISOString()
    updatedAt = (Get-Date).ToISOString()
} | ConvertTo-Json

try {
    $createToolResponse = Invoke-WebRequest -Uri "http://127.0.0.1:3031/api/data/tools" -Method POST -Body $newTool -ContentType "application/json" -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing
    $toolId = ($createToolResponse.Content | ConvertFrom-Json).id
    Write-Host "   ✅ Tool created successfully, ID: $toolId" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Tool creation failed: $_" -ForegroundColor Red
    exit 1
}

# 4. Verify data saved to files
Write-Host "`n4. Verifying data saved to files..." -ForegroundColor Cyan
try {
    # Verify issues.json file
    $issues = Get-Content "d:\github\Blog\my_blog\data\seed\issues.json" -Encoding UTF8 | ConvertFrom-Json
    $testIssue = $issues | Where-Object { $_.id -eq $issueId }
    if ($testIssue) {
        Write-Host "   ✅ Test issue found in issues.json" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Test issue not found in issues.json" -ForegroundColor Red
        exit 1
    }

    # Verify tools.json file
    $tools = Get-Content "d:\github\Blog\my_blog\data\seed\tools.json" -Encoding UTF8 | ConvertFrom-Json
    $testTool = $tools | Where-Object { $_.id -eq $toolId }
    if ($testTool) {
        Write-Host "   ✅ Test tool found in tools.json" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Test tool not found in tools.json" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Data verification failed: $_" -ForegroundColor Red
    exit 1
}

# 5. Verify frontend page access
Write-Host "`n5. Verifying frontend page access..." -ForegroundColor Cyan
try {
    # Test homepage access
    $homeResponse = Invoke-WebRequest -Uri "http://127.0.0.1:5175/" -Method GET -UseBasicParsing
    if ($homeResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Frontend homepage access successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend homepage access failed" -ForegroundColor Red
        exit 1
    }

    # Test issues page
    $issuesResponse = Invoke-WebRequest -Uri "http://127.0.0.1:5175/issues" -Method GET -UseBasicParsing
    if ($issuesResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Issues page access successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Issues page access failed" -ForegroundColor Red
        exit 1
    }

    # Test tools page
    $toolsResponse = Invoke-WebRequest -Uri "http://127.0.0.1:5175/tools" -Method GET -UseBasicParsing
    if ($toolsResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Tools page access successful" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Tools page access failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Frontend page access failed: $_" -ForegroundColor Red
    exit 1
}

# 6. Clean up test data
Write-Host "`n6. Cleaning up test data..." -ForegroundColor Cyan
try {
    # Delete test issue
    $deleteIssueResponse = Invoke-WebRequest -Uri "http://127.0.0.1:3031/api/data/issues/$issueId" -Method DELETE -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing
    if ($deleteIssueResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Test issue deleted successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Test issue deletion failed" -ForegroundColor Red
        exit 1
    }

    # Delete test tool
    $deleteToolResponse = Invoke-WebRequest -Uri "http://127.0.0.1:3031/api/data/tools/$toolId" -Method DELETE -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing
    if ($deleteToolResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Test tool deleted successfully" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Test tool deletion failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Test data cleanup failed: $_" -ForegroundColor Red
    exit 1
}

# 7. Verify cleanup results
Write-Host "`n7. Verifying cleanup results..." -ForegroundColor Cyan
try {
    # Verify issues.json file
    $issues = Get-Content "d:\github\Blog\my_blog\data\seed\issues.json" -Encoding UTF8 | ConvertFrom-Json
    $testIssue = $issues | Where-Object { $_.id -eq $issueId }
    if (!$testIssue) {
        Write-Host "   ✅ Test issue removed from issues.json" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Test issue not removed from issues.json" -ForegroundColor Red
        exit 1
    }

    # Verify tools.json file
    $tools = Get-Content "d:\github\Blog\my_blog\data\seed\tools.json" -Encoding UTF8 | ConvertFrom-Json
    $testTool = $tools | Where-Object { $_.id -eq $toolId }
    if (!$testTool) {
        Write-Host "   ✅ Test tool removed from tools.json" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Test tool not removed from tools.json" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Cleanup verification failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== End-to-End Test Complete ===" -ForegroundColor Green
Write-Host "✅ All test steps completed successfully!" -ForegroundColor Green
Write-Host "`nTest Results Summary:" -ForegroundColor Cyan
Write-Host "1. ✅ Admin login functionality working"
Write-Host "2. ✅ Issue creation and saving working"
Write-Host "3. ✅ Tool sharing creation and saving working"
Write-Host "4. ✅ Data correctly saved to JSON files"
Write-Host "5. ✅ Frontend page access working"
Write-Host "6. ✅ Test data cleanup successful"
Write-Host "`nConclusion: Blog features fully implemented and all functions working correctly!" -ForegroundColor Green