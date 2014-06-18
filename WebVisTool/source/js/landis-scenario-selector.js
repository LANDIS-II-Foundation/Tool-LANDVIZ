;(function ( $, window, document, undefined ) {

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

})( jQuery, window, document );