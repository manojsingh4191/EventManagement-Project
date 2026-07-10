$root = Split-Path -Parent $MyInvocation.MyCommand.Path

$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

function Start-DevProcess {
  param (
    [string]$WorkingDirectory,
    [string]$Command,
    [string]$Title
  )

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo.FileName = "cmd.exe"
  $process.StartInfo.Arguments = "/k title $Title && cd /d `"$WorkingDirectory`" && $Command"
  $process.StartInfo.UseShellExecute = $true
  $process.StartInfo.CreateNoWindow = $false

  [void]$process.Start()
}

Start-DevProcess -WorkingDirectory $backend -Command "npm.cmd run dev" -Title "EventFlow Backend"
Start-DevProcess -WorkingDirectory $frontend -Command "npm.cmd run dev -- --host 127.0.0.1" -Title "EventFlow Frontend"

Write-Host "Backend:  http://127.0.0.1:5000/api/status"
Write-Host "Frontend: http://127.0.0.1:5173/"
