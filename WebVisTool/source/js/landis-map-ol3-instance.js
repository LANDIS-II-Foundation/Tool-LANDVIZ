 ;(function ( $, window, document, undefined ) {

    //Raster Map
    $.widget('landis.rastermap', {
        options: {
            dataPath: '',
            mapId: '',
            scenarioId: '',
            timeInterval: 1,
            hiddenUIContainer: 'body'
        },
    // --------------------   
    // Basic Widget Methods
    // -------------------- 
        _create: function () {

            this.element.addClass('raster-map');
            
            
            this._visibleIdx = 0;
            this._hiddenIdx = 1;
            
            this._setOptions({
                'dataPath': this.options.dataPath,
                'mapId': this.options.mapId,
                'scenarioId': this.options.scenarioId,
                'timeInterval': this.options.timeInterval,
                'hiddenUIContainer': this.options.hiddenUIContainer
            });

            this._setupUserInerfaceAndEvents();
            this._setupDataLayer();
        },
        
        _destroy: function () {
            this.element.removeClass('raster-map');
            this.element.remove();
            this._super();
        },

        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    'scenarioMax': function () {
                        self._updateUI();
                     }
                };

            // check value
            // switch(key) {
            //     case 'option':
            //         value = parseInt(value);
            //         break;
            // }

            // base
            this._super(key, value);

            if (key in fnMap) {
                fnMap[key]();
                // Fire event
                this._triggerOptionChanged(key, prev, value);
            }

            
        },

        _triggerOptionChanged: function (optionKey, previousValue, currentValue) {
            this._trigger('setOption', {type: 'setOption'}, {
                option: optionKey,
                previous: previousValue,
                current: currentValue
            });
        },
    // ---------------------------
    // Setup UserInterface and Events Methods
    // ---------------------------
        _setupUserInerfaceAndEvents: function(){
            var self = this;
            self._mapBoxHeader = $('<div>')
                .addClass('mapbox-header')
                .text(landisMetadata.getScenarioAttributeById(self.options.scenarioId, 'name'))
                .appendTo(self.element);

            self._mapBox = $('<div>')
                .attr('id', 'rastermap-'+self.options.mapId)
                .addClass('mapbox')
                .appendTo(self.element);
        },

        updateTimeSeriesLayerMinMax: function(legendMin, legendMax, rangeMin, rangeMax){
            var self = this, i;

            for(i = 0; i < self._timeSeriesLayer.length; i++){
                self._timeSeriesLayer[i].setMinValue(legendMin);
                self._timeSeriesLayer[i].setMaxValue(legendMax);
                self._timeSeriesLayer[i].setMinVisible(rangeMin);
                self._timeSeriesLayer[i].setMaxVisible(rangeMax);
            }
        },

        updateTimeSeriesLayerColorRamp: function(colorRamp){
            var self = this, layers;
            layers = self._olMap.getLayers();
            //active layer
            layers.getAt(2).setColorRamp(colorRamp);
            //inactive layer
            inactiveLayer = layers.getAt(0).setColorRamp(colorRamp);

        },

        setGdalDataType: function(gdalDataType){
            var self = this, i;
            for( i = 0; i < self._timeSeriesLayer.length; i++){
                self._timeSeriesLayer[i].setDataType(gdalDataType);
            }
        },

        updateSize: function(){
            var self = this;
            self._olMap.updateSize();
        },

        _setupDataLayer: function(){
            var self = this, interval, time, i, colorRamp, dataTypedArray;
            self._timeSeriesSource = [];
            self._timeSeriesLayer = [];
            self._currentTime = $('#TimeControl').timeControl('option','currentTime');
            self._prevTime =  $('#TimeControl').timeControl('option','currentTime');
            
            self.basePath = landisSettings.settings.landisdata.path + "/" + landisSettings.settings.landisdata.modeldata

            //console.log('simulationInterval', this.options.timeInterval);
            interval = this.options.timeInterval;
            time = Math.floor(self._currentTime/interval)*interval;

            for(i = time; i <= time+interval; i += interval) {
                self._timeSeriesSource.push(
                    new ol.source.XYZ({
                            url: location.href.substring(0, location.href.lastIndexOf('/')) + "/" + self.basePath + "/" + self.options.dataPath + "/" + i + "/{z}/{x}/{y}.png"//,
                                   //location.href.substring(0, location.href.lastIndexOf('/')) + "/empty.png"]
                        })
                );
                //self._timeSeriesSource.length - 1].setUrl(location.href.substring(0, location.href.lastIndexOf('/')) + "/landis-model-data/modeldata/" +self.options.dataPath + "/" + i + "/{z}/{x}/{y}.png");

                self._timeSeriesLayer.push(
                    new ol.layer.Tile({
                        source: self._timeSeriesSource[self._timeSeriesSource.length - 1]
                        
                    })
                );

                colorRamp = new Array(
                    255,255,178,255,
                    254,204,92,255,
                    253,141,60,255,
                    240,59,32,255,
                    189,0,38,255
                  );
                dataTypedArray = new Uint8Array(colorRamp);

                //self._timeSeriesLayer[self._timeSeriesLayer.length - 1].time = self._currentTime;
                self._timeSeriesLayer[self._timeSeriesLayer.length - 1].setSaturation(1);
                self._timeSeriesLayer[self._timeSeriesLayer.length - 1].setColorRamp(dataTypedArray);
            }
        },

        updateDataLayer: function(){
            var self = this, timeMax, interval, time, isPlaying, help, layers, toShow, toHide;

            self._currentTime = $('#TimeControl').timeControl('option','currentTime');
            timeMax = $('#TimeControl').timeControl('option','timeMax');

            interval = self.options.timeInterval;
            time = Math.floor(self._currentTime/interval)*interval;

            isPlaying = $('#TimeControl').timeControl('isPlaying');

            if(isPlaying){ // && time != timeMax               
                //swap visible and hidden layer only if new time is different to old time
                if(time != self._prevTime) {
                    help = self._hiddenIdx;
                    self._hiddenIdx = self._visibleIdx;
                    self._visibleIdx = help;

                    //hidden idx set url
                    layers = self._olMap.getLayers();
                    toShow = layers.getAt(0);
                    toHide = layers.getAt(2);

                    layers.setAt(2, toShow);
                    layers.setAt(0, toHide);

                    //set url hidden layer
                    if(time < timeMax) {
                        self._timeSeriesSource[self._hiddenIdx].setUrl(location.href.substring(0, location.href.lastIndexOf('/')) + "/" + self.basePath + "/" + self.options.dataPath + "/" + (time + interval) + "/{z}/{x}/{y}.png");
                    }else{
                        //self._timeSeriesSource[self._hiddenIdx].setUrl(location.href.substring(0, location.href.lastIndexOf('/')) + "/landis-model-data/modeldata/" +self.options.dataPath + "/" + time+ "/{z}/{x}/{y}.png");
                        $('#TimeControl').timeControl('stopPlayback');
                    }
                }
            } else {
                self._timeSeriesSource[self._visibleIdx].setUrl(location.href.substring(0, location.href.lastIndexOf('/')) + "/" + self.basePath + "/" + self.options.dataPath + "/" + time + "/{z}/{x}/{y}.png");
                if(time < timeMax) {
                    self._timeSeriesSource[self._hiddenIdx].setUrl(location.href.substring(0, location.href.lastIndexOf('/')) + "/" + self.basePath + "/" + self.options.dataPath + "/" + (time + interval) + "/{z}/{x}/{y}.png");
                }
                //FIXME replace with renderFrame
                self.updateSize();
            }

            self._prevTime = time;
            

            

            //console.log(layers);
            
            //self._olMap.addLayer(self._timeSeriesLayer[idx]);
            //if(idx != -1){
            //    self._olMap.addLayer(self._timeSeriesLayer[idx]);
            //}


                        
        },

        getView: function(){
            var self = this;
            console.log("view:", self._olMap.getView());
        },

        drawMap: function(base_layer){
            var self = this,
                s = landisSettings.settings.map;
            console.log('DRAW MAP ID:'+self.options.mapId);

            self._olMap = new ol.Map({
                renderer: ol.RendererHint.WEBGL,
                target: self._mapBox.prop('id'),
                layers: [
                    self._timeSeriesLayer[self._hiddenIdx],
                    base_layer,
                    self._timeSeriesLayer[self._visibleIdx]
                    
                    ],
                view: new ol.View2D({
                    center: ol.proj.transform(s.center, 'EPSG:4326', 'EPSG:3857'),
                    resolution: s.resolution,
                    resolutions: s.resolutions,
                    extent: [
                        ol.proj.transform(s.extent[0], 'EPSG:4326', 'EPSG:3857')[0],
                        ol.proj.transform(s.extent[0], 'EPSG:4326', 'EPSG:3857')[1],
                        ol.proj.transform(s.extent[1], 'EPSG:4326', 'EPSG:3857')[0],
                        ol.proj.transform(s.extent[1], 'EPSG:4326', 'EPSG:3857')[1]
                    ]
                }),
                controls: ol.control.defaults().extend([
                        new ol.control.ScaleLine()
                     ])
            });

            //console.log("view:", self._olMap.getView());
    
            
            //self._timeSeriesLayer[self._hiddenIdx].setVisible(false);
            /*
            self._olMap.on('click', function (evt) {
                var coordinate = evt.getCoordinate();
                console.log(coordinate);
            });*/
          //console.log(self._olMap);
          return self._olMap;
        },

        getMapObject: function(){
            return self._olMap;
        },

        bindView: function(toMap){
            var self = this;
            self._olMap.bindTo('view', toMap);
        },


    // ---------------------------
    // Basic UserInterface Event Methods
    // ---------------------------
        _setupEvents: function() {

            //var self = this;
            return;
          

        }


    });

})( jQuery, window, document );