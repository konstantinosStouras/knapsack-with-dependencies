@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM STEP 0: Get script's directory
set SCRIPT_DIR=%~dp0

REM STEP 1: Define paths
set PROJECT_DIR=%SCRIPT_DIR:~0,-1%
set BUILD_DIR=%PROJECT_DIR%\dist
set SRC_DIR=%PROJECT_DIR%\src
set GH_PAGES_REPO=%PROJECT_DIR%\..\konstantinosStouras.github.io
set TARGET_DIR=%GH_PAGES_REPO%\lab\knapsack-with-dependencies
set LOG_FILE=%PROJECT_DIR%\knapsack-update-log.txt
set VERSION_FILE=%PROJECT_DIR%\version.txt
set BACKUP_DIR=%PROJECT_DIR%\backups

REM STEP 2: Ensure backup folder exists
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
)

REM STEP 3: Read current version
if exist "%VERSION_FILE%" (
    set /p CURRENT_VERSION=<"%VERSION_FILE%"
) else (
    set CURRENT_VERSION=v1.0.0
)

echo 📄 Current version: %CURRENT_VERSION%

REM STEP 4: Increment version (vX.Y.Z → vX.Y.(Z+1))
for /f "tokens=1-3 delims=." %%a in ("%CURRENT_VERSION:~1%") do (
    set /a PATCH=%%c+1
    set NEXT_VERSION=v%%a.%%b.!PATCH!
)

echo 🆕 Next version: %NEXT_VERSION%

REM STEP 5: Prompt for custom note
set /p CUSTOM_NOTE=📝 Enter a short update note (optional): 

REM STEP 6: Build the app
cd /d "%PROJECT_DIR%"
echo 🔧 Running npm build...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed. Aborting.
    pause
    exit /b
)

REM STEP 7: Create unique backup path (safe version + timestamp)
set SAFE_VERSION=%CURRENT_VERSION:.=_%
for /f %%A in ('powershell -command "Get-Date -Format \"yyyyMMdd_HHmmss\""') do set DATETIME=%%A
set BACKUP_PATH=%BACKUP_DIR%\knapsack-with-dependencies_%SAFE_VERSION%_%DATETIME%

echo 📦 Creating backup at: %BACKUP_PATH%

REM Step 7.1: Make sure folders exist
mkdir "%BACKUP_PATH%\deployment"
mkdir "%BACKUP_PATH%\source"

REM Step 7.2: Copy deployment from dist → deployment
echo 🔄 Backing up deployment from: %BUILD_DIR%
robocopy "%BUILD_DIR%" "%BACKUP_PATH%\deployment" /MIR

REM Step 7.3: Copy full src → source
echo 🔄 Backing up source from: %SRC_DIR%
robocopy "%SRC_DIR%" "%BACKUP_PATH%\source" /MIR


REM STEP 8: Deploy new build
echo 🧹 Copying new build to GitHub Pages...
robocopy "%BUILD_DIR%" "%TARGET_DIR%" /MIR

REM STEP 9: Get timestamp
for /f %%A in ('powershell -command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set TIMESTAMP=%%A

REM STEP 10: Git commit and push
cd /d "%GH_PAGES_REPO%"
git add -f lab/knapsack-with-dependencies
git commit -m "Auto-update knapsack-with-dependencies %NEXT_VERSION% (%TIMESTAMP%) - %CUSTOM_NOTE%"
git push

REM STEP 11: Log version and note
echo %TIMESTAMP% - %NEXT_VERSION% - %CUSTOM_NOTE% >> "%LOG_FILE%"
echo %NEXT_VERSION% > "%VERSION_FILE%"

REM STEP 12: Open your site
start "" "https://konstantinosStouras.github.io/lab/knapsack-with-dependencies/"

echo.
echo ✅ Update complete!
echo 🔖 Version: %NEXT_VERSION%
echo 💾 Backup saved in: %BACKUP_PATH%
echo 📜 Log file updated: %LOG_FILE%
pause > nul
