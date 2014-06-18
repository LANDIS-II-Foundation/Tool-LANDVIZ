$( document ).ready(function() {

    $('#toggleFullscreen').on('click', function (e  ) {
            $(document).toggleFullScreen();
            
    });

    $(document).bind("fullscreenchange", function() {
        if($(document).fullScreen()) {
            $('#toggleFullscreen').addClass('isFull');
        } else {
            $('#toggleFullscreen').removeClass('isFull');
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
