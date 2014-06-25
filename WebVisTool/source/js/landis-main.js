var landisMetadata, landisMaps, landisCharts, landisSettings;

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
