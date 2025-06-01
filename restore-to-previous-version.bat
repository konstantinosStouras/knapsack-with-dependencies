@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM STEP 0: Get script directory
set SCRIPT_DIR=%~dp0

REM STEP 1: Define key paths
set PROJECT_DIR=%SCRIPT_DIR:~0,-1%
set SRC_DIR=%PROJECT_DIR%\src
set GH_PAGES_REPO=%PROJECT_DIR%\..\konstantinosStouras.github.io
set TARGET_DIR=%GH_PAGES_REPO%\lab\knapsack-with-dependencies
set LOG_FILE=%PROJECT_DIR%\knapsack-update-log.txt
set BACKUP_DIR=%PROJECT_DIR%\backups

REM STEP 2: List available backup folders
echo.
echo 🗂 Available backups:
dir /b /ad "%BACKUP_DIR%"
echo.

REM STEP 3: Prompt user to choose a folder
set /p VERSION_FOLDER=🔁 Paste the full folder name to restore (e.g. knapsack-with-dependencies_v1_0_13_20250429_224500): 

set BACKUP_PATH=%BACKUP_DIR%\%VERSION_FOLDER%

REM STEP 4: Validate backup path
if not exist "%BACKUP_PATH%" (
    echo ❌ Folder not found: %BACKUP_PATH%
    pause
    exit /b
)

REM STEP 5: Confirm restore
echo.
echo ⚠️ You are about to restore:
echo   From: %BACKUP_PATH%
echo   To:   %TARGET_DIR% (deployment)
echo        %SRC_DIR% (source code)
echo.
set /p CONFIRM=Type YES to confirm restore: 
if /i not "%CONFIRM%"=="YES" (
    echo ❌ Restore cancelled.
    pause
    exit /b
)

REM STEP 6: Restore files using robocopy
echo 🔄 Restoring deployment...
robocopy "%BACKUP_PATH%\deployment" "%TARGET_DIR%" /MIR

echo 🔄 Restoring source code...
robocopy "%BACKUP_PATH%\source" "%SRC_DIR%" /MIR

REM STEP 7: Get current timestamp
for /f %%A in ('powershell -command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set TIMESTAMP=%%A

REM STEP 8: Git commit and push
cd /d "%GH_PAGES_REPO%"
git add -f lab/knapsack-with-dependencies
git commit -m "Restore version from %VERSION_FOLDER% (%TIMESTAMP%)"
git push

REM STEP 9: Log the restore
echo %TIMESTAMP% - RESTORED from %VERSION_FOLDER% >> "%LOG_FILE%"

REM STEP 10: Open deployed site
start "" "https://konstantinosStouras.github.io/lab/knapsack-with-dependencies/"

echo.
echo ✅ Restore complete!
echo 🔄 Restored from: %VERSION_FOLDER%
echo 📝 Log updated: %LOG_FILE%
pause > nul
