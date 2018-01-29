@echo off
cd "..\dist\preproctool\"
preproctool.exe -p "..\..\test\example_project\preproc_VizTool_example.xml" -o "..\..\test\sample_output" %*
pause