;(function ( $, window, document, undefined ) {

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

})( jQuery, window, document );