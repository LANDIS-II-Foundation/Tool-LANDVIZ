import os
import cherrypy
import webbrowser


PATH = os.path.abspath(os.path.dirname(__file__))
class Root(object): pass

if cherrypy.engine.state == cherrypy.engine.states.STARTED:
    cherrypy.engine.exit()

cherrypy.tree.mount(Root(), '/', config={
        '/': {
                'tools.staticdir.on': True,
                'tools.staticdir.dir': PATH,
                'tools.staticdir.index': 'index.html',
            },
    })

cherrypy.engine.start()
# cherrypy.engine.block()

new = 2
url = "http://localhost:8080"
webbrowser.open_new(url)
