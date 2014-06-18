;(function ( $, window, document, undefined ) {

    // define your widget under a namespace of your choice
    // with additional parameters e.g.
    // $.widget( "namespace.widgetname", (optional) - an
    // existing widget prototype to inherit from, an object
    // literal to become the widget's prototype );

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
                        }
                        
                    },
                    'max': function () {
                        if(self.options.dataType != 'nominal') {
                            self._rangeSlider.slider('option', 'max', self.options.max); 
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
                       // console.log(self.options.filterMin);
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
                            console.log('stoped');
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
})( jQuery, window, document );