#!/usr/bin/env python

import sys, os, shutil, math, logging
import l2data as landis, l2utils as utils
import tilertools
import json, time

class PreWorker(object):
    """
    - Assign Spatial Reference To Maps
    - Assign NoDataValue To Maps
    - get MinMax Values Over Time
    """
    def __init__(self, PROJECT, CONFIG): 
        self.PROJECT = PROJECT
        self.CONFIG = CONFIG
        
    def prepairTables(self):
        try:
            logPrepairTables = logging.getLogger('preworker.prepairTables')
            logPrepairTables.info('Start prepairing Table Output')
            start = time.time()
            for s in self.PROJECT:
                for e in s:
                    for o in e:
                        if o.outputType == "Table":
                            src = o.csvFilePath
                            dst = os.path.join(self.CONFIG['PROJECT']['OUTPUT_DIR'], 'landisdata', 'modeldata', str(s.scenarioIndex), str(e.extensionIndex), str(o.outputIndex)) + "\\" +str(o.outputIndex) + ".csv"
                            shutil.copyfile(src, dst)
            end = time.time()
            logPrepairTables.info('End prepairing Table Output [time: {} sec]'.format(end - start))
        except Exception as e:
            logPrepairTables.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logPrepairTables.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def prepairMaps(self):
        try:
            minZoom = self.PROJECT.zoomMin
            maxZoom = self.PROJECT.zoomMax
            z = self.PROJECT.getZoomString()

            print z

            logPrepairMaps = logging.getLogger('preworker.prepairMaps')
            logPrepairMaps.info('Start prepairing Map Output')

            start = time.time()

            for s in self.PROJECT:
                for e in s:
                    for o in e:
                        if o.outputType == "Map":
                            logPrepairMaps.info('scenario: {}'.format(s.scenarioName))
                            logPrepairMaps.info('extension: {}'.format(e.extensionName))
                            logPrepairMaps.info('output: {}'.format(o.outputName))
            
                            #FIXME: year 0 ??? s.timeMin + e.timeInterval
                            tempPathConcat = list()
                            for year in range(s.timeMin, s.timeMax + e.timeInterval, e.timeInterval):
                                rasterMapAtYear = os.path.normpath(self.getFilePath(o.filePathTemplate, str(year)))
                                #print rasterMapAtYear
                                if os.path.isfile(rasterMapAtYear):

                                    tempPath = os.path.join(self.CONFIG['PROJECT']['OUTPUT_DIR'], 'landisdata', 'modeldata', str(s.scenarioIndex), str(e.extensionIndex), str(o.outputIndex)) + "\\" + str(year) + ".png"
                                    tempPathConcat.append(tempPath)
                                    mw = utils.MapWorker(self.PROJECT.spatialReferenceWKT, self.PROJECT.geoExtent, o.dataType)
                                    logPrepairMaps.info('prepair year = {}'.format(year))
                                    stats = mw.process(rasterMapAtYear, tempPath)
                                    #print stats
                                    o.addStats(year, stats)

                                    tilesOutputDirTT = os.path.join(self.CONFIG['PROJECT']['OUTPUT_DIR'], 'landisdata', 'modeldata', str(s.scenarioIndex), str(e.extensionIndex), str(o.outputIndex))
                  
                                else:
                                    #rasterMapAtYear not exists ... data replacement?
                                    logPrepairMaps.info('prepair year = {} [year not available]'.format(year))
                            #tiling mit tilertools                            
                            tiling = tilertools.GdalTiler(['-s', '-p', 'xyz', '-z', z, '-t', tilesOutputDirTT] + tempPathConcat)

                            #delete tiling input
                            for temp in tempPathConcat:
                                os.remove(temp)
                                os.remove(temp+".aux.xml")

                            #print "STATS for ", o.outputName, o.getStats()
                            #statsDictToJson = {}
                            #statsDictToJson['byYear'] = dict(o.getStats())
                            overallTimeStats = {}
                            overallTimeStats = o.getOverallStats()
                            
                            if o.dataType == 'nominal':
                                classification = self.createNominalClassification(overallTimeStats['minMaxMasked'][0], overallTimeStats['minMaxMasked'][1], overallTimeStats['middle'], o.dataType)
                                classification['classes'] = overallTimeStats['uniqueValsMaksed']
                            elif o.dataType == 'ordinal':
                                classification = self.createOrdinalClassification(overallTimeStats['minMaxMasked'][0], overallTimeStats['minMaxMasked'][1], overallTimeStats['middle'], o.dataType)
                            elif o.dataType == 'continuous':
                                classification = self.createContinuousClassification(overallTimeStats['minMaxMasked'][0], overallTimeStats['minMaxMasked'][1], overallTimeStats['middle'], o.dataType)


                            statsDictToJson = {}
                            #if o.dataType == 'continuous':
                            statsDictToJson['classification'] = classification
                            statsDictToJson['overTime'] = overallTimeStats
                            #statsDictToJson['byTime'] = o.getStats()

                            # print statsDictToJson
                            # print statsDictToJson

                            j = json.dumps(statsDictToJson, sort_keys=True, indent=2)
                            f = open(os.path.normpath(os.path.join(self.CONFIG['PROJECT']['OUTPUT_DIR'], 'landisdata', 'modeldata', str(s.scenarioIndex), str(e.extensionIndex), str(o.outputIndex)) + '\metadata.stats.json'), 'w')
                            print >> f, j
                            f.close()
            end = time.time()
            logPrepairMaps.info('End prepairing Map Output [time: {} sec]'.format(end - start))
        except Exception as e:
            logPrepairMaps.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logPrepairMaps.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def createNominalClassification(self, min, max, middle, scaleType):
        try:
            # FIXME: classcount not fixed (from input file)
            logNominal = logging.getLogger('preworker.nominalClass')

            classification = {}
            classification['drawReverse'] = False
                       
            classification['legendMin'] = min
            classification['legendMax'] = max
            classification['legendMiddle'] = middle
            classification['colorSchema'] = 'qualitative'

            return classification
        except Exception as e:
            logNominal.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logNominal.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def createOrdinalClassification(self, min, max, middle, scaleType):
        try:

            logOrdinal = logging.getLogger('preworker.ordinalClass')

            # classCount = 4;
            classification = {}
            classification['drawReverse'] = False

            if min < 0 and max > 0:
                classification['colorSchema'] = 'diverging'
            if min > 0 and max > 0:
                classification['colorSchema'] = 'sequential'
            if min < 0 and max < 0:
                classification['colorSchema'] = 'sequential'
                classification['drawReverse'] = True

            classification['legendMin'] = min
            classification['legendMax'] = max
            classification['legendMiddle'] = middle
            classification['classes'] = []
            for i in range(min,max+1):
                classification['classes'].append(i)

            return classification
        except Exception as e:
            logOrdinal.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logOrdinal.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def createContinuousClassification(self, min, max, middle, scaleType):
            # FIXME: classcount not fixed (from input file)
        try:
            logContinuous = logging.getLogger('preworker.continuousClass')
            classCount =  self.PROJECT.initClassCount + 1;
            classification = {}
            classification['drawReverse'] = False

            # ColorSchema
            if min < 0 and max > 0:
                classification['colorSchema'] = 'diverging'
            if min > 0 and max > 0:
                classification['colorSchema'] = 'sequential'
            if min < 0 and max < 0:
                classification['colorSchema'] = 'sequential'
                classification['drawReverse'] = True

            operatorMin = self.getOperator(min)
            operatorMax = self.getOperator(max)
            operatorMiddle = math.trunc(math.log10(math.fabs(middle)))
               
            #if math.log(math.abs(min)):
 
            legendMin = math.floor(float(min)/operatorMin)*operatorMin
            legendMax = math.ceil(float(max)/operatorMax)*operatorMax
            legendMiddle = round(float(middle)/operatorMax)*operatorMax

            if legendMin == 0:
                legendMin = 1

            # print 'min: {0} => {1}'.format(min, legendMin)
            # print 'max: {0} => {1}'.format(max, legendMax)
            # print 'middle: {0} => {1}'.format(middle, legendMiddle)

            # if Diff of min and max is < class count ...

            classification['legendMin'] = legendMin
            classification['legendMax'] = legendMax
            classification['legendMiddle'] = legendMiddle
            classification['classes'] = []

            rightRange = legendMax - legendMiddle
            operator = self.getOperator(rightRange/(classCount/2))
            rightClassSize = round(float(rightRange/(classCount/2))/operator)*operator

            classification['classes'].append(legendMiddle);
            for i in range((classCount/2)-1):
                val = classification['classes'][len(classification['classes'])-1] + rightClassSize
                operator = self.getOperator(val)
                legendVal = round(float(val)/operator)*operator
                classification['classes'].append(legendVal);
            
            classification['classes'] = sorted(classification['classes'], reverse=True)
           #  print classification['classes']

            leftRange = legendMiddle - legendMin
            # print leftRange, classCount/2.0
            operator = self.getOperator(leftRange/(classCount/2.0))
            leftClassSize = round(float(leftRange/(classCount/2.0))/operator)*operator

            for i in range((classCount/2)-1):
                val = classification['classes'][len(classification['classes'])-1] - leftClassSize
                operator = self.getOperator(val)
                legendVal = round(float(val)/operator)*operator
                classification['classes'].append(legendVal);
            
            classification['classes'] = sorted(classification['classes'], reverse=False)
            # print classification['classes']
            #print min, max, middle, scaleType

            return classification

        except Exception as e:
            logContinuous.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logContinuous.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()

    def getOperator(self, value):
        try:
            logOperator = logging.getLogger('preworker.getOperator')
            if(value > 0):
                digits = math.trunc(math.log10(math.fabs(value)))
            else:
                digits = 0
            if digits <=3:
                return 10
            else:
                return 10**(digits-2)
        except Exception as e:
            logOperator.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logOperator.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()
            
    def getFilePath(self, pathTemplate, year):
        return (((pathTemplate.replace('{timestep}', year)).replace('[', '')).replace(']', '')).replace('/', '\\')
