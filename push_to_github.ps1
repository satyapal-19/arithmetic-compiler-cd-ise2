# ============================================================
#   PUSH ARITHMETIC COMPILER STUDIO TO GITHUB
# ============================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  PUSH ARITHMETIC COMPILER STUDIO TO GITHUB" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Name: arithmetic-compiler-studio" -ForegroundColor Yellow
Write-Host "3. Leave README unchecked and click 'Create repository'" -ForegroundColor Yellow
Write-Host ""

$repoUrl = Read-Host "Paste your GitHub repository URL (e.g. https://github.com/username/arithmetic-compiler-studio.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "[ERROR] No URL entered. Aborting." -ForegroundColor Red
    exit 1
}

Write-Host "`n[1/3] Setting remote origin..." -ForegroundColor Yellow
git remote remove origin 2>$null
git remote add origin $repoUrl

Write-Host "[2/3] Setting branch to main..." -ForegroundColor Yellow
git branch -M main

Write-Host "[3/3] Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n============================================================" -ForegroundColor Green
    Write-Host "[SUCCESS] Pushed to GitHub cleanly!" -ForegroundColor Green
    Write-Host "Now visit https://vercel.com/new and click 'Import' to deploy!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Git push encountered an issue. Check your repository URL or credentials." -ForegroundColor Red
}
