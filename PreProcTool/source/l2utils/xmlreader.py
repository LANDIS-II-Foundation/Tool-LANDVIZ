 #!/usr/bin/env python

import sys, os, logging
from lxml import etree

class XMLreader(object):
    # constructor
    def __init__(self, xmlFile, xsdFile = None): 
        try:
            logXml = logging.getLogger('xmlreader.init')

            #parse xml file
            self.__xmlTree = etree.parse(xmlFile)

            # if xsdFile is not None:
            #     #parse xsd file IF is there
            #     xmlSchema = etree.XMLSchema(etree.parse(xsdFile))
            #     #validate self.__xmlTree against self.__xmlSchema
            #     xmlSchema.assertValid(self.__xmlTree)


        except Exception as e:
            logXml.error('{}, {}'.format(e, xmlFile))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logXml.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()
        
    # public
    
    def queryXML(self, xpathString, attributeName = None):
        """
        Returns a List of Dicts with AttributeKey:Value
        
        #: xpathString   : query xpath string 
        #: attributeName : string of Attribute to return (OPTIONAL)
        """
        try:
            logQuery = logging.getLogger('xmlreader.query') 
            elementList = []
            for xmlElement in self.__xmlTree.xpath(xpathString):
                if attributeName is not None:
                    attribList = {}
                    if xmlElement.attrib.has_key(attributeName):
                        attribList[attributeName] = xmlElement.attrib[attributeName]
                        elementList.append(attribList)
                else:
                    elementList.append(xmlElement.attrib)
            
            if len(elementList) == 0:
                return False
            
            if len(elementList) == 1 and len(elementList[0]) == 1 and attributeName is not None:
                return elementList[0][attributeName]
                
            return elementList
            
        except Exception as e:
            logQuery.error('{}'.format(e))

            exc_type, exc_obj, exc_tb = sys.exc_info()
            fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
            logQuery.debug('{}::{}::{}'.format(exc_type, fname, exc_tb.tb_lineno))

            sys.exit()