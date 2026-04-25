param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
)

$ErrorActionPreference = "Stop"

$patterns = @(
  "ASSET_VERSION",
  "image asset",
  "images?",
  "이미지",
  "에셋",
  "sign",
  "thumbnail",
  "207",
  "2,000",
  "2000",
  "1,900",
  "1900",
  "1631",
  "1632",
  "1125",
  "1,125",
  "314"
)

$relativeFiles = @(
  "AGENTS.md",
  "CLAUDE.md",
  "src/pages/Gallery.jsx",
  "src/components/ImageSystemInfo.jsx",
  "src/pages/Updates.jsx",
  "src/utils/cdn.js",
  "workers/svg-tablet.js"
)

$docsIntro = Get-ChildItem -LiteralPath (Join-Path $Root "docs") -File -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "*소개페이지*.txt" -or $_.Name -like "*소개*.txt" }

$files = @()
foreach ($rel in $relativeFiles) {
  $path = Join-Path $Root $rel
  if (Test-Path -LiteralPath $path) {
    $files += Get-Item -LiteralPath $path
  }
}
$files += $docsIntro
$files = $files | Sort-Object FullName -Unique

Write-Host "IMAGE COUNT SURFACE AUDIT - READ ONLY"
Write-Host "Classify each hit manually as: current, historical, or ignore."
Write-Host "Do not auto-edit prompt JSON or historical changelog entries from this output."
Write-Host ""

foreach ($file in $files) {
  $matches = Select-String -LiteralPath $file.FullName -Pattern $patterns -SimpleMatch -Encoding UTF8 -ErrorAction SilentlyContinue
  if (-not $matches) {
    continue
  }

  $rel = Resolve-Path -LiteralPath $file.FullName -Relative
  Write-Host "## $rel"
  foreach ($match in $matches) {
    $line = $match.Line.Trim()
    if ($line.Length -gt 220) {
      $line = $line.Substring(0, 220) + "..."
    }
    Write-Host ("{0}: {1}" -f $match.LineNumber, $line)
  }
  Write-Host ""
}

Write-Host "END IMAGE COUNT SURFACE AUDIT - READ ONLY"
