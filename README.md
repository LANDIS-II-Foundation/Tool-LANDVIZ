LANDVIZ (LANDIS-II-Visualization)
========================

Changes to this extension are governed by the [**Repository Rules**](https://sites.google.com/site/landismodel/developers/developers-blog/repositoryrulesfromthetechnicaladvisorycommittee) from the Technical Advisory Committee.

LANDIS-II Visualization Development

Documentaion: Documentation of the PreProcTool and the WebVisTool

PreProcTool: Development environment for the PrePrcoTool

WebWisTool: Development environment for the WebVisTool

<br></br>
<br></br>
## LANDVIZ v1.2

#### Updates 
* Added "Load" button (#22).
* Added "modal" to onload (#23) - Information showing on the modal is old.  It still needs to be updated.
* Added "Information" button for external web liks.  The user can add web links in XML (#24).
* Adjusted colors on graphs (#25).
* "Reset" button added (#26).

#### Notes
* #24 text and video needs to be reviewed and modified.
* Documentations need to be updated.

#### Testing
1. Download or clone the project and unzip.
2. Go to **_example/example\_project_** folder and open **_preproc\_VizTool\_example.xml_** file. The tag ```<weblinks></weblinks>``` is a new to this release.  Modify ```<link>``` applicable to your project.
```xml
<weblinks>
	<link label="LandViz" href="https://sites.google.com/site/landismodel/tools/viz-tool" />
	<link label="Dynamic Ecosystems &amp; Landscape Lab" href="https://sites.google.com/a/ncsu.edu/dynamic-ecosystems-landscape-lab" />
</weblinks>
```
The ```<weblinks>``` tag requires at least one ```<link>``` child node in order to run the application successfully. 
```xml
<weblinks>
	<link label="LandViz" href="https://sites.google.com/site/landismodel/tools/viz-tool" />
</weblinks>
```
3. Dobule click **_example/example\_project/run\_preproctool\_example.bat_** file.  The **"sample\_output"** file will be created after the successful run.
4. Double click **_sample_output/start-landis-vis-local.exe_**.  It will open **LANDVIZ-II-Visualization** webpage.



