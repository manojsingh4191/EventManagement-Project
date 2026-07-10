@echo off
cd /d "%~dp0frontend"
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo Frontend build failed.
  pause
  exit /b 1
)

cd /d "%~dp0backend"
echo.
echo Starting EventFlow on http://127.0.0.1:5000
echo Keep this window open while using the app.
echo.
call npm.cmd start
pause
