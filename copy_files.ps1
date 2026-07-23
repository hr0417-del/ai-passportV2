$sourceDll = "$env:APPDATA\obs-studio\plugins\obs-backgroundremoval\bin\64bit\obs-backgroundremoval.dll"
$sourceDataDir = "$env:APPDATA\obs-studio\plugins\obs-backgroundremoval\data"
$destDllDir = "C:\Program Files\obs-studio\obs-plugins\64bit"
$destDataDir = "C:\Program Files\obs-studio\data\obs-plugins\obs-backgroundremoval"

if (!(Test-Path $destDataDir)) {
    New-Item -ItemType Directory -Force -Path $destDataDir
}
Copy-Item -Path $sourceDll -Destination $destDllDir -Force
Copy-Item -Path "$sourceDataDir\*" -Destination $destDataDir -Recurse -Force
