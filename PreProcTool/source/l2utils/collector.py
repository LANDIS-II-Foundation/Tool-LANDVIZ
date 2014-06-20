#!/usr/bin/env python
import sys, os
import logging
from osgeo import osr
import l2data as landis, l2utils as utils
import yaml

class Collector(object):

    def createProject(self):
        """
        Project
        """
        CONFIG = self.CONFIG
        try:
            logCreateProject = logging.getLogger('collector.createProject')
            logCreateProject.info('Create Project')

            # load the project file
            xml = CONFIG['PROJECT']['INPUT_XML']
            xsd = os.path.join(CONFIG['APPLICATION']['PATH'], CONFIG['XSD']['PROJECT'])
            self.projectFileXML = utils.XMLreader(xml, xsd)
            logCreateProject.debug('Load Information from project file: {}'.format(os.path.abspath(self.CONFIG['PROJECT']['INPUT_XML'])))
        
            # get project title
            xpath = CONFIG['XPATH']['PROJECTNAME']
            attrib = CONFIG['ATTRIB']['PROJECTNAME']
            xmlQuery = self.projectFileXML.queryXML(xpath, attrib)

            # create project object
            if xmlQuery:
                self.PROJECT = landis.Project(xmlQuery)
            else:
                self.PROJECT = landis.Project(CONFIG['DEFAULT']['PROJECTTITLE'])

            logCreateProject.info('Project name: "{}"'.format(self.PROJECT.projectName))

        except Exception as e:
            logCreateProject.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logCreateProject.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()
    
    def loadMapPreferences(self):
        """
        Load Map Preferences from Project XML file and add Map Preferencs to PROJECT
        Zoom, ...
        """
        CONFIG = self.CONFIG
        PROJECT = self.PROJECT
        try:
            logLoadMapPrefs = logging.getLogger('collector.loadMapPrefs')
            logLoadMapPrefs.info('Load Map Preferences form project xml file')

            xpath = CONFIG['XPATH']['MAPZOOM']
            zoom = self.projectFileXML.queryXML(xpath)
            logLoadMapPrefs.debug('Zoom: {}'.format(zoom))
            PROJECT.zoomMin = int(zoom[0]['min'])
            PROJECT.zoomMax = int(zoom[0]['max'])
            PROJECT.initZoom = int(zoom[0]['init'])

            xpath = CONFIG['XPATH']['BASEMAP']
            basemap = self.projectFileXML.queryXML(xpath)
            logLoadMapPrefs.debug('Basemap: {}'.format(basemap))
            PROJECT.initBrightness = float(basemap[0]['brightness'])
            PROJECT.initContrast = float(basemap[0]['contrast'])
            PROJECT.initSaturation = float(basemap[0]['saturation'])
            PROJECT.mapSource = basemap[0]['source']

            xpath = CONFIG['XPATH']['LEGEND']
            legend = self.projectFileXML.queryXML(xpath)
            logLoadMapPrefs.debug('Legend: {}'.format(legend))
            PROJECT.initClassCount = int(legend[0]['initClassCount'])
            PROJECT.seqCol = legend[0]['sequentialCol'] 
            PROJECT.divCol = legend[0]['divergingCol'] 
            PROJECT.qualCol = legend[0]['qualitativeCol']
        
        except Exception as e:
            logLoadMapPrefs.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logLoadMapPrefs.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()
    #
    def loadSpatialReference(self):
        """
        Load SpatialReference from Project XML file and add spatialReference and Geotransform to PROJECT
        """
        CONFIG = self.CONFIG
        PROJECT = self.PROJECT
        try:
            logLoadSRS = logging.getLogger('collector.loadSRS')
            logLoadSRS.info('Load spatial refrence and geo extent from the project xml file')

            xpath = CONFIG['XPATH']['PROJECTION']
            attrib = CONFIG['ATTRIB']['PROJ4']
            projection = self.projectFileXML.queryXML(xpath, attrib)

            sr = osr.SpatialReference()
            if sr.SetFromUserInput(projection) != 0:
                raise Exception('Failed to process SRS definition: {}'.format(projection))
            wkt = sr.ExportToWkt()
            PROJECT.spatialReferenceWKT = wkt
            logLoadSRS.debug('SRS definition: {}'.format(wkt))

            xpath = CONFIG['XPATH']['GEOEXTENT']
            extent = self.projectFileXML.queryXML(xpath)

            PROJECT.geoExtent = extent[0]
            logLoadSRS.debug('geo extent: {}'.format(extent[0]))

        except Exception as e:
            logLoadSRS.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logLoadSRS.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def setupConfig(self, appPath, appFile, configYaml, args):
        """
        Setup Configuration
        """
        try:
            logSetupConfig = logging.getLogger('collector.setupConfig')
            logSetupConfig.info('Setup application configuration')

            # load YAML CONFIG File
            with open(os.path.join(appPath, configYaml), 'r') as f:
                self.CONFIG = yaml.load(f)

            # add Application-Path to CONFIG
            self.CONFIG['APPLICATION']['PATH'] = appPath
            self.CONFIG['APPLICATION']['FILE'] = appFile
            logSetupConfig.debug('Detect Application Folder: {}'.format(os.path.normpath(os.path.join(self.CONFIG['APPLICATION']['PATH'], self.CONFIG['APPLICATION']['FILE']))))

            # Add Arguments to CONFIG
            self.CONFIG['PROJECT']['INPUT_XML'] = args.projectFile # Project XML File
            logSetupConfig.debug('Detect Project File: {}'.format(os.path.abspath(self.CONFIG['PROJECT']['INPUT_XML'])))

            self.CONFIG['PROJECT']['OUTPUT_DIR'] = args.outputFolder # output Folder
            logSetupConfig.debug('Detect Output Folder: {}'.format(os.path.abspath(self.CONFIG['PROJECT']['OUTPUT_DIR'])))

            return self.CONFIG
        except Exception as e:
            logSetupConfig.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logSetupConfig.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()


    def setupProject(self):
        """
        Setup Project and and Load Datastructure
        """
        CONFIG = self.CONFIG
        
        self.createProject()
        self.loadSpatialReference()
        self.loadMapPreferences()

        PROJECT = self.PROJECT

        #return self.PROJECT

        # SCENARIOS
        try:
            logLoadDataStruct = logging.getLogger('collector.loadDataStruct')
            logLoadDataStruct.info('Load Datastructure from Lanids Metadata')

            #load and add scenarios to project
            projectFileBase, projectFileName = os.path.split(CONFIG['PROJECT']['INPUT_XML'])
            xmlQuery = self.projectFileXML.queryXML(CONFIG['XPATH']['SCENARIOLIST'])
            
            if xmlQuery and type(xmlQuery) == list:
                for scenario in xmlQuery: 
                    #FIXME when scenarioFolderPath is relative, be shure it is relative to the project File
                    if not os.path.isabs(scenario[CONFIG['ATTRIB']['SCENARIOPATH']]):            
                        scenarioFolderPath = os.path.join(projectFileBase, scenario[CONFIG['ATTRIB']['SCENARIOPATH']])
                    else:
                        scenarioFolderPath = scenario[CONFIG['ATTRIB']['SCENARIOPATH']]
                        
                    scenarioFolderBase, scenarioFolderDir = os.path.split(scenarioFolderPath)
                    
                    #check if LANDIS Ouput Direcotry    
                    if not os.path.isdir(scenarioFolderPath):
                        raise Exception(scenarioFolderPath, 'is not a valid directory.')
                        
                    if scenario.has_key(CONFIG['ATTRIB']['SCENARIONAME']) and not scenario[CONFIG['ATTRIB']['SCENARIONAME']].isspace() and len(scenario[CONFIG['ATTRIB']['SCENARIONAME']]) > 0:
                        scenarioName = scenario[CONFIG['ATTRIB']['SCENARIONAME']]
                    else:
                        scenarioName = scenarioFolderDir
                    scenarioObj = landis.Scenario(scenarioName)
                    PROJECT.addScenario(scenarioObj)

                    #EXTENSIONS load Extension Files to Collect additional Scenario Info, and EXTENSIONS!!!    
                    scenarioMetadataFolderPath = os.path.join(scenarioFolderPath, CONFIG['METADATA']['DIR'])
                    if os.path.isdir(scenarioMetadataFolderPath):
                        for metadataExtensionFolderDir in os.listdir(scenarioMetadataFolderPath):
                            if os.path.isdir(os.path.join(scenarioMetadataFolderPath, metadataExtensionFolderDir)):
                                metadataExtensionFilePath = os.path.join(scenarioMetadataFolderPath, metadataExtensionFolderDir, metadataExtensionFolderDir + '.xml')
                                if os.path.isfile(metadataExtensionFilePath):
                                    #load the metadata extension file
                                    extensionFileXML = utils.XMLreader(metadataExtensionFilePath) #, xsdFile!!! FIXME (!!! BE sHURE ALL IS MANDATORY!!!)
                                    
                                    #load Additional Scenario Properties
                                    xmlQuery = extensionFileXML.queryXML(CONFIG['XPATH']['SCENARIOREPLICATION'])

                                    if xmlQuery:
                                        xmlQuery_ext_name = extensionFileXML.queryXML(CONFIG['XPATH']['EXTENSION'])
                        
                                        if xmlQuery_ext_name:
                                            extensionName_ = xmlQuery_ext_name[0][CONFIG['ATTRIB']['EXTENSIONNAME']]
                                        if PROJECT[PROJECT.lastIdx].timeMax is None:
                                            PROJECT[PROJECT.lastIdx].timeMax = int(xmlQuery[0][CONFIG['ATTRIB']['TIMEMAX']])
                                        else:
                                            #check ScenarioInfo
                                            if PROJECT[PROJECT.lastIdx].timeMax != int(xmlQuery[0][CONFIG['ATTRIB']['TIMEMAX']]):
                                                raise Exception(xmlQuery[0][CONFIG['ATTRIB']['TIMEMAX']], PROJECT[PROJECT.lastIdx].timeMax, PROJECT.lastIdx, 'Scenario Info is not matching with the current Scenario Info')
                                        
                                        if PROJECT[PROJECT.lastIdx].rasterOutputCellSize is None:
                                            PROJECT[PROJECT.lastIdx].rasterOutputCellSize = int(xmlQuery[0][CONFIG['ATTRIB']['RASTERCELLSIZE']])
                                        
                                        else:
                                            #check ScenarioInfo
                                            if PROJECT[PROJECT.lastIdx].rasterOutputCellSize != int(xmlQuery[0][CONFIG['ATTRIB']['RASTERCELLSIZE']]):
                                                raise Exception(xmlQuery[0][CONFIG['ATTRIB']['RASTERCELLSIZE']], PROJECT[PROJECT.lastIdx].rasterOutputCellSize, PROJECT.lastIdx, 'Scenario Info is not matching with the current Scenario Info')            
                                    else:
                                        raise Exception(xmlQuery, 'Empty result for the xml Query')
                                    
                                    # EXTENSIONS
                                    
                                    xmlQuery = extensionFileXML.queryXML(CONFIG['XPATH']['EXTENSION'])
                                    
                                    if xmlQuery:
                                        extensionName = xmlQuery[0][CONFIG['ATTRIB']['EXTENSIONNAME']]
                                        timeInterval = int(xmlQuery[0][CONFIG['ATTRIB']['TIMEINTERVAL']])
                                        #FIXME: is Time Interval of new extension the same as the ones allready collected? (in other scenarios)

                                        extensionObj = landis.Extension(extensionName, timeInterval)
                                        PROJECT[PROJECT.lastIdx].addExtension(extensionObj)
                                    else:
                                        raise Exception(xmlQuery, 'Empty result for the xml Query')
                                    
                                    # OUTPUTS
                                    
                                    xmlQuery = extensionFileXML.queryXML(CONFIG['XPATH']['OUTPUT'])
                                    
                                    if xmlQuery:
                                        for output in xmlQuery:
                                            if (output[CONFIG['ATTRIB']['VISUALIZE']]).lower() == 'true':
                                                if (output[CONFIG['ATTRIB']['OUTPUTTYPE']]).lower() == 'map':
                                                    outputObj = landis.MapOutput(output[CONFIG['ATTRIB']['OUTPUTTYPE']], output[CONFIG['ATTRIB']['OUTPUTNAME']])
                                                    outputObj.initMap(os.path.normpath(os.path.join(scenarioFolderPath, output[CONFIG['ATTRIB']['FILEPATHTEMPLATE']])), output[CONFIG['ATTRIB']['MAPUNIT']], output[CONFIG['ATTRIB']['DATATYPE']])
                                                    PROJECT[PROJECT.lastIdx][PROJECT[PROJECT.lastIdx].lastIdx].addOutput(outputObj)
                                            
                                                elif (output[CONFIG['ATTRIB']['OUTPUTTYPE']]).lower() == 'table':
                                                    outputObj = landis.TableOutput(output[CONFIG['ATTRIB']['OUTPUTTYPE']], output[CONFIG['ATTRIB']['OUTPUTNAME']])
                                                    outputObj.initTable(os.path.normpath(os.path.join(scenarioFolderPath, output[CONFIG['ATTRIB']['CSVFILEPATH']])))
                                                    fieldMetadataFilePath = os.path.normpath(os.path.join(scenarioFolderPath, output[CONFIG['ATTRIB']['METADATAFILEPATH']]))

                                                    fieldMetadataFile = utils.XMLreader(fieldMetadataFilePath) #, xsdFile!!! FIXME (!!! BE sHURE ALL IS MANDATORY!!!)
                                                    
                                                    #load field with attributes
                                                    fieldXmlQuery = fieldMetadataFile.queryXML(CONFIG['XPATH']['CSVFIELD'])

                                                    if fieldXmlQuery:
                                                        for field in fieldXmlQuery:
                                                            outputObj.addField(field)
                                                    else:
                                                        raise Exception(fieldXmlQuery, 'Empty result for the xml Query')
                                                    PROJECT[PROJECT.lastIdx][PROJECT[PROJECT.lastIdx].lastIdx].addOutput(outputObj)
                                            
                                    else:
                                        raise Exception(xmlQuery, 'Empty result for the xml Query')
                                        
                                else:
                                    raise Exception(metadataExtensionFilePath, 'is not a valid Metadata-Extension-XML file')
                    else:
                        raise Exception(scenarioMetadataFolderPath, 'is not a valid Metadata directory')
            else:
                raise Exception(xmlQuery, 'Empty result for the xml Query')
        except Exception as e:
            logLoadDataStruct.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logLoadDataStruct.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()
        
        PROJECT.registerProject()
        return PROJECT

    def __init__(self): 
        pass