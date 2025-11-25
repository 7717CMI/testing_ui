# Comprehensive SSL/Seqrite Diagnostic Test Suite
# This script tests if Seqrite is intercepting SSL/TLS traffic

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SSL/Seqrite Interception Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check SSL Certificate Chain
Write-Host "Test 1: Checking SSL Certificate Chain..." -ForegroundColor Yellow
Write-Host "This test verifies if a proxy/antivirus is intercepting SSL" -ForegroundColor Gray
try {
    $cert = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
    $request = [System.Net.HttpWebRequest]::Create("https://identitytoolkit.googleapis.com")
    $request.Timeout = 5000
    $response = $request.GetResponse()
    $certChain = $response.GetResponseStream()
    $response.Close()
    
    # Check certificate details
    $certObject = $request.ServicePoint.Certificate
    if ($certObject) {
        Write-Host "✅ Certificate found" -ForegroundColor Green
        Write-Host "   Issuer: $($certObject.Issuer)" -ForegroundColor Gray
        Write-Host "   Subject: $($certObject.Subject)" -ForegroundColor Gray
        
        # Check if certificate is from Seqrite or a proxy
        if ($certObject.Issuer -like "*Seqrite*" -or $certObject.Issuer -like "*Proxy*" -or $certObject.Issuer -like "*Intercept*") {
            Write-Host "❌ WARNING: Certificate is from Seqrite/Proxy!" -ForegroundColor Red
            Write-Host "   This confirms SSL interception" -ForegroundColor Red
        } elseif ($certObject.Issuer -like "*Google*" -or $certObject.Issuer -like "*GTS*") {
            Write-Host "✅ Certificate is from Google (legitimate)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Error checking certificate: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Test SSL/TLS Handshake
Write-Host "Test 2: Testing SSL/TLS Handshake..." -ForegroundColor Yellow
Write-Host "This test checks if SSL handshake completes successfully" -ForegroundColor Gray
try {
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect("identitytoolkit.googleapis.com", 443)
    $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream(), $false, {$true})
    $sslStream.AuthenticateAsClient("identitytoolkit.googleapis.com")
    
    Write-Host "✅ SSL Handshake successful" -ForegroundColor Green
    Write-Host "   Protocol: $($sslStream.SslProtocol)" -ForegroundColor Gray
    Write-Host "   Cipher: $($sslStream.CipherAlgorithm)" -ForegroundColor Gray
    
    $sslStream.Close()
    $tcpClient.Close()
} catch {
    Write-Host "❌ SSL Handshake failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*MAC*" -or $_.Exception.Message -like "*record*") {
        Write-Host "   This matches ERR_SSL_BAD_RECORD_MAC_ALERT!" -ForegroundColor Red
        Write-Host "   Confirms SSL interception/corruption" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Check for Proxy/Interception Headers
Write-Host "Test 3: Checking for Proxy/Interception Headers..." -ForegroundColor Yellow
Write-Host "This test looks for headers that indicate SSL interception" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "https://www.google.com" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $headers = $response.Headers
    
    $interceptionHeaders = @("X-Forwarded-For", "X-Proxy-Authorization", "Via", "X-Forwarded-Proto", "X-Original-URL")
    $foundInterception = $false
    
    foreach ($header in $interceptionHeaders) {
        if ($headers.ContainsKey($header)) {
            Write-Host "⚠️  Found interception header: $header" -ForegroundColor Yellow
            Write-Host "   Value: $($headers[$header])" -ForegroundColor Gray
            $foundInterception = $true
        }
    }
    
    if (-not $foundInterception) {
        Write-Host "✅ No interception headers found" -ForegroundColor Green
    } else {
        Write-Host "❌ Interception headers detected - proxy/antivirus is intercepting" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error checking headers: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Test Browser-like HTTPS Request
Write-Host "Test 4: Testing Browser-like HTTPS Request..." -ForegroundColor Yellow
Write-Host "This simulates what the browser does" -ForegroundColor Gray
try {
    $headers = @{
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        "Accept" = "application/json, text/plain, */*"
        "Origin" = "http://localhost:3000"
        "Referer" = "http://localhost:3000/"
    }
    
    $body = @{
        email = "test@test.com"
        password = "wrongpass"
        returnSecureToken = $true
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyAV29AJL7DOhXE4F8YyYbCvgTAB9HBrWss" `
        -Method POST `
        -Body $body `
        -ContentType "application/json" `
        -Headers $headers `
        -UseBasicParsing `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "✅ Browser-like request successful" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Browser-like request failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*SSL*" -or $_.Exception.Message -like "*TLS*" -or $_.Exception.Message -like "*certificate*") {
        Write-Host "   SSL/TLS related error detected!" -ForegroundColor Red
    }
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   HTTP Status: $statusCode" -ForegroundColor Gray
    }
}

Write-Host ""

# Test 5: Check Seqrite Process
Write-Host "Test 5: Checking for Seqrite Processes..." -ForegroundColor Yellow
$seqriteProcesses = Get-Process | Where-Object {$_.ProcessName -like "*seqrite*" -or $_.ProcessName -like "*Seqrite*"}
if ($seqriteProcesses) {
    Write-Host "⚠️  Seqrite processes found:" -ForegroundColor Yellow
    foreach ($proc in $seqriteProcesses) {
        Write-Host "   - $($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor Gray
    }
    Write-Host "   Seqrite is running and may be intercepting SSL" -ForegroundColor Yellow
} else {
    Write-Host "✅ No Seqrite processes found" -ForegroundColor Green
    Write-Host "   (Seqrite may be running as a service)" -ForegroundColor Gray
}

Write-Host ""

# Test 6: Check System Proxy Settings
Write-Host "Test 6: Checking System Proxy Settings..." -ForegroundColor Yellow
try {
    $proxySettings = [System.Net.WebRequest]::GetSystemWebProxy()
    $proxySettings.Credentials = [System.Net.CredentialCache]::DefaultCredentials
    
    $testUri = New-Object Uri("https://identitytoolkit.googleapis.com")
    $proxyUri = $proxySettings.GetProxy($testUri)
    
    if ($proxyUri -ne $testUri) {
        Write-Host "⚠️  Proxy detected:" -ForegroundColor Yellow
        Write-Host "   Proxy URI: $proxyUri" -ForegroundColor Gray
        Write-Host "   This may be intercepting SSL traffic" -ForegroundColor Yellow
    } else {
        Write-Host "✅ No system proxy configured" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Error checking proxy: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 7: Test with Different TLS Versions
Write-Host "Test 7: Testing Different TLS Versions..." -ForegroundColor Yellow
$tlsVersions = @("Tls12", "Tls13")
foreach ($tlsVersion in $tlsVersions) {
    try {
        [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::$tlsVersion
        $response = Invoke-WebRequest -Uri "https://identitytoolkit.googleapis.com" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $tlsVersion works" -ForegroundColor Green
    } catch {
        Write-Host "❌ $tlsVersion failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Message -like "*MAC*" -or $_.Exception.Message -like "*record*") {
            Write-Host "   SSL MAC error with $tlsVersion - confirms interception" -ForegroundColor Red
        }
    }
}

Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If you see ERR_SSL_BAD_RECORD_MAC_ALERT or SSL MAC errors:" -ForegroundColor Yellow
Write-Host "  → Seqrite is intercepting and corrupting SSL traffic" -ForegroundColor Red
Write-Host ""
Write-Host "If certificate issuer shows Seqrite/Proxy:" -ForegroundColor Yellow
Write-Host "  → SSL interception confirmed" -ForegroundColor Red
Write-Host ""
Write-Host "If SSL handshake fails with MAC errors:" -ForegroundColor Yellow
Write-Host "  → SSL traffic is being modified by Seqrite" -ForegroundColor Red
Write-Host ""
Write-Host "Solution: Use Firebase Emulators (localhost, no SSL)" -ForegroundColor Cyan
Write-Host ""





