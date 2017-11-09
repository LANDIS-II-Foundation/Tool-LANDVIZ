@echo off
echo ==============================
echo build PreProcTool
echo ==============================
echo run pyinstaller ...
pyinstaller PreProcTool.spec %*
:--log-level=WARN
:--distpath=..\dist
echo ==============================
echo build Proj4Extent
echo ==============================
echo run pyinstaller...
pyinstaller --onefile --workpath=build -y --clean --name=Proj4Extent --distpath=dist\PreProcTool src\Proj4Extent.py %*
echo ==============================
pause
