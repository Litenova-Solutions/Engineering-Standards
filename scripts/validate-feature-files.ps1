# Validates Reqnroll .feature files for @usecase: and @ac: tags per api-acceptance-tests.md.
# Usage: pwsh scripts/validate-feature-files.ps1 -FeaturesRoot apps/api/tests/MyApp.AcceptanceTests/Features
param(
    [Parameter(Mandatory = $true)]
    [string] $FeaturesRoot
)

$ErrorActionPreference = "Stop"
$errors = @()

if (-not (Test-Path $FeaturesRoot)) {
    Write-Error "Features root not found: $FeaturesRoot"
}

$featureFiles = Get-ChildItem -Path $FeaturesRoot -Filter "*.feature" -Recurse -File
$useCasePattern = [regex]'@usecase:([a-z0-9-]+/[a-z0-9-]+)'
$acPattern = [regex]'@ac:AC-\d{3}'

foreach ($file in $featureFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $relative = $file.FullName.Substring((Resolve-Path $FeaturesRoot).Path.Length).TrimStart('\', '/')

    if ($content -notmatch $useCasePattern) {
        $errors += "${relative}: missing @usecase:{feature}/{use-case} tag on Feature"
    }

    $scenarioBlocks = [regex]::Split($content, '(?=^\s*(Scenario|Scenario Outline):)', [System.Text.RegularExpressions.RegexOptions]::Multiline)
    foreach ($block in $scenarioBlocks) {
        if ($block -notmatch '^\s*(Scenario|Scenario Outline):') { continue }
        if ($block -notmatch $acPattern) {
            $title = ($block -split "`n")[0].Trim()
            $errors += "${relative}: $title missing @ac:AC-00N tag"
        }
    }
}

if ($errors.Count -gt 0) {
    Write-Host "Feature tag validation failed ($($errors.Count) issues):"
    foreach ($e in $errors) { Write-Host "  - $e" }
    exit 1
}

Write-Host "Validated $($featureFiles.Count) feature file(s) under $FeaturesRoot"
exit 0
