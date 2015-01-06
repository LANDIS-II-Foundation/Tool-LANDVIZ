;(function($) {
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
            mapSync = false;
            $('.syncedInfo').remove();
            $('.map-group-sidebar').children().not("[name='checkbox-mode-change']").show();

            //FIXME = > SET ORIGINAL MIN MAX .. and RERender
            //REMOVE INFO "SYNCED"

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
                            sb.append('<p class="syncedInfo">Synced</p>');
                            
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
                    for(i = 0; i < this.mapGroupsByUnit[u].length; i++){
                        //this.mapGroups[this.mapGroupsByUnit[u][i]].rasterMapGroup.rastermapgroup('setMinMax', minMax[0], minMax[1]);

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