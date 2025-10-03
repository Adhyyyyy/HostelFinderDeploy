@echo off
echo =====================================================
echo   HOSTEL FINDER API - RESTORE OLD FILES
echo   This will restore the old functional code
echo =====================================================
echo.

if not exist "backup-old-files" (
    echo ❌ ERROR: No backup directory found!
    echo    Run cleanup-old-files.bat first to create backups.
    echo.
    pause
    exit /b 1
)

echo 🔄 RESTORING old functional code from backup...

REM Restore old controllers
if exist "backup-old-files\controllers" (
    xcopy "backup-old-files\controllers" "controllers\" /E /I /Q >nul 2>&1
    echo ✅ Restored old controllers
)

REM Restore old routes  
if exist "backup-old-files\routes" (
    xcopy "backup-old-files\routes" "routes\" /E /I /Q >nul 2>&1
    echo ✅ Restored old routes
)

REM Restore old utils
if exist "backup-old-files\error.js" (
    if not exist "utils" mkdir "utils"
    copy "backup-old-files\error.js" "utils\error.js" >nul 2>&1
    echo ✅ Restored utils/error.js
)

if exist "backup-old-files\verifyToken.js" (
    if not exist "utils" mkdir "utils"
    copy "backup-old-files\verifyToken.js" "utils\verifyToken.js" >nul 2>&1
    echo ✅ Restored utils/verifyToken.js
)

REM Restore old main files
if exist "backup-old-files\index-old.js" (
    copy "backup-old-files\index-old.js" "index.js" >nul 2>&1
    echo ✅ Restored old index.js
)

if exist "backup-old-files\package-old.json" (
    copy "backup-old-files\package-old.json" "package.json" >nul 2>&1
    echo ✅ Restored old package.json
)

echo.
echo =====================================================
echo ✅ RESTORATION COMPLETED!
echo =====================================================
echo.
echo 📊 SUMMARY:
echo   • Old functional code restored
echo   • OOP files still available with -oop suffix
echo   • You can switch between versions anytime
echo.
echo 🔄 To switch back to OOP: cleanup-old-files.bat
echo.
pause
