Title:			README Rebuild PreProcTool Info
Project:		LANDIS-II Landscape Change Model
Project Component:	LANDVIZ
Component Deposition:	https://github.com/LANDIS-II-Foundation/LANDVIZ
Author:			LANDIS-II Foundation
Origin Date:		21 Feb 2017
Final Date:		21 Feb 2017


This document outlines the process of rebuilding the PreProcTool for LANDVIZ. 
The PreProcTool, which includes PreProcTool.exe, Proj4Extent.exe, and a host of 
*.pyd files,  and *.dll files, is responsible for extracting and processing the 
data output from LANDISII simulation runs. It is the output of PreProcTool which 
creates the files and the directories for running the executable,  
'start-landis-vis-local.exe' (ie, WebVizTool). WebVizTool provides the GUI interface 
of LANDVIZ.


A multi-step process is required if changes to the Python code in LANDVIZ/PreProcTool/src
are required; namely,
	1) changes are made to the Python code, as needed (src directory)
	2) the new Python code is checked directly using the .bat file in /PreProcTool_prebuild_test
		==> test_source_main_py.bat
	3) the PyInstaller is used to rebuild PreProcTool.exe, Proj4Extent.exe, and a host of 
	   *.pyd files,  and *.dll files
	4) the newly built PreProcTool.exe is checked using the .bat file in /PreProcTool_postbuild_test
		==> test_dist_preproctool_exe.bat
	5) an installer program (Advanced Installer Project or InnoSetup) is used to 
	   generate a LANDVIZ installer


The process outlined below refers ONLY to Step 2 above, hereafter refered to as
"rebuild of PreProcTool." Interested users should also consult the document,
"PreProcTool_BuildFixes _20170216.docx."


The following websites may be useful when attempting a rebuild of PreProcTool.

##########
websites
############




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




######################
Rebuild of PreProcTool
#######################


	a. Install install Python 2.7.13 (32-bit!!!) and pip pip 9.0.1:
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



	c1. Download PyInstaller and its Python dependcies (as wheel packages) from this repo:
		==> http://www.lfd.uci.edu/~gohlke/pythonlibs/

	c2. Place the downloaded wheel packages in this directory
	C:\Users\..\..\LANDVIZ\PreProcTool\deploy\build_PreProcTool\Pyinstaller-plus-PythonDependencies\32bit>

	c3. Install the wheel packages IN THIS ORDER (run "pip install <name.whl>"
		==> C:\Users\..\Pyinstaller-plus-PythonDependencies\32bit>pip install <name.whl>
	   NB. CherryPy-10.1.0-py2.py3-none-any.whl will throw exceptions; run 2x!!
	

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
			Installing collected packages: PyInstaller
			Successfully installed PyInstaller-3.2.1

		==> CherryPy-10.1.0-py2.py3-none-any.whl	<<1x
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


		==> CherryPy-10.1.0-py2.py3-none-any.whl	<<2x
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



	d. run a Python pre-build test on the new/modified Python code for PreProcTool BEFORE building
	   the PreProcTool.
	d1. Option1: Can use LANDVIZ/PreProcTool/building_PreProcTool/PreProcTool_prebuild_test/test_source_main_py.bat
	    (click to highlight the .bat file and hit 'Enter')
	   OR
	d2. Option 2: Can run the following command line code after changing to the following directory in the 
	   LANDVIZ folder (presumably on your desktop)
cd C:\Users\<your user name>\Desktop\LANDVIZ\LANDVIZ\PreProcTool\PreProcTool_prebuild_test
>python ..\src\main.py -p ..\example\PreProcTool_example.xml -o sample_output


	d3. the expected screen output
.....
End prepairing Map Output [time: 95.8899998665 sec]
Save Metadata as JSON files
Copy webbase to output directory
Update web settings file
End of LANDIS-II PreProcTool.
Press any key to continue . . .

	d4. the expected folder/files outputs in /sample_output
	    NB. This is ouput is considered to be the "WebVizTool", it is exactly the same output that
	   is found in 
		==> C:\Users\bdmarron\Desktop\LANDVIZ\LANDVIZ\WebVisTool\build\dist
		==> C:\Users\bdmarron\Desktop\LANDVIZ\LANDVIZ\WebVisTool\source

Directory of C:\Users\bdmarron\Desktop\LANDVIZ\LANDVIZ\PreProcTool\PreProcTool_prebuild_test\sample_output
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



	e. PyInstaller re-build of PreProcTool and Proj4Extent 

	e1. If needed, can run individual checks on PreProcTool and Proj4Extent with the following commands
	    (run from C:\Users\<your_user_name>\Desktop\LANDVIZ\LANDVIZ\PreProcTool)

pyinstaller --onefile --workpath=build -y --clean --name=Proj4Extent --distpath=dist\Proj4Extent src\Proj4Extent.py
pyinstaller --onefile --workpath=build -y --clean --name=PreProcTool --distpath=dist\PreProcTool src\main.py

	e2. "build_PreProcTool_and_Proj4Extent.bat" has two, (2) PyInstaller commands:
		==> pyinstaller PreProcTool.spec --log-level=WARN --distpath=..\dist
		==> pyinstaller Proj4Extent.spec --log-level=WARN --distpath=..\dist

	e3. DO NOT MOVE OR DELETE these two files: PreProcTool.spec and Proj4Extent.spec!!!
	    These .spec files call pyinstaller and do the rebuilds. They tell PyInstaller how to 
	    process a script. It encodes the script; the spec file is actually executable Python code. 
	    PyInstaller builds the app by executing the contents of the spec file.
	    Note: pathex= is an optional list of paths to be searched before sys.path

	e4. Re-build BOTH PreProcTool and Proj4Extent 
	    by running "build_PreProcTool_and_Proj4Extent.bat


	e5. expected output
....
19878 INFO: checking EXE
19878 INFO: Building EXE because out00-EXE.toc is non existent
19878 INFO: Building EXE from out00-EXE.toc
19880 INFO: Appending archive to EXE C:\Users\bdmarron\Desktop\LANDVIZ\LANDVIZ\PreProcTool\dist\Proj4Extent.exe
20387 INFO: Building EXE from out00-EXE.toc completed successfully.



	e6. the .bat files

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
pyinstaller Proj4Extent.spec %*
:--log-level=WARN
:--distpath=..\dist
echo ==============================
pause
=============================================================================================





build_PreProcTool.bat ==>
==========================================================================================
@echo off
echo ==============================
echo build PreProcTool
echo ==============================
echo run pyinstaller ...
pyinstaller PreProcTool.spec %*
:--log-level=WARN
:--distpath=..\dist
pause
===========================================================================================




build_Proj4Extent.bat ==>
==========================================================================================
@echo off
echo ==============================
echo build Proj4Extent
echo ==============================
echo run pyinstaller...
pyinstaller Proj4Extent.spec %*
:--log-level=WARN
:--distpath=..\dist
echo ==============================
pause
===========================================================================================



	e7. the .spec files
START HERE

PreProcTool.spec ==>
===========================================================================================
# -*- mode: python -*-

block_cipher = None


a = Analysis(['src\\main.py'],
             pathex=['C:\\Users\\bdmarron\\Desktop\\LANDVIZ\\LANDVIZ\\PreProcTool'],
             binaries=[],
             datas=[( '..\\..\\src\\config', 'config' ), ( '..\\..\\..\\WebVisTool\\build\\dist', 'webbase' )],
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
          name='PreProcTool',
          debug=False,
          strip=False,
          upx=True,
          console=True )

==============================================================================================








