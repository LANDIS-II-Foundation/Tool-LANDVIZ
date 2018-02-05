@echo off
echo ==============================
echo build landis2 vis local server
echo ==============================
echo run pyinstaller ...
pyinstaller start-landis-vis-local.py --onefile --distpath=dist --workpath=build -y --clean --name=start-landis-vis-local --log-level=WARN %*
echo ==============================
pause