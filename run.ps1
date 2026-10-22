# ============================================================
#   ARITHMETIC COMPILER - ISE 2 POWERSHELL RUN SCRIPT
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ARITHMETIC COMPILER - ISE 2 BUILD AND RUN SCRIPT" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Compiling arithmetic_compiler.cpp using g++ (C++14)..." -ForegroundColor Yellow
g++ -std=c++14 arithmetic_compiler.cpp -o arithmetic_compiler.exe

if ($LASTEXITCODE -eq 0) {
    Write-Host "[2/2] Compilation successful! Launching Arithmetic Compiler..." -ForegroundColor Green
    Write-Host ""
    ./arithmetic_compiler.exe
} else {
    Write-Host "[ERROR] Compilation failed! Check g++ installation and PATH." -ForegroundColor Red
}
