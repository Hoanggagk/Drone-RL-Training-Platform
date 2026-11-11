param(
    [Parameter(Mandatory = $true)]
    [string]$DatabaseUrl
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$migration = Join-Path $repoRoot 'database/migrations/0001_mvp_baseline.sql'
$tests = Join-Path $repoRoot 'database/tests/0001_mvp_baseline_test.sql'

if (-not (Get-Command psql -ErrorAction SilentlyContinue)) {
    throw 'psql was not found on PATH.'
}

& psql -X -v ON_ERROR_STOP=1 --dbname $DatabaseUrl --file $migration
if ($LASTEXITCODE -ne 0) { throw 'Database migration failed.' }

& psql -X -v ON_ERROR_STOP=1 --dbname $DatabaseUrl --file $tests
if ($LASTEXITCODE -ne 0) { throw 'Database tests failed.' }

Write-Output 'Database migration and tests passed.'
