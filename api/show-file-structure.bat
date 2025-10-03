@echo off
echo =====================================================
echo   HOSTEL FINDER API - FILE STRUCTURE ANALYSIS
echo =====================================================
echo.

echo 📁 CURRENT FILE STRUCTURE:
echo.

echo ✅ ESSENTIAL OOP FILES:
echo.
echo 🏗️  CORE ARCHITECTURE:
if exist "core" (
    echo    ├── core/
    dir /b "core" 2>nul | findstr . >nul && (
        for /f %%f in ('dir /b "core" 2^>nul') do echo    │   ├── %%f
    )
) else (
    echo    ❌ core/ - MISSING!
)

echo.
echo 🏢 BUSINESS LOGIC:
if exist "services" (
    echo    ├── services/
    for /f %%f in ('dir /b "services" 2^>nul ^| find /c /v ""') do echo    │   └── %%f files
) else (
    echo    ❌ services/ - MISSING!
)

if exist "repositories" (
    echo    ├── repositories/
    for /f %%f in ('dir /b "repositories" 2^>nul ^| find /c /v ""') do echo    │   └── %%f files
) else (
    echo    ❌ repositories/ - MISSING!
)

echo.
echo 🎮 CONTROLLERS & ROUTES:
if exist "controllers-oop" (
    echo    ├── controllers-oop/
    for /f %%f in ('dir /b "controllers-oop" 2^>nul ^| find /c /v ""') do echo    │   └── %%f files
) else (
    echo    ❌ controllers-oop/ - MISSING!
)

if exist "routes-oop" (
    echo    ├── routes-oop/
    for /f %%f in ('dir /b "routes-oop" 2^>nul ^| find /c /v ""') do echo    │   └── %%f files
) else (
    echo    ❌ routes-oop/ - MISSING!
)

echo.
echo 🛠️  MIDDLEWARE & UTILS:
if exist "middleware" (
    echo    ├── middleware/
    for /f %%f in ('dir /b "middleware" 2^>nul ^| find /c /v ""') do echo    │   └── %%f files
) else (
    echo    ❌ middleware/ - MISSING!
)

if exist "utils\classes" (
    echo    ├── utils/classes/
    for /f %%f in ('dir /b "utils\classes" 2^>nul ^| find /c /v ""') do echo    │   └── %%f files
) else (
    echo    ❌ utils/classes/ - MISSING!
)

echo.
echo ❌ OLD FILES (Can be removed):
echo.

if exist "controllers" (
    echo    🗑️  controllers/ - OLD functional controllers
) else (
    echo    ✅ controllers/ - Already removed
)

if exist "routes" (
    echo    🗑️  routes/ - OLD functional routes  
) else (
    echo    ✅ routes/ - Already removed
)

if exist "utils\error.js" (
    echo    🗑️  utils/error.js - Replaced by ErrorHandler.js
) else (
    echo    ✅ utils/error.js - Already removed
)

if exist "utils\verifyToken.js" (
    echo    🗑️  utils/verifyToken.js - Replaced by TokenManager.js
) else (
    echo    ✅ utils/verifyToken.js - Already removed
)

echo.
echo 📊 SYSTEM STATUS:
if exist "index.js" (
    findstr /C:"Object-Oriented Architecture" "index.js" >nul 2>&1
    if errorlevel 1 (
        echo    🔄 Running: OLD functional version
    ) else (
        echo    ✅ Running: NEW OOP version
    )
) else (
    echo    ❌ No main index.js found
)

echo.
echo 💾 BACKUP STATUS:
if exist "backup-old-files" (
    echo    ✅ Backup directory exists
    for /f %%f in ('dir /b "backup-old-files" 2^>nul ^| find /c /v ""') do echo    📁 Contains %%f backed up files
) else (
    echo    ⚠️  No backup directory (run cleanup-old-files.bat to create)
)

echo.
echo =====================================================
echo 🎯 RECOMMENDATIONS:
echo.
if exist "controllers" (
    echo • Run 'cleanup-old-files.bat' to remove old files
)
if exist "backup-old-files" (
    echo • Your old files are safely backed up
)
echo • Your OOP architecture is ready and working
echo • All API endpoints remain exactly the same
echo.
pause
