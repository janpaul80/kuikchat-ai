# Scan APPLY_ALL.sql for any integer arithmetic that could exceed int32 max (2,147,483,647)
$f = "supabase/APPLY_ALL.sql"

Write-Host ""
Write-Host "=== Scanning for potential int32 overflow patterns ===" -ForegroundColor Cyan
Write-Host ""

# Pattern 1: numeric literal * 1024 or 1000000+ NOT followed by ::bigint cast
$hits = Select-String -Path $f -Pattern '\d{2,}\s*\*\s*1024|\*\s*1024\s*\*\s*1024|\d{10,}'

foreach ($h in $hits) {
    $line = $h.Line.Trim()
    # Skip lines that already have the bigint cast
    if ($line -match '::bigint') { continue }
    # Skip comments
    if ($line -match '^\s*--') { continue }
    Write-Host ("L{0,5}: {1}" -f $h.LineNumber, $line) -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Scan complete. Lines above may overflow int32. ===" -ForegroundColor Cyan
