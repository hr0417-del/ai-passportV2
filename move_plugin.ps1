if (-not (Test-Path "$env:APPDATA\obs-studio\plugins")) {
    New-Item -ItemType Directory -Force -Path "$env:APPDATA\obs-studio\plugins"
}
Move-Item -Path "$env:TEMP\obs_test\obs-backgroundremoval" -Destination "$env:APPDATA\obs-studio\plugins\" -Force
Write-Output "Plugin installed to AppData successfully!"
