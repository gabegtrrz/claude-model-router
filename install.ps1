# claude-model-router installer
# Copies scripts to ~/bin and adds launcher functions to your PowerShell profile.

$bin = "$env:USERPROFILE\bin"
$profile = $PROFILE.CurrentUserCurrentHost

# Create ~/bin if needed
if (-not (Test-Path $bin)) {
    New-Item -ItemType Directory -Path $bin | Out-Null
    Write-Host "Created $bin"
}

# Copy scripts
Copy-Item "$PSScriptRoot\claude-proxy.mjs"  "$bin\claude-proxy.mjs"  -Force
Copy-Item "$PSScriptRoot\claude-multi.cmd"  "$bin\claude-multi.cmd"  -Force
Copy-Item "$PSScriptRoot\claude-mimo.cmd"   "$bin\claude-mimo.cmd"   -Force
Copy-Item "$PSScriptRoot\claude-kimi.cmd"   "$bin\claude-kimi.cmd"   -Force

# Copy routes.json only if one doesn't already exist (don't overwrite user's config)
if (-not (Test-Path "$bin\routes.json")) {
    Copy-Item "$PSScriptRoot\routes.json" "$bin\routes.json"
    Write-Host "Copied routes.json to $bin (edit this to add providers)"
} else {
    Write-Host "routes.json already exists at $bin, skipping (your config is safe)"
}
Write-Host "Copied scripts to $bin"

# Add launcher functions to PowerShell profile (if not already there)
$profileEntry = @"

# Claude Code model launchers (claude-model-router)
function claude-multi { & "`$env:USERPROFILE\bin\claude-multi.cmd" @args }
function claude-mimo  { & "`$env:USERPROFILE\bin\claude-mimo.cmd"  @args }
function claude-kimi  { & "`$env:USERPROFILE\bin\claude-kimi.cmd"  @args }
"@

$profileDir = Split-Path $profile
if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir | Out-Null
}

if (-not (Test-Path $profile) -or -not (Get-Content $profile -Raw).Contains("claude-model-router")) {
    Add-Content $profile $profileEntry
    Write-Host "Added launcher functions to $profile"
} else {
    Write-Host "Launcher functions already in profile, skipping"
}

Write-Host ""
Write-Host "Done! Set your API keys, then open a new terminal tab:"
Write-Host '  [Environment]::SetEnvironmentVariable("MIMO_API_KEY", "sk-your-key", "User")'
Write-Host '  [Environment]::SetEnvironmentVariable("KIMI_API_KEY", "your-key", "User")'
Write-Host ""
Write-Host "Then run: claude-multi"
