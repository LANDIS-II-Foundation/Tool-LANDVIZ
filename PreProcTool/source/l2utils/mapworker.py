import sys, os
from osgeo import gdal
from osgeo import osr
import numpy as np
import time
from scipy import stats

class Mapworker(object):

    def __init__(self, srsWKT, geoExtent, scaleType):

        #self.loadSRSFromFile(ecoregion)
        self.in_prj = srsWKT
                
        #Get GeoTransform
        self.geoExtent = geoExtent

        self.scaleType = scaleType.lower()

        
    def process(self, in_fn, out_fn):
        #print in_fn

        #Open Map
        try:
            # start = time.time()
            self.openInputDataset(in_fn)
            # print "openDataset:", time.time() - start
        except Exception as e:
            print "Exception@Mapworker.openDataset:", e
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            sys.exit()

        # start = time.time()      
        statistics = self.createOutputDataset()
        # print "createOutputDataset:", time.time() - start

        # start = time.time()  
        self.exportToPng(self.out_ds, out_fn)
        # print "exportToPng:", time.time() - start

        # print "------------------"

        self.in_ds = None
        self.out_ds = None

        return statistics

    def loadSRSFromFile(self, ecoregion):
    
        #Open File
        ds = gdal.Open(ecoregion, gdal.GA_ReadOnly)
        if ds is None:
            return -1
            
        #Get Projection
        self.in_prj = ds.GetProjectionRef()
                
        #Get GeoTransform
        self.in_gt = ds.GetGeoTransform()
        
        ds = None

    def openInputDataset(self, in_fn):
        try:
            self.in_ds = gdal.Open(in_fn, gdal.GA_Update)
            if self.in_ds is None:
                return -1

            self.in_band_1 = self.in_ds.GetRasterBand(1)

            blockSizes = self.in_band_1.GetBlockSize()

            self.in_xBlockSize = blockSizes[0]
            self.in_yBlockSize = blockSizes[1]

            #Set Projection
            self.in_ds.SetProjection(self.in_prj)
            
            self.in_gt = [ float(self.geoExtent['ulx']), (float(self.geoExtent['lrx']) - float(self.geoExtent['ulx'])) / self.in_ds.RasterXSize, 0, float(self.geoExtent['uly']), 0, (float(self.geoExtent['lry']) - float(self.geoExtent['uly'])) / self.in_ds.RasterYSize ]

            #Set Geotransform
            self.in_ds.SetGeoTransform(self.in_gt)

            #Set NoData
            self.in_band_1.SetNoDataValue(0)

            self.in_min = self.in_band_1.GetMinimum()
            self.in_max = self.in_band_1.GetMaximum()
            
            if self.in_max == None or self.in_min == None:
                stats = self.in_band_1.GetStatistics(0, 1)
                self.in_min = stats[0]
                self.in_max = stats[1]
        except Exception as e:
            print "Exception@Mapworker.openDataset_IN:", e
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            sys.exit()

    def createOutputDataset(self):
        try:
            format = "MEM"  
            driver = gdal.GetDriverByName( format ) 

            self.out_ds = driver.Create('', self.in_ds.RasterXSize, self.in_ds.RasterYSize, 4)

            self.out_ds.SetProjection(self.in_prj)
            self.out_ds.SetGeoTransform(self.in_gt)

            self.out_ds.GetRasterBand(1).SetColorInterpretation(gdal.GCI_RedBand)
            self.out_ds.GetRasterBand(2).SetColorInterpretation(gdal.GCI_GreenBand)
            self.out_ds.GetRasterBand(3).SetColorInterpretation(gdal.GCI_BlueBand)
            self.out_ds.GetRasterBand(4).SetColorInterpretation(gdal.GCI_AlphaBand)

            # self.out_ds.GetRasterBand(1).SetNoDataValue(self.in_band_1.GetNoDataValue())
            # self.out_ds.GetRasterBand(2).SetNoDataValue(self.in_band_1.GetNoDataValue())
            # self.out_ds.GetRasterBand(3).SetNoDataValue(self.in_band_1.GetNoDataValue())
            # self.out_ds.GetRasterBand(4).SetNoDataValue(self.in_band_1.GetNoDataValue())
            statsDict = {}
            statsDict['minMaxUnmasked'] = list([self.in_min, self.in_max])
            #print 'minMax:', self.in_min, self.in_max
            statsDict['gdalDataType'] = int(self.in_band_1.DataType)
            #print 'gdalDataType:', self.in_band_1.DataType

            #statsDict['scaleType'] = self.scaleType
            #print 'scaleType:', self.scaleType

            if self.scaleType == 'ordinal':
                maskvalue1 = 1.0
                maskvalue2 = 0.0
            else:
                maskvalue1 = 0.0
                maskvalue2 = 0.0

            data_test = self.in_band_1.ReadAsArray()
            data_test_masked = np.ma.compressed(np.ma.masked_inside(data_test, maskvalue1, maskvalue2))
            if self.scaleType == 'nominal':
                statsDict['minMaxMasked'] = [np.asscalar(np.amin(data_test_masked)), np.asscalar(np.amax(data_test_masked))]
                statsDict['middle'] = (stats.mode(data_test_masked)[0]).tolist()
                #print 'mode', stats.mode(data_test_masked)
                statsDict['uniqueValsMaksed'] = (np.unique(data_test_masked)).tolist()
                #print 'unique values', np.unique(data_test_masked)
                
            if self.scaleType == 'ordinal':
                statsDict['minMaxMasked'] = [np.asscalar(np.amin(data_test_masked)), np.asscalar(np.amax(data_test_masked))]
                #print 'min max', np.amin(data_test_masked), np.amax(data_test_masked)
                statsDict['middle'] = np.asscalar(np.median(data_test_masked))
                #print 'median', np.median(data_test_masked)
            
            if self.scaleType == 'continuous':
                statsDict['minMaxMasked'] = [np.asscalar(np.amin(data_test_masked)), np.asscalar(np.amax(data_test_masked))]
                statsDict['middle'] =  np.asscalar(np.mean(data_test_masked))
               # print 'mean', np.mean(data_test_masked)                

            for i in range(0, self.in_ds.RasterYSize, self.in_yBlockSize):  
                if i + self.in_yBlockSize < self.in_ds.RasterYSize:  
                    rows = self.in_yBlockSize 
                else:  
                    rows = self.in_ds.RasterYSize - i  
                for j in range(0, self.in_ds.RasterXSize, self.in_xBlockSize):  
                    if j + self.in_xBlockSize < self.in_ds.RasterXSize:  
                        cols = self.in_xBlockSize  
                    else:  
                        cols = self.in_ds.RasterXSize - j
                    
                    data = self.in_band_1.ReadAsArray(j, i, cols, rows)
                    
                    o = np.empty((rows, cols), np.uint8)
                    o.fill(255)
                   # self.out_ds.GetRasterBand(4).WriteArray(o, j, i)

                    z = np.zeros((rows, cols), np.uint8)

                    data = np.add(data, 2147483648, dtype='uint32')
                    self.out_ds.GetRasterBand(1).WriteArray(np.bitwise_and(data, 0xff), j, i)
                    self.out_ds.GetRasterBand(2).WriteArray(np.bitwise_and(np.right_shift(data, 8), 0xff), j, i)
                    self.out_ds.GetRasterBand(3).WriteArray(np.bitwise_and(np.right_shift(data, 16), 0xff), j, i)
                    self.out_ds.GetRasterBand(4).WriteArray(np.bitwise_and(np.right_shift(data, 24), 0xff), j, i)
                    
                    # if self.in_band_1.DataType == 1: # GDT_Byte
                    #     self.out_ds.GetRasterBand(1).WriteArray(np.bitwise_and(data, 0xff), j, i)
                    #     self.out_ds.GetRasterBand(2).WriteArray(z, j, i)
                    #     self.out_ds.GetRasterBand(3).WriteArray(z, j, i)
                    #     self.out_ds.GetRasterBand(4).WriteArray(z, j, i)
                    
                    # elif self.in_band_1.DataType == 2: # GDT_UInt16
                    #     self.out_ds.GetRasterBand(1).WriteArray(np.bitwise_and(data, 0xff), j, i)
                    #     self.out_ds.GetRasterBand(2).WriteArray(np.bitwise_and(np.right_shift(data, 8), 0xff), j, i)
                    #     self.out_ds.GetRasterBand(3).WriteArray(z, j, i)
                    #     self.out_ds.GetRasterBand(4).WriteArray(z, j, i)

                    # elif self.in_band_1.DataType == 3: # GDT_Int16
                    #     data = np.add(data, 32768, dtype='uint16')
                    #     self.out_ds.GetRasterBand(1).WriteArray(np.bitwise_and(data, 0xff), j, i)
                    #     self.out_ds.GetRasterBand(2).WriteArray(np.bitwise_and(np.right_shift(data, 8), 0xff), j, i)
                    #     self.out_ds.GetRasterBand(3).WriteArray(z, j, i)
                    #     self.out_ds.GetRasterBand(4).WriteArray(z, j, i)

                    # elif self.in_band_1.DataType == 4: # GDT_UInt32
                    #     self.out_ds.GetRasterBand(1).WriteArray(np.bitwise_and(data, 0xff), j, i)
                    #     self.out_ds.GetRasterBand(2).WriteArray(np.bitwise_and(np.right_shift(data, 8), 0xff), j, i)
                    #     self.out_ds.GetRasterBand(3).WriteArray(np.bitwise_and(np.right_shift(data, 16), 0xff), j, i)
                    #     self.out_ds.GetRasterBand(4).WriteArray(np.bitwise_and(np.right_shift(data, 24), 0xff), j, i)

                    # elif self.in_band_1.DataType == 5: # GDT_Int32
                    #     #print np.amin(data), np.amax(data);
                    #     data = np.add(data, 2147483648, dtype='uint32')
                    #     #print np.amin(data), np.amax(data);
                    #     self.out_ds.GetRasterBand(1).WriteArray(np.bitwise_and(data, 0xff), j, i)
                    #     self.out_ds.GetRasterBand(2).WriteArray(np.bitwise_and(np.right_shift(data, 8), 0xff), j, i)
                    #     self.out_ds.GetRasterBand(3).WriteArray(np.bitwise_and(np.right_shift(data, 16), 0xff), j, i)
                    #     self.out_ds.GetRasterBand(4).WriteArray(np.bitwise_and(np.right_shift(data, 24), 0xff), j, i)
                    # else:
                    #     print "ERROR: DataType ({0}) is not valid!".format(self.in_band_1.DataType)
            
            return statsDict

        except Exception as e:
            print "Exception@Mapworker.createOutputDataset:", e
            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
            sys.exit()
                    

    def exportToPng(self, ds, out_fn):
        format = "PNG"  
        driver = gdal.GetDriverByName( format )  
        export_ds = driver.CreateCopy(out_fn, ds)
        export_ds.SetProjection(ds.GetProjectionRef())
        export_ds.SetGeoTransform(ds.GetGeoTransform())
        export_ds = None

def main():
    LANDIS = Mapworker("EcoRegions.img")

    LANDIS.process("input/acersacc-0.img","output/acersacc-0.png")
    LANDIS.process("input/acersacc-1.img","output/acersacc-1.png")
    LANDIS.process("input/acersacc-10.img","output/acersacc-10.png")
    LANDIS.process("input/acersacc-20.img","output/acersacc-20.png")
    
    LANDIS.process("input/poputrem-0.img","output/poputrem-0.png")
    LANDIS.process("input/poputrem-1.img","output/poputrem-1.png")
    LANDIS.process("input/poputrem-10.img","output/poputrem-10.png")
    LANDIS.process("input/poputrem-20.img","output/poputrem-20.png")
    
    # LANDIS.process("bio-reclass1-0.img", "bio-reclass1-0.png")
    # LANDIS.process("bio-reclass1-10.img", "bio-reclass1-10.png")
    # LANDIS.process("bio-reclass1-20.img", "bio-reclass1-20.png")
    # LANDIS.process("bio-reclass1-30.img", "bio-reclass1-30.png")

if __name__ == '__main__':
    main()   