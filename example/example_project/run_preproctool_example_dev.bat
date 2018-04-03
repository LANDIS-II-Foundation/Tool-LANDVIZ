@echo off
cd "..\..\deploy\dist\preproctool\"
preproctool.exe -p ..\..\..\example\example_project\preproc_VizTool_example.xml -o ..\..\..\exmaple\example_project\sample_output %*
pause

 