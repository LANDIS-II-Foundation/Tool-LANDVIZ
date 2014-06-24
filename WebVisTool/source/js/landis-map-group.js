;(function ( $, window, document, undefined ) {

    //Raster Map Group Widget
    $.widget('landis.rastermapgroup', {
        options: {
            scenarios: [],
            unit: '',
            extensionId: '',
            extensionName: '',
            outputId: '',
            outputName: '',
            timeInterval: 1,
            dataType: 'continuous',
            hiddenUIContainer: 'body'
        },
    // --------------------   
    // Basic Widget Methods
    // -------------------- 
        _create: function () {

            this.rasterMaps = [];
            //this.stats = {};
            this.legendMinMax = [];
            
            this.element.addClass('map-group');
            
            this._setupUserInerfaceAndEvents();

            switch (landisSettings.settings.map.basemap.source) {
                case "plain":
                    this._baseLayer = new ol.layer.Tile({
                        source: new ol.source.XYZ({
                            url: location.href.substring(0, location.href.lastIndexOf('/')) + "/img/black.png"
                        })
                    });
                    break;

                case "osm":
                    this._baseLayer = new ol.layer.Tile({
                        source: new ol.source.OSM()
                    });
                    break;

                case "toner":
                    this._baseLayer = new ol.layer.Tile({
                        source: new ol.source.Stamen({
                        layer: 'toner'})
                    });
                    break;
                case "terrain":
                case "stamen":
                default:
                    this._baseLayer = new ol.layer.Tile({
                        source: new ol.source.Stamen({
                        layer: 'terrain'})
                    });
            }

            this._baseLayer.setSaturation(landisSettings.settings.map.basemap.saturation);
            this._baseLayer.setBrightness(landisSettings.settings.map.basemap.brightness);
            this._baseLayer.setContrast(landisSettings.settings.map.basemap.contrast);

            this._setOptions({
                'scenarios': this.options.scenarios,
                'unit': this.options.unit,
                'extensionId': this.options.extensionId,
                'extensionName': this.options.extensionName,
                'outputId': this.options.outputId,
                'outputName': this.options.outputName,
                'timeInterval': this.options.timeInterval,
                'dataType': this.options.dataType,
                'baseLayer': this.options.baseLayer,
                'hiddenUIContainer': this.options.hiddenUIContainer
            });

        },
        
        _destroy: function () {
            this.element.removeClass('map-group');
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
                    // 'mainScenarioId': function () {
                    //     //publish changes !!!
                    //     $.pubsub( 'publish', T_CHANGESCENARIOS, 'mainScenarioId' );
                    //     self._updateText('#main-scenario-text' , self.options.scenarios[self.options.mainScenarioId].name);

                    // },
                    // 'compareScenarioId': function () {
                    //     $.pubsub( 'publish', T_CHANGESCENARIOS, 'compareScenarioId' );
                    //     if(self.options.compareMode){
                    //         self._updateText('#compare-scenario-text' , self.options.scenarios[self.options.compareScenarioId].name);
                    //     }
                        
                    // },
                    // 'compareMode': function () {
                    //     $.pubsub( 'publish', T_CHANGESCENARIOS, 'compareMode' );
                    //     if(self.options.compareMode){
                    //         self._updateText('#compare-scenario-text' , self.options.scenarios[self.options.compareScenarioId].name);
                    //     } else {
                    //         self._updateText('#compare-scenario-text' , 'no scenario selected');
                    //     }

                    // }
                };

            // check value
            //FIXME Check if selectedScenarioIds.length is within Limits (minMax)
            //FIXME Check if min Max make sense... means ... if only 2 scenarios are there ... 4 doesnt make sense ...
            switch(key) {
                case 'mainScenarioId':
                    value = parseInt(value);
                    break;
                case 'compareScenarioId':
                    value = parseInt(value);
                    break;
                case 'timeMax':
                    if(value <= self.options.currentTime) {
                        value = self.options.currentTime;
                    } 
                    break;
            }
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
            
            var self = this,
                widthClass = 'one';

            self._olMapObjects = [];
 
            if(self.options.scenarios.length > 1){
                widthClass = 'two';
            }
            // Main Container
            self._mapGroup = $('<div>')
                .addClass('map-group-container')
                .addClass(widthClass)
                //.draggable({ containment: "#ApplicationData" })
                .appendTo(self.element);

            //header
            self._mapGroupHeader = $('<div>')
                .addClass('map-group-header')
                .text(self.options.extensionName + ': ' + self.options.outputName + ' ['+ self.options.unit+ ']')
                .appendTo(self._mapGroup);

            //contentContainer
            self._mapGroupContent = $('<div>')
                .addClass('map-group-content')
                .appendTo(self._mapGroup);

            //maps

            self._mapGroupMaps = $('<div>')
                .addClass('map-group-maps')
                .appendTo(self._mapGroupContent);

            //console.log(self.options.scenarios)
            for(s in self.options.scenarios) {
                self._createRasterMap(s)
            }
              

            //legend

            self._mapGroupSideBar = $('<div>')
                .addClass('map-group-sidebar')
                .appendTo(self._mapGroupContent);
            

            //FIXME: put into legend !!!
            if(self.options.dataType != 'nominal') {
                self._maxValue = $('<div>')
                    //.attr('id','maxValue')
                    .html('max: <span class="legMax" style="color: #6699CC">legMax</span> (<span class="visMax" style="color: #6699CC">visMax</span>)')
                    .css({'font-size':'10pt', 'margin-bottom': '8px'})
                    .appendTo(self._mapGroupSideBar);
            }
            

            self._mapGroupLegend = $('<div>')
                .attr('id','mgcs-'+self.getMapGroupId())
                .appendTo(self._mapGroupSideBar);
            
            if(self.options.dataType != 'nominal') {
                self._minValue = $('<div>')
                    //.attr('id','minValue')
                    .html('min: <span class="legMin" style="color: #6699CC">legMin</span> (<span class="visMin" style="color: #6699CC">visMin</span>)<br /> (<span style="color: #6699CC">visible range</span>)')
                    .css({'font-size':'10pt', 'margin-top': '8px'})
                    .appendTo(self._mapGroupSideBar);
            }

            self._allowModeChange = false;
            if(self.options.dataType != 'nominal'){
                self._allowModeChange = true;
            }

            if(self._allowModeChange) {
                $('<br>').appendTo(self._mapGroupSideBar);
                self._modeChange = $('<input>')
                    .attr('type', 'checkbox')
                    .attr('name', 'checkbox-mode-change')
                    .attr('id', 'checkbox-mode-change-'+self.getMapGroupId())
                    .prop('checked', false)
                    .addClass('css-checkbox')
                    .on('change', function(event) { 
                        self._mapGroupLegend.mapLegend('option', 'categorical', $(this).is(':checked'));
                    })
                    .appendTo(self._mapGroupSideBar);

                $('<label>')
                    .attr('for', 'checkbox-mode-change-'+self.getMapGroupId())
                    .text('categorical')
                    .addClass('css-label')
                    .appendTo(self._mapGroupSideBar);

            }
                
                
        },

        drawMapLegend: function(){
            var self = this;
            self._mapGroupLegend.mapLegend({
                    min: self.legendMinMax[0],
                    max: self.legendMinMax[1],
                    filterMin: self.legendMinMax[0],
                    filterMax: self.legendMinMax[1],
                    handles: self.generateHandles(),
                    dataType: self.options.dataType,
                    mapGroupId: self.getMapGroupId(),
                    handleLimit: 9,
                    categorical: false}); //FIXME ... based on data
        },

        getMapGroupId: function(){
            var self = this;
            return self.options.extensionId + '-' + self.options.outputId;
        },

        updateColorRamp: function(){
            var self = this,
                ramp = self._mapGroupLegend.mapLegend('getWebGlColorRamp'),
                i;
            for(i = 0; i < self.rasterMaps.length; i++) {
                self.rasterMaps[i].rastermap('updateTimeSeriesLayerColorRamp', ramp);
            }

        },

        generateHandles: function(){
            var self = this,
                i, j,
                h = [],
                c,
                color = (self.options.dataType === 'nominal') ? (landisSettings.settings.map.legend.qualCol) : ((self.stats.classification.colorSchema === 'diverging') ? (landisSettings.settings.map.legend.divCol) : (landisSettings.settings.map.legend.seqCol)),
                nClasses = self.stats.classification.classes.length,
                limit = (self.stats.classification.colorSchema === 'sequential') ? (9) : ((self.stats.classification.colorSchema === 'diverging') ? (11) : (12)),
                nColors,
                nColorsToAdd,
                randColor;
            //console.log("LIMIT", limit);

            if(nClasses > limit) {
                nColors = limit;
                nColorsToAdd = nClasses - limit;
            } else {
                nColors = nClasses;
            }

            c = colorbrewer[self.stats.classification.colorSchema][color][nColors];
            for(j = 0; j < nColorsToAdd; j++) {
                if($.inArray(randColor = getRandomColor(), c) === -1) {
                    c.push(randColor);
                } else {
                   j-- 
                }
                
            }

            for(i = 0; i < self.stats.classification.classes.length; i++){
                h.push({value: self.stats.classification.classes[i], color: c[i]});
            }
            //console.log(h)
            return h;
        },



    // ---------------------------
    // Basic UserInterface Event Methods
    // ---------------------------
        _setupEvents: function() {

            //var self = this;

          return;

        },

        _createRasterMap: function(sId){
            var self = this,
                rasterMapId = self.options.extensionId + '-' + self.options.outputId + '-' + self.options.scenarios[sId],
                rasterMap = $('<div>')
                    .addClass('raster-map')
                    .attr('id', rasterMapId)
                    //.text(self.options.scenarios[sId] + '>>' + self.options.extensionName + '>>' + self.options.outputName)
                    //.append($('<p>').text("url: /landis-model-data/modeldata/"+self.options.scenarios[sId]+"/"+self.options.extensionId+"/"+self.options.outputId+"/{t}/{z}/{x}/{y}.png"))
                    .appendTo(self._mapGroupMaps);
            

            rasterMap.rastermap({
                dataPath: self.options.scenarios[sId]+'/'+self.options.extensionId+'/'+self.options.outputId,
                mapId: rasterMapId,
                scenarioId: self.options.scenarios[sId],
                timeInterval: self.options.timeInterval

            });

            self.rasterMaps.push(rasterMap);
            /*
            var lMin, lMax, rMin, rMax;
            lMin = 1;
            lMax = 21300;
            rMin = 1;
            rMax = 21300;
            for(var i = 0; i < self.rasterMaps.length; i++) {
                self.rasterMaps[i].rastermap('updateTimeSeriesLayerMinMax', lMin, lMax, rMin, rMax);
            }*/

            

        },

        getRasterMapsCountInGroup: function(){
            var self = this;
            return self.rasterMaps.length;
        },

        setupMinMax: function(){
            var self = this,
                lMin = self.legendMinMax[0],
                lMax = self.legendMinMax[1],
                rMin = self.legendMinMax[0],
                rMax = self.legendMinMax[1],
                i;

            if(self.options.dataType != 'nominal') {
                self._writeMinMaxToLegend(rMax, rMin, lMax, lMin);
            }

            for( i = 0; i < self.rasterMaps.length; i++) {
                self.rasterMaps[i].rastermap('updateTimeSeriesLayerMinMax', lMin, lMax, rMin, rMax);
            }

        },

        updateMinMax: function(){
            var self = this,
                lMin =  self.legendMinMax[0],
                lMax =  self.legendMinMax[1],
                rMin,
                rMax,
                i;

            self._mapGroupLegend.mapLegend('option', 'min', lMin);
            self._mapGroupLegend.mapLegend('option', 'max', lMax);

            rMin = self._mapGroupLegend.mapLegend('option', 'filterMin');
            rMax = self._mapGroupLegend.mapLegend('option', 'filterMax');

            if(self.options.dataType != 'nominal') {
                self._writeMinMaxToLegend(rMax, rMin, lMax, lMin);
            }

            for(i = 0; i < self.rasterMaps.length; i++) {

                self.rasterMaps[i].rastermap('updateTimeSeriesLayerMinMax', lMin, lMax, rMin, rMax);
            }



        },

        _writeMinMaxToLegend: function(rMax, rMin, lMax, lMin){
            var self = this;

            self._maxValue.find('.visMax').html(rMax);
            self._minValue.find('.visMin').html(rMin);
            self._maxValue.find('.legMax').html(lMax);
            self._minValue.find('.legMin').html(lMin);
        },

        setGdalDataType: function(){
            var self = this,
                i;
            for(i = 0; i < self.rasterMaps.length; i++) {
                self.rasterMaps[i].rastermap('setGdalDataType', self.gdalDataType);
            }
        },

        getFirstMap: function(){
            var self = this;
            if (self._olMapObjects.length > 0){
                return self._olMapObjects[0];
            } else {
                return false;
            }
            
        },
        getAllMapObjects: function(){
            var self = this;
            if (self._olMapObjects.length > 0){
                return self._olMapObjects;
            } else {
                return false;
            }
            
        },

        drawRasterMaps: function(){
            var self = this,
                mapObject,
                rm;
            for(rm = 0; rm < self.rasterMaps.length; rm++){
                mapObject = self.rasterMaps[rm].rastermap('drawMap', self._baseLayer);
                self._olMapObjects.push(mapObject);

            }

            self.rearangeMapsInMapGroup();
        },

        drawLastAddedRasterMap: function(){
            var self = this,
                mapObject = self.rasterMaps[self.rasterMaps.length-1].rastermap('drawMap', self._baseLayer);
            self._olMapObjects.push(mapObject);
        },

        bindRasterMapViews: function(bindToMap){
            var self = this
                mo;
            for(mo = 0; mo < self._olMapObjects.length; mo++){
                if(mo > 0){
                    self.rasterMaps[mo].rastermap('bindView', bindToMap);
                }
            }
        },

        updateTime: function(){
            var self = this,
                rm;
            for(rm = 0; rm < self.rasterMaps.length; rm++){
                self.rasterMaps[rm].rastermap('updateDataLayer');
            }
        },

        updateSizeOfMaps: function(){
            var self = this,
                i;

            for(i=0; i < self.rasterMaps.length; i++){
                self.rasterMaps[i].rastermap('updateSize');
            }
        },

        rearangeMapsInMapGroup: function(){
            //console.log("rearange maps in mapgroup")
            var self = this,
                ratio = self._mapGroupMaps.outerHeight()/self._mapGroupMaps.outerWidth(),
                i;
            switch(self.rasterMaps.length){
                case 1:
                    self.rasterMaps[0].outerHeight(self._mapGroupMaps.outerHeight());
                    self.rasterMaps[0].outerWidth(self._mapGroupMaps.outerWidth());
                    break;
                case 2:
                    if(ratio < 1.2) {
                        for(i = 0; i < self.rasterMaps.length; i++){
                            self.rasterMaps[i].outerHeight(self._mapGroupMaps.outerHeight());
                            self.rasterMaps[i].outerWidth(self._mapGroupMaps.outerWidth()*0.5);
                        }
                    } else {
                        for(i = 0; i < self.rasterMaps.length; i++){
                            self.rasterMaps[i].outerHeight(self._mapGroupMaps.outerHeight()*0.5);
                            self.rasterMaps[i].outerWidth(self._mapGroupMaps.outerWidth());
                        }
                    }
                    break;
                case 3:
                case 4:
                    if(ratio > 1) {
                        for(i = 0; i < self.rasterMaps.length; i++){
                            self.rasterMaps[i].outerHeight(self._mapGroupMaps.outerHeight()*0.5);
                            self.rasterMaps[i].outerWidth(self._mapGroupMaps.outerWidth()*0.5);
                        }
                    } else {
                        for(i = 0; i < self.rasterMaps.length; i++){
                            self.rasterMaps[i].outerHeight(self._mapGroupMaps.outerHeight()*0.5);
                            self.rasterMaps[i].outerWidth(self._mapGroupMaps.outerWidth()*0.5);
                        }
                    }
                    break;
            }
        },

        loadStatsForMapsInMapGroup: function(){
            var self = this,
                //statsArr = [],
                mins = [],
                maxs = [],
                dataTypes = [],
                i, mapId, eosIds, stats;

            self.legendMinMax = [];

            for(i=0; i < self.rasterMaps.length; i++){
                mapId = self.rasterMaps[i].rastermap('option', 'mapId');
                //console.log('stats for : ' + mapId);
                eosIds = mapId.split('-');
                stats = loadJson(
                    landisSettings.settings.landisdata.path + '/'
                    + landisSettings.settings.landisdata.modeldata + '/'
                    + eosIds[2] + '/' + eosIds[0] + '/' + eosIds[1]
                    + '/metadata.stats.json'
                );
                self.stats = stats;
                //console.log(stats, stats.classification.legendMin, stats.classification.legendMax);
                mins.push(stats.classification.legendMin);
                maxs.push(stats.classification.legendMax);
                dataTypes.push(stats.overTime.gdalDataType);

            }
            self.gdalDataType = dataTypes[0];
            self.legendMinMax[0] = Math.min.apply(Math, mins);
            self.legendMinMax[1] = Math.max.apply(Math, maxs);
            self.setupMinMax();
            self.setGdalDataType();
            
        },

        updateRasterMaps: function(newScenarios) {
            var self = this,
                rasterMapsToDelete = [],
                seen;

            //console.log(self.options.scenarios, newScenarios); 
            for(os in self.options.scenarios) {
                seen = -1;
                for (ns in newScenarios) {
                    if(newScenarios[ns] == self.options.scenarios[os]){
                        seen = os;
                        break;
                    }
                }

                if(seen === -1){
                    rasterMapsToDelete.push(os);
                }
            }
            rasterMapsToDelete.sort();
            rasterMapsToDelete.reverse();
         
            for(map in rasterMapsToDelete){
                
                self.options.scenarios.splice(rasterMapsToDelete[map],1);
                self.rasterMaps[rasterMapsToDelete[map]].rastermap('destroy');
                self.rasterMaps.splice(rasterMapsToDelete[map],1);
            }
            

            for(ns in newScenarios) {
                seen = -1;
                for(os in self.options.scenarios){
                    if(newScenarios[ns] == self.options.scenarios[os]){
                        seen = ns;
                        //$('#' + self.options.extensionId + '-' + self.options.outputId + '-' + self.options.scenarios[os]).addClass('two');
                        break;
                    }
                }


                if(seen === -1) {
                    self.options.scenarios.push(newScenarios[ns]);
                    self._createRasterMap(self.options.scenarios.length-1);
                    self.drawLastAddedRasterMap();
                    self.updateColorRamp();

                }
            }
            
            self.rearangeMapsInMapGroup();
        }
        

    });

})( jQuery, window, document );