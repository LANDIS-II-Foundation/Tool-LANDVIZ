@echo off
echo ==============================
echo build Proj4Extent
echo ==============================
echo run pyinstaller...
pyinstaller Proj4Extent.spec %*
:--log-level=WARN
:--distpath=dist\PreProcTool
echo ==============================
pause
