
;(function($) {
    $.landisMaps = function() { 
        this.set = function() {
            this.init = true;
            this.mapGroups = [];
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
            var i;
            for(i=0; i < this.mapGroups.length; i++){
                if (this.mapGroups[i].rasterMapGroup.rastermapgroup('getMapGroupId') == mapGroupId) {
                    this.mapGroups[i].rasterMapGroup.rastermapgroup('updateColorRamp');
                    break;
                }   
            }
        };

        this.updateMinMax = function(mapGroupId){
            var i;
            for(i=0; i < this.mapGroups.length; i++){
                if (this.mapGroups[i].rasterMapGroup.rastermapgroup('getMapGroupId') == mapGroupId) {
                    this.mapGroups[i].rasterMapGroup.rastermapgroup('updateMinMax');
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

        this.syncMaps = function(){
            var i, allMapObjects = [];
            if(this.mapGroups.length > 0){
                for(i = 0; i < this.mapGroups.length; i++){
                    allMapObjects.push(this.mapGroups[i].rasterMapGroup.rastermapgroup('getAllMapObjects'));
                }
                console.log(allMapObjects);
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