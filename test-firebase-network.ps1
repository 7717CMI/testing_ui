# Firebase Network Connection Diagnostic Script
# Run this in PowerShell to test if Seqrite is blocking Firebase

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Firebase Connection Diagnostic Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Ping Firebase Auth endpoint
Write-Host "Test 1: Testing connection to Firebase Auth API..." -ForegroundColor Yellow
try {
    $result = Test-NetConnection -ComputerName identitytoolkit.googleapis.com -Port 443 -WarningAction SilentlyContinue
    if ($result.TcpTestSucceeded) {
        Write-Host "✅ SUCCESS: Can connect to Firebase Auth API" -ForegroundColor Green
        Write-Host "   Seqrite is NOT blocking this connection" -ForegroundColor Green
    } else {
        Write-Host "❌ FAILED: Cannot connect to Firebase Auth API" -ForegroundColor Red
        Write-Host "   Seqrite may be blocking this connection" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Seqrite is likely blocking this connection" -ForegroundColor Red
}

Write-Host ""

# Test 2: Test HTTPS connection to Firebase
Write-Host "Test 2: Testing HTTPS connection to Firebase..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://identitytoolkit.googleapis.com" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ SUCCESS: HTTPS connection works" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Seqrite is NOT blocking HTTPS to Firebase" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED: HTTPS connection blocked" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Seqrite is likely blocking HTTPS connections" -ForegroundColor Red
}

Write-Host ""

# Test 3: Test your specific Firebase project
Write-Host "Test 3: Testing connection to your Firebase project..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://healthdata-auth.firebaseapp.com" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ SUCCESS: Can reach your Firebase project" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED: Cannot reach your Firebase project" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Seqrite may be blocking firebaseapp.com" -ForegroundColor Red
}

Write-Host ""

# Test 4: Test DNS resolution
Write-Host "Test 4: Testing DNS resolution..." -ForegroundColor Yellow
try {
    $dns = Resolve-DnsName -Name "identitytoolkit.googleapis.com" -ErrorAction Stop
    Write-Host "✅ SUCCESS: DNS resolution works" -ForegroundColor Green
    Write-Host "   IP Address: $($dns[0].IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "❌ FAILED: DNS resolution failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests show ❌ FAILED:" -ForegroundColor Yellow
Write-Host "  → Seqrite is blocking Firebase connections" -ForegroundColor Yellow
Write-Host ""
Write-Host "If some tests show ✅ SUCCESS:" -ForegroundColor Yellow
Write-Host "  → Connection works, but may have SSL/certificate issues" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Check Seqrite logs for blocked connections" -ForegroundColor White
Write-Host "  2. Try disabling Seqrite temporarily to confirm" -ForegroundColor White
Write-Host "  3. Add Firebase domains to Seqrite whitelist:" -ForegroundColor White
Write-Host "     - *.googleapis.com" -ForegroundColor Gray
Write-Host "     - *.firebaseapp.com" -ForegroundColor Gray
Write-Host "     - *.firebase.google.com" -ForegroundColor Gray
Write-Host ""





