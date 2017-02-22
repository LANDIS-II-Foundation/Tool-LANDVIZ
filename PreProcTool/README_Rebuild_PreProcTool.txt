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


A multi-step process is required if changes to PreProcTool are required; namely,
	1) changes are made to the Python code, as needed (src directory)
	2) PyInstaller is used to rebuild PreProcTool.exe, Proj4Extent.exe, and a host of 
	   *.pyd files,  and *.dll files
	3) an installer program (Advanced Installer Project or InnoSetup) is used to 
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


install Python 2.7.13 (32-bit) and pip pip 9.0.1:
	==> https://www.python.org/ftp/python/2.7.13/python-2.7.13.msi


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

	a. Make sure that Path Variable (Windows) is set correctly for Python27 directories.
	  This is important in case other Pythons (like Anaconda) are installed.
		==> add C:\Python27; C:\Python27\Scripts and C:\Python27\Lib



	b. Check that the correct versions of Python and pip are installed

C:\Users\..\Desktop>python
Python 2.7.13 (v2.7.13:a06454b1afa1, Dec 17 2016, 20:42:59) [MSC v.1500 32 bit (Intel)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> ^C

C:\Users\..\Desktop>pip --version
pip 9.0.1 from c:\python27\lib\site-packages (python 2.7)



	c. Install the Python dependcies (as wheel packages) for PyInstaller. 
	   Install IN THIS ORDER (run "pip install <name.whl>" 2x if get install IO error):

		==> GDAL-2.1.3-cp27‑cp27m-win32.whl
		==> numpy-1.12.0+mkl-cp27-cp27m-win32.whl
		==> scipy-0.18.1-cp27-cp27m-win32.whl
		==> lxml-3.7.2-cp27-cp27m-win32.whl
		==> PyYAML-3.12-cp27-cp27m-win32.whl
		==> regex-2017.2.8-cp27-cp27m‑win32.whl
		==> Pillow-4.0.0-cp27-cp27m-win32.whl
		==> pywin32-220.1-cp27-cp27m-win32.whl
		==> pefile-2016.3.28-py2.py3-none-any.whl
		==> PyInstaller-3.2.1-py2.py3-none-any.whl
		==> CherryPy-10.1.0-py2.py3-none-any.whl 

C:\Users\..\..\LANDVIZ\PreProcTool\deploy\build_PreProcTool\Pyinstaller-plus-PythonDependencies\32bit>pip install <name.whl>




	d. run a test of the new Python code for PreProcTool. 
	   Note that appropriate paths to "main.py", "test_project_file.xml", and  
	   "sample_output" must be changed from  the "..\" placeholders below:

C:\Users\..\Desktop>python ..\src\main.py -p ..\..\..\test_project_file.xml -o ..\..\..\sample_output



	e. re-build PreProcTool and Proj4Extent with "build_preproctool.bat"
	e1. "build_preproctool.bat" has two, (2) PyInstaller commands:
		==> pyinstaller PreProcTool.spec --log-level=WARN --distpath=..\dist
		==> pyinstaller --onefile --workpath=build -y --clean --name=Proj4Extent --distpath=dist\PreProcTool ..\source\Proj4Extent.py


build_preproctool.bat ==>
==========================================================================================
@echo off
echo ==============================
echo build landis2 vis preproc tool
echo ==============================
echo run pyinstaller ...
pyinstaller PreProcTool.spec %*
:--log-level=WARN
:--distpath=..\dist
echo ==============================
echo build Proj4Extent
echo ==============================
echo run pyinstaller...
pyinstaller --onefile --workpath=build -y --clean --name=Proj4Extent --distpath=dist\PreProcTool ..\..\src\Proj4Extent.py %*
echo ==============================
pause
=============================================================================================




	e2. "PreProcTool.spec" tells PyInstaller how to process a script. 
	    It encodes the script; the spec file is actually executable Python code. 
	    PyInstaller builds the app by executing the contents of the spec file.
	    Note: pathex= is an optional list of paths to be searched before sys.path

PreProcTool.spec (modified from JLiem) ==>
===========================================================================================
# -*- mode: python -*-

block_cipher = None


a = Analysis(['..\\..\\src\\main.py'],
             pathex=['..\\Pyinstaller_build_PreProcTool', '..\\..\\src'],
             binaries=[],
             datas=[( '..\\..\\src\\config', 'config' ), ( '..\\..\\..\\WebVisTool\\build\\dist', 'webbase' )],
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



	f. run "build_preproctool.bat"
C:\Users\..\..\..LANDVIZ\PreProcTool\deploy\build_PreProcTool>start /B build_preproctool.bat


	g. the expected output is given below. Additionally, new folders (build, dist) 
	   should appear in C:\Users\..\..\..\LANDVIZ\PreProcTool\deploy\build_PreProcTool>
==============================
build landis2 vis preproc tool
==============================
run pyinstaller ...
2473 INFO: PyInstaller: 3.2.1
2473 INFO: Python: 2.7.13
2473 INFO: Platform: Windows-10-10.0.14393
2473 INFO: UPX is not available.
2473 INFO: Extending PYTHONPATH with paths
['C:\\Users\\bmarr\\Desktop\\landviz_rebuilding\\LANDVIZ-master_GitHub\\PreProcTool',
 'C:\\Users\\bmarr\\Desktop\\landviz_rebuilding\\LANDVIZ-master_GitHub\\PreProcTool\\deploy\\Pyinstaller_build_PreProcTool',
 'C:\\Users\\bmarr\\Desktop\\landviz_rebuilding\\LANDVIZ-master_GitHub\\PreProcTool\\src']
2473 INFO: checking Analysis
2473 INFO: Building Analysis because out00-Analysis.toc is non existent
2473 INFO: Initializing module dependency graph...
2489 INFO: Initializing module graph hooks...
2526 INFO: Analyzing hidden import 'scipy.special._ufuncs_cxx'
7168 INFO: Processing pre-safe import module hook   _xmlplus
7338 INFO: Processing pre-find module path hook   distutils
11154 INFO: Processing pre-find module path hook   site
11170 INFO: site: retargeting to fake-dir 'c:\\python27\\lib\\site-packages\\PyInstaller\\fake-modules'
11233 INFO: Processing pre-safe import module hook   win32com
22799 INFO: running Analysis out00-Analysis.toc
22845 INFO: Adding Microsoft.VC90.CRT to dependent assemblies of final executable
  required by c:\python27\python.exe
22960 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.21022.8_none_60a5df56e60dc5df.manifest
22984 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.1_none_8550c6b5d18a9128.manifest
23000 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.4148_none_f47e1bd6f6571810.manifest
23016 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_f47e3bf8f656f083.manifest
23132 INFO: Searching for assembly x86_Microsoft.VC90.CRT_1fc8b3b9a1e18e3b_9.0.30729.9247_none ...
23132 INFO: Found manifest C:\WINDOWS\WinSxS\Manifests\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35.manifest
23148 INFO: Searching for file msvcr90.dll
23148 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcr90.dll
23148 INFO: Searching for file msvcp90.dll
23148 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcp90.dll
23148 INFO: Searching for file msvcm90.dll
23148 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcm90.dll
23263 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.21022.8_none_60a5df56e60dc5df.manifest
23263 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.1_none_8550c6b5d18a9128.manifest
23263 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.4148_none_f47e1bd6f6571810.manifest
23263 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_f47e3bf8f656f083.manifest
23263 INFO: Adding redirect Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
23490 INFO: Caching module hooks...
23490 INFO: Analyzing ..\..\src\main.py
30813 INFO: Loading module hooks...
30813 INFO: Loading module hook "hook-distutils.py"...
30828 INFO: Loading module hook "hook-sysconfig.py"...
30851 INFO: Loading module hook "hook-xml.py"...
30967 INFO: Loading module hook "hook-PIL.py"...
30967 INFO: Excluding import 'FixTk'
30967 INFO: Excluding import 'Tkinter'
30967 INFO: Excluding import 'PyQt5'
30967 WARNING:   Removing import PIL.ImageQt from module PyQt5
30983 INFO: Excluding import 'PySide'
30983 WARNING:   Removing import PIL.ImageQt from module PySide
30983 INFO: Excluding import 'PyQt4'
30983 WARNING:   Removing import PIL.ImageQt from module PyQt4
30983 INFO: Loading module hook "hook-scipy.sparse.csgraph.py"...
30999 INFO: Loading module hook "hook-osgeo.py"...
31013 INFO: Loading module hook "hook-lxml.etree.py"...
31052 INFO: Loading module hook "hook-httplib.py"...
31066 INFO: Loading module hook "hook-pydoc.py"...
31066 INFO: Excluding import 'Tkinter'
31066 WARNING:   Removing import pydoc from module Tkinter
31066 INFO: Loading module hook "hook-_tkinter.py"...
31368 INFO: checking Tree
31384 INFO: Building Tree because out00-Tree.toc is non existent
31384 INFO: Building Tree out00-Tree.toc
31684 INFO: checking Tree
31684 INFO: Building Tree because out01-Tree.toc is non existent
31684 INFO: Building Tree out01-Tree.toc
31730 INFO: Loading module hook "hook-PIL.Image.py"...
32776 INFO: Loading module hook "hook-pkg_resources.py"...
32961 INFO: Loading module hook "hook-scipy.linalg.py"...
33193 INFO: Loading module hook "hook-regex.py"...
33198 INFO: Loading module hook "hook-pywintypes.py"...
33378 INFO: Loading module hook "hook-setuptools.py"...
33392 INFO: Loading module hook "hook-scipy.special._ellip_harm_2.py"...
33392 INFO: Loading module hook "hook-PIL.SpiderImagePlugin.py"...
33392 INFO: Excluding import 'FixTk'
33392 INFO: Excluding import 'Tkinter'
33392 INFO: Loading module hook "hook-encodings.py"...
34737 INFO: Loading module hook "hook-numpy.core.py"...
36678 INFO: Loading module hook "hook-scipy.special._ufuncs.py"...
36694 INFO: Loading module hook "hook-win32com.py"...
36911 INFO: Loading module hook "hook-pythoncom.py"...
37211 INFO: Looking for ctypes DLLs
37233 INFO: Analyzing run-time hooks ...
37249 INFO: Including run-time hook 'pyi_rth_pkgres.py'
37265 INFO: Including run-time hook 'pyi_rth_win32comgenpy.py'
37280 INFO: Including run-time hook 'pyi_rth__tkinter.py'
37296 INFO: Including run-time hook 'pyi_rth_osgeo.py'
37334 INFO: Looking for dynamic libraries
40647 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_5926f98ceadc42c2.manifest
40776 INFO: Searching for assembly x86_Microsoft.VC90.MFC_1fc8b3b9a1e18e3b_9.0.21022.8_none ...
40780 INFO: Found manifest C:\WINDOWS\WinSxS\Manifests\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86.manifest
40796 INFO: Searching for file mfc90.dll
40796 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86\mfc90.dll
40796 INFO: Searching for file mfc90u.dll
40796 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86\mfc90u.dll
40796 INFO: Searching for file mfcm90.dll
40796 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86\mfcm90.dll
40796 INFO: Searching for file mfcm90u.dll
40796 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86\mfcm90u.dll
40892 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_5926f98ceadc42c2.manifest
40908 INFO: Adding redirect Microsoft.VC90.MFC version (9, 0, 21022, 8) -> (9, 0, 21022, 8)
42767 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.21022.8_none_60a5df56e60dc5df.manifest
42767 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.1_none_8550c6b5d18a9128.manifest
42767 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.4148_none_f47e1bd6f6571810.manifest
42767 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_f47e3bf8f656f083.manifest
42868 INFO: Searching for assembly x86_Microsoft.VC90.CRT_1fc8b3b9a1e18e3b_9.0.30729.9247_none ...
42868 INFO: Found manifest C:\WINDOWS\WinSxS\Manifests\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35.manifest
42868 INFO: Searching for file msvcr90.dll
42868 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcr90.dll
42868 INFO: Searching for file msvcp90.dll
42868 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcp90.dll
42868 INFO: Searching for file msvcm90.dll
42884 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcm90.dll
42983 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.21022.8_none_60a5df56e60dc5df.manifest
42983 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.1_none_8550c6b5d18a9128.manifest
42983 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.4148_none_f47e1bd6f6571810.manifest
42983 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_f47e3bf8f656f083.manifest
42983 INFO: Adding redirect Microsoft.VC90.CRT version (9, 0, 30729, 6161) -> (9, 0, 30729, 9247)
43670 INFO: Looking for eggs
43670 INFO: Using Python library C:\WINDOWS\system32\python27.dll
43670 INFO: Found binding redirects:
[BindingRedirect(name=u'Microsoft.VC90.CRT', language=None, arch=u'x86', oldVersion=(9, 0, 30729, 6161), newVersion=(9, 0, 30729, 9247), publicKeyToken=u'1fc8b3b9a1e18e3b'), BindingRedirect(name=u'Microsoft.VC90.CRT', language=None, arch=u'x86', oldVersion=(9, 0, 21022, 8), newVersion=(9, 0, 30729, 9247), publicKeyToken=u'1fc8b3b9a1e18e3b'), BindingRedirect(name=u'Microsoft.VC90.MFC', language=None, arch=u'x86', oldVersion=(9, 0, 21022, 8), newVersion=(9, 0, 21022, 8), publicKeyToken=u'1fc8b3b9a1e18e3b')]
43686 INFO: Warnings written to C:\Users\bmarr\Desktop\landviz_rebuilding\LANDVIZ-master_GitHub\PreProcTool\deploy\Pyinstaller_build_PreProcTool\build\PreProcTool\warnPreProcTool.txt
44154 INFO: Appending 'datas' from .spec
44204 INFO: checking PYZ
44204 INFO: Building PYZ because out00-PYZ.toc is non existent
44204 INFO: Building PYZ (ZlibArchive) C:\Users\bmarr\Desktop\landviz_rebuilding\LANDVIZ-master_GitHub\PreProcTool\deploy\Pyinstaller_build_PreProcTool\build\PreProcTool\out00-PYZ.pyz
46259 INFO: Building PYZ (ZlibArchive) C:\Users\bmarr\Desktop\landviz_rebuilding\LANDVIZ-master_GitHub\PreProcTool\deploy\Pyinstaller_build_PreProcTool\build\PreProcTool\out00-PYZ.pyz completed successfully.
46464 INFO: checking PKG
46464 INFO: Building PKG because out00-PKG.toc is non existent
46464 INFO: Building PKG (CArchive) out00-PKG.pkg
46512 INFO: Building PKG (CArchive) out00-PKG.pkg completed successfully.
46526 INFO: Bootloader c:\python27\lib\site-packages\PyInstaller\bootloader\Windows-32bit\run.exe
46526 INFO: checking EXE
46526 INFO: Building EXE because out00-EXE.toc is non existent
46526 INFO: Building EXE from out00-EXE.toc
46526 INFO: Appending archive to EXE C:\Users\bmarr\Desktop\landviz_rebuilding\LANDVIZ-master_GitHub\PreProcTool\deploy\Pyinstaller_build_PreProcTool\build\PreProcTool\PreProcTool.exe
46645 INFO: Building EXE from out00-EXE.toc completed successfully.
46667 INFO: checking COLLECT
46667 INFO: Building COLLECT because out00-COLLECT.toc is non existent
46667 INFO: Building COLLECT out00-COLLECT.toc
46746 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
84221 INFO: Building COLLECT out00-COLLECT.toc completed successfully.
==============================
build Proj4Extent
==============================
run pyinstaller...
3124 INFO: PyInstaller: 3.2.1
3124 INFO: Python: 2.7.13
3140 INFO: Platform: Windows-10-10.0.14393
3140 INFO: wrote C:\Users\bmarr\Desktop\landviz_rebuilding\LANDVIZ-master_GitHub\PreProcTool\deploy\Pyinstaller_build_PreProcTool\Proj4Extent.spec
3140 INFO: UPX is not available.
3140 INFO: Removing temporary files and cleaning cache in C:\Users\bmarr\AppData\Roaming\pyinstaller
3630 INFO: Extending PYTHONPATH with paths
['C:\\Users\\bmarr\\Desktop\\landviz_rebuilding\\LANDVIZ-master_GitHub\\PreProcTool',
 'C:\\Users\\bmarr\\Desktop\\landviz_rebuilding\\LANDVIZ-master_GitHub\\PreProcTool\\deploy\\Pyinstaller_build_PreProcTool']
3630 INFO: checking Analysis
3630 INFO: Building Analysis because out00-Analysis.toc is non existent
3630 INFO: Initializing module dependency graph...
3646 INFO: Initializing module graph hooks...
3746 INFO: running Analysis out00-Analysis.toc
3830 INFO: Adding Microsoft.VC90.CRT to dependent assemblies of final executable
  required by c:\python27\python.exe
3992 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.21022.8_none_60a5df56e60dc5df.manifest
4008 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.1_none_8550c6b5d18a9128.manifest
4029 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.4148_none_f47e1bd6f6571810.manifest
4029 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_f47e3bf8f656f083.manifest
4131 INFO: Searching for assembly x86_Microsoft.VC90.CRT_1fc8b3b9a1e18e3b_9.0.30729.9247_none ...
4131 INFO: Found manifest C:\WINDOWS\WinSxS\Manifests\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35.manifest
4146 INFO: Searching for file msvcr90.dll
4146 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcr90.dll
4146 INFO: Searching for file msvcp90.dll
4146 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcp90.dll
4146 INFO: Searching for file msvcm90.dll
4146 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcm90.dll
4262 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.21022.8_none_60a5df56e60dc5df.manifest
4262 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.1_none_8550c6b5d18a9128.manifest
4262 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.4148_none_f47e1bd6f6571810.manifest
4262 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_f47e3bf8f656f083.manifest
4262 INFO: Adding redirect Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
4531 INFO: Caching module hooks...
4547 INFO: Analyzing C:\Users\bmarr\Desktop\landviz_rebuilding\LANDVIZ-master_GitHub\PreProcTool\src\Proj4Extent.py
8722 INFO: Processing pre-safe import module hook   _xmlplus
8903 INFO: Processing pre-find module path hook   distutils
14047 INFO: Processing pre-find module path hook   site
14064 INFO: site: retargeting to fake-dir 'c:\\python27\\lib\\site-packages\\PyInstaller\\fake-modules'
14144 INFO: Processing pre-safe import module hook   win32com
20745 INFO: Loading module hooks...
20746 INFO: Loading module hook "hook-distutils.py"...
20765 INFO: Loading module hook "hook-sysconfig.py"...
20797 INFO: Loading module hook "hook-xml.py"...
20950 INFO: Loading module hook "hook-osgeo.py"...
20996 INFO: Loading module hook "hook-httplib.py"...
20996 INFO: Loading module hook "hook-pydoc.py"...
21013 INFO: Excluding import 'Tkinter'
21013 WARNING:   Removing import pydoc from module Tkinter
21013 INFO: Loading module hook "hook-_tkinter.py"...
21263 INFO: checking Tree
21279 INFO: Building Tree because out00-Tree.toc is non existent
21279 INFO: Building Tree out00-Tree.toc
21529 INFO: checking Tree
21529 INFO: Building Tree because out01-Tree.toc is non existent
21529 INFO: Building Tree out01-Tree.toc
21567 INFO: Loading module hook "hook-pkg_resources.py"...
21768 INFO: Loading module hook "hook-pywintypes.py"...
21983 INFO: Loading module hook "hook-setuptools.py"...
21983 INFO: Loading module hook "hook-encodings.py"...
23346 INFO: Loading module hook "hook-numpy.core.py"...
25228 INFO: Loading module hook "hook-win32com.py"...
25447 INFO: Loading module hook "hook-pythoncom.py"...
25692 INFO: Looking for ctypes DLLs
25730 INFO: Analyzing run-time hooks ...
25730 INFO: Including run-time hook 'pyi_rth__tkinter.py'
25745 INFO: Including run-time hook 'pyi_rth_win32comgenpy.py'
25745 INFO: Including run-time hook 'pyi_rth_pkgres.py'
25761 INFO: Including run-time hook 'pyi_rth_osgeo.py'
25777 INFO: Looking for dynamic libraries
26820 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_5926f98ceadc42c2.manifest
26965 INFO: Searching for assembly x86_Microsoft.VC90.MFC_1fc8b3b9a1e18e3b_9.0.21022.8_none ...
26965 INFO: Found manifest C:\WINDOWS\WinSxS\Manifests\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86.manifest
26981 INFO: Searching for file mfc90.dll
26981 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86\mfc90.dll
26981 INFO: Searching for file mfc90u.dll
26981 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86\mfc90u.dll
26981 INFO: Searching for file mfcm90.dll
26996 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86\mfcm90.dll
26996 INFO: Searching for file mfcm90u.dll
26996 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_b81d038aaf540e86\mfcm90u.dll
27096 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.mfc_1fc8b3b9a1e18e3b_9.0.21022.8_none_5926f98ceadc42c2.manifest
27111 INFO: Adding redirect Microsoft.VC90.MFC version (9, 0, 21022, 8) -> (9, 0, 21022, 8)
28248 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.21022.8_none_60a5df56e60dc5df.manifest
28249 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.1_none_8550c6b5d18a9128.manifest
28252 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.4148_none_f47e1bd6f6571810.manifest
28254 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_f47e3bf8f656f083.manifest
28377 INFO: Searching for assembly x86_Microsoft.VC90.CRT_1fc8b3b9a1e18e3b_9.0.30729.9247_none ...
28378 INFO: Found manifest C:\WINDOWS\WinSxS\Manifests\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35.manifest
28380 INFO: Searching for file msvcr90.dll
28380 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcr90.dll
28381 INFO: Searching for file msvcp90.dll
28381 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcp90.dll
28381 INFO: Searching for file msvcm90.dll
28381 INFO: Found file C:\WINDOWS\WinSxS\x86_microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_5090cb78bcba4a35\msvcm90.dll
28483 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.21022.8_none_60a5df56e60dc5df.manifest
28483 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.1_none_8550c6b5d18a9128.manifest
28485 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.4148_none_f47e1bd6f6571810.manifest
28486 INFO: Found C:\WINDOWS\WinSxS\Manifests\x86_policy.9.0.microsoft.vc90.crt_1fc8b3b9a1e18e3b_9.0.30729.9247_none_f47e3bf8f656f083.manifest
28486 INFO: Adding redirect Microsoft.VC90.CRT version (9, 0, 30729, 6161) -> (9, 0, 30729, 9247)
28861 INFO: Looking for eggs
28861 INFO: Using Python library C:\WINDOWS\system32\python27.dll
28861 INFO: Found binding redirects:
[BindingRedirect(name=u'Microsoft.VC90.CRT', language=None, arch=u'x86', oldVersion=(9, 0, 30729, 6161), newVersion=(9, 0, 30729, 9247), publicKeyToken=u'1fc8b3b9a1e18e3b'), BindingRedirect(name=u'Microsoft.VC90.CRT', language=None, arch=u'x86', oldVersion=(9, 0, 21022, 8), newVersion=(9, 0, 30729, 9247), publicKeyToken=u'1fc8b3b9a1e18e3b'), BindingRedirect(name=u'Microsoft.VC90.MFC', language=None, arch=u'x86', oldVersion=(9, 0, 21022, 8), newVersion=(9, 0, 21022, 8), publicKeyToken=u'1fc8b3b9a1e18e3b')]
28877 INFO: Warnings written to build\Proj4Extent\warnProj4Extent.txt
29313 INFO: checking PYZ
29313 INFO: Building PYZ because out00-PYZ.toc is non existent
29313 INFO: Building PYZ (ZlibArchive) build\Proj4Extent\out00-PYZ.pyz
30781 INFO: Building PYZ (ZlibArchive) build\Proj4Extent\out00-PYZ.pyz completed successfully.
30949 INFO: checking PKG
30949 INFO: Building PKG because out00-PKG.toc is non existent
30950 INFO: Building PKG (CArchive) out00-PKG.pkg
31202 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
31202 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\python27.dll
31202 INFO: Updating resource type 24 name 2 language 1033
31657 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
31657 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\tbb.dll
31657 INFO: Updating resource type 24 name 2 language 0
31989 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
31989 INFO: Redirecting Microsoft.VC90.MFC version (9, 0, 21022, 8) -> (9, 0, 21022, 8)
32004 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\win32ui.pyd
32004 INFO: Updating resource type 24 name 2 language 1033
32813 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\mfc90.dll
32813 INFO: Updating resource type 24 name 1000 language 1033
32922 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\mfc90u.dll
32938 INFO: Updating resource type 24 name 1000 language 1033
33176 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
33176 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\tcl85.dll
33176 INFO: Updating resource type 24 name 2 language 1033
33238 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\tk85.dll
33238 INFO: Updating resource type 24 name 1 language 1033
33261 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
33261 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\tk85.dll
33261 INFO: Updating resource type 24 name 2 language 1033
33492 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 30729, 6161) -> (9, 0, 30729, 9247)
33493 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
33498 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\gdal201.dll
33499 INFO: Updating resource type 24 name 2 language 1033
33676 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
33676 INFO: Updating manifest in C:\Users\bmarr\AppData\Roaming\pyinstaller\bincache00_py27_32bit\geos_c.dll
33676 INFO: Updating resource type 24 name 2 language 1033
33776 INFO: Redirecting Microsoft.VC90.CRT version (9, 0, 21022, 8) -> (9, 0, 30729, 9247)
55064 INFO: Building PKG (CArchive) out00-PKG.pkg completed successfully.
55296 INFO: Bootloader c:\python27\lib\site-packages\PyInstaller\bootloader\Windows-32bit\run.exe
55296 INFO: checking EXE
55296 INFO: Building EXE because out00-EXE.toc is non existent
55311 INFO: Building EXE from out00-EXE.toc
55311 INFO: Appending archive to EXE dist\PreProcTool\Proj4Extent.exe
56274 INFO: Building EXE from out00-EXE.toc completed successfully.
==============================
Press any key to continue . . .



