@echo off
title Rodice v Peci 2.0 – Dev Server
echo ============================================
echo   Rodice v Peci 2.0 – Spoustim dev server
echo ============================================
echo.

cd /d "%~dp0app"

echo [1/3] Kontrola zavislosti...
if not exist "node_modules" (
    echo       Instaluji zavislosti (npm install)...
    call npm install
    echo.
)

echo [2/3] Uklizim predchozi instance na portu 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [3/3] Spoustim Next.js dev server...
echo       http://localhost:3000
echo.
echo       Ctrl+C pro ukonceni
echo ============================================
echo.

start "" http://localhost:3000
call npm run dev
echo.
echo Server se ukoncil.
pause
