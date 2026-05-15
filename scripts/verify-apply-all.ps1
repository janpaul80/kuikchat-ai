# Verify supabase/APPLY_ALL.sql integrity
$f = "supabase/APPLY_ALL.sql"

if (-not (Test-Path $f)) {
    Write-Host "ERROR: File not found: $f" -ForegroundColor Red
    exit 1
}

$content  = Get-Content $f
$lines    = $content.Count
$size     = (Get-Item $f).Length
$firstN   = $content | Select-Object -First 5
$lastN    = $content | Select-Object -Last 5

Write-Host ""
Write-Host "=== APPLY_ALL.sql integrity check ===" -ForegroundColor Cyan
Write-Host "File  : $f"
Write-Host "Lines : $lines"
Write-Host "Bytes : $size"

Write-Host ""
Write-Host "--- FIRST 5 LINES ---" -ForegroundColor Yellow
$firstN | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "--- LAST 5 LINES ---" -ForegroundColor Yellow
$lastN | ForEach-Object { Write-Host $_ }

Write-Host ""
Write-Host "--- BIGINT FIX MARKERS ---" -ForegroundColor Yellow
$markers = Select-String -Path $f -Pattern "::bigint \* 1024 \* 1024"
Write-Host ("bigint casts found: " + $markers.Count + " (expected 11)")

Write-Host ""
if ($markers.Count -eq 11) {
    Write-Host "OK: All 11 bucket size casts present." -ForegroundColor Green
} else {
    Write-Host "WARNING: Expected 11 bigint casts, found $($markers.Count)." -ForegroundColor Red
}
