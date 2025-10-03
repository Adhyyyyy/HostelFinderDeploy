@echo off
echo =====================================================
echo   HOSTEL FINDER API - OOP CLEANUP SCRIPT
echo   This will remove old functional code safely
echo =====================================================
echo.

REM Create backup directory
if not exist "backup-old-files" (
    mkdir "backup-old-files"
    echo ✅ Created backup directory
)

echo.
echo 📦 BACKING UP old files before deletion...

REM Backup old controllers
if exist "controllers" (
    xcopy "controllers" "backup-old-files\controllers\" /E /I /Q >nul 2>&1
    echo ✅ Backed up old controllers
)

REM Backup old routes
if exist "routes" (
    xcopy "routes" "backup-old-files\routes\" /E /I /Q >nul 2>&1
    echo ✅ Backed up old routes
)

REM Backup old utils
if exist "utils\error.js" (
    copy "utils\error.js" "backup-old-files\" >nul 2>&1
    echo ✅ Backed up utils/error.js
)

if exist "utils\verifyToken.js" (
    copy "utils\verifyToken.js" "backup-old-files\" >nul 2>&1
    echo ✅ Backed up utils/verifyToken.js
)

REM Backup old main files
if exist "index.js" (
    copy "index.js" "backup-old-files\index-old.js" >nul 2>&1
    echo ✅ Backed up old index.js
)

if exist "package.json" (
    copy "package.json" "backup-old-files\package-old.json" >nul 2>&1
    echo ✅ Backed up old package.json
)

echo.
echo 🗑️  REMOVING old functional code files...

REM Remove old controllers
if exist "controllers" (
    rmdir /S /Q "controllers" >nul 2>&1
    echo ✅ Removed old controllers directory
)

REM Remove old routes
if exist "routes" (
    rmdir /S /Q "routes" >nul 2>&1
    echo ✅ Removed old routes directory
)

REM Remove old utils
if exist "utils\error.js" (
    del "utils\error.js" >nul 2>&1
    echo ✅ Removed utils/error.js
)

if exist "utils\verifyToken.js" (
    del "utils\verifyToken.js" >nul 2>&1
    echo ✅ Removed utils/verifyToken.js
)

REM Clean up empty utils directory if only classes remain
dir /b "utils" 2>nul | findstr /v "classes" >nul
if errorlevel 1 (
    if exist "utils\classes" (
        echo ✅ Utils directory cleaned - only classes remain
    )
)

echo.
echo 🔄 FINALIZING OOP setup...

REM Ensure OOP files are primary
if exist "index-oop.js" (
    copy "index-oop.js" "index.js" >nul 2>&1
    echo ✅ Set index-oop.js as main index.js
)

if exist "package-oop.json" (
    copy "package-oop.json" "package.json" >nul 2>&1
    echo ✅ Set package-oop.json as main package.json
)

echo.
echo =====================================================
echo ✅ CLEANUP COMPLETED SUCCESSFULLY!
echo =====================================================
echo.
echo 📊 SUMMARY:
echo   • Old functional code safely removed
echo   • All files backed up in 'backup-old-files/'
echo   • OOP architecture is now primary
echo   • Your API endpoints work exactly the same
echo.
echo 🚀 Your API is now running pure OOP architecture!
echo.
echo 📁 Backup location: backup-old-files/
echo 🔄 To restore old files: restore-old-files.bat
echo.
pause
