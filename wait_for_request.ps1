# Wait for request.json to appear
Write-Host "Voxel Worker: Waiting for request..."
while (-not (Test-Path "_bridge/request.json")) {
    Start-Sleep -Milliseconds 500
}
Write-Host "Voxel Worker: Request detected!"
Get-Content "_bridge/request.json" -Raw
