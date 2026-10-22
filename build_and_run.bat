@echo off
echo ============================================================
echo   ARITHMETIC COMPILER - ISE 2 BUILD AND RUN SCRIPT
echo ============================================================
echo.
echo [1/2] Compiling arithmetic_compiler.cpp using g++ (C++14)...
g++ -std=c++14 arithmetic_compiler.cpp -o arithmetic_compiler.exe
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Compilation failed! Please ensure MinGW g++ is installed and in your PATH.
    pause
    exit /b %ERRORLEVEL%
)

echo [2/2] Compilation successful! Launching Arithmetic Compiler...
echo.
arithmetic_compiler.exe
pause
