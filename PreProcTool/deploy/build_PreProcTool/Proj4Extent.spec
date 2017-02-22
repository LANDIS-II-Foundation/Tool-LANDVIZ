# -*- mode: python -*-

block_cipher = None


a = Analysis(['..\\..\\src\\Proj4Extent.py'],
             pathex=['C:\\Users\\bmarr\\Desktop\\landviz_rebuilding\\LANDVIZ-master_GitHub\\PreProcTool\\deploy\\Pyinstaller_build_PreProcTool'],
             binaries=[],
             datas=[],
             hiddenimports=[],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          a.binaries,
          a.zipfiles,
          a.datas,
          name='Proj4Extent',
          debug=False,
          strip=False,
          upx=True,
          console=True )
