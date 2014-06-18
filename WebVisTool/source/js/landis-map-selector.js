;(function ( $, window, document, undefined ) {

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

})( jQuery, window, document );