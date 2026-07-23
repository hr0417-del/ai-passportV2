$desktop = "$env:USERPROFILE\Desktop\OBS_FIX"
if (Test-Path $desktop) { Remove-Item -Recurse -Force $desktop }
New-Item -ItemType Directory -Force -Path "$desktop\obs-plugins\64bit" | Out-Null
New-Item -ItemType Directory -Force -Path "$desktop\data\obs-plugins\obs-backgroundremoval" | Out-Null
Copy-Item -Path "$env:APPDATA\obs-studio\plugins\obs-backgroundremoval\bin\64bit\obs-backgroundremoval.dll" -Destination "$desktop\obs-plugins\64bit\" -Force
Copy-Item -Path "$env:APPDATA\obs-studio\plugins\obs-backgroundremoval\data\*" -Destination "$desktop\data\obs-plugins\obs-backgroundremoval\" -Recurse -Force
