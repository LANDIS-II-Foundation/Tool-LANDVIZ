@echo off
echo ==============================
echo build landis2 vis preproc tool
echo ==============================
echo run pyinstaller ...
python pyinstaller\pyinstaller.py ..\source\main.py  --workpath=build -y --clean --name=PreProcTool --hidden-import=scipy.special._ufuncs_cxx %*
:--log-level=WARN
:--distpath=..\dist
echo ==============================
echo copy config folder ...
robocopy "..\source\config" "dist\preproctool\config" /MIR /NFL /NDL /NP /NJH /NJS
echo ==============================
echo copy web base folder ...
robocopy "..\..\WebVisTool\build\dist" "dist\preproctool\webbase" /MIR /NFL /NDL /NP /NJH /NJS
echo ==============================
echo copy gdal-data ...
robocopy "gdal-data" "dist\preproctool\gdal-data" /NFL /NDL /NP /NJH /NJS
echo ==============================
pause