import sys, os, logging, distutils.core
from regex import sub
import json
import zipfile

class OutputWorker(object):
    def __init__(self, PROJECT, CONFIG):
        """
        OutputWorker Constructor
        """
        self.PROJECT = PROJECT
        self.CONFIG = CONFIG
    
    def copyWebbase(self):
        try:
            logCopyWebbase = logging.getLogger('output.copyWebbase')
            logCopyWebbase.info('Copy webbase to output directory')

            excEnv = os.path.splitext(self.CONFIG['APPLICATION']['FILE'])[1]
            # http://stackoverflow.com/questions/15034151/copy-directory-contents-into-a-directory-with-python
            if(excEnv == '.py'):
                distutils.dir_util.copy_tree("..\..\WebVisTool\\build\dist", self.CONFIG['PROJECT']['OUTPUT_DIR'])
            if(excEnv == '.exe'):
                distutils.dir_util.copy_tree(self.CONFIG['APPLICATION']['PATH'] + "\webbase", self.ONFIG['PROJECT']['OUTPUT_DIR'])
        except Exception as e:
            logCopyWebbase.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logCopyWebbase.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

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
            logSaveMetadata = logging.getLogger('output.saveMetadata')
            logSaveMetadata.info('Save Metadata as JSON files')

            scenariosDictToJson = {}
            scenariosDictToJson['scenarios'] = self.PROJECT.getScenarioDict()
            j = json.dumps(scenariosDictToJson, sort_keys=True, indent=2)
            f = open(os.path.normpath(self.CONFIG['PROJECT']['OUTPUT_DIR']+'/landisdata/metadata/metadata.scenarios.json'), 'w')
            print >> f, j
            f.close()

            extensionOutputDictToJson = self.PROJECT.getExtensionOutputDict()
            j = json.dumps(extensionOutputDictToJson, sort_keys=True, indent=2)
            f = open(os.path.normpath(self.CONFIG['PROJECT']['OUTPUT_DIR']+'/landisdata/metadata/metadata.extensions.json'), 'w')
            print >> f, j
            f.close()
        except Exception as e:
            logSaveMetadata.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logSaveMetadata.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def updateWebsettings(self):
        try:
            logUpdateWebPrefs = logging.getLogger('output.updateWebPrefs')
            logUpdateWebPrefs.info('Update web settings file')
            with open(os.path.normpath(self.CONFIG['PROJECT']['OUTPUT_DIR']+"/config/default_settings.json"), "r+") as jsonFile:
                data = json.load(jsonFile)

                data["projectname"] = self.PROJECT.projectName
                data["map"]["resolutions"] = self.PROJECT.getResolutions()
                data["map"]["resolution"] = self.PROJECT.getInitResolution()
                data["map"]["basemap"]["saturation"] = self.PROJECT.initSaturation
                data["map"]["basemap"]["contrast"] = self.PROJECT.initContrast
                data["map"]["basemap"]["brightness"] = self.PROJECT.initBrightness
                data["map"]["basemap"]["source"] = self.PROJECT.mapSource

                jsonFile.seek(0)  # rewind
                jsonFile.write(json.dumps(data, sort_keys=False, indent=2))
                jsonFile.truncate()
        except Exception as e:
            logUpdateWebPrefs.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logUpdateWebPrefs.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def zipdir(self, path, zip):
        for root, dirs, files in os.walk(path):
            for file in files:
                if os.path.splitext(file)[1] != '.exe':
                    zip.write(os.path.join(root, file))

    def zipOutputDir(self):
        try:
            logZip = logging.getLogger('output.zipOutput')
            logZip.info('Create zipfile for server upload')
            # Create the zip file for server upload
            zipdn = os.path.normpath(self.CONFIG['PROJECT']['OUTPUT_DIR'])
            zipfn = zipdn + '.zip'

            zipf = zipfile.ZipFile(zipfn, 'w')
            self.zipdir(zipdn, zipf)
            zipf.close()

            logZip.info('Output Folder: ' + os.path.abspath(zipdn))
            logZip.info('Zip File: ' + os.path.abspath(zipfn))

        except Exception as e:
            logZip.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logZip.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()
