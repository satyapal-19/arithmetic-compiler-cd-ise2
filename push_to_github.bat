@echo off
echo ============================================================
echo   PUSH ARITHMETIC COMPILER STUDIO TO GITHUB
echo ============================================================
echo.
echo If you haven't created the repository on GitHub yet:
echo 1. Open your browser and go to: https://github.com/new
echo 2. Repository name: arithmetic-compiler-studio
echo 3. Click 'Create repository' (Do NOT check initialize with README)
echo.
set /p REPO_URL="Paste your GitHub repository URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo [1/3] Setting remote origin...
git remote remove origin 2>nul
git remote add origin %REPO_URL%

echo [2/3] Ensuring branch is 'main'...
git branch -M main

echo [3/3] Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo [SUCCESS] Pushed to GitHub successfully!
    echo Now open https://vercel.com/new and import this repository.
    echo ============================================================
) else (
    echo.
    echo [ERROR] Git push failed. Please verify your repository URL and permissions.
)

pause
