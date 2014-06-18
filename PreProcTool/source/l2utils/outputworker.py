import sys, os, logging, distutils.core
from regex import sub
import json

class OutputWorker(object):
    def __init__(self, PROJECT, CONFIG):
        """
        OutputWorker Constructor
        """
        self.PROJECT = PROJECT
        self.CONFIG = CONFIG
    
    def copyWebbase(self):
        try:
            if(excEnv == '.py'):
                distutils.dir_util.copy_tree("..\..\WebVisTool\\build\dist", CONFIG['PROJECT']['OUTPUT_DIR'])
            if(excEnv == '.exe'):
                distutils.dir_util.copy_tree(appPath + "\webbase", CONFIG['PROJECT']['OUTPUT_DIR'])
        except Exception as e:
            logGenOutputDir.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logGenOutputDir.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()   

    def generateOutputDirs(self):
        """
        generates output directories
        """
        logGenOutputDir = logging.getLogger('output.genOutputDirs')
        logGenOutputDir.info('Generate output directories')
        op = self.CONFIG['PROJECT']['OUTPUT_DIR']
        opd = os.path.join(op, 'landisdata')

        if not os.path.isdir(op):
            logGenOutputDir.debug("Create output directory: " + op)
            os.mkdir(op)

        if not os.path.isdir(opd):
            logGenOutputDir.debug("Create landisdata directory: " + opd)
            os.mkdir(opd)

        metadata = 'metadata'
        modeldata = 'modeldata'
        try:
            if not os.path.isdir(os.path.join(opd, metadata)):
                os.mkdir(os.path.join(opd, metadata))
        except Exception as e:
            logGenOutputDir.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logGenOutputDir.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

        try:
            if not os.path.isdir(os.path.join(opd, modeldata)):
                os.mkdir(os.path.join(opd, modeldata))
            for s in self.PROJECT:
                sname = sub('[\\/:"*?<>| ]+', '_', s.scenarioName).lower()
                sn = str(s.scenarioIndex)
                if not os.path.isdir(os.path.join(opd, modeldata, sn)):
                    os.mkdir(os.path.join(opd, modeldata, sn))
                if not os.path.isdir(os.path.join(opd, modeldata, sn, "__"+sname+"__")):
                    os.mkdir(os.path.join(opd, modeldata, sn, "__"+sname+"__"))
                for e in s:
                    if e.getOutputNum():                 
                        ename = sub('[\\/:"*?<>| ]+', '_', e.extensionName).lower()
                        en = str(e.extensionIndex)
                        if not os.path.isdir(os.path.join(opd, modeldata, sn, en)):
                            os.mkdir(os.path.join(opd, modeldata, sn, en))
                        if not os.path.isdir(os.path.join(opd, modeldata, sn, en, "__"+ename+"__")):
                            os.mkdir(os.path.join(opd, modeldata, sn, en, "__"+ename+"__"))
                        for o in e:
                            oname = sub('[\\/:"*?<>| ]+', '_', o.outputName).lower()
                            on = str(o.outputIndex)
                            if not os.path.isdir(os.path.join(opd, modeldata, sn, en, on)):
                                os.mkdir(os.path.join(opd, modeldata, sn, en, on))
                            if not os.path.isdir(os.path.join(opd, modeldata, sn, en, on, "__"+oname+"__")):
                                os.mkdir(os.path.join(opd, modeldata, sn, en, on, "__"+oname+"__"))
                            
        except Exception as e:
            logGenOutputDir.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logGenOutputDir.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def saveMetadataJson(self):
        try:
            # print os.path.normpath(CONFIG['PROJECT']['OUTPUT_DIR']+'/landisdata/metadata/metadata.scenarios.json')
            scenariosDictToJson = {}
            scenariosDictToJson['scenarios'] = PROJECT.getScenarioDict()
            j = json.dumps(scenariosDictToJson, sort_keys=True, indent=2)
            f = open(os.path.normpath(CONFIG['PROJECT']['OUTPUT_DIR']+'/landisdata/metadata/metadata.scenarios.json'), 'w')
            print >> f, j
            f.close()

            #print os.path.normpath(CONFIG['PROJECT']['OUTPUT_DIR']+'/landisdata/metadata/metadata.extensions.json')
            extensionOutputDictToJson = PROJECT.getExtensionOutputDict()
            j = json.dumps(extensionOutputDictToJson, sort_keys=True, indent=2)
            f = open(os.path.normpath(CONFIG['PROJECT']['OUTPUT_DIR']+'/landisdata/metadata/metadata.extensions.json'), 'w')
            print >> f, j
            f.close()
        except Exception as e:
            logGenOutputDir.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logGenOutputDir.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()