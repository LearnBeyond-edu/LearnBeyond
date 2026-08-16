@echo off
title LearnBeyond Project Launcher
color 0B

echo.
echo ===================================================
echo    LearnBeyond Educational Platform Launcher
echo ===================================================
echo.

echo Step 1/4 - Checking PostgreSQL...
powershell -NoProfile -Command "if ((Get-Service -Name 'postgresql-x64-17').Status -ne 'Running') { Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -Command Start-Service postgresql-x64-17; Start-Sleep 4' -Wait; Write-Host 'PostgreSQL started.' } else { Write-Host 'PostgreSQL already running.' }"
echo.

echo Step 2/4 - Starting Backend (port 5000)...
start "LearnBeyond Backend" cmd /c "cd /d %~dp0backend && npm run dev"
echo.

echo Step 3/4 - Starting Frontend (port 4005)...
start "LearnBeyond Frontend" cmd /c "cd /d %~dp0frontend && npm run dev"
echo.

echo Step 4/4 - Waiting 12 seconds then opening browser...
ping -n 13 127.0.0.1 > nul
start http://localhost:4005

echo.
echo ===================================================
echo  Done! Keep the two server windows open.
echo  Login: admin@learnbeyond.edu / Password123
echo ===================================================
echo.
pause
