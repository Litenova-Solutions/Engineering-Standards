param(
    [string]$AcceptanceTestsRoot = "apps/api/tests"
)

$ErrorActionPreference = "Stop"
$failures = @()

function Add-Failure([string]$Message) {
    $script:failures += $Message
}

$projects = Get-ChildItem -Path $AcceptanceTestsRoot -Directory -Filter "*.AcceptanceTests" -ErrorAction SilentlyContinue

if ($projects.Count -eq 0) {
    Write-Host "No acceptance test projects found under $AcceptanceTestsRoot. Skipping."
    exit 0
}

$bannedPhrases = @(
    "I send a POST request",
    "I send a GET request",
    "I set header",
    "I call endpoint",
    "Content-Type"
)

foreach ($project in $projects) {
    $featuresRoot = Join-Path $project.FullName "Features"
    if (-not (Test-Path $featuresRoot)) {
        continue
    }

    $featureFiles = Get-ChildItem -Path $featuresRoot -Recurse -Filter "*.feature"
    foreach ($file in $featureFiles) {
        $relative = $file.FullName.Substring($project.FullName.Length + 1).Replace("\", "/")
        $lines = Get-Content -Path $file.FullName
        $content = $lines -join "`n"

        if ($content -notmatch "@usecase:") {
            Add-Failure "$relative`: missing @usecase: tag"
        }

        if ($relative -notmatch "^Features/[^/]+/") {
            Add-Failure "$relative`: must live under Features/{Feature}/"
        }

        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match '^\s*Scenario(?: Outline)?:') {
                $scenarioName = $lines[$i].Trim()
                $tagLines = @()
                for ($j = $i - 1; $j -ge 0; $j--) {
                    $line = $lines[$j]
                    if ($line -match '^\s*@') {
                        $tagLines += $line
                    }
                    elseif ($line.Trim().Length -eq 0) {
                        continue
                    }
                    else {
                        break
                    }
                }

                $tagBlock = ($tagLines -join " ")
                if ($tagBlock -notmatch "@ac:") {
                    Add-Failure "$relative`: scenario missing @ac: tag -> $scenarioName"
                }
            }
        }

        $isApiContract = $content -match "@api-contract"
        if (-not $isApiContract) {
            foreach ($phrase in $bannedPhrases) {
                if ($content -match [regex]::Escape($phrase)) {
                    Add-Failure "$relative`: banned transport phrase '$phrase' (use @api-contract if intentional)"
                }
            }
        }
    }

    $committedCodeBehind = Get-ChildItem -Path $project.FullName -Recurse -Filter "*.feature.cs" -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch '[\\/]obj[\\/]' -and $_.FullName -notmatch '[\\/]bin[\\/]' }

    foreach ($generated in $committedCodeBehind) {
        Add-Failure "$($generated.FullName): committed .feature.cs file (set ReqnrollUseIntermediateOutputPathForCodeBehind)"
    }
}

if ($failures.Count -gt 0) {
    Write-Host "Feature file validation failed:"
    foreach ($failure in $failures) {
        Write-Host "  - $failure"
    }
    exit 1
}

Write-Host "Feature file validation passed."
exit 0
