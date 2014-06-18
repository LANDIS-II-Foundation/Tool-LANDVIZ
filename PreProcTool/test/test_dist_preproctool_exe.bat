@echo off
cd "..\build\dist\preproctool\"
preproctool.exe -p ..\..\..\SampleData\preproc_sample_project_dev.xml -o ..\..\..\sample_output %*
pause