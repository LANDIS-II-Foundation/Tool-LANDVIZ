# -*- mode: python -*-

block_cipher = None


a = Analysis(['whereami.py'],
             pathex=['C:\\data\\development\\landviz\\py27\\LANDVIZ-master\\WhereAmI'],
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
          name='whereami',
          debug=False,
          strip=False,
          upx=True,
          console=True )
