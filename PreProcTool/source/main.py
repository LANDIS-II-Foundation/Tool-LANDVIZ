#!/usr/bin/env python

# LANDIS-II-Visualization 
# PreProc Tool
# (c) 2014, Johannes Liem, Oregon State University

import sys, os.path
import logging
import argparse
import l2data as landis, l2utils as utils
import time
import json
import zipfile

from multiprocessing import freeze_support


def extantFolder(x):
    """
    'Type' for argparse
    checks if outputfolder exists
    yes: return true (means to use existing output!!! UPDATE MODE) no: create folder + return false.s
    """
    if not os.path.isdir(x):
        os.mkdir(x)
    return x
        

def extantFile(x):
    """
    'Type' for argparse - checks that file exists but does not open.
    """
    if not os.path.exists(x):
        raise argparse.ArgumentError("{0} does not exist".format(x))
    return x

def parseArguemnts():
    # Argument Parser

    parser = argparse.ArgumentParser(description='Landis2Vis')

    # projectfile Option
    parser.add_argument("-p", "--projectfile", 
        dest="projectFile", required=True, type=extantFile,
        help="Pre-Proc-Project File", metavar="FILE")    

    parser.add_argument("-o", "--outputfolder",
        dest="outputFolder", required=True, type=extantFolder,
        help="Pre-Proc-Project Output Folder", metavar="FOLDER")

    return parser.parse_args()

def zipdir(path, zip):
    for root, dirs, files in os.walk(path):
        for file in files:
            if os.path.splitext(file)[1] != '.exe':
                zip.write(os.path.join(root, file))

def main(script, *args):
    try:
        # get the path and the file of the application file (executeable)
        appPath, appFile = os.path.split(os.path.normpath(os.path.realpath(script)))

        # setup the logging system
        # if not os.path.isdir(appPath + '    \logs'):
        #     os.mkdir(appPath +'\logs')
        # elif os.path.exists(appPath+'\logs\preproctool.log'):
        #     os.remove(appPath+'\logs\preproctool.log')
        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s %(name)-25s %(levelname)-8s %(message)s',
                            datefmt='%m/%d/%Y %I:%M:%S %p',
                            filename=appPath+'\logs\preproctool.log',
                            filemode = 'w')

        console = logging.StreamHandler()
        console.setLevel(logging.INFO)
        formatter = logging.Formatter('%(levelname)-8s %(message)s')
        console.setFormatter(formatter)
        logging.getLogger('').addHandler(console)
        logMain = logging.getLogger('landis.main')
        logMain.info('Start LANDIS-II PreProcTool')
        
        # parse commandline arguments
        args = parseArguemnts()
        
        # LANDIS PreProc Collector: collects Project Configuration and Project Data
        collector = utils.Collector()
        # CONFIG Object has different Configurations
        CONFIG = collector.setupConfig(appPath, appFile, 'config\config.yaml', args)
        # PROJECT stores the complete Project (Infos aboute the Project/Scenarios/Extensions/Outputs)
        PROJECT = collector.setupProject()
        
        # FIXME
        # LANDIS PreProc Checker: controlles the Project
        # rules: what should the checker check?
        # checker = landis.Checker()

        # LANDIS Preworker: prepair Tables and Maps
        preworker = utils.Preworker(PROJECT, CONFIG)

        outputworker = utils.OutputWorker(PROJECT, CONFIG)
        outputworker.generateOutputDirs()

  
        logMain.info('Start prepairing Table Output')
        start = time.time()
        preworker.prepairTables()
        end = time.time()
        logMain.info('End prepairing Table Output [time: {} sec]'.format(end - start))

        logMain.info('Start prepairing Map Output')
        start = time.time()
        preworker.prepairMaps()
        end = time.time()
        logMain.info('End prepairing Map Output [time: {} sec]'.format(end - start))

        
        # FIXME: add to new util: webworker.py

        outputworker.saveMetadataJson()

        # FIXME WebWorker:
        # NOT FOR DIST, JUST FOR DEVEL; FOR DIST WEBBASE FROM APP PATH
        # http://stackoverflow.com/questions/15034151/copy-directory-contents-into-a-directory-with-python
        outputworker.copyWebbase(os.path.splitext(appFile)[1])

        

        with open(os.path.normpath(CONFIG['PROJECT']['OUTPUT_DIR']+"/config/default_settings.json"), "r+") as jsonFile:
            data = json.load(jsonFile)

            data["projectname"] = PROJECT.projectName
            data["map"]["resolutions"] = PROJECT.getResolutions()
            data["map"]["resolution"] = PROJECT.getInitResolution()
            data["map"]["basemap"]["saturation"] = PROJECT.initSaturation
            data["map"]["basemap"]["contrast"] = PROJECT.initContrast
            data["map"]["basemap"]["brightness"] = PROJECT.initBrightness
            data["map"]["basemap"]["source"] = PROJECT.mapSource

            jsonFile.seek(0)  # rewind
            jsonFile.write(json.dumps(data, sort_keys=False, indent=2))
            jsonFile.truncate()

        # Create the zip file for server upload
        zipdn = os.path.normpath(CONFIG['PROJECT']['OUTPUT_DIR'])
        zipfn = zipdn + '.zip'
        logging.info('Create zipfile for server upload')

        zipf = zipfile.ZipFile(zipfn, 'w')
        zipdir(zipdn, zipf)
        zipf.close()
        

        logging.info('Output Folder: ' + os.path.abspath(zipdn))
        logging.info('Zip File: ' + os.path.abspath(zipfn))
        # End WEBWORKER

        logMain.info('End of LANDIS-II PreProcTool.')

    except Exception as e:
        logMain.error('Failed to run LANDIS-II PreProcTool')

        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        logMain.debug(exc_type, fname, exc_tb.tb_lineno)

        sys.exit()

if __name__ == '__main__':
    freeze_support()
    main(*sys.argv)