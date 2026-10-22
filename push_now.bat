@echo off
echo ============================================================
echo   PUSHING TO GITHUB: satyapal-19/arithmetic-compiler-cd-ise2
echo ============================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ============================================================
    echo [SUCCESS] Repository pushed to GitHub!
    echo Now open https://vercel.com/new and import your repository!
    echo ============================================================
) else (
    echo [ERROR] Push failed. If prompted, please complete browser sign-in.
)
pause
