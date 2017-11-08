Title:			README Rebuild PreProcTool Info
Project:		LANDIS-II Landscape Change Model
Project Component:	LANDVIZ
Component Deposition:	https://github.com/LANDIS-II-Foundation/LANDVIZ
Author:			LANDIS-II Foundation
Origin Date:		21 Feb 2017
Final Date:		07 Nov 2017


This document outlines the process of rebuilding the PreProcTool for LANDVIZ. 
The PreProcTool, which includes PreProcTool.exe, Proj4Extent.exe, and a host of 
*.pyd files,  and *.dll files, is responsible for extracting and processing the 
data output from LANDIS-II simulation runs through the metadata catlogued in a .xml file. 

It is the output of PreProcTool, a set of files and directories, that constitutes LANDVIZ. The set
of files constituting LANDVIZ includes the executable, 'start-landis-vis-local.exe' 
(ie, the WebVizTool). WebVizTool provides the GUI interface of LANDVIZ.


A multi-step process is required if there have been changes to the Python code in 
LANDVIZ/PreProcTool/src or changes to ; namely,
	1) installation of 32-bit Python, pip, and 11 additional Python packages, including
	   PyInstaller
	2) re-build of the WebVizTool (ONLY if changes have been made in the Python code that affects
	   this tool)
	3) a pre-build check of PreProcTool is made on the new Python code 
	4) PyInstaller is used to rebuild PreProcTool.exe, Proj4Extent.exe, and a host of 
	   *.pyd files,  and *.dll files
	5) a post-build check is made on the re-built PreProcTool 
	6) an installer program (Advanced Installer Project) is used to generate an installer. The
	   installer technically installs the PreProcTool, Proj4Extent, and a host of .pyd files 
	   and .dll files. When executed with appropriate metadata and an appropriate .xml file 
	   that catalogues those metadata, this set of files will generate "LANDVIZ": another set of 
	   processed files and an executable for the LANDVIZ GUI. The installer is perhaps
	   confusingly, named "LANDVIZ".
	    
The process outlined below refers to Steps 2 through Step 6 above. Interested users also should 
consult the document, "PreProcTool_BuildFixes _20170216.docx."

Once Step 6 above is complete, a test of the newly-rebuilt and installed PreProcTool is performed.
Again, the installer installs "LANDVIZ" even though the content of the installer is PreProcTool.exe,
Proj4Extent.exe, and a host of *.pyd files,  and *.dll files.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
			websites
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
The following websites may be useful when attempting a rebuild of PreProcTool:

setting Path Variables (Windows 10):
	==> http://www.computerhope.com/issues/ch000549.htm


find LANDVIZ Python dependencies:
	==> http://www.lfd.uci.edu/~gohlke/pythonlibs


30-day trial of AdvancedInstaller (create .msi installers):
	==> http://www.advancedinstaller.com/download.html


about CherryPy:
	==> http://cherrypy.org/


upgrading pip:
	==> https://pip.pypa.io/en/stable/installing/#upgrading-pip

C:\Users\..\Desktop>python -m pip install -U pip


about Pyinstaller .spec files:
	==> https://pythonhosted.org/PyInstaller/spec-files.html
	==> http://stackoverflow.com/questions/19546493/how-can-i-make-pyinstallers-spec-files-actually-portable-woes-absolute-path
	==> https://github.com/pyinstaller/pyinstaller/blob/develop/PyInstaller/building/build_main.py#L123




%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
		STEP1: Installation of required Python packages
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

Re-building the PreProcTool requires Python 2.7.13 (32-bit) plus a host of 32-bit Python packages:

CherryPy-10.1.0-py2.py3-none-any.whl   PyInstaller-3.2.1-py2.py3-none-any.whl
GDAL-2.1.3-cp27-cp27m-win32.whl        pywin32-220.1-cp27-cp27m-win32.whl
lxml-3.7.2-cp27-cp27m-win32.whl        PyYAML-3.12-cp27-cp27m-win32.whl
numpy-1.12.0+mkl-cp27-cp27m-win32.whl  regex-2017.2.8-cp27-cp27m-win32.whl
pefile-2016.3.28-py2.py3-none-any.whl  scipy-0.18.1-cp27-cp27m-win32.whl
Pillow-4.0.0-cp27-cp27m-win32.whl

NB. These packages must be installed in the order given below, starting with 
Python 2.7.13 (32-bit) and the latest version of pip

NB. All the required packages (except for Python itself and pip) are located in 
\LANDVIZ\PreProcTool\Pyinstaller_PythonDependencies_whl_files\32bit. If need to reload these,
(as wheel packages) go here:
		==> http://www.lfd.uci.edu/~gohlke/pythonlibs/







	a. Install Python 2.7.13 (32-bit!!!) and pip 9.0.a pre-build check is made on the new Python code1:
		==> https://www.python.org/ftp/python/2.7.13/python-2.7.13.msi

	b1. Make sure that Path Variable (in systems variables; Windows) is set correctly for Python27 directories.
	  This is important in case other Pythons (like Anaconda) are installed.
		==> Win+X, Y
			==> Systems Info ==> Advanced System Settings ==>
				==> Environmental Variables...==> System variables box ==> Edit Path
		==> add C:\Python27; C:\Python27\Scripts and C:\Python27\Lib
		==> http://www.computerhope.com/issues/ch000549.htm


	b2. Check that the correct versions of Python and pip are installed

C:\Users\..\Desktop>python
Python 2.7.13 (v2.7.13:a06454b1afa1, Dec 17 2016, 20:42:59) [MSC v.1500 32 bit (Intel)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> Ctrl-C			<<exit python

C:\Users\..\Desktop>pip --version
pip 9.0.1 from c:\python27\lib\site-packages (python 2.7)



	
	c. Install the wheel packages IN THIS ORDER by running the command,  "pip install <name.whl>"
	   after changing to this dorectpry:
		==> C:\Users\..\Pyinstaller-plus-PythonDependencies\32bit>pip install <name.whl>

	   NB. CherryPy-10.1.0-py2.py3-none-any.whl will throw exceptions; run 2x!!
	
	c1. The sequence of installed packages along with the expected console output:

		==> GDAL-2.1.3-cp27‑cp27m-win32.whl
			Installing collected packages: GDAL				<<expected output
			Successfully installed GDAL-2.1.3
		==> numpy-1.12.0+mkl-cp27-cp27m-win32.whl
			Installing collected packages: numpy				<<expected output
			Successfully installed numpy-1.12.0+mkl
		==> scipy-0.18.1-cp27-cp27m-win32.whl
			Installing collected packages: scipy				<<expected output
			Successfully installed scipy-0.18.1
		==> lxml-3.7.2-cp27-cp27m-win32.whl
			Installing collected packages: lxml				<<expected output
			Successfully installed lxml-3.7.2
		==> PyYAML-3.12-cp27-cp27m-win32.whl
			Installing collected packages: PyYAML				<<expected output
			Successfully installed PyYAML-3.12
		==> regex-2017.2.8-cp27-cp27m‑win32.whl
			Installing collected packages: regex				<<expected output
			Successfully installed regex-2017.2.8
		==> Pillow-4.0.0-cp27-cp27m-win32.whl
			Collecting olefile (from Pillow==4.0.0)				<<expected output
  			Downloading olefile-0.44.zip (74kB)
    			100% |################################| 81kB 718kB/s
			Installing collected packages: olefile, Pillow
  			Running setup.py install for olefile ... done
			Successfully installed Pillow-4.0.0 olefile-0.44
		==> pywin32-220.1-cp27-cp27m-win32.whl
			Installing collected packages: pywin32				<<expected output
			Successfully installed pywin32-220.1
		==> pefile-2016.3.28-py2.py3-none-any.whl
			Collecting future (from pefile==2016.3.28)			<<expected output
  			Downloading future-0.16.0.tar.gz (824kB)
    			100% |################################| 829kB 1.3MB/s
			Installing collected packages: future, pefile
  			Running setup.py install for future ... done
			Successfully installed future-0.16.0 pefile-2016.3.28
		==> PyInstaller-3.2.1-py2.py3-none-any.whl
			Requirement already satisfied: setuptools in c:\python27\lib\site-packages (from PyInstaller==3.2.1)	<<expected output
			Requirement already satisfied: future in c:\python27\lib\site-packages (from PyInstaller==3.2.1)
			Installing collected packages: PyInstallertest of the newly-rebuilt and installed PreProcTool
			Successfully installed PyInstaller-3.2.1

		==> CherryPy-10.1.0-py2.py3-none-any.whl	<NB. 1x get errors
Processing c:\users\bdmarron\desktop\landviz\landviz\preproctool\deploy\build_preproctool\pyinstaller-plus-pythondependencies\32bit\cherrypy-10.1.0-py2.py3-none-any.whl
Collecting pypiwin32; sys_platform == "win32" (from CherryPy==10.1.0)
  Downloading pypiwin32-219-cp27-none-win32.whl (6.7MB)
    100% |################################| 6.7MB 223kB/s
Collecting cheroot>=5.1.0 (from CherryPy==10.1.0)
  Downloading cheroot-5.8.3-py2.py3-none-any.whl (65kB)
    100% |################################| 71kB 4.8MB/s
Collecting portend>=1.6.1 (from CherryPy==10.1.0)
  Downloading portend-2.2-py2.py3-none-any.whl
Collecting six (from CherryPy==10.1.0)
  Downloading six-1.11.0-py2.py3-none-any.whl
Collecting tempora>=1.8 (from portend>=1.6.1->CherryPy==10.1.0)
  Downloading tempora-1.9-py2.py3-none-any.whl
Collecting pytz (from tempora>=1.8->portend>=1.6.1->CherryPy==10.1.0)
  Downloading pytz-2017.3-py2.py3-none-any.whl (511kB)
    100% |################################| 512kB 2.0MB/s
Installing collected packages: pypiwin32, six, cheroot, pytz, tempora, portend, CherryPy
Exception:
Traceback (most recent call last):
  File "c:\python27\lib\site-packages\pip\basecommand.py", line 215, in main
    status = self.run(options, args)
  File "c:\python27\lib\site-packages\pip\commands\install.py", line 342, in run
    prefix=options.prefix_path,
  File "c:\python27\lib\site-packages\pip\req\req_set.py", line 784, in install
    **kwargs
  File "c:\python27\lib\site-packages\pip\req\req_install.py", line 851, in install
    self.move_wheel_files(self.source_dir, root=root, prefix=prefix)
  File "c:\python27\lib\site-packages\pip\req\req_install.py", line 1064, in move_wheel_files
    isolated=self.isolated,
  File "c:\python27\lib\site-packages\pip\wheel.py", line 345, in move_wheel_files
    clobber(source, lib_dir, True)
  File "c:\python27\lib\site-packages\pip\wheel.py", line 323, in clobber
    shutil.copyfile(srcfile, destfile)
  File "c:\python27\lib\shutil.py", line 83, in copyfile
    with open(dst, 'wb') as fdst:
IOError: [Errno 13] Permission denied: 'c:\\python27\\Lib\\site-packages\\win32\\win32api.pyd'


		==> CherryPy-10.1.0-py2.py3-none-any.whl	<<NB. 2x it works!!
Processing c:\users\bdmarron\desktop\landviz\landviz\preproctool\deploy\build_preproctool\pyinstaller-plus-pythondependencies\32bit\cherrypy-10.1.0-py2.py3-none-any.whl
Requirement already satisfied: pypiwin32; sys_platform == "win32" in c:\python27\lib\site-packages (from CherryPy==10.1.0)
Collecting cheroot>=5.1.0 (from CherryPy==10.1.0)
  Using cached cheroot-5.8.3-py2.py3-none-any.whl
Collecting portend>=1.6.1 (from CherryPy==10.1.0)
  Using cached portend-2.2-py2.py3-none-any.whl
Collecting six (from CherryPy==10.1.0)
  Using cached six-1.11.0-py2.py3-none-any.whl
Collecting tempora>=1.8 (from portend>=1.6.1->CherryPy==10.1.0)
  Using cached tempora-1.9-py2.py3-none-any.whl
Collecting pytz (from tempora>=1.8->portend>=1.6.1->CherryPy==10.1.0)
  Using cached pytz-2017.3-py2.py3-none-any.whl
Installing collected packages: six, cheroot, pytz, tempora, portend, CherryPy
Successfully installed CherryPy-10.1.0 cheroot-5.8.3 portend-2.2 pytz-2017.3 six-1.11.0 tempora-1.9

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	STEP2: Rebuild the WebVizTool, if needed
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	d. run the following batch file, \LANDVIZ\WebVisTool\localenv\build_start-landis-vis-local.bat

	d1. this creates a new, start-landis-vis-local.exe found at
\LANDVIZ\WebVisTool\localenv\dist\start-landis-vis-local.exe



	e. run the following batch file, \LANDVIZ\WebVisTool\build\build-landis-webbase.bat

	e1. this adds the newly built "start-landis-vis-local.exe" to the \LANDVIZ\WebVisTool\build\dist
folder. The files in this folder are called by PreProcTool.spec and are included in the PreProcTool set
of files for the LANDVIZ installation. 

	NB. The call in PreProcTool.spec to pull in all of the files from \LANDVIZ\WebVisTool\build\dist:
 
LINE 9        datas=[( 'src\\config', 'config' ), ( '..\\WebVisTool\\build\\dist', 'webbase' )],



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	STEP3: Run a pre-build check on the modified Python code
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%


	f. run a Python pre-build test on the new/modified Python code for PreProcTool BEFORE building
	   the PreProcTool.

	f1. Option1: Can use LANDVIZ/PreProcTool/PreProcTool_prebuild_test/test_src_main_py.bat
	    (click to highlight the .bat file and hit 'Enter')
	   OR
	f2. Option 2: Can run the following command line code after changing to the following directory in the 
	   LANDVIZ folder (presumably on your desktop)

cd \LANDVIZ\PreProcTool\PreProcTool_prebuild_test
>python ..\src\main.py -p ..\example\PreProcTool_example.xml -o sample_output


	f3. the expected screen output
.....
End prepairing Map Output [time: 95.8899998665 sec]
Save Metadata as JSON files
Copy webbase to output directory
Update web settings file
End of LANDIS-II PreProcTool.
Press any key to continue . . .

	f4. the expected folder/files outputs are in a new directory, /sample_output
	    NB. This ouput is considered to be the "WebVizTool", it is EXACTLY the same output that
	   is found in 
		==> \LANDVIZ\WebVisTool\build\dist
		==> \LANDVIZ\WebVisTool\source

Directory of \LANDVIZ\PreProcTool\PreProcTool_prebuild_test\sample_output
11/02/2017  11:25 AM    <DIR>          .
11/02/2017  11:25 AM    <DIR>          ..
11/02/2017  11:24 AM    <DIR>          config
11/02/2017  11:24 AM    <DIR>          css
11/02/2017  11:24 AM    <DIR>          img
10/10/2017  05:20 PM             2,602 index.html
11/02/2017  11:24 AM    <DIR>          js
11/02/2017  11:23 AM    <DIR>          landisdata
11/02/2017  11:25 AM    <DIR>          lib
10/10/2017  05:20 PM         5,088,153 start-landis-vis-local.exe

	f5. NB. When run the PreProcTool it reconstructs this set of files SPECIFIC to the project
	    data given in the .xml file


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	STEP4: Use PyInstaller to rebuild PreProcTool.exe, Proj4Extent.exe, and collect a host of 
	       *.pyd files,  and *.dll files; individual component checks are run first;
	       contents of all .bat files and .spec files are given for reference
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

	g. Individual (separate) re-builds of PreProcTool and Proj4Extent for testing/checking purposes 

	g1. Option1: run individual checks on PreProcTool and Proj4Extent with the following commands
	    (run from C:\Users\<your_user_name>\Desktop\LANDVIZ\LANDVIZ\PreProcTool)

pyinstaller --onefile --workpath=build -y --clean --name=Proj4Extent --distpath=dist\Proj4Extent src\Proj4Extent.py
pyinstaller --onefile --workpath=build -y --clean --name=PreProcTool --distpath=dist\PreProcTool src\main.py

	OR

	g2. Option2: run the following two (2) batch files
		==> build_PreProcTool.bat
		==> build_Proj4Extent.bat 



	h. Combined (joint) re-build of PreProcTool and Proj4Extent

	h1. Run "build_PreProcTool_and_Proj4Extent.bat" 

	h2. Note that "build_PreProcTool_and_Proj4Extent.bat" has two, (2) PyInstaller commands:
		==> pyinstaller PreProcTool.spec --log-level=WARN --distpath=..\dist
		==> pyinstaller --onefile --workpath=build -y --clean --name=Proj4Extent --distpath=dist\PreProcTool src\Proj4Extent.py %*
	    NB. The first PyInstaller coomand uses a .spec file to build the PreProcTool, the second
	    PyInstaller command uses a commandline call to build Proj4Extent and place it in the
	    correct folder (ie dist\PreProcTool

	h3. Important: DO NOT MOVE OR DELETE OR MODIFY the files: "PreProcTool.spec" and "Proj4Extent.spec"
	    These .spec files call pyinstaller and do the individual rebuilds. They tell PyInstaller how to 
	    process a script. The spec file is actually executable Python code. There are specific
	    calls to specific paths in the directory.


	h4. expected console output from running "build_PreProcTool_and_Proj4Extent.bat" (abbreviated)
==============================
build PreProcTool
==============================
run pyinstaller ...
74 INFO: PyInstaller: 3.2.1
74 INFO: Python: 2.7.13
75 INFO: Platform: Windows-10-10.0.15063
......
14073 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9279)
21934 INFO: Building COLLECT out00-COLLECT.toc completed successfully.
==============================
build Proj4Extent
==============================
run pyinstaller...
72 INFO: PyInstaller: 3.2.1
72 INFO: Python: 2.7.13
72 INFO: Platform: Windows-10-10.0.15063
75 INFO: wrote C:\Users\bdmarron\Desktop\my_LANDVIZ\LANDVIZ\PreProcTool\Proj4Extent.spec
..............
20759 INFO: checking EXE
20759 INFO: Building EXE because out00-EXE.toc is non existent
20759 INFO: Building EXE from out00-EXE.toc
20760 INFO: Appending archive to EXE dist\PreProcTool\Proj4Extent.exe
21269 INFO: Building EXE from out00-EXE.toc completed successfully.
==============================
Press any key to continue . . .


	h5. expected output from running "build_PreProcTool_and_Proj4Extent.bat" will be two (2)
	    folders: 
		==> \LANDVIZ\PreProcTool\build
		==> \LANDVIZ\PreProcTool\dist

	h6. The folder \LANDVIZ\PreProcTool\dist will contain about 116 items and consistutes the 
	    set of files to be installed as LANDVIZ

	NB. Because distributions change slightly, there are examples of \LANDVIZ\PreProcTool\build 
	    and of \LANDVIZ\PreProcTool\dist for reference; namely,
		==> \LANDVIZ\PreProcTool\Example_PyInstallerOutput_build
		==> \LANDVIZ\PreProcTool\Example_PyInstallerOutput_dist

	NB. Compared to JLiem's rebuild in Feb 2017 the rebuild in Nov 2017 (w/o Python code changes)
	    had these differences:

		not present in Nov 2017 build
			scipy.linalg._cblas.pyd
			scipy.linalg._clapack.pyd


		new to the Nov 2017 rebuild
			win32com.shell.shell.pyd
			win32wnet.pyd



	i. Contents of all .bat and .spec files (for reference)

	i1. Contents of all .bat files

build_PreProcTool.bat ==>
====================================================
@echo off
echo ==============================
echo build PreProcTool
echo ==============================
echo run pyinstaller ...
pyinstaller PreProcTool.spec %*
:--log-level=WARN
:--distpath=..\dist
pause
=================================================



build_Proj4Extent.bat ==>
============================================================
@echo off
echo ==============================
echo build Proj4Extent
echo ==============================
echo run pyinstaller...
pyinstaller Proj4Extent.spec %*test of the newly-rebuilt and installed PreProcTool
:--log-level=WARN
:--distpath=dist\PreProcTool
echo ==============================
pause
===============================================================




build_PreProcTool_and_Proj4Extent.bat ==>
==========================================================================================
@echo off
echo ==============================
echo build PreProcTool
echo ==============================
echo run pyinstaller ...
pyinstaller PreProcTool.spec %*
:--log-level=WARN
:--distpath=..\dist
echo ==============================
echo build Proj4Extent
echo ==============================
echo run pyinstaller...
pyinstaller --onefile --workpath=build -y --clean --name=Proj4Extent --distpath=dist\PreProcTool src\Proj4Extent.py %*
echo ==============================
pause
=============================================================================================




	i2. Contents of all .spec files

PreProcTool.spec ==>
===========================================================================================
# -*- mode: python -*-

block_cipher = None


a = Analysis(['src\\main.py'],
             pathex=['src'],
             binaries=[],
             datas=[( 'src\\config', 'config' ), ( '..\\WebVisTool\\build\\dist', 'webbase' )],
             hiddenimports=['scipy.special._ufuncs_cxx'],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          exclude_binaries=True,
	  name='PreProcTool',
	  debug=False,
	  strip=False,
	  upx=True,
	  console=True )
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               name='PreProcTool')
==============================================================================================




Proj4Extent.spec ==>
===========================================================================================
# -*- mode: python -*-

block_cipher = None


a = Analysis(['src\\Proj4Extent.py'],
             pathex=['C:\\Users\\bdmarron\\Desktop\\my_LANDVIZ\\LANDVIZ\\PreProcTool'],
             binaries=[],
             datas=[],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='Proj4Extent',
          debug=False,
          strip=False,
          upx=True,
          console=True )
===========================================================================================



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	STEP5: a post-build check is made on the re-built PreProcTool 
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%



	j. run the batch file,
	   \LANDVIZ\PreProcTool\PreProcTool_postbuild test\test_rebuilt_PreProcTool_exe.bat

	j1. The output should be a folder, 'post-build_sample_output' that will contain EXACTLY
	    the same files and contents as the folders,
		'Example_pre-build_sample_output'
		'Example_post-build_sample_output'

	j2. NB. All of the pre-build and post build tests use the same example data which are found
	    at  \LANDVIZ\PreProcTool\example. This provides a direct, internal cross-check.




%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
	STEP6: an installer program (Advanced Installer Project) is used to 
	   generate a "LANDVIZ" installer
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

There is 30-day free trial for the Advanced Installer 
https://www.advancedinstaller.com/downloading.html
https://www.advancedinstaller.com/user-guide/tutorials.html

Advanced Installer installed here:
C:\Program Files (x86)\Caphyon\Advanced Installer 14.4\



	k. Download and install the Advanced Installer

	l. Launch Advanced Installer and open 'LandisPreProcToolInstaller_BM.aip'

	m. Under Product Information (left-hand column) check the info under each icon (ie, 
	   Product Detasils, Upgrades, Files and Folders, etc.)

	m1. What is happening here is that Advanced Installer is building the installer from all of
	    the files in \LANDVIZ\PreProcTool\dist\PreProcTool\. These files are now listed by
	    Advanced Installer when click on the icon, 'Files and Folders' (left-hand column).

	m2. NB. If you try opening 'LandisPreProcToolInstaller.aip' (found in 
	    \LANDVIZ\LANDVIZ_deploy\past_releases) in Advanced Installer, you will see the same 
	    set of files listed by Files and Folders as in 'LandisPreProcToolInstaller_BM.aip' 
	    BUT they will have question marks inside the folder icon. This is because the entire
	    LANDVIZ repo has been reconfigured and the .api cannot locate the files.

	m3. LandisPreProcToolInstaller_BM.aip defines a Generic, Simple installer type.

	n. If there have been Python code changes you should update the 'Version: number' (found under
	   the Product Details icon)

	n1. NB. So long as there are no changes to the directory structure of the repo, performing 
	    Step 1 through Step 6 above will automatically put the (freshly re-built) files 
	    into \LANDVIZ\PreProcTool\dist\PreProcTool\ and 'LandisPreProcToolInstaller_BM.aip' will
	    automatically load them.

	o. Once you are sure that the new files have been loaded by the installer and have changed
	   the Version number, select the 'Build icon in the toolbar to build the .msi installer.





%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
Test of the newly-rebuilt and installed "LANDVIZ"
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

Advanced Installer installs "LANDVIZ" here:
C:\Program Files (x86)\LANDIS-II\LandisPreProcTool

	a. Copy the folder, \LANDVIZ\PreProcTool\example to your desktop (ie outside of the 
	   LANDVIZ repo folder)

	b. Run the batch file, 'run_PreProcTool_example.bat' which will run the PreProcTool on 
	   the stock example originally included in the repo. The output will be a "LANDVIZ", a set 
	   of files in the folder, LANDVIZ_Example. If the Python code changes are successful, you
	   should be able run 'start-landis-vis-local.exe' and voila! LANDVIZ is running in your
	   browser.



