# Generates docs/test-coverage-report.md from all *.tests.md under docs/domain/.
# Run from repository root: pwsh scripts/generate-test-coverage-report.ps1 [-DomainRoot docs/domain]

param(
    [string]$DomainRoot = "docs/domain",
    [string]$OutputPath = "docs/test-coverage-report.md"
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

if (-not (Test-Path $DomainRoot)) {
    Write-Error "Domain root not found: $DomainRoot"
}

$testSpecs = Get-ChildItem -Path $DomainRoot -Recurse -Filter "*.tests.md" | Sort-Object FullName
$sb = [System.Text.StringBuilder]::new()
[void]$sb.AppendLine("# Test Coverage Report")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("Generated from ``*.tests.md`` files. Regenerate with:")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("```powershell")
[void]$sb.AppendLine("pwsh scripts/generate-test-coverage-report.ps1")
[void]$sb.AppendLine("```")
[void]$sb.AppendLine("")

$tableHeader = "| # | Scenario | Given | When | Then | Layer | Class | Method | Variations |"
$tableSep = "|:--|:---------|:------|:-----|:-----|:------|:------|:-------|:-----------|"

foreach ($spec in $testSpecs) {
    $relative = $spec.FullName.Substring($repoRoot.Length).TrimStart("\", "/")
    $feature = Split-Path (Split-Path $relative -Parent) -Leaf
    $useCase = $spec.BaseName -replace '\.tests$', ''

    [void]$sb.AppendLine("## $feature / $useCase")
    [void]$sb.AppendLine("")
    [void]$sb.AppendLine("Source: ``$relative``")
    [void]$sb.AppendLine("")

    $lines = Get-Content -Path $spec.FullName -Encoding UTF8
    $inTable = $false
    $tableRows = [System.Collections.Generic.List[string]]::new()

    foreach ($line in $lines) {
        if ($line -match '^\|\s*#\s*\|') {
            $inTable = $true
            [void]$tableRows.Add($tableHeader)
            [void]$tableRows.Add($tableSep)
            continue
        }
        if ($inTable) {
            if ($line -match '^\|') {
                if ($line -match '^\|[\s:|-]+\|$') { continue }
                [void]$tableRows.Add($line)
            }
            else {
                $inTable = $false
            }
        }
    }

    if ($tableRows.Count -gt 2) {
        foreach ($row in $tableRows) { [void]$sb.AppendLine($row) }
    }
    else {
        [void]$sb.AppendLine("_No Test Coverage table found._")
    }
    [void]$sb.AppendLine("")
}

$outDir = Split-Path $OutputPath -Parent
if ($outDir -and -not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Join-Path $repoRoot $OutputPath), $sb.ToString(), $utf8NoBom)
Write-Host "Wrote $OutputPath ($($testSpecs.Count) test spec file(s))"
