# Menjalankan Dev Server Web SIRAJ
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Menjalankan Server Web & Simulator Mobile SIRAJ" -ForegroundColor Green
Write-Host "  Pondok Pesantren Darussalam Rajapolah" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Buka di browser: http://127.0.0.1:5173" -ForegroundColor Yellow

$root = Split-Path -Parent $PSScriptRoot
Push-Location "$root\web"
npm run dev
Pop-Location
