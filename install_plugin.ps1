$url = "https://github.com/royshil/obs-backgroundremoval/releases/download/1.3.5/obs-backgroundremoval-1.3.5-windows-installer.exe"
$dest = Join-Path $env:TEMP "obs-backgroundremoval-installer.exe"
Write-Output "Downloading from $url to $dest"
Invoke-WebRequest -Uri $url -OutFile $dest
if (Test-Path $dest) {
    Write-Output "Launching Installer... Please check for a popup and click Next!"
    Start-Process -FilePath $dest
} else {
    Write-Output "Failed to download."
}
