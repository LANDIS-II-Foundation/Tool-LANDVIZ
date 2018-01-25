
# LANDIS-II-Visualization
# PreProc Tool patch
# Reads weblinks from XML and add links to HTML "Information" button
# 01/09/2018
# Makiko Shukunobe, Center for Geospatial Analitics, North Carolina State University

import os
import sys
import shutil
import logging
from lxml import etree
from bs4 import BeautifulSoup

class Weblinks(object):
    def __init__(self, xmlF, appPath, outPath):
        self.__htmlTemplateF = os.path.join(appPath, 'template\\template.html')
        self.__xmlF = xmlF
        self.__outHtmlPath = outPath + '\\index.html'
        self.addWeblinks()

    def addWeblinks(self):
        """
        Add weblinks from xml to html
        """
        try:
            logWeblinks = logging.getLogger('weblinks.addWeblinks')
            logWeblinks.info('Add weblinks')

            # remove index.html if the file exsists
            if (os.path.isfile(self.__outHtmlPath)):
                os.remove(self.__outHtmlPath)

            # get weblinks from xml file
            x = etree.parse(self.__xmlF)
            root = x.getroot()
            z = root.xpath('/weblinks/link')

            # I/O get template.html file
            html = open(self.__htmlTemplateF, 'r')

            if (len(z) > 0):
                logWeblinks.info('Weblinks found - Add links to index.html')
                soup = BeautifulSoup(html, 'html.parser')

                # find div to append <li><a href='' target='_blank></a><li>
                div = soup.find('div', {'id': 'dropdown-info-control'})
                ul = div.find_next('ul')
                for a in z:
                    txt = a.attrib['label']
                    li = soup.new_tag('li')
                    a = soup.new_tag(
                        'a', href=a.attrib['href'], target='_blank')
                    a.string = txt
                    li.append(a)
                    ul.append(li)
                    ul.append('\n')
                # write to a new file - index.html
                newhtml = open(self.__outHtmlPath, 'w')
                newhtml.write(str(soup))

                # close files
                html.close()
                newhtml.close()
                logWeblinks.info('Add links to index.html - completed')
            else:
                logWeblinks.info(
                    'No weblinks found in XML file - create index.html')
                # copy template.html
                shutil.copyfile(self.__htmlTemplateF, self.__outHtmlPath)
                logWeblinks.info('Copy index.html - completed')

        except Exception as e:
            print 'Exception@weblinks.addWeblinks:', e
            logging.error('Exception@weblinks.addWeblinks'.format(e))
            sys.exit()