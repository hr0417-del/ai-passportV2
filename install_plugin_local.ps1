$zipPath = "C:\Users\HP\Downloads\obs-backgroundremoval-1.3.7-windows-x64.zip"
$tempExt = "$env:TEMP\obs_bg_extract"

Write-Output "Extracting zip..."
if (Test-Path $tempExt) { Remove-Item -Recurse -Force $tempExt }
Expand-Archive -Path $zipPath -DestinationPath $tempExt -Force

$targetDir = "$env:APPDATA\obs-studio\plugins\obs-backgroundremoval"
Write-Output "Creating target dir: $targetDir"
if (Test-Path $targetDir) { Remove-Item -Recurse -Force $targetDir }
New-Item -ItemType Directory -Force -Path "$targetDir\bin\64bit" | Out-Null
New-Item -ItemType Directory -Force -Path "$targetDir\data" | Out-Null

Write-Output "Moving files..."
Copy-Item -Recurse -Force "$tempExt\obs-plugins\64bit\*" "$targetDir\bin\64bit\"
Copy-Item -Recurse -Force "$tempExt\data\obs-plugins\obs-backgroundremoval\*" "$targetDir\data\"

Write-Output "Cleaning up..."
Remove-Item -Recurse -Force $tempExt
Write-Output "DONE!"
