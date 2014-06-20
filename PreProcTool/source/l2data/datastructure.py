#!/usr/bin/env python

import sys, os.path

###========================================================================###
class Project(object):
    """
    LANDIS VIS Project: Information about the Project
    Project Name
    Spatial Reference of Project
    """
###-Constructor------------------------------------------------------------###    
    def __init__(self, projectName = None):
        #Properties
        self.__projectName = projectName
        self.__scenarios = []
        self.__spatialReferenceWKT = ""
        self.__geoExtent = {}
        self.__zoomMin = 6 
        self.__zoomMax = 9
        self.__initZoom = 8
        self.__initContrast = 1
        self.__initBrightness = 0
        self.__initSaturation = 1
        self.__allResolutions = [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395]
        self.__initClassCount = 3
        self.__seqCol = "Blues"
        self.__divCol = "PiYG"
        self.__qualCol = "Paired"

###-Methods----------------------------------------------------------------###        
    
    def addScenario(self, scenario):
        self.__scenarios.append(scenario)
        
    def getExtensionList(self):
        extensionList = []
        for s in self.__scenarios:
            for e in s:
                extensionList.append(e.extensionName)
        return list(set(extensionList))
    
    def getExtensionDictWithScenarios(self):
        extensionDict = {}
        for s in self.__scenarios:
            for e in s:
                key = e.extensionName#.replace(' ', '_')
                if key in extensionDict and type(extensionDict[key]) == list:
                    extensionDict[key].append(s)
                else:
                    extensionDict[key] = []
                    extensionDict[key].append(s)
        return extensionDict
    
    def getOutputList(self):
        outputList = []
        for s in self.__scenarios:
            for e in s:
                for o in e:
                    outputList.append(o.outputName)
        return list(set(outputList))
        
    def groupRasterOutputsByExtensionAndOutput(self):
        extensionDict = {}
        for s in self.__scenarios:
            for e in s:
                ekey = e.extensionName
                if ekey not in extensionDict:
                    extensionDict[ekey] = {}
                for o in e:
                    okey = o.outputName
                    if okey in extensionDict[ekey] and type(extensionDict[ekey][okey]) == list:
                        extensionDict[ekey][okey].append(o)
                    else:
                        extensionDict[ekey][okey] = []
                        extensionDict[ekey][okey].append(o)

        return extensionDict

    def registerProject(self):
        sIdx = 0
        eIdx = 0
        oIdx = 0
        extensionDict = {}
        outputDict = {}
        for s in self.__scenarios:
            sIdx += 1
            s.scenarioIndex = sIdx
            for e in s:
                if e.getOutputNum() is not 0:
                    ekey = e.extensionName
                    if ekey not in extensionDict:
                        eIdx += 1
                        extensionDict[ekey] = eIdx
                        e.extensionIndex = eIdx
                    else:
                        e.extensionIndex = extensionDict[ekey]

                    for o in e:
                        if ekey not in outputDict:
                            outputDict[ekey] = {}
                            outputDict[ekey]['next-idx'] = 1
                        okey = o.outputName

                        if okey not in outputDict[ekey]:
                            outputDict[ekey][okey] = outputDict[ekey]['next-idx']
                            o.outputIndex = outputDict[ekey]['next-idx']
                            outputDict[ekey]['next-idx'] += 1
                        else:
                            o.outputIndex = outputDict[ekey][okey]
                        # if okey not in outputDict[ekey]:
                        #     extensionDict[ekey][okey].append(o)
                        # else:
                        #     extensionDict[ekey][okey] = []
                        #     extensionDict[ekey][okey].append(o)
                    else:
                        # FIXME: delete extension
                        pass
       # print outputDict


    def getScenarioDict(self):
        scenarioDict = {}
        for s in self.__scenarios:
            scenarioDict[s.scenarioIndex] = {}
            scenarioDict[s.scenarioIndex]['id'] = s.scenarioIndex
            scenarioDict[s.scenarioIndex]['name'] = s.scenarioName
            scenarioDict[s.scenarioIndex]['timeMin'] = s.timeMin
            scenarioDict[s.scenarioIndex]['timeMax'] = s.timeMax
        
        return scenarioDict
    
    def getExtensionOutputDict(self):
        extensionOutputDict = {}

        for s in self.__scenarios:
            for e in s:
                #extensionInfo = {'extensionId': e.extensionIndex, 'extensionName': e.extensionName, 'timeInterval': e.timeInterval, 'outputs':{}}
                if e.getOutputNum():
                    if not e.extensionIndex in extensionOutputDict.keys():
                        extensionOutputDict[e.extensionIndex] = {}
                        extensionOutputDict[e.extensionIndex]['extensionId'] = e.extensionIndex
                        extensionOutputDict[e.extensionIndex]['extensionName'] = e.extensionName
                        extensionOutputDict[e.extensionIndex]['timeInterval'] = e.timeInterval
                        extensionOutputDict[e.extensionIndex]['outputs'] = {}
                    for o in e:
                        if not o.outputIndex in extensionOutputDict[e.extensionIndex]['outputs'].keys():
                            extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex] = {}
                            extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex]['outputId'] = o.outputIndex
                            extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex]['outputName'] = o.outputName
                            extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex]['outputType'] = o.outputType
                            if (o.outputType).lower() == 'map':
                                extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex]['dataType'] = o.dataType
                                extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex]['unit'] = o.unit
                            elif (o.outputType).lower() == 'table':
                                extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex]['fields'] = []
                                for fieldDict in o.fields: # [{'a':1, 'b':'2'},{'a':4, 'b':5}]
                                    newFieldDict = {}
                                    for attribute in fieldDict:
                                         newFieldDict[attribute] = fieldDict[attribute]
                                    extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex]['fields'].append(newFieldDict)
                                #csvFilePath muss extra gemacht werden (weil jeder output anderes csv file)
                                #extensionOutputDict[e.extensionIndex]['outputs'][o.outputIndex]['csvFilePath'] =o.csvFilePath
                    # if not any(extensionInfo.get('extensionId', None) == e.extensionIndex for extensionInfo in extensionList):
                    #     for o in e:
                    #         extensionInfo['outputs'][o.outputIndex] = {}
                    #         extensionInfo['outputs'][o.outputIndex]['outputId'] = o.outputIndex
                    #         extensionInfo['outputs'][o.outputIndex]['outputName'] = o.outputName
                    #     extensionList.append(extensionInfo)



                # if len(extensionList) == 0:
                #     extensionList.append(extensionInfo)
                # else:
                #     for el in extensionList:
                #         if extensionInfo != el:
                #             extensionList.append(extensionInfo)
            
        
        return extensionOutputDict
        #print extensionList

        # for s in self.__scenarios:
        #     for e in s:
        #        extensionOutputDict[e.extensionIndex] = {}
        #        extensionOutputDict[e.extensionIndex]['extensionId'] = e.extensionIndex
        #        extensionOutputDict[e.extensionIndex]['extensionName'] = e.extensionIndex

    def getResolutions(self):
        return [self.__allResolutions[i] for i in range(self.__zoomMin, self.__zoomMax + 1)]

    def getInitResolution(self):
        return self.__allResolutions[self.__initZoom]

    def getZoomString(self):
        return ','.join(str(i) for i in range(self.__zoomMin, self.__zoomMax + 1))
        
###-Setter-&-Getter-[simple]-----------------------------------------------###   
    def __getitem__(self, i):
        return self.__scenarios[i]
        
    @property
    def lastIdx(self):
        return len(self.__scenarios)-1
        
    @property
    def projectName(self):
        return self.__projectName 

    @projectName.setter
    def projectName(self, value):
        self.__projectName = value

    @property
    def spatialReferenceWKT(self):
        return self.__spatialReferenceWKT 
               
    @spatialReferenceWKT.setter
    def spatialReferenceWKT(self, value):
        self.__spatialReferenceWKT = value

    @property
    def geoExtent(self):
        return self.__geoExtent
               
    @geoExtent.setter
    def geoExtent(self, value):
        self.__geoExtent = value

    @property
    def zoomMin(self):
        return self.__zoomMin
               
    @zoomMin.setter
    def zoomMin(self, value):
        if value < 0:
            value = 0
        if value > self.__zoomMax:
            value = self.__zoomMax
        self.__zoomMin = value
    
    @property
    def zoomMax(self):
        return self.__zoomMax
               
    @zoomMax.setter
    def zoomMax(self, value):
        if value > 18:
            value = 18
        if value < self.__zoomMin:
            value = self.__zoomMin

        self.__zoomMax = value

    @property
    def initZoom(self):
        return self.__initZoom
               
    @initZoom.setter
    def initZoom(self, value):
        if value > self.__zoomMax:
            value = self.__zoomMax
        if value < self.__zoomMin:
            value = self.__zoomMin

        self.__initZoom = value

    @property
    def initBrightness(self):
        return self.__initBrightness
               
    @initBrightness.setter
    def initBrightness(self, value):
        if value > 1:
            value = 1
        if value < -1:
            value = -1

        self.__initBrightness = value

    @property
    def initContrast(self):
        return self.__initContrast
               
    @initContrast.setter
    def initContrast(self, value):
        if value > 2:
            value = 2
        if value < 0:
            value = 0

        self.__initContrast = value

    @property
    def initSaturation(self):
        return self.__initSaturation
               
    @initSaturation.setter
    def initSaturation(self, value):
        if value > 2:
            value = 2
        if value < 0:
            value = 0

        self.__initSaturation = value

    @property
    def mapSource(self):
        return self.__mapSource
               
    @mapSource.setter
    def mapSource(self, value):
        self.__mapSource = value

    @property
    def initClassCount(self):
        return self.__initClassCount
               
    @initClassCount.setter
    def initClassCount(self, value):
        if value < 2:
            value = 2
        if value > 9:
            value = 9
        self.__initClassCount = value

    @property
    def seqCol(self):
        return self.__seqCol
               
    @seqCol.setter
    def seqCol(self, value):
        self.__seqCol = value

    @property
    def divCol(self):
        return self.__divCol
               
    @divCol.setter
    def divCol(self, value):
        self.__divCol = value

    @property
    def qualCol(self):
        return self.__qualCol
               
    @qualCol.setter
    def qualCol(self, value):
        self.__qualCol = value

###========================================================================###    
class Scenario(object):
    """
    LANDIS Scenario Replication
    """
###-Constructor------------------------------------------------------------###   
    def __init__(self, scenarioName = None, timeMin = 0, timeMax = None, rasterOutputCellSize = None, extent = None):
        #Properties
        try:
            self.__scenarioIndex = None
            self.__scenarioName = scenarioName
            self.__timeMin = timeMin
            self.__timeMax = timeMax
            self.__rasterOutputCellSize = rasterOutputCellSize

            self.__extensions = []

        except Exception as e:
            print "Exception@Datastructure.Scenario.init:", e
            logging.error("Exception@Datastructure.Scenario.init: {}".format(e))
            sys.exit()
        
###-Methods----------------------------------------------------------------###
    def addExtension(self, extension):
        self.__extensions.append(extension)
    
    def getExtensionList():
        pass
        
###-Setter-&-Getter-[simple]-----------------------------------------------###
    def __getitem__(self, i):
        return self.__extensions[i]
    
    @property
    def lastIdx(self):
        return len(self.__extensions)-1
    
    @property
    def scenarioName(self):
        return self.__scenarioName        
    @scenarioName.setter
    def scenarioName(self, value):
        self.__scenarioName = value

    @property
    def scenarioIndex(self):
        return self.__scenarioIndex        
    @scenarioIndex.setter
    def scenarioIndex(self, value):
        self.__scenarioIndex = value
     
    @property
    def timeMin(self):
        return self.__timeMin        
    @timeMin.setter
    def timeMin(self, value):
        self.__timeMin = value
     
    @property
    def timeMax(self):
        return self.__timeMax        
    @timeMax.setter
    def timeMax(self, value):
        self.__timeMax = value
        
    @property
    def rasterOutputCellSize(self):
        return self.__rasterOutputCellSize        
    @rasterOutputCellSize.setter
    def rasterOutputCellSize(self, value):
        self.__rasterOutputCellSize = value
     
###========================================================================###        
class Extension(object):
    """
    LANDIS Extension
    """
###-Constructor------------------------------------------------------------###   
    def __init__(self, extensionName = None, timeInterval = None):
        #Properties
        self.__extensionIndex = None
        self.__extensionName = extensionName
        self.__timeInterval = timeInterval
        
        self.__outputs = []
        
###-Methods----------------------------------------------------------------###
    def addOutput(self, output):
        self.__outputs.append(output)
    
    def getOutputList(self):
        pass

    def getOutputNum(self):
        return len(self.__outputs)
        
###-Setter-&-Getter-[simple]-----------------------------------------------###       
    def __getitem__(self, i):
        return self.__outputs[i]
    
    @property
    def lastIdx(self):
        return len(self.__outputs)-1
        
    @property
    def extensionName(self):
        return self.__extensionName        
    @extensionName.setter
    def extensionName(self, value):
        self.__extensionName = value

    @property
    def extensionIndex(self):
        return self.__extensionIndex        
    @extensionIndex.setter
    def extensionIndex(self, value):
        self.__extensionIndex = value
        
    @property
    def timeInterval(self):
        return self.__timeInterval        
    @timeInterval.setter
    def timeInterval(self, value):
        self.__timeInterval = value
        
###========================================================================###
class Output(object):
    """
    LANDIS Output
    """
    def __init__(self, outputType = None, outputName = None):
        self.__outputIndex = None
        self.__outputType = outputType
        self.__outputName = outputName
        
    def getScenarioAndExtension(self, PROJECT):
        for s in PROJECT:
                for e in s:
                    if self in e:
                        return s, e
        return False
    
###-Setter-&-Getter-[simple]-----------------------------------------------###            
    @property
    def outputName(self):
        return self.__outputName        
    @outputName.setter
    def outputName(self, value):
        self.__outputName = value
        
    @property
    def outputType(self):
        return self.__outputType
        
    @outputType.setter
    def outputType(self, value):
        self.__outputType = value 

    @property
    def outputIndex(self):
        return self.__outputIndex        
    @outputIndex.setter
    def outputIndex(self, value):
        self.__outputIndex = value
###========================================================================###  
#FIXME FIGURE OUT ATTRIBUTES
class MapOutput(Output):
    """
        MapOutput
    """
    def initMap(self, filePathTemplate = None, unit = None, dataType = None, noData = 0):
        self.__filePathTemplate = filePathTemplate
        self.__unit = unit
        self.__dataType = dataType
        self.__noData = noData
        self.__min = 0
        self.__max = 0
        self.__statistics = {}

    def addStats(self, year, stats):
        self.__statistics[year] = stats

    def getStats(self):
        return self.__statistics

    def getOverallStats(self):
        try:
            stats = {}
            for year in self.__statistics:
                for stat in self.__statistics[year]:
                    # check if stat is allready in statsDict for export
                    if stat in stats:
                        #addTo
                        if stat == 'gdalDataType':
                            if stats[stat] != self.__statistics[year][stat]:
                                raise Exception("gdalDataType is not constant for output {0}".format(self.__outputName))
                        elif stat == 'minMaxUnmasked' or stat == 'minMaxMasked':
                            if stats[stat][0] > self.__statistics[year][stat][0]:
                                stats[stat][0] = self.__statistics[year][stat][0]
                            if stats[stat][1] < self.__statistics[year][stat][1]:
                                stats[stat][1] = self.__statistics[year][stat][1]
                        elif stat == 'middle' and self.__dataType.lower() == 'continuous':
                            stats[stat] += self.__statistics[year][stat]
                        elif stat == 'uniqueValsMaksed' and self.__dataType.lower() == 'nominal':
                            stats[stat] =list(set(stats[stat] + self.__statistics[year][stat]))
                    else:
                        #if not add a new entry with the value of the first year
                        if type(self.__statistics[year][stat]) == list:
                            stats[stat] = self.__statistics[year][stat][:]
                        else:
                            stats[stat] = self.__statistics[year][stat]

            if self.__dataType.lower() == 'continuous':
                stats['middle'] /= len(self.__statistics);
            return stats
        except Exception as e:
            print "Exception@datastructure:getOverallstats", e
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            sys.exit()
        
###-Setter-&-Getter-[simple]-----------------------------------------------###            
    @property
    def filePathTemplate(self):
        return self.__filePathTemplate        
    @filePathTemplate.setter
    def filePathTemplate(self, value):
        self.__filePathTemplate = value
        
    @property
    def noData(self):
        return self.__noData        
    @noData.setter
    def noData(self, value):
        self.__noData = value
        
    @property
    def min(self):
        return self.__min        
    @min.setter
    def min(self, value):
        self.__min = value
        
    @property
    def max(self):
        return self.__max        
    @max.setter
    def max(self, value):
        self.__max = value

    @property
    def unit(self):
        return self.__unit        
    @unit.setter
    def unit(self, value):
        self.__unit = value
        
    @property
    def dataType(self):
        return self.__dataType.lower()        
    @dataType.setter
    def dataType(self, value):
        self.__dataType = value.lower()
        
###========================================================================###    
class TableOutput(Output):
    """
    LANDIS TableOutput
    """
    def initTable(self, csvFilePath = None):
        self.__csvFilePath = csvFilePath
        self.__fields = []


    def addField(self, fieldDict):
        self.__fields.append(fieldDict)

###-Setter-&-Getter-[simple]-----------------------------------------------###            
    @property
    def csvFilePath(self):
        return self.__csvFilePath        
    @csvFilePath.setter
    def csvFilePath(self, value):
        self.__csvFilePath = value

    @property
    def fields(self):
        return self.__fields    
    @fields.setter
    def fields(self, value):
        self.__fields = value

###========================================================================###    

    
def main(script, *args):
    pass
    
if __name__ == '__main__':
    main(*sys.argv)