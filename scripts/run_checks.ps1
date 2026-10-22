# SIRAJ Quality and Security Check Script
# Pondok Pesantren Darussalam Rajapolah Tasikmalaya

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  SIRAJ - Smart Islamic Routine and Attendance Journey" -ForegroundColor Green
Write-Host "  Pemeriksaan Mutu dan Keamanan Sistem Otomatis" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$root = Split-Path -Parent $PSScriptRoot

# 1. Flutter Analysis
Write-Host "[1/3] Menjalankan Analisis Statis Flutter (flutter analyze)..." -ForegroundColor Yellow
Push-Location $root
flutter analyze
if ($LASTEXITCODE -ne 0) {
    Write-Host "[GAGAL] Analisis Flutter menemukan masalah!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "[SUKSES] Flutter analyze bersih (0 issues found)!" -ForegroundColor Green

# 2. Flutter Unit & Widget Tests
Write-Host "`n[2/3] Menjalankan Test Suite Flutter (flutter test)..." -ForegroundColor Yellow
flutter test
if ($LASTEXITCODE -ne 0) {
    Write-Host "[GAGAL] Pengujian Flutter gagal!" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "[SUKSES] Seluruh tes Flutter lulus 100 persen!" -ForegroundColor Green

# 3. Web Production Build
Write-Host "`n[3/3] Membangun Web App Produksi (npm run build)..." -ForegroundColor Yellow
Push-Location "$root\web"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[GAGAL] Build Web gagal!" -ForegroundColor Red
    Pop-Location
    Pop-Location
    exit 1
}
Pop-Location
Pop-Location

Write-Host ""
Write-Host "==================================================" -ForegroundColor Green
Write-Host "  SELURUH PEMERIKSAAN BERHASIL (100 PERSEN PASS)" -ForegroundColor Green
Write-Host "  Ekosistem SIRAJ siap digunakan dan dideploy!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
