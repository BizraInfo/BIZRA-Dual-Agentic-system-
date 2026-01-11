<#
.SYNOPSIS
    BIZRA NODE 0 - GENESIS ACTIVATION WARPER
    Plane: Warper
    Component: Installer
    Status: ACTIVE

.DESCRIPTION
    This script hydrates the local environment for the BIZRA Node 0 Sovereign Appliance.
    It verifies dependencies, establishes the Python virtual environment, and prepares
    the control plane for ignition.

.NOTES
    Author: BIZRA Genesis
    Date: 2026-01-10
#>

$ErrorActionPreference = "Stop"

Write-Host ">>> BIZRA WARPER: INITIATING GENESIS SEQUENCE..." -ForegroundColor Cyan

# 1. Environment Check
Write-Host "[1/4] Scanning Host Environment..." -ForegroundColor Yellow

if (-not (Get-Command "python" -ErrorAction SilentlyContinue)) {
    if (-not (Get-Command "python3" -ErrorAction SilentlyContinue)) {
        Write-Error "CRITICAL: Python is missing. Please install Python 3.10+."
    } else {
        $PythonCmd = "python3"
    }
} else {
    $PythonCmd = "python"
}

$PyVer = & $PythonCmd --version
Write-Host "      Detected: $PyVer" -ForegroundColor Green

# 2. Virtual Environment Hydration
Write-Host "[2/4] Hydrating Synaptic Environment (.venv)..." -ForegroundColor Yellow

$VenvPath = ".\.venv"
if (-not (Test-Path $VenvPath)) {
    Write-Host "      Creating new virtual environment..."
    & $PythonCmd -m venv .venv
} else {
    Write-Host "      Virtual environment exists."
}

# 3. Dependency Injection
Write-Host "[3/4] Injecting Dependencies..." -ForegroundColor Yellow

$PipCmd = ".\.venv\Scripts\pip"
if (-not (Test-Path $PipCmd)) {
    # Non-standard layout fallback (e.g. POSIX layout on Windows sometimes)
    $PipCmd = ".\.venv\bin\pip" 
}

# Core Requirements
$Reqs = @("requests", "pyyaml", "rich")

foreach ($Req in $Reqs) {
    Write-Host "      Injecting: $Req"
    & $PipCmd install $Req --quiet --disable-pip-version-check
}

# 4. Final Verification
Write-Host "[4/4] Verifying Control Plane..." -ForegroundColor Yellow

$IgnitionScript = "control-plane\ignition\ignition_sequence.py"
if (Test-Path $IgnitionScript) {
    Write-Host "      Control Plane Ignition Sequence Detected." -ForegroundColor Green
} else {
    Write-Warning "      Ignition Sequence NOT FOUND at $IgnitionScript"
}

Write-Host "`n>>> WARPER SEQUENCE COMPLETE." -ForegroundColor Cyan
Write-Host "To Activate Node 0, run:"
Write-Host "   .\.venv\Scripts\python control-plane\ignition\ignition_sequence.py" -ForegroundColor White
