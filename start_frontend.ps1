# ============================================================
#   ARITHMETIC COMPILER STUDIO - LAUNCH WEB FRONTEND
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ARITHMETIC COMPILER STUDIO - LAUNCH WEB FRONTEND" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/2] Starting local Vite dev server..." -ForegroundColor Yellow
Write-Host "Access in your browser at: http://localhost:5173" -ForegroundColor Green
Write-Host ""

Set-Location -Path frontend
npm run dev
