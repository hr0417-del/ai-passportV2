@echo off
:: Check for Administrator privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting Administrator rights to fix your firewall...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

echo ===================================================
echo fixing Windows Firewall for DroidCam OBS (Port 4747)
echo ===================================================
echo.

:: Add TCP Rule
netsh advfirewall firewall add rule name="DroidCam OBS (TCP)" dir=in action=allow protocol=TCP localport=4747

:: Add UDP Rule
netsh advfirewall firewall add rule name="DroidCam OBS (UDP)" dir=in action=allow protocol=UDP localport=4747

echo.
echo ===================================================
echo SUCCESS! Your firewall is now allowing the video feed.
echo ===================================================
echo You can close this window now.
pause
