;(function ( $, window, document, undefined ) {

    //landis chart flot instance widget
    $.widget('landis.chart', {
        options: {
            chartId: '',
            scenarios: [],
            unit: '',
            extensionName: '',
            extensionId: -1,
            outputName: '',
            outputId: -1,
            fieldName: '',
            fieldDescription: '',
            minX: 0,
            maxX: 100,
            hiddenUIContainer: 'body'
        },
    // --------------------   
    // Basic Widget Methods
    // -------------------- 
        _create: function () {
            var self=this;
            this.element.addClass('chart-vis');
            
            
            self._results = [];

            self._flotData = [];
            self._flotOptions = {
                crosshairTime: { 
                    mode: "x",
                    lineWidth: 2,
                    color: "#39F"
                },
                xaxis: {
                    min: this.options.minX,
                    max: this.options.maxX

                },
                yaxis:{
                    axisLabel: this.options.unit
                },
                legend: {
                    position: "nw"
                },
                shadowSize: 0
            };

            this._setupUserInerfaceAndEvents();

            this._setOptions({
                'chartId': this.options.chartId,
                'scenarios': this.options.scenarios,
                'unit': this.options.unit,
                'extensionName': this.options.extensionName,
                'extensionId': this.options.extensionId,
                'outputName': this.options.outputName,
                'outputId': this.options.outputId,
                'fieldDescription': this.options.fieldDescription,
                'fieldName': this.options.fieldName,
                'minX': this.options.minX,
                'maxX': this.options.maxX,
                'hiddenUIContainer': this.options.hiddenUIContainer
            });

        },
        
        _destroy: function () {
            this.element.removeClass('chart-vis');
            this.element.empty();
            this._super();
        },

        _setOption: function (key, value) {
            var //self = this,
                prev = this.options[key],
                fnMap = {};

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
            self._chartVis = $('<div>')
                .addClass('chart-vis-container')
                //.draggable({ containment: "#ApplicationData" })
                .appendTo(self.element);

            //header
            self._chartVisHeader = $('<div>')
                .addClass('chart-vis-header')
                .appendTo(self._chartVis);

            self._chartVisHeaderText = $('<div>')
                .addClass('chart-vis-text')
                .text(this.options.extensionName + ': ' + this.options.fieldName + ' ['+this.options.unit+']')
                .appendTo(self._chartVisHeader);
                 

            self._chartVisContent = $('<div>')
                .addClass('chart-vis-content')
                .appendTo(self._chartVis);

            //chart
            //console.log(self.options.chartId);
            self._chartVisChart = $('<div>')
                .addClass('chart-vis-chart')
                .attr('id', 'chart-'+self.options.chartId)
                .appendTo(self._chartVisContent);

           self._chartVisChart.resize(function(){
                self.updateTime();
             });

            //console.log(self.options.scenarios)              

            self._chartFilterButton = $('<div>')
                .addClass('filterButton')
                .attr('data-dropdown', '#dropdown-chartfilter-'+self.options.extensionId+"-"+self.options.outputId+"-"+self.options.fieldName)
                .attr('data-horizontal-offset', '-10')
                .appendTo(self._chartVisHeader);

            self._chartFilterDropdown = $('<div>')
                .attr('id', 'dropdown-chartfilter-'+self.options.extensionId+"-"+self.options.outputId+"-"+self.options.fieldName)
                .addClass('dropdown dropdown-tip dropdown-anchor-right dropdown-chartfilters')
                .on('show', function(event, dropdownData) {
                    //$.pubsub( 'publish', T_STOPPLAYBACK, 'scenario-selector' );
                })
                .on('hide', function(event, dropdownData) {
                    //$.pubsub( 'publish', T_CHANGESCENARIOS, 'selectedScenarioIds' );
                })
                .appendTo(self.options.hiddenUIContainer);

            self._chartFilterDropdownContent = $('<div>')
                .addClass('dropdown-panel')
                .append('<span>Filter:<span><br/>')
                .appendTo(self._chartFilterDropdown);


            self._filterFieldList = $('<select>')
                .addClass('filter-field-list')
                .appendTo(self._chartFilterDropdownContent);

            self._filterValueList = $('<select>')
                .addClass('filter-value-list')
                .append('<option value="false">none</option>')
                .appendTo(self._chartFilterDropdownContent);

            self._filterFieldList.on('change', function(){
                var singleVals = [], i, uniqueVals, option, data;
                for(i=0; i < self._results[0].results.rows.length; i++){
                    singleVals.push(self._results[0].results.rows[i][this.value]);
                }
                // usage example:
                uniqueVals = singleVals.filter( onlyUnique );
                //console.log(uniqueVals);
                option = '<option value="false">none</option>';
                if(uniqueVals[0] !== undefined){
                    for (i=0; i<uniqueVals.length; i++){
                        if(uniqueVals[i] != ''){
                            option += '<option value="'+ uniqueVals[i] + '">' + uniqueVals[i] + '</option>';
                        }
                    }
                }
                self._filterValueList.html(option);

                self._flotData = [];
                //console.log(self._results);

                for(i=0; i < self.options.scenarios.length; i++) {
                    
                    //console.log(results.results.fields);
                    data = self.generateFlotData(
                                    [self._results[i]],
                                    [self.options.fieldName],
                                    'Time',
                                    {'EcoregionName': 'inactiv', 'Ecoregion': 'inactiv'},
                                    {},
                                    'NumSites', 1);
                    //console.log(self._results[i]);
                    self._flotData.push({label: landisMetadata.getScenarioAttributeById(self.options.scenarios[i],'name'), data: data});
                    
                }
                self._flot.setData(self._flotData);

                //Since the axes don't change, we don't need to call plot.setupGrid()
                self._flot.draw();
            });
            

            self._filterValueList.on('change', function(){
                var filterObject = {}, i, data;
                
                if(self._filterFieldList.val() != 'false' &&  this.value != 'false'){
                    filterObject[self._filterFieldList.val()] = this.value;
                }
                //console.log("filter", filterObject);
                self._flotData = [];

                for(i=0; i < self.options.scenarios.length; i++) {
                    
                    //console.log(results.results.fields);
                    data = self.generateFlotData(
                                    [self._results[i]],
                                    [self.options.fieldName],
                                    'Time',
                                    {'EcoregionName': 'inactiv', 'Ecoregion': 'inactiv'},
                                    filterObject,
                                    'NumSites', 1);
                    self._flotData.push({label: landisMetadata.getScenarioAttributeById(self.options.scenarios[i],'name'), data: data});
                    
                }
                self._flot.setData(self._flotData);

                //Since the axes don't change, we don't need to call plot.setupGrid()
                self._flot.draw();
            });

                
        },


    // ---------------------------
    // Basic UserInterface Event Methods
    // ---------------------------

        loadData: function(){
            var self = this,
                //loadCsvByScenarios = {},
                csvFile, option;
            $.ajaxSetup({'async': false});
            for(s in self.options.scenarios) {
                
                csvFile = landisSettings.settings.landisdata.path + "/"
                    + landisSettings.settings.landisdata.modeldata + "/"
                    + self.options.scenarios[s] + "/" + self.options.extensionId + "/" + self.options.outputId + "/" + self.options.outputId + ".csv";
                $.get(csvFile).always(function(data2) {
                    //console.log( "finished" );
                    var results = $.parse(data2, {
                            delimiter: ",",
                            header: true,
                            dynamicTyping: true,
                            trimWhite: true
                        }),
                        cf, data;

                    //console.log(results.results.fields);
                    
                    cf = 1.0;
                    //FIXME Conversion
                    /*
                    if(self.options.fieldName == 'TotalDamagedSites'){
                        //4ha for a site, ha to acres
                        //FIXME get ha from file
                        cf =  4 * 2.47105381;
                        self._chartVisHeaderText.text(self.options.extensionName + ': ' + self.options.fieldName + ' [acres]');

                    };*/
                    data = self.generateFlotData([results], [self.options.fieldName], 'Time', {'EcoregionName': 'inactiv', 'Ecoregion': 'inactiv'}, {}, 'NumSites', cf);
                    self._flotData.push({label: landisMetadata.getScenarioAttributeById(self.options.scenarios[s],'name'), data: data});
                    self.drawChart();
                    self._results.push(results);
                });
                

            }



            //console.log('selfresults', self._results);
            option = '<option value="false">none</option>';
            for (i=0; i<self._results[0].results.fields.length; i++){
                if(self._results[0].results.fields[i] != ''){
                    option += '<option value="'+ self._results[0].results.fields[i] + '">' + self._results[0].results.fields[i] + '</option>';
                }
            }
            self._filterFieldList.append(option);
    
         
        },

        generateFlotData: function(csvObjectsByScenarios, parameterList , groupByParameter, excludeParameterValue, filterParameterValue, numSitesFieldName, conversionFactor){
            //console.log('FlotDataGen');
            var charts = [], p, chart, s, dataseries, dataseriesArr, filtering, r, exclude, include, pVal, numSitesVal, totalNumSites;
            // loop paramter List
            for(p = 0; p < parameterList.length; p++){
                //console.log(parameterList[p]);
                //console.log(csvObjectsByScenarios.length);
                chart = [];
                // loop scenarios
                for(s = 0; s < csvObjectsByScenarios.length; s++){
                    //console.log('csvObj',csvObjectsByScenarios[s]);
                    dataseries = {};
                    dataseriesArr = [];
                    filtering = false;
                    //loop over rows in csv
                    totalNumSites = 0;
                    for(r=0; r < csvObjectsByScenarios[s].results.rows.length; r++){
                        exclude = false;
                        for(field in excludeParameterValue) {
                            //exclude specified values of speciefied attributes (e.g. if at year X Ecoregion Name = incactive)
                            if(csvObjectsByScenarios[s].results.rows[r][field] == excludeParameterValue[field]){
                                exclude = true;
                            }
                        }
                        include = true;
                        if(!jQuery.isEmptyObject(filterParameterValue)){
                            for(field in filterParameterValue) {
                                if(csvObjectsByScenarios[s].results.rows[r][field] == filterParameterValue[field]){
                                    include = true;
                                } else {
                                    include = false;
                                }
                            }
                        } else {
                            include = true;
                        }
                         

                        if(!exclude && include) {
                            //console.log(csvObjectsByScenarios[s].results.rows[r][parameterList[p]]);
                            pVal = csvObjectsByScenarios[s].results.rows[r][parameterList[p]];
                            numSitesVal = 1.0;
                            //if no filter and numSiteField is in csv
                            if(jQuery.isEmptyObject(filterParameterValue) && jQuery.inArray(numSitesFieldName, csvObjectsByScenarios[s].results.fields) > -1){
                                numSitesVal = csvObjectsByScenarios[s].results.rows[r][numSitesFieldName];
                                totalNumSites += numSitesVal;
                                filtering = true;
                            }
                            if (csvObjectsByScenarios[s].results.rows[r][groupByParameter] in dataseries) {
                                // ADD UP
                                dataseries[csvObjectsByScenarios[s].results.rows[r][groupByParameter]] += pVal * conversionFactor * numSitesVal;
                            } else {
                                // Create and ADD
                                //console.log(csvObjectsByScenarios[s].results.rows[r][groupByParameter]);
                                dataseries[csvObjectsByScenarios[s].results.rows[r][groupByParameter]] = pVal * conversionFactor * numSitesVal;
                            }
                        }
                        
                    }
                    totalNumSites /= Object.keys(dataseries).length;

                    for(timestep in dataseries) {
                        if (filtering){
                            dataseries[timestep] /= totalNumSites;
                        }
                        dataseriesArr.push([parseFloat(timestep), dataseries[timestep]]);
                    }
                    
                    chart.push(dataseriesArr);
                }
                charts.push(chart);
            }
            //console.log("chart", dataseriesArr);
            return dataseriesArr;
        },
        drawChart: function(){
             var self = this;
             //console.log(self._flotData);   
             self._flot = $.plot($('#chart-'+self.options.chartId), self._flotData, self._flotOptions);
             self._flot.setCrosshairTime({ x: $('#TimeControl').timeControl('option','currentTime'), y: -1 });
        },

        updateTime: function(){
            var self = this;
            self._flot.setCrosshairTime({ x: $('#TimeControl').timeControl('option','currentTime'), y: -1 });
        },

        updateChartData: function(newScenarios) {
            var self = this,
                dataSeriesToDelete = [],
                seen, draw = false;

            //console.log(self.options.scenarios, newScenarios);
            //update the data line of chart
            //if scenario is new ... add to data
            //if scenario is not in newScenario but still in chart remove it
                        
            //remove
            for(os in self.options.scenarios) {
                seen = -1;
                for (ns in newScenarios) {
                    if(newScenarios[ns] == self.options.scenarios[os]){
                        seen = os;
                        break;
                    }
                }

                if(seen === -1){
                    //remove scenario from graph
                    dataSeriesToDelete.push(os);
                    draw = true;
                }
            }

            dataSeriesToDelete.sort();
            dataSeriesToDelete.reverse();
            //console.log(dataSeriesToDelete);

            for(dataSeries in dataSeriesToDelete){
                self.options.scenarios.splice(dataSeriesToDelete[dataSeries],1);
                //self._flotData.splice(dataSeriesToDelete[dataSeries],1);
                    
            }
            

            //add
            for(ns in newScenarios) {
                seen = -1;
                for(os in self.options.scenarios){
                    if(newScenarios[ns] == self.options.scenarios[os]){
                        seen = ns;
                        break;
                    }
                }

                if(seen === -1) {
                    //add scenario to graph
                    self.options.scenarios.push(newScenarios[ns]);
                    draw = true;
                }
            }
            if(draw) {
                self._results = [];
                self._flotData = [];
                self.loadData();
            }
            
        }


    });

})( jQuery, window, document );