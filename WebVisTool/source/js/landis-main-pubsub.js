//PUBSUB SYSTEM !!! GLOBAL
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

    landisMaps.checkMapSync();

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
}