#!/usr/bin/env python

# LANDIS-II-Visualization 
# PreProc Tool
# (c) 2014, Johannes Liem, Oregon State University

import sys, os.path
import logging
import argparse
import l2data as landis, l2utils as utils
import time

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

def main(script, *args):
    try:
        # get the path and the file of the application file (executeable)
        appPath, appFile = os.path.split(os.path.normpath(os.path.realpath(script)))

        logging.basicConfig(level=logging.DEBUG,
                            format='%(asctime)s %(name)-25s %(levelname)-8s %(message)s',
                            datefmt='%m/%d/%Y %I:%M:%S %p',
                            filename=appPath+'\logs\\' + time.strftime('%Y%m%d-%H%M%S') + '.log',
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
        
        # LANDIS Preworker: prepair Tables and Maps
        preworker = utils.Preworker(PROJECT, CONFIG)

        outputworker = utils.OutputWorker(PROJECT, CONFIG)
        outputworker.generateOutputDirs()
        
        preworker.prepairTables()        
        preworker.prepairMaps()

        outputworker.saveMetadataJson()
        outputworker.copyWebbase()
        outputworker.updateWebsettings()
        outputworker.zipOutputDir()

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