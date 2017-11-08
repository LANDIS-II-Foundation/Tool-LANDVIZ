@echo off
echo ==============================
echo build PreProcTool
echo ==============================
echo run pyinstaller ...
pyinstaller PreProcTool.spec %*
:--log-level=WARN
:--distpath=..\dist
pause
