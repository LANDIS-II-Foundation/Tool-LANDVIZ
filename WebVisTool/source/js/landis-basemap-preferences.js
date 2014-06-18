;(function ( $, window, document, undefined ) {

    //LANDIS Chart Selector Widget
    $.widget('landis.baseMapPreferences', {
        options: {
            brightness: {},
            contrast: [],
            saturation: 4,
            source: ,
            hiddenUIContainer: 'body'
        },
    // --------------------   
    // Basic Widget Methods
    // -------------------- 
        _create: function () {

            this.element.addClass('basemap-preference');
            
            this._setupUserInerfaceAndEvents();

            this._setOptions({
                'brightness': this.options.brightness,
                'contrast': this.options.contrast,
                'saturation': this.options.saturation,
                'source': this.options.source,
                'hiddenUIContainer': this.options.hiddenUIContainer
            });

        },
        
        _destroy: function () {
            this.element.removeClass('basemap-preference');
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

            // check value
            // switch(key) {
            //     case 'mainScenarioId':
            //         value = parseInt(value);
            //         break;
            //     case 'compareScenarioId':
            //         value = parseInt(value);
            //         break;
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

})( jQuery, window, document );