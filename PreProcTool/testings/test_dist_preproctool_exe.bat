@echo off
cd "..\build\dist\preproctool\"
preproctool.exe -p ..\..\..\..\..\test_project_file.xml -o ..\..\..\..\..\sample_output %*
pause