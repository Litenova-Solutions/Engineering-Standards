[CmdletBinding()]
param(
    [string]$RepositoryRoot = (Get-Location).Path,
    [string]$StandardsProjectPath = ""
)

$ErrorActionPreference = "Stop"
$errors = [System.Collections.Generic.List[string]]::new()

if ([string]::IsNullOrWhiteSpace($StandardsProjectPath)) {
    $StandardsProjectPath = Join-Path $RepositoryRoot "standards.project.json"
}

$standardsRoot = Join-Path $RepositoryRoot "standards"
$manifestPath = Join-Path $standardsRoot "standards.manifest.json"
$project = Get-Content -Raw $StandardsProjectPath | ConvertFrom-Json
$manifest = Get-Content -Raw $manifestPath | ConvertFrom-Json
$domainRoot = Join-Path $RepositoryRoot ([string]$project.paths.domainDocs)

$allowedRiskFlags = @(
    "authorization",
    "money",
    "sensitive-data",
    "irreversible",
    "concurrency",
    "durable-delivery",
    "availability"
)
$knownExtensions = @($manifest.extensions.PSObject.Properties.Name)
$enabledExtensions = @($project.extensions)
$routePattern = '(?s)^---\s*\r?\n(?<json>\{.*?\})\s*\r?\n---'
$acceptancePattern = '\[?(?<id>AC-[A-Z0-9]+(?:-[A-Z0-9]+)+-[0-9]{2})\]?'
$codeRoots = Get-ChildItem -LiteralPath $RepositoryRoot -Directory -Force |
    Where-Object { $_.Name -notin @(".git", "docs", "standards", "node_modules", "bin", "obj") }

if (-not (Test-Path -LiteralPath $domainRoot)) {
    $errors.Add("Domain documentation path does not exist: $domainRoot")
}

$subjectsRoot = Join-Path $domainRoot "subjects"
$crossCuttingRoot = Join-Path $domainRoot "cross-cutting"
foreach ($bucket in @(@("subjects", $subjectsRoot), @("cross-cutting", $crossCuttingRoot))) {
    if (-not (Test-Path -LiteralPath $bucket[1])) {
        Add-Error "Domain bucket does not exist: $($bucket[1])"
    }
    elseif (-not (Test-Path -LiteralPath (Join-Path $bucket[1] "README.md"))) {
        Add-Error "Domain bucket is missing README.md: $($bucket[1])"
    }
}

if (Test-Path -LiteralPath $subjectsRoot) {
    foreach ($subjectFile in Get-ChildItem -LiteralPath $subjectsRoot -File -Filter *.md) {
        if ($subjectFile.Name -ne "README.md") {
            Add-Error "$($subjectFile.FullName): subject files must be inside subjects/{subject}"
        }
    }
}

function Add-Error {
    param([string]$Message)
    $errors.Add($Message)
}

if (Test-Path -LiteralPath $domainRoot) {
    $documents = Get-ChildItem -LiteralPath $domainRoot -Recurse -File -Filter *.md

    foreach ($document in $documents) {
        $content = Get-Content -Raw $document.FullName
        $routeMatch = [regex]::Match($content, $routePattern)
        if (-not $routeMatch.Success) {
            continue
        }

        try {
            $route = $routeMatch.Groups["json"].Value | ConvertFrom-Json
        }
        catch {
            Add-Error "$($document.FullName): routing JSON is invalid"
            continue
        }

        $relativePath = $document.FullName.Substring($domainRoot.Length).TrimStart([char]92, [char]47).Replace([char]92, [char]47)
        $relativeDirectory = [System.IO.Path]::GetDirectoryName($relativePath).Replace([char]92, [char]47)
        $relativeParts = $relativePath.Split("/")
        $routeProperties = @($route.PSObject.Properties.Name)

        if ($routeProperties -contains "operationType") {
            if ($relativeParts.Count -lt 3 -or $relativeParts[0] -ne "subjects") {
                Add-Error "$($document.FullName): use-case routing blocks must be under subjects/{subject}"
                continue
            }
            $expectedId = "$($relativeParts[1]).$([System.IO.Path]::GetFileNameWithoutExtension($document.Name))"
            if ([string]$route.id -ne $expectedId) {
                Add-Error "$($document.FullName): id '$($route.id)' does not match '$expectedId'"
            }

            foreach ($flag in @($route.riskFlags)) {
                if ($flag -notin $allowedRiskFlags) {
                    Add-Error "$($document.FullName): unknown risk flag '$flag'"
                }
            }

            foreach ($extension in @($route.extensions)) {
                if ($extension -notin $knownExtensions) {
                    Add-Error "$($document.FullName): extension '$extension' is not in the standards manifest"
                }
                elseif ($extension -notin $enabledExtensions) {
                    Add-Error "$($document.FullName): extension '$extension' is not enabled for the consumer"
                }
            }

            $acceptanceIds = [regex]::Matches($content, $acceptancePattern) |
                ForEach-Object { $_.Groups["id"].Value } |
                Sort-Object -Unique
            $prefix = "AC-$(([string]$route.id).Replace('.', '-').ToUpperInvariant())-"
            foreach ($acceptanceId in $acceptanceIds) {
                if (-not $acceptanceId.StartsWith($prefix, [System.StringComparison]::Ordinal)) {
                    Add-Error "$($document.FullName): acceptance ID '$acceptanceId' does not use prefix '$prefix'"
                }
            }

            if ([string]$route.status -eq "active") {
                foreach ($acceptanceId in $acceptanceIds) {
                    $found = $false
                    foreach ($codeRoot in $codeRoots) {
                        $match = Get-ChildItem -LiteralPath $codeRoot.FullName -Recurse -File -ErrorAction SilentlyContinue |
                            Where-Object { $_.Extension -in @(".cs", ".feature", ".ts", ".tsx", ".js", ".jsx") } |
                            Select-String -SimpleMatch $acceptanceId -Quiet
                        if ($match) {
                            $found = $true
                            break
                        }
                    }
                    if (-not $found) {
                        Add-Error "$($document.FullName): active acceptance ID '$acceptanceId' has no code or test reference"
                    }
                }
            }
        }
        elseif ($routeProperties -contains "status" -and $routeProperties.Count -eq 2) {
            $expectedId = [System.IO.Path]::GetFileName($relativeDirectory)
            if ($document.Name -ne "README.md" -or $relativeParts.Count -ne 3 -or $relativeParts[0] -ne "subjects" -or [string]$route.id -ne $expectedId) {
                Add-Error "$($document.FullName): subject id must match its subjects/{subject} directory"
            }
        }
        else {
            Add-Error "$($document.FullName): routing block is neither subject nor use case metadata"
        }
    }
}

if ($errors.Count -gt 0) {
    $errors | ForEach-Object { Write-Error $_ }
    exit 1
}

Write-Output "Domain documentation checks passed."
