@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo ========================================
echo  EnCo Vendor Registration - Local Server
echo ========================================
echo.
echo Starting server on http://localhost:3000
echo Press CTRL+C to stop the server
echo.
powershell -ExecutionPolicy Bypass -Command "npx http-server -p 3000 -c-1"
pause
