# -*- coding: utf-8 -*-
import sys, os
import module_locator

def main(script, *args):
    print script
    appPath, appFile = os.path.split(os.path.normpath(os.path.realpath(script)))
    print appPath
    print appFile

    appPath, appFile = os.path.split(os.path.normpath(os.path.realpath(__file__)))
    print appPath
    print appFile

    my_path = module_locator.module_path()
    print my_path

if __name__ == '__main__':
    main(*sys.argv)