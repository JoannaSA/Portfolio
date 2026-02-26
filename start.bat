@echo off
REM Backend startup script for Windows
REM This script handles common startup issues

echo.
echo ===================================
echo  Portfolio Backend Startup Script
echo ===================================
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if we're in the backend directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check for port conflicts
echo Checking for port 5000 availability...
for /f "tokens=5" %%a in ('netstat -a -n -o ^| findstr :5000') do (
    echo WARNING: Port 5000 is already in use (PID: %%a)
    echo You can:
    echo   1. Kill the existing process: taskkill /PID %%a /F
    echo   2. Use a different port: SET PORT=3000
    echo.
)

REM Start the server
echo Starting backend server...
echo.
node server.js

if errorlevel 1 (
    echo.
    echo ERROR: Server failed to start
    echo Troubleshooting:
    echo   - Check port 5000 is available
    echo   - Verify database is not corrupted
    echo   - Run: npm install sqlite3
    pause
    exit /b 1
)
