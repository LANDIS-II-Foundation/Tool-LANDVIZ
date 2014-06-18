@echo off
echo ==============================
echo build landis2 vis webvis tool
echo ==============================
echo combine single js files ...
set srcfolder=..\source\js
set destfolder=dist\js
if not exist %destfolder% mkdir %destfolder%
copy/b %srcfolder%\landis-settings.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-metadata.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-map-main.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-chart-main.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-time-control.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-scenario-selector.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-map-selector.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-chart-selector.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-map-group.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-map-legend.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-chart-flot-instance.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-map-ol3-instance.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-main-pubsub.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-main.js %destfolder%\landis.js
copy/b %destfolder%\landis.js + %srcfolder%\landis-main-events.js %destfolder%\landis.js
copy %srcfolder%\landis-utils.js %destfolder%\landis-utils.js
echo ==============================
echo minify js file with YUI compressor ...
java -jar yuicompressor-2.4.8.jar --type js --charset utf-8 -o %destfolder%\landis.min.js %destfolder%\landis.js
echo ==============================
echo combine single css files ...
set srcfolder=..\source\css
set destfolder=dist\css
if not exist %destfolder% mkdir %destfolder%
copy/y %srcfolder%\landis-time-control.css %destfolder%\landis.css
copy/b %destfolder%\landis.css + %srcfolder%\landis-scenario-selector.css %destfolder%\landis.css
copy/b %destfolder%\landis.css + %srcfolder%\landis-map-selector.css %destfolder%\landis.css
copy/b %destfolder%\landis.css + %srcfolder%\landis-chart-selector.css %destfolder%\landis.css
copy/b %destfolder%\landis.css + %srcfolder%\landis-map-group.css %destfolder%\landis.css
copy/b %destfolder%\landis.css + %srcfolder%\landis-map-legend.css %destfolder%\landis.css
copy/b %destfolder%\landis.css + %srcfolder%\landis-chart.css %destfolder%\landis.css
copy %srcfolder%\layout.css %destfolder%\layout.css
echo ==============================
echo minify js file with YUI compressor ...
java -jar yuicompressor-2.4.8.jar --type css --charset utf-8 -o %destfolder%\landis.min.css %destfolder%\landis.css
echo ==============================
set srcfolder=..\source
set destfolder=dist
echo copy index.min file and rename it to index ...
copy /y %srcfolder%\index.min.html %destfolder%\index.html
echo ==============================
echo copy config folder ... 
robocopy "%srcfolder%\config" "%destfolder%\config" /MIR /NFL /NDL /NP /NJH /NJS
echo ==============================
echo copy img folder ... 
robocopy "%srcfolder%\img" "%destfolder%\img" /MIR /NFL /NDL /NP /NJH /NJS
echo ==============================
set srcfolder=..\source\lib
set destfolder=dist\lib
echo copy libraries ...
echo jquery ...
robocopy "%srcfolder%\jquery" "%destfolder%\jquery" /MIR /NFL /NDL /NP /NJH /NJS

echo jquery-ui ... 
robocopy "%srcfolder%\jquery-ui" "%destfolder%\jquery-ui" /MIR /NFL /NDL /NP /NJH /NJS

echo colorbrewer ...
robocopy "%srcfolder%\colorbrewer" "%destfolder%\colorbrewer" /MIR /NFL /NDL /NP /NJH /NJS

echo jquery-fullscreen ...
robocopy "%srcfolder%\jquery-fullscreen" "%destfolder%\jquery-fullscreen" /MIR /NFL /NDL /NP /NJH /NJS

echo jquery-parse ...
robocopy "%srcfolder%\jquery-parse" "%destfolder%\jquery-parse" "jquery.parse.js" /MIR /NFL /NDL /NP /NJH /NJS

echo jquery-pubsub ...
robocopy "%srcfolder%\jquery-pubsub" "%destfolder%\jquery-pubsub" "jquery.pubsub.js" /MIR /NFL /NDL /NP /NJH /NJS

echo jquery-color ...
robocopy "%srcfolder%\jquery-color" "%destfolder%\jquery-color" /MIR /NFL /NDL /NP /NJH /NJS

echo jquery-timer ...
robocopy "%srcfolder%\jquery-timer" "%destfolder%\jquery-timer" /MIR /NFL /NDL /NP /NJH /NJS

echo jquery-dropdown ...
robocopy "%srcfolder%\jquery-dropdown" "%destfolder%\jquery-dropdown" "jquery.dropdown.css"  /MIR /NFL /NDL /NP /NJH /NJS
robocopy "%srcfolder%\jquery-dropdown" "%destfolder%\jquery-dropdown" "jquery.dropdown.js"  /MIR /NFL /NDL /NP /NJH /NJS

echo flot ...
robocopy "%srcfolder%\flot" "%destfolder%\flot" "jquery.flot.js" /MIR /NFL /NDL /NP /NJH /NJS
robocopy "%srcfolder%\flot" "%destfolder%\flot" "jquery.flot.crosshair.time.js" /MIR /NFL /NDL /NP /NJH /NJS
robocopy "%srcfolder%\flot" "%destfolder%\flot" "jquery.flot.axislabels.js" /MIR /NFL /NDL /NP /NJH /NJS
robocopy "%srcfolder%\flot" "%destfolder%\flot" "jquery.flot.resize.js" /MIR /NFL /NDL /NP /NJH /NJS

echo farbtastic ...
robocopy "%srcfolder%\farbtastic" "%destfolder%\farbtastic" /MIR /NFL /NDL /NP /NJH /NJS

echo ol3 ...
robocopy "%srcfolder%\ol3" "%destfolder%\ol3" "ol.css" "ol-whitespace.js" /MIR /NFL /NDL /NP /NJH /NJS


echo ==============================
echo copy start-landis-vis-local.exe ...
copy ..\localenv\dist\start-landis-vis-local.exe dist\start-landis-vis-local.exe
echo ==============================
pause