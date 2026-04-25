param(
  [string]$PromptsRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\docs\prompts\json")).Path
)

$ErrorActionPreference = "Stop"

Write-Host "AUDIT ONLY - DO NOT MODIFY THESE LINES (MOD-3)"
Write-Host "Body-level trigger fields may be intentional narrative/runtime content."
Write-Host "This script is a guardrail for review only; it is not a fix list."
Write-Host ""

Get-ChildItem -LiteralPath $PromptsRoot -Recurse -File -Filter "*.json" |
  Where-Object { $_.FullName -notmatch "\\_combined\\" } |
  Select-String -Pattern '"trigger"\s*:' -Encoding UTF8 |
  ForEach-Object {
    $rel = Resolve-Path -LiteralPath $_.Path -Relative
    Write-Host ("{0}:{1}: {2}" -f $rel, $_.LineNumber, $_.Line.Trim())
  }

Write-Host ""
Write-Host "AUDIT ONLY - DO NOT MODIFY THESE LINES (MOD-3)"
