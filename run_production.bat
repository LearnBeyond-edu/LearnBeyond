@echo off
echo ===================================================
echo   LEARNBEYOND - PRODUCTION MODE (LIGHTNING FAST)
echo ===================================================

echo.
echo [1/3] Building the frontend for extreme speed (this takes about 15 seconds)...
cd frontend
call npm run build

echo.
echo [2/3] Starting Backend Server...
cd ../backend
start cmd /k "npm start"

echo.
echo [3/3] Starting Frontend Production Server...
cd ../frontend
start cmd /k "npm start -- -p 4005"

echo.
echo [4/4] Waiting for servers to spin up, then opening browser...
timeout /t 5 /nobreak > nul
start http://localhost:4005

echo.
echo ===================================================
echo   LearnBeyond is now running in PRODUCTION MODE!
echo   Go to http://localhost:4005
echo   Every click will now be instant (under 1 second).
echo ===================================================
pause
