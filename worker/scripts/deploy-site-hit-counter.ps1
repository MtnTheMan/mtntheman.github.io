param(
  [string]$DatabaseName = "mtntheman-trip-tracker",
  [string]$WorkerUrl = "https://mtntheman-trip-tracker.mtntheman.workers.dev",
  [switch]$SkipMigration,
  [switch]$SkipDeploy,
  [switch]$UseExistingToken
)

$ErrorActionPreference = "Stop"

function ConvertFrom-SecureStringForProcess {
  param([Security.SecureString]$SecureValue)

  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureValue)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    if ($bstr -ne [IntPtr]::Zero) {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
  }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$workerRoot = Split-Path -Parent $scriptRoot
Set-Location $workerRoot

$wrangler = Get-Command "wrangler.cmd" -ErrorAction SilentlyContinue
if (-not $wrangler) {
  $wrangler = Get-Command "wrangler" -ErrorAction SilentlyContinue
}

if (-not $wrangler) {
  throw "Wrangler was not found. Install it with: npm install -g wrangler"
}

$hadExistingToken = [string]::IsNullOrWhiteSpace($env:CLOUDFLARE_API_TOKEN) -eq $false

if (-not $UseExistingToken -and -not $hadExistingToken) {
  Write-Host "Paste the Cloudflare API token for mtntheman-site-hits."
  Write-Host "It will only be stored in this PowerShell process."
  $secureToken = Read-Host "CLOUDFLARE_API_TOKEN" -AsSecureString
  $env:CLOUDFLARE_API_TOKEN = ConvertFrom-SecureStringForProcess $secureToken
}

if ([string]::IsNullOrWhiteSpace($env:CLOUDFLARE_API_TOKEN)) {
  throw "CLOUDFLARE_API_TOKEN is empty. Set it first or run without -UseExistingToken to be prompted."
}

Write-Host "Using Wrangler:"
& $wrangler.Source --version

if (-not $SkipMigration) {
  Write-Host ""
  Write-Host "Applying remote D1 migrations for $DatabaseName..."
  & $wrangler.Source d1 migrations apply $DatabaseName --remote
}

if (-not $SkipDeploy) {
  Write-Host ""
  Write-Host "Deploying Worker..."
  & $wrangler.Source deploy
}

Write-Host ""
Write-Host "Checking public counter endpoint..."
$countsUrl = "$WorkerUrl/api/views/counts"
$body = @{ paths = @("/trip-tracker/") } | ConvertTo-Json
$response = Invoke-RestMethod -Uri $countsUrl -Method Post -Body $body -ContentType "application/json"

if (-not $response.ok) {
  throw "Counter endpoint responded, but did not report ok=true."
}

Write-Host "Counter endpoint is responding."
Write-Host "Counts returned:"
$response.counts | Format-List

if (-not $hadExistingToken) {
  Remove-Item Env:CLOUDFLARE_API_TOKEN -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "Done. The page counters should appear after GitHub Pages and the Worker deployment are both live."
