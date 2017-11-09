
;(function($) {
    $.landisSettings = function() { 
        this.set = function() {
            this.init = true;

            var settingId;
            if(!((settingId = getUrlParameter('s')) && (this.settings = loadJson('config/' + settingId + '.json')))) {
                this.settings = loadJson('config/default_settings.json');
                if(!this.settings) {
                    alert("bad settings file");
                }
            }

            /* EXPERIMENTAL
            $('#exportSettingsLink')
                .attr('download', "export.json")
                .attr('href', '#')
                .attr('textContent', "Download export.json")
                .click(function(){
                    var data = {a:1, b:2, c:3};
                    var json = JSON.stringify(data);
                    var blob = new Blob([json], {type: "application/json"});
                    var url  = URL.createObjectURL(blob);
                    $(this).attr('href', url);
            });*/

            return this;
        };

        this.setProjectName = function() {
            if(this.settings.hasOwnProperty('projectname')) {
                $('#ProjectName > h1').text(this.settings.projectname);
            }
        };
        
        if(this.init) {
            return new $.landisSettings();
        } else {
            this.set();
            return this;
        }


    };
})(jQuery);
;(function($) {
    $.landisMetadata = function() { 
        this.set = function() {
            this.init = true;

            //FIXME ... Not Hardcoded but FromConfigFile
            // load landis-model-data/metadata/metadata.scenarios.json
            var path = landisSettings.settings.landisdata.path + "/" + landisSettings.settings.landisdata.metadata;
            this.scenarios = loadJson(path + "/metadata.scenarios.json");
            // load landis-model-data/metadata/metadata.extensions.json
            this.extensions = loadJson(path + "/metadata.extensions.json");
            //console.log(this.extensions);
            return this;
        };
        this.publishScenarios = function(scenarioAttributes) {
            var publish = {};
            if(scenarioAttributes){
                for(scenario in this.scenarios.scenarios) {
                    publish[scenario] = {};
                    for(attr in scenarioAttributes){
                        if(this.scenarios.scenarios[scenario][scenarioAttributes[attr]]){
                            publish[scenario][scenarioAttributes[attr]] = this.scenarios.scenarios[scenario][scenarioAttributes[attr]];
                        }
                    } 
                }
                return publish;
            } else {
                return this.scenarios.scenarios;
            }
        };
        this.getScenarioAttributeById = function(id, scenarioAttribute){
            return this.scenarios.scenarios[id][scenarioAttribute];
        };

        this.getExtensionAttributeById = function(id, extensionAttribute){
            return this.extensions[id][extensionAttribute];
        }

        this.getExtensionAttributesById = function(id){
            //var publish = {};
            console.log(this.extensions[id]);
            //return publish
        }

        this.getOutputAttributeById = function(eId, oId, outputAttribute){
            return this.extensions[eId].outputs[oId][outputAttribute];
        }

        this.getFieldAttributeById = function(eId, oId, fId, outputAttribute){
            return this.extensions[eId].outputs[oId].fields[fId][outputAttribute];
        }

        this.publishExtensions = function() {
            console.log(this.extensions);
            return this;
        };
        this.publishMapOutputs = function() { //FIXME: publish by attributes
            var extension, publish = {};
            for(extension in this.extensions) {
                //console.log(extension ,this.extensions[extension]);
                publish[extension] = {};
                publish[extension].extensionId = this.extensions[extension].extensionId;
                publish[extension].extensionName = this.extensions[extension].extensionName;
                publish[extension].outputs = {};
                 for(output in this.extensions[extension].outputs) {
                    if((this.extensions[extension].outputs[output].outputType).toLowerCase() === "map") {
                        publish[extension].outputs[output] = {}
                        publish[extension].outputs[output].outputId = this.extensions[extension].outputs[output].outputId;
                        publish[extension].outputs[output].outputName = this.extensions[extension].outputs[output].outputName;
                        //publish[extension].outputs[output].scenarioIdExceptions = this.extensions[extension].outputs[output].scenarioIdExceptions;

                    }
                    
                 }
                 if($.isEmptyObject(publish[extension].outputs)){
                    delete publish[extension];
                }
            }
            //console.log(publish);
            return publish;
        };
        this.publishTableOutputs = function() { //FIXME: publish by attributes
            var extension, publish = {};
            for(extension in this.extensions) {
                //console.log(extension ,this.extensions[extension]);
                publish[extension] = {};
                publish[extension].extensionId = this.extensions[extension].extensionId;
                publish[extension].extensionName = this.extensions[extension].extensionName;
                publish[extension].outputs = {};
                 for(output in this.extensions[extension].outputs) {
                    if((this.extensions[extension].outputs[output].outputType).toLowerCase() === "table") {
                        publish[extension].outputs[output] = {}
                        publish[extension].outputs[output].outputId = this.extensions[extension].outputs[output].outputId;
                        publish[extension].outputs[output].outputName = this.extensions[extension].outputs[output].outputName;
                        publish[extension].outputs[output].fields = this.extensions[extension].outputs[output].fields;

                    }
                 }
                if($.isEmptyObject(publish[extension].outputs)){
                    delete publish[extension];
                }
            }
            //console.log(publish);
            return publish;
        };
        
        if(this.init) {
            return new $.landisMetadata();
        } else {
            this.set();
            return this;
        }
    };
})(jQuery);;(function($) {
    $.landisMaps = function() { 
        this.set = function() {
            this.init = true;
            this.mapGroups = [];
            this.mapGroupsByUnit = {}
            return this;
        };

        this.checkMapCandidates = function(mapCandidates){
            //Compare current Maps with mapCandidates
            //if Candidate is part of currentMaps > do nothing
            //if Candidate is not part of currentMaps > add it
            //Check left overs > currentMap not a candidate > delete map groupe
            // console.log(mapCandidates, this.maps.length);
           

            var i, seen, mapsToDelete = [], lastMapGroup;
            //console.log(mapCandidates);
            for(m in this.mapGroups) {
                seen = -1;
                for (c in mapCandidates) {
                    if(mapCandidates[c].extension == this.mapGroups[m].extension && mapCandidates[c].output == this.mapGroups[m].output){
                        seen = c;
                        break;
                    }
                }

                if(seen === -1){
                    mapsToDelete.push(m);
                }
            }
            mapsToDelete.sort();
            mapsToDelete.reverse(); 
            //console.log('mapsToDelete:', mapsToDelete);
            for(map in mapsToDelete){
                console.log(mapsToDelete[map]);
                this.mapGroups[mapsToDelete[map]].rasterMapGroup.rastermapgroup('destroy');
                this.mapGroups.splice(mapsToDelete[map],1);
            }

            for(c in mapCandidates) {
                //check if mapCandidate is in maps
                seen = -1;
                for (i = 0; i < this.mapGroups.length; i++){
                    if(mapCandidates[c].extension == this.mapGroups[i].extension && mapCandidates[c].output == this.mapGroups[i].output){
                        seen = i;
                        break;
                    }
                }
               // console.log(seen);
                if(seen > -1){
                    //update mapGroup
                    //console.log('update mapGroup');

                    this.mapGroups[seen].rasterMapGroup.rastermapgroup('updateRasterMaps', mapCandidates[c].scenarios);
                    arrangeApplicationData();
                    //this.mapGroups[seen].rasterMapGroup.rastermapgroup('updateSizeOfMaps');
                    this.mapGroups[seen].rasterMapGroup.rastermapgroup('loadStatsForMapsInMapGroup');
                    this.mapGroups[seen].rasterMapGroup.rastermapgroup('updateMinMax');

                } else {
                    //create mapGroup 
                    //console.log('create mapGroup');
                    this.mapGroups.push(mapCandidates[c]);
                    lastMapGroup = this.mapGroups[this.mapGroups.length-1];
                    //console.log("INTERVAL OF RASTER", landisMetadata.getExtensionAttributeById(lastMapGroup.extension, 'timeInterval'));
                    var e = lastMapGroup.extension,
                        o = lastMapGroup.output;
                    lastMapGroup.rasterMapGroup = $('<div>').rastermapgroup({
                        extensionName: landisMetadata.getExtensionAttributeById(e, 'extensionName'),
                        outputName: landisMetadata.getOutputAttributeById(e, o, 'outputName'),
                        extensionId:landisMetadata.getExtensionAttributeById(e, 'extensionId'),
                        outputId: landisMetadata.getOutputAttributeById(e, o, 'outputId'),
                        unit: landisMetadata.getOutputAttributeById(e, o, 'unit'),
                        scenarios: lastMapGroup.scenarios,
                        timeInterval: landisMetadata.getExtensionAttributeById(e, 'timeInterval'),
                        dataType: landisMetadata.getOutputAttributeById(e, o, 'dataType'),
                        hiddenUIContainer: '#HiddenUIContainer'
                    }).appendTo('#MapContainer');

                    arrangeApplicationData();

                    //console.log(lastMapGroup.rasterMapGroup.rastermapgroup('getRasterMapsCountInGroup'));
                    lastMapGroup.rasterMapGroup.rastermapgroup('drawRasterMaps');
                    lastMapGroup.rasterMapGroup.rastermapgroup('loadStatsForMapsInMapGroup');

                    //this.maps[this.maps.length-1].rasterMapGroup.rastermapgroup('bindRasterMapViews');
                    arrangeApplicationData();
                    lastMapGroup.rasterMapGroup.rastermapgroup('drawMapLegend');
                    //lastMapGroup.rasterMapGroup.rastermapgroup('updateSizeOfMaps');
              
                }

            

            }

            //FIXME: do not use selector
            $('.map-group').rastermapgroup('updateSizeOfMaps');

            arrangeApplicationData();

        };

        this.bindViewsToFirstMap = function(){  
            //collectAllMaps
            var i, j, allMapObjects = [];
            if(this.mapGroups.length > 0){
                for(i = 0; i < this.mapGroups.length; i++){
                    allMapObjects.push(this.mapGroups[i].rasterMapGroup.rastermapgroup('getAllMapObjects'));
                }
            

                if(allMapObjects[0].length > 1){
                    i = 0;
                    j = 1;
                } else {
                    i = 1;
                    j = 0;
                }
                for(i; i < allMapObjects.length; i++){
                    for(j; j < allMapObjects[i].length; j++){
                        allMapObjects[i][j].bindTo('view', allMapObjects[0][0]);
                    }
                    j = 0;
                }
            }
            
        };

        this.updateColorRamp = function(mapGroupId){
            var i, j, m, unit, rMaps = [], legend, ramp;

            for(i=0; i < this.mapGroups.length; i++){
                if (this.mapGroups[i].rasterMapGroup.rastermapgroup('getMapGroupId') == mapGroupId) {
                    unit = this.mapGroups[i].rasterMapGroup.rastermapgroup('option', 'unit');
                    if(mapSync && this.mapGroupsByUnit.hasOwnProperty(unit)){                
                        legend = this.mapGroups[i].rasterMapGroup.rastermapgroup('getMapGroupLegend');
                        ramp = legend.mapLegend('getWebGlColorRamp');
                        for(j=0; j < this.mapGroupsByUnit[unit].length; j++) {
                            rMaps = this.mapGroups[this.mapGroupsByUnit[unit][j]].rasterMapGroup.rastermapgroup('getRasterMaps');
                            for(m = 0; m < rMaps.length; m++) {
                                rMaps[m].rastermap('updateTimeSeriesLayerColorRamp', ramp);
                            }
                        }
                    } else {
                        this.mapGroups[i].rasterMapGroup.rastermapgroup('updateColorRamp');
                    }
                    break;
                }   
            }
        };

        this.updateMinMax = function(mapGroupId){
            var i, j, m, unit, rMaps = [], legend, filterMin, filterMax, minMax;
            for(i=0; i < this.mapGroups.length; i++){
                if (this.mapGroups[i].rasterMapGroup.rastermapgroup('getMapGroupId') == mapGroupId) {
                    this.mapGroups[i].rasterMapGroup.rastermapgroup('filterMinMax');
                    unit = this.mapGroups[i].rasterMapGroup.rastermapgroup('option', 'unit');
                    if(mapSync && this.mapGroupsByUnit.hasOwnProperty(unit)){
                        legend = this.mapGroups[i].rasterMapGroup.rastermapgroup('getMapGroupLegend');
                        filterMin = legend.mapLegend('option', 'filterMin');
                        filterMax = legend.mapLegend('option', 'filterMax');
                        minMax = this.mapGroups[i].rasterMapGroup.rastermapgroup('getMinMax');
                        for(j=0; j < this.mapGroupsByUnit[unit].length; j++) {

                            rMaps = this.mapGroups[this.mapGroupsByUnit[unit][j]].rasterMapGroup.rastermapgroup('getRasterMaps');
                            for(m = 0; m < rMaps.length; m++) {
                                rMaps[m].rastermap('updateTimeSeriesLayerMinMax', minMax[0], minMax[1],filterMin, filterMax);
                            }
                        }
                    }/* else {
                        this.mapGroups[i].rasterMapGroup.rastermapgroup('filterMinMax');
                    }*/
                    break;
                }
            }
           
        };

        this.rearangeMapsInMapGroup = function() {
            var i;
            for(i=0; i < this.mapGroups.length; i++){
                 this.mapGroups[i].rasterMapGroup.rastermapgroup('rearangeMapsInMapGroup');
            }
            
        };

        this.updateTime = function() {
            var i;
            for (i = 0; i < this.mapGroups.length; i++){
                this.mapGroups[i].rasterMapGroup.rastermapgroup('updateTime');
            }
        };

        this.unsyncMapGroups = function() {
            var i;
            mapSync = false;
            $('#syncMapGroupsByUnit').removeClass('isSynced');
            $('.syncedInfo').remove();
            $('.map-group-sidebar').children().not("[name='checkbox-mode-change']").show();

            //FIXME = > SET ORIGINAL MIN MAX .. and RERender

            for(i=0; i < this.mapGroups.length; i++){
                this.mapGroups[i].rasterMapGroup.rastermapgroup('loadStatsForMapsInMapGroup');
                this.mapGroups[i].rasterMapGroup.rastermapgroup('updateColorRamp');
                this.mapGroups[i].rasterMapGroup.rastermapgroup('updateMinMax');
            }

        };

        this.syncMapGroupsByUnit = function(){
            var i, u, m, unit, minMax, mins = [], maxs = [], ramp, legend, rMaps = [], sb;
            //FIXME move to unSync
            this.mapGroupsByUnit = {};
            mapSync = true;

            //Populate Object with units!
            if(this.mapGroups.length > 0){
                for(i = 0; i < this.mapGroups.length; i++){

                    unit = this.mapGroups[i].rasterMapGroup.rastermapgroup('option', 'unit');  
                    if(unit != '') {
                        if(!this.mapGroupsByUnit.hasOwnProperty(unit)) {
                            this.mapGroupsByUnit[unit] = [];
                        }
                        this.mapGroupsByUnit[unit].push(i);
                    }
                }
                //console.log(mapGroupsByUnit);
            }

            for (u in this.mapGroupsByUnit) {
                if (!this.mapGroupsByUnit.hasOwnProperty(u)) {
                    //The current property is not a direct property of p
                    continue;
                }
                //Do your logic with the property here
                if(this.mapGroupsByUnit[u].length > 1) {
                    for(i = 0; i < this.mapGroupsByUnit[u].length; i++){
                        if(i > 0) {
                            //Deactivate Side Bar
                            sb = this.mapGroups[this.mapGroupsByUnit[u][i]].rasterMapGroup.rastermapgroup('getMapGroupSideBar');
                            sb.children().hide();
                            sb.append('<p class="syncedInfo" style="font-size: 10pt;">This map view is synchronized - use legend of '+ this.mapGroups[this.mapGroupsByUnit[u][0]].rasterMapGroup.rastermapgroup('option', 'outputName') + ' ['+ u +']</p>');
                            
                        }
                        minMax = this.mapGroups[this.mapGroupsByUnit[u][i]].rasterMapGroup.rastermapgroup('getMinMax');
                        mins.push(minMax[0]);
                        maxs.push(minMax[1]);
                        //this.mapGroups[mapGroupsByUnit[u][i]].rasterMapGroup.rastermapgroup('getMapGroupMaps').css('width', '100%');
                        //this.mapGroups[mapGroupsByUnit[u][i]].rasterMapGroup.rastermapgroup('updateSizeOfMaps');
                        //this.mapGroups[mapGroupsByUnit[u][i]].rasterMapGroup.rastermapgroup('updateSizeOfMaps');
                        //this.mapGroups[mapGroupsByUnit[u][i]].rasterMapGroup.rastermapgroup('option',)
                        //get min and max of mapgroups
                        //calculate new min Max
                        //sync Legend?
                    }
                    minMax[0] = Math.min.apply(Math, mins);
                    minMax[1] = Math.max.apply(Math, maxs);
            
                    legend = this.mapGroups[this.mapGroupsByUnit[u][0]].rasterMapGroup.rastermapgroup('getMapGroupLegend');
                    ramp = legend.mapLegend('getWebGlColorRamp');

                    //set render options
                    this.mapGroups[this.mapGroupsByUnit[u][0]].rasterMapGroup.rastermapgroup('setMinMax', minMax[0], minMax[1]);
                    for(i = 0; i < this.mapGroupsByUnit[u].length; i++){
                        
                        rMaps = this.mapGroups[this.mapGroupsByUnit[u][i]].rasterMapGroup.rastermapgroup('getRasterMaps');
                        //console.log(rMaps);
                        for(m = 0; m < rMaps.length; m++) {
                            rMaps[m].rastermap('updateTimeSeriesLayerMinMax', minMax[0], minMax[1], minMax[0], minMax[1]);
                            rMaps[m].rastermap('updateTimeSeriesLayerColorRamp', ramp);
                        }

                    }

                /*var ramp = self._mapGroupLegend.mapLegend('getWebGlColorRamp');
                for(i = 0; i < self.rasterMaps.length; i++) {
                    self.rasterMaps[i].rastermap('updateTimeSeriesLayerColorRamp', ramp);
                }*/
                    

                }
            }
        };

        this.checkMapSync = function(){
            var i, unit, units = [], syncable = false;
            //Button: enable if at least two Map Groups have same unit; otherwise disable and unsync
            if(this.mapGroups.length > 0){
                for(i = 0; i < this.mapGroups.length; i++){
                    unit = this.mapGroups[i].rasterMapGroup.rastermapgroup('option', 'unit');
                    if(unit != '') {
                        if ($.inArray(unit, units) > -1) {
                            //any unit occurs two times->enable sync button
                            $('#syncMapGroupsByUnit').addClass('syncAble');
                            syncable = true;
                            break;
                        } else{
                            units.push(unit);
                        }
                    }
                }
                if(!syncable){
                    $('#syncMapGroupsByUnit').removeClass('syncAble');
                    syncable = false;
                }
            } else {
                //disable button and unsync
                $('#syncMapGroupsByUnit').removeClass('syncAble');
                syncable = false;
            }
        };
        


        if(this.init) {
            return new $.landisMaps();
        } else {
            this.set();
            return this;    
        }
    };
})(jQuery);
;(function($) {
    $.landisCharts = function() { 
        this.set = function() {
            this.init = true;

            this.charts = [];
            return this;
        };

        this.checkChartCandidates = function(chartCandidates){
            //Compare current Charts with chartCandidates
            //if Candidate is part of currentCharts > do nothing
            //if Candidate is not part of currentCharts > add it
            //Check left overs > currentCharts not a candidate > delete chart
           
            var i, seen, chartsToDelete = [];
            for(c in this.charts) {
                seen = -1;
                for (cc in chartCandidates) {
                    if(chartCandidates[cc].extension == this.charts[c].extension && 
                       chartCandidates[cc].output == this.charts[c].output &&
                       chartCandidates[cc].field == this.charts[c].field){
                        seen = cc;
                        break;
                    }
                }

                if(seen === -1){
                    chartsToDelete.push(c);
                }
            }
            //console.log('currentcharts:', this.charts);
            chartsToDelete.sort();
            chartsToDelete.reverse(); 
            //console.log('chartsToDelete:', chartsToDelete);

            for(chart in chartsToDelete){
                //console.log(chartsToDelete[chart]);
                this.charts[chartsToDelete[chart]].chartVis.chart('destroy');
                this.charts.splice(chartsToDelete[chart],1);
            }


            for(c in chartCandidates) {
                //check if chartCandidate is in charts
                seen = -1;
                for (i = 0; i < this.charts.length; i++){
                    if(chartCandidates[c].extension == this.charts[i].extension && 
                       chartCandidates[c].output == this.charts[i].output &&
                       chartCandidates[c].field == this.charts[i].field){
                        seen = i;
                        break;
                    }
                }
               // console.log(seen);
                if(seen > -1){
                    //update updateChartData
                    this.charts[seen].chartVis.chart('updateChartData', chartCandidates[c].scenarios);
                } else {
                    //create Chart Flot instance 
                    
                    this.charts.push(chartCandidates[c]);

                    this.charts[this.charts.length-1].chartVis = $('<div>').chart({
                         chartId: this.charts[this.charts.length-1].extension+'-'+this.charts[this.charts.length-1].output+'-'+this.charts[this.charts.length-1].field,
                         extensionName: landisMetadata.getExtensionAttributeById(this.charts[this.charts.length-1].extension, 'extensionName'),
                         outputName: landisMetadata.getOutputAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, 'outputName'),
                         fieldName: landisMetadata.getFieldAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, this.charts[this.charts.length-1].field, 'name'),
                         fieldDescription: landisMetadata.getFieldAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, this.charts[this.charts.length-1].field, 'description'),
                         extensionId: landisMetadata.getExtensionAttributeById(this.charts[this.charts.length-1].extension, 'extensionId'),
                         outputId: landisMetadata.getOutputAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, 'outputId'),
                         unit: landisMetadata.getFieldAttributeById(this.charts[this.charts.length-1].extension, this.charts[this.charts.length-1].output, this.charts[this.charts.length-1].field, 'unit'),
                         scenarios: this.charts[this.charts.length-1].scenarios,
                         minX: $('#TimeControl').timeControl('option','timeMin'),
                         maxX: $('#TimeControl').timeControl('option','timeMax'),
                         hiddenUIContainer: '#HiddenUIContainer'
                    }).appendTo('#ChartContainer');

                    arrangeApplicationData();
                    this.charts[this.charts.length-1].chartVis.chart('loadData');
                }

            }
            arrangeApplicationData();
        };

        this.addChartGroup = function(map) {
            
        };

        this.updateTime = function(){
            var i;
            for (i = 0; i < this.charts.length; i++){
                this.charts[i].chartVis.chart('updateTime');
            }
        };
        
        this.addChart = function(map) {
            
        };
        
        if(this.init) {
            return new $.landisCharts();
        } else {
            this.set();
            return this;
        }
    };
})(jQuery);;(function ( $, window, document, undefined ) {

    //Control Time Widget
    $.widget('landis.timeControl', {
        options: {
            timeMin: 0,
            timeMax: 100,
            timeInterval: 1,
            currentTime: 0,
            snapToInterval: false,
            playbackSpeed: 1,
            hiddenUIContainer: 'body'
        },
    // --------------------   
    // Basic Widget Methods
    // -------------------- 
        _create: function () {

            this.element.addClass('time-bookmark');

            this._setupUserInerfaceAndEvents();

            this._setOptions({
                'timeMin': this.options.timeMin,
                'timeMax': this.options.timeMax,
                'timeInterval': this.options.timeInterval,
                'currentTime': this.options.currentTime,
                'snapToInterval': this.options.snapToInterval,
                'playbackSpeed': this.options.playbackSpeed,
                'hiddenUIContainer': this.options.hiddenUIContainer
            });
            
        },
        
        _destroy: function () {
            this.element.removeClass('time-bookmark');
            this.element.empty();
            this._super();
        },

        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    'timeMin': function () {
                        self._drawTimeTickAndLabel('min', self.options.timeMin); 
                        //FIXME: change timeSlider Options!!!
                        self._timeSlider.slider('option', 'min', self.options.timeMin);
                        self._drawTimeTickAndLabel('current', self.options.currentTime);
                    },
                    'timeMax': function () {
                        self._drawTimeTickAndLabel('max', self.options.timeMax);
                        self._timeSlider.slider('option', 'max', self.options.timeMax);
                        self._drawTimeTickAndLabel('current', self.options.currentTime);
                    },
                    'currentTime': function () {
                        //Publish the Time
                        $.pubsub( 'publish', T_CURRENTTIME, self.options.currentTime );
                        self._timeSlider.slider('option', 'value', self.options.currentTime);
                        self._drawTimeTickAndLabel('current', self.options.currentTime);
                    },
                    'timeInterval': function () {
                        //Time Interval is Based on shown Data!!!
                        //continue;
                        self._timeSlider.slider('option', 'step', (function() {
                            if(self.options.snapToInterval) {
                                var snapValue = Math.floor(self.options.currentTime/self.options.timeInterval) * self.options.timeInterval;
                                if(snapValue != self.options.currentTime) {
                                    self._setOption('currentTime', snapValue);
                                }
                                return self.options.timeInterval;
                            } else {
                                return 1;
                            } 
                        })());
                        
                    },
                    'snapToInterval': function () {
                        self._timeSlider.slider('option', 'step', (function() {
                            if(self.options.snapToInterval) {
                                var snapValue = Math.floor(self.options.currentTime/self.options.timeInterval) * self.options.timeInterval;
                                if(snapValue != self.options.currentTime) {
                                    self._setOption('currentTime', snapValue);
                                }
                                return self.options.timeInterval;
                            } else {
                                return 1;
                            } 
                        })());

                    },
                    'playbackSpeed': function () {
                        self._playbackSpeedLabel.text('playback speed: ' + self.options.playbackSpeed.toFixed(2) + 'x')
                    }
                };

            // check value
            switch(key) {
                case 'currentTime':
                    if(value > self.options.timeMax) { 
                        value = self.options.timeMax;
                        if(self._playbackTimer.isActive) {
                            // if playback stop
                            self._playbackTimer.pause();
                            self._playbackButton.removeClass('playing');
                        }  
                    } else if (value < self.options.timeMin) {
                        value = self.options.timeMin;
                    }
                    break;
                case 'timeMin':
                    if(value > self.options.currentTime) {
                        self._setOption('currentTime', value);
                        
                    }
                    break;
                case 'timeMax':
                    if(value < self.options.currentTime) {
                        self._setOption('currentTime', value);
                    } 
                    break;
                case 'timeInterval':
                    if(value < 1) {
                        value = 1;
                    }
                    break;
                case 'playbackSpeed':
                    if(value > 4.0) {
                        value = 4.0;
                    } else if (value < 0.25){
                        value = 0.25;
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
            
            var self = this;

            // Main Container
            self._container = $('<div>')
                .addClass('time-bookmark-container')
                .appendTo(self.element);

            // Playback Button
            self._playbackButton = $('<button>')
                .addClass('playback-button')
                .button()
                .on('click', function(event) {                    
                    if(self._playbackTimer.isActive) {
                        //stop
                        self._playbackTimer.pause();
                        self._playbackButton.removeClass('playing');
                    } else {
                        //play
                        self._playbackTimer.play(true);
                        self._playbackButton.addClass('playing');
                    }
                })
                .appendTo(self._container);

            // Time Slider (ui.slider)
            self._timeSlider = $('<div>')
                .addClass('time-slider')
                .slider({
                    range:'min',
                    min: self.options.timeMin,
                    max: self.options.timeMax,
                    value: self.options.currentTime,
                    step: (function() {
                        if(self.options.snapToInterval) {
                            return self.options.timeInterval;
                        } else {
                            return 1;
                        }
                        
                    })(),
                    slide: function(event, ui) {
                        self._setOptions({'currentTime': ui.value});
                        //self._bookmarkSetter.dropdown('hide');
                    },
                    start: function(event,ui) {
                        if(self._playbackTimer.isActive) {
                            self._playbackTimer.pause();
                            self._playbackButton.removeClass('playing');
                        }
                    }
                })
                .appendTo(self._container);

            // Time Bar
            self._timeBar = $('<div>')
                .addClass('time-bar')
                .appendTo(self._container);

            // Time Bar: Labels and Ticks for Min and Max Time


            // Playback Preferences Button
            self._playbackPreferencesButton = $('<button>')
                .addClass('playback-preferences-button')
                .attr('data-dropdown', '#dropdown-playback-preferences-dialog')
                .attr('data-horizontal-offset', '4')
                .button()
                .appendTo(self._container);

            // Playback Preferences Dialog
            self._playbackPreferencesDialog = $('<div>')
                .attr('id', 'dropdown-playback-preferences-dialog')
                .addClass('dropdown dropdown-tip dropdown-anchor-right dropdown-playback-preferences-dialog')
                .appendTo(self.options.hiddenUIContainer);
            self._playbackPreferencesDialogContent = $('<div>')
                .addClass('dropdown-panel')
                //.append(self._playbackPreferencesDialogTemplate)
                .appendTo(self._playbackPreferencesDialog);

            // Playback Speed Label
            self._playbackSpeedLabel = $('<div>')
                .text('playback speed: ' + self.options.playbackSpeed.toFixed(2) + 'x')
                .appendTo(self._playbackPreferencesDialogContent);

            // Playback Speed Slider
            self._playbackSpeedSlider = $('<div>')
                .addClass('playback-speed-slider')
                .slider({
                    min: -20,
                    max: 20,
                    value: (10 * Math.log(self.options.playbackSpeed) / Math.log(2)),
                    slide: function(event, ui){
                        var playbackspeed = parseFloat(Math.pow(2, (ui.value/10)).toFixed(2));
                        self._setOption('playbackSpeed', playbackspeed);
                        self._playbackSpeedLabel.text('playback speed: ' + self.options.playbackSpeed.toFixed(2) + 'x');
                        self._playbackTimer.set({ time : parseInt(1000 / playbackspeed) });
                    }
                })
                .appendTo(self._playbackPreferencesDialogContent);

            // Playback Speed Legend
            self._playbackSpeedLegend = $('<div>')
                .addClass('playback-speed-legend')
                .append('<span class="left">slower</span><span class="center">normal</span><span class="right">faster</span>')
                .appendTo(self._playbackPreferencesDialogContent);
            
            // Set Speed Back to Normal
            self._playbackSpeedLegend.find('span.center')
                .on('click', function(event){
                    self._setOption('playbackSpeed', 1);
                    self._playbackSpeedSlider.slider('option','value', 0);
                    self._playbackSpeedLabel.text('playback speed: ' + self.options.playbackSpeed.toFixed(2) + 'x');
                    self._playbackTimer.set({ time : 1000 });
                });

            $('<div>').addClass('dropdown-divider')
                .appendTo(self._playbackPreferencesDialogContent);

            //Snap to smallest Simulation Interval Option
            self._snapToInterval = $('<input>')
                .attr('type', 'checkbox')
                .attr('name', 'checkbox-snap-to-interval')
                .attr('id', 'checkbox-snap-to-interval')
                .prop('checked', self.options.snapToInterval)
                .addClass('css-checkbox')
                .on('change', function(event) { 
                    self._setOption('snapToInterval', $(this).is(':checked'));
                })
                .appendTo(self._playbackPreferencesDialogContent);

            $('<label>')
                .attr('for', 'checkbox-snap-to-interval')
                .text('snap to greatest common interval')
                .addClass('css-label')
                .appendTo(self._playbackPreferencesDialogContent);

            self._setupPlaybackTimer();
        },

        _drawTimeTickAndLabel: function(classExtension, time) {
            var self = this,
                pos = parseInt((self._timeBar.width()-1) * ((time-self.options.timeMin)/(self.options.timeMax - self.options.timeMin)));

            self._container.find('.time-bar .tick-'+classExtension).remove();

            $('<div class="tick-'+classExtension+' tick-top"></div>')
                .css('left',  pos + 'px')
                .appendTo(self._timeBar);

            $('<div class="tick-'+classExtension+' tick-label"></div>')
                .css('left', pos + 'px')
                .text(time)
                .appendTo(self._timeBar);
        },


        _setupPlaybackTimer: function() {
            var self = this;
            self._playbackTimer = $.timer(function() {
                self._setOption('currentTime', self.options.currentTime + self._timeSlider.slider('option', 'step'));
            }, parseInt(1000 / self.options.playbackSpeed), false);
        },

        stopPlayback: function(){
            var self = this;
            if(self._playbackTimer.isActive) {
                // if playback stop
                self._playbackTimer.pause();
                self._playbackButton.removeClass('playing');
            }
        },

        isPlaying: function(){
            var self = this;
            if(self._playbackTimer.isActive){
                return true;
            } else {
                return false;
            }
                
        },
    // ---------------------------
    // Basic UserInterface Event Methods
    // ---------------------------
        _setupEvents: function() {

            var self = this;

            return;

        },

        _playbackPreferencesDialogTemplate:
            '<span>Playback Speed: </span><br /> \
            '


    });

})( jQuery, window, document );;(function ( $, window, document, undefined ) {

    //LANDIS Scenario Selector Widget
    $.widget('landis.scenarioSelector', {
        options: {
            scenarios: {},
            scenarioMax: 4,
            scenarioMin: 1,
            selectedScenarioIds: [1],
            hiddenUIContainer: 'body'
        },
        // --------------------   
        // Basic Widget Methods
        // -------------------- 
        _create: function () {
            var self = this;

            self.element.addClass('scenario-selector');

            self._setupUI();
            self._setupEvents();

            self._setOptions({
                'scenarios': this.options.scenarios,
                'scenairoMin': this.options.scenarioMin,
                'scenairoMax': this.options.scenarioMax,
                'hiddenUIContainer': this.options.hiddenUIContainer
            });

            $.pubsub( 'publish', T_CHANGESCENARIOS, 'selectedScenarioIds' );

        },
        
        _destroy: function () {
            var self = this;
            self.element.removeClass('scenario-selector');
            self.element.empty();
            self._super();
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
            //FIXME Check if selectedScenarioIds.length is within Limits (minMax)
            //FIXME Check if min Max make sense... means ... if only 2 scenarios are there ... 4 doesnt make sense ...
            // switch(key) {
            //     case 'timeMax':
            //         if(value <= self.options.currentTime) {
            //             value = self.options.currentTime;
            //         } 
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
        // User Interface Methods
        // ---------------------------
        _setupUI: function(){
            
            var self = this, selected, disabled;

            // Main Container for Scenario Selector
            self._container = $('<div>')
                .addClass('scenario-selector-container')
                .appendTo(self.element);

            //Scenario Selector Button
            self._scenarioSelector = $('<div>')
                .addClass('scenario-selector-button')
                .attr('data-dropdown', '#dropdown-scenario-selector')
                .attr('data-horizontal-offset', '0')
                .append('<span>Scenarios</span>')
                .appendTo(self._container);

            self._scenarioSelectorDropdown = $('<div>')
                .attr('id', 'dropdown-scenario-selector')
                .addClass('dropdown dropdown-tip dropdown-scenario-selector')    
                .appendTo(self.options.hiddenUIContainer);


            self._scenarioSelectorDropdownContent = $('<div>')
                .addClass('dropdown-panel')
                .append('<span>select scenarios:<span><br/><br/>')
                .appendTo(self._scenarioSelectorDropdown);

            for(scenario in self.options.scenarios){
                //console.log(self.options.scenarios[scenario].id);
                selected = $.inArray(self.options.scenarios[scenario].id, self.options.selectedScenarioIds) > -1 ? true : false;
                disabled = selected && self.options.selectedScenarioIds.length <= self.options.scenarioMin ? true : false;
               // disabled = false;
                $('<input>') 
                    .attr('type', 'checkbox')
                    .attr('id', 's-'+self.options.scenarios[scenario].id)
                    .attr('name', 'scenario-checkbox')
                    .val(self.options.scenarios[scenario].id)
                    .prop('checked',  selected)
                    .prop('disabled', disabled)
                    .addClass('css-checkbox')
                    .appendTo(self._scenarioSelectorDropdownContent);

                $('<label>')
                    .attr('for', 's-'+self.options.scenarios[scenario].id)
                    .text(self.options.scenarios[scenario].name)
                    .addClass('css-label')
                    .appendTo(self._scenarioSelectorDropdownContent);

            }
                
        },

        _updateUI: function() {
            var self = this,
                selectedScenarios = $('input[name="scenario-checkbox"]:checkbox:checked'),
                notSelectedScenarios = $('input[name="scenario-checkbox"]:checkbox:not(:checked)');

             

            // if(selectedScenarios.length <= self.options.scenarioMin) {
            //     selectedScenarios.prop('disabled', true);
            // } else {
            //     selectedScenarios.prop('disabled', false);
            // }
            
            
            if(self.options.scenarioMax == 1) {
                    //switch mode
                    selectedScenarios.prop('disabled', false);
            } else {

                if(selectedScenarios.length  >= self.options.scenarioMax) {
                    notSelectedScenarios.prop('disabled', true); 
                }else{
                    notSelectedScenarios.prop('disabled', false);
                }

            }

        },

        // ---------------------------
        // Event Methods
        // ---------------------------
        _setupEvents: function() {
            var self = this;

            self._scenarioSelectorDropdown
                .on('show', function(event, dropdownData) {
                    $.pubsub( 'publish', T_STOPPLAYBACK, 'scenario-selector' );
                })
                .on('hide', function(event, dropdownData) {
                    $.pubsub( 'publish', T_CHANGESCENARIOS, 'selectedScenarioIds' );
                });


            $('input[name="scenario-checkbox"]:checkbox').change(function(event){
                var i,
                    selectedScenarios = $('input[name="scenario-checkbox"]:checkbox:checked'),
                    notSelectedScenarios = $('input[name="scenario-checkbox"]:checkbox:not(:checked)');
                if(self.options.scenarioMax == 1) {
                    //switch mode
                    selectedScenarios.prop('disabled', false);
                    selectedScenarios.prop('checked', false);
                    self.options.selectedScenarioIds.splice(0,self.options.selectedScenarioIds.length);
                    $(this).prop('checked', 'true');
                    self.options.selectedScenarioIds.push(parseInt($(this).val()));

                } else {
                    if(selectedScenarios.length <= self.options.scenarioMin) {
                        selectedScenarios.prop('disabled', true);
                    } else {
                        selectedScenarios.prop('disabled', false);
                    } 

                    if(selectedScenarios.length  >= self.options.scenarioMax) {
                        notSelectedScenarios.prop('disabled', true); 
                    }else{
                        notSelectedScenarios.prop('disabled', false);
                    }

                    i = $.inArray(parseInt($(this).val()), self.options.selectedScenarioIds)
                    if(i > -1) {
                        //remove 
                        self.options.selectedScenarioIds.splice(i,1);
                    } else {
                        self.options.selectedScenarioIds.push(parseInt($(this).val()));
                    }
                }

                

                //console.log(self.options.selectedScenarioIds);
            });
        }


    });

})( jQuery, window, document );;(function ( $, window, document, undefined ) {

    //LANDIS Map Selector Widget
    $.widget('landis.mapSelector', {
        options: {
            mapoutputs: {},
            selectedMapId: 0,
            selectedParameterIds: [],
            parameterLimit: 4,
            hiddenUIContainer: 'body'
        },
    // --------------------   
    // Basic Widget Methods
    // -------------------- 
        _create: function () {
            var self = this;

            self.element.addClass('map-control');
           
            self._setupUserInerfaceAndEvents();

            self._setOptions({
                'mapoutputs': this.options.mapoutputs,
                'selectedMapId': this.options.selectedMapId,
                'selectedParameterIds': this.options.selectedParameterIds,
                'parameterLimit': this.options.parameterLimit, 
                'hiddenUIContainer': this.options.hiddenUIContainer
            });

        },
        
        _destroy: function () {
            this.element.removeClass('map-control');
            this.element.empty();
            this._super();
        },

        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    'parameterLimit': function () {
                        self._updateUI()
                     }
                };

            // check value
            // switch(key) {
            //     case 'optionname':
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
            
            var self = this,
                container,
                outputs;

            // Main Container
            self._container = $('<div>')
                .addClass('map-control-container')
                .appendTo(self.element);

            //console.log(self.options.scenarios);
            //Main Scenario Selector
            self._mapControl = $('<div>')
                .addClass('map-control map-control-button')
                .attr('data-dropdown', '#dropdown-map-control')
                .attr('data-horizontal-offset', '0')
                .append('<span>Maps</span>')
                .appendTo(self._container);

            self._mapControlDropdown = $('<div>')
                .attr('id', 'dropdown-map-control')
                .addClass('dropdown dropdown-tip dropdown-map-control')
                .appendTo(self.options.hiddenUIContainer);

            self._mapControlDropdown
                .on('show', function(event, dropdownData) {
                    $.pubsub( 'publish', T_STOPPLAYBACK, 'map-control' );
                })
                .on('hide', function(event, dropdownData) {
                    $.pubsub( 'publish', T_CHANGEMAPS, 'hide-map-control' );
                });

            self._mapControlDropdownContent = $('<div>')
                .addClass('dropdown-panel')
                .css('overflow', 'auto')
                .appendTo(self._mapControlDropdown);


            self._mapControlOutputList = $('<div>')
                .addClass('output-list')
                .text($.isEmptyObject(self.options.mapoutputs) ? "no maps available" : "")
                .appendTo(self._mapControlDropdownContent);
            $('<div>')
                .css('clear', 'both')
                .appendTo(self._mapControlDropdownContent);

            //create parameter picker
            //console.log(self.options.mapoutputs);
            for(extension in self.options.mapoutputs){
                container = $('<div>')
                    .addClass('extension-container')
                    .appendTo(self._mapControlOutputList);

                $('<p>')
                    .attr('id', 'et-'+self.options.mapoutputs[extension].extensionId)
                    .addClass('extension-topic')
                    .text(self.options.mapoutputs[extension].extensionName)
                    .appendTo(container);

                outputs = $('<div>')
                    .addClass('extension-outputs')
                    .appendTo(container);
                for(output in self.options.mapoutputs[extension].outputs){
                    //console.log(extension, output);
                    //console.log(self.options.scenarios[scenario].id);
                    $('<input>')
                        .attr('type', 'checkbox')
                        .attr('id', 'mc-'+self.options.mapoutputs[extension].extensionId+'-'+self.options.mapoutputs[extension].outputs[output].outputId)
                        .attr('name', 'map-control-checkbox')
                        .val(self.options.mapoutputs[extension].extensionId+'-'+self.options.mapoutputs[extension].outputs[output].outputId)
                        .addClass('css-checkbox')
                        .appendTo(outputs);

                    $('<label>')
                        .attr('for', 'mc-'+self.options.mapoutputs[extension].extensionId+'-'+self.options.mapoutputs[extension].outputs[output].outputId)
                        .text(self.options.mapoutputs[extension].outputs[output].outputName)
                        .addClass('css-label')
                        .appendTo(outputs);

                }
                
            }

            $('input[name="map-control-checkbox"]:checkbox').change(function(e){
                var extOut = $(this).val().split('-').map(function (x) { 
                                    return parseInt(x, 10); 
                              }),
                    selectedParameters = $('input[name="map-control-checkbox"]:checkbox:checked'),
                    notSelectedParameters = $('input[name="map-control-checkbox"]:checkbox:not(:checked)'),
                    index, i;

                if(self.options.parameterLimit == 1) {
                    //switch mode
                    selectedParameters.prop('checked', false);
                    self.options.selectedParameterIds.splice(0,self.options.selectedParameterIds.length);
                    $(this).prop('checked', 'true');
                    self.options.selectedParameterIds.push(extOut);

                } else {
                    if(selectedParameters.length  >= self.options.parameterLimit) {
                        notSelectedParameters.prop('disabled', true); 
                    }else{
                        notSelectedParameters.prop('disabled', false);
                    }

                    index = -1;

                    for(i = 0, len = self.options.selectedParameterIds.length; i < len; i++){
                        if(self.options.selectedParameterIds[i][0] === extOut[0] && self.options.selectedParameterIds[i][1] === extOut[1]){
                            index = i;
                            break;
                        }
                    }

                    if(index > -1) {
                        //remove 
                        self.options.selectedParameterIds.splice(index,1);
                    } else {
                        self.options.selectedParameterIds.push(extOut);
                    }

                }


              //  console.log(self.options.selectedParameterIds);
   
                
                
            });

                         
        },

        _updateUI: function() {
            var self = this,
                selectedParameters = $('input[name="map-control-checkbox"]:checkbox:checked'),
                notSelectedParameters = $('input[name="map-control-checkbox"]:checkbox:not(:checked)');

            if(self.options.parameterLimit == 1) {
                    //switch mode
    
            } else {

                if(selectedParameters.length  >= self.options.parameterLimit) {
                    notSelectedParameters.prop('disabled', true); 
                }else{
                    notSelectedParameters.prop('disabled', false);
                }
            }
        },
    // ---------------------------
    // Basic UserInterface Event Methods
    // ---------------------------
        _setupEvents: function() {

            //var self = this;
            return;
          

        }


    });

})( jQuery, window, document );;(function ( $, window, document, undefined ) {

    //LANDIS Chart Selector Widget
    $.widget('landis.chartSelector', {
        options: {
            chartoutputs: {},
            selectedParameterIds: [],
            parameterLimit: 4,
            hiddenUIContainer: 'body'
        },
    // --------------------   
    // Basic Widget Methods
    // -------------------- 
        _create: function () {

            this.element.addClass('chart-control');
            
            this._setupUserInerfaceAndEvents();

            this._setOptions({
                'chartoutputs': this.options.chartoutputs,
                'parameterLimit': this.options.parameterLimit,
                'hiddenUIContainer': this.options.hiddenUIContainer
            });

        },
        
        _destroy: function () {
            this.element.removeClass('chart-control');
            this.element.empty();
            this._super();
        },

        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    'parameterLimit': function () {
                        self._updateUI();
                     }
                };

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

            // Main Container
            self._container = $('<div>')
                .addClass('chart-control-container')
                .appendTo(self.element);

            //console.log(self.options.scenarios);
            //Main Scenario Selector
            self._chartControl = $('<div>')
                .addClass('chart-control chart-control-button')
                .attr('data-dropdown', '#dropdown-chart-control')
                .attr('data-horizontal-offset', '0')
                .append('<span>Charts</span>')
                .appendTo(self._container);

            self._chartControlDropdown = $('<div>')
                .attr('id', 'dropdown-chart-control')
                .addClass('dropdown dropdown-tip dropdown-chart-control')
                .appendTo(self.options.hiddenUIContainer);

            self._chartControlDropdown
                .on('show', function(event, dropdownData) {
                    $.pubsub( 'publish', T_STOPPLAYBACK, 'chart-control' );
                })
                .on('hide', function(event, dropdownData) {
                    $.pubsub( 'publish', T_CHANGECHARTS, 'hide-chart-control' );
                });

            self._chartControlDropdownContent = $('<div>')
                .addClass('dropdown-panel')
                .css('overflow', 'auto')
                .appendTo(self._chartControlDropdown);

            self._chartControlOutputList = $('<div>')
                .addClass('output-list')
                .text($.isEmptyObject(self.options.chartoutputs) ? "no charts available" : "")
                .appendTo(self._chartControlDropdownContent);
            $('<div>')
                .css('clear', 'both')
                .appendTo(self._chartControlDropdownContent);

            //create parameter picker
            for(extension in self.options.chartoutputs){
                var container = $('<div>')
                    .addClass('extension-container')
                    .appendTo(self._chartControlOutputList);

                $('<p>')
                    .attr('id', 'et-'+self.options.chartoutputs[extension].extensionId)
                    .addClass('extension-topic')
                    .text(self.options.chartoutputs[extension].extensionName)
                    .appendTo(container);

                var outputs = $('<div>')
                    .addClass('extension-outputs')
                    .appendTo(container);
                for(output in self.options.chartoutputs[extension].outputs){
                    //console.log(extension, output);
                    //console.log(self.options.chartoutputs[extension].outputs[output].fields);
                    for(field in self.options.chartoutputs[extension].outputs[output].fields){
                         $('<input>')
                           .attr('type', 'checkbox')
                           .attr('id', 'cc-'+self.options.chartoutputs[extension].extensionId+'-'+self.options.chartoutputs[extension].outputs[output].outputId+'-'+field)
                           .attr('name', 'chart-control-checkbox')
                           .val(self.options.chartoutputs[extension].extensionId+'-'+self.options.chartoutputs[extension].outputs[output].outputId+'-'+field)

                           .addClass('css-checkbox')
                           .appendTo(outputs);

                       $('<label>')
                           .attr('for', 'cc-'+self.options.chartoutputs[extension].extensionId+'-'+self.options.chartoutputs[extension].outputs[output].outputId+'-'+field)
                           .text(self.options.chartoutputs[extension].outputs[output].fields[field].name)//description)
                           .addClass('css-label')
                           .appendTo(outputs);
                    }

                }
                
            }

            $('input[name="chart-control-checkbox"]:checkbox').change(function(e){
                var extOutField = $(this).val().split('-').map(function (x) { 
                                    return parseInt(x, 10); 
                                });
                //console.log(extOutField);
                var selectedParameters = $('input[name="chart-control-checkbox"]:checkbox:checked');    
                var notSelectedParameters = $('input[name="chart-control-checkbox"]:checkbox:not(:checked)');

                if(self.options.parameterLimit == 1) {
                    //switch mode
                    selectedParameters.prop('checked', false);
                    self.options.selectedParameterIds.splice(0,self.options.selectedParameterIds.length);
                    $(this).prop('checked', 'true');
                    self.options.selectedParameterIds.push(extOut);

                } else {
                    if(selectedParameters.length  >= self.options.parameterLimit) {
                        notSelectedParameters.prop('disabled', true); 
                    }else{
                        notSelectedParameters.prop('disabled', false);
                    }

                    var index = -1;

                    for(var i = 0, len = self.options.selectedParameterIds.length; i < len; i++){
                        if(self.options.selectedParameterIds[i][0] === extOutField[0] && self.options.selectedParameterIds[i][1] === extOutField[1] && self.options.selectedParameterIds[i][2] === extOutField[2]){
                            index = i;
                            break;
                        }
                    }

                    if(index > -1) {
                        //remove 
                        self.options.selectedParameterIds.splice(index,1);
                    } else {
                        self.options.selectedParameterIds.push(extOutField);
                    }

                }


              //  console.log(self.options.selectedParameterIds);

                
                
            });
               
        },

        _updateText: function(selector, text) {
            $(selector).html(text);
        },

        _updateUI: function() {
            var self = this;
            var selectedParameters = $('input[name="chart-control-checkbox"]:checkbox:checked');
            var notSelectedParameters = $('input[name="chart-control-checkbox"]:checkbox:not(:checked)');

            if(self.options.parameterLimit == 1) {
                    //switch mode
    
            } else {

                if(selectedParameters.length  >= self.options.parameterLimit) {
                    notSelectedParameters.prop('disabled', true); 
                }else{
                    notSelectedParameters.prop('disabled', false);
                }
            }
        },
    // ---------------------------
    // Basic UserInterface Event Methods
    // ---------------------------
        _setupEvents: function() {

            var self = this;

          

        }


    });

})( jQuery, window, document );;(function ( $, window, document, undefined ) {

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

        getRasterMaps: function(){
            var self = this;
            return self.rasterMaps;
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
            //console.log('update min max Legend');
            var self = this,
                lMin =  self.legendMinMax[0],
                lMax =  self.legendMinMax[1],
                rMin =  self.legendMinMax[0],
                rMax =  self.legendMinMax[1],
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

        filterMinMax: function() {
            var self = this,
                lMin =  self.legendMinMax[0],
                lMax =  self.legendMinMax[1],
                rMin =  self.legendMinMax[0],
                rMax =  self.legendMinMax[1],
                i;

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

        getMapGroupLegend: function(){
            var self = this;
            return self._mapGroupLegend;
        },

        getMapGroupSideBar: function(){
            var self = this;
            return self._mapGroupSideBar;
        },

        getMapGroupMaps: function(){
            var self = this;
            return self._mapGroupMaps;
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

        setMinMax: function(min, max) {
            var self = this;
            self.legendMinMax[0] = min;
            self.legendMinMax[1] = max;
            self.updateMinMax();
        },

        getMinMax: function() {
            var self = this;
            return self.legendMinMax;
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

})( jQuery, window, document );;(function ( $, window, document, undefined ) {

    //landis map legend widget

    $.widget( "landis.mapLegend", {

        //Options to be used as defaults
        options: {
            min: 0,
            max: 100,
            handles: [],
            categorical: false,
            handleoffset: -8,
            filterMin: 0,
            filterMax: 100,
            mapGroupId: 0,
            dataType: 'continuous',
            hiddenUIContainer: 'body',
            handleLimit: 9
        },

        _create: function () {
            var self = this,
                i;
            self.privateHandles = [];

            for (i = 0; i < self.options.handles.length; i++){
                 self.privateHandles[i] = self.options.handles[i];
            }

            self.element.addClass('map-legend');
            
            self._sliderMode = self.options.dataType == 'nominal' ? false : true;

            self._setupUserInerfaceAndEvents();

            self._setOptions({
                'min': this.options.min,
                'max': this.options.max,
                'filterMin': this.options.filterMin,
                'filterMax': this.options.filterMax,
                'handles': this.options.handles,
                'dataType': this.options.dataType,
                'categorical': this.options.categorical,
                'mapGroupId': self.options.mapGroupId,
                'hiddenUIContainer': this.options.hiddenUIContainer,
                'handleoffset': this.options.handleoffset,
                'handleLimit': this.options.handleLimit
            });
            
        },
        _setOption: function (key, value) {
            var self = this,
                prev = this.options[key],
                fnMap = {
                    'min': function () {
                        if(self.options.dataType != 'nominal') {
                            self._rangeSlider.slider('option', 'min', self.options.min);
                            self._rangeSlider.slider('values',0, self.options.min); 
                            //if(self.options.filterMin < self.options.min) self._setOption('filterMin', self.options.min); 
                            self._setOption('filterMin', self.options.min);
                            self.updateHandleValues();
                        }
                        
                    },
                    'max': function () {
                        if(self.options.dataType != 'nominal') {
                            self._rangeSlider.slider('option', 'max', self.options.max);
                            self._rangeSlider.slider('values',1, self.options.max); 
                            //if(self.options.filterMax > self.options.max) self._setOption('filterMax', self.options.max); 
                            self._setOption('filterMax', self.options.max);
                            self.updateHandleValues();
                        }
                        
                    },
                    'currentTime': function () {
                        //Publish the Time
                        
                    },
                    'timeInterval': function () {
                        //Time Interval is Based on shown Data!!!
                        //continue;
                    },
                    'filterMin': function () {
                        //console.log(self.options.filterMin);
                        $.pubsub( 'publish', T_MINMAX, self.options.mapGroupId );
                    },
                    'filterMax': function() {
                        //console.log(self.options.filterMax);
                        $.pubsub( 'publish', T_MINMAX, self.options.mapGroupId );
                    },
                    'categorical': function() {
                        if(self.options.dataType != 'nominal') {
                            self._drawColorRamp();
                            self._webGLRamp = self.get8BitColors100();
                            $.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );
                        }
                    }
                };

            // check value
            switch(key) {
                case 'currentTime':
                    if(value > self.options.timeMax) { 
                        value = self.options.timeMax;
                        if(self._playbackTimer.isActive) {
                            // if playback stop
                            self._playbackTimer.pause();
                            self._playbackButton.removeClass('playing');
                        }  
                    } else if (value < self.options.timeMin) {
                        value = self.options.timeMin;
                    }
                    break;
                case 'timeMin':
                    if(value >= self.options.currentTime) {
                        value = self.options.currentTime;
                    }
                    break;
                case 'timeMax':
                    if(value <= self.options.currentTime) {
                        value = self.options.currentTime;
                    } 
                    break;
            }
            // base
            self._super(key, value);

            if (key in fnMap) {
                fnMap[key]();

                // Fire event
                self._triggerOptionChanged(key, prev, value);
            }

            
        },

        _triggerOptionChanged: function (optionKey, previousValue, currentValue) {
            this._trigger('setOption', {type: 'setOption'}, {
                option: optionKey,
                previous: previousValue,
                current: currentValue
            });
        },


        _value2percent: function(value) {
            return ((value - this.options.min) / (this.options.max - this.options.min)) * 100;
        },

        _value2position: function(value){

            var self = this,
                position;
            position = (((value - this.options.min) * (self._colorSlider.innerHeight())) / (this.options.max - this.options.min));
            return (Math.abs(position - self._colorSlider.innerHeight()) + self.options.handleoffset);
        },

        _value2positionBottom: function(value){

            var self = this,
                position;
            position = (((value - this.options.min) * (self._colorSlider.innerHeight())) / (this.options.max - this.options.min));
           // console.log(position);
            //return (Math.abs(position - self._colorSlider.innerHeight()) + self.options.handleoffset);
        },

        _position2value: function(position){

            var self = this,
                value;
            //position = 0;
            value = self._colorSlider.innerHeight() - (position - self.options.handleoffset);
            return Math.round(((value * (this.options.max - this.options.min)) / (self._colorSlider.innerHeight())) + this.options.min);
        },

        _setupUserInerfaceAndEvents: function() {
            var self = this,
                i;

            if (self._sliderMode) {
                //create color slider
                self._colorSliderContainer = $('<div>')
                    .addClass('color-slider-container')
                    .appendTo(self.element);

                self._colorSlider = $('<div>')
                    .addClass('color-slider')
                    .on('dblclick', function(event){
                        if (self.privateHandles.length < self.options.handleLimit) {
                            if($(event.target).hasClass('color-slider')) {
                                var value = self._position2value(event.clientY - $(event.target).offset().top + self.options.handleoffset);
                                self.privateHandles.push({
                                    value: value,
                                    color: self._calculateColorValue(value)
                                });
                                self._addHandle(self.privateHandles.length-1);
                                self._drawColorRamp();
                                self._webGLRamp = self.get8BitColors100();
                                $.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );

                            }
                        }
                        //console.log(parseInt(event.clientY - $(event.target).offset().top));
                        //console.log(self.options.privateHandles);
                    })
                    .appendTo(self._colorSliderContainer);
                $('<div>')
                    .css('clear', 'both')
                    .appendTo(self.element);
                //create handles
                for(i = 0; i < self .privateHandles.length; i++) {
                    self._addHandle(i);
                }

                // draw Ramp
                self._drawColorRamp();

                //update Ramp
                self._webGLRamp = self.get8BitColors100();
                $.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );




                //range slider

                self._rangeSlider = $('<div>').insertBefore($(self._colorSlider)).css({'height': '202px', 'float':'left', 'margin-right': '10px'});

                // $("#rangeslider")
                self._rangeSlider.slider({
                    orientation: 'vertical',
                    range: true,
                    min: self.options.min,
                    max: self.options.max,
                    values: [self.options.filterMin, self.options.filterMax],
                    slide: function (event, ui) {
                        // ui.values[0] + " - " + 
                        self._setOption('filterMin', ui.values[0]);
                        self._setOption('filterMax', ui.values[1]);
                    }
                });
            } else {
             //create class boxes
                self._classBoxes = $('<div>')
                    .addClass('class-boxes')
                    .appendTo(self.element);

                for(i = 0; i < self .privateHandles.length; i++) {
                    self._addClassBox(i);
                }

                //update Ramp
                self._webGLRamp = self.get8BitColors();
                $.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );

            } 

                    //FARBTASTIC
            
            self._colorPickerDropDown = $('<div>')
                .attr('id', 'dropdown-farbtastic-'+self.options.mapGroupId)
                .addClass('dropdown dropdown-tip dropdown-anchor-right')
                .appendTo('#HiddenUIContainer');

            self._colorPickerDropDownContent = $('<div>').addClass('dropdown-panel').appendTo(self._colorPickerDropDown);

            $('<div>').attr('id','picker-'+self.options.mapGroupId).appendTo(self._colorPickerDropDownContent);

            $('#dropdown-farbtastic-'+self.options.mapGroupId).on('show', function(event, dropdownData) {
                var picker = $.farbtastic('#picker-'+self.options.mapGroupId),
                    trigger = $(dropdownData.trigger),
                    color = jQuery.Color(trigger.css('background-color')).toHexString();
                //console.log(trigger);
                
                picker.linkTo(function(){
                    trigger.css('background-color', this.color);
                    if(self._sliderMode) {
                        var idx = trigger.parent().data('color-slider-handle-index');
                        self.privateHandles[idx].color = this.color;
                        self._drawColorRamp();
                        self._webGLRamp = self.get8BitColors100();
                        $.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );
                    } else {
                        var idx = trigger.parent().data('class-box-index');
                        self.privateHandles[idx].color = this.color;
                        self._webGLRamp = self.get8BitColors();
                        $.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );
                    }
                    
                });
                picker.setColor(color);
                

            }).on('hide', function(event, dropdownData) {
               // console.log("close");
            });

             
        },

        updateHandleValues: function(){
            var self = this;
            
             $(self._colorSlider).children('.color-slider-handle-container').each(function(){
                var value = self._position2value($(this).position().top),
                    currIdx = $(this).data('color-slider-handle-index');
                  
                self.privateHandles[currIdx].value = value;
                self.privateHandles[currIdx].percent = self._value2percent(value);
                $(this).children('.color-slider-handle-value').text(value);
      
                //self._drawColorRamp();
                //self._webGLRamp = self.get8BitColors100();
                //$.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );
            });

        },

        _addHandle: function(idx) {
            var self = this,
                handleContainer;
            
            self.privateHandles[idx].percent = self._value2percent(self.privateHandles[idx].value);
            //console.log(self.options.privateHandles[idx].value, self.options.privateHandles[idx].percent);
            //console.log()
            handleContainer = $('<div>')
                    .addClass('color-slider-handle-container')
                    .draggable({
                        axis: "y",
                        zIndex: 100,
                        handle: ".color-slider-handle",
                        grid: [0, self._colorSlider.innerHeight()/(this.options.max - this.options.min)],
                        containment: $(self._colorSlider).parent().parent(),
                        /*
                        containment: [self._colorSlider.offset().left,
                                      self._colorSlider.offset().top + self.options.handleoffset + 1,
                                      self._colorSlider.offset().left + self._colorSlider.width(),
                                      self._colorSlider.offset().top + 1 + self._colorSlider.height() + self.options.handleoffset ],*/
                        drag: function(event, ui){
                            var value = self._position2value(ui.position.top),
                                currIdx = $(this).data('color-slider-handle-index');
                            self.privateHandles[currIdx].value = value;
                            self.privateHandles[currIdx].percent = self._value2percent(value);
                            $(ui.helper).children('.color-slider-handle-value').text(value);
                            self._drawColorRamp();
                            self._webGLRamp = self.get8BitColors100();
                            $.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );
                        },
                        stop: function(event, ui){
                            //console.log('stoped');
                        }
                    })
                    .offset({ top: self._value2position(self.privateHandles[idx].value), left: self._colorSlider.width()})
                    .css('position', 'absolute')
                    .data('color-slider-handle-index', idx)
                    .appendTo(self._colorSlider );



                $('<div>')
                    .addClass('color-slider-handle')
                    .on('dblclick', function(event){
                        
                        if (self.privateHandles.length > 2) {
                            var idxToRemove = $(event.target).parent().data('color-slider-handle-index');
                            //console.log(idxToRemove);
                            //remove handle
                            self.privateHandles.splice(idxToRemove,1);

                            //index correction
                            $(event.target)
                                .parent().parent()
                                .children('.color-slider-handle-container')
                                .each(function(){
                                    var currIdx = $(this).data('color-slider-handle-index');
                                    if (currIdx > idxToRemove) {
                                        $(this).data('color-slider-handle-index', currIdx - 1);
                                    }
                                    //console.log(idxToRemove, $(this).data('color-slider-handle-index'));
                                }
                            );
                            //remove from dom
                            $(event.target).parent().remove();

                            self._drawColorRamp();
                            self._webGLRamp = self.get8BitColors100();
                            $.pubsub( 'publish', T_COLORRAMP, self.options.mapGroupId );
                            //console.log(self.options.privateHandles);
                        }
                        

                    })
                    .appendTo(handleContainer);

                $('<div>')
                    .addClass('color-slider-handle-color')
                    .attr('data-dropdown', '#dropdown-farbtastic-'+self.options.mapGroupId)
                    .attr('data-horizontal-offset', '8')
                    .attr('data-vertical-offset', '-5')
                    .css('background-color', self.privateHandles[idx].color)
                    .appendTo(handleContainer);

                $('<div>')
                    .addClass('color-slider-handle-value')
                    .text(self.privateHandles[idx].value)
                    .appendTo(handleContainer);
        },

        _addClassBox: function(idx) {
            var self = this, boxContainer;

            boxContainer = $('<div>')
                .addClass('class-box-container')
                .data('class-box-index', idx)
                .appendTo(self._classBoxes);

            $('<div>')
                    .addClass('class-box')
                    .attr('data-dropdown', '#dropdown-farbtastic-'+self.options.mapGroupId)
                    .attr('data-horizontal-offset', '8')
                    .attr('data-vertical-offset', '-7')
                    .css('background-color', self.privateHandles[idx].color)
                    .appendTo(boxContainer);

            $('<span>')
                    .addClass('class-box-label')
                    .text(self.privateHandles[idx].value)
                    .appendTo(boxContainer);

            $('<div>')
                    .css('clear', 'both')
                    .appendTo(boxContainer);
        },

        _calculateColorValue: function ( value ) {
            var newColor, i, p1, p2, a, b, v1, v2, r, g,
                handles = this.privateHandles.slice();
            handles.sort(function (a, b) {
                            return a.value - b.value;
                        });

            //console.log(value, handles);
            if(value <= handles[0].value) {
                newColor = handles[0].color;
            } else if (value >= handles[handles.length-1].value){
                newColor = handles[handles.length-1].color;
            } else {
                for( i = 0; i < handles.length - 1; i++){
                    if( value > handles[i].value && value < handles[i+1].value ) {
                        p1 = i;
                        p2 = i + 1;
                        break;
                    } 
                }
                v1 = handles[p1].value;
                v2 = handles[p2].value;
                c1 = jQuery.Color(handles[p1].color);
                c2 = jQuery.Color(handles[p2].color);
                a = Math.abs(value - v1);
                b = Math.abs(v2 - value);

               r = ((b/(a+b)) * c1.red()) + ((a/(a+b)) * c2.red());
               g = ((b/(a+b)) * c1.green()) + ((a/(a+b)) * c2.green());
               b = ((b/(a+b)) * c1.blue()) + ((a/(a+b)) * c2.blue());



               return jQuery.Color(r, g, b, null).toHexString();
            }
            return newColor;
        },

        _drawColorRamp: function() {
            var self = this, 
                handles = self.privateHandles.slice(),
                offset = 0,
                linearGradient = "",
                i,  
                orientation = "0deg";
    
           // console.log(handles, self.privateHandles);

            handles.sort(function (a, b) {
                            return a.percent - b.percent;
                        });

            //console.log(handles);

            if (self.options.categorical) {
                offset = 1;
            }

            for (i = 0; i < handles.length - offset; i++) {

                if (self.options.categorical) {
                    //console.log(this.options.myhandles[i].percent, this.options.myhandles[i + 1].percent);
                    linearGradient += ", " + handles[i].color + " " + handles[i].percent + "%" + ", " + handles[i].color + " " + handles[i + 1].percent + "%";

                } else {
                    //console.log(handles[i].percent);
                    linearGradient += ", " + handles[i].color + " " + handles[i].percent + "%";
                }
            }

            if (self.options.categorical) {
                linearGradient += ", " + handles[handles.length-1].color + " " + handles[handles.length-1].percent + "%";
            }


            linearGradient += ")";
            //self.options.orientation == "vertical" ? "bottom" : "left";
           // console.log("linear-gradient("+ orientation + linearGradient);
            self._colorSlider.css("background-image", 'none');
            self._colorSlider.css("background-image", "linear-gradient("+ orientation + linearGradient);
            //self._colorSlider.css("background", "-webkit-linear-gradient("+ orientation + linearGradient);

        },

        getWebGlColorRamp: function(){
            var self = this;
            return self._webGLRamp;
        },

        get8BitColors100: function (){
            var self = this,
                handlesArray = self.privateHandles.slice(),
                col8bit = [],
                handle, i, j, col, col1, col2, L, l;

            /*for (var i = 0; i < inputArray.length; i++)
                handlesArray[i] = $.extend(true,{},inputArray[i]);*/

            handlesArray.sort(function (a, b) {
                            return a.percent - b.percent;
                        });

          //  console.log(handlesArray.length);

            if (self.options.categorical){
                handlesArray[0].percent = 0;
                handle = {};
                handle.percent = 100;
                handle.color = handlesArray[handlesArray.length-1].color;
                handlesArray.push(handle);
              // console.log(handlesArray);
              for(i=0; i < handlesArray.length - 1; i++){
                col = jQuery.Color(handlesArray[i].color);
                
                for(j = Math.ceil(handlesArray[i].percent) + 1; j <= Math.floor(handlesArray[i+1].percent); j++){
                  col8bit.push(col.red());
                  col8bit.push(col.green());
                  col8bit.push(col.blue());
                  col8bit.push(255);
                }
              }
            } else {

              // if first handle not 0% add handle with 0% + first Color at beginning
              // if last handle not 100% add handle 100% + last Color
              if(handlesArray[0].percent != 0){
                  handle = {};
                  handle.percent = 0;
                  handle.color = handlesArray[0].color;
                  handlesArray.unshift(handle);
              }
              if(handlesArray[handlesArray.length-1].percent != 100){
                  handle = {};
                  handle.percent = 100;
                  handle.color = handlesArray[handlesArray.length-1].color;
                  handlesArray.push(handle);
              }

            //  console.log(handlesArray.length);


              for(i=0; i < handlesArray.length - 1; i++){
                col1 = jQuery.Color(handlesArray[i].color);
                col2 = jQuery.Color(handlesArray[i+1].color);
                L = Math.floor(handlesArray[i+1].percent) - Math.ceil(handlesArray[i].percent);
                for(j = Math.ceil(handlesArray[i].percent) + 1; j <= Math.floor(handlesArray[i+1].percent); j++){
                  l = j - Math.ceil(handlesArray[i].percent);
                  col8bit.push(Math.floor(col1.red() + l*(col2.red() - col1.red())/L)) ;
                  col8bit.push(Math.floor(col1.green() + l*(col2.green() - col1.green())/L)) ;
                  col8bit.push(Math.floor(col1.blue() + l*(col2.blue() - col1.blue())/L)) ;
                  col8bit.push(255);
                }
              }
            }
            //console.log(col8bit.length/4);
            return new Uint8Array(col8bit);
          },

           get8BitColors: function (){
            var self = this,
                handlesArray = self.privateHandles.slice(),
                col8bit = [],
                handle, i, j, col, col1, col2, L, l;

            /*for (var i = 0; i < inputArray.length; i++)
                handlesArray[i] = $.extend(true,{},inputArray[i]);*/
            /*
            handlesArray.sort(function (a, b) {
                            return a.percent - b.percent;
                        });*/

          //  console.log(handlesArray.length);

              for(i=0; i < handlesArray.length - 1; i++){
                col = jQuery.Color(handlesArray[i].color);
                col8bit.push(col.red());
                col8bit.push(col.green());
                col8bit.push(col.blue());
                col8bit.push(255);
                
              }
           
            return new Uint8Array(col8bit);
          }




});
})( jQuery, window, document );;(function ( $, window, document, undefined ) {

    //landis chart flot instance widget
    $.widget('landis.chart', {
        options: {
            chartId: '',
            scenarios: [],
            unit: '',
            extensionName: '',
            extensionId: -1,
            outputName: '',
            outputId: -1,
            fieldName: '',
            fieldDescription: '',
            minX: 0,
            maxX: 100,
            hiddenUIContainer: 'body'
        },
    // --------------------   
    // Basic Widget Methods
    // -------------------- 
        _create: function () {
            var self=this;
            this.element.addClass('chart-vis');
            
            
            self._results = [];

            self._flotData = [];
            self._flotOptions = {
                crosshairTime: { 
                    mode: "x",
                    lineWidth: 2,
                    color: "#39F"
                },
                xaxis: {
                    min: this.options.minX,
                    max: this.options.maxX

                },
                yaxis:{
                    axisLabel: this.options.unit
                },
                legend: {
                    position: "nw"
                },
                shadowSize: 0
            };

            this._setupUserInerfaceAndEvents();

            this._setOptions({
                'chartId': this.options.chartId,
                'scenarios': this.options.scenarios,
                'unit': this.options.unit,
                'extensionName': this.options.extensionName,
                'extensionId': this.options.extensionId,
                'outputName': this.options.outputName,
                'outputId': this.options.outputId,
                'fieldDescription': this.options.fieldDescription,
                'fieldName': this.options.fieldName,
                'minX': this.options.minX,
                'maxX': this.options.maxX,
                'hiddenUIContainer': this.options.hiddenUIContainer
            });

        },
        
        _destroy: function () {
            this.element.removeClass('chart-vis');
            this.element.empty();
            this._super();
        },

        _setOption: function (key, value) {
            var //self = this,
                prev = this.options[key],
                fnMap = {};

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

            // Main Container
            self._chartVis = $('<div>')
                .addClass('chart-vis-container')
                //.draggable({ containment: "#ApplicationData" })
                .appendTo(self.element);

            //header
            self._chartVisHeader = $('<div>')
                .addClass('chart-vis-header')
                .appendTo(self._chartVis);

            self._chartVisHeaderText = $('<div>')
                .addClass('chart-vis-text')
                .text(this.options.extensionName + ': ' + this.options.fieldName + ' ['+this.options.unit+']')
                .appendTo(self._chartVisHeader);
                 

            self._chartVisContent = $('<div>')
                .addClass('chart-vis-content')
                .appendTo(self._chartVis);

            //chart
            //console.log(self.options.chartId);
            self._chartVisChart = $('<div>')
                .addClass('chart-vis-chart')
                .attr('id', 'chart-'+self.options.chartId)
                .appendTo(self._chartVisContent);

           self._chartVisChart.resize(function(){
                self.updateTime();
             });

            //console.log(self.options.scenarios)              

            self._chartFilterButton = $('<div>')
                .addClass('filterButton')
                .attr('data-dropdown', '#dropdown-chartfilter-'+self.options.extensionId+"-"+self.options.outputId+"-"+self.options.fieldName)
                .attr('data-horizontal-offset', '-10')
                .appendTo(self._chartVisHeader);

            self._chartFilterDropdown = $('<div>')
                .attr('id', 'dropdown-chartfilter-'+self.options.extensionId+"-"+self.options.outputId+"-"+self.options.fieldName)
                .addClass('dropdown dropdown-tip dropdown-anchor-right dropdown-chartfilters')
                .on('show', function(event, dropdownData) {
                    //$.pubsub( 'publish', T_STOPPLAYBACK, 'scenario-selector' );
                })
                .on('hide', function(event, dropdownData) {
                    //$.pubsub( 'publish', T_CHANGESCENARIOS, 'selectedScenarioIds' );
                })
                .appendTo(self.options.hiddenUIContainer);

            self._chartFilterDropdownContent = $('<div>')
                .addClass('dropdown-panel')
                .append('<span>Filter:<span><br/>')
                .appendTo(self._chartFilterDropdown);


            self._filterFieldList = $('<select>')
                .addClass('filter-field-list')
                .appendTo(self._chartFilterDropdownContent);

            self._filterValueList = $('<select>')
                .addClass('filter-value-list')
                .append('<option value="false">none</option>')
                .appendTo(self._chartFilterDropdownContent);

            self._filterFieldList.on('change', function(){
                var singleVals = [], i, uniqueVals, option, data;
                for(i=0; i < self._results[0].results.rows.length; i++){
                    singleVals.push(self._results[0].results.rows[i][this.value]);
                }
                // usage example:
                uniqueVals = singleVals.filter( onlyUnique );
                //console.log(uniqueVals);
                option = '<option value="false">none</option>';
                if(uniqueVals[0] !== undefined){
                    for (i=0; i<uniqueVals.length; i++){
                        if(uniqueVals[i] != ''){
                            option += '<option value="'+ uniqueVals[i] + '">' + uniqueVals[i] + '</option>';
                        }
                    }
                }
                self._filterValueList.html(option);

                self._flotData = [];
                //console.log(self._results);

                for(i=0; i < self.options.scenarios.length; i++) {
                    
                    //console.log(results.results.fields);
                    data = self.generateFlotData(
                                    [self._results[i]],
                                    [self.options.fieldName],
                                    'Time',
                                    {'EcoregionName': ['inactiv','inactive'], 'Ecoregion': ['inactiv','inactive']},
                                    {},
                                    'NumSites', 1);
                    //console.log(self._results[i]);
                    self._flotData.push({label: landisMetadata.getScenarioAttributeById(self.options.scenarios[i],'name'), data: data});
                    
                }
                self._flot.setData(self._flotData);

                //Since the axes don't change, we don't need to call plot.setupGrid()
                self._flot.draw();
            });
            

            self._filterValueList.on('change', function(){
                var filterObject = {}, i, data;
                
                if(self._filterFieldList.val() != 'false' &&  this.value != 'false'){
                    filterObject[self._filterFieldList.val()] = this.value;
                }
                //console.log("filter", filterObject);
                self._flotData = [];

                for(i=0; i < self.options.scenarios.length; i++) {
                    
                    //console.log(results.results.fields);
                    data = self.generateFlotData(
                                    [self._results[i]],
                                    [self.options.fieldName],
                                    'Time',
                                    {'EcoregionName': ['inactiv','inactive'], 'Ecoregion': ['inactiv','inactive']},
                                    filterObject,
                                    'NumSites', 1);
                    self._flotData.push({label: landisMetadata.getScenarioAttributeById(self.options.scenarios[i],'name'), data: data});
                    
                }
                self._flot.setData(self._flotData);

                //Since the axes don't change, we don't need to call plot.setupGrid()
                self._flot.draw();
            });

                
        },


    // ---------------------------
    // Basic UserInterface Event Methods
    // ---------------------------

        loadData: function(){
            var self = this,
                //loadCsvByScenarios = {},
                csvFile, option;
            $.ajaxSetup({'async': false});
            for(s in self.options.scenarios) {
                
                csvFile = landisSettings.settings.landisdata.path + "/"
                    + landisSettings.settings.landisdata.modeldata + "/"
                    + self.options.scenarios[s] + "/" + self.options.extensionId + "/" + self.options.outputId + "/" + self.options.outputId + ".csv";
                $.get(csvFile).always(function(data2) {
                    //console.log( "finished" );
                    var results = $.parse(data2, {
                            delimiter: ",",
                            header: true,
                            dynamicTyping: true,
                            trimWhite: true
                        }),
                        cf, data;

                    //console.log(results.results.fields);
                    
                    cf = 1.0;
                    //FIXME Conversion
                    /*
                    if(self.options.fieldName == 'TotalDamagedSites'){
                        //4ha for a site, ha to acres
                        //FIXME get ha from file
                        cf =  4 * 2.47105381;
                        self._chartVisHeaderText.text(self.options.extensionName + ': ' + self.options.fieldName + ' [acres]');

                    };*/

                    data = self.generateFlotData([results], [self.options.fieldName], 'Time', {'EcoregionName': ['inactiv','inactive'], 'Ecoregion': ['inactiv','inactive']}, {}, 'NumSites', cf);
                    self._flotData.push({label: landisMetadata.getScenarioAttributeById(self.options.scenarios[s],'name'), data: data});
                    self.drawChart();
                    self._results.push(results);
                });
                

            }



            //console.log('selfresults', self._results);
            option = '<option value="false">none</option>';
            for (i=0; i<self._results[0].results.fields.length; i++){
                if(self._results[0].results.fields[i] != ''){
                    option += '<option value="'+ self._results[0].results.fields[i] + '">' + self._results[0].results.fields[i] + '</option>';
                }
            }
            self._filterFieldList.append(option);
    
         
        },

        generateFlotData: function(csvObjectsByScenarios, parameterList , groupByParameter, excludeParameterValue, filterParameterValue, numSitesFieldName, conversionFactor){
            //console.log('FlotDataGen');
            var charts = [], p, chart, s, dataseries, dataseriesArr, filtering, r, exclude, include, pVal, numSitesVal, totalNumSites;
            // loop paramter List
            for(p = 0; p < parameterList.length; p++){
                //console.log(parameterList[p]);
                //console.log(csvObjectsByScenarios.length);
                chart = [];
                // loop scenarios
                for(s = 0; s < csvObjectsByScenarios.length; s++){
                    //console.log('csvObj',csvObjectsByScenarios[s]);
                    dataseries = {};
                    dataseriesArr = [];
                    filtering = false;
                    //loop over rows in csv
                    totalNumSites = 0;
                    for(r=0; r < csvObjectsByScenarios[s].results.rows.length; r++){
                        exclude = false;
                        for(field in excludeParameterValue) {
                            //exclude specified values of speciefied attributes (e.g. if at year X Ecoregion Name = incactive)
                            for(var ex=0; ex < excludeParameterValue[field].length; ex++) {
                                //console.log(excludeParameterValue[field][ex]);
                                //console.log(csvObjectsByScenarios[s].results.rows[r][field]);
                                if(csvObjectsByScenarios[s].results.rows[r][field] == excludeParameterValue[field][ex]){
                                    exclude = true;
                                } 
                            }
                            
                        }
                        include = true;
                        if(!jQuery.isEmptyObject(filterParameterValue)){
                            for(field in filterParameterValue) {
                                if(csvObjectsByScenarios[s].results.rows[r][field] == filterParameterValue[field]){
                                    include = true;
                                } else {
                                    include = false;
                                }
                            }
                        } else {
                            include = true;
                        }
                         

                        if(!exclude && include) {
                            //console.log(csvObjectsByScenarios[s].results.rows[r][parameterList[p]]);
                            pVal = csvObjectsByScenarios[s].results.rows[r][parameterList[p]];
                            //console.log(pVal);
                            numSitesVal = 1.0;
                            //if no filter and numSiteField is in csv
                            if(jQuery.isEmptyObject(filterParameterValue) && jQuery.inArray(numSitesFieldName, csvObjectsByScenarios[s].results.fields) > -1){
                                numSitesVal = csvObjectsByScenarios[s].results.rows[r][numSitesFieldName];
                                totalNumSites += numSitesVal;
                                filtering = true;
                            }
                            if (csvObjectsByScenarios[s].results.rows[r][groupByParameter] in dataseries) {
                                // ADD UP
                                dataseries[csvObjectsByScenarios[s].results.rows[r][groupByParameter]] += pVal * conversionFactor * numSitesVal;
                            } else {
                                // Create and ADD
                                //console.log(csvObjectsByScenarios[s].results.rows[r][groupByParameter]);
                                dataseries[csvObjectsByScenarios[s].results.rows[r][groupByParameter]] = pVal * conversionFactor * numSitesVal;
                            }
                        }
                        
                    }
                    totalNumSites /= Object.keys(dataseries).length;

                    for(timestep in dataseries) {
                        if (filtering){
                            dataseries[timestep] /= totalNumSites;
                        }
                        dataseriesArr.push([parseFloat(timestep), dataseries[timestep]]);
                    }
                    
                    chart.push(dataseriesArr);
                }
                charts.push(chart);
            }
           // console.log("chart", dataseriesArr);
            return dataseriesArr;
        },
        drawChart: function(){
             var self = this;
             //console.log(self._flotData);   
             self._flot = $.plot($('#chart-'+self.options.chartId), self._flotData, self._flotOptions);
             self._flot.setCrosshairTime({ x: $('#TimeControl').timeControl('option','currentTime'), y: -1 });
        },

        updateTime: function(){
            var self = this;
            self._flot.setCrosshairTime({ x: $('#TimeControl').timeControl('option','currentTime'), y: -1 });
        },

        updateChartData: function(newScenarios) {
            var self = this,
                dataSeriesToDelete = [],
                seen, draw = false;

            //console.log(self.options.scenarios, newScenarios);
            //update the data line of chart
            //if scenario is new ... add to data
            //if scenario is not in newScenario but still in chart remove it
                        
            //remove
            for(os in self.options.scenarios) {
                seen = -1;
                for (ns in newScenarios) {
                    if(newScenarios[ns] == self.options.scenarios[os]){
                        seen = os;
                        break;
                    }
                }

                if(seen === -1){
                    //remove scenario from graph
                    dataSeriesToDelete.push(os);
                    draw = true;
                }
            }

            dataSeriesToDelete.sort();
            dataSeriesToDelete.reverse();
            //console.log(dataSeriesToDelete);

            for(dataSeries in dataSeriesToDelete){
                self.options.scenarios.splice(dataSeriesToDelete[dataSeries],1);
                //self._flotData.splice(dataSeriesToDelete[dataSeries],1);
                    
            }
            

            //add
            for(ns in newScenarios) {
                seen = -1;
                for(os in self.options.scenarios){
                    if(newScenarios[ns] == self.options.scenarios[os]){
                        seen = ns;
                        break;
                    }
                }

                if(seen === -1) {
                    //add scenario to graph
                    self.options.scenarios.push(newScenarios[ns]);
                    draw = true;
                }
            }
            if(draw) {
                self._results = [];
                self._flotData = [];
                self.loadData();
            }
            
        }


    });

})( jQuery, window, document ); ;(function ( $, window, document, undefined ) {

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
            //console.log("view:", self._olMap.getView());
        },

        drawMap: function(base_layer){
            var self = this,
                s = landisSettings.settings.map;
            //console.log('DRAW MAP ID:'+self.options.mapId);

            self._olMap = new ol.Map({
                renderer: ol.RendererHint.WEBGL,
                target: self._mapBox.prop('id'),
                layers: [
                    self._timeSeriesLayer[self._hiddenIdx],
                    base_layer,
                    self._timeSeriesLayer[self._visibleIdx]
                    
                    ],
                view: new ol.View2D({
                    center: s.center,
                    resolution: s.resolution,
                    resolutions: s.resolutions,
                    extent: s.extent
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

})( jQuery, window, document );//PUBSUB SYSTEM !!! GLOBAL
var T_CURRENTTIME = 'currentTime',
    T_CHANGESCENARIOS = 'changeScenarios',
    T_CHANGEMAPS = 'changeMaps',
    T_CHANGECHARTS = 'changeCharts',
    T_STOPPLAYBACK = 'stopPlayback',
    T_COLORRAMP = 'updateColorRamp',
    T_MINMAX = 'updateMinMax',

updateCurrentTime = function( topic, currentTime ){
    landisCharts.updateTime();
    landisMaps.updateTime();
},

updateColorRamp = function(topic, mapGroupId){
    landisMaps.updateColorRamp(mapGroupId);
},

updateMinMax = function(topic, mapGroupId){
    landisMaps.updateMinMax(mapGroupId);
},

changeScenarios = function (topic, data){
    
   // console.log(topic, data);
    
    var scenarioSelector = $('#ScenarioSelector'),
        timeControl = $('#TimeControl'),
        mapSelector = $('#MapSelector'),
        selectedScenarioIds = scenarioSelector.scenarioSelector('option','selectedScenarioIds'),
        oldTimeMin = timeControl.timeControl('option','timeMin'),
        oldTimeMax = timeControl.timeControl('option','timeMax'),
        newTimeMin = landisMetadata.getScenarioAttributeById(selectedScenarioIds[0], 'timeMin'),
        newTimeMax = landisMetadata.getScenarioAttributeById(selectedScenarioIds[0], 'timeMax'),
        i, pLimit;

    //console.log(newTimeMin, newTimeMax);
    if(selectedScenarioIds.length > 1){
        for(i=1; i < selectedScenarioIds.length; i++){
            newTimeMin = Math.min(newTimeMin, landisMetadata.getScenarioAttributeById(selectedScenarioIds[i], 'timeMin'));
            newTimeMax = Math.max(newTimeMax, landisMetadata.getScenarioAttributeById(selectedScenarioIds[i], 'timeMax'));
        }
    }

    if(oldTimeMin != newTimeMin){
       timeControl.timeControl('option','timeMin', newTimeMin);
    }
    if(oldTimeMax != newTimeMax){
       timeControl.timeControl('option','timeMax', newTimeMax);
    }

    //send Info somehow to mapSelector
    pLimit = 2;
    if(selectedScenarioIds.length < 2){
        pLimit = 4;
    }else if(selectedScenarioIds.length > 2){
        pLimit = 1;
    }
    mapSelector.mapSelector('option', 'parameterLimit', pLimit);

    mapsToDraw();
    chartsToDraw();
    landisMaps.unsyncMapGroups();
    landisMaps.checkMapSync();

},

changeMaps = function(topic, data){
    //console.log(topic, data);
    var scenarioSelector = $('#ScenarioSelector'),
        mapSelector = $('#MapSelector'),
        selectedParameterIds = mapSelector.mapSelector('option','selectedParameterIds'),
        sLimit = 2;
    
    //console.log(selectedParameterIds);

    if(selectedParameterIds.length < 2){
        sLimit = 4;
    }else if(selectedParameterIds.length > 2){
        sLimit = 1;
    }

    scenarioSelector.scenarioSelector('option', 'scenarioMax', sLimit);

    mapsToDraw();
    updateTimeInterval();
    landisMaps.unsyncMapGroups();
    landisMaps.checkMapSync();

},

changeCharts = function(topic, data){
    //console.log(topic, data);

    chartsToDraw();
    updateTimeInterval();

},

stopPlayback = function(topic, data){
    var timeControl = $('#TimeControl');
    //Stop Animation if running
    timeControl.timeControl('stopPlayback');
},

mapsToDraw = function(){
    var scenarioSelector = $('#ScenarioSelector'),
        mapSelector = $('#MapSelector'),
        sIds = scenarioSelector.scenarioSelector('option', 'selectedScenarioIds'),
        eoIds = mapSelector.mapSelector('option','selectedParameterIds'),
        mapCandidates = [],
        i, map, scenarios, j;
    //console.log("mapstodraw");

    for(i=0; i < eoIds.length; i++){
        map = {};
        map.extension = eoIds[i][0];
        map.output = eoIds[i][1];
        scenarios = [];
        for(j=0; j < sIds.length; j++){
            scenarios.push(sIds[j]);
        }
        map.scenarios = scenarios;
        mapCandidates.push(map);
        //console.log('Map Candidate (s-e-o):'+map.scenarios+'-'+map.extension+'-'+map.output);
    }
    //loadStats

    //console.log(mapCandidates.);
    landisMaps.checkMapCandidates(mapCandidates);
    landisMaps.bindViewsToFirstMap();
    //arrangeApplicationData();
    landisMaps.rearangeMapsInMapGroup();

},

chartsToDraw = function(){
    var scenarioSelector = $('#ScenarioSelector'),
        //timeControl = $('#TimeControl'),
        chartSelector = $('#ChartSelector'),
        sIds = scenarioSelector.scenarioSelector('option', 'selectedScenarioIds'),
        eofIds = chartSelector.chartSelector('option','selectedParameterIds'),
        chartCandidates = [],
        i, chart, scenarios, j;
    //console.log("chartstodraw");
    for(i=0; i < eofIds.length; i++){
        chart = {};
        chart.extension = eofIds[i][0];
        chart.output = eofIds[i][1];
        chart.field = eofIds[i][2];
        scenarios = [];
        for(j=0; j < sIds.length; j++){
            scenarios.push(sIds[j]);
        }
        chart.scenarios = scenarios;
        chartCandidates.push(chart);
    }
    //console.log(chartCandidates);
    //console.log(landisCharts);
    landisCharts.checkChartCandidates(chartCandidates);

},

updateTimeInterval = function(){
    var mapSelector = $('#MapSelector'),
        timeControl = $('#TimeControl'),
        chartSelector = $('#ChartSelector'),
        eoIdsMapsCharts = (mapSelector.mapSelector('option','selectedParameterIds')).concat(chartSelector.chartSelector('option','selectedParameterIds')),
        intervals = [],
        i;
    //console.log('extensions:', eoIdsMapsCharts);
   
    for(i = 0; i < eoIdsMapsCharts.length; i++){
        intervals.push(landisMetadata.getExtensionAttributeById(eoIdsMapsCharts[i][0], 'timeInterval'));
    }
    timeControl.timeControl('option', 'timeInterval', mdc(intervals));

    //Playbutton control
    //length of eoIds = 0 disabled
    //only if equal less than two maps enble...
};
    //END PUBSUB SYSTEM !!!

function setupPubSubSystem(){
    $.pubsub( 'subscribe', T_CURRENTTIME, updateCurrentTime );
    $.pubsub( 'subscribe', T_CHANGESCENARIOS, changeScenarios );
    $.pubsub( 'subscribe', T_CHANGEMAPS, changeMaps );
    $.pubsub( 'subscribe', T_CHANGECHARTS, changeCharts );
    $.pubsub( 'subscribe', T_STOPPLAYBACK, stopPlayback );
    $.pubsub( 'subscribe', T_COLORRAMP, updateColorRamp );
    $.pubsub( 'subscribe', T_MINMAX, updateMinMax );
}var landisMetadata, landisMaps, landisCharts, landisSettings, mapSync = false;

//START APPLICATION
$( document ).ready(function() {

    landisSettings = $.landisSettings();
    landisSettings.setProjectName();

    setupPubSubSystem();

    landisMaps =  $.landisMaps();
    landisCharts = $.landisCharts();
    landisMetadata = $.landisMetadata();
    
    $('#TimeControl').timeControl({
        currentTime: landisSettings.settings.playback.time,
        playbackSpeed: landisSettings.settings.playback.speed,
        snapToInterval: landisSettings.settings.playback.snap,
        hiddenUIContainer: '#HiddenUIContainer'
    });

    $('#ScenarioSelector').scenarioSelector({
        scenarios: landisMetadata.publishScenarios(['id', 'name']),
        hiddenUIContainer: '#HiddenUIContainer'
    });

    //landisDatastructure.publishExtensions();
    //console.log(landisDatastructure.publishMapOutputs());
    $('#MapSelector').mapSelector({
        mapoutputs: landisMetadata.publishMapOutputs(),
        hiddenUIContainer: '#HiddenUIContainer'
    });

    //console.log(landisDatastructure.publishTableOutputs());
    
    $('#ChartSelector').chartSelector({
        chartoutputs: landisMetadata.publishTableOutputs(),
        hiddenUIContainer: '#HiddenUIContainer'
    });

    

});
$( document ).ready(function() {

    $('#toggleFullscreen').on('click', function (e) {
            $(document).toggleFullScreen();
            
    });

    $(document).bind("fullscreenchange", function() {
        if($(document).fullScreen()) {
            $('#toggleFullscreen').addClass('isFull');
        } else {
            $('#toggleFullscreen').removeClass('isFull');
        }
    });

    $('#syncMapGroupsByUnit').on('click', function(e) {
        /*if (!$(this).hasClass('syncAble')){
            console.log('NOT SYNC ABLE');
        }*/
        if($(this).hasClass('syncAble')){
            if(!$(this).hasClass('isSynced')) {
                //SYNC
                landisMaps.syncMapGroupsByUnit();
                $(this).addClass('isSynced');
            } else {
                //UNSYNC
                landisMaps.unsyncMapGroups();
                $(this).removeClass('isSynced');
            }

        }

    });

});

$(window).resize(function(){
    arrangeApplicationData();
});
// var declearation way up
var arrangeApplicationData = function() {
        //Get new height
        var contentContainer = $('#ApplicationData'),
            mapContainer = $('#MapContainer'),
            chartContainer = $('#ChartContainer'),
            contentHeight = $(window).height() - $('#ApplicationControl').outerHeight(),
            contentWidth = $(window).width(),
            ratio = contentWidth/contentHeight,
            maps, charts;

        //$('#ProjectName').html(contentWidth+' x '+ contentHeight +' - '+ ratio);
        //resize dataview to new height
        contentContainer.css({'height': contentHeight, 'width':contentWidth});


        maps = mapContainer.find('.map-group-container');
        charts = chartContainer.find('.chart-vis-container');
        //console.log(maps.length, charts.length);

        if (maps.length > 0 && charts.length == 0) {
            mapContainer.css({'height': contentHeight, 'width':contentWidth});
            chartContainer.css({'height': 0, 'width':0});
            maps.each(function(){

                    switch(maps.length){
                        case 1:
                            $( this ).outerHeight(mapContainer.outerHeight());
                            $( this ).outerWidth(mapContainer.outerWidth());
                            break;
                        case 2:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(mapContainer.outerHeight());
                            $( this ).outerWidth(mapContainer.outerWidth()*0.5-0.5);
                            if($( this ).outerHeight() > $( this ).outerWidth()){
                                $( this ).outerHeight( $( this ).outerWidth() );   
                            }
                            break;
                        case 3:
                        case 4:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(mapContainer.outerHeight()*0.5);
                            $( this ).outerWidth(mapContainer.outerWidth()*0.5-0.5);
                            break;

                    }
                    

                });
        } else if (maps.length == 0 && charts.length > 0) {
            mapContainer.css({'height': 0, 'width':0});
            chartContainer.css({'height': contentHeight, 'width':contentWidth});
            charts.each(function(){

                    switch(charts.length){
                        case 1:
                            $( this ).outerHeight(chartContainer.outerHeight());
                            $( this ).outerWidth(chartContainer.outerWidth());
                            break;
                        case 2:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(chartContainer.outerHeight());
                            $( this ).outerWidth(chartContainer.outerWidth()*0.5-0.5);
                            if($( this ).outerHeight() > $( this ).outerWidth()){
                                $( this ).outerHeight( $( this ).outerWidth() );   
                            }
                            break;
                        case 3:
                        case 4:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(chartContainer.outerHeight()*0.5);
                            $( this ).outerWidth(chartContainer.outerWidth()*0.5-0.5);
                            break;

                    }
                    

                });

        } else if(maps.length > 0 && charts.length > 0) {
            if( ratio > 1.6 ){
                mapContainer.css({'height': contentHeight, 'width':contentWidth*0.70, 'float':'left'});
                chartContainer.css({'height': contentHeight, 'width':contentWidth*0.30, 'float':'left'});
                maps.each(function(){

                    switch(maps.length){
                        case 1:
                            $( this ).outerHeight(mapContainer.outerHeight());
                            $( this ).outerWidth(mapContainer.outerWidth());
                            break;
                        case 2:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(mapContainer.outerHeight());
                            $( this ).outerWidth(mapContainer.outerWidth()*0.5-0.5);
                            if($( this ).outerHeight() > $( this ).outerWidth()){
                                $( this ).outerHeight( $( this ).outerWidth() );   
                            }
                            break;
                        case 3:
                        case 4:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(mapContainer.outerHeight()*0.5);
                            $( this ).outerWidth(mapContainer.outerWidth()*0.5-0.5);
                            break;

                    }
                    

                });
                charts.each(function() {
                    if(chartContainer.outerWidth()/chartContainer.outerHeight() >=0.9){
                        $( this ).css({'float':'left'});
                        if(charts.length  == 1 ){
                            $( this ).outerHeight(chartContainer.outerHeight());
                            $( this ).outerWidth(chartContainer.outerWidth());
                            if($( this ).outerHeight() > $( this ).outerWidth()){
                                $( this ).outerHeight( $( this ).outerWidth() );   
                            }

                        } else if(charts.length == 2 ) {
                            $( this ).outerHeight(chartContainer.outerHeight());
                            $( this ).outerWidth(chartContainer.outerWidth()*0.5-0.5);
                            if($( this ).outerHeight() > $( this ).outerWidth()){
                                $( this ).outerHeight( $( this ).outerWidth() );   
                            }
                        }else if(charts.length > 2 ) {
                            $( this ).outerHeight(chartContainer.outerHeight()*0.5);
                            $( this ).outerWidth(chartContainer.outerWidth()*0.5-0.5);
                        }
                    } else {
                        $( this ).outerHeight(chartContainer.outerHeight()/charts.length);
                        $( this ).outerWidth(chartContainer.outerWidth());
                        if($( this ).outerHeight() > $( this ).outerWidth()){
                            $( this ).outerHeight( $( this ).outerWidth() );   
                        }
                    }
                });
            } else {
                mapContainer.css({'height': contentHeight*0.65, 'width':contentWidth});
                chartContainer.css({'height': contentHeight*0.35, 'width':contentWidth});
                maps.each(function(){

                    switch(maps.length){
                        case 1:
                            $( this ).outerHeight(mapContainer.outerHeight());
                            $( this ).outerWidth(mapContainer.outerWidth());
                            break;
                        case 2:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(mapContainer.outerHeight());
                            $( this ).outerWidth(mapContainer.outerWidth()*0.5-0.5);
                            break;
                        case 3:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(mapContainer.outerHeight());
                            $( this ).outerWidth(mapContainer.outerWidth()/3);
                            break;
                        case 4:
                            $( this ).css({'float':'left'});
                            $( this ).outerHeight(mapContainer.outerHeight()*0.5);
                            $( this ).outerWidth(mapContainer.outerWidth()*0.5-0.5);
                            break;
                    }
                    

                });
                charts.each(function() {
                    if(chartContainer.outerWidth()/chartContainer.outerHeight() <= 2){
                        $( this ).css({'float':'left'});
                        
                        if(charts.length  == 1 ){
                            $( this ).outerHeight(chartContainer.outerHeight());
                            $( this ).outerWidth(chartContainer.outerWidth());
                            if($( this ).outerHeight() > $( this ).outerWidth()){
                                $( this ).outerHeight( $( this ).outerWidth() );   
                            }

                        } else if(charts.length == 2 ) {
                            $( this ).outerHeight(chartContainer.outerHeight());
                            $( this ).outerWidth(chartContainer.outerWidth()*0.5-0.5);
                            if($( this ).outerHeight() > $( this ).outerWidth()){
                                $( this ).outerHeight( $( this ).outerWidth() );   
                            }
                        }else if(charts.length >2 ) {
                            $( this ).outerHeight(chartContainer.outerHeight()*0.5);
                            $( this ).outerWidth(chartContainer.outerWidth()*0.5-0.5);
                        }
                    } else {
                        $( this ).css({'float':'left'});
                        $( this ).outerHeight(chartContainer.outerHeight());
                        $( this ).outerWidth(chartContainer.outerWidth()/charts.length);
                        if( $( this ).outerWidth() / $( this ).outerHeight() > 2){
                            $( this ).outerWidth( $( this ).outerHeight() * 2 );   
                        }
                    }
                });
            }

        }

       landisMaps.rearangeMapsInMapGroup(); 

};
