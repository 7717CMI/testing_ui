@echo off
echo Starting Healthcare Data Catalog...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && python run.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd . && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3001
echo Data Catalog: http://localhost:3001/data-catalog
echo.
echo Press any key to exit...
pause >nul




















