# Backend startup script for PowerShell
# Usage: .\start.ps1

Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Portfolio Backend Startup Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Check if npm is installed
try {
    $npmVersion = npm --version 2>$null
    Write-Host "✅ npm found: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: npm is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERROR: package.json not found" -ForegroundColor Red
    Write-Host "Please run this script from the backend directory" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ ERROR: Failed to install dependencies" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

# Check for port conflicts
Write-Host "🔍 Checking for port 5000 availability..." -ForegroundColor Yellow
$portInUse = netstat -a -n -o | Select-String ":5000"
if ($portInUse) {
    Write-Host "⚠️  WARNING: Port 5000 is already in use!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can:" -ForegroundColor Yellow
    Write-Host "  1. Kill the existing process (get PID from above)" -ForegroundColor Green
    Write-Host "     taskkill /PID <pid> /F" -ForegroundColor Gray
    Write-Host "  2. Use a different port:" -ForegroundColor Green
    Write-Host "     `$env:PORT = 3000; node server.js" -ForegroundColor Gray
    Write-Host ""
    $response = Read-Host "Continue anyway? (y/n)"
    if ($response -ne "y") {
        exit 0
    }
}

# Start the server
Write-Host ""
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Write-Host ""

node server.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR: Server failed to start" -ForegroundColor Red
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  - Check port 5000 is available" -ForegroundColor Gray
    Write-Host "  - Verify database is not corrupted" -ForegroundColor Gray
    Write-Host "  - Run: npm install sqlite3" -ForegroundColor Gray
    Read-Host "Press Enter to exit"
    exit 1
}
