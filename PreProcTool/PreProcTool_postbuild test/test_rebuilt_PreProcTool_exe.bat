@echo off
cd "..\build\dist\preproctool\"
preproctool.exe -p ..\example\PreProcTool_example.xml -o post-build_sample_output %*
pause
